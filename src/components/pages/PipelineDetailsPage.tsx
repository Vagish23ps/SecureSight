import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, Clock, Calendar, GitBranch, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BaseCrudService } from '@/services/storage';
import { Pipelines, SecurityFindings } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { countSeverities } from '@/lib/risk-engine';
import { SecurityGateService } from '@/lib/security-gate';

interface PipelineStage {
  name: string;
  status: 'Success' | 'Failed' | 'Running' | 'Pending';
  duration: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  details?: string;
}

export default function PipelineDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [pipeline, setPipeline] = useState<Pipelines | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPipeline();
    }
  }, [id]);

  const loadPipeline = async () => {
    setIsLoading(true);
    try {
      const data = await BaseCrudService.getById<Pipelines>('pipelines', id!);
      setPipeline(data);

      if (data) {
        // Load actual findings for this pipeline's target repository
        const findingsResult = await BaseCrudService.getAll<SecurityFindings>('securityfindings');
        const repoFindings = (findingsResult.items || []).filter(
          f => !data.repositoryName || f.repositoryName === data.repositoryName
        );
        const counts = countSeverities(repoFindings);
        const gateResult = SecurityGateService.evaluate(repoFindings);

        const dynamicStages: PipelineStage[] = [
          {
            name: 'Source Checkout',
            status: 'Success',
            duration: 5,
            findings: { critical: 0, high: 0, medium: 0, low: 0 },
            details: `Source code workspace checked out for repository: ${data.repositoryName || 'default'}`
          },
          {
            name: 'SAST Security Scan',
            status: counts.critical > 0 ? 'Failed' : 'Success',
            duration: data.duration ? Math.max(1, Math.round(data.duration * 0.4)) : 15,
            findings: counts,
            details: repoFindings.length > 0 
              ? `SAST analysis completed: ${repoFindings.length} real finding(s) detected (${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low)`
              : 'SAST analysis completed: 0 vulnerabilities found.'
          },
          {
            name: 'Security Gate Evaluation',
            status: gateResult.passed ? 'Success' : 'Failed',
            duration: 2,
            findings: { critical: 0, high: 0, medium: 0, low: 0 },
            details: gateResult.message
          },
          {
            name: 'Artifact Packaging',
            status: data.status === 'Success' ? 'Success' : (data.status === 'Running' ? 'Running' : 'Failed'),
            duration: data.duration ? Math.max(1, Math.round(data.duration * 0.5)) : 20,
            findings: { critical: 0, high: 0, medium: 0, low: 0 },
            details: 'Build artifact compiled and packaged for deployment'
          }
        ];

        setStages(dynamicStages);
      }
    } catch (error) {
      console.error('Failed to load pipeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Success': return 'text-secondary-foreground';
      case 'Failed': return 'text-destructive';
      case 'Running': return 'text-primary';
      default: return 'text-deepbrown';
    }
  };

  const getStatusBgColor = (status?: string) => {
    switch (status) {
      case 'Success': return 'bg-secondary-foreground';
      case 'Failed': return 'bg-destructive';
      case 'Running': return 'bg-primary';
      default: return 'bg-deepbrown';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Success': return <CheckCircle className="w-8 h-8 text-primary-foreground" />;
      case 'Failed': return <XCircle className="w-8 h-8 text-primary-foreground" />;
      case 'Running': return <Clock className="w-8 h-8 text-primary-foreground" />;
      default: return <Activity className="w-8 h-8 text-primary-foreground" />;
    }
  };

  const getStageBgColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-50 border-green-200';
      case 'Failed': return 'bg-red-50 border-red-200';
      case 'Running': return 'bg-blue-50 border-blue-200';
      case 'Pending': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-green-700';
      case 'Failed': return 'text-red-700';
      case 'Running': return 'text-blue-700';
      case 'Pending': return 'text-gray-700';
      default: return 'text-gray-700';
    }
  };

  const getStageStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Running': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-50';
      case 'high': return 'text-orange-700 bg-orange-50';
      case 'medium': return 'text-yellow-700 bg-yellow-50';
      case 'low': return 'text-blue-700 bg-blue-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[600px]">
        <Link 
          to="/pipelines"
          className="inline-flex items-center gap-2 font-paragraph text-base text-primary hover:text-deepbrown transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipelines
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : !pipeline ? (
          <div className="text-center py-20">
            <h2 className="font-heading text-3xl text-foreground mb-4">Pipeline Not Found</h2>
            <p className="font-paragraph text-base text-secondary-foreground">
              The pipeline execution you're looking for doesn't exist.
            </p>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Activity className="w-12 h-12 text-primary" />
                  <div>
                    <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-2">
                      {pipeline.pipelineName}
                    </h1>
                    <p className="font-paragraph text-base text-secondary-foreground font-mono">
                      Execution ID: {pipeline.executionId}
                    </p>
                  </div>
                </div>
                
                <div className={`${getStatusBgColor(pipeline.status)} px-6 py-3 flex items-center gap-3`}>
                  {getStatusIcon(pipeline.status)}
                  <span className="font-heading text-xl text-primary-foreground">{pipeline.status}</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                <p className="font-paragraph text-xl text-secondary-foreground">{pipeline.repositoryName}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="border-2 border-deepbrown p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-deepbrown" />
                  <h3 className="font-heading text-lg text-foreground">Duration</h3>
                </div>
                <p className="font-paragraph text-xl text-secondary-foreground">{pipeline.duration} seconds</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="border-2 border-primary p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h3 className="font-heading text-lg text-foreground">Start Time</h3>
                </div>
                <p className="font-paragraph text-xl text-secondary-foreground">
                  {pipeline.startTime ? format(new Date(pipeline.startTime), 'MMM dd, yyyy') : 'N/A'}
                </p>
                {pipeline.startTime && (
                  <p className="font-paragraph text-sm text-secondary-foreground/70 mt-1">
                    {format(new Date(pipeline.startTime), 'HH:mm:ss')}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="border-2 border-deepbrown p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-deepbrown" />
                  <h3 className="font-heading text-lg text-foreground">End Time</h3>
                </div>
                <p className="font-paragraph text-xl text-secondary-foreground">
                  {pipeline.endTime ? format(new Date(pipeline.endTime), 'MMM dd, yyyy') : 'N/A'}
                </p>
                {pipeline.endTime && (
                  <p className="font-paragraph text-sm text-secondary-foreground/70 mt-1">
                    {format(new Date(pipeline.endTime), 'HH:mm:ss')}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Execution Details */}
            <div className="bg-primary p-8 md:p-12 mb-12">
              <h2 className="font-heading text-3xl text-primary-foreground mb-8">Execution Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-primary-foreground/20">
                  <span className="font-paragraph text-base text-primary-foreground">Pipeline Name</span>
                  <span className="font-paragraph text-base text-primary-foreground font-semibold">{pipeline.pipelineName}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-primary-foreground/20">
                  <span className="font-paragraph text-base text-primary-foreground">Execution ID</span>
                  <span className="font-paragraph text-base text-primary-foreground font-mono">{pipeline.executionId}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-primary-foreground/20">
                  <span className="font-paragraph text-base text-primary-foreground">Repository</span>
                  <span className="font-paragraph text-base text-primary-foreground">{pipeline.repositoryName}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-primary-foreground/20">
                  <span className="font-paragraph text-base text-primary-foreground">Status</span>
                  <span className={`font-paragraph text-base font-semibold ${getStatusColor(pipeline.status)}`}>
                    {pipeline.status}
                  </span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="font-paragraph text-base text-primary-foreground">Duration</span>
                  <span className="font-paragraph text-base text-primary-foreground">{pipeline.duration} seconds</span>
                </div>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="mb-12">
              <h2 className="font-heading text-3xl text-foreground mb-8">Pipeline Stages</h2>
              
              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-2 ${getStageBgColor(stage.status)} p-6 cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => setExpandedStage(expandedStage === stage.name ? null : stage.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {stage.status === 'Success' && <CheckCircle className={`w-6 h-6 ${getStageStatusColor(stage.status)}`} />}
                          {stage.status === 'Failed' && <XCircle className={`w-6 h-6 ${getStageStatusColor(stage.status)}`} />}
                          {stage.status === 'Running' && <Clock className={`w-6 h-6 ${getStageStatusColor(stage.status)}`} />}
                          {stage.status === 'Pending' && <AlertCircle className={`w-6 h-6 ${getStageStatusColor(stage.status)}`} />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-heading text-xl text-foreground mb-2">{stage.name}</h3>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className={`font-paragraph text-sm px-3 py-1 rounded ${getStageStatusBadgeColor(stage.status)}`}>
                              {stage.status}
                            </span>
                            <span className="font-paragraph text-sm text-secondary-foreground flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {stage.duration}s
                            </span>
                            {(stage.findings.critical > 0 || stage.findings.high > 0 || stage.findings.medium > 0 || stage.findings.low > 0) && (
                              <span className="font-paragraph text-sm text-secondary-foreground">
                                {stage.findings.critical + stage.findings.high + stage.findings.medium + stage.findings.low} findings
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        {expandedStage === stage.name ? (
                          <ChevronUp className="w-6 h-6 text-secondary-foreground" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-secondary-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedStage === stage.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-6 border-t border-current border-opacity-20"
                      >
                        {stage.details && (
                          <div className="mb-6">
                            <h4 className="font-heading text-lg text-foreground mb-2">Details</h4>
                            <p className="font-paragraph text-base text-secondary-foreground">{stage.details}</p>
                          </div>
                        )}

                        {(stage.findings.critical > 0 || stage.findings.high > 0 || stage.findings.medium > 0 || stage.findings.low > 0) && (
                          <div>
                            <h4 className="font-heading text-lg text-foreground mb-4">Findings by Severity</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {stage.findings.critical > 0 && (
                                <div className={`p-4 rounded ${getSeverityColor('critical')}`}>
                                  <p className="font-heading text-2xl font-bold">{stage.findings.critical}</p>
                                  <p className="font-paragraph text-sm">Critical</p>
                                </div>
                              )}
                              {stage.findings.high > 0 && (
                                <div className={`p-4 rounded ${getSeverityColor('high')}`}>
                                  <p className="font-heading text-2xl font-bold">{stage.findings.high}</p>
                                  <p className="font-paragraph text-sm">High</p>
                                </div>
                              )}
                              {stage.findings.medium > 0 && (
                                <div className={`p-4 rounded ${getSeverityColor('medium')}`}>
                                  <p className="font-heading text-2xl font-bold">{stage.findings.medium}</p>
                                  <p className="font-paragraph text-sm">Medium</p>
                                </div>
                              )}
                              {stage.findings.low > 0 && (
                                <div className={`p-4 rounded ${getSeverityColor('low')}`}>
                                  <p className="font-heading text-2xl font-bold">{stage.findings.low}</p>
                                  <p className="font-paragraph text-sm">Low</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-12">
              <h2 className="font-heading text-3xl text-foreground mb-8">Execution Timeline</h2>
              
              <div className="border-l-2 border-primary pl-8 space-y-8">
                {pipeline.startTime && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    <div className="absolute -left-[37px] w-6 h-6 rounded-full bg-primary border-4 border-secondary"></div>
                    <div className="border border-deepbrown/20 p-6">
                      <h3 className="font-heading text-xl text-foreground mb-2">Pipeline Started</h3>
                      <p className="font-paragraph text-base text-secondary-foreground">
                        {format(new Date(pipeline.startTime), 'MMMM dd, yyyy - HH:mm:ss')}
                      </p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-[37px] w-6 h-6 rounded-full bg-deepbrown border-4 border-secondary"></div>
                  <div className="border border-deepbrown/20 p-6">
                    <h3 className="font-heading text-xl text-foreground mb-2">Security Scan Executed</h3>
                    <p className="font-paragraph text-base text-secondary-foreground">
                      Automated security scanning completed for {pipeline.repositoryName}
                    </p>
                  </div>
                </motion.div>

                {pipeline.endTime && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="relative"
                  >
                    <div className={`absolute -left-[37px] w-6 h-6 rounded-full ${getStatusBgColor(pipeline.status)} border-4 border-secondary`}></div>
                    <div className="border border-deepbrown/20 p-6">
                      <h3 className="font-heading text-xl text-foreground mb-2">Pipeline Completed</h3>
                      <p className="font-paragraph text-base text-secondary-foreground">
                        {format(new Date(pipeline.endTime), 'MMMM dd, yyyy - HH:mm:ss')}
                      </p>
                      <p className={`font-paragraph text-base font-semibold mt-2 ${getStatusColor(pipeline.status)}`}>
                        Status: {pipeline.status}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                to="/scans"
                className="border-2 border-deepbrown p-8 hover:bg-deepbrown hover:text-primary-foreground transition-all group"
              >
                <Activity className="w-8 h-8 text-deepbrown group-hover:text-primary-foreground mb-4" />
                <h3 className="font-heading text-xl text-foreground group-hover:text-primary-foreground mb-2">
                  View Scans
                </h3>
                <p className="font-paragraph text-sm text-secondary-foreground group-hover:text-primary-foreground">
                  Review all security scan results
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
