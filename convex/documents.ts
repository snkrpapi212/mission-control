import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireIdentity } from "./auth";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("deliverable"),
      v.literal("research"),
      v.literal("protocol"),
      v.literal("analysis"),
      v.literal("draft")
    ),
    taskId: v.optional(v.id("tasks")),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const now = Date.now();

    const docId = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      type: args.type,
      taskId: args.taskId,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });

    // Log activity
    await ctx.db.insert("activities", {
      type: "document_created",
      agentId: args.createdBy,
      message: `Created ${args.type}: ${args.title}`,
      taskId: args.taskId,
      documentId: docId,
      createdAt: now,
    });

    return docId;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title) {
      updates.title = args.title;
    }

    if (args.content) {
      updates.content = args.content;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const getByTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const getByType = query({
  args: {
    type: v.union(
      v.literal("deliverable"),
      v.literal("research"),
      v.literal("protocol"),
      v.literal("analysis"),
      v.literal("draft")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});
