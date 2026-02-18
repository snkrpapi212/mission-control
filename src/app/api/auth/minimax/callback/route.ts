import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/oauth/providers';
import { exchangeCodeForTokens, fetchUserInfo } from '@/lib/oauth/utils';
import { fetchMutation } from 'convex/nextjs';

/**
 * GET /api/auth/minimax/callback
 * Handles MiniMax OAuth callback
 */
export async function GET(req: NextRequest) {
  const provider = getProvider('minimax');
  
  if (!provider) {
    return NextResponse.redirect(
      `/login?error=oauth_not_configured`
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `/login?error=${error}&provider=minimax`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `/login?error=invalid_callback`
    );
  }

  // Validate state and get code verifier
  let codeVerifier: string | undefined;
  let redirectUrl = '/dashboard';
  
  try {
    const stateRecord = await fetchMutation(
      (api) => api.oauth.getAndDeleteState,
      { state },
      { url: process.env.NEXT_PUBLIC_CONVEX_URL! }
    );
    
    codeVerifier = stateRecord.codeVerifier;
    redirectUrl = stateRecord.redirectUrl;
  } catch {
    return NextResponse.redirect(
      `/login?error=invalid_state`
    );
  }

  // Exchange code for tokens
  let tokens;
  try {
    const tokenUrl = `${process.env.NEXTAUTH_URL || req.nextUrl.origin}/api/auth/minimax/callback`;
    tokens = await exchangeCodeForTokens(provider, code, tokenUrl, codeVerifier);
  } catch (err) {
    console.error('Token exchange failed:', err);
    return NextResponse.redirect(
      `/login?error=token_exchange_failed`
    );
  }

  // Fetch user info
  let userInfo;
  try {
    userInfo = await fetchUserInfo(provider, tokens.access_token);
  } catch (err) {
    console.error('Failed to fetch user info:', err);
    // Continue without user info
    userInfo = { id: 'unknown' };
  }

  // Store tokens in Convex
  try {
    await fetchMutation(
      (api) => api.oauth.storeToken,
      {
        provider: 'minimax',
        providerAccountId: userInfo.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in 
          ? Date.now() + tokens.expires_in * 1000 
          : undefined,
        scope: tokens.scope,
        tokenType: tokens.token_type,
        metadata: {
          email: userInfo.email,
          name: userInfo.name,
          image: userInfo.image,
        },
      },
      { url: process.env.NEXT_PUBLIC_CONVEX_URL! }
    );
  } catch (err) {
    console.error('Failed to store token:', err);
    return NextResponse.redirect(
      `/login?error=storage_failed`
    );
  }

  // Create session (you may need to adjust this based on your auth setup)
  const res = NextResponse.redirect(redirectUrl);
  
  // Set session cookie
  res.cookies.set('mc_session', process.env.MC_SESSION_TOKEN || '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });

  return res;
}
