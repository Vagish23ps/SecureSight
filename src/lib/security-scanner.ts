/**
 * Security Scanner - Analyzes source code for common vulnerabilities
 */

export interface ScanResult {
  findings: SecurityFinding[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface SecurityFinding {
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cweCveId: string;
  filePath: string;
  lineNumber: number;
  evidence: string;
  impact: string;
  remediation: string;
  scanner: string;
}

// Pattern-based security scanning
const SECURITY_PATTERNS = [
  {
    name: 'SQL Injection',
    patterns: [
      /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\$\{/gi,
      /query\s*\(\s*[`"'].*\$\{/gi,
      /sql\s*\(\s*[`"'].*\$\{/gi,
      /db\.query\s*\(\s*[`"'].*\+/gi,
    ],
    severity: 'Critical',
    cweCveId: 'CWE-89',
    description: 'User input is not properly sanitized before being used in SQL queries',
    impact: 'Attackers could execute arbitrary SQL commands, potentially accessing or modifying sensitive data',
    remediation: 'Use parameterized queries or prepared statements. Replace string concatenation with query parameters.',
  },
  {
    name: 'Cross-Site Scripting (XSS)',
    patterns: [
      /innerHTML\s*=\s*[^;]*userInput/gi,
      /innerHTML\s*=\s*[^;]*req\.(body|query|params)/gi,
      /dangerouslySetInnerHTML/gi,
      /eval\s*\(/gi,
    ],
    severity: 'High',
    cweCveId: 'CWE-79',
    description: 'Unsanitized user input is rendered directly in the DOM',
    impact: 'Attackers could inject malicious scripts that execute in users\' browsers, stealing cookies or session tokens',
    remediation: 'Use textContent instead of innerHTML, or sanitize HTML with a library like DOMPurify',
  },
  {
    name: 'Hardcoded Secrets',
    patterns: [
      /(?:api[_-]?key|password|secret|token)\s*[=:]\s*[`"'][^`"']*[`"']/gi,
      /sk_live_[a-zA-Z0-9]{20,}/gi,
      /pk_live_[a-zA-Z0-9]{20,}/gi,
      /AKIA[0-9A-Z]{16}/gi,
    ],
    severity: 'Critical',
    cweCveId: 'CWE-798',
    description: 'Sensitive credentials are hardcoded in source code',
    impact: 'Exposed credentials could allow unauthorized access to systems and services',
    remediation: 'Move credentials to environment variables or a secure secrets management system',
  },
  {
    name: 'Weak Cryptography',
    patterns: [
      /crypto\.createHash\s*\(\s*[`"']md5[`"']/gi,
      /crypto\.createHash\s*\(\s*[`"']sha1[`"']/gi,
      /md5\s*\(/gi,
      /sha1\s*\(/gi,
    ],
    severity: 'High',
    cweCveId: 'CWE-327',
    description: 'Weak cryptographic algorithms are being used',
    impact: 'Encrypted data could be decrypted by attackers using modern computing power',
    remediation: 'Use strong cryptographic algorithms like SHA-256, SHA-512, or bcrypt for passwords',
  },
  {
    name: 'Insecure Deserialization',
    patterns: [
      /JSON\.parse\s*\(\s*untrusted/gi,
      /pickle\.loads/gi,
      /unserialize\s*\(/gi,
      /ObjectInputStream/gi,
    ],
    severity: 'High',
    cweCveId: 'CWE-502',
    description: 'Untrusted data is deserialized without validation',
    impact: 'Attackers could execute arbitrary code by crafting malicious serialized objects',
    remediation: 'Validate data structure before deserialization or use safe parsing methods',
  },
  {
    name: 'Missing Security Headers',
    patterns: [
      /app\.use\s*\(\s*function\s*\([^)]*\)\s*\{[^}]*res\.send/gi,
      /res\.send\s*\(/gi,
    ],
    severity: 'Low',
    cweCveId: 'CWE-693',
    description: 'HTTP security headers are not configured',
    impact: 'Increased vulnerability to clickjacking, MIME type sniffing, and XSS attacks',
    remediation: 'Add security headers: X-Content-Type-Options, X-Frame-Options, Content-Security-Policy',
  },
  {
    name: 'Unvalidated Redirect',
    patterns: [
      /res\.redirect\s*\(\s*req\.(query|params|body)/gi,
      /window\.location\s*=\s*userInput/gi,
      /location\.href\s*=\s*[^;]*\$\{/gi,
    ],
    severity: 'Medium',
    cweCveId: 'CWE-601',
    description: 'User input controls redirect destination without validation',
    impact: 'Users could be redirected to phishing sites or malware distribution pages',
    remediation: 'Validate redirect URLs against a whitelist of allowed domains',
  },
  {
    name: 'Missing CSRF Protection',
    patterns: [
      /app\.post\s*\([^,]*,\s*function\s*\([^)]*\)\s*\{(?!.*csrf)/gi,
      /form\s+method\s*=\s*[`"']post[`"'](?!.*csrf)/gi,
    ],
    severity: 'Medium',
    cweCveId: 'CWE-352',
    description: 'Form submissions lack CSRF token validation',
    impact: 'Attackers could perform unauthorized actions on behalf of authenticated users',
    remediation: 'Add CSRF token generation and validation to all state-changing requests',
  },
];

export function scanSourceCode(sourceCode: string, repositoryName: string): ScanResult {
  const findings: SecurityFinding[] = [];
  const lines = sourceCode.split('\n');

  for (const pattern of SECURITY_PATTERNS) {
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      for (const regex of pattern.patterns) {
        if (regex.test(line)) {
          // Extract evidence from the line
          const evidence = line.trim().substring(0, 100);
          
          findings.push({
            title: pattern.name,
            description: pattern.description,
            severity: pattern.severity,
            cweCveId: pattern.cweCveId,
            filePath: `src/code-${repositoryName}.ts`,
            lineNumber: lineNum + 1,
            evidence: evidence || 'Pattern detected in source code',
            impact: pattern.impact,
            remediation: pattern.remediation,
            scanner: 'SecureFlow Scanner',
          });
          
          // Reset regex lastIndex for global patterns
          regex.lastIndex = 0;
        }
      }
    }
  }

  // Calculate risk level
  const criticalCount = findings.filter(f => f.severity === 'Critical').length;
  const highCount = findings.filter(f => f.severity === 'High').length;
  const mediumCount = findings.filter(f => f.severity === 'Medium').length;
  const lowCount = findings.filter(f => f.severity === 'Low').length;

  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (criticalCount > 0) riskLevel = 'Critical';
  else if (highCount > 0) riskLevel = 'High';
  else if (mediumCount > 0) riskLevel = 'Medium';

  return {
    findings,
    riskLevel,
    totalFindings: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
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
      return 'PASS - Only low severity issues found';
    default:
      return 'PASS - No vulnerabilities detected';
  }
}
