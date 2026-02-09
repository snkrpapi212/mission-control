/**
 * OpenClaw Gateway Client
 * Connects Mission Control to OpenClaw via the Gateway WebSocket/REST API
 * through a Cloudflare Tunnel.
 *
 * Environment variables:
 * - NEXT_PUBLIC_OPENCLAW_GATEWAY_URL: Gateway URL (e.g. https://xxx.trycloudflare.com)
 * - OPENCLAW_GATEWAY_PASSWORD: Shared password for auth
 * - OPENCLAW_GATEWAY_TOKEN: Alternative token auth
 */

export interface OpenClawConfig {
  gatewayUrl: string;
  password?: string;
  token?: string;
}

export interface SessionSendResult {
  ok: boolean;
  error?: string;
  response?: string;
}

export interface AgentStatus {
  id: string;
  sessionKey: string;
  status: string;
  model?: string;
  lastActive?: string;
}

function getConfig(): OpenClawConfig {
  const gatewayUrl =
    process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL ||
    process.env.OPENCLAW_GATEWAY_URL ||
    "";
  const password = process.env.OPENCLAW_GATEWAY_PASSWORD || "";
  const token = process.env.OPENCLAW_GATEWAY_TOKEN || "";

  if (!gatewayUrl) {
    throw new Error("NEXT_PUBLIC_OPENCLAW_GATEWAY_URL is not set");
  }

  return { gatewayUrl: gatewayUrl.replace(/\/$/, ""), password, token };
}

function authHeaders(config: OpenClawConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.token) {
    headers["Authorization"] = `Bearer ${config.token}`;
  } else if (config.password) {
    headers["Authorization"] = `Basic ${Buffer.from(`openclaw:${config.password}`).toString("base64")}`;
  }

  return headers;
}

/**
 * Call an OpenClaw Gateway RPC method
 */
export async function gatewayCall<T = unknown>(
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const config = getConfig();
  const url = `${config.gatewayUrl}/api/rpc`;

  const response = await fetch(url, {
    method: "POST",
    headers: authHeaders(config),
    body: JSON.stringify({ method, params }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gateway RPC error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data as T;
}

/**
 * Send a message to an agent session
 */
export async function sendToAgent(
  agentId: string,
  message: string,
  sessionKey?: string
): Promise<SessionSendResult> {
  try {
    const key = sessionKey || `agent:${agentId}:main`;
    const result = await gatewayCall<{ ok: boolean; error?: string }>(
      "sessions.send",
      {
        sessionKey: key,
        message,
      }
    );
    return { ok: result.ok, error: result.error };
  } catch (err) {
    return {
      ok: false,
      error: (err as Error).message,
    };
  }
}

/**
 * List active sessions
 */
export async function listSessions(): Promise<unknown[]> {
  const result = await gatewayCall<{ sessions: unknown[] }>("sessions.list", {});
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
 * Check gateway health
 */
export async function checkHealth(): Promise<{
  ok: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const config = getConfig();
    const response = await fetch(`${config.gatewayUrl}/health`, {
      headers: authHeaders(config),
    });

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { ok: true, version: data.version };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
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
    }>("sessions.spawn", {
      agentId,
      task,
      model,
    });
    return result;
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
