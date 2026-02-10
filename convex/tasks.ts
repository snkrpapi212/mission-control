import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireIdentity } from "./auth";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assigneeIds: v.array(v.string()),
    createdBy: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "inbox",
      priority: args.priority,
      assigneeIds: args.assigneeIds,
      subscriberIds: args.assigneeIds,
      createdBy: args.createdBy,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activities", {
      type: "task_created",
      agentId: args.createdBy,
      message: `Created task: ${args.title}`,
      taskId,
      createdAt: now,
    });

    return taskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    status: v.optional(v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    )),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    assigneeIds: v.optional(v.array(v.string())),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.status && args.status !== task.status) {
      updates.status = args.status;
    }

    if (args.priority) {
      updates.priority = args.priority;
    }

    if (args.assigneeIds) {
      updates.assigneeIds = args.assigneeIds;
      updates.subscriberIds = Array.from(
        new Set([...task.subscriberIds, ...args.assigneeIds])
      );
    }

    await ctx.db.patch(args.id, updates);

    if (args.status && args.status !== task.status) {
      await ctx.db.insert("activities", {
        type: "status_changed",
        agentId: args.agentId,
        message: `Changed status from ${task.status} to ${args.status}`,
        taskId: args.id,
        createdAt: Date.now(),
      });
    }

    return args.id;
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const getAssigned = query({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    const allTasks = await ctx.db.query("tasks").collect();
    return allTasks.filter((task) => task.assigneeIds.includes(args.agentId));
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const clearAll = mutation({
  args: {
    adminKey: v.string(),
    confirm: v.literal("DELETE_ALL_TASKS"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.adminKey !== process.env.MC_ADMIN_KEY) {
      throw new Error("Unauthorized");
    }
    const allTasks = await ctx.db.query("tasks").collect();
    for (const task of allTasks) {
      await ctx.db.delete(task._id);
    }
    return { deleted: allTasks.length };
  },
});
