import type { Finding, RiskLevel, SeverityCounts } from '@/types/security';

export interface RiskAnalysisResult {
  counts: SeverityCounts;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
}

/**
 * Counts findings by severity
 */
export function countSeverities(findings: Finding[]): SeverityCounts {
  const counts: SeverityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: findings.length,
  };

  for (const finding of findings) {
    const sev = (finding.severity || '').toLowerCase();
    if (sev === 'critical') counts.critical++;
    else if (sev === 'high') counts.high++;
    else if (sev === 'medium') counts.medium++;
    else if (sev === 'low') counts.low++;
  }

  return counts;
}

/**
 * Calculates a deterministic risk score from 0 to 100 based on finding severities.
 * Uses standard industry-weighted severity scoring:
 * - Critical: 25 points each
 * - High: 10 points each
 * - Medium: 3 points each
 * - Low: 1 point each
 */
export function calculateRiskScore(countsOrFindings: Finding[] | SeverityCounts): number {
  const counts = Array.isArray(countsOrFindings) 
    ? countSeverities(countsOrFindings) 
    : countsOrFindings;

  if (counts.total === 0) {
    return 0;
  }

  const rawScore = 
    (counts.critical * 25) +
    (counts.high * 10) +
    (counts.medium * 3) +
    (counts.low * 1);

  return Math.min(100, Math.max(0, rawScore));
}

/**
 * Classifies risk level deterministically based on counts and score.
 */
export function classifyRiskLevel(counts: SeverityCounts, score: number): RiskLevel {
  if (counts.critical > 0 || score >= 75) {
    return 'Critical';
  }
  if (counts.high > 0 || score >= 40) {
    return 'High';
  }
  if (counts.medium > 0 || score >= 15) {
    return 'Medium';
  }
  return 'Low';
}

/**
 * Complete deterministic risk evaluation engine
 */
export function evaluateRisk(findings: Finding[]): RiskAnalysisResult {
  const counts = countSeverities(findings);
  const riskScore = calculateRiskScore(counts);
  const riskLevel = classifyRiskLevel(counts, riskScore);

  let summary = 'No security findings detected. Repository is clean.';
  if (counts.total > 0) {
    summary = `${counts.total} finding(s) detected (${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low) with risk score ${riskScore}/100.`;
  }

  return {
    counts,
    riskScore,
    riskLevel,
    summary,
  };
}
