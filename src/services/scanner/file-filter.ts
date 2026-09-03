/**
 * Repository File Filter
 * Determines which files from a discovered Git tree should be scanned based on extensions,
 * directory exclusion rules, and file size limits.
 */

export interface FileFilterOptions {
  allowedExtensions?: string[];
  ignoredDirectories?: string[];
  ignoredFileNames?: string[];
  maxFileSizeBytes?: number;
}

export const DEFAULT_ALLOWED_EXTENSIONS: string[] = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.pyw',
  '.java', '.kt', '.kts',
  '.go',
  '.php',
  '.rb',
  '.rs',
  '.c', '.cpp', '.h', '.hpp', '.cc',
  '.cs',
  '.swift',
  '.vue', '.svelte',
  '.html', '.htm',
  '.css', '.scss', '.sass', '.less',
  '.json',
  '.yaml', '.yml',
  '.xml',
  '.env', '.env.example', '.env.local', '.env.production',
  '.sql',
  '.sh', '.bash', '.zsh',
];

export const DEFAULT_IGNORED_DIRECTORIES: string[] = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.next',
  '.astro',
  '.nuxt',
  'vendor',
  'target',
  'bin',
  'obj',
  '.idea',
  '.vscode',
  '.system_generated',
];

export const DEFAULT_IGNORED_EXTENSIONS: string[] = [
  // Images
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg', '.bmp', '.tiff',
  // Media / Audio / Video
  '.mp4', '.mp3', '.wav', '.mov', '.avi', '.mkv', '.webm',
  // Documents / Archives
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar',
  // Binaries
  '.exe', '.dll', '.so', '.dylib', '.bin', '.iso', '.wasm',
  // Fonts
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  // Lockfiles (usually contain no logic, huge noise)
  '.lock',
];

export const DEFAULT_MAX_FILE_SIZE = 1024 * 1024; // 1 MB

export class FileFilter {
  private allowedExtensions: Set<string>;
  private ignoredDirectories: string[];
  private ignoredExtensions: Set<string>;
  private maxFileSize: number;

  constructor(options: FileFilterOptions = {}) {
    this.allowedExtensions = new Set(
      (options.allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS).map(e => e.toLowerCase())
    );
    this.ignoredDirectories = (options.ignoredDirectories || DEFAULT_IGNORED_DIRECTORIES).map(d =>
      d.toLowerCase()
    );
    this.ignoredExtensions = new Set(DEFAULT_IGNORED_EXTENSIONS);
    this.maxFileSize = options.maxFileSizeBytes || DEFAULT_MAX_FILE_SIZE;
  }

  /**
   * Checks whether a file path and optional size should be included for security scanning
   */
  shouldScan(filePath: string, sizeBytes?: number): { shouldScan: boolean; reason?: string } {
    if (!filePath || typeof filePath !== 'string') {
      return { shouldScan: false, reason: 'Invalid file path' };
    }

    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    const segments = normalizedPath.split('/');
    const fileName = segments[segments.length - 1];

    // Check ignored directories
    for (const dir of this.ignoredDirectories) {
      if (segments.includes(dir)) {
        return { shouldScan: false, reason: `Located in ignored directory: ${dir}` };
      }
    }

    // Check size limit
    if (typeof sizeBytes === 'number' && sizeBytes > this.maxFileSize) {
      return { shouldScan: false, reason: `File size exceeds limit (${sizeBytes} bytes)` };
    }

    // Check if filename itself is in allowed list (e.g. .env, Dockerfile)
    if (fileName === '.env' || fileName === '.env.example' || fileName === 'dockerfile') {
      return { shouldScan: true };
    }

    // Extract extension
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1) {
      // No extension
      return { shouldScan: false, reason: 'No file extension' };
    }

    const ext = fileName.slice(dotIndex);

    // Check explicitly ignored extensions
    if (this.ignoredExtensions.has(ext)) {
      return { shouldScan: false, reason: `Ignored extension: ${ext}` };
    }

    // Check allowed extensions
    if (this.allowedExtensions.has(ext)) {
      return { shouldScan: true };
    }

    return { shouldScan: false, reason: `Extension not in allowed whitelist: ${ext}` };
  }
}