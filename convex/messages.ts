import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    fromAgentId: v.string(),
    content: v.string(),
    mentions: v.optional(v.array(v.string())),
    attachmentIds: v.optional(v.array(v.id("documents"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create message
    const messageId = await ctx.db.insert("messages", {
      taskId: args.taskId,
      fromAgentId: args.fromAgentId,
      content: args.content,
      mentions: args.mentions,
      attachmentIds: args.attachmentIds,
      createdAt: now,
    });

    // Auto-subscribe commenter
    const task = await ctx.db.get(args.taskId);
    if (task) {
      const updatedSubscribers = Array.from(
        new Set([...task.subscriberIds, args.fromAgentId])
      );
      await ctx.db.patch(args.taskId, {
        subscriberIds: updatedSubscribers,
      });
    }

    // Create activity
    await ctx.db.insert("activities", {
      type: "message_sent",
      agentId: args.fromAgentId,
      message: `Commented on task`,
      taskId: args.taskId,
      createdAt: now,
    });

    // Create notifications for mentions
    if (args.mentions && args.mentions.length > 0) {
      for (const mentionedId of args.mentions) {
        await ctx.db.insert("notifications", {
          mentionedAgentId: mentionedId,
          fromAgentId: args.fromAgentId,
          content: args.content,
          taskId: args.taskId,
          delivered: false,
          createdAt: now,
        });
      }
    }

    // Notify all subscribers except commenter
    if (task) {
      const notifyIds = task.subscriberIds.filter(
        (id: string) => id !== args.fromAgentId
      );
      for (const notifyId of notifyIds) {
        // Skip if already notified via mention
        if (args.mentions && args.mentions.includes(notifyId)) {
          continue;
        }

        await ctx.db.insert("notifications", {
          mentionedAgentId: notifyId,
          fromAgentId: args.fromAgentId,
          content: args.content,
          taskId: args.taskId,
          delivered: false,
          createdAt: now,
        });
      }
    }

    return messageId;
  },
});

export const getByTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});
