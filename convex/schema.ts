import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    agentId: v.string(),
    name: v.string(),
    role: v.string(),
    level: v.union(v.literal("lead"), v.literal("specialist"), v.literal("intern")),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("blocked")),
    currentTaskId: v.optional(v.id("tasks")),
    sessionKey: v.string(),
    lastHeartbeat: v.number(),
    emoji: v.string(),
  }).index("by_agentId", ["agentId"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    assigneeIds: v.array(v.string()),
    subscriberIds: v.array(v.string()),
    createdBy: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_updated", ["updatedAt"]),

  messages: defineTable({
    taskId: v.id("tasks"),
    fromAgentId: v.string(),
    content: v.string(),
    attachmentIds: v.optional(v.array(v.id("documents"))),
    mentions: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }).index("by_task", ["taskId"])
    .index("by_time", ["createdAt"]),

  documents: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_task", ["taskId"])
    .index("by_type", ["type"]),

  activities: defineTable({
    type: v.string(),
    agentId: v.string(),
    message: v.string(),
    taskId: v.optional(v.id("tasks")),
    documentId: v.optional(v.id("documents")),
    createdAt: v.number(),
  }).index("by_time", ["createdAt"]),

  notifications: defineTable({
    mentionedAgentId: v.string(),
    fromAgentId: v.string(),
    content: v.string(),
    taskId: v.optional(v.id("tasks")),
    delivered: v.boolean(),
    createdAt: v.number(),
  }).index("by_agent_undelivered", ["mentionedAgentId", "delivered"])
    .index("by_time", ["createdAt"]),
});
