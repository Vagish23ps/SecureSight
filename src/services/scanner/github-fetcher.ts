/**
 * GitHub API Repository Fetcher
 * Server-side client for fetching metadata, recursive git trees, and file contents from GitHub.
 */

import { Buffer } from 'node:buffer';

export interface GitHubRepoMeta {
  owner: string;
  repo: string;
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
  description: string;
  htmlUrl: string;
  stars: number;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
}

export class GitHubFetcher {
  private token?: string;

  constructor(token?: string) {
    // Read from parameter or server environment variable
    this.token = token || process.env.GITHUB_TOKEN || (typeof import.meta !== 'undefined' && (import.meta as any).env?.GITHUB_TOKEN);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'SecureFlow-Security-Scanner/1.0',
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.token && this.token.trim()) {
      headers['Authorization'] = `Bearer ${this.token.trim()}`;
    }

    return headers;
  }

  /**
   * Fetches metadata for a GitHub repository
   */
  async getRepoMetadata(owner: string, repo: string): Promise<GitHubRepoMeta> {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `GitHub repository '${owner}/${repo}' was not found. Please verify the URL and confirm the repository is publicly accessible.`
        );
      }
      if (response.status === 403) {
        const remaining = response.headers.get('x-ratelimit-remaining');
        if (remaining === '0') {
          throw new Error(
            'GitHub API rate limit exceeded. Configure a GITHUB_TOKEN in your .env file to enable up to 5,000 requests per hour.'
          );
        }
        throw new Error(`GitHub API returned 403 Forbidden: ${response.statusText}`);
      }
      if (response.status === 401) {
        throw new Error('GitHub API authentication failed. Please verify your GITHUB_TOKEN.');
      }
      throw new Error(`Failed to fetch repository from GitHub (HTTP ${response.status}: ${response.statusText})`);
    }

    const data = await response.json();
    return {
      owner: data.owner?.login || owner,
      repo: data.name || repo,
      fullName: data.full_name || `${owner}/${repo}`,
      defaultBranch: data.default_branch || 'main',
      isPrivate: Boolean(data.private),
      description: data.description || '',
      htmlUrl: data.html_url || `https://github.com/${owner}/${repo}`,
      stars: data.stargazers_count || 0,
    };
  }

  /**
   * Fetches the complete recursive git tree for the repository
   */
  async getRecursiveTree(owner: string, repo: string, branch: string): Promise<{ items: GitHubTreeItem[]; commitSha?: string }> {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const response = await fetch(url, { headers: this.getHeaders() });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Branch '${branch}' or git tree not found in repository '${owner}/${repo}'.`);
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded while retrieving repository tree.');
      }
      throw new Error(`Failed to fetch Git tree (HTTP ${response.status}: ${response.statusText})`);
    }

    const data = await response.json();
    const tree = (data.tree || []) as GitHubTreeItem[];

    return {
      items: tree,
      commitSha: data.sha,
    };
  }

  /**
   * Fetches raw content of a specific file from the repository
   */
  async getFileContent(owner: string, repo: string, branch: string, filePath: string, sha?: string): Promise<string> {
    // Primary: raw.githubusercontent.com
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    const rawHeaders: Record<string, string> = {
      'User-Agent': 'SecureFlow-Security-Scanner/1.0',
    };
    if (this.token && this.token.trim()) {
      rawHeaders['Authorization'] = `Bearer ${this.token.trim()}`;
    }

    try {
      const res = await fetch(rawUrl, { headers: rawHeaders });
      if (res.ok) {
        return await res.text();
      }
    } catch {
      // Fallback below
    }

    // Fallback: GitHub Git Blobs API if SHA is available
    if (sha) {
      const blobUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`;
      const blobRes = await fetch(blobUrl, { headers: this.getHeaders() });
      if (blobRes.ok) {
        const blobData = await blobRes.json();
        if (blobData.encoding === 'base64' && blobData.content) {
          const buffer = Buffer.from(blobData.content.replace(/\n/g, ''), 'base64');
          return buffer.toString('utf-8');
        }
      }
    }

    throw new Error(`Could not retrieve content for file: ${filePath}`);
  }
}