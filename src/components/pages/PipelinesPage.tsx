import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Pipelines } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipelines[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<Pipelines>('pipelines');
      setPipelines(result.items);
    } catch (error) {
      console.error('Failed to load pipelines:', error);
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

  const getStatusBorderColor = (status?: string) => {
    switch (status) {
      case 'Success': return 'border-secondary-foreground';
      case 'Failed': return 'border-destructive';
      case 'Running': return 'border-primary';
      default: return 'border-deepbrown';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Success': return <CheckCircle className="w-5 h-5" />;
      case 'Failed': return <XCircle className="w-5 h-5" />;
      case 'Running': return <Clock className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[600px]">
        <div className="mb-12">
          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">CI/CD Pipelines</h1>
          <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
            Monitor pipeline executions and security scan results across your development workflow.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="border-2 border-secondary-foreground p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {pipelines.filter(p => p.status === 'Success').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Successful</div>
          </div>
          <div className="border-2 border-destructive p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {pipelines.filter(p => p.status === 'Failed').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Failed</div>
          </div>
          <div className="border-2 border-primary p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {pipelines.filter(p => p.status === 'Running').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Running</div>
          </div>
          <div className="border-2 border-deepbrown p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {pipelines.length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Total Executions</div>
          </div>
        </div>

        {/* Pipelines Table */}
        <div className="border border-deepbrown/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary">
                <tr>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Pipeline</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Execution ID</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Repository</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Duration</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Start Time</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? null : pipelines.length > 0 ? (
                  pipelines.map((pipeline, index) => (
                    <motion.tr
                      key={pipeline._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-deepbrown/20 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-primary" />
                          <span className="font-heading text-base text-foreground">{pipeline.pipelineName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground font-mono">{pipeline.executionId}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{pipeline.repositoryName}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 border ${getStatusBorderColor(pipeline.status)} ${getStatusColor(pipeline.status)}`}>
                          {getStatusIcon(pipeline.status)}
                          <span className="font-paragraph text-sm font-semibold">{pipeline.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{pipeline.duration}s</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">
                          {pipeline.startTime ? format(new Date(pipeline.startTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          to={`/pipelines/${pipeline._id}`}
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
                      <p className="font-paragraph text-base text-secondary-foreground">No pipeline executions found</p>
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
