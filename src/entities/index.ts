/**
 * Core entity types for SecureFlow
 */
import type { 
  Finding, 
  Repository as IRepository, 
  Pipeline as IPipeline, 
  ScanHistoryItem as IScanHistory, 
  ReportItem as IReport 
} from '@/types/security';

export interface Pipelines extends IPipeline {}
export interface Reports extends IReport {}
export interface Repositories extends IRepository {}
export interface ScanHistory extends IScanHistory {}
export interface SecurityFindings extends Finding {}

export * from '@/types/security';
