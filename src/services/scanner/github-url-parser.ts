/**
 * GitHub Repository URL Parser & Validator
 */

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  fullName: string;
  canonicalUrl: string;
}

export class GitHubUrlParser {
  /**
   * Parses and validates a GitHub repository URL
   */
  static parse(rawUrl: string): ParsedGitHubUrl {
    if (!rawUrl || typeof rawUrl !== 'string') {
      throw new Error('Please provide a valid GitHub repository URL.');
    }

    const trimmed = rawUrl.trim();

    // Regex to match github repository patterns
    // Handles: https://github.com/owner/repo, http://..., github.com/owner/repo, optional .git, optional trailing slash
    const githubRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/;

    const match = trimmed.match(githubRegex);
    if (!match || !match[1] || !match[2]) {
      throw new Error(
        'Invalid GitHub repository URL. Expected format: https://github.com/owner/repository'
      );
    }

    const owner = match[1];
    let repo = match[2];

    // Strip trailing slash or query params if any
    repo = repo.replace(/\/.*$/, '').replace(/\.git$/, '');

    if (!owner || !repo) {
      throw new Error('Could not extract repository owner and name from the URL.');
    }

    return {
      owner,
      repo,
      fullName: `${owner}/${repo}`,
      canonicalUrl: `https://github.com/${owner}/${repo}`,
    };
  }
}