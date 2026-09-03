import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Calendar, GitBranch, Shield, FileText, Code, Zap, Wrench, Lightbulb, Loader } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
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

// Mock data matching FindingsPage
const MOCK_FINDINGS_DATA: ExtendedFinding[] = [
  {
    _id: '1',
    title: 'SQL Injection Vulnerability',
    description: 'User input is not properly sanitized before being used in SQL queries',
    severity: 'Critical',
    remediationStatus: 'Open',
    repositoryName: 'api-service',
    detectionDate: new Date('2026-09-01'),
    cweCveId: 'CWE-89',
    filePath: 'src/database/queries.ts',
    lineNumber: 145,
    scanner: 'SonarQube',
    evidence: 'Direct string concatenation in query: `SELECT * FROM users WHERE id = ${userId}`',
    impact: 'Attackers could execute arbitrary SQL commands, potentially accessing or modifying sensitive data',
    remediation: 'Use parameterized queries or prepared statements. Replace string concatenation with query parameters.',
    aiExplanation: 'This SQL injection vulnerability occurs because user input is directly concatenated into SQL queries without proper escaping. An attacker could inject malicious SQL code to bypass authentication or extract sensitive data. Use parameterized queries with placeholders (?) and bind variables to prevent this.'
  },
  {
    _id: '2',
    title: 'Cross-Site Scripting (XSS)',
    description: 'Unsanitized user input is rendered directly in the DOM',
    severity: 'High',
    remediationStatus: 'In Progress',
    repositoryName: 'web-frontend',
    detectionDate: new Date('2026-08-28'),
    cweCveId: 'CWE-79',
    filePath: 'src/components/UserProfile.tsx',
    lineNumber: 89,
    scanner: 'ESLint Security Plugin',
    evidence: 'innerHTML assignment: `element.innerHTML = userInput`',
    impact: 'Attackers could inject malicious scripts that execute in users\' browsers, stealing cookies or session tokens',
    remediation: 'Use textContent instead of innerHTML, or sanitize HTML with a library like DOMPurify',
    aiExplanation: 'XSS vulnerabilities allow attackers to inject malicious scripts into web pages. When user input is rendered without sanitization, attackers can steal session cookies, perform actions on behalf of users, or redirect them to malicious sites. Always use textContent for plain text or sanitize HTML with trusted libraries.'
  },
  {
    _id: '3',
    title: 'Hardcoded API Key',
    description: 'API key is hardcoded in source code',
    severity: 'Critical',
    remediationStatus: 'Open',
    repositoryName: 'payment-service',
    detectionDate: new Date('2026-08-25'),
    cweCveId: 'CWE-798',
    filePath: 'src/config/stripe.ts',
    lineNumber: 12,
    scanner: 'GitGuardian',
    evidence: 'const STRIPE_KEY = "sk_live_51234567890abcdef"',
    impact: 'Exposed API keys could allow unauthorized access to payment systems and customer data',
    remediation: 'Move API keys to environment variables or a secure secrets management system',
    aiExplanation: 'Hardcoded secrets in source code are a critical security risk. Anyone with access to the repository can use these credentials to impersonate your application. Always use environment variables, secrets managers (AWS Secrets Manager, HashiCorp Vault), or configuration files that are excluded from version control.'
  },
  {
    _id: '4',
    title: 'Weak Password Hashing',
    description: 'Passwords are hashed using MD5 instead of bcrypt',
    severity: 'High',
    remediationStatus: 'Open',
    repositoryName: 'auth-service',
    detectionDate: new Date('2026-08-20'),
    cweCveId: 'CWE-327',
    filePath: 'src/auth/password.ts',
    lineNumber: 34,
    scanner: 'SonarQube',
    evidence: 'crypto.createHash("md5").update(password).digest("hex")',
    impact: 'MD5 hashes can be cracked quickly with modern hardware, compromising user accounts',
    remediation: 'Use bcrypt, scrypt, or Argon2 for password hashing with appropriate salt rounds',
    aiExplanation: 'MD5 is cryptographically broken and should never be used for password hashing. Modern GPUs can crack MD5 hashes in seconds. Use bcrypt with a cost factor of 12+, scrypt, or Argon2 which are specifically designed for password hashing and include built-in salting.'
  },
  {
    _id: '5',
    title: 'Missing CSRF Token',
    description: 'Form submissions lack CSRF token validation',
    severity: 'Medium',
    remediationStatus: 'Fixed',
    repositoryName: 'web-frontend',
    detectionDate: new Date('2026-08-15'),
    cweCveId: 'CWE-352',
    filePath: 'src/forms/checkout.tsx',
    lineNumber: 67,
    scanner: 'OWASP ZAP',
    evidence: 'POST request without X-CSRF-Token header',
    impact: 'Attackers could perform unauthorized actions on behalf of authenticated users',
    remediation: 'Add CSRF token generation and validation to all state-changing requests',
    aiExplanation: 'CSRF attacks trick users into performing unwanted actions on websites where they\'re authenticated. Without CSRF tokens, an attacker could craft a malicious page that makes requests to your site using the victim\'s session. Always include unique, unpredictable tokens in forms and validate them server-side.'
  },
  {
    _id: '6',
    title: 'Unvalidated Redirect',
    description: 'User input controls redirect destination without validation',
    severity: 'Medium',
    remediationStatus: 'In Progress',
    repositoryName: 'api-service',
    detectionDate: new Date('2026-08-10'),
    cweCveId: 'CWE-601',
    filePath: 'src/middleware/redirect.ts',
    lineNumber: 23,
    scanner: 'Burp Suite',
    evidence: 'res.redirect(req.query.url)',
    impact: 'Users could be redirected to phishing sites or malware distribution pages',
    remediation: 'Validate redirect URLs against a whitelist of allowed domains',
    aiExplanation: 'Open redirects allow attackers to redirect users to malicious sites while appearing to come from your trusted domain. This is often used in phishing attacks. Always validate redirect URLs against a whitelist of allowed destinations or use relative URLs instead of user-controlled absolute URLs.'
  },
  {
    _id: '7',
    title: 'Insecure Deserialization',
    description: 'Untrusted data is deserialized without validation',
    severity: 'High',
    remediationStatus: 'Open',
    repositoryName: 'data-processor',
    detectionDate: new Date('2026-08-05'),
    cweCveId: 'CWE-502',
    filePath: 'src/utils/serializer.ts',
    lineNumber: 56,
    scanner: 'SonarQube',
    evidence: 'JSON.parse(untrustedInput)',
    impact: 'Attackers could execute arbitrary code by crafting malicious serialized objects',
    remediation: 'Use JSON.parse with a reviver function or validate data structure before deserialization',
    aiExplanation: 'Deserializing untrusted data can lead to remote code execution if the deserialization process instantiates arbitrary classes. Always validate the structure and content of deserialized data. For JSON, use a reviver function to control which types are allowed.'
  },
  {
    _id: '8',
    title: 'Missing Security Headers',
    description: 'HTTP security headers are not configured',
    severity: 'Low',
    remediationStatus: 'Open',
    repositoryName: 'web-frontend',
    detectionDate: new Date('2026-08-01'),
    cweCveId: 'CWE-693',
    filePath: 'src/server/middleware.ts',
    lineNumber: 12,
    scanner: 'OWASP ZAP',
    evidence: 'Missing X-Content-Type-Options, X-Frame-Options, Content-Security-Policy headers',
    impact: 'Increased vulnerability to clickjacking, MIME type sniffing, and XSS attacks',
    remediation: 'Add security headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Content-Security-Policy',
    aiExplanation: 'Security headers tell browsers how to handle your content and protect against common attacks. X-Content-Type-Options prevents MIME sniffing, X-Frame-Options prevents clickjacking, and Content-Security-Policy restricts where resources can be loaded from. Configure these headers in your server middleware.'
  }
];

export default function FindingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [finding, setFinding] = useState<ExtendedFinding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    if (id) {
      loadFinding();
    }
  }, [id]);

  const loadFinding = async () => {
    setIsLoading(true);
    try {
      const data = await BaseCrudService.getById<SecurityFindings>('securityfindings', id!);
      const mockData = MOCK_FINDINGS_DATA.find(m => m._id === id);
      const mergedFinding = { ...data, ...mockData } as ExtendedFinding;
      setFinding(mergedFinding);
    } catch (error) {
      console.error('Failed to load finding:', error);
      // Fallback to mock data
      const mockData = MOCK_FINDINGS_DATA.find(m => m._id === id);
      setFinding(mockData || null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIExplanation = () => {
    setIsLoadingAI(true);
    // Simulate AI response delay
    setTimeout(() => {
      setIsLoadingAI(false);
    }, 1500);
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  <h2 className="font-heading text-2xl text-foreground">AI-Assisted Explanation</h2>
                </div>
                {!isLoadingAI && (
                  <button
                    onClick={generateAIExplanation}
                    className="font-paragraph text-sm text-primary hover:text-deepbrown transition-colors"
                  >
                    Regenerate
                  </button>
                )}
              </div>
              
              {isLoadingAI ? (
                <div className="flex items-center gap-3 py-8">
                  <Loader className="w-5 h-5 text-primary animate-spin" />
                  <span className="font-paragraph text-base text-secondary-foreground">Generating explanation...</span>
                </div>
              ) : (
                <div className="bg-primary/5 p-6 border border-primary/20">
                  <p className="font-paragraph text-base text-secondary-foreground leading-relaxed">
                    {finding.aiExplanation}
                  </p>
                </div>
              )}
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
