import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Users, Database, Key } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'api', label: 'API Keys', icon: Key }
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16">
        <div className="mb-12">
          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Settings</h1>
          <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
            Configure your SecureFlow dashboard preferences and security policies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <nav className="border border-deepbrown/20 p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 font-paragraph text-base transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
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
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="border border-deepbrown/20 p-8">
                  <h2 className="font-heading text-3xl text-foreground mb-6">General Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block font-paragraph text-base text-foreground mb-2">
                        Dashboard Name
                      </label>
                      <input
                        type="text"
                        defaultValue="SecureFlow Dashboard"
                        className="w-full px-4 py-3 border border-deepbrown/20 font-paragraph text-base text-foreground bg-secondary focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block font-paragraph text-base text-foreground mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Development Team"
                        className="w-full px-4 py-3 border border-deepbrown/20 font-paragraph text-base text-foreground bg-secondary focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block font-paragraph text-base text-foreground mb-2">
                        Time Zone
                      </label>
                      <select className="w-full px-4 py-3 border border-deepbrown/20 font-paragraph text-base text-foreground bg-secondary focus:outline-none focus:border-primary">
                        <option>UTC</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                        <option>Asia/Tokyo</option>
                      </select>
                    </div>

                    <button className="px-8 py-3 border-2 border-primary text-primary font-paragraph text-base hover:bg-primary hover:text-primary-foreground transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="border border-deepbrown/20 p-8">
                  <h2 className="font-heading text-3xl text-foreground mb-6">Security Policies</h2>
                  
                  <div className="space-y-6">
                    <div className="border-b border-deepbrown/20 pb-6">
                      <h3 className="font-heading text-xl text-foreground mb-3">Scan Frequency</h3>
                      <select className="w-full px-4 py-3 border border-deepbrown/20 font-paragraph text-base text-foreground bg-secondary focus:outline-none focus:border-primary">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>On Commit</option>
                        <option>Manual Only</option>
                      </select>
                    </div>

                    <div className="border-b border-deepbrown/20 pb-6">
                      <h3 className="font-heading text-xl text-foreground mb-3">Severity Threshold</h3>
                      <p className="font-paragraph text-sm text-secondary-foreground mb-3">
                        Minimum severity level to trigger alerts
                      </p>
                      <select className="w-full px-4 py-3 border border-deepbrown/20 font-paragraph text-base text-foreground bg-secondary focus:outline-none focus:border-primary">
                        <option>Critical Only</option>
                        <option>High and Above</option>
                        <option>Medium and Above</option>
                        <option>All Severities</option>
                      </select>
                    </div>

                    <div className="border-b border-deepbrown/20 pb-6">
                      <h3 className="font-heading text-xl text-foreground mb-3">Auto-Remediation</h3>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-5 h-5" />
                        <span className="font-paragraph text-base text-secondary-foreground">
                          Enable automatic remediation for low-severity findings
                        </span>
                      </label>
                    </div>

                    <button className="px-8 py-3 border-2 border-primary text-primary font-paragraph text-base hover:bg-primary hover:text-primary-foreground transition-colors">
                      Update Security Policies
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="border border-deepbrown/20 p-8">
                  <h2 className="font-heading text-3xl text-foreground mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="border-b border-deepbrown/20 pb-6">
                      <h3 className="font-heading text-xl text-foreground mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-5 h-5" />
                          <span className="font-paragraph text-base text-secondary-foreground">
                            Critical vulnerabilities detected
                          </span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="w-5 h-5" />
                          <span className="font-paragraph text-base text-secondary-foreground">
                            Scan completion reports
                          </span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="w-5 h-5" />
                          <span className="font-paragraph text-base text-secondary-foreground">
                            Weekly security summary
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="border-b border-deepbrown/20 pb-6">
                      <h3 className="font-heading text-xl text-foreground mb-3">Notification Email</h3>
                      <input
                        type="email"
                        defaultValue="security@example.com"
                        className="w-full px-4 py-3 border border-deepbrown/20 font-paragraph text-base text-foreground bg-secondary focus:outline-none focus:border-primary"
                      />
                    </div>

                    <button className="px-8 py-3 border-2 border-primary text-primary font-paragraph text-base hover:bg-primary hover:text-primary-foreground transition-colors">
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'team' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="border border-deepbrown/20 p-8">
                  <h2 className="font-heading text-3xl text-foreground mb-6">Team Management</h2>
                  
                  <div className="space-y-6">
                    <div className="border-b border-deepbrown/20 pb-6">
                      <h3 className="font-heading text-xl text-foreground mb-4">Team Members</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-deepbrown/20">
                          <div>
                            <p className="font-paragraph text-base text-foreground">Admin User</p>
                            <p className="font-paragraph text-sm text-secondary-foreground">admin@example.com</p>
                          </div>
                          <span className="font-paragraph text-sm text-primary">Administrator</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-deepbrown/20">
                          <div>
                            <p className="font-paragraph text-base text-foreground">Security Engineer</p>
                            <p className="font-paragraph text-sm text-secondary-foreground">security@example.com</p>
                          </div>
                          <span className="font-paragraph text-sm text-secondary-foreground">Viewer</span>
                        </div>
                      </div>
                    </div>

                    <button className="px-8 py-3 border-2 border-primary text-primary font-paragraph text-base hover:bg-primary hover:text-primary-foreground transition-colors">
                      Invite Team Member
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="border border-deepbrown/20 p-8">
                  <h2 className="font-heading text-3xl text-foreground mb-6">Integrations</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-deepbrown/20 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading text-xl text-foreground">GitHub</h3>
                        <span className="px-3 py-1 border border-secondary-foreground text-secondary-foreground font-paragraph text-xs">
                          Connected
                        </span>
                      </div>
                      <p className="font-paragraph text-sm text-secondary-foreground mb-4">
                        Sync repositories and scan results with GitHub
                      </p>
                      <button className="px-6 py-2 border-2 border-deepbrown text-deepbrown font-paragraph text-sm hover:bg-deepbrown hover:text-primary-foreground transition-colors">
                        Configure
                      </button>
                    </div>

                    <div className="border border-deepbrown/20 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading text-xl text-foreground">Slack</h3>
                        <span className="px-3 py-1 border border-deepbrown/20 text-secondary-foreground font-paragraph text-xs">
                          Not Connected
                        </span>
                      </div>
                      <p className="font-paragraph text-sm text-secondary-foreground mb-4">
                        Receive security alerts in Slack channels
                      </p>
                      <button className="px-6 py-2 border-2 border-primary text-primary font-paragraph text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                        Connect
                      </button>
                    </div>

                    <div className="border border-deepbrown/20 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-heading text-xl text-foreground">Jira</h3>
                        <span className="px-3 py-1 border border-deepbrown/20 text-secondary-foreground font-paragraph text-xs">
                          Not Connected
                        </span>
                      </div>
                      <p className="font-paragraph text-sm text-secondary-foreground mb-4">
                        Create tickets for security findings automatically
                      </p>
                      <button className="px-6 py-2 border-2 border-primary text-primary font-paragraph text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'api' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="border border-deepbrown/20 p-8">
                  <h2 className="font-heading text-3xl text-foreground mb-6">API Keys</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 p-6">
                      <p className="font-paragraph text-sm text-secondary-foreground">
                        API keys allow external applications to access SecureFlow data programmatically. Keep your keys secure and never share them publicly.
                      </p>
                    </div>

                    <div className="border-b border-deepbrown/20 pb-6">
                      <h3 className="font-heading text-xl text-foreground mb-4">Active API Keys</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-deepbrown/20">
                          <div>
                            <p className="font-paragraph text-base text-foreground font-mono">sk_live_••••••••••••1234</p>
                            <p className="font-paragraph text-sm text-secondary-foreground">Created: Sep 1, 2026</p>
                          </div>
                          <button className="font-paragraph text-sm text-destructive hover:underline">
                            Revoke
                          </button>
                        </div>
                      </div>
                    </div>

                    <button className="px-8 py-3 border-2 border-primary text-primary font-paragraph text-base hover:bg-primary hover:text-primary-foreground transition-colors">
                      Generate New API Key
                    </button>
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
