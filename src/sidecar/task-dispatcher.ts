import fs from "node:fs";
import path from "node:path";

import { gatewayCall, sendToAgent } from "../lib/openclaw-client";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const SECRET = process.env.TASK_DISPATCH_BRIDGE_SECRET;
const INTERVAL_MS = parseInt(process.env.TASK_DISPATCH_INTERVAL_MS || "30000", 10);
const STATE_PATH =
  process.env.TASK_DISPATCH_STATE_PATH ||
  "/opt/mission-control/.dispatch/state.json";

const ADMIN_SCOPES = ["operator.admin"]; // for sessions.history / send / spawn

type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeIds: string[];
  dispatch?: { claimedAt?: number; ackAt?: number; doneAt?: number };
};

type State = {
  lastSeen: Record<string, { sessionKey: string; lastMsgTs?: number }>;
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

function buildDispatchPrompt(task: Task) {
  const callbackBase = process.env.DISPATCH_CALLBACK_BASE || "http://134.209.163.192";
  return `You are the OpenClaw agent assigned to a Mission Control task.\n\nTASK_ID: ${task._id}\nTITLE: ${task.title}\nPRIORITY: ${task.priority}\n\nDESCRIPTION:\n${task.description}\n\nProtocol (REQUIRED):\nYou must POST your ACK and DONE as JSON to Mission Control callbacks.\n\nACK:\nPOST ${callbackBase}/api/dispatch/ack\nHeader: x-dispatch-secret: ${process.env.DISPATCH_CALLBACK_SECRET}\nBody: {"mc":"ack","taskId":"${task._id}","agentId":"${task.assigneeIds[0]}"}\n\nDONE:\nPOST ${callbackBase}/api/dispatch/done\nHeader: x-dispatch-secret: ${process.env.DISPATCH_CALLBACK_SECRET}\nBody: {"mc":"done","taskId":"${task._id}","agentId":"${task.assigneeIds[0]}","summary":"...","output":"..."}\n\nDo NOT wrap JSON in code fences. The POST bodies must be single-line JSON.`;
}

function tryParseMcJson(line: string): any | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
  try {
    const obj = JSON.parse(trimmed);
    if (obj && (obj.mc === "ack" || obj.mc === "done") && typeof obj.taskId === "string") return obj;
  } catch {
    // ignore
  }
  return null;
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

    // NOTE: Gateway does not expose `sessions.spawn` RPC.
    // We dispatch into the canonical agent session instead.
    const sessionKey = `agent:${agentId}:main`;

    await convexRun("dispatcher/setSessionKey", {
      secret: SECRET,
      taskId: task._id,
      agentId,
      sessionKey,
    });

    const sendRes = await sendToAgent(
      agentId,
      buildDispatchPrompt(task),
      sessionKey,
      ADMIN_SCOPES
    );
    if (!sendRes.ok) {
      console.error("[dispatcher] send failed", sendRes.error);
      continue;
    }

    console.log(`[dispatcher] dispatched ${task._id} -> ${agentId} session=${sessionKey}`);
  }
}

async function processReplies() {
  if (!SECRET) return;
  const state = loadState();

  const assigned = await getTasksByStatus("assigned");
  const inprog = await getTasksByStatus("in_progress");
  const tasks = [...assigned, ...inprog];

  for (const task of tasks) {
    const agentId = isSingleAssignee(task);
    if (!agentId) continue;

    const sessionKey = task.dispatch?.sessionKey || `agent:${agentId}:main`;

    // Use gateway transcript preview (supported) instead of sessions.history.
    const previewRes = await gatewayCall<{ previews: any[] }>(
      "sessions.preview",
      { keys: [sessionKey], limit: 12, maxChars: 800 },
      30000,
      ["operator.read"]
    );

    const previews = (previewRes as any)?.previews || [];
    const items: any[] = previews?.[0]?.items || [];

    const lastSeenTs = state.lastSeen[task._id]?.lastMsgTs || 0;

    // scan items oldest->newest, but only handle new ones
    for (const it of items) {
      const ts = Number(it?.ts || it?.createdAt || 0);
      if (ts && ts <= lastSeenTs) continue;

      const text = String(it?.text || "");
      const parsed = tryParseMcJson(text);
      if (!parsed) continue;
      if (parsed.taskId !== task._id) continue;

      if (parsed.mc === "ack" && task.status === "assigned") {
        await convexRun("dispatcher/ack", {
          secret: SECRET,
          taskId: task._id,
          agentId,
          raw: text,
        });
        console.log(`[dispatcher] ack ${task._id}`);
      }

      if (parsed.mc === "done") {
        await convexRun("dispatcher/done", {
          secret: SECRET,
          taskId: task._id,
          agentId,
          raw: text,
          summary: parsed.summary,
          output: parsed.output,
        });
        console.log(`[dispatcher] done ${task._id}`);
      }

      if (ts) state.lastSeen[task._id] = { sessionKey, lastMsgTs: ts };
    }

    state.lastSeen[task._id] = state.lastSeen[task._id] || { sessionKey };
  }

  saveState(state);
}

async function tick() {
  try {
    await dispatchInboxTasks();
    await processReplies();
  } catch (err) {
    console.error("[dispatcher] tick error", (err as Error).message);
  }
}

console.log(`[dispatcher] starting intervalMs=${INTERVAL_MS}`);
// Run immediately
void tick();
setInterval(() => void tick(), INTERVAL_MS);
