import fs from "node:fs";
import path from "node:path";

import { gatewayCall, startAgentRun, sendToAgent } from "../lib/openclaw-client";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const SECRET = process.env.TASK_DISPATCH_BRIDGE_SECRET;
const INTERVAL_MS = parseInt(process.env.TASK_DISPATCH_INTERVAL_MS || "30000", 10);
const STATE_PATH =
  process.env.TASK_DISPATCH_STATE_PATH ||
  "/opt/mission-control/.dispatch/state.json";

const ADMIN_SCOPES = ["operator.admin"]; // to run agent + wait

type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeIds: string[];
  dispatch?: { claimedAt?: number; ackAt?: number; doneAt?: number; runId?: string };
};

type State = {
  lastSeen: Record<string, unknown>;
};

function loadState(): State {
  try {
    if (fs.existsSync(STATE_PATH)) {
      return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as State;
    }
  } catch {
    // ignore
  }
  return { lastSeen: {} };
}

function saveState(state: State) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

async function convexRun(functionName: string, args: Record<string, unknown>) {
  if (!CONVEX_URL) throw new Error("CONVEX_URL missing");
  const res = await fetch(`${CONVEX_URL}/api/run/${functionName}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ args }),
  });
  const data = await res.json();
  if (data?.status === "error") throw new Error(data.message || "convex error");
  return data?.value;
}

async function getTasksByStatus(status: string): Promise<Task[]> {
  if (!CONVEX_URL) return [];
  const res = await fetch(`${CONVEX_URL}/api/run/tasks/getByStatus`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ args: { status } }),
  });
  const data = await res.json();
  if (data?.status === "error") throw new Error(data.message || "convex error");
  return (data?.value || []) as Task[];
}

function isSingleAssignee(task: Task): string | null {
  if (!Array.isArray(task.assigneeIds) || task.assigneeIds.length !== 1) return null;
  return task.assigneeIds[0] || null;
}

function buildTaskPrompt(task: Task) {
  return `Mission Control Task\n\nTASK_ID: ${task._id}\nTITLE: ${task.title}\nPRIORITY: ${task.priority}\n\nDESCRIPTION:\n${task.description}\n\nReturn a short response when finished.`;
}

async function dispatchInboxTasks() {
  if (!SECRET) {
    console.log("[dispatcher] disabled: missing TASK_DISPATCH_BRIDGE_SECRET");
    return;
  }

  const inbox = await getTasksByStatus("inbox");
  for (const task of inbox) {
    const agentId = isSingleAssignee(task);
    if (!agentId) continue; // skip multi/no-assignee

    // Claim
    const claim = await convexRun("dispatcher/claim", {
      secret: SECRET,
      taskId: task._id,
      agentId,
    });
    if (!claim?.ok) continue;

    // Start run
    const run = await startAgentRun(agentId, buildTaskPrompt(task), ADMIN_SCOPES);
    if (!run.ok || !run.runId) {
      console.error("[dispatcher] startAgentRun failed", run.error);
      continue;
    }

    await convexRun("dispatcher/setRun", {
      secret: SECRET,
      taskId: task._id,
      agentId,
      runId: run.runId,
    });

    // Send a copy to the main session too (optional)
    await sendToAgent(agentId, buildTaskPrompt(task), `agent:${agentId}:main`, ADMIN_SCOPES).catch(
      () => undefined
    );

    // Immediately ACK → in_progress
    await convexRun("dispatcher/ack", {
      secret: SECRET,
      taskId: task._id,
      agentId,
      raw: JSON.stringify({ mc: "auto-ack", runId: run.runId }),
    });

    console.log(`[dispatcher] started run ${run.runId} for ${task._id}`);
  }
}

async function advanceRuns() {
  if (!SECRET) return;

  const inprog = await getTasksByStatus("in_progress");
  for (const task of inprog) {
    const agentId = isSingleAssignee(task);
    if (!agentId) continue;
    const runId = task.dispatch?.runId;
    if (!runId) continue;

    const snap = await gatewayCall<any>(
      "agent.wait",
      { runId, timeoutMs: 1000 },
      5000,
      ADMIN_SCOPES
    );

    if (snap?.status === "ok") {
      await convexRun("dispatcher/done", {
        secret: SECRET,
        taskId: task._id,
        agentId,
        raw: JSON.stringify(snap),
        summary: "completed",
        output: JSON.stringify(snap),
      });
      console.log(`[dispatcher] done task ${task._id} run ${runId}`);
    }
  }
}

async function tick() {
  try {
    await dispatchInboxTasks();
    await advanceRuns();
  } catch (err) {
    console.error("[dispatcher] tick error", (err as Error).message);
  }
}

console.log(`[dispatcher] starting intervalMs=${INTERVAL_MS}`);
void tick();
setInterval(() => void tick(), INTERVAL_MS);
