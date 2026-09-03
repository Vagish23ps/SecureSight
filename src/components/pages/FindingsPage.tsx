import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Filter, X } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { SecurityFindings } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

// Mock data with extended fields
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

export default function FindingsPage() {
  const [findings, setFindings] = useState<ExtendedFinding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<ExtendedFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [repositoryFilter, setRepositoryFilter] = useState<string>('');
  const [scannerFilter, setScannerFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadFindings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [findings, severityFilter, repositoryFilter, scannerFilter, statusFilter]);

  const loadFindings = async () => {
    setIsLoading(true);
    try {
      const result = await BaseCrudService.getAll<SecurityFindings>('securityfindings');
      // Merge CMS data with mock extended data
      const mergedFindings = result.items.map(item => {
        const mockData = MOCK_FINDINGS_DATA.find(m => m._id === item._id);
        return { ...item, ...mockData } as ExtendedFinding;
      });
      // If no CMS data, use mock data
      const finalFindings = mergedFindings.length > 0 ? mergedFindings : MOCK_FINDINGS_DATA;
      setFindings(finalFindings);
    } catch (error) {
      console.error('Failed to load findings:', error);
      // Fallback to mock data
      setFindings(MOCK_FINDINGS_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = findings;

    if (severityFilter) {
      filtered = filtered.filter(f => f.severity === severityFilter);
    }
    if (repositoryFilter) {
      filtered = filtered.filter(f => f.repositoryName === repositoryFilter);
    }
    if (scannerFilter) {
      filtered = filtered.filter(f => f.scanner === scannerFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(f => f.remediationStatus === statusFilter);
    }

    setFilteredFindings(filtered);
  };

  const clearFilters = () => {
    setSeverityFilter('');
    setRepositoryFilter('');
    setScannerFilter('');
    setStatusFilter('');
  };

  const uniqueRepositories = Array.from(new Set(findings.map(f => f.repositoryName).filter(Boolean)));
  const uniqueScanners = Array.from(new Set(findings.map(f => f.scanner).filter(Boolean)));
  const severities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Open', 'In Progress', 'Fixed'];

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'Critical': return 'text-destructive';
      case 'High': return 'text-primary';
      case 'Medium': return 'text-deepbrown';
      case 'Low': return 'text-secondary-foreground';
      default: return 'text-secondary-foreground';
    }
  };

  const getSeverityBorderColor = (severity?: string) => {
    switch (severity) {
      case 'Critical': return 'border-destructive';
      case 'High': return 'border-primary';
      case 'Medium': return 'border-deepbrown';
      case 'Low': return 'border-secondary-foreground/30';
      default: return 'border-deepbrown/20';
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

  const hasActiveFilters = severityFilter || repositoryFilter || scannerFilter || statusFilter;

  return (
    <div className="min-h-screen bg-secondary">
      <Header />
      
      <main className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16 min-h-[600px]">
        <div className="mb-12">
          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">Security Findings</h1>
          <p className="font-paragraph text-lg text-secondary-foreground max-w-3xl">
            Track and manage security vulnerabilities detected across your repositories.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="border-2 border-destructive p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {findings.filter(f => f.severity === 'Critical').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Critical</div>
          </div>
          <div className="border-2 border-primary p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {findings.filter(f => f.severity === 'High').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">High</div>
          </div>
          <div className="border-2 border-deepbrown p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {findings.filter(f => f.severity === 'Medium').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Medium</div>
          </div>
          <div className="border-2 border-secondary-foreground/30 p-6">
            <div className="font-heading text-3xl text-foreground mb-2">
              {findings.filter(f => f.severity === 'Low').length}
            </div>
            <div className="font-paragraph text-sm text-secondary-foreground">Low</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-primary/5 border border-primary/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-xl text-foreground">Filters</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 font-paragraph text-sm text-primary hover:text-deepbrown transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Severity Filter */}
            <div>
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-deepbrown/20 bg-secondary font-paragraph text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">All Severities</option>
                {severities.map(sev => (
                  <option key={sev} value={sev}>{sev}</option>
                ))}
              </select>
            </div>

            {/* Repository Filter */}
            <div>
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">Repository</label>
              <select
                value={repositoryFilter}
                onChange={(e) => setRepositoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-deepbrown/20 bg-secondary font-paragraph text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">All Repositories</option>
                {uniqueRepositories.map(repo => (
                  <option key={repo} value={repo}>{repo}</option>
                ))}
              </select>
            </div>

            {/* Scanner Filter */}
            <div>
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">Scanner</label>
              <select
                value={scannerFilter}
                onChange={(e) => setScannerFilter(e.target.value)}
                className="w-full px-4 py-2 border border-deepbrown/20 bg-secondary font-paragraph text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">All Scanners</option>
                {uniqueScanners.map(scanner => (
                  <option key={scanner} value={scanner}>{scanner}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block font-paragraph text-sm text-secondary-foreground mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-deepbrown/20 bg-secondary font-paragraph text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="font-paragraph text-sm text-secondary-foreground">
            Showing <span className="font-semibold text-foreground">{filteredFindings.length}</span> of <span className="font-semibold text-foreground">{findings.length}</span> findings
          </p>
        </div>

        {/* Findings Table */}
        <div className="border border-deepbrown/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary">
                <tr>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Title</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Severity</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Repository</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Scanner</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Detection Date</th>
                  <th className="px-6 py-4 text-left font-heading text-base text-primary-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? null : filteredFindings.length > 0 ? (
                  filteredFindings.map((finding, index) => (
                    <motion.tr
                      key={finding._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-deepbrown/20 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-5 h-5 ${getSeverityColor(finding.severity)}`} />
                          <span className="font-heading text-base text-foreground">{finding.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 border ${getSeverityBorderColor(finding.severity)} ${getSeverityColor(finding.severity)}`}>
                          <span className="font-paragraph text-sm font-semibold">{finding.severity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{finding.repositoryName}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">{finding.scanner}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`font-paragraph text-sm font-semibold ${getRemediationColor(finding.remediationStatus)}`}>
                          {finding.remediationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-paragraph text-sm text-secondary-foreground">
                          {finding.detectionDate ? format(new Date(finding.detectionDate), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Link
                          to={`/findings/${finding._id}`}
                          className="font-paragraph text-sm text-primary hover:text-deepbrown transition-colors"
                        >
                          Investigate
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Shield className="w-12 h-12 text-secondary-foreground/30 mx-auto mb-4" />
                      <p className="font-paragraph text-base text-secondary-foreground">
                        {hasActiveFilters ? 'No findings match your filters' : 'No security findings detected'}
                      </p>
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
