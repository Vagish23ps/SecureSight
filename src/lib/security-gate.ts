import type { Finding, SecurityGatePolicy, SecurityGateResult, SecurityGateStatus } from '@/types/security';
import { countSeverities, calculateRiskScore } from './risk-engine';

export const DEFAULT_SECURITY_GATE_POLICY: SecurityGatePolicy = {
  failOnCritical: true,
  failOnHigh: true,
  maxAllowedCritical: 0,
  maxAllowedHigh: 0,
  maxAllowedMedium: 5,
  maxRiskScore: 50,
};

export class SecurityGateService {
  /**
   * Evaluates security findings against the configurable policy.
   * Returns deterministic pass/warn/fail status with clear explanations.
   */
  static evaluate(
    findings: Finding[], 
    customPolicy?: Partial<SecurityGatePolicy>
  ): SecurityGateResult {
    const policy: SecurityGatePolicy = {
      ...DEFAULT_SECURITY_GATE_POLICY,
      ...customPolicy,
    };

    const counts = countSeverities(findings);
    const riskScore = calculateRiskScore(counts);
    const reasons: string[] = [];

    // Critical Findings Check
    if (policy.failOnCritical && counts.critical > policy.maxAllowedCritical) {
      reasons.push(
        `Critical findings threshold exceeded: found ${counts.critical} (maximum allowed: ${policy.maxAllowedCritical})`
      );
    }

    // High Findings Check
    if (policy.failOnHigh && counts.high > policy.maxAllowedHigh) {
      reasons.push(
        `High severity findings threshold exceeded: found ${counts.high} (maximum allowed: ${policy.maxAllowedHigh})`
      );
    }

    // Risk Score Check
    if (riskScore > policy.maxRiskScore) {
      reasons.push(
        `Maximum risk score exceeded: current score is ${riskScore} (threshold: ${policy.maxRiskScore})`
      );
    }

    // Medium Findings Check (Warn vs Fail)
    const mediumExceeded = counts.medium > policy.maxAllowedMedium;
    if (mediumExceeded) {
      reasons.push(
        `Medium severity findings elevated: found ${counts.medium} (recommended limit: ${policy.maxAllowedMedium})`
      );
    }

    let status: SecurityGateStatus = 'PASS';
    let message = 'PASS: Security gate criteria met. No blocking vulnerabilities found.';

    if (reasons.length > 0) {
      // If critical or high or score exceeded, it's a FAIL
      const hasCriticalOrHighViolation = 
        (policy.failOnCritical && counts.critical > policy.maxAllowedCritical) ||
        (policy.failOnHigh && counts.high > policy.maxAllowedHigh) ||
        (riskScore > policy.maxRiskScore);

      if (hasCriticalOrHighViolation) {
        status = 'FAIL';
        message = `FAIL: Security gate blocked deployment due to ${reasons.length} policy violation(s).`;
      } else {
        status = 'WARN';
        message = `WARN: Security gate passed with warnings. Remediation recommended.`;
      }
    }

    return {
      passed: status === 'PASS',
      status,
      message,
      reasons,
      evaluatedAt: new Date().toISOString(),
      policy,
    };
  }
}
