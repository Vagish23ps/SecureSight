/**
 * SecureFlow Core Security Types & Data Models
 */

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type FindingStatus = 'Open' | 'In Progress' | 'Fixed' | 'Ignored';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type SecurityGateStatus = 'PASS' | 'WARN' | 'FAIL';

/**
 * Standard Security Finding Model
 */
export interface Finding {
  id?: string;
  _id: string; // Compatibility alias
  title: string;
  severity: FindingSeverity;
  category?: string;
  description?: string;
  filePath?: string;
  lineNumber?: number;
  evidence?: string;
  impact?: string;
  remediation?: string;
  status?: FindingStatus;
  detectedAt?: string; // ISO 8601 string

  // UI / Ecosystem Compatibility fields
  repositoryName?: string;
  scanner?: string;
  cweCveId?: string;
  remediationStatus?: FindingStatus;
  detectionDate?: Date | string;
  aiExplanation?: string;
}

/**
 * Severity Summary Counts
 */
export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

/**
 * Target provided for security scanning
 */
export interface ScanTarget {
  repositoryId?: string;
  repositoryName: string;
  sourceCode: string;
  filePath?: string;
}

/**
 * Result produced by a Scanner execution
 */
export interface ScanResult {
  id: string;
  repositoryName: string;
  scanType: string;
  executedAt: string;
  durationSeconds: number; // Measured duration, no Math.random()
  status: 'Completed' | 'Failed';
  findings: Finding[];
  totalFindings: number;
  severityCounts: SeverityCounts;
  riskScore: number;
  riskLevel: RiskLevel;
  gatePassed: boolean;
  gateStatus: SecurityGateStatus;
  gateMessage: string;
}

/**
 * Clean Scanner Interface
 * Real scanners (like pattern-based SAST or future integrations) implement this interface.
 */
export interface IScanner {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  scan(target: ScanTarget): Promise<Finding[]> | Finding[];
}

/**
 * Configurable Security Gate Policy
 */
export interface SecurityGatePolicy {
  failOnCritical: boolean;
  failOnHigh: boolean;
  maxAllowedCritical: number;
  maxAllowedHigh: number;
  maxAllowedMedium: number;
  maxRiskScore: number;
}

/**
 * Result of Security Gate evaluation
 */
export interface SecurityGateResult {
  passed: boolean;
  status: SecurityGateStatus;
  message: string;
  reasons: string[];
  evaluatedAt: string;
  policy: SecurityGatePolicy;
}

/**
 * Core Repository Model
 */
export interface Repository {
  _id: string;
  id?: string;
  repositoryName: string;
  repositoryUrl?: string;
  securityStatus: string;
  riskLevel: RiskLevel;
  riskScore?: number;
  lastScannedDate?: Date | string;
  filesScanned?: number;
  totalFindings?: number;
  gateStatus?: SecurityGateStatus;
  owner?: string;
  _createdDate?: Date | string;
  _updatedDate?: Date | string;
}

/**
 * Core Pipeline Model
 */
export interface Pipeline {
  _id: string;
  id?: string;
  pipelineName: string;
  executionId: string;
  status: 'Success' | 'Failed' | 'Running' | 'Pending';
  duration?: number;
  repositoryName?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  _createdDate?: Date | string;
  _updatedDate?: Date | string;
}

/**
 * Core Scan History Model
 */
export interface ScanHistoryItem {
  _id: string;
  id?: string;
  scannedTarget: string;
  repositoryUrl?: string;
  scanType: string;
  executionDateTime: Date | string;
  totalFindings: number;
  durationSeconds: number;
  status: 'Completed' | 'Failed' | 'Running';
  filesDiscovered?: number;
  filesScanned?: number;
  filesSkipped?: number;
  commitSha?: string;
  branch?: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
  gateStatus?: SecurityGateStatus;
  gateMessage?: string;
  gateReasons?: string[];
  severityCounts?: SeverityCounts;
  scannedFileList?: string[];
  _createdDate?: Date | string;
  _updatedDate?: Date | string;
}

/**
 * Core Report Model
 */
export interface ReportItem {
  _id: string;
  id?: string;
  reportTitle: string;
  generationDate: Date | string;
  reportType: string;
  reportStatus: 'Generated' | 'Generating' | 'Failed';
  reportUrl?: string;
  _createdDate?: Date | string;
  _updatedDate?: Date | string;
}
