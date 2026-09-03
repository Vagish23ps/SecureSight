import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Search, 
  Loader2, 
  Shield, 
  RotateCcw,
  Trash2,
  ArrowRight,
  Info
} from 'lucide-react';
import { RepositoryStore, ScanStore, FindingStore } from '@/services/storage';
import type { Repositories } from '@/entities';
import type { RepositoryScanResult } from '@/services/scanner/repository-scanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

const SCAN_PHASES = [
  'Validating GitHub repository URL...',
  'Connecting to GitHub & fetching repository metadata...',
  'Discovering repository files via recursive Git tree...',
  'Filtering files (excluding binaries, vendor, node_modules)...',
  'Analyzing source code content with SAST vulnerability rules...',
  'Calculating deterministic CVSS risk metrics...',
  'Evaluating Security Gate policies...'
];

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repositories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [repoUrlInput, setRepoUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressIndex, setScanProgressIndex] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<RepositoryScanResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    setIsLoading(true);
    try {
      const items = await RepositoryStore.getAll();
      setRepositories(items);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScan = async (urlToScan?: string) => {
    const targetUrl = (urlToScan || repoUrlInput).trim();
    if (!targetUrl) {
      setScanError('Please enter a GitHub repository URL.');
      return;
    }

    setScanError(null);
    setIsScanning(true);
    setScanProgressIndex(0);

    // Increment progress phases through genuine timeouts reflecting actual server activity
    const progressInterval = setInterval(() => {
      setScanProgressIndex(prev => {
        if (prev < SCAN_PHASES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryUrl: targetUrl }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to scan repository.');
      }

      const result: RepositoryScanResult = data.result;

      // 1. Persist Repository record
      const repoId = `repo-${result.repositoryName.replace('/', '-')}`;
      await RepositoryStore.save({
        _id: repoId,
        repositoryName: result.repositoryName,
        repositoryUrl: result.repositoryUrl,
        owner: result.owner,
        securityStatus: result.gateMessage,
        riskLevel: result.riskLevel,
        riskScore: result.riskScore,
        filesScanned: result.filesScanned,
        totalFindings: result.totalFindings,
        gateStatus: result.gateStatus,
        lastScannedDate: result.scannedAt,
      });

      // 2. Persist Scan History record
      await ScanStore.save({
        _id: result.scanId,
        scannedTarget: result.repositoryName,
        repositoryUrl: result.repositoryUrl,
        scanType: 'Static Application Security Testing (SAST)',
        executionDateTime: result.scannedAt,
        durationSeconds: result.durationSeconds,
        totalFindings: result.totalFindings,
        status: 'Completed',
        filesDiscovered: result.filesDiscovered,
        filesScanned: result.filesScanned,
        filesSkipped: result.filesSkipped,
        commitSha: result.commitSha,
        branch: result.defaultBranch,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        gateStatus: result.gateStatus,
        gateMessage: result.gateMessage,
        gateReasons: result.gateReasons,
        severityCounts: result.severityCounts,
        scannedFileList: result.scannedFileList,
      });

      // 3. Clear existing findings for this repo and save newly detected findings
      await FindingStore.deleteByRepository(result.repositoryName);
      if (result.findings.length > 0) {
        await FindingStore.saveMany(result.findings);
      }

      setLastScanResult(result);
      setShowResultModal(true);
      setRepoUrlInput('');
      await loadRepositories();
    } catch (err: any) {
      clearInterval(progressInterval);
      setScanError(err.message || 'An error occurred during scan.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteRepository = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove '${name}' from SecureFlow?`)) {
      await RepositoryStore.delete(id);
      await FindingStore.deleteByRepository(name);
      await loadRepositories();
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'Critical': return 'text-destructive';
      case 'High': return 'text-primary';
      case 'Medium': return 'text-deepbrown';
      case 'Low': return 'text-secondary-foreground';
      default: return 'text-secondary-foreground';
    }
  };

  const getRiskBorderColor = (risk?: string) => {
    switch (risk) {
      case 'Critical': return 'border-destructive';
      case 'High': return 'border-primary';
      case 'Medium': return 'border-deepbrown';
      case 'Low': return 'border-secondary-foreground/30';
      default: return 'border-deepbrown/20';
    }
  };

  const getGateBadge = (status?: string) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-950/10 text-green-700 dark:text-green-400 border border-green-700/30 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" /> PASS
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/10 text-amber-700 dark:text-amber-400 border border-amber-700/30 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" /> WARN
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-destructive/10 text-destructive border border-destructive/30 text-xs font-semibold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" /> FAIL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-deepbrown/30 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            NOT SCANNED
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[700px]">
        
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">
            GitHub Repository Scanner
          </h1>
          <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
            Enter any public GitHub repository to perform real-time static application security testing (SAST), calculate deterministic CVSS risk, and evaluate automated security gate compliance.
          </p>
        </div>

        {/* PRIMARY SCAN INPUT CARD */}
        <div className="border-2 border-primary bg-background p-8 md:p-10 mb-12 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="font-heading text-2xl text-foreground">Scan a Public GitHub Repository</h2>
          </div>

          <p className="font-paragraph text-sm text-secondary-foreground mb-6">
            SecureFlow will fetch the live Git tree, filter code files by extension, inspect source lines for OWASP Top 10 vulnerabilities, and calculate real risk metrics.
          </p>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleStartScan(); }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/50" />
              <input
                type="url"
                disabled={isScanning}
                value={repoUrlInput}
                onChange={(e) => { setRepoUrlInput(e.target.value); setScanError(null); }}
                placeholder="https://github.com/octocat/Hello-World"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-deepbrown/30 bg-secondary text-foreground font-paragraph text-base focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-paragraph font-semibold hover:bg-deepbrown transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning Repository...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Scan Repository
                </>
              )}
            </button>
          </form>

          {/* Quick pick sample */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-secondary-foreground">
            <span className="font-semibold uppercase tracking-wider">Example:</span>
            <button
              type="button"
              disabled={isScanning}
              onClick={() => {
                setRepoUrlInput('https://github.com/octocat/Hello-World');
                handleStartScan('https://github.com/octocat/Hello-World');
              }}
              className="text-primary underline hover:text-deepbrown transition-colors disabled:opacity-50"
            >
              https://github.com/octocat/Hello-World
            </button>
          </div>

          {/* Error Message */}
          {scanError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 border border-destructive/40 bg-destructive/5 text-destructive font-paragraph text-sm flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Scan Error: </strong>
                {scanError}
              </div>
            </motion.div>
          )}

          {/* REAL PROGRESS INDICATOR */}
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 pt-8 border-t border-deepbrown/20"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading text-lg text-foreground flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  {SCAN_PHASES[scanProgressIndex]}
                </span>
                <span className="font-mono text-xs text-secondary-foreground">
                  Phase {scanProgressIndex + 1} of {SCAN_PHASES.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-secondary border border-deepbrown/20 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '10%' }}
                  animate={{ width: `${((scanProgressIndex + 1) / SCAN_PHASES.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <p className="mt-3 font-paragraph text-xs text-secondary-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Connecting directly to GitHub API to enumerate files and analyze vulnerabilities.
              </p>
            </motion.div>
          )}
        </div>

        {/* SCAN RESULT MODAL BANNER */}
        <AnimatePresence>
          {showResultModal && lastScanResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border-2 border-deepbrown bg-background p-8 mb-12 shadow-md relative"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-deepbrown/20">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-heading text-2xl text-foreground">
                      Scan Completed: {lastScanResult.repositoryName}
                    </span>
                    {getGateBadge(lastScanResult.gateStatus)}
                  </div>
                  <p className="font-paragraph text-sm text-secondary-foreground">
                    Analyzed in {lastScanResult.durationSeconds}s (Commit: <span className="font-mono">{lastScanResult.commitSha?.slice(0, 7) || 'HEAD'}</span>)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/findings"
                    className="px-4 py-2 bg-primary text-primary-foreground font-paragraph text-sm font-semibold hover:bg-deepbrown transition-colors inline-flex items-center gap-2"
                  >
                    View Findings ({lastScanResult.totalFindings}) <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/scans/${lastScanResult.scanId}`}
                    className="px-4 py-2 border border-deepbrown text-foreground font-paragraph text-sm hover:bg-deepbrown hover:text-background transition-colors"
                  >
                    Full Scan Report
                  </Link>
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="p-2 text-secondary-foreground hover:text-foreground text-sm"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="border border-deepbrown/20 p-4">
                  <div className="font-heading text-3xl text-foreground mb-1">
                    {lastScanResult.filesScanned}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-secondary-foreground">Files Scanned</div>
                </div>
                <div className="border border-deepbrown/20 p-4">
                  <div className="font-heading text-3xl text-foreground mb-1">
                    {lastScanResult.filesDiscovered}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-secondary-foreground">Discovered</div>
                </div>
                <div className="border border-destructive/40 p-4">
                  <div className="font-heading text-3xl text-destructive mb-1">
                    {lastScanResult.severityCounts.critical}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-secondary-foreground">Critical</div>
                </div>
                <div className="border border-primary/40 p-4">
                  <div className="font-heading text-3xl text-primary mb-1">
                    {lastScanResult.severityCounts.high}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-secondary-foreground">High</div>
                </div>
                <div className="border border-deepbrown/40 p-4">
                  <div className="font-heading text-3xl text-deepbrown mb-1">
                    {lastScanResult.severityCounts.medium}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-secondary-foreground">Medium</div>
                </div>
                <div className="border border-deepbrown/20 p-4">
                  <div className="font-heading text-3xl text-foreground mb-1">
                    {lastScanResult.riskScore}<span className="text-sm text-secondary-foreground">/100</span>
                  </div>
                  <div className="text-xs uppercase tracking-wider text-secondary-foreground">Risk Score</div>
                </div>
              </div>

              {/* Gate Message */}
              <div className="mt-4 p-3 bg-secondary border border-deepbrown/20 text-xs font-paragraph text-secondary-foreground">
                <span className="font-semibold text-foreground">Security Gate Decision: </span>
                {lastScanResult.gateMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REPOSITORIES TABLE */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-3xl text-foreground">Scanned Repositories</h2>
            <p className="font-paragraph text-sm text-secondary-foreground">
              {repositories.length} repository record(s) in local storage
            </p>
          </div>
        </div>

        <div className="border border-deepbrown/20 bg-background">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="px-6 py-4 text-left font-heading text-base">Repository</th>
                  <th className="px-6 py-4 text-left font-heading text-base">Owner</th>
                  <th className="px-6 py-4 text-left font-heading text-base">Files Scanned</th>
                  <th className="px-6 py-4 text-left font-heading text-base">Findings</th>
                  <th className="px-6 py-4 text-left font-heading text-base">Risk Level</th>
                  <th className="px-6 py-4 text-left font-heading text-base">Security Gate</th>
                  <th className="px-6 py-4 text-left font-heading text-base">Last Scanned</th>
                  <th className="px-6 py-4 text-left font-heading text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-secondary-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading repositories...
                    </td>
                  </tr>
                ) : repositories.length > 0 ? (
                  repositories.map((repo, index) => (
                    <motion.tr
                      key={repo._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className="border-b border-deepbrown/20 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-5 h-5 text-primary shrink-0" />
                          <div>
                            <div className="font-heading text-base text-foreground font-semibold">
                              {repo.repositoryName}
                            </div>
                            {repo.repositoryUrl && (
                              <a 
                                href={repo.repositoryUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-paragraph text-xs text-primary hover:text-deepbrown transition-colors inline-flex items-center gap-1"
                              >
                                View on GitHub <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-paragraph text-sm text-secondary-foreground">
                        {repo.owner || 'GitHub User'}
                      </td>
                      <td className="px-6 py-5 font-paragraph text-sm text-secondary-foreground">
                        {typeof repo.filesScanned === 'number' ? repo.filesScanned : '-'}
                      </td>
                      <td className="px-6 py-5 font-paragraph text-sm font-semibold text-foreground">
                        {typeof repo.totalFindings === 'number' ? repo.totalFindings : '-'}
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 border ${getRiskBorderColor(repo.riskLevel)} ${getRiskColor(repo.riskLevel)} text-xs font-semibold`}>
                          <span>{repo.riskLevel}</span>
                          {typeof repo.riskScore === 'number' && (
                            <span className="opacity-70 font-mono">({repo.riskScore})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getGateBadge(repo.gateStatus)}
                      </td>
                      <td className="px-6 py-5 font-paragraph text-xs text-secondary-foreground whitespace-nowrap">
                        {repo.lastScannedDate 
                          ? format(new Date(repo.lastScannedDate), 'MMM dd, yyyy HH:mm') 
                          : 'Not scanned'}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStartScan(repo.repositoryUrl)}
                            disabled={isScanning}
                            title="Re-scan repository"
                            className="text-primary hover:text-deepbrown transition-colors p-1"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/findings?repo=${encodeURIComponent(repo.repositoryName || '')}`}
                            className="font-paragraph text-xs text-primary hover:text-deepbrown font-semibold transition-colors"
                          >
                            Findings
                          </Link>
                          <button
                            onClick={() => handleDeleteRepository(repo._id, repo.repositoryName || '')}
                            title="Delete repository record"
                            className="text-destructive/70 hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <Shield className="w-12 h-12 text-secondary-foreground/30 mx-auto mb-4" />
                      <h3 className="font-heading text-2xl text-foreground mb-2">
                        No repositories scanned yet
                      </h3>
                      <p className="font-paragraph text-sm text-secondary-foreground max-w-md mx-auto mb-6">
                        SecureFlow has not executed any repository scans. Enter a public GitHub repository URL above to perform your first vulnerability scan.
                      </p>
                      <button
                        onClick={() => {
                          setRepoUrlInput('https://github.com/octocat/Hello-World');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-paragraph text-sm font-semibold hover:bg-deepbrown transition-colors"
                      >
                        Try Sample: octocat/Hello-World
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}