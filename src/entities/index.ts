/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: pipelines
 * Interface for Pipelines
 */
export interface Pipelines {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  pipelineName?: string;
  /** @wixFieldType text */
  executionId?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType number */
  duration?: number;
  /** @wixFieldType text */
  repositoryName?: string;
  /** @wixFieldType datetime */
  startTime?: Date | string;
  /** @wixFieldType datetime */
  endTime?: Date | string;
}


/**
 * Collection ID: reports
 * Interface for Reports
 */
export interface Reports {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  reportTitle?: string;
  /** @wixFieldType date */
  generationDate?: Date | string;
  /** @wixFieldType text */
  reportType?: string;
  /** @wixFieldType text */
  reportStatus?: string;
  /** @wixFieldType url */
  reportUrl?: string;
}


/**
 * Collection ID: repositories
 * Interface for Repositories
 */
export interface Repositories {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  repositoryName?: string;
  /** @wixFieldType url */
  repositoryUrl?: string;
  /** @wixFieldType text */
  securityStatus?: string;
  /** @wixFieldType text */
  riskLevel?: string;
  /** @wixFieldType datetime */
  lastScannedDate?: Date | string;
  /** @wixFieldType text */
  owner?: string;
}


/**
 * Collection ID: scanhistory
 * Interface for ScanHistory
 */
export interface ScanHistory {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  scannedTarget?: string;
  /** @wixFieldType text */
  scanType?: string;
  /** @wixFieldType datetime */
  executionDateTime?: Date | string;
  /** @wixFieldType number */
  totalFindings?: number;
  /** @wixFieldType number */
  durationSeconds?: number;
  /** @wixFieldType text */
  status?: string;
}


/**
 * Collection ID: securityfindings
 * Interface for SecurityFindings
 */
export interface SecurityFindings {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  severity?: string;
  /** @wixFieldType text */
  remediationStatus?: string;
  /** @wixFieldType text */
  repositoryName?: string;
  /** @wixFieldType datetime */
  detectionDate?: Date | string;
  /** @wixFieldType text */
  cweCveId?: string;
}
