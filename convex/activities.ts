import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireActorMatch, requireIdentity } from "./auth";

export const log = mutation({
  args: {
    type: v.string(),
    agentId: v.string(),
    message: v.string(),
    taskId: v.optional(v.id("tasks")),
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    await requireActorMatch(ctx, args.agentId);
    return await ctx.db.insert("activities", {
      type: args.type,
      agentId: args.agentId,
      message: args.message,
      taskId: args.taskId,
      documentId: args.documentId,
      createdAt: Date.now(),
    });
  },
});

export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_time", (q) => q.gte("createdAt", 0))
      .order("desc")
      .take(limit);
    return activities;
  },
});

export const clearAll = mutation({
  args: {
    adminKey: v.string(),
    confirm: v.literal("DELETE_ALL_ACTIVITIES"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.adminKey !== process.env.MC_ADMIN_KEY) {
      throw new Error("Unauthorized");
    }
    const allActivities = await ctx.db.query("activities").collect();
    for (const activity of allActivities) {
      await ctx.db.delete(activity._id);
    }
    return { deleted: allActivities.length };
  },
});
