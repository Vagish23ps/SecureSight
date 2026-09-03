import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink, Calendar } from 'lucide-react';
import { BaseCrudService } from '@/services/storage';
import { Reports } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

export default function ReportsPage() {
  const [reports, setReports] = useState<Reports[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<Reports>('reports');
      setReports(result.items);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Generated': return 'text-secondary-foreground';
      case 'Failed': return 'text-destructive';
      case 'Generating': return 'text-primary';
      default: return 'text-deepbrown';
    }
  };

  const getStatusBorderColor = (status?: string) => {
    switch (status) {
      case 'Generated': return 'border-secondary-foreground';
      case 'Failed': return 'border-destructive';
      case 'Generating': return 'border-primary';
      default: return 'border-deepbrown';
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[600px]">
        <div className="mb-12">
          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Security Reports</h1>
          <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
            Access comprehensive security reports and analytics for your development infrastructure.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="border-2 border-secondary-foreground p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {reports.filter(r => r.reportStatus === 'Generated').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Generated</div>
          </div>
          <div className="border-2 border-primary p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {reports.filter(r => r.reportStatus === 'Generating').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Generating</div>
          </div>
          <div className="border-2 border-destructive p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {reports.filter(r => r.reportStatus === 'Failed').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Failed</div>
          </div>
          <div className="border-2 border-deepbrown p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {reports.length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Total Reports</div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? null : reports.length > 0 ? (
            reports.map((report, index) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border border-deepbrown/20 p-8 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-heading text-2xl text-foreground mb-1">{report.reportTitle}</h3>
                      <p className="font-paragraph text-sm text-secondary-foreground">{report.reportType}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 border ${getStatusBorderColor(report.reportStatus)} ${getStatusColor(report.reportStatus)}`}>
                    <span className="font-paragraph text-xs font-semibold">{report.reportStatus}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-paragraph text-sm">
                      Generated: {report.generationDate ? format(new Date(report.generationDate), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>

                {report.reportUrl && report.reportStatus === 'Generated' && (
                  <div className="flex gap-3">
                    <a
                      href={report.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-paragraph text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Report
                    </a>
                    <a
                      href={report.reportUrl}
                      download
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-deepbrown text-deepbrown font-paragraph text-sm hover:bg-deepbrown hover:text-primary-foreground transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 border border-deepbrown/20 p-12 text-center">
              <FileText className="w-12 h-12 text-secondary-foreground/30 mx-auto mb-4" />
              <p className="font-paragraph text-base text-secondary-foreground">No reports available</p>
            </div>
          )}
        </div>

        {/* Report Types Info */}
        <div className="mt-16">
          <h2 className="font-heading text-3xl text-foreground mb-8">Available Report Types</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-primary p-8"
            >
              <FileText className="w-8 h-8 text-primary-foreground mb-4" />
              <h3 className="font-heading text-xl text-primary-foreground mb-3">Vulnerability Report</h3>
              <p className="font-paragraph text-sm text-primary-foreground">
                Comprehensive analysis of all security vulnerabilities detected across repositories.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-deepbrown p-8"
            >
              <FileText className="w-8 h-8 text-primary-foreground mb-4" />
              <h3 className="font-heading text-xl text-primary-foreground mb-3">Compliance Report</h3>
              <p className="font-paragraph text-sm text-primary-foreground">
                Security compliance status and adherence to industry standards and best practices.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-primary p-8"
            >
              <FileText className="w-8 h-8 text-primary-foreground mb-4" />
              <h3 className="font-heading text-xl text-primary-foreground mb-3">Trend Analysis</h3>
              <p className="font-paragraph text-sm text-primary-foreground">
                Historical security trends and patterns across your development pipeline.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
