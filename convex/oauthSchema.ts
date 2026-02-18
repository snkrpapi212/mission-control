import { v } from "convex/values";
import { defineTable } from "convex/server";

// Add these to your convex/schema.ts

export const oauthTables = {
  // OAuth tokens for connected providers
  oauthTokens: defineTable({
    userId: v.id("users"),
    provider: v.string(),           // 'minimax', 'google', 'github', etc.
    providerAccountId: v.string(),  // User's ID from the provider
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),  // Unix timestamp
    scope: v.optional(v.string()),
    tokenType: v.optional(v.string()),  // 'bearer', etc.
    metadata: v.optional(v.object({
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      image: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_provider_account", ["provider", "providerAccountId"])
    .index("by_user_provider", ["userId", "provider"]),

  // OAuth state for CSRF protection
  oauthStates: defineTable({
    state: v.string(),              // Random state parameter
    provider: v.string(),           // Which provider
    codeVerifier: v.optional(v.string()), // PKCE code verifier
    redirectUrl: v.string(),        // Where to redirect after auth
    createdAt: v.number(),
    expiresAt: v.number(),          // Clean up old states
  })
    .index("by_state", ["state"])
    .index("by_expires", ["expiresAt"]),

  // Users table (if not already existing)
  users: defineTable({
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.optional(v.string()),   // 'admin', 'viewer', etc.
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]),
};
