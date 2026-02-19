import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireActorMatch, requireIdentity } from "./auth";

export const register = mutation({
  args: {
    agentId: v.string(),
    name: v.string(),
    role: v.string(),
    level: v.union(v.literal("lead"), v.literal("specialist"), v.literal("intern")),
    emoji: v.string(),
    sessionKey: v.string(),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    await requireActorMatch(ctx, args.agentId);
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("agents", {
      agentId: args.agentId,
      name: args.name,
      role: args.role,
      level: args.level,
      status: "idle",
      sessionKey: args.sessionKey,
      emoji: args.emoji,
      lastHeartbeat: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    agentId: v.string(),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("blocked")),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    await requireActorMatch(ctx, args.agentId);
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    if (!agent) {
      throw new Error(`Agent not found: ${args.agentId}`);
    }

    await ctx.db.patch(agent._id, {
      status: args.status,
      lastHeartbeat: Date.now(),
    });

    return agent._id;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const getById = query({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
  },
});
