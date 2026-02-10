import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity } from "./auth";

export const getUndelivered = query({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    return await ctx.db
      .query("notifications")
      .withIndex("by_agent_undelivered", (q) =>
        q.eq("mentionedAgentId", args.agentId).eq("delivered", false)
      )
      .collect();
  },
});

export const markDelivered = mutation({
  args: {
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    await ctx.db.patch(args.id, {
      delivered: true,
    });
    return args.id;
  },
});

export const createBulk = mutation({
  args: {
    notifications: v.array(v.object({
      mentionedAgentId: v.string(),
      fromAgentId: v.string(),
      content: v.string(),
      taskId: v.optional(v.id("tasks")),
    })),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const ids = [];
    const now = Date.now();

    for (const notif of args.notifications) {
      const id = await ctx.db.insert("notifications", {
        mentionedAgentId: notif.mentionedAgentId,
        fromAgentId: notif.fromAgentId,
        content: notif.content,
        taskId: notif.taskId,
        delivered: false,
        createdAt: now,
      });
      ids.push(id);
    }

    return ids;
  },
});
