# SecureFlow 🛡️

> **Real-Time GitHub Repository Cybersecurity & Static Application Security Testing (SAST) Platform**

SecureFlow is an open-source DevSecOps web platform that connects to public GitHub repositories, recursively discovers source files, analyzes file contents for security vulnerabilities, calculates deterministic CVSS risk metrics, and enforces automated security gate compliance.

---

## ⚡ Core Capability Workflow

```
       GITHUB REPOSITORY URL (e.g. https://github.com/owner/repo)
                                ↓
                 SERVER-SIDE GITHUB FETCHER
                 (Validates repo & default branch)
                                ↓
                 RECURSIVE GIT TREE DISCOVERY
                 (Enumerates entire repository tree)
                                ↓
                     SMART FILE FILTERING
                 (27+ extensions, skips binaries/vendor)
                                ↓
                  MULTI-FILE SAST SCANNING
             (Line-by-line vulnerability pattern rules)
                                ↓
                 DETERMINISTIC RISK ENGINE
             (CVSS-weighted scoring 0–100, zero randoms)
                                ↓
                    AUTOMATED SECURITY GATE
                 (Enforces PASS / WARN / FAIL)
                                ↓
                 REAL DASHBOARD & AUDIT FINDINGS
```

---

## 🚀 Key Features

- **Live Public GitHub Repository Scanning**: Input any valid public GitHub repository URL. SecureFlow connects directly to the GitHub API, discovers the repository tree, and fetches real source code.
- **Multi-File Deep Source Analysis**: Processes every filtered file in the repository (not just a single file or code snippet).
- **Zero Mock / Fake Data**: No simulated durations, no `Math.random()`, no pre-seeded dummy vulnerabilities. Dashboards and reports reflect solely actual scan executions.
- **Intelligent File Filtering**:
  - **Whitelisted Source Types**: `.js`, `.jsx`, `.ts`, `.tsx`, `.py`, `.java`, `.kt`, `.go`, `.php`, `.rb`, `.rs`, `.c`, `.cpp`, `.cs`, `.swift`, `.vue`, `.svelte`, `.html`, `.css`, `.scss`, `.json`, `.yaml`, `.yml`, `.xml`, `.env`, `.sql`, `.sh`, `.bash`.
  - **Auto-Skipped Directories**: `.git`, `node_modules`, `dist`, `build`, `coverage`, `vendor`, `target`, `bin`, `.cache`, `.next`, `.astro`.
  - **Ignored Binaries & Media**: `.png`, `.jpg`, `.pdf`, `.zip`, `.exe`, `.dll`, `.mp4`, `.woff`, etc.
  - **Safety Thresholds**: Auto-skips files exceeding 1 MB.
- **Pattern-Based SAST Vulnerability Rules**:
  - **SQL Injection (CWE-89)**: Unsanitized concatenation or interpolation into database queries.
  - **Cross-Site Scripting / XSS (CWE-79)**: Unescaped HTML/DOM injection (`dangerouslySetInnerHTML`, `innerHTML`, `document.write`).
  - **Hardcoded Secrets & API Keys (CWE-798)**: Exposed private credentials, auth tokens, and secret keys.
  - **Weak Cryptography (CWE-327)**: Deprecated collision-prone hashing algorithms (`MD5`, `SHA1`).
  - **Insecure Deserialization (CWE-502)**: Unsafe object deserialization (`pickle.loads`, `yaml.load`, `eval`).
  - **Missing Security Headers (CWE-693)**: Weak security configurations (`disableHostCheck`, `rejectUnauthorized: false`).
  - **Open Redirects (CWE-601)**: Unvalidated redirection logic.
  - **CSRF Weaknesses (CWE-352)**: State-changing endpoints without anti-forgery protection.
- **Deterministic Risk Engine**:
  - Pure mathematical scoring on a 0–100 CVSS-weighted scale:
    $$\text{Score} = \min(100, 25 \times \text{Critical} + 10 \times \text{High} + 3 \times \text{Medium} + 1 \times \text{Low})$$
  - Categorizes overall posture into **Low**, **Medium**, **High**, or **Critical**.
- **Configurable Security Gate**:
  - Evaluates scan findings against customizable policy thresholds:
    - **FAIL**: Any Critical finding, High findings > 0, or Risk Score > 50.
    - **WARN**: Medium findings > 5.
    - **PASS**: All thresholds satisfied.
- **Standalone Architecture**: 100% independent from proprietary cloud CMS platforms. Runs locally on standard modern web technologies.

---

## 🛠️ Tech Stack

- **Framework**: [Astro 5](https://astro.build/) (Server-side rendering with `@astrojs/node`)
- **Frontend**: [React 18](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Storage**: Browser `localStorage` (via modular `RepositoryStore`, `ScanStore`, `FindingStore`) with SSR memory fallback

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`v20+` or `v24+` recommended)
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/secureflow.git
   cd secureflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment (Optional)**:
   ```bash
   cp .env.example .env
   ```
   *Note: Public repository scanning works out of the box without a token (standard GitHub rate limit: 60 requests/hour). Adding a GitHub Personal Access Token in `.env` increases your rate limit to 5,000 requests/hour.*

4. **Start the local development server**:
   ```bash
   npm run dev
   ```

5. **Open SecureFlow**:
   Navigate to [http://localhost:4321](http://localhost:4321) in your browser.

---

## 💻 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Astro development server at `http://localhost:4321` |
| `npm run build` | Builds client assets and Node.js server bundle for production |
| `npm run preview` | Runs the production build locally |
| `npm run check` | Runs Astro diagnostics and type checking |
| `npm test` | Executes the automated test suite (URL parsing, filtering, SAST, risk engine, security gate) |

---

## 📁 Project Structure

```
SecureFlow/
├── public/                     # Static assets, fonts, icons
├── src/
│   ├── components/             # React UI components
│   │   ├── pages/              # Application views
│   │   │   ├── HomePage.tsx            # Live security metrics dashboard
│   │   │   ├── RepositoriesPage.tsx    # Primary GitHub scan interface
│   │   │   ├── FindingsPage.tsx        # Aggregated vulnerability findings table
│   │   │   ├── FindingDetailsPage.tsx  # Detailed finding evidence & remediation
│   │   │   ├── ScansPage.tsx           # Scan history audit log
│   │   │   ├── ScanDetailsPage.tsx     # Full scan audit report
│   │   │   └── SettingsPage.tsx        # Scanner & security gate policies
│   │   ├── ui/                 # Accessible Radix UI primitives
│   │   ├── Header.tsx          # Navigation bar
│   │   ├── Footer.tsx          # Application footer
│   │   ├── ErrorPage.tsx       # Application error boundary
│   │   └── Router.tsx          # Client-side router configuration
│   ├── lib/
│   │   ├── risk-engine.ts      # Pure deterministic CVSS risk calculation
│   │   ├── security-gate.ts    # Configurable pass/warn/fail gate evaluator
│   │   └── security-scanner.ts # Core pattern-based SAST engine & IScanner interface
│   ├── pages/
│   │   ├── api/
│   │   │   └── scan.ts         # Server-side POST /api/scan endpoint
│   │   └── [...slug].astro     # Standard Astro HTML entrypoint
│   ├── services/
│   │   ├── scanner/
│   │   │   ├── github-url-parser.ts   # GitHub URL extraction & validation
│   │   │   ├── file-filter.ts         # Whitelist/blacklist file filtering
│   │   │   ├── github-fetcher.ts      # Server-side GitHub REST & Tree client
│   │   │   └── repository-scanner.ts  # End-to-end multi-file scanning orchestrator
│   │   └── storage/
│   │       ├── repository-store.ts    # Scanned repository persistence
│   │       ├── scan-store.ts          # Audit scan history persistence
│   │       ├── finding-store.ts       # Detected findings persistence
│   │       └── index.ts               # Storage abstraction layer
│   └── types/
│       └── security.ts         # Typed domain models (Finding, ScanResult, Repository)
├── test/
│   └── scanner.test.mjs        # 7 automated unit & multi-file fixture tests
├── astro.config.mjs            # Standard Astro configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Security & Privacy

- **Server-Side API Boundaries**: All GitHub communications and API credentials are kept strictly server-side in `src/pages/api/scan.ts` and `src/services/scanner/github-fetcher.ts`.
- **Zero Token Leakage**: GitHub tokens are never returned to the client, never written to `localStorage`, and never rendered in UI templates.
- **Local Persistence**: Findings and scan history remain within your browser's local sandbox.

---

## 🧪 Automated Testing

SecureFlow includes a comprehensive automated test suite verifying multi-file scanning across test fixtures:

```bash
npm test
```

### Test Coverage:
1. **GitHubUrlParser**: Standard, short, and `.git` URLs; rejections for non-GitHub or invalid domains.
2. **FileFilter**: Whitelisted code extensions, binary/media skips, vendor and build directory exclusion.
3. **SourceCodeScanner**: Rule detection accuracy for SQLi, XSS, Hardcoded Secrets, and Broken Crypto.
4. **Multi-File Scanning**: Cross-file aggregation with accurate file paths, line numbers, and evidence snippets.
5. **Deterministic Risk Engine**: Invariant mathematical scoring and reproducible risk classifications.
6. **Security Gate**: Policy threshold evaluation (Critical failure enforcement).
7. **Clean Fixture**: Confirms clean repositories produce 0 findings and pass security gates.

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **Private Repository Support**: GitHub OAuth & App token authentication.
- [ ] **Software Composition Analysis (SCA)**: Dependency vulnerability auditing via OSV / GitHub Advisory Database.
- [ ] **External Scanner Plugins**: Direct CLI bindings for Semgrep, Trivy (container scanning), and Gitleaks.
- [ ] **Alert Integrations**: Real-time webhooks for Slack, Discord, and Jira issue tracking.
- [ ] **Multi-User Backend**: Persistent PostgreSQL / SQLite storage for team environments.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.