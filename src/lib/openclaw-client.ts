/**
 * OpenClaw Gateway Client
 * Connects Mission Control to OpenClaw via WebSocket Gateway RPC.
 *
 * Environment variables:
 * - NEXT_PUBLIC_OPENCLAW_GATEWAY_URL: Gateway URL (https://xxx.trycloudflare.com)
 * - OPENCLAW_GATEWAY_PASSWORD: Shared password for auth
 * - OPENCLAW_GATEWAY_TOKEN: Alternative token auth
 */

import WebSocket from "ws";

function getWsUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL ||
    process.env.OPENCLAW_GATEWAY_URL ||
    "http://localhost:18789";
  return url.replace(/^https/, "wss").replace(/^http/, "ws");
}

function getAuthPayload(): Record<string, string> {
  const password = process.env.OPENCLAW_GATEWAY_PASSWORD;
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (token) return { type: "token", token };
  if (password) return { type: "password", password };
  return {};
}

/**
 * Make a single RPC call to the OpenClaw Gateway via WebSocket.
 * Opens a connection, authenticates, sends the call, waits for response, closes.
 */
export async function gatewayCall<T = unknown>(
  method: string,
  params: Record<string, unknown> = {},
  timeoutMs = 30000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const wsUrl = getWsUrl();
    const ws = new WebSocket(wsUrl);
    let resolved = false;
    let authenticated = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ws.close();
        reject(new Error(`Gateway call timeout after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    ws.on("open", () => {
      // Send auth message
      const auth = getAuthPayload();
      ws.send(JSON.stringify({ type: "auth", ...auth }));
    });

    ws.on("message", (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());

        // Handle auth response
        if (msg.type === "auth" || msg.type === "auth-ok" || msg.authenticated) {
          authenticated = true;
          // Send the RPC call
          ws.send(
            JSON.stringify({
              type: "call",
              id: "mc-1",
              method,
              params,
            })
          );
          return;
        }

        // Handle auth failure
        if (msg.type === "auth-error" || msg.error) {
          if (!authenticated) {
            resolved = true;
            clearTimeout(timer);
            ws.close();
            reject(new Error(`Auth failed: ${msg.error || msg.message || "unknown"}`));
            return;
          }
        }

        // Handle RPC response
        if (msg.id === "mc-1" || msg.type === "result" || msg.type === "response") {
          resolved = true;
          clearTimeout(timer);
          ws.close();
          if (msg.error) {
            reject(new Error(`RPC error: ${msg.error}`));
          } else {
            resolve((msg.result || msg.payload || msg) as T);
          }
          return;
        }

        // Handle welcome/hello messages (some gateways send these)
        if (msg.type === "hello" || msg.type === "welcome") {
          // Already sent auth on open, just wait
          return;
        }

        // Any other message with our call id
        if (msg.callId === "mc-1") {
          resolved = true;
          clearTimeout(timer);
          ws.close();
          resolve(msg as T);
          return;
        }
      } catch {
        // Non-JSON message, ignore
      }
    });

    ws.on("error", (err: Error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(new Error(`WebSocket error: ${err.message}`));
      }
    });

    ws.on("close", () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(new Error("WebSocket closed before response"));
      }
    });
  });
}

/**
 * Check gateway health
 */
export async function checkHealth(): Promise<{
  ok: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const result = await gatewayCall<{ ok: boolean }>("health");
    return { ok: result.ok };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Send a message to an agent session
 */
export async function sendToAgent(
  agentId: string,
  message: string,
  sessionKey?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const key = sessionKey || `agent:${agentId}:main`;
    const result = await gatewayCall<{ ok: boolean; error?: string }>(
      "sessions.send",
      { sessionKey: key, message }
    );
    return { ok: result.ok, error: result.error };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * List active sessions
 */
export async function listSessions(): Promise<unknown[]> {
  const result = await gatewayCall<{ sessions: unknown[] }>(
    "sessions.list",
    {}
  );
  return result.sessions || [];
}

/**
 * Get session history
 */
export async function getSessionHistory(
  sessionKey: string,
  limit = 20
): Promise<unknown[]> {
  const result = await gatewayCall<{ messages: unknown[] }>(
    "sessions.history",
    { sessionKey, limit }
  );
  return result.messages || [];
}

/**
 * Spawn a sub-agent task
 */
export async function spawnAgent(
  agentId: string,
  task: string,
  model?: string
): Promise<{ ok: boolean; sessionKey?: string; error?: string }> {
  try {
    const result = await gatewayCall<{
      ok: boolean;
      sessionKey?: string;
      error?: string;
    }>("sessions.spawn", { agentId, task, model });
    return result;
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
