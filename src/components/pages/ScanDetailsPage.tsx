import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileCode, 
  ExternalLink,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ScanStore, FindingStore } from '@/services/storage';
import type { ScanHistory, SecurityFindings } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ScanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanHistory | null>(null);
  const [findings, setFindings] = useState<SecurityFindings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadScanData();
    }
  }, [id]);

  const loadScanData = async () => {
    setIsLoading(true);
    try {
      const data = await ScanStore.getById(id!);
      setScan(data);

      if (data) {
        const repoFindings = await FindingStore.getAll({
          repositoryName: data.scannedTarget,
        });
        setFindings(repoFindings);
      }
    } catch (error) {
      console.error('Failed to load scan data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGateBadge = (status?: string) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-950/10 text-green-700 dark:text-green-400 border border-green-700/30 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" /> GATE PASS
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-950/10 text-amber-700 dark:text-amber-400 border border-amber-700/30 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> GATE WARN
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-destructive/10 text-destructive border border-destructive/30 text-xs font-semibold uppercase tracking-wider">
            <XCircle className="w-4 h-4" /> GATE FAIL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-deepbrown/30 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            COMPLETED
          </span>
        );
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'Critical': return 'text-destructive';
      case 'High': return 'text-primary';
      case 'Medium': return 'text-deepbrown';
      case 'Low': return 'text-secondary-foreground';
      default: return 'text-secondary-foreground';
    }
  };

  const getSeverityBorderColor = (severity?: string) => {
    switch (severity) {
      case 'Critical': return 'border-destructive';
      case 'High': return 'border-primary';
      case 'Medium': return 'border-deepbrown';
      case 'Low': return 'border-secondary-foreground/30';
      default: return 'border-deepbrown/20';
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[600px]">
        <Link 
          to="/scans"
          className="inline-flex items-center gap-2 font-paragraph text-base text-primary hover:text-deepbrown transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Scan History
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : !scan ? (
          <div className="text-center py-20 border border-deepbrown/20 bg-background p-12">
            <h2 className="font-heading text-3xl text-foreground mb-4">Scan Record Not Found</h2>
            <p className="font-paragraph text-base text-secondary-foreground mb-6">
              The requested scan record does not exist in local storage.
            </p>
            <Link
              to="/repositories"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-paragraph text-sm font-semibold hover:bg-deepbrown transition-colors"
            >
              Scan a Repository
            </Link>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-12 border-b border-deepbrown/20 pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Activity className="w-12 h-12 text-primary shrink-0" />
                  <div>
                    <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-2">
                      {scan.scannedTarget}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-secondary-foreground">
                      <span>{scan.scanType}</span>
                      <span className="w-1 h-1 rounded-full bg-deepbrown/40"></span>
                      <span>Branch: <code className="font-mono font-semibold">{scan.branch || 'main'}</code></span>
                      {scan.commitSha && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-deepbrown/40"></span>
                          <span>Commit: <code className="font-mono text-xs">{scan.commitSha.slice(0, 7)}</code></span>
                        </>
                      )}
                      {scan.repositoryUrl && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-deepbrown/40"></span>
                          <a 
                            href={scan.repositoryUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-deepbrown inline-flex items-center gap-1"
                          >
                            GitHub <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  {getGateBadge(scan.gateStatus)}
                </div>
              </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
              <div className="border border-deepbrown/20 bg-background p-6">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Total Findings</span>
                </div>
                <div className="font-heading text-4xl text-foreground">{scan.totalFindings || 0}</div>
              </div>

              <div className="border border-deepbrown/20 bg-background p-6">
                <div className="flex items-center gap-2 mb-2 text-deepbrown">
                  <Clock className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Duration</span>
                </div>
                <div className="font-heading text-4xl text-foreground">{scan.durationSeconds}s</div>
              </div>

              <div className="border border-deepbrown/20 bg-background p-6">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <FileCode className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Files Scanned</span>
                </div>
                <div className="font-heading text-4xl text-foreground">{scan.filesScanned || 0}</div>
              </div>

              <div className="border border-deepbrown/20 bg-background p-6">
                <div className="flex items-center gap-2 mb-2 text-secondary-foreground">
                  <Layers className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Discovered</span>
                </div>
                <div className="font-heading text-4xl text-foreground">{scan.filesDiscovered || 0}</div>
              </div>

              <div className="border border-deepbrown/20 bg-background p-6">
                <div className="flex items-center gap-2 mb-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Critical / High</span>
                </div>
                <div className="font-heading text-4xl text-destructive">
                  {(scan.severityCounts?.critical || 0) + (scan.severityCounts?.high || 0)}
                </div>
              </div>

              <div className="border border-deepbrown/20 bg-background p-6">
                <div className="flex items-center gap-2 mb-2 text-foreground">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Risk Score</span>
                </div>
                <div className="font-heading text-4xl text-foreground">
                  {scan.riskScore || 0}<span className="text-sm text-secondary-foreground">/100</span>
                </div>
              </div>
            </div>

            {/* SECURITY GATE DECISION CARD */}
            {scan.gateMessage && (
              <div className="border-2 border-primary bg-background p-8 mb-12 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                  <h2 className="font-heading text-2xl text-foreground">Security Gate Evaluation</h2>
                </div>
                <p className="font-paragraph text-base text-foreground mb-4 font-semibold">
                  {scan.gateMessage}
                </p>

                {scan.gateReasons && scan.gateReasons.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-deepbrown/20">
                    <span className="text-xs uppercase tracking-wider font-semibold text-secondary-foreground block mb-2">
                      Specific Rule Violations:
                    </span>
                    {scan.gateReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-destructive font-paragraph">
                        <span className="mt-1">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DETECTED FINDINGS TABLE */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-3xl text-foreground">Detected Findings</h2>
                  <p className="font-paragraph text-sm text-secondary-foreground">
                    Actual vulnerabilities matched in repository files
                  </p>
                </div>
                <span className="font-paragraph text-sm font-semibold text-foreground">
                  {findings.length} findings
                </span>
              </div>

              <div className="border border-deepbrown/20 bg-background">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary text-primary-foreground">
                      <tr>
                        <th className="px-6 py-4 text-left font-heading text-base">Vulnerability</th>
                        <th className="px-6 py-4 text-left font-heading text-base">Severity</th>
                        <th className="px-6 py-4 text-left font-heading text-base">File & Line</th>
                        <th className="px-6 py-4 text-left font-heading text-base">Category</th>
                        <th className="px-6 py-4 text-left font-heading text-base">Evidence</th>
                        <th className="px-6 py-4 text-left font-heading text-base">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {findings.length > 0 ? (
                        findings.map((f) => (
                          <tr key={f._id} className="border-b border-deepbrown/20 hover:bg-primary/5 transition-colors">
                            <td className="px-6 py-4 font-heading text-base font-semibold text-foreground">
                              {f.title}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 border ${getSeverityBorderColor(f.severity)} ${getSeverityColor(f.severity)} text-xs font-semibold`}>
                                {f.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-secondary-foreground">
                              {f.filePath}:{f.lineNumber}
                            </td>
                            <td className="px-6 py-4 font-paragraph text-sm text-secondary-foreground">
                              {f.category || 'General'}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-foreground/80 max-w-xs truncate">
                              {f.evidence || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                to={`/findings/${f._id}`}
                                className="font-paragraph text-xs font-semibold text-primary hover:text-deepbrown inline-flex items-center gap-1"
                              >
                                Investigate <ArrowRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-secondary-foreground">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            No security vulnerabilities detected in scanned files.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SCANNED FILES LIST */}
            {scan.scannedFileList && scan.scannedFileList.length > 0 && (
              <div className="border border-deepbrown/20 bg-background p-8 mb-12">
                <h3 className="font-heading text-2xl text-foreground mb-4">
                  Scanned Files ({scan.scannedFileList.length})
                </h3>
                <div className="max-h-60 overflow-y-auto font-mono text-xs text-secondary-foreground space-y-1 pr-2">
                  {scan.scannedFileList.map((filePath, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1 border-b border-deepbrown/10">
                      <FileCode className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{filePath}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}