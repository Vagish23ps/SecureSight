/**
 * Real Pattern-Based Source Code SAST Scanner
 * Analyzes source code for real security vulnerabilities, detects exact line numbers and evidence,
 * and feeds results through the Risk Engine and Security Gate.
 */

import type { 
  Finding, 
  FindingSeverity, 
  IScanner, 
  ScanResult, 
  ScanTarget 
} from '@/types/security';
import { evaluateRisk } from './risk-engine';
import { SecurityGateService } from './security-gate';

interface PatternRule {
  name: string;
  category: string;
  severity: FindingSeverity;
  cweCveId: string;
  description: string;
  impact: string;
  remediation: string;
  patterns: RegExp[];
}

const SECURITY_RULES: PatternRule[] = [
  {
    name: 'SQL Injection',
    category: 'Injection',
    severity: 'Critical',
    cweCveId: 'CWE-89',
    description: 'User input is not properly sanitized before being used in SQL queries',
    impact: 'Attackers could execute arbitrary SQL commands, potentially accessing, modifying, or destroying sensitive data',
    remediation: 'Use parameterized queries or prepared statements. Replace raw string interpolation with bind parameters.',
    patterns: [
      /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\$\{/i,
      /query\s*\(\s*[`"'].*\$\{/i,
      /sql\s*\(\s*[`"'].*\$\{/i,
      /db\.query\s*\(\s*[`"'].*\+/i,
      /execute\s*\(\s*[`"'].*\+/i,
    ],
  },
  {
    name: 'Cross-Site Scripting (XSS)',
    category: 'Cross-Site Scripting',
    severity: 'High',
    cweCveId: 'CWE-79',
    description: 'Unsanitized user input is rendered directly into the DOM or executed',
    impact: 'Attackers could inject malicious scripts that execute in users browsers, stealing session cookies or tokens',
    remediation: 'Use textContent instead of innerHTML, or sanitize HTML with a library such as DOMPurify.',
    patterns: [
      /innerHTML\s*=\s*[^;]*userInput/i,
      /innerHTML\s*=\s*[^;]*req\.(body|query|params)/i,
      /dangerouslySetInnerHTML/i,
      /eval\s*\(/i,
    ],
  },
  {
    name: 'Hardcoded Secret / API Key',
    category: 'Secret Exposure',
    severity: 'Critical',
    cweCveId: 'CWE-798',
    description: 'Sensitive credentials or API tokens are hardcoded in source code',
    impact: 'Exposed credentials could allow unauthorized access to production services and databases',
    remediation: 'Move credentials to environment variables or an external secrets manager (e.g. AWS Secrets Manager, Vault).',
    patterns: [
      /(?:api[_-]?key|password|secret|token)\s*[=:]\s*[`"'][A-Za-z0-9_\-]{8,}[`"']/i,
      /sk_live_[a-zA-Z0-9]{20,}/i,
      /pk_live_[a-zA-Z0-9]{20,}/i,
      /AKIA[0-9A-Z]{16}/i,
    ],
  },
  {
    name: 'Weak Cryptography',
    category: 'Cryptography',
    severity: 'High',
    cweCveId: 'CWE-327',
    description: 'Broken or deprecated cryptographic hash algorithms are being used',
    impact: 'Hashes can be quickly collided or cracked using modern GPU computing, compromising data integrity',
    remediation: 'Use strong cryptographic algorithms like SHA-256, SHA-512, or bcrypt/Argon2 for passwords.',
    patterns: [
      /crypto\.createHash\s*\(\s*[`"']md5[`"']/i,
      /crypto\.createHash\s*\(\s*[`"']sha1[`"']/i,
      /\bmd5\s*\(/i,
      /\bsha1\s*\(/i,
    ],
  },
  {
    name: 'Insecure Deserialization',
    category: 'Insecure Deserialization',
    severity: 'High',
    cweCveId: 'CWE-502',
    description: 'Untrusted input is deserialized without validation or type constraints',
    impact: 'Attackers could achieve remote code execution by crafting malicious serialized payloads',
    remediation: 'Validate input against an explicit schema before deserialization or use safe parsing methods.',
    patterns: [
      /JSON\.parse\s*\(\s*untrusted/i,
      /pickle\.loads/i,
      /unserialize\s*\(/i,
      /ObjectInputStream/i,
    ],
  },
  {
    name: 'Missing Security Headers',
    category: 'Security Misconfiguration',
    severity: 'Low',
    cweCveId: 'CWE-693',
    description: 'HTTP response headers do not include browser security protections',
    impact: 'Increased vulnerability to clickjacking, MIME type sniffing, and XSS attacks',
    remediation: 'Configure standard security headers: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options.',
    patterns: [
      /app\.use\s*\(\s*function\s*\([^)]*\)\s*\{[^}]*res\.send/i,
      /res\.send\s*\(/i,
    ],
  },
  {
    name: 'Open Redirect',
    category: 'Open Redirect',
    severity: 'Medium',
    cweCveId: 'CWE-601',
    description: 'User input controls redirect destination without domain validation',
    impact: 'Users can be redirected to phishing destinations while believing they are on the trusted application',
    remediation: 'Validate destination URLs against an explicit whitelist of allowed domains or paths.',
    patterns: [
      /res\.redirect\s*\(\s*req\.(query|params|body)/i,
      /window\.location\s*=\s*userInput/i,
      /location\.href\s*=\s*[^;]*\$\{/i,
    ],
  },
  {
    name: 'Missing CSRF Protection',
    category: 'CSRF',
    severity: 'Medium',
    cweCveId: 'CWE-352',
    description: 'State-changing HTTP request handler lacks CSRF token verification',
    impact: 'Attackers could submit unauthorized requests on behalf of authenticated users',
    remediation: 'Add CSRF token validation or enforce strict SameSite cookies on all mutation requests.',
    patterns: [
      /app\.post\s*\([^,]*,\s*function\s*\([^)]*\)\s*\{(?!.*csrf)/i,
      /form\s+method\s*=\s*[`"']post[`"'](?!.*csrf)/i,
    ],
  },
];

/**
 * Built-in SAST Source Code Scanner
 */
export class SourceCodeScanner implements IScanner {
  readonly id = 'secureflow-sast-local';
  readonly name = 'SecureFlow Local SAST Scanner';
  readonly version = '1.0.0';
  readonly description = 'Pattern-based static analysis scanner for detecting OWASP Top 10 vulnerabilities in source code.';

  scan(target: ScanTarget): Finding[] {
    const findings: Finding[] = [];
    const lines = (target.sourceCode || '').split('\n');
    const targetFile = target.filePath || `src/${target.repositoryName}.ts`;
    const detectionTime = new Date().toISOString();

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;

      for (const rule of SECURITY_RULES) {
        for (const pattern of rule.patterns) {
          if (pattern.test(line)) {
            const evidence = line.trim().slice(0, 140);
            const id = `fnd-${Date.now()}-${lineIndex}-${rule.cweCveId}`;

            findings.push({
              id,
              _id: id,
              title: rule.name,
              severity: rule.severity,
              category: rule.category,
              description: rule.description,
              filePath: targetFile,
              lineNumber,
              evidence: evidence || 'Vulnerability pattern match in source code',
              impact: rule.impact,
              remediation: rule.remediation,
              status: 'Open',
              detectedAt: detectionTime,
              // Compatibility fields
              repositoryName: target.repositoryName,
              scanner: this.name,
              cweCveId: rule.cweCveId,
              remediationStatus: 'Open',
              detectionDate: new Date(),
              aiExplanation: `Identified by ${this.name}: ${rule.description}. Remediate by: ${rule.remediation}`,
            });

            // Stop matching other regexes for the same rule on this line
            break;
          }
        }
      }
    }

    return findings;
  }
}

/**
 * Executes the full security pipeline:
 * Source Code -> Scanner -> Findings -> Risk Engine -> Security Gate
 */
export function runSecurityPipeline(target: ScanTarget): ScanResult {
  const startTime = performance.now();
  const scanner = new SourceCodeScanner();
  
  // 1. Scanner produces actual findings
  const findings = scanner.scan(target);
  
  // 2. Risk Engine evaluates deterministic risk score and level
  const riskAnalysis = evaluateRisk(findings);
  
  // 3. Security Gate checks pass/fail policies
  const gateResult = SecurityGateService.evaluate(findings);
  
  // 4. Measure actual elapsed duration in seconds (no Math.random())
  const durationSeconds = Math.max(0.01, Number(((performance.now() - startTime) / 1000).toFixed(2)));

  const scanId = `scn-${Date.now()}`;

  return {
    id: scanId,
    repositoryName: target.repositoryName,
    scanType: 'Static Application Security Testing (SAST)',
    executedAt: new Date().toISOString(),
    durationSeconds,
    status: 'Completed',
    findings,
    totalFindings: findings.length,
    severityCounts: riskAnalysis.counts,
    riskScore: riskAnalysis.riskScore,
    riskLevel: riskAnalysis.riskLevel,
    gatePassed: gateResult.passed,
    gateStatus: gateResult.status,
    gateMessage: gateResult.message,
  };
}

/**
 * Backward compatibility helpers for existing UI components
 */
export function scanSourceCode(sourceCode: string, repositoryName: string) {
  const result = runSecurityPipeline({
    repositoryName,
    sourceCode,
  });

  return {
    findings: result.findings,
    riskLevel: result.riskLevel,
    riskScore: result.riskScore,
    totalFindings: result.totalFindings,
    criticalCount: result.severityCounts.critical,
    highCount: result.severityCounts.high,
    mediumCount: result.severityCounts.medium,
    lowCount: result.severityCounts.low,
    durationSeconds: result.durationSeconds,
    gatePassed: result.gatePassed,
    gateStatus: result.gateStatus,
    gateMessage: result.gateMessage,
  };
}

export function calculateSecurityStatus(riskLevel: string): string {
  switch (riskLevel) {
    case 'Critical':
      return 'FAIL - Critical vulnerabilities detected';
    case 'High':
      return 'FAIL - High severity vulnerabilities detected';
    case 'Medium':
      return 'WARN - Medium severity vulnerabilities detected';
    case 'Low':
      return 'PASS - Low risk / Minor observations';
    default:
      return 'PASS - No vulnerabilities detected';
  }
}
