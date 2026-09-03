import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Users, Database, Key, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('scanner');

  const tabs = [
    { id: 'scanner', label: 'GitHub Scanner', icon: Database },
    { id: 'security', label: 'Security Policies', icon: Shield },
    { id: 'general', label: 'General', icon: Settings },
    { id: 'integrations', label: 'External Integrations', icon: Users },
    { id: 'api', label: 'API Endpoint', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16">
        <div className="mb-12">
          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Settings & Configuration</h1>
          <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
            Configure your SecureFlow scanner policies, GitHub API connection, and automated security gate thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <nav className="border border-deepbrown/20 p-4 bg-background">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 font-paragraph text-base transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-secondary-foreground hover:bg-primary/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            
            {/* GITHUB SCANNER CONFIG */}
            {activeTab === 'scanner' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-deepbrown/20 bg-background p-8 space-y-6"
              >
                <div className="border-b border-deepbrown/20 pb-4">
                  <h2 className="font-heading text-3xl text-foreground mb-2">GitHub Repository Scanner</h2>
                  <p className="font-paragraph text-sm text-secondary-foreground">
                    Configuration for real-time repository fetching and tree discovery.
                  </p>
                </div>

                <div className="border border-deepbrown/20 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-xl text-foreground">GitHub API Access</h3>
                      <p className="font-paragraph text-xs text-secondary-foreground">
                        Public repository scanning is enabled by default.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-950/10 text-green-700 dark:text-green-400 border border-green-700/30 text-xs font-semibold uppercase">
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </span>
                  </div>

                  <div className="p-4 bg-secondary border border-deepbrown/20 font-paragraph text-xs text-secondary-foreground space-y-2">
                    <p className="font-semibold text-foreground">Rate Limits & Token Configuration:</p>
                    <p>
                      • Without token: <strong>60 requests per hour</strong> (Standard GitHub anonymous limit)
                    </p>
                    <p>
                      • With <code>GITHUB_TOKEN</code>: <strong>5,000 requests per hour</strong>
                    </p>
                    <p className="text-foreground/80 mt-2">
                      To configure an optional token securely, set <code>GITHUB_TOKEN=your_token</code> in your local <code>.env</code> file. The token is never exposed to browser client code.
                    </p>
                  </div>
                </div>

                <div className="border border-deepbrown/20 p-6 space-y-3">
                  <h3 className="font-heading text-xl text-foreground">Scanned File Extensions (Whitelist)</h3>
                  <p className="font-paragraph text-xs text-secondary-foreground">
                    Only source files matching these extensions are fetched and inspected for vulnerabilities:
                  </p>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs text-foreground">
                    {['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.kt', '.go', '.php', '.rb', '.rs', '.c', '.cpp', '.cs', '.swift', '.vue', '.svelte', '.html', '.css', '.scss', '.json', '.yaml', '.yml', '.env', '.sql', '.sh', '.bash'].map(ext => (
                      <span key={ext} className="px-2 py-1 bg-secondary border border-deepbrown/20">
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-deepbrown/20 p-6 space-y-3">
                  <h3 className="font-heading text-xl text-foreground">Ignored Directories (Blacklist)</h3>
                  <p className="font-paragraph text-xs text-secondary-foreground">
                    Directories automatically skipped during recursive file discovery:
                  </p>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs text-secondary-foreground">
                    {['.git', 'node_modules', 'dist', 'build', 'coverage', '.cache', '.next', '.astro', 'vendor', 'target', 'bin', 'obj'].map(dir => (
                      <span key={dir} className="px-2 py-1 bg-secondary border border-deepbrown/20">
                        {dir}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECURITY POLICIES */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-deepbrown/20 bg-background p-8 space-y-6"
              >
                <div className="border-b border-deepbrown/20 pb-4">
                  <h2 className="font-heading text-3xl text-foreground mb-2">Security Gate Policies</h2>
                  <p className="font-paragraph text-sm text-secondary-foreground">
                    Rules evaluated deterministically on scan findings to determine deployment gate status.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-deepbrown/20 bg-secondary flex justify-between items-center">
                    <div>
                      <h4 className="font-heading text-lg text-foreground">Fail on Critical Vulnerabilities</h4>
                      <p className="font-paragraph text-xs text-secondary-foreground">
                        Any Critical severity finding immediately results in GATE FAIL.
                      </p>
                    </div>
                    <span className="font-semibold text-xs px-3 py-1 bg-primary text-primary-foreground uppercase">
                      Enforced
                    </span>
                  </div>

                  <div className="p-4 border border-deepbrown/20 bg-secondary flex justify-between items-center">
                    <div>
                      <h4 className="font-heading text-lg text-foreground">Fail on High Severity Threshold</h4>
                      <p className="font-paragraph text-xs text-secondary-foreground">
                        More than 0 High severity findings results in GATE FAIL.
                      </p>
                    </div>
                    <span className="font-semibold text-xs px-3 py-1 bg-primary text-primary-foreground uppercase">
                      Max: 0
                    </span>
                  </div>

                  <div className="p-4 border border-deepbrown/20 bg-secondary flex justify-between items-center">
                    <div>
                      <h4 className="font-heading text-lg text-foreground">Medium Severity Warning Threshold</h4>
                      <p className="font-paragraph text-xs text-secondary-foreground">
                        More than 5 Medium findings triggers a GATE WARN condition.
                      </p>
                    </div>
                    <span className="font-semibold text-xs px-3 py-1 border border-deepbrown text-foreground uppercase">
                      Max: 5
                    </span>
                  </div>

                  <div className="p-4 border border-deepbrown/20 bg-secondary flex justify-between items-center">
                    <div>
                      <h4 className="font-heading text-lg text-foreground">Maximum Allowed Risk Score</h4>
                      <p className="font-paragraph text-xs text-secondary-foreground">
                        Risk scores above 50/100 block the security gate.
                      </p>
                    </div>
                    <span className="font-semibold text-xs px-3 py-1 border border-deepbrown text-foreground uppercase">
                      Threshold: 50
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* GENERAL SETTINGS */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-deepbrown/20 bg-background p-8 space-y-6"
              >
                <h2 className="font-heading text-3xl text-foreground mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-paragraph text-sm font-semibold text-foreground mb-1">
                      Application Title
                    </label>
                    <input
                      type="text"
                      disabled
                      defaultValue="SecureFlow Cybersecurity Platform"
                      className="w-full px-4 py-2.5 border border-deepbrown/20 font-paragraph text-sm text-foreground bg-secondary opacity-80"
                    />
                  </div>
                  <div>
                    <label className="block font-paragraph text-sm font-semibold text-foreground mb-1">
                      Data Storage Mode
                    </label>
                    <input
                      type="text"
                      disabled
                      defaultValue="Local Browser Persistence (Standalone / Zero Wix Data)"
                      className="w-full px-4 py-2.5 border border-deepbrown/20 font-paragraph text-sm text-foreground bg-secondary opacity-80"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* EXTERNAL INTEGRATIONS */}
            {activeTab === 'integrations' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-deepbrown/20 bg-background p-8 space-y-6"
              >
                <h2 className="font-heading text-3xl text-foreground mb-2">External Integrations</h2>
                <p className="font-paragraph text-sm text-secondary-foreground mb-6">
                  Third-party alert and workflow connectors status.
                </p>

                <div className="space-y-4">
                  <div className="border border-deepbrown/20 p-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-heading text-xl text-foreground">GitHub Public API</h3>
                      <p className="font-paragraph text-xs text-secondary-foreground">
                        Live repository source code fetching and recursive Git tree discovery.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-950/10 text-green-700 dark:text-green-400 border border-green-700/30 text-xs font-semibold uppercase">
                      Implemented
                    </span>
                  </div>

                  <div className="border border-deepbrown/20 p-6 flex justify-between items-center opacity-60">
                    <div>
                      <h3 className="font-heading text-xl text-foreground">Slack Webhooks</h3>
                      <p className="font-paragraph text-xs text-secondary-foreground">
                        Real-time vulnerability alert notifications sent to Slack channels.
                      </p>
                    </div>
                    <span className="px-3 py-1 border border-deepbrown/30 text-xs font-semibold uppercase text-secondary-foreground">
                      Not implemented (Roadmap)
                    </span>
                  </div>

                  <div className="border border-deepbrown/20 p-6 flex justify-between items-center opacity-60">
                    <div>
                      <h3 className="font-heading text-xl text-foreground">Jira Issue Tracker</h3>
                      <p className="font-paragraph text-xs text-secondary-foreground">
                        Automated ticket creation for detected High/Critical vulnerabilities.
                      </p>
                    </div>
                    <span className="px-3 py-1 border border-deepbrown/30 text-xs font-semibold uppercase text-secondary-foreground">
                      Not implemented (Roadmap)
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* API ENDPOINT */}
            {activeTab === 'api' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-deepbrown/20 bg-background p-8 space-y-6"
              >
                <h2 className="font-heading text-3xl text-foreground mb-2">Server API Endpoint</h2>
                <p className="font-paragraph text-sm text-secondary-foreground">
                  SecureFlow provides a server-side endpoint for scanning public GitHub repositories.
                </p>

                <div className="p-4 bg-secondary border border-deepbrown/20 font-mono text-xs text-foreground space-y-2">
                  <div className="font-semibold text-primary">POST /api/scan</div>
                  <div className="text-secondary-foreground">// Request Payload:</div>
                  <div className="text-foreground">
                    {JSON.stringify({ repositoryUrl: 'https://github.com/owner/repository' }, null, 2)}
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}