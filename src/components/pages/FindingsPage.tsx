import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { SecurityFindings } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

export default function FindingsPage() {
  const [findings, setFindings] = useState<SecurityFindings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<SecurityFindings>('securityfindings');
      setFindings(result.items);
    } catch (error) {
      console.error('Failed to load findings:', error);
    } finally {
      setIsLoading(false);
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

  const getRemediationColor = (status?: string) => {
    switch (status) {
      case 'Fixed': return 'text-secondary-foreground';
      case 'In Progress': return 'text-primary';
      case 'Open': return 'text-destructive';
      default: return 'text-deepbrown';
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[600px]">
        <div className="mb-12">
          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Security Findings</h1>
          <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
            Track and manage security vulnerabilities detected across your repositories.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="border-2 border-destructive p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {findings.filter(f => f.severity === 'Critical').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Critical</div>
          </div>
          <div className="border-2 border-primary p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {findings.filter(f => f.severity === 'High').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">High</div>
          </div>
          <div className="border-2 border-deepbrown p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {findings.filter(f => f.severity === 'Medium').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Medium</div>
          </div>
          <div className="border-2 border-secondary-foreground/30 p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {findings.filter(f => f.severity === 'Low').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Low</div>
          </div>
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
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">CWE/CVE ID</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Detection Date</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? null : findings.length > 0 ? (
                  findings.map((finding, index) => (
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
                        <span className="font-paragraph text-sm text-secondary-foreground font-mono">{finding.cweCveId}</span>
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
                          View Details
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Shield className="w-12 h-12 text-secondary-foreground/30 mx-auto mb-4" />
                      <p className="font-paragraph text-base text-secondary-foreground">No security findings detected</p>
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
