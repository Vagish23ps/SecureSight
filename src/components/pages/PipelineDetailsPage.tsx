import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, Clock, Calendar, GitBranch, CheckCircle, XCircle } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Pipelines } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

export default function PipelineDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [pipeline, setPipeline] = useState<Pipelines | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
