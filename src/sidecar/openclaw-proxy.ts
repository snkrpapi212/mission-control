import http from "node:http";
import { URL } from "node:url";
import {
  checkHealth as gatewayHealth,
  listSessions as gatewayListSessions,
  getSessionHistory as gatewayHistory,
} from "../lib/openclaw-client";

const PORT = parseInt(process.env.OPENCLAW_PROXY_PORT || "3999", 10);
const HOST = process.env.OPENCLAW_PROXY_HOST || "127.0.0.1";

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
