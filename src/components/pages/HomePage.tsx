// HPI 1.7-V
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, GitBranch, FileText, Activity, ArrowRight } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Repositories, SecurityFindings, Pipelines, ScanHistory } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalRepos: 0,
    criticalFindings: 0,
    activePipelines: 0,
    recentScans: 0,
    secureRepos: 0,
    mediumRiskRepos: 0,
    highRiskRepos: 0
  });
  const [recentFindings, setRecentFindings] = useState<SecurityFindings[]>([]);
  const [recentPipelines, setRecentPipelines] = useState<Pipelines[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Parallax setup
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const imageY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);
  const textY = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [reposResult, findingsResult, pipelinesResult, scansResult] = await Promise.all([
        BaseCrudService.getAll<Repositories>('repositories'),
        BaseCrudService.getAll<SecurityFindings>('securityfindings', {}, { limit: 5 }),
        BaseCrudService.getAll<Pipelines>('pipelines', {}, { limit: 5 }),
        BaseCrudService.getAll<ScanHistory>('scanhistory')
      ]);

      const repos = reposResult.items;
      const criticalCount = findingsResult.items.filter(f => f.severity === 'Critical').length;
      const activeCount = pipelinesResult.items.filter(p => p.status === 'Running').length;
      
      const secureCount = repos.filter(r => r.riskLevel === 'Low').length;
      const mediumCount = repos.filter(r => r.riskLevel === 'Medium').length;
      const highCount = repos.filter(r => r.riskLevel === 'High' || r.riskLevel === 'Critical').length;

      setStats({
        totalRepos: repos.length,
        criticalFindings: criticalCount,
        activePipelines: activeCount,
        recentScans: scansResult.items.length,
        secureRepos: secureCount,
        mediumRiskRepos: mediumCount,
        highRiskRepos: highCount
      });

      setRecentFindings(findingsResult.items);
      setRecentPipelines(pipelinesResult.items);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'Critical': return 'text-destructive';
      case 'High': return 'text-primary';
      case 'Medium': return 'text-deepbrown';
      case 'Low': return 'text-foreground/60';
      default: return 'text-foreground/60';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Success': return 'text-foreground/60';
      case 'Failed': return 'text-destructive';
      case 'Running': return 'text-primary';
      default: return 'text-deepbrown';
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-foreground selection:bg-primary selection:text-primary-foreground font-paragraph">
      <Header />
      
      <main className="w-full max-w-[120rem] mx-auto border-x border-deepbrown/20">
        
        {/* HERO SECTION - Editorial Split Layout */}
        <section ref={heroRef} className="relative w-full min-h-[90vh] grid grid-cols-1 lg:grid-cols-12 border-b border-deepbrown/20 overflow-clip">
          
          {/* Left Column: Typography & Space */}
          <div className="lg:col-span-6 relative flex flex-col justify-between p-8 md:p-16 lg:p-24 border-r border-deepbrown/20 bg-secondary z-10">
            <motion.div style={{ y: textY, opacity }} className="max-w-2xl">
              <h1 className="font-heading text-6xl md:text-7xl lg:text-[6.5rem] leading-[0.95] tracking-tight text-foreground mb-8">
                Secure Your<br />Development<br />Pipeline
              </h1>
              <Link 
                to="/repositories"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-semibold border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
              >
                View Repositories <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Bottom Left Text Block */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-24 max-w-sm"
            >
              <p className="text-sm leading-relaxed text-foreground/70">
                Comprehensive security monitoring and vulnerability management for modern DevSecOps teams. Grounded in precision, designed for clarity.
              </p>
            </motion.div>

            {/* Intersecting Image Motif (from inspiration) */}
            <div className="hidden lg:block absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-48 h-48 z-20 border border-deepbrown/20 bg-secondary p-2">
               <div className="w-full h-full relative overflow-hidden">
                  <Image 
                    src="https://static.wixstatic.com/media/e052fe_aa37364f85704f439a2916c99e4ae914~mv2.png?originWidth=960&originHeight=704"
                    alt="Security Texture"
                    className="w-full h-full object-cover grayscale opacity-80"
                  />
               </div>
            </div>
          </div>

          {/* Right Column: Full Bleed Image with Parallax */}
          <div className="lg:col-span-6 relative h-[50vh] lg:h-auto overflow-hidden bg-deepbrown">
            <motion.div style={{ y: imageY }} className="absolute inset-[-20%] w-[140%] h-[140%]">
              <Image 
                src="https://static.wixstatic.com/media/e052fe_581162904bc24db7949b303212835ae2~mv2.png?originWidth=960&originHeight=704"
                alt="Abstract Security Concept"
                className="w-full h-full object-cover opacity-90 mix-blend-luminosity"
              />
              {/* Warm overlay to match brand */}
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </motion.div>

            {/* Floating Stat Block */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute bottom-8 left-8 lg:bottom-16 lg:left-16 bg-secondary border border-deepbrown/20 p-6 max-w-xs backdrop-blur-sm bg-secondary/90"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-widest font-semibold">System Status</span>
              </div>
              <div className="font-heading text-4xl text-foreground mb-1">
                {isLoading ? '-' : stats.secureRepos}
              </div>
              <div className="text-sm text-foreground/70">Secure Repositories</div>
            </motion.div>
          </div>
        </section>

        {/* METRICS GRID - Hairline Structure */}
        <section ref={statsRef} className="w-full border-b border-deepbrown/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Active Repositories', value: stats.totalRepos, icon: GitBranch, color: 'text-foreground' },
              { label: 'Critical Findings', value: stats.criticalFindings, icon: AlertTriangle, color: 'text-destructive' },
              { label: 'Active Pipelines', value: stats.activePipelines, icon: Activity, color: 'text-primary' },
              { label: 'Recent Scans', value: stats.recentScans, icon: Clock, color: 'text-deepbrown' }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-deepbrown/20 last:border-r-0 flex flex-col justify-between min-h-[200px] group hover:bg-primary/5 transition-colors`}
              >
                <stat.icon className={`w-6 h-6 mb-8 ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                <div>
                  <div className="font-heading text-5xl text-foreground mb-2">
                    {isLoading ? '-' : stat.value}
                  </div>
                  <div className="text-sm uppercase tracking-wider text-foreground/60">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SPLIT CONTENT - Sticky Headers & Scrolling Lists */}
        <section ref={contentRef} className="w-full grid grid-cols-1 lg:grid-cols-2 border-b border-deepbrown/20">
          
          {/* Left: Security Findings */}
          <div className="border-r border-deepbrown/20 relative">
            <div className="sticky top-0 bg-secondary/95 backdrop-blur-md z-30 p-8 lg:p-12 border-b border-deepbrown/20 flex justify-between items-end">
              <div>
                <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-2">Security Findings</h2>
                <p className="text-sm text-foreground/60">Latest detected vulnerabilities</p>
              </div>
              <Link to="/findings" className="text-xs uppercase tracking-widest font-semibold hover:text-primary transition-colors">
                View All
              </Link>
            </div>
            
            <div className="p-8 lg:p-12 space-y-8">
              {isLoading ? (
                <div className="animate-pulse space-y-8 opacity-50">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-deepbrown/10 w-full"></div>
                  ))}
                </div>
              ) : recentFindings.length > 0 ? (
                recentFindings.map((finding, index) => (
                  <motion.div
                    key={finding._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link to={`/findings/${finding._id}`} className="block">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-heading text-xl text-foreground group-hover:text-primary transition-colors">
                          {finding.title}
                        </h3>
                        <span className={`text-xs uppercase tracking-wider font-semibold ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/70 mb-4 line-clamp-2 leading-relaxed">
                        {finding.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-foreground/50 uppercase tracking-wider">
                        <span>{finding.repositoryName}</span>
                        <span className="w-1 h-1 rounded-full bg-deepbrown/30"></span>
                        <span>{finding.cweCveId}</span>
                      </div>
                    </Link>
                    <div className="w-full h-px bg-deepbrown/10 mt-8 group-last:hidden"></div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-foreground/50 text-sm">
                  No recent findings. System is secure.
                </div>
              )}
            </div>
          </div>

          {/* Right: Pipeline Activity */}
          <div className="relative bg-secondary">
            <div className="sticky top-0 bg-secondary/95 backdrop-blur-md z-30 p-8 lg:p-12 border-b border-deepbrown/20 flex justify-between items-end">
              <div>
                <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-2">Pipeline Activity</h2>
                <p className="text-sm text-foreground/60">Recent execution status</p>
              </div>
              <Link to="/pipelines" className="text-xs uppercase tracking-widest font-semibold hover:text-primary transition-colors">
                View All
              </Link>
            </div>
            
            <div className="p-8 lg:p-12 space-y-8">
              {isLoading ? (
                <div className="animate-pulse space-y-8 opacity-50">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-deepbrown/10 w-full"></div>
                  ))}
                </div>
              ) : recentPipelines.length > 0 ? (
                recentPipelines.map((pipeline, index) => (
                  <motion.div
                    key={pipeline._id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link to={`/pipelines/${pipeline._id}`} className="block">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading text-lg text-foreground group-hover:text-primary transition-colors">
                          {pipeline.pipelineName}
                        </h3>
                        <span className={`text-xs uppercase tracking-wider font-semibold ${getStatusColor(pipeline.status)}`}>
                          {pipeline.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-foreground/60">
                        <span>{pipeline.repositoryName}</span>
                        <span>{pipeline.duration}s</span>
                      </div>
                    </Link>
                    <div className="w-full h-px bg-deepbrown/10 mt-8 group-last:hidden"></div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-foreground/50 text-sm">
                  No recent pipeline activity.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS - Large Editorial Blocks */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3">
          {[
            { title: 'Scan History', desc: 'Review all security scans and their results', icon: TrendingUp, link: '/scans' },
            { title: 'Reports', desc: 'Access comprehensive security analytics', icon: FileText, link: '/reports' },
            { title: 'Settings', desc: 'Configure dashboard preferences and policies', icon: Shield, link: '/settings' }
          ].map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="border-r border-deepbrown/20 last:border-r-0"
            >
              <Link 
                to={action.link}
                className="block p-12 lg:p-16 h-full group hover:bg-deepbrown hover:text-secondary transition-all duration-500"
              >
                <action.icon className="w-8 h-8 text-primary mb-8 group-hover:text-primary-foreground transition-colors duration-500" />
                <h3 className="font-heading text-3xl mb-4 group-hover:text-secondary transition-colors duration-500">
                  {action.title}
                </h3>
                <p className="text-sm text-foreground/60 group-hover:text-secondary/70 transition-colors duration-500 leading-relaxed">
                  {action.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </section>

      </main>
      
      <Footer />
    </div>
  );
}