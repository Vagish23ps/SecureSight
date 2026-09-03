import assert from 'node:assert/strict';

console.log('====================================================');
console.log('SecureFlow Scanner Verification Suite');
console.log('====================================================');

// 1. GITHUB URL PARSER TEST
console.log('\n[1/7] Testing GitHubUrlParser...');
class GitHubUrlParser {
  static parse(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') {
      throw new Error('Please provide a valid GitHub repository URL.');
    }
    const trimmed = rawUrl.trim();
    const githubRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/;
    const match = trimmed.match(githubRegex);
    if (!match || !match[1] || !match[2]) {
      throw new Error('Invalid GitHub repository URL. Expected format: https://github.com/owner/repository');
    }
    const owner = match[1];
    let repo = match[2].replace(/\/.*$/, '').replace(/\.git$/, '');
    return {
      owner,
      repo,
      fullName: `${owner}/${repo}`,
      canonicalUrl: `https://github.com/${owner}/${repo}`,
    };
  }
}

// Valid URLs
const p1 = GitHubUrlParser.parse('https://github.com/octocat/Hello-World');
assert.equal(p1.owner, 'octocat');
assert.equal(p1.repo, 'Hello-World');
assert.equal(p1.fullName, 'octocat/Hello-World');
assert.equal(p1.canonicalUrl, 'https://github.com/octocat/Hello-World');

const p2 = GitHubUrlParser.parse('github.com/expressjs/express.git');
assert.equal(p2.owner, 'expressjs');
assert.equal(p2.repo, 'express');

const p3 = GitHubUrlParser.parse('https://github.com/owner-name/repo.js/');
assert.equal(p3.owner, 'owner-name');
assert.equal(p3.repo, 'repo.js');

// Invalid URLs
assert.throws(() => GitHubUrlParser.parse('https://gitlab.com/octocat/Hello-World'), /Invalid GitHub repository URL/);
assert.throws(() => GitHubUrlParser.parse('https://github.com/'), /Invalid GitHub repository URL/);
assert.throws(() => GitHubUrlParser.parse(''), /Please provide a valid GitHub repository URL/);
console.log('✓ GitHubUrlParser successfully parses and validates URLs');

// 2. FILE FILTER TEST
console.log('\n[2/7] Testing FileFilter...');
const DEFAULT_ALLOWED = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.rs',
  '.c', '.cpp', '.cs', '.swift', '.vue', '.svelte', '.html', '.css', '.json',
  '.yaml', '.yml', '.env', '.env.example', '.sql', '.sh', '.bash'
]);
const IGNORED_DIRS = ['.git', 'node_modules', 'dist', 'build', 'coverage', 'vendor'];
const IGNORED_EXTS = new Set(['.png', '.jpg', '.pdf', '.zip', '.exe', '.dll', '.bin', '.mp4']);

function shouldScan(filePath, sizeBytes) {
  const norm = filePath.replace(/\\/g, '/').toLowerCase();
  const segments = norm.split('/');
  for (const dir of IGNORED_DIRS) {
    if (segments.includes(dir)) return false;
  }
  if (sizeBytes && sizeBytes > 1024 * 1024) return false;
  const fileName = segments[segments.length - 1];
  if (fileName === '.env' || fileName === '.env.example') return true;
  const dot = fileName.lastIndexOf('.');
  if (dot === -1) return false;
  const ext = fileName.slice(dot);
  if (IGNORED_EXTS.has(ext)) return false;
  return DEFAULT_ALLOWED.has(ext);
}

assert.equal(shouldScan('src/auth.ts', 2048), true);
assert.equal(shouldScan('server/db.py', 1024), true);
assert.equal(shouldScan('.env.example', 256), true);
assert.equal(shouldScan('node_modules/express/index.js', 2048), false, 'node_modules must be excluded');
assert.equal(shouldScan('.git/config', 256), false, '.git must be excluded');
assert.equal(shouldScan('assets/logo.png', 10240), false, 'png must be excluded');
assert.equal(shouldScan('dist/bundle.js', 2048), false, 'dist must be excluded');
assert.equal(shouldScan('large-data.json', 2 * 1024 * 1024), false, 'Files > 1MB must be skipped');
console.log('✓ FileFilter correctly applies inclusion whitelist and exclusion blacklist');

// 3. SOURCE CODE SCANNER TEST WITH FIXTURE
console.log('\n[3/7] Testing SourceCodeScanner rule detection...');

const PATTERNS = [
  {
    category: 'Injection',
    title: 'SQL Injection Vulnerability',
    severity: 'Critical',
    cweCveId: 'CWE-89',
    regex: /(?:SELECT\s+.+\s+FROM\s+.+\s+WHERE\s+.+[\'\"]\s*\+\s*\w+|query\s*\(\s*[\'\"].*\$\{.*\}[\'\"]\s*\))/i,
    description: 'Direct concatenation or template interpolation of user input into SQL queries enables SQL Injection.',
    remediation: 'Use parameterized queries or prepared statements.'
  },
  {
    category: 'Secret Exposure',
    title: 'Hardcoded API Key / Secret Token',
    severity: 'Critical',
    cweCveId: 'CWE-798',
    regex: /(?:(?:api_?key|secret|token|password|auth_token)\s*[:=]\s*['\"][A-Za-z0-9_\-]{20,}['\"])/i,
    description: 'Sensitive credentials hardcoded in source code risk exposure and unauthorized access.',
    remediation: 'Store credentials in server environment variables or a secrets manager.'
  },
  {
    category: 'Cross-Site Scripting',
    title: 'Cross-Site Scripting (XSS)',
    severity: 'High',
    cweCveId: 'CWE-79',
    regex: /(?:dangerouslySetInnerHTML\s*=|innerHTML\s*=|document\.write\s*\(|v-html\s*=)/i,
    description: 'Directly injecting unescaped markup can permit Cross-Site Scripting.',
    remediation: 'Sanitize HTML inputs or use safe text interpolation.'
  },
  {
    category: 'Cryptography',
    title: 'Weak Cryptographic Algorithm (MD5 / SHA1)',
    severity: 'Medium',
    cweCveId: 'CWE-327',
    regex: /(?:createHash\s*\(\s*['\"](?:md5|sha1)['\"]\)|crypto\.(?:md5|sha1)\()/i,
    description: 'MD5 and SHA-1 have proven cryptographic collision vulnerabilities.',
    remediation: 'Use collision-resistant hashing algorithms such as SHA-256, SHA-512, or bcrypt/argon2.'
  }
];

function scanCode(filePath, code) {
  const lines = code.split('\n');
  const findings = [];
  lines.forEach((lineContent, idx) => {
    const trimmed = lineContent.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;
    for (const rule of PATTERNS) {
      if (rule.regex.test(lineContent)) {
        findings.push({
          id: `fnd-${idx}-${rule.cweCveId}`,
          title: rule.title,
          severity: rule.severity,
          category: rule.category,
          cweCveId: rule.cweCveId,
          filePath,
          lineNumber: idx + 1,
          evidence: lineContent.trim(),
          remediation: rule.remediation,
        });
      }
    }
  });
  return findings;
}

// 4. MULTI-FILE FIXTURE TESTING
console.log('\n[4/7] Testing multi-file repository scanning and aggregation...');

const multiFileFixture = {
  'src/auth.ts': `
// User authentication module
import db from './db';

export function authenticate(username: string, pass: string) {
  const hardcoded_token = "sk_live_1234567890abcdef1234567890";
  return db.query("SELECT * FROM users WHERE username = '" + username);
}
`,
  'src/views/profile.tsx': `
import React from 'react';

export function ProfileView({ bio }: { bio: string }) {
  return <div dangerouslySetInnerHTML={{ __html: bio }} />;
}
`,
  'server/crypto.ts': `
import crypto from 'crypto';

export function hashChecksum(data: string) {
  return crypto.createHash("md5").update(data).digest("hex");
}
`,
  'src/clean-service.ts': `
export function add(a: number, b: number): number {
  return a + b;
}
`
};

let aggregatedFindings = [];
for (const [path, content] of Object.entries(multiFileFixture)) {
  const fileFindings = scanCode(path, content);
  aggregatedFindings.push(...fileFindings);
}

assert.equal(aggregatedFindings.length, 4, 'Should find 4 vulnerabilities across files');

// Validate auth.ts findings
const authFindings = aggregatedFindings.filter(f => f.filePath === 'src/auth.ts');
assert.equal(authFindings.length, 2, 'auth.ts must have 2 findings (Secret + SQLi)');
const secretFinding = authFindings.find(f => f.cweCveId === 'CWE-798');
assert.ok(secretFinding, 'Hardcoded secret detected');
assert.equal(secretFinding.lineNumber, 6, 'Secret must be on line 6');
assert.ok(secretFinding.evidence.includes('sk_live_1234567890'), 'Evidence must contain actual code');

const sqliFinding = authFindings.find(f => f.cweCveId === 'CWE-89');
assert.ok(sqliFinding, 'SQL Injection detected');
assert.equal(sqliFinding.lineNumber, 7, 'SQLi must be on line 7');

// Validate profile.tsx finding
const xssFinding = aggregatedFindings.find(f => f.filePath === 'src/views/profile.tsx');
assert.ok(xssFinding, 'XSS detected in profile.tsx');
assert.equal(xssFinding.cweCveId, 'CWE-79');
assert.equal(xssFinding.lineNumber, 5);

// Validate crypto.ts finding
const cryptoFinding = aggregatedFindings.find(f => f.filePath === 'server/crypto.ts');
assert.ok(cryptoFinding, 'Weak crypto detected in server/crypto.ts');
assert.equal(cryptoFinding.cweCveId, 'CWE-327');
assert.equal(cryptoFinding.lineNumber, 5);

// Validate clean-service.ts produces zero findings
const cleanFindings = scanCode('src/clean-service.ts', multiFileFixture['src/clean-service.ts']);
assert.equal(cleanFindings.length, 0, 'Clean source must produce zero findings');
console.log('✓ Multi-file scan aggregates findings with precise file paths and line numbers');

// 5. DETERMINISTIC RISK ENGINE TEST
console.log('\n[5/7] Testing deterministic Risk Engine...');

function countSeverities(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, total: findings.length };
  for (const f of findings) {
    if (f.severity === 'Critical') counts.critical++;
    else if (f.severity === 'High') counts.high++;
    else if (f.severity === 'Medium') counts.medium++;
    else if (f.severity === 'Low') counts.low++;
  }
  return counts;
}

function calculateRiskScore(counts) {
  const raw = counts.critical * 25 + counts.high * 10 + counts.medium * 3 + counts.low * 1;
  return Math.min(100, raw);
}

function classifyRiskLevel(counts, score) {
  if (counts.critical > 0 || score >= 75) return 'Critical';
  if (counts.high > 0 || score >= 40) return 'High';
  if (counts.medium > 0 || score >= 15) return 'Medium';
  return 'Low';
}

const counts = countSeverities(aggregatedFindings);
assert.equal(counts.critical, 2, '2 Critical (SQLi + Secret)');
assert.equal(counts.high, 1, '1 High (XSS)');
assert.equal(counts.medium, 1, '1 Medium (MD5)');
assert.equal(counts.low, 0);

// Score: 2*25 + 1*10 + 1*3 = 63
const score = calculateRiskScore(counts);
assert.equal(score, 63, 'Risk score must equal 63');
const level = classifyRiskLevel(counts, score);
assert.equal(level, 'Critical', 'Critical findings force Critical risk level');

// Determinism test: same findings must produce identical score repeatedly
for (let i = 0; i < 100; i++) {
  assert.equal(calculateRiskScore(counts), 63);
}

const zeroCounts = countSeverities([]);
assert.equal(calculateRiskScore(zeroCounts), 0);
assert.equal(classifyRiskLevel(zeroCounts, 0), 'Low');
console.log('✓ Deterministic Risk Engine produces exact, repeatable scores');

// 6. SECURITY GATE TEST
console.log('\n[6/7] Testing Security Gate Policies...');

function evaluateGate(findings, policy = { failOnCritical: true, failOnHigh: true, maxRiskScore: 50 }) {
  const c = countSeverities(findings);
  const sc = calculateRiskScore(c);
  const reasons = [];

  if (policy.failOnCritical && c.critical > 0) {
    reasons.push(`${c.critical} Critical severity vulnerability(ies) detected.`);
  }
  if (policy.failOnHigh && c.high > 0) {
    reasons.push(`${c.high} High severity vulnerability(ies) detected.`);
  }
  if (sc > policy.maxRiskScore) {
    reasons.push(`Risk score (${sc}) exceeds allowed threshold (${policy.maxRiskScore}).`);
  }

  if (reasons.length > 0) {
    return { passed: false, status: 'FAIL', reasons };
  }
  if (c.medium > 5) {
    return { passed: true, status: 'WARN', reasons: ['Medium severity threshold exceeded.'] };
  }
  return { passed: true, status: 'PASS', reasons: [] };
}

const failedGate = evaluateGate(aggregatedFindings);
assert.equal(failedGate.passed, false, 'Security gate must fail when Critical findings exist');
assert.equal(failedGate.status, 'FAIL');
assert.ok(failedGate.reasons.length >= 2);

const passedGate = evaluateGate([]);
assert.equal(passedGate.passed, true, 'Clean repository must pass the Security Gate');
assert.equal(passedGate.status, 'PASS');
console.log('✓ Security Gate evaluates policy thresholds correctly');

// 7. CLEAN REPOSITORY TEST
console.log('\n[7/7] Testing Clean Repository Scenario...');
const cleanScanFindings = scanCode('main.py', 'def greet(name):\n    print(f"Hello, {name}!")\n');
assert.equal(cleanScanFindings.length, 0);
const cleanGateResult = evaluateGate(cleanScanFindings);
assert.equal(cleanGateResult.passed, true);
assert.equal(cleanGateResult.status, 'PASS');
console.log('✓ Clean source code verified with 0 findings and GATE PASS');

console.log('\n====================================================');
console.log('ALL 7 TEST SUITES PASSED SUCCESSFULLY!');
console.log('====================================================\n');