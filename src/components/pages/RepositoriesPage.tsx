import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, AlertTriangle, CheckCircle, ExternalLink, Plus, Code, Loader } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Repositories, SecurityFindings, ScanHistory } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { scanSourceCode, calculateSecurityStatus } from '@/lib/security-scanner';

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repositories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanningRepo, setScanningRepo] = useState<string | null>(null);
  const [sourceCode, setSourceCode] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<Repositories>('repositories');
      setRepositories(result.items);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanRepository = async (repoId: string, repoName: string) => {
    if (!sourceCode.trim()) {
      alert('Please paste source code to scan');
      return;
    }

    setScanningRepo(repoId);
    try {
      // Scan the source code
      const scanResult = scanSourceCode(sourceCode, repoName);

      // Create scan history record
      const scanHistoryId = crypto.randomUUID();
      await BaseCrudService.create('scanhistory', {
        _id: scanHistoryId,
        scannedTarget: repoName,
        scanType: 'Static Analysis',
        executionDateTime: new Date(),
        totalFindings: scanResult.totalFindings,
        durationSeconds: Math.floor(Math.random() * 30) + 5,
        status: 'Completed',
      });

      // Create finding records for each vulnerability
      for (const finding of scanResult.findings) {
        const findingId = crypto.randomUUID();
        await BaseCrudService.create('securityfindings', {
          _id: findingId,
          title: finding.title,
          description: finding.description,
          severity: finding.severity,
          remediationStatus: 'Open',
          repositoryName: repoName,
          detectionDate: new Date(),
          cweCveId: finding.cweCveId,
        });
      }

      // Update repository with new risk level
      const updatedRepo = {
        _id: repoId,
        riskLevel: scanResult.riskLevel,
        securityStatus: calculateSecurityStatus(scanResult.riskLevel),
        lastScannedDate: new Date(),
      };
      await BaseCrudService.update('repositories', updatedRepo);

      // Reload repositories
      await loadRepositories();
      setShowScanModal(false);
      setSourceCode('');
      setSelectedRepoId(null);
      alert(`Scan completed! Found ${scanResult.totalFindings} vulnerabilities.`);
    } catch (error) {
      console.error('Failed to scan repository:', error);
      alert('Failed to scan repository. Please try again.');
    } finally {
      setScanningRepo(null);
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

  const getRiskIcon = (risk?: string) => {
    if (risk === 'Low') {
      return <CheckCircle className="w-5 h-5" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[600px]">
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Repositories</h1>
            <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
              Monitor security status and risk levels across all your code repositories.
            </p>
          </div>
          <button
            onClick={() => setShowScanModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-paragraph font-semibold hover:bg-deepbrown transition-colors"
          >
            <Plus className="w-5 h-5" />
            Scan Repository
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="border-2 border-secondary-foreground/30 p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {repositories.filter(r => r.riskLevel === 'Low').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Low Risk</div>
          </div>
          <div className="border-2 border-deepbrown p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {repositories.filter(r => r.riskLevel === 'Medium').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Medium Risk</div>
          </div>
          <div className="border-2 border-primary p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {repositories.filter(r => r.riskLevel === 'High').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">High Risk</div>
          </div>
          <div className="border-2 border-destructive p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {repositories.filter(r => r.riskLevel === 'Critical').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Critical Risk</div>
          </div>
        </div>

        {/* Repositories Table */}
        <div className="border border-deepbrown/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary">
                <tr>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Repository</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Owner</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Risk Level</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Security Status</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Last Scanned</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? null : repositories.length > 0 ? (
                  repositories.map((repo, index) => (
                    <motion.tr
                      key={repo._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-deepbrown/20 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-heading text-base text-foreground">{repo.repositoryName}</div>
                            {repo.repositoryUrl && (
                              <a 
                                href={repo.repositoryUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-paragraph text-xs text-secondary-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                              >
                                View Repository <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{repo.owner}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 border ${getRiskBorderColor(repo.riskLevel)} ${getRiskColor(repo.riskLevel)}`}>
                          {getRiskIcon(repo.riskLevel)}
                          <span className="font-paragraph text-sm font-semibold">{repo.riskLevel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{repo.securityStatus}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">
                          {repo.lastScannedDate ? format(new Date(repo.lastScannedDate), 'MMM dd, yyyy HH:mm') : 'Never'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          to={`/repositories/${repo._id}`}
                          className="font-paragraph text-sm text-primary hover:text-deepbrown transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="font-paragraph text-base text-secondary-foreground">No repositories found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-secondary border border-deepbrown/20 max-w-2xl w-full p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-foreground">Scan Repository for Vulnerabilities</h2>
              <button
                onClick={() => {
                  setShowScanModal(false);
                  setSourceCode('');
                  setSelectedRepoId(null);
                }}
                className="text-foreground/60 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">
                Select Repository
              </label>
              <select
                value={selectedRepoId || ''}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="w-full px-4 py-2 border border-deepbrown/20 bg-secondary font-paragraph text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">Choose a repository...</option>
                {repositories.map((repo) => (
                  <option key={repo._id} value={repo._id}>
                    {repo.repositoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">
                Paste Source Code
              </label>
              <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="Paste your source code here for security analysis..."
                className="w-full h-64 px-4 py-3 border border-deepbrown/20 bg-secondary font-mono text-xs text-foreground focus:outline-none focus:border-primary resize-none"
              />
              <p className="text-xs text-foreground/50 mt-2">
                The scanner will analyze for SQL injection, XSS, hardcoded secrets, weak cryptography, and more.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowScanModal(false);
                  setSourceCode('');
                  setSelectedRepoId(null);
                }}
                className="flex-1 px-4 py-2 border border-deepbrown/20 text-foreground font-paragraph font-semibold hover:bg-deepbrown/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedRepoId) {
                    const repo = repositories.find(r => r._id === selectedRepoId);
                    if (repo) {
                      handleScanRepository(selectedRepoId, repo.repositoryName || 'unknown');
                    }
                  }
                }}
                disabled={!selectedRepoId || !sourceCode.trim() || scanningRepo === selectedRepoId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-paragraph font-semibold hover:bg-deepbrown disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {scanningRepo === selectedRepoId ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4" />
                    Scan Now
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
