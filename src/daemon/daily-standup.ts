/**
 * Mission Control Daily Standup
 * Compiles a summary of team activity from Convex and outputs it.
 *
 * Designed to be triggered by OpenClaw cron job (agentTurn)
 * which can then deliver the summary to Telegram/Discord/etc.
 *
 * Usage:
 *   npx tsx src/daemon/daily-standup.ts
 *
 * Environment:
 *   CONVEX_URL (default: production deployment)
 */

const CONVEX_URL =
  process.env.CONVEX_URL || "https://tidy-salamander-925.eu-west-1.convex.cloud";

interface Agent {
  agentId: string;
  name: string;
  role: string;
  emoji: string;
  status: string;
  level: string;
  lastHeartbeat: number;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  assigneeIds: string[];
  tags: string[];
  updatedAt: number;
  createdAt: number;
}

interface Activity {
  type: string;
  agentId: string;
  message: string;
  createdAt: number;
}

async function queryConvex<T>(path: string, args: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });

  const data = await response.json();
  if (data.status === "error") {
    throw new Error(`Convex error: ${data.errorMessage}`);
  }
  return data.value as T;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

async function generateStandup(): Promise<string> {
  const [agents, tasks, activities] = await Promise.all([
    queryConvex<Agent[]>("agents:getAll"),
    queryConvex<Task[]>("tasks:getAll"),
    queryConvex<Activity[]>("activities:getRecent", { limit: 50 }),
  ]);

  const now = Date.now();
  const oneDayAgo = now - 86400000;

  // --- Task Breakdown ---
  const tasksByStatus: Record<string, Task[]> = {};
  for (const task of tasks) {
    if (!tasksByStatus[task.status]) tasksByStatus[task.status] = [];
    tasksByStatus[task.status].push(task);
  }

  const urgent = tasks.filter((t) => t.priority === "urgent" && t.status !== "done");
  const recentlyCompleted = tasks.filter(
    (t) => t.status === "done" && t.updatedAt > oneDayAgo
  );
  const recentlyCreated = tasks.filter((t) => t.createdAt > oneDayAgo);

  // --- Agent Status ---
  const agentMap = new Map(agents.map((a) => [a.agentId, a]));

  // --- Recent Activity (last 24h) ---
  const recentActivities = activities.filter((a) => a.createdAt > oneDayAgo);

  // --- Build Report ---
  const lines: string[] = [];

  lines.push("# 📋 Mission Control — Daily Standup");
  lines.push(`*${new Date().toUTCString()}*`);
  lines.push("");

  // Overview
  lines.push("## 🎯 Overview");
  lines.push(`- **Total tasks:** ${tasks.length}`);
  lines.push(
    `- **In progress:** ${(tasksByStatus["in_progress"] || []).length}`
  );
  lines.push(`- **In review:** ${(tasksByStatus["review"] || []).length}`);
  lines.push(`- **Blocked:** ${(tasksByStatus["blocked"] || []).length}`);
  lines.push(`- **Done (24h):** ${recentlyCompleted.length}`);
  lines.push(`- **New (24h):** ${recentlyCreated.length}`);
  lines.push("");

  // Urgent items
  if (urgent.length > 0) {
    lines.push("## 🚨 Urgent");
    for (const t of urgent) {
      const assignees = t.assigneeIds
        .map((id) => agentMap.get(id)?.name || id)
        .join(", ");
      lines.push(`- **${t.title}** → ${assignees} [${t.status}]`);
    }
    lines.push("");
  }

  // Squad Status
  lines.push("## 👥 Squad Status");
  for (const agent of agents) {
    const heartbeatAge = timeAgo(agent.lastHeartbeat);
    const statusEmoji =
      agent.status === "working"
        ? "🟢"
        : agent.status === "idle"
        ? "⚪"
        : "🔴";
    lines.push(
      `- ${agent.emoji} **${agent.name}** (${agent.role}) — ${statusEmoji} ${agent.status} | last seen ${heartbeatAge}`
    );
  }
  lines.push("");

  // In Progress
  const inProgress = tasksByStatus["in_progress"] || [];
  if (inProgress.length > 0) {
    lines.push("## 🔨 In Progress");
    for (const t of inProgress) {
      const assignees = t.assigneeIds
        .map((id) => agentMap.get(id)?.name || id)
        .join(", ");
      lines.push(`- **${t.title}** → ${assignees}`);
    }
    lines.push("");
  }

  // In Review
  const inReview = tasksByStatus["review"] || [];
  if (inReview.length > 0) {
    lines.push("## 👀 Awaiting Review");
    for (const t of inReview) {
      lines.push(`- **${t.title}** (updated ${timeAgo(t.updatedAt)})`);
    }
    lines.push("");
  }

  // Recent Activity
  if (recentActivities.length > 0) {
    lines.push("## 📊 Recent Activity (24h)");
    const activityCounts: Record<string, number> = {};
    for (const a of recentActivities) {
      activityCounts[a.type] = (activityCounts[a.type] || 0) + 1;
    }
    for (const [type, count] of Object.entries(activityCounts).sort(
      (a, b) => b[1] - a[1]
    )) {
      lines.push(`- ${type.replace(/_/g, " ")}: **${count}**`);
    }
    lines.push("");
  }

  // Completed
  if (recentlyCompleted.length > 0) {
    lines.push("## ✅ Completed (24h)");
    for (const t of recentlyCompleted) {
      lines.push(`- ${t.title}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("*Generated by Mission Control Standup Bot*");

  return lines.join("\n");
}

// Main
generateStandup()
  .then((report) => {
    process.stdout.write(report);
  })
  .catch((err) => {
    process.stderr.write(`Standup generation failed: ${err.message}\n`);
    process.exit(1);
  });
