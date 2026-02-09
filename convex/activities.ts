import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const log = mutation({
  args: {
    type: v.string(),
    agentId: v.string(),
    message: v.string(),
    taskId: v.optional(v.id("tasks")),
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
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
  handler: async (ctx) => {
    const allActivities = await ctx.db.query("activities").collect();
    for (const activity of allActivities) {
      await ctx.db.delete(activity._id);
    }
    return { deleted: allActivities.length };
  },
});
