import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, AlertTriangle, CheckCircle, ExternalLink, ArrowLeft, Calendar, User } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Repositories } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';

export default function RepositoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [repository, setRepository] = useState<Repositories | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRepository();
    }
  }, [id]);

  const loadRepository = async () => {
    setIsLoading(true);
    try {
      const data = await BaseCrudService.getById<Repositories>('repositories', id!);
      setRepository(data);
    } catch (error) {
      console.error('Failed to load repository:', error);
    } finally {
      setIsLoading(false);
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

  const getRiskBgColor = (risk?: string) => {
    switch (risk) {
      case 'Critical': return 'bg-destructive';
      case 'High': return 'bg-primary';
      case 'Medium': return 'bg-deepbrown';
      case 'Low': return 'bg-secondary-foreground';
      default: return 'bg-deepbrown';
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[600px]">
        <Link 
          to="/repositories"
          className="inline-flex items-center gap-2 font-paragraph text-base text-primary hover:text-deepbrown transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Repositories
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : !repository ? (
          <div className="text-center py-20">
            <h2 className="font-heading text-3xl text-foreground mb-4">Repository Not Found</h2>
            <p className="font-paragraph text-base text-secondary-foreground">
              The repository you're looking for doesn't exist.
            </p>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <GitBranch className="w-12 h-12 text-primary" />
                  <div>
                    <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-2">
                      {repository.repositoryName}
                    </h1>
                    {repository.repositoryUrl && (
                      <a 
                        href={repository.repositoryUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-paragraph text-base text-primary hover:text-deepbrown transition-colors inline-flex items-center gap-2"
                      >
                        View on GitHub <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                
                <div className={`${getRiskBgColor(repository.riskLevel)} px-6 py-3`}>
                  <span className="font-heading text-xl text-primary-foreground">{repository.riskLevel} Risk</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="border-2 border-primary p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-6 h-6 text-primary" />
                  <h3 className="font-heading text-lg text-foreground">Owner</h3>
                </div>
                <p className="font-paragraph text-2xl text-secondary-foreground">{repository.owner}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="border-2 border-deepbrown p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  {repository.riskLevel === 'Low' ? (
                    <CheckCircle className="w-6 h-6 text-secondary-foreground" />
                  ) : (
                    <AlertTriangle className={`w-6 h-6 ${getRiskColor(repository.riskLevel)}`} />
                  )}
                  <h3 className="font-heading text-lg text-foreground">Security Status</h3>
                </div>
                <p className="font-paragraph text-2xl text-secondary-foreground">{repository.securityStatus}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="border-2 border-primary p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h3 className="font-heading text-lg text-foreground">Last Scanned</h3>
                </div>
                <p className="font-paragraph text-2xl text-secondary-foreground">
                  {repository.lastScannedDate ? format(new Date(repository.lastScannedDate), 'MMM dd, yyyy') : 'Never'}
                </p>
                {repository.lastScannedDate && (
                  <p className="font-paragraph text-sm text-secondary-foreground/70 mt-1">
                    {format(new Date(repository.lastScannedDate), 'HH:mm:ss')}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Security Overview */}
            <div className="bg-primary p-8 md:p-12 mb-12">
              <h2 className="font-heading text-3xl text-primary-foreground mb-8">Security Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-heading text-xl text-primary-foreground mb-4">Risk Assessment</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-primary-foreground/20">
                      <span className="font-paragraph text-base text-primary-foreground">Risk Level</span>
                      <span className={`font-paragraph text-base font-semibold ${getRiskColor(repository.riskLevel)}`}>
                        {repository.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-primary-foreground/20">
                      <span className="font-paragraph text-base text-primary-foreground">Security Status</span>
                      <span className="font-paragraph text-base text-primary-foreground">{repository.securityStatus}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-xl text-primary-foreground mb-4">Repository Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-primary-foreground/20">
                      <span className="font-paragraph text-base text-primary-foreground">Owner</span>
                      <span className="font-paragraph text-base text-primary-foreground">{repository.owner}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-primary-foreground/20">
                      <span className="font-paragraph text-base text-primary-foreground">Repository Name</span>
                      <span className="font-paragraph text-base text-primary-foreground">{repository.repositoryName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/findings"
                className="border-2 border-deepbrown p-8 hover:bg-deepbrown hover:text-primary-foreground transition-all group"
              >
                <AlertTriangle className="w-8 h-8 text-deepbrown group-hover:text-primary-foreground mb-4" />
                <h3 className="font-heading text-xl text-foreground group-hover:text-primary-foreground mb-2">
                  View Findings
                </h3>
                <p className="font-paragraph text-sm text-secondary-foreground group-hover:text-primary-foreground">
                  See all security findings for this repository
                </p>
              </Link>

              <Link
                to="/scans"
                className="border-2 border-primary p-8 hover:bg-primary hover:text-primary-foreground transition-all group"
              >
                <Calendar className="w-8 h-8 text-primary group-hover:text-primary-foreground mb-4" />
                <h3 className="font-heading text-xl text-foreground group-hover:text-primary-foreground mb-2">
                  Scan History
                </h3>
                <p className="font-paragraph text-sm text-secondary-foreground group-hover:text-primary-foreground">
                  Review past security scans
                </p>
              </Link>

              <Link
                to="/pipelines"
                className="border-2 border-deepbrown p-8 hover:bg-deepbrown hover:text-primary-foreground transition-all group"
              >
                <GitBranch className="w-8 h-8 text-deepbrown group-hover:text-primary-foreground mb-4" />
                <h3 className="font-heading text-xl text-foreground group-hover:text-primary-foreground mb-2">
                  Pipeline Activity
                </h3>
                <p className="font-paragraph text-sm text-secondary-foreground group-hover:text-primary-foreground">
                  View CI/CD pipeline executions
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
