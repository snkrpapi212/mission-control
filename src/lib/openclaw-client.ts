/**
 * OpenClaw Gateway Client
 * Connects Mission Control to OpenClaw via WebSocket Gateway protocol v3.
 *
 * Environment variables:
 * - NEXT_PUBLIC_OPENCLAW_GATEWAY_URL: Gateway URL (https://xxx.up.railway.app)
 * - OPENCLAW_GATEWAY_TOKEN: Auth token for gateway
 * - OPENCLAW_GATEWAY_PASSWORD: Alternative password auth (token preferred)
 */

import WebSocket from "ws";

let reqCounter = 0;

function getWsUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL ||
    process.env.OPENCLAW_GATEWAY_URL ||
    "http://localhost:18789";
  return url.replace(/^https/, "wss").replace(/^http/, "ws");
}

function getOriginUrl(): string {
  return (
    process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL ||
    process.env.OPENCLAW_GATEWAY_URL ||
    "http://localhost:18789"
  );
}

function getAuthPayload(): Record<string, string> {
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  const password = process.env.OPENCLAW_GATEWAY_PASSWORD;
  if (token) return { token };
  if (password) return { password };
  return {};
}

/**
 * Open a connected + authenticated WebSocket to the OpenClaw Gateway.
 * Handles the connect.challenge → connect handshake automatically.
 */
function openGatewayWs(timeoutMs = 15000): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const wsUrl = getWsUrl();
    const origin = getOriginUrl();
    const ws = new WebSocket(wsUrl, { origin });
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        ws.close();
        reject(new Error(`Gateway connect timeout after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    ws.on("open", () => {
      // Wait for connect.challenge
    });

    ws.on("message", (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());

        // Step 1: Respond to connect.challenge
        if (msg.type === "event" && msg.event === "connect.challenge") {
          ws.send(
            JSON.stringify({
              type: "req",
              id: "mc-connect",
              method: "connect",
              params: {
                minProtocol: 3,
                maxProtocol: 3,
                client: {
                  id: "openclaw-control-ui",
                  version: "1.0.0",
                  platform: "linux",
                  mode: "ui",
                },
                role: "operator",
                scopes: ["operator.read", "operator.write"],
                caps: [],
                commands: [],
                permissions: {},
                auth: getAuthPayload(),
                locale: "en-US",
                userAgent: "mission-control/1.0.0",
              },
            })
          );
          return;
        }

        // Step 2: Handle connect response
        if (msg.id === "mc-connect") {
          if (msg.ok) {
            done = true;
            clearTimeout(timer);
            resolve(ws);
          } else {
            done = true;
            clearTimeout(timer);
            ws.close();
            reject(
              new Error(
                `Gateway auth failed: ${msg.error?.message || JSON.stringify(msg.error)}`
              )
            );
          }
          return;
        }
      } catch {
        // Non-JSON, ignore
      }
    });

    ws.on("error", (err: Error) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error(`WebSocket error: ${err.message}`));
      }
    });

    ws.on("close", () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error("WebSocket closed before auth completed"));
      }
    });
  });
}

/**
 * Make a single RPC call to the OpenClaw Gateway.
 * Opens connection, authenticates, sends request, returns response, closes.
 */
export async function gatewayCall<T = unknown>(
  method: string,
  params: Record<string, unknown> = {},
  timeoutMs = 30000
): Promise<T> {
  const ws = await openGatewayWs(timeoutMs);

  return new Promise((resolve, reject) => {
    const reqId = `mc-${++reqCounter}`;
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        ws.close();
        reject(new Error(`RPC call ${method} timeout after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    ws.on("message", (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.id === reqId) {
          done = true;
          clearTimeout(timer);
          ws.close();
          if (msg.ok) {
            resolve(msg.payload as T);
          } else {
            reject(
              new Error(
                `RPC error (${method}): ${msg.error?.message || JSON.stringify(msg.error)}`
              )
            );
          }
        }
      } catch {
        // ignore
      }
    });

    ws.on("close", () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error("WebSocket closed before RPC response"));
      }
    });

    ws.on("error", (err: Error) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error(`WebSocket error during RPC: ${err.message}`));
      }
    });

    // Send the RPC request
    ws.send(
      JSON.stringify({
        type: "req",
        id: reqId,
        method,
        params,
      })
    );
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
    const result = await gatewayCall<{ ok: boolean }>("health", {}, 10000);
    return { ok: true, ...result };
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
    return { ok: true, ...result };
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
