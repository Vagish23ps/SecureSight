/**
 * Repository Scanner Service
 * Orchestrates real GitHub repository fetching, file discovery, filtering,
 * multi-file SAST scanning, deterministic risk calculation, and security gate evaluation.
 */

import { GitHubUrlParser } from './github-url-parser';
import { GitHubFetcher, type GitHubTreeItem } from './github-fetcher';
import { FileFilter, type FileFilterOptions } from './file-filter';
import { SourceCodeScanner } from '@/lib/security-scanner';
import { evaluateRisk } from '@/lib/risk-engine';
import { SecurityGateService } from '@/lib/security-gate';
import type { Finding, RiskLevel, SecurityGateStatus, SeverityCounts } from '@/types/security';

export interface RepositoryScanOptions {
  githubToken?: string;
  maxFilesToScan?: number;
  filterOptions?: FileFilterOptions;
}

export interface RepositoryScanResult {
  scanId: string;
  repositoryName: string;
  repositoryUrl: string;
  owner: string;
  defaultBranch: string;
  commitSha?: string;
  scannedAt: string;
  durationSeconds: number;
  status: 'Completed' | 'Failed';
  filesDiscovered: number;
  filesScanned: number;
  filesSkipped: number;
  findings: Finding[];
  totalFindings: number;
  severityCounts: SeverityCounts;
  riskScore: number;
  riskLevel: RiskLevel;
  gatePassed: boolean;
  gateStatus: SecurityGateStatus;
  gateMessage: string;
  gateReasons: string[];
  scannedFileList: string[];
}

export class RepositoryScanner {
  private fetcher: GitHubFetcher;
  private filter: FileFilter;
  private scanner: SourceCodeScanner;
  private maxFiles: number;

  constructor(options: RepositoryScanOptions = {}) {
    this.fetcher = new GitHubFetcher(options.githubToken);
    this.filter = new FileFilter(options.filterOptions);
    this.scanner = new SourceCodeScanner();
    this.maxFiles = options.maxFilesToScan || 150;
  }

  /**
   * Scans a GitHub repository from its URL
   */
  async scanRepository(repositoryUrl: string): Promise<RepositoryScanResult> {
    const startTime = performance.now();

    // 1. Parse & validate URL
    const parsed = GitHubUrlParser.parse(repositoryUrl);

    // 2. Fetch repository metadata
    const meta = await this.fetcher.getRepoMetadata(parsed.owner, parsed.repo);

    // 3. Discover all files recursively via Git Tree
    const treeResult = await this.fetcher.getRecursiveTree(
      parsed.owner,
      parsed.repo,
      meta.defaultBranch
    );

    const allBlobs = treeResult.items.filter(item => item.type === 'blob');
    const filesDiscovered = allBlobs.length;

    // 4. Filter files by extensions and directories
    const scannableBlobs: GitHubTreeItem[] = [];
    let filesSkipped = 0;

    for (const blob of allBlobs) {
      const decision = this.filter.shouldScan(blob.path, blob.size);
      if (decision.shouldScan) {
        scannableBlobs.push(blob);
      } else {
        filesSkipped++;
      }
    }

    // Apply safety threshold
    const selectedBlobs = scannableBlobs.slice(0, this.maxFiles);
    if (scannableBlobs.length > this.maxFiles) {
      filesSkipped += scannableBlobs.length - this.maxFiles;
    }

    // 5. Fetch content and scan each file concurrently with a batch limiter
    const allFindings: Finding[] = [];
    const scannedFileList: string[] = [];

    // Process in batches of 5 concurrent requests
    const BATCH_SIZE = 5;
    for (let i = 0; i < selectedBlobs.length; i += BATCH_SIZE) {
      const batch = selectedBlobs.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async blob => {
          try {
            const content = await this.fetcher.getFileContent(
              parsed.owner,
              parsed.repo,
              meta.defaultBranch,
              blob.path,
              blob.sha
            );

            scannedFileList.push(blob.path);

            const fileFindings = this.scanner.scan({
              repositoryName: meta.fullName,
              sourceCode: content,
              filePath: blob.path,
            });

            return fileFindings;
          } catch (err) {
            console.warn(`[RepositoryScanner] Failed to fetch or scan ${blob.path}:`, err);
            return [] as Finding[];
          }
        })
      );

      for (const findings of batchResults) {
        allFindings.push(...findings);
      }
    }

    // 6. Calculate deterministic risk
    const riskAnalysis = evaluateRisk(allFindings);

    // 7. Evaluate security gate
    const gateResult = SecurityGateService.evaluate(allFindings);

    // 8. Calculate measured duration (in seconds, rounded to 2 decimals)
    const durationSeconds = Math.max(
      0.01,
      Number(((performance.now() - startTime) / 1000).toFixed(2))
    );

    const scanId = `scn-${Date.now()}-${Math.floor(performance.now())}`;

    return {
      scanId,
      repositoryName: meta.fullName,
      repositoryUrl: meta.htmlUrl,
      owner: meta.owner,
      defaultBranch: meta.defaultBranch,
      commitSha: treeResult.commitSha,
      scannedAt: new Date().toISOString(),
      durationSeconds,
      status: 'Completed',
      filesDiscovered,
      filesScanned: scannedFileList.length,
      filesSkipped,
      findings: allFindings,
      totalFindings: allFindings.length,
      severityCounts: riskAnalysis.counts,
      riskScore: riskAnalysis.riskScore,
      riskLevel: riskAnalysis.riskLevel,
      gatePassed: gateResult.passed,
      gateStatus: gateResult.status,
      gateMessage: gateResult.message,
      gateReasons: gateResult.reasons,
      scannedFileList,
    };
  }
}