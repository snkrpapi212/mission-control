# OAuth Implementation Plan for Mission Control

## Goal
Add OAuth authentication to Mission Control CRM, starting with MiniMax as the primary provider (following OpenClaw's pattern).

## Architecture (OpenClaw-Style)

### 1. Auth Provider Configuration
```typescript
// config/auth.ts
export const authProviders = {
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    type: 'oauth',
    authorizationUrl: 'https://api.minimax.io/oauth/authorize',
    tokenUrl: 'https://api.minimax.io/oauth/token',
    userInfoUrl: 'https://api.minimax.io/user',
    scopes: ['read', 'write'],
    clientId: process.env.MINIMAX_OAUTH_CLIENT_ID,
    clientSecret: process.env.MINIMAX_OAUTH_CLIENT_SECRET,
  },
  google: {
    id: 'google',
    name: 'Google',
    type: 'oauth',
    // ... Google OAuth config
  },
  // Add more providers as needed
};
```

### 2. Convex Schema Updates
```typescript
// convex/schema.ts additions
tokens: defineTable({
  userId: v.id('users'),
  provider: v.string(),      // 'minimax', 'google', etc.
  accessToken: v.string(),
  refreshToken: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  scope: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_provider_user', ['provider', 'userId']),

oauthStates: defineTable({
  state: v.string(),         // CSRF protection
  provider: v.string(),
  redirectUrl: v.string(),
  createdAt: v.number(),
  expiresAt: v.number(),
})
  .index('by_state', ['state']),
```

### 3. API Routes (Next.js App Router)

```typescript
// src/app/api/auth/[provider]/route.ts
// Initiates OAuth flow - redirects to provider

// src/app/api/auth/[provider]/callback/route.ts
// Handles OAuth callback, exchanges code for tokens

// src/app/api/auth/logout/route.ts
// Clears session and tokens
```

### 4. Frontend Components

```typescript
// src/components/auth/OAuthButtons.tsx
// Renders "Sign in with MiniMax", "Sign in with Google" buttons

// src/components/auth/TokenManager.tsx
// Manages connected accounts, allows disconnecting
```

### 5. Environment Variables

```bash
# OAuth Providers
MINIMAX_OAUTH_CLIENT_ID=
MINIMAX_OAUTH_CLIENT_SECRET=

GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

# Session
NEXTAUTH_SECRET=           # JWT signing secret
NEXTAUTH_URL=              # Your app URL
```

## Implementation Steps

### Phase 1: MiniMax OAuth (MVP)
1. Register OAuth app with MiniMax
2. Add Convex schema for tokens
3. Create OAuth callback handlers
4. Add "Sign in with MiniMax" button
5. Store tokens securely in Convex

### Phase 2: Token Refresh & Management
1. Automatic token refresh before expiry
2. Token management UI (disconnect/revoke)
3. Multi-provider account linking

### Phase 3: Additional Providers
1. Google OAuth
2. GitHub OAuth
3. Custom provider support

## Security Considerations

1. **PKCE Flow** - Use PKCE for all OAuth flows (required by OAuth 2.1)
2. **State Parameter** - Always validate state to prevent CSRF
3. **Token Storage** - Never expose tokens client-side
4. **HTTPS Only** - All OAuth flows must use HTTPS
5. **Short-lived States** - OAuth state params expire quickly (5-10 min)

## OpenClaw Pattern Reference

OpenClaw's auth system:
- Stores profiles in `auth-profiles.json`
- Uses plugins for each provider (`minimax-portal-auth`)
- Supports multiple auth modes: `oauth`, `api_key`, `token`
- Each provider handles its own token refresh

We can adapt this pattern using:
- Convex as the "auth-profiles.json" store
- Next.js API routes as the "plugin" handlers
- React components for the UI layer

## Files to Create/Modify

### New Files:
- `convex/oauth.ts` - OAuth mutations/queries
- `src/lib/oauth/` - OAuth provider implementations
- `src/app/api/auth/[provider]/route.ts` - OAuth initiation
- `src/app/api/auth/[provider]/callback/route.ts` - OAuth callback
- `src/components/auth/OAuthButtons.tsx` - Sign-in buttons
- `src/components/auth/ConnectedAccounts.tsx` - Token management

### Modified:
- `convex/schema.ts` - Add tokens/oauthStates tables
- `convex/auth.ts` - Add OAuth identity helpers
- `src/app/login/LoginClient.tsx` - Add OAuth buttons
- `src/middleware.ts` - Handle OAuth sessions

## Next Actions

1. Get MiniMax OAuth credentials (register app)
2. Set up environment variables
3. Implement Convex schema changes
4. Create OAuth callback handlers
5. Add frontend sign-in buttons

Want me to start implementing this?
