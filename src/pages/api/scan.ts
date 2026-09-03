export const prerender = false;

import type { APIRoute } from 'astro';
import { RepositoryScanner } from '@/services/scanner/repository-scanner';

export const POST: APIRoute = async ({ request }) => {
  try {
    let body: { repositoryUrl?: string } = {};
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON request body.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { repositoryUrl } = body;
    if (!repositoryUrl || typeof repositoryUrl !== 'string' || !repositoryUrl.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please provide a GitHub repository URL (e.g. https://github.com/owner/repository).',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const scanner = new RepositoryScanner();
    const result = await scanner.scanRepository(repositoryUrl.trim());

    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[API /api/scan Error]:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'An unexpected error occurred during repository scanning.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};