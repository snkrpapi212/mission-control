import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/oauth/providers';
import { generateState, generatePKCE, buildAuthorizationUrl } from '@/lib/oauth/utils';
import { fetchMutation } from 'convex/nextjs';

/**
 * GET /api/auth/minimax
 * Initiates MiniMax OAuth flow
 */
export async function GET(req: NextRequest) {
  const provider = getProvider('minimax');
  
  if (!provider) {
    return NextResponse.json(
      { error: 'MiniMax OAuth not configured' },
      { status: 500 }
    );
  }

  if (!provider.clientId || !provider.clientSecret) {
    return NextResponse.json(
      { error: 'MiniMax OAuth credentials not set' },
      { status: 500 }
    );
  }

  // Generate state and PKCE
  const state = generateState();
  const pkce = provider.pkce ? generatePKCE() : undefined;
  
  // Get redirect URL
  const redirectUrl = `${process.env.NEXTAUTH_URL || req.nextUrl.origin}/api/auth/minimax/callback`;
  
  // Build authorization URL
  const authUrl = buildAuthorizationUrl(
    provider,
    state,
    redirectUrl,
    pkce
  );

  // Store state in Convex for validation
  try {
    await fetchMutation(
      (api) => api.oauth.createState,
      {
        state,
        provider: 'minimax',
        codeVerifier: pkce?.codeVerifier,
        redirectUrl: req.nextUrl.searchParams.get('redirect') || '/dashboard',
      },
      { url: process.env.NEXT_PUBLIC_CONVEX_URL! }
    );
  } catch (error) {
    console.error('Failed to store OAuth state:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }

  // Redirect to MiniMax
  return NextResponse.redirect(authUrl);
}
