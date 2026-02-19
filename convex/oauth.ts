import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthSessionId } from "@convex-dev/auth/server";

// OAuth Token Management

/**
 * Get all OAuth tokens for the current user
 */
export const getUserTokens = query({
  args: {},
  handler: async (ctx) => {
    const sessionId = await getAuthSessionId(ctx);
    if (!sessionId) return [];

    const userId = await getUserIdFromSession(ctx, sessionId);
    if (!userId) return [];

    return await ctx.db
      .query("oauthTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

/**
 * Get a specific provider token for the current user
 */
export const getProviderToken = query({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const sessionId = await getAuthSessionId(ctx);
    if (!sessionId) return null;

    const userId = await getUserIdFromSession(ctx, sessionId);
    if (!userId) return null;

    return await ctx.db
      .query("oauthTokens")
      .withIndex("by_user_provider", (q) => 
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .first();
  },
});

/**
 * Store or update an OAuth token
 * Called by the OAuth callback handler
 */
export const storeToken = mutation({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    tokenType: v.optional(v.string()),
    metadata: v.optional(v.object({
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      image: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Get current user from session
    const sessionId = await getAuthSessionId(ctx);
    if (!sessionId) {
      throw new Error("Not authenticated");
    }

    const userId = await getUserIdFromSession(ctx, sessionId);
    if (!userId) {
      throw new Error("User not found");
    }

    const existing = await ctx.db
      .query("oauthTokens")
      .withIndex("by_user_provider", (q) => 
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing token
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        scope: args.scope,
        tokenType: args.tokenType,
        metadata: args.metadata,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new token
      return await ctx.db.insert("oauthTokens", {
        userId,
        provider: args.provider,
        providerAccountId: args.providerAccountId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        scope: args.scope,
        tokenType: args.tokenType,
        metadata: args.metadata,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Disconnect/remove an OAuth provider
 */
export const disconnectProvider = mutation({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const sessionId = await getAuthSessionId(ctx);
    if (!sessionId) {
      throw new Error("Not authenticated");
    }

    const userId = await getUserIdFromSession(ctx, sessionId);
    if (!userId) {
      throw new Error("User not found");
    }

    const token = await ctx.db
      .query("oauthTokens")
      .withIndex("by_user_provider", (q) => 
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .first();

    if (token) {
      await ctx.db.delete(token._id);
    }

    return { success: true };
  },
});

// OAuth State Management (for CSRF protection)

/**
 * Create a new OAuth state
 */
export const createState = mutation({
  args: {
    state: v.string(),
    provider: v.string(),
    codeVerifier: v.optional(v.string()),
    redirectUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    return await ctx.db.insert("oauthStates", {
      state: args.state,
      provider: args.provider,
      codeVerifier: args.codeVerifier,
      redirectUrl: args.redirectUrl,
      createdAt: now,
      expiresAt,
    });
  },
});

/**
 * Get and delete an OAuth state (one-time use)
 */
export const getAndDeleteState = mutation({
  args: { state: v.string() },
  handler: async (ctx, args) => {
    const stateRecord = await ctx.db
      .query("oauthStates")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .first();

    if (!stateRecord) {
      throw new Error("Invalid or expired state");
    }

    if (Date.now() > stateRecord.expiresAt) {
      await ctx.db.delete(stateRecord._id);
      throw new Error("State expired");
    }

    await ctx.db.delete(stateRecord._id);
    return stateRecord;
  },
});

// Helper functions

async function getUserIdFromSession(
  ctx: any,
  sessionId: string
): Promise<string | null> {
  const session = await ctx.db.get(sessionId as any);
  return session?.userId || null;
}
