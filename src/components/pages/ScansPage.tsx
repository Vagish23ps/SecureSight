import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BaseCrudService } from '@/services/storage';
import { ScanHistory } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

export default function ScansPage() {
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<ScanHistory>('scanhistory');
      setScans(result.items);
    } catch (error) {
      console.error('Failed to load scans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed': return 'text-secondary-foreground';
      case 'Failed': return 'text-destructive';
      case 'Running': return 'text-primary';
      default: return 'text-deepbrown';
    }
  };

  const getStatusBorderColor = (status?: string) => {
    switch (status) {
      case 'Completed': return 'border-secondary-foreground';
      case 'Failed': return 'border-destructive';
      case 'Running': return 'border-primary';
      default: return 'border-deepbrown';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-5 h-5" />;
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
          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Scan History</h1>
          <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
            Review all security scans executed across your repositories and their results.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="border-2 border-secondary-foreground p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {scans.filter(s => s.status === 'Completed').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Completed</div>
          </div>
          <div className="border-2 border-destructive p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {scans.filter(s => s.status === 'Failed').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Failed</div>
          </div>
          <div className="border-2 border-primary p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {scans.filter(s => s.status === 'Running').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Running</div>
          </div>
          <div className="border-2 border-deepbrown p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {scans.reduce((sum, scan) => sum + (scan.totalFindings || 0), 0)}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Total Findings</div>
          </div>
        </div>

        {/* Scans Table */}
        <div className="border border-deepbrown/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary">
                <tr>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Target</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Scan Type</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Findings</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Duration</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Execution Date</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? null : scans.length > 0 ? (
                  scans.map((scan, index) => (
                    <motion.tr
                      key={scan._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-deepbrown/20 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-primary" />
                          <span className="font-heading text-base text-foreground">{scan.scannedTarget}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{scan.scanType}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 border ${getStatusBorderColor(scan.status)} ${getStatusColor(scan.status)}`}>
                          {getStatusIcon(scan.status)}
                          <span className="font-paragraph text-sm font-semibold">{scan.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{scan.totalFindings || 0}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{scan.durationSeconds}s</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">
                          {scan.executionDateTime ? format(new Date(scan.executionDateTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          to={`/scans/${scan._id}`}
                          className="font-paragraph text-sm text-primary hover:text-deepbrown transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Clock className="w-12 h-12 text-secondary-foreground/30 mx-auto mb-4" />
                      <h3 className="font-heading text-xl text-foreground mb-2">No scan history recorded</h3>
                      <p className="font-paragraph text-sm text-secondary-foreground mb-6">
                        No repository security scans have been executed yet.
                      </p>
                      <Link
                        to="/repositories"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-paragraph text-sm font-semibold hover:bg-deepbrown transition-colors"
                      >
                        Scan a GitHub Repository
                      </Link>
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
