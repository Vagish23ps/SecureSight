import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Filter, X } from 'lucide-react';
import { BaseCrudService } from '@/services/storage';
import { SecurityFindings } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

interface ExtendedFinding extends SecurityFindings {
  filePath?: string;
  lineNumber?: number;
  scanner?: string;
  evidence?: string;
  impact?: string;
  remediation?: string;
  aiExplanation?: string;
}

export default function FindingsPage() {
  const [findings, setFindings] = useState<ExtendedFinding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<ExtendedFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [repositoryFilter, setRepositoryFilter] = useState<string>('');
  const [scannerFilter, setScannerFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadFindings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [findings, severityFilter, repositoryFilter, scannerFilter, statusFilter]);

  const loadFindings = async () => {
    setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<SecurityFindings>('securityfindings');
      setFindings(result.items as ExtendedFinding[]);
    } catch (error) {
      console.error('Failed to load findings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = findings;

    if (severityFilter) {
      filtered = filtered.filter(f => f.severity === severityFilter);
    }
    if (repositoryFilter) {
      filtered = filtered.filter(f => f.repositoryName === repositoryFilter);
    }
    if (scannerFilter) {
      filtered = filtered.filter(f => f.scanner === scannerFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(f => f.remediationStatus === statusFilter);
    }

    setFilteredFindings(filtered);
  };

  const clearFilters = () => {
    setSeverityFilter('');
    setRepositoryFilter('');
    setScannerFilter('');
    setStatusFilter('');
  };

  const uniqueRepositories = Array.from(new Set(findings.map(f => f.repositoryName).filter(Boolean)));
  const uniqueScanners = Array.from(new Set(findings.map(f => f.scanner).filter(Boolean)));
  const severities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Open', 'In Progress', 'Fixed'];

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

  const getRemediationColor = (status?: string) => {
    switch (status) {
      case 'Fixed': return 'text-secondary-foreground';
      case 'In Progress': return 'text-primary';
      case 'Open': return 'text-destructive';
      default: return 'text-deepbrown';
    }
  };

  const hasActiveFilters = severityFilter || repositoryFilter || scannerFilter || statusFilter;

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[600px]">
        <div className="mb-12">
          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Security Findings</h1>
          <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
            Track and manage real security vulnerabilities detected across your repositories.
          </p>
        </div>

        {/* Severity Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="border-2 border-destructive p-6">
            <div className="font-heading text-4xl text-destructive mb-2">
              {findings.filter(f => f.severity === 'Critical').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Critical Vulnerabilities</div>
          </div>
          <div className="border-2 border-primary p-6">
            <div className="font-heading text-4xl text-primary mb-2">
              {findings.filter(f => f.severity === 'High').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">High Severity</div>
          </div>
          <div className="border-2 border-deepbrown p-6">
            <div className="font-heading text-4xl text-deepbrown mb-2">
              {findings.filter(f => f.severity === 'Medium').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Medium Severity</div>
          </div>
          <div className="border-2 border-secondary-foreground/30 p-6">
            <div className="font-heading text-4xl text-secondary-foreground mb-2">
              {findings.filter(f => f.severity === 'Low').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Low Severity</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="border border-deepbrown/20 p-6 mb-8 bg-secondary">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-xl text-foreground">Filter Findings</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 font-paragraph text-sm text-primary hover:text-deepbrown transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Severity Filter */}
            <div>
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-deepbrown/20 bg-secondary font-paragraph text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">All Severities</option>
                {severities.map(sev => (
                  <option key={sev} value={sev}>{sev}</option>
                ))}
              </select>
            </div>

            {/* Repository Filter */}
            <div>
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">Repository</label>
              <select
                value={repositoryFilter}
                onChange={(e) => setRepositoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-deepbrown/20 bg-secondary font-paragraph text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">All Repositories</option>
                {uniqueRepositories.map(repo => (
                  <option key={repo} value={repo}>{repo}</option>
                ))}
              </select>
            </div>

            {/* Scanner Filter */}
            <div>
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">Scanner</label>
              <select
                value={scannerFilter}
                onChange={(e) => setScannerFilter(e.target.value)}
                className="w-full px-4 py-2 border border-deepbrown/20 bg-secondary font-paragraph text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">All Scanners</option>
                {uniqueScanners.map(scanner => (
                  <option key={scanner} value={scanner}>{scanner}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-deepbrown/20 bg-secondary font-paragraph text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="font-paragraph text-sm text-secondary-foreground">
            Showing <span className="font-semibold text-foreground">{filteredFindings.length}</span> of <span className="font-semibold text-foreground">{findings.length}</span> findings
          </p>
        </div>

        {/* Findings Table */}
        <div className="border border-deepbrown/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary">
                <tr>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Title</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Severity</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Repository</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Scanner</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Detection Date</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-secondary-foreground">
                      Loading findings...
                    </td>
                  </tr>
                ) : filteredFindings.length > 0 ? (
                  filteredFindings.map((finding, index) => (
                    <motion.tr
                      key={finding._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-deepbrown/20 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-5 h-5 ${getSeverityColor(finding.severity)}`} />
                          <span className="font-heading text-base text-foreground">{finding.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 border ${getSeverityBorderColor(finding.severity)} ${getSeverityColor(finding.severity)}`}>
                          <span className="font-paragraph text-sm font-semibold">{finding.severity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{finding.repositoryName}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{finding.scanner}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`font-paragraph text-sm font-semibold ${getRemediationColor(finding.remediationStatus)}`}>
                          {finding.remediationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">
                          {finding.detectionDate ? format(new Date(finding.detectionDate), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          to={`/findings/${finding._id}`}
                          className="font-paragraph text-sm text-primary hover:text-deepbrown transition-colors"
                        >
                          Investigate
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Shield className="w-12 h-12 text-secondary-foreground/30 mx-auto mb-4" />
                      <p className="font-paragraph text-base text-secondary-foreground mb-4">
                        {hasActiveFilters ? 'No findings match your filters.' : 'No security findings detected. Run a scan to analyze source code.'}
                      </p>
                      {!hasActiveFilters && (
                        <Link
                          to="/repositories"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-paragraph text-sm hover:bg-deepbrown transition-colors"
                        >
                          Scan a Repository
                        </Link>
                      )}
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
