// OAuth Provider Configurations
// Following OpenClaw's auth profile pattern

export interface OAuthProvider {
  id: string;
  name: string;
  type: 'oauth';
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  scopes: string[];
  scopeSeparator?: string;
  clientId: string;
  clientSecret: string;
  pkce?: boolean;
}

// MiniMax OAuth Configuration
export const minimaxProvider: OAuthProvider = {
  id: 'minimax',
  name: 'MiniMax',
  type: 'oauth',
  // Note: These URLs may need to be updated based on MiniMax's actual OAuth implementation
  // Check MiniMax documentation for the correct endpoints
  authorizationUrl: 'https://api.minimax.io/oauth/authorize',
  tokenUrl: 'https://api.minimax.io/oauth/token',
  userInfoUrl: 'https://api.minimax.io/user',
  scopes: ['read', 'write'],
  scopeSeparator: ' ',
  clientId: process.env.MINIMAX_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.MINIMAX_OAUTH_CLIENT_SECRET || '',
  pkce: true,
};

// Google OAuth Configuration
export const googleProvider: OAuthProvider = {
  id: 'google',
  name: 'Google',
  type: 'oauth',
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  scopes: ['openid', 'email', 'profile'],
  scopeSeparator: ' ',
  clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
  pkce: true,
};

// GitHub OAuth Configuration
export const githubProvider: OAuthProvider = {
  id: 'github',
  name: 'GitHub',
  type: 'oauth',
  authorizationUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  userInfoUrl: 'https://api.github.com/user',
  scopes: ['read:user', 'user:email'],
  scopeSeparator: ',',
  clientId: process.env.GITHUB_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET || '',
  pkce: false, // GitHub doesn't support PKCE yet
};

// Provider registry
export const oauthProviders: Record<string, OAuthProvider> = {
  minimax: minimaxProvider,
  google: googleProvider,
  github: githubProvider,
};

export function getProvider(id: string): OAuthProvider | undefined {
  return oauthProviders[id];
}

export function getAllProviders(): OAuthProvider[] {
  return Object.values(oauthProviders).filter(p => 
    p.clientId && p.clientSecret
  );
}
