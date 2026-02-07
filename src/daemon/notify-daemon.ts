/**
 * Mission Control Notification Daemon
 * Polls Convex for undelivered notifications and delivers them to agent sessions
 * via OpenClaw's `openclaw agent` CLI.
 *
 * Features:
 * - Polls every 2 seconds
 * - Handles 10 agents with session key mapping
 * - Exponential backoff for failed deliveries (1s, 2s, 4s, 8s, 16s max)
 * - Idempotent: only marks as delivered after successful send
 * - Logs all attempts to /tmp/mission-control-daemon.log
 *
 * Environment:
 * - CONVEX_URL: Convex deployment URL (required)
 * - OPENCLAW_TOKEN: Gateway auth token (defaults to reading from openclaw.json)
 * - OPENCLAW_PORT: Gateway port (default: 18789)
 */

import * as fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// ===== AGENT SESSION MAPPING =====
const AGENT_SESSIONS: Record<string, string> = {
  jarvis: "agent:jarvis:main",
  "product-analyst": "agent:product-analyst:main",
  "customer-researcher": "agent:customer-researcher:main",
  "seo-analyst": "agent:seo-analyst:main",
  "content-writer": "agent:content-writer:main",
  "social-media": "agent:social-media:main",
  designer: "agent:designer:main",
  "email-marketing": "agent:email-marketing:main",
  developer: "agent:developer:main",
  documentation: "agent:documentation:main",
};

// ===== TYPES =====
interface Notification {
  _id: string;
  mentionedAgentId: string;
  fromAgentId: string;
  content: string;
  taskId?: string;
  delivered: boolean;
  createdAt: number;
}

interface RetryEntry {
  notificationId: string;
  agentId: string;
  retryCount: number;
  nextRetryTime: number;
}

// ===== STATE =====
const retryQueue: RetryEntry[] = [];
const logFile = "/tmp/mission-control-daemon.log";
const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_RETRIES = 5;
const RETRY_BACKOFF = [1000, 2000, 4000, 8000, 16000]; // ms

// ===== LOGGING =====
function log(level: string, message: string, context?: unknown) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? " " + JSON.stringify(context) : "";
  const logLine = `[${timestamp}] [${level}] ${message}${contextStr}\n`;

  process.stdout.write(logLine);
  try {
    fs.appendFileSync(logFile, logLine);
  } catch {
    // silently fail log writes
  }
}

function info(message: string, context?: unknown) {
  log("INFO", message, context);
}

function error(message: string, context?: unknown) {
  log("ERROR", message, context);
}

function warn(message: string, context?: unknown) {
  log("WARN", message, context);
}

// ===== CONVEX CLIENT =====
const CONVEX_URL =
  process.env.CONVEX_URL || "https://tidy-salamander-925.eu-west-1.convex.cloud";

async function callConvexQuery<T>(
  functionPath: string,
  args: Record<string, unknown>
): Promise<T> {
  const url = `${CONVEX_URL}/api/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: functionPath, args }),
  });

  if (!response.ok) {
    throw new Error(
      `Convex query error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.status === "error") {
    throw new Error(`Convex error: ${data.errorMessage || JSON.stringify(data)}`);
  }

  return data.value as T;
}

async function callConvexMutation<T>(
  functionPath: string,
  args: Record<string, unknown>
): Promise<T> {
  const url = `${CONVEX_URL}/api/mutation`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: functionPath, args }),
  });

  if (!response.ok) {
    throw new Error(
      `Convex mutation error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.status === "error") {
    throw new Error(`Convex error: ${data.errorMessage || JSON.stringify(data)}`);
  }

  return data.value as T;
}

// ===== OPENCLAW SESSION SEND =====
/**
 * Send a message to an agent session via `openclaw agent` CLI.
 * This is the real delivery mechanism — it injects a message into
 * the agent's session so they see it on their next turn.
 */
async function sendToSession(
  sessionKey: string,
  agentId: string,
  message: string
): Promise<boolean> {
  try {
    const { stdout, stderr } = await execFileAsync("openclaw", [
      "agent",
      "--session-id",
      sessionKey,
      "--agent",
      agentId,
      "--message",
      message,
      "--json",
      "--timeout",
      "30",
    ], {
      timeout: 35000,
      env: { ...process.env, PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin" },
    });

    if (stderr && stderr.includes("error")) {
      warn("openclaw agent stderr", { sessionKey, stderr: stderr.slice(0, 200) });
    }

    info("Session send success", {
      sessionKey,
      agentId,
      responseLength: stdout?.length || 0,
    });

    return true;
  } catch (err) {
    const errMsg = (err as Error).message || String(err);
    error("Session send failed", {
      sessionKey,
      agentId,
      error: errMsg.slice(0, 300),
    });
    return false;
  }
}

// ===== NOTIFICATION DELIVERY =====

/**
 * Format notification message for delivery
 */
function formatNotificationMessage(
  notification: Notification,
  mentionedAgentName: string,
  fromAgentName: string,
  taskTitle?: string
): string {
  let message = `📬 [NOTIFICATION] @${mentionedAgentName}: ${notification.content}`;

  if (fromAgentName) {
    message += ` (from ${fromAgentName}`;
    if (taskTitle) {
      message += ` on task: ${taskTitle}`;
    }
    message += ")";
  }

  return message;
}

/**
 * Try to deliver a single notification
 */
async function deliverNotification(
  notification: Notification,
  agentNameMap: Record<string, string>
): Promise<boolean> {
  const sessionKey = AGENT_SESSIONS[notification.mentionedAgentId];

  if (!sessionKey) {
    error("Unknown agent ID — no session mapping", {
      agentId: notification.mentionedAgentId,
    });
    return false;
  }

  const mentionedAgentName =
    agentNameMap[notification.mentionedAgentId] || notification.mentionedAgentId;
  const fromAgentName =
    agentNameMap[notification.fromAgentId] || notification.fromAgentId;

  const message = formatNotificationMessage(
    notification,
    mentionedAgentName,
    fromAgentName
  );

  const success = await sendToSession(
    sessionKey,
    notification.mentionedAgentId,
    message
  );

  if (success) {
    try {
      await callConvexMutation("notifications:markDelivered", {
        id: notification._id,
      });

      info("Notification delivered and marked", {
        notificationId: notification._id,
        agentId: notification.mentionedAgentId,
        sessionKey,
      });

      return true;
    } catch (err) {
      error("Failed to mark notification as delivered in Convex", {
        notificationId: notification._id,
        error: (err as Error).message,
      });
      // Message was sent but not marked — it may get re-delivered.
      // That's safer than missing a delivery.
      return false;
    }
  }

  return false;
}

/**
 * Queue a notification for retry with exponential backoff
 */
function queueForRetry(
  notificationId: string,
  agentId: string,
  retryCount: number
): void {
  if (retryCount >= MAX_RETRIES) {
    error("Max retries exceeded, giving up", {
      notificationId,
      agentId,
      retryCount,
    });
    return;
  }

  const backoffMs = RETRY_BACKOFF[retryCount] || 16000;
  const nextRetryTime = Date.now() + backoffMs;

  retryQueue.push({
    notificationId,
    agentId,
    retryCount: retryCount + 1,
    nextRetryTime,
  });

  info("Queued for retry", {
    notificationId,
    agentId,
    retryCount: retryCount + 1,
    backoffMs,
  });
}

/**
 * Fetch undelivered notifications for an agent
 */
async function fetchUndeliveredNotifications(
  agentId: string
): Promise<Notification[]> {
  try {
    const notifications = await callConvexQuery<Notification[]>(
      "notifications:getUndelivered",
      { agentId }
    );
    return notifications || [];
  } catch (err) {
    error("Failed to fetch undelivered notifications", {
      agentId,
      error: (err as Error).message,
    });
    return [];
  }
}

/**
 * Fetch all agents to build name map
 */
async function fetchAgentNames(): Promise<Record<string, string>> {
  try {
    const agents = await callConvexQuery<
      Array<{ agentId: string; name: string }>
    >("agents:getAll", {});

    const nameMap: Record<string, string> = {};
    for (const agent of agents || []) {
      nameMap[agent.agentId] = agent.name;
    }
    return nameMap;
  } catch (err) {
    warn("Failed to fetch agent names, using IDs as fallback", {
      error: (err as Error).message,
    });
    return {};
  }
}

// ===== STATS =====
const stats = {
  cyclesRun: 0,
  notificationsDelivered: 0,
  deliveryFailures: 0,
  startTime: Date.now(),
};

// ===== MAIN POLLING LOOP =====

async function pollAndDeliver(): Promise<void> {
  try {
    // Process retry queue first
    const now = Date.now();
    const readyForRetry = retryQueue.filter(
      (entry) => entry.nextRetryTime <= now
    );

    for (const entry of readyForRetry) {
      const index = retryQueue.indexOf(entry);
      if (index > -1) retryQueue.splice(index, 1);

      const notifications = await fetchUndeliveredNotifications(entry.agentId);
      const notif = notifications.find((n) => n._id === entry.notificationId);

      if (notif) {
        const agentNameMap = await fetchAgentNames();
        const success = await deliverNotification(notif, agentNameMap);
        if (!success) {
          queueForRetry(entry.notificationId, entry.agentId, entry.retryCount);
          stats.deliveryFailures++;
        } else {
          stats.notificationsDelivered++;
        }
      }
    }

    // Poll all agents for new undelivered notifications
    let totalNew = 0;
    const agentNameMap = await fetchAgentNames();

    for (const agentId of Object.keys(AGENT_SESSIONS)) {
      try {
        const notifications = await fetchUndeliveredNotifications(agentId);

        if (notifications.length > 0) {
          totalNew += notifications.length;

          for (const notification of notifications) {
            const success = await deliverNotification(
              notification,
              agentNameMap
            );
            if (!success) {
              queueForRetry(notification._id, agentId, 0);
              stats.deliveryFailures++;
            } else {
              stats.notificationsDelivered++;
            }
          }
        }
      } catch (err) {
        error("Error processing notifications for agent", {
          agentId,
          error: (err as Error).message,
        });
      }
    }

    if (totalNew > 0 || readyForRetry.length > 0) {
      info("Cycle complete", {
        newNotifications: totalNew,
        retriesProcessed: readyForRetry.length,
        queueLength: retryQueue.length,
        totalDelivered: stats.notificationsDelivered,
      });
    }
  } catch (err) {
    error("Error in polling loop", { error: (err as Error).message });
  }
}

// ===== DAEMON START =====

async function start(): Promise<void> {
  info("🚀 Notification Daemon starting", {
    convexUrl: CONVEX_URL,
    agents: Object.keys(AGENT_SESSIONS).length,
    pollingInterval: POLLING_INTERVAL,
  });

  // Initial cycle
  await pollAndDeliver();

  // Recurring polling
  setInterval(async () => {
    stats.cyclesRun++;
    await pollAndDeliver();
  }, POLLING_INTERVAL);

  info("Notification Daemon running");

  // Graceful shutdown
  const shutdown = (signal: string) => {
    info(`Received ${signal}, shutting down`, {
      uptime: Date.now() - stats.startTime,
      ...stats,
    });
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  error("Fatal error starting daemon", { error: err.message });
  process.exit(1);
});

// Export for testing
export {
  AGENT_SESSIONS,
  formatNotificationMessage,
  queueForRetry,
  POLLING_INTERVAL,
  MAX_RETRIES,
  RETRY_BACKOFF,
};
export type { Notification, RetryEntry };
