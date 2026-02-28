import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function requireBridgeSecret(expected: string | undefined, provided: string) {
  if (!expected) throw new Error("BRIDGE_SECRET not configured");
  if (provided !== expected) throw new Error("unauthorized");
}

export const claim = mutation({
  args: {
    secret: v.string(),
    taskId: v.id("tasks"),
    agentId: v.string(),
  },
  handler: async (ctx, args) => {
    requireBridgeSecret(process.env.TASK_DISPATCH_BRIDGE_SECRET, args.secret);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    if (task.status !== "inbox") {
      return { ok: false, reason: "not_inbox" };
    }

    if (task.assigneeIds.length !== 1 || task.assigneeIds[0] !== args.agentId) {
      return { ok: false, reason: "assignee_mismatch" };
    }

    const now = Date.now();
    const attempts = (task.dispatch?.attempts ?? 0) + 1;

    await ctx.db.patch(args.taskId, {
      status: "assigned",
      updatedAt: now,
      dispatch: {
        claimedAt: task.dispatch?.claimedAt ?? now,
        lastDispatchAt: now,
        attempts,
        ackAt: task.dispatch?.ackAt,
        doneAt: task.dispatch?.doneAt,
      },
    });

    await ctx.db.insert("dispatchEvents", {
      taskId: args.taskId,
      agentId: args.agentId,
      type: "dispatch",
      createdAt: now,
    });

    await ctx.db.insert("activities", {
      type: "task_dispatched",
      agentId: args.agentId,
      message: `Dispatched task to ${args.agentId}`,
      taskId: args.taskId,
      createdAt: now,
    });

    return { ok: true, attempts };
  },
});

export const ack = mutation({
  args: {
    secret: v.string(),
    taskId: v.id("tasks"),
    agentId: v.string(),
    raw: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireBridgeSecret(process.env.TASK_DISPATCH_BRIDGE_SECRET, args.secret);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const now = Date.now();

    // Idempotent
    if (task.dispatch?.ackAt) return { ok: true, already: true };

    await ctx.db.patch(args.taskId, {
      status: "in_progress",
      updatedAt: now,
      dispatch: {
        claimedAt: task.dispatch?.claimedAt,
        lastDispatchAt: task.dispatch?.lastDispatchAt,
        attempts: task.dispatch?.attempts,
        ackAt: now,
        doneAt: task.dispatch?.doneAt,
      },
    });

    await ctx.db.insert("dispatchEvents", {
      taskId: args.taskId,
      agentId: args.agentId,
      type: "ack",
      raw: args.raw,
      createdAt: now,
    });

    await ctx.db.insert("activities", {
      type: "task_ack",
      agentId: args.agentId,
      message: `Agent ${args.agentId} acknowledged task`,
      taskId: args.taskId,
      createdAt: now,
    });

    return { ok: true };
  },
});

export const done = mutation({
  args: {
    secret: v.string(),
    taskId: v.id("tasks"),
    agentId: v.string(),
    raw: v.optional(v.string()),
    summary: v.optional(v.string()),
    output: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireBridgeSecret(process.env.TASK_DISPATCH_BRIDGE_SECRET, args.secret);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const now = Date.now();

    // Idempotent
    if (task.status === "done") return { ok: true, already: true };

    await ctx.db.patch(args.taskId, {
      status: "done",
      updatedAt: now,
      dispatch: {
        claimedAt: task.dispatch?.claimedAt,
        lastDispatchAt: task.dispatch?.lastDispatchAt,
        attempts: task.dispatch?.attempts,
        ackAt: task.dispatch?.ackAt,
        doneAt: now,
      },
    });

    await ctx.db.insert("dispatchEvents", {
      taskId: args.taskId,
      agentId: args.agentId,
      type: "done",
      raw: args.raw,
      createdAt: now,
    });

    if (args.output || args.summary) {
      await ctx.db.insert("messages", {
        taskId: args.taskId,
        fromAgentId: args.agentId,
        content: args.output || args.summary || "",
        createdAt: now,
      });
    }

    await ctx.db.insert("activities", {
      type: "task_done",
      agentId: args.agentId,
      message: `Agent ${args.agentId} completed task` + (args.summary ? `: ${args.summary}` : ""),
      taskId: args.taskId,
      createdAt: now,
    });

    return { ok: true };
  },
});

export const listPending = query({
  args: {
    statuses: v.array(
      v.union(v.literal("inbox"), v.literal("assigned"), v.literal("in_progress"))
    ),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("tasks").collect();
    return all.filter((t) => args.statuses.includes(t.status as any));
  },
});
