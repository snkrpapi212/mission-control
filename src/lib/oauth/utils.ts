import crypto from 'crypto';
import { OAuthProvider } from './providers';

/**
 * Generate a random state parameter for OAuth CSRF protection
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Build OAuth authorization URL
 */
export function buildAuthorizationUrl(
  provider: OAuthProvider,
  state: string,
  redirectUri: string,
  pkce?: { codeChallenge: string; codeChallengeMethod: string }
): string {
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope: provider.scopes.join(provider.scopeSeparator || ' '),
  });

  if (pkce && provider.pkce) {
    params.set('code_challenge', pkce.codeChallenge);
    params.set('code_challenge_method', pkce.codeChallengeMethod);
  }

  return `${provider.authorizationUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}> {
  const params = new URLSearchParams({
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  if (codeVerifier && provider.pkce) {
    params.set('code_verifier', codeVerifier);
  }

  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Fetch user info from provider
 */
export async function fetchUserInfo(
  provider: OAuthProvider,
  accessToken: string
): Promise<{
  id: string;
  email?: string;
  name?: string;
  image?: string;
}> {
  if (!provider.userInfoUrl) {
    throw new Error('Provider does not support user info');
  }

  const response = await fetch(provider.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  const data = await response.json();

  // Normalize user info across providers
  return normalizeUserInfo(provider.id, data);
}

/**
 * Normalize user info from different providers
 */
function normalizeUserInfo(
  providerId: string,
  data: any
): { id: string; email?: string; name?: string; image?: string } {
  switch (providerId) {
    case 'google':
      return {
        id: data.id || data.sub,
        email: data.email,
        name: data.name,
        image: data.picture,
      };
    case 'github':
      return {
        id: String(data.id),
        email: data.email,
        name: data.name || data.login,
        image: data.avatar_url,
      };
    case 'minimax':
      // Adjust based on MiniMax's actual response format
      return {
        id: data.id || data.user_id,
        email: data.email,
        name: data.name || data.username,
        image: data.avatar,
      };
    default:
      return {
        id: String(data.id || data.sub || data.user_id),
        email: data.email,
        name: data.name || data.username,
        image: data.picture || data.avatar || data.avatar_url,
      };
  }
}
