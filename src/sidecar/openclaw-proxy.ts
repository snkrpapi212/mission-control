import http from "node:http";
import { URL } from "node:url";
import {
  checkHealth as gatewayHealth,
  listSessions as gatewayListSessions,
  getSessionHistory as gatewayHistory,
} from "../lib/openclaw-client";

const PORT = parseInt(process.env.OPENCLAW_PROXY_PORT || "3999", 10);
const HOST = process.env.OPENCLAW_PROXY_HOST || "127.0.0.1";
const HEARTBEAT_INTERVAL_MS = parseInt(process.env.OPENCLAW_HEARTBEAT_INTERVAL_MS || "30000", 10);
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const HEARTBEAT_SECRET = process.env.HEARTBEAT_BRIDGE_SECRET;

function parseOnlineAgentIdsFromSessions(sessions: any[]): string[] {
  const ids = new Set<string>();
  for (const s of sessions) {
    const key = typeof s?.key === "string" ? s.key : "";
    const m = key.match(/^agent:([^:]+):/);
    if (m?.[1]) ids.add(m[1]);
  }
  return Array.from(ids);
}

async function convexRun(path: string, args: Record<string, unknown>) {
  if (!CONVEX_URL) throw new Error("CONVEX_URL missing");
  const res = await fetch(`${CONVEX_URL}/api/run/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ args }),
  });
  const data = await res.json();
  if (data?.status === "error") throw new Error(data.message || "convex error");
  return data?.value;
}

async function heartbeatTick() {
  if (!HEARTBEAT_SECRET || !CONVEX_URL) return;
  const sessions = await gatewayListSessions();
  const onlineAgentIds = parseOnlineAgentIdsFromSessions(sessions as any[]);
  await convexRun("agents/heartbeatBridge", {
    secret: HEARTBEAT_SECRET,
    onlineAgentIds,
    ts: Date.now(),
  });
}

// Fire-and-forget loop
if (HEARTBEAT_SECRET && CONVEX_URL) {
  console.log(
    `[openclaw-proxy] heartbeat enabled intervalMs=${HEARTBEAT_INTERVAL_MS} convex=${CONVEX_URL}`
  );
  // Run once immediately so the UI updates quickly after restarts.
  heartbeatTick().catch((err) => {
    console.error("[openclaw-proxy] heartbeatTick error", err?.message || err);
  });
  setInterval(() => {
    heartbeatTick()
      .then(() => {
        console.log("[openclaw-proxy] heartbeatTick ok");
      })
      .catch((err) => {
        console.error("[openclaw-proxy] heartbeatTick error", err?.message || err);
      });
  }, HEARTBEAT_INTERVAL_MS);
} else {
  console.log(
    `[openclaw-proxy] heartbeat disabled (missing HEARTBEAT_BRIDGE_SECRET or CONVEX_URL)`
  );
}

function json(res: http.ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/health") {
      const h = await gatewayHealth();
      return json(res, 200, h);
    }

    if (url.pathname === "/sessions") {
      const sessions = await gatewayListSessions();
      return json(res, 200, { ok: true, sessions });
    }

    if (url.pathname === "/history") {
      const sessionKey = url.searchParams.get("sessionKey");
      const limit = parseInt(url.searchParams.get("limit") || "20", 10);
      if (!sessionKey) return json(res, 400, { ok: false, error: "sessionKey required" });
      const messages = await gatewayHistory(sessionKey, limit);
      return json(res, 200, { ok: true, messages });
    }

    return json(res, 404, { ok: false, error: "not_found" });
  } catch (err) {
    return json(res, 500, { ok: false, error: (err as Error).message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[openclaw-proxy] listening on http://${HOST}:${PORT}`);
});
