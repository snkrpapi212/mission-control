# OAuth Setup Guide for Mission Control

This guide walks you through setting up OAuth authentication for Mission Control, similar to how OpenClaw handles authentication with providers like MiniMax.

## What's Implemented

### Backend (Convex + Next.js)
- ✅ OAuth token storage schema (`oauthTokens`, `oauthStates`)
- ✅ MiniMax OAuth flow handlers (`/api/auth/minimax`)
- ✅ PKCE support for secure OAuth flows
- ✅ CSRF protection with state parameter
- ✅ Token storage and retrieval mutations

### Frontend
- ✅ OAuth sign-in buttons component (`OAuthButtons.tsx`)
- ✅ Connected accounts management (`ConnectedAccounts.tsx`)
- ✅ Updated login page with OAuth options

### Supported Providers
1. **MiniMax** - Primary target (similar to OpenClaw's `minimax-portal-auth`)
2. **Google** - Standard OAuth 2.0
3. **GitHub** - OAuth 2.0 (without PKCE)

## Setup Instructions

### 1. Configure Environment Variables

Copy the example file:
```bash
cp .env.oauth.example .env.local
```

Fill in your credentials:

#### MiniMax OAuth
1. Go to [MiniMax Developer Portal](https://www.minimaxi.com/)
2. Create a new OAuth application
3. Set redirect URI to: `https://your-domain.com/api/auth/minimax/callback`
4. Copy Client ID and Secret to `.env.local`:
```bash
MINIMAX_OAUTH_CLIENT_ID=your_minimax_client_id
MINIMAX_OAUTH_CLIENT_SECRET=your_minimax_client_secret
```

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Set redirect URI to: `https://your-domain.com/api/auth/google/callback`
4. Add credentials to `.env.local`:
```bash
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
```

#### GitHub OAuth
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth app
3. Set redirect URI to: `https://your-domain.com/api/auth/github/callback`
4. Add credentials to `.env.local`:
```bash
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret
```

### 2. Update Convex Schema

Add the OAuth tables to your `convex/schema.ts`:

```typescript
import { oauthTables } from "./oauthSchema";

export default defineSchema({
  // ... existing tables ...
  ...oauthTables,
});
```

### 3. Deploy Convex Functions

```bash
cd /data/workspace/mission-control
npx convex dev  # or npx convex deploy for production
```

### 4. Restart Next.js Dev Server

```bash
npm run dev
```

### 5. Test OAuth Flow

1. Go to `http://localhost:3000/login`
2. Click "Sign in with MiniMax" (or other provider)
3. Complete OAuth flow on provider's site
4. You should be redirected back to the dashboard

## Architecture

### How It Works (OpenClaw-Style)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   OAuth     │────▶│   MiniMax   │
│   Page      │     │   Initiate  │     │   Auth      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  User       │
                                        │  Grants     │
                                        │  Permission │
                                        └──────┬──────┘
                                               │
┌─────────────┐     ┌─────────────┐           │
│  Dashboard  │◀────│   Store     │◀──────────┘
│  (Logged In)│     │   Tokens    │
└─────────────┘     └─────────────┘
```

### Security Features

1. **PKCE** (Proof Key for Code Exchange) - Prevents authorization code interception
2. **State Parameter** - CSRF protection
3. **Secure Token Storage** - Tokens stored in Convex, never client-side
4. **Short-lived States** - OAuth states expire after 10 minutes
5. **HTTPS Only** - All OAuth flows require HTTPS in production

## Adding More Providers

To add a new OAuth provider:

1. Add provider config to `src/lib/oauth/providers.ts`:
```typescript
export const myProvider: OAuthProvider = {
  id: 'myprovider',
  name: 'My Provider',
  type: 'oauth',
  authorizationUrl: 'https://myprovider.com/oauth/authorize',
  tokenUrl: 'https://myprovider.com/oauth/token',
  userInfoUrl: 'https://myprovider.com/user',
  scopes: ['read', 'write'],
  clientId: process.env.MYPROVIDER_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.MYPROVIDER_OAUTH_CLIENT_SECRET || '',
  pkce: true,
};
```

2. Create API routes:
   - `src/app/api/auth/myprovider/route.ts`
   - `src/app/api/auth/myprovider/callback/route.ts`

3. Add button to `OAuthButtons.tsx`

## Troubleshooting

### "Invalid or expired state" error
- State parameter expired (valid for 10 minutes)
- User took too long to complete OAuth flow
- Try signing in again

### "Token exchange failed" error
- Check client ID and secret are correct
- Verify redirect URI matches exactly in provider settings
- Check provider's OAuth documentation for any special requirements

### Tokens not appearing in Convex
- Check browser console for errors
- Verify Convex URL is set correctly
- Check Convex dashboard for function errors

## Next Steps

- [ ] Register OAuth apps with MiniMax, Google, GitHub
- [ ] Add token refresh logic for expired tokens
- [ ] Add user profile sync from OAuth providers
- [ ] Implement account linking (connect multiple providers)
- [ ] Add OAuth disconnect confirmation dialogs

## References

- OpenClaw auth config: `backups/agents_purge_2026_02_13/new_openclaw.json`
- OAuth 2.1 spec: https://oauth.net/2.1/
- PKCE: https://oauth.net/2/pkce/
