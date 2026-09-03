import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Calendar, GitBranch, Shield, FileText, Code, Zap, Wrench, Lightbulb } from 'lucide-react';
import { BaseCrudService } from '@/services/storage';
import { SecurityFindings } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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

export default function FindingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [finding, setFinding] = useState<ExtendedFinding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadFinding();
    }
  }, [id]);

  const loadFinding = async () => {
    setIsLoading(true);
    try {
      const data = await BaseCrudService.getById<SecurityFindings>('securityfindings', id!);
      setFinding(data as ExtendedFinding);
    } catch (error) {
      console.error('Failed to load finding:', error);
      setFinding(null);
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

  const getSeverityBgColor = (severity?: string) => {
    switch (severity) {
      case 'Critical': return 'bg-destructive';
      case 'High': return 'bg-primary';
      case 'Medium': return 'bg-deepbrown';
      case 'Low': return 'bg-secondary-foreground';
      default: return 'bg-deepbrown';
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
        <Link 
          to="/findings"
          className="inline-flex items-center gap-2 font-paragraph text-base text-primary hover:text-deepbrown transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Findings
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : !finding ? (
          <div className="text-center py-20">
            <h2 className="font-heading text-3xl text-foreground mb-4">Finding Not Found</h2>
            <p className="font-paragraph text-base text-secondary-foreground">
              The security finding you're looking for doesn't exist.
            </p>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex items-start justify-between mb-6 flex-col md:flex-row gap-6">
                <div className="flex items-center gap-4">
                  <AlertTriangle className={`w-12 h-12 ${getSeverityColor(finding.severity)}`} />
                  <div>
                    <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-2">
                      {finding.title}
                    </h1>
                    <p className="font-paragraph text-base text-secondary-foreground font-mono">
                      {finding.cweCveId}
                    </p>
                  </div>
                </div>
                
                <div className={`${getSeverityBgColor(finding.severity)} px-6 py-3 whitespace-nowrap`}>
                  <span className="font-heading text-xl text-primary-foreground">{finding.severity}</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="border-2 border-primary p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <GitBranch className="w-6 h-6 text-primary" />
                  <h3 className="font-heading text-lg text-foreground">Repository</h3>
                </div>
                <p className="font-paragraph text-xl text-secondary-foreground">{finding.repositoryName}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="border-2 border-deepbrown p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-deepbrown" />
                  <h3 className="font-heading text-lg text-foreground">Remediation Status</h3>
                </div>
                <p className={`font-paragraph text-xl font-semibold ${getRemediationColor(finding.remediationStatus)}`}>
                  {finding.remediationStatus}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="border-2 border-primary p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h3 className="font-heading text-lg text-foreground">Detection Date</h3>
                </div>
                <p className="font-paragraph text-xl text-secondary-foreground">
                  {finding.detectionDate ? format(new Date(finding.detectionDate), 'MMM dd, yyyy') : 'N/A'}
                </p>
                {finding.detectionDate && (
                  <p className="font-paragraph text-sm text-secondary-foreground/70 mt-1">
                    {format(new Date(finding.detectionDate), 'HH:mm:ss')}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Description */}
            <div className="bg-primary p-8 md:p-12 mb-12">
              <h2 className="font-heading text-3xl text-primary-foreground mb-6">Description</h2>
              <p className="font-paragraph text-lg text-primary-foreground leading-relaxed">
                {finding.description}
              </p>
            </div>

            {/* File Location */}
            {finding.filePath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="border-2 border-deepbrown/30 p-8 mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Code className="w-6 h-6 text-deepbrown" />
                  <h2 className="font-heading text-2xl text-foreground">File Location</h2>
                </div>
                <div className="bg-foreground/5 p-4 font-mono text-sm text-foreground">
                  <p>{finding.filePath}</p>
                  {finding.lineNumber && (
                    <p className="text-secondary-foreground mt-2">Line: {finding.lineNumber}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Vulnerability Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="border border-deepbrown/20 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                  <h2 className="font-heading text-2xl text-foreground">Vulnerability Details</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-deepbrown/20">
                    <span className="font-paragraph text-base text-secondary-foreground">Severity Level</span>
                    <span className={`font-paragraph text-base font-semibold ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-deepbrown/20">
                    <span className="font-paragraph text-base text-secondary-foreground">CWE/CVE ID</span>
                    <span className="font-paragraph text-base text-secondary-foreground font-mono">{finding.cweCveId}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-deepbrown/20">
                    <span className="font-paragraph text-base text-secondary-foreground">Scanner</span>
                    <span className="font-paragraph text-base text-secondary-foreground">{finding.scanner}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="font-paragraph text-base text-secondary-foreground">Detection Date</span>
                    <span className="font-paragraph text-base text-secondary-foreground">
                      {finding.detectionDate ? format(new Date(finding.detectionDate), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Evidence */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="border border-deepbrown/20 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-deepbrown" />
                  <h2 className="font-heading text-2xl text-foreground">Evidence</h2>
                </div>
                <div className="bg-foreground/5 p-4 font-mono text-sm text-foreground border border-deepbrown/20">
                  {finding.evidence}
                </div>
              </motion.div>
            </div>

            {/* Impact and Remediation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Impact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="border-2 border-destructive/30 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-destructive" />
                  <h2 className="font-heading text-2xl text-foreground">Impact</h2>
                </div>
                <p className="font-paragraph text-base text-secondary-foreground leading-relaxed">
                  {finding.impact}
                </p>
              </motion.div>

              {/* Remediation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="border-2 border-primary/30 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Wrench className="w-6 h-6 text-primary" />
                  <h2 className="font-heading text-2xl text-foreground">Remediation Steps</h2>
                </div>
                <p className="font-paragraph text-base text-secondary-foreground leading-relaxed">
                  {finding.remediation}
                </p>
              </motion.div>
            </div>

            {/* AI-Assisted Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="border-2 border-primary p-8 mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-6 h-6 text-primary" />
                <h2 className="font-heading text-2xl text-foreground">AI-Assisted Explanation</h2>
              </div>
              
              <div className="bg-primary/5 p-6 border border-primary/20">
                {finding.description ? (
                  <p className="font-paragraph text-base text-secondary-foreground leading-relaxed">
                    {finding.description}
                  </p>
                ) : (
                  <p className="font-paragraph text-base text-secondary-foreground/60 italic">
                    AI analysis not configured. Configure an AI API key in settings to enable detailed explanations.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/repositories"
                className="border-2 border-primary p-8 hover:bg-primary hover:text-primary-foreground transition-all group"
              >
                <GitBranch className="w-8 h-8 text-primary group-hover:text-primary-foreground mb-4" />
                <h3 className="font-heading text-xl text-foreground group-hover:text-primary-foreground mb-2">
                  View Repository
                </h3>
                <p className="font-paragraph text-sm text-secondary-foreground group-hover:text-primary-foreground">
                  See repository details and security status
                </p>
              </Link>

              <Link
                to="/findings"
                className="border-2 border-deepbrown p-8 hover:bg-deepbrown hover:text-primary-foreground transition-all group"
              >
                <AlertTriangle className="w-8 h-8 text-deepbrown group-hover:text-primary-foreground mb-4" />
                <h3 className="font-heading text-xl text-foreground group-hover:text-primary-foreground mb-2">
                  All Findings
                </h3>
                <p className="font-paragraph text-sm text-secondary-foreground group-hover:text-primary-foreground">
                  Browse all security findings
                </p>
              </Link>

              <Link
                to="/reports"
                className="border-2 border-primary p-8 hover:bg-primary hover:text-primary-foreground transition-all group"
              >
                <FileText className="w-8 h-8 text-primary group-hover:text-primary-foreground mb-4" />
                <h3 className="font-heading text-xl text-foreground group-hover:text-primary-foreground mb-2">
                  View Reports
                </h3>
                <p className="font-paragraph text-sm text-secondary-foreground group-hover:text-primary-foreground">
                  Access security reports and analytics
                </p>
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
