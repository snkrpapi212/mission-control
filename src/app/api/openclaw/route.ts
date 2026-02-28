import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime (needs `ws`, crypto, filesystem for device identity)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import {
  sendToAgent,
  spawnAgent,
} from "@/lib/openclaw-client";

const PROXY_BASE = process.env.OPENCLAW_PROXY_BASE || "http://127.0.0.1:3999";

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  try {
    switch (action) {
      case "health": {
        const r = await fetch(`${PROXY_BASE}/health`, { cache: "no-store" });
        const data = await r.json();
        return NextResponse.json(data);
      }
      case "sessions": {
        const r = await fetch(`${PROXY_BASE}/sessions`, { cache: "no-store" });
        const data = await r.json();
        return NextResponse.json(data);
      }
      case "history": {
        const sessionKey = request.nextUrl.searchParams.get("sessionKey");
        if (!sessionKey)
          return NextResponse.json(
            { ok: false, error: "sessionKey required" },
            { status: 400 }
          );
        const limit = parseInt(
          request.nextUrl.searchParams.get("limit") || "20"
        );
        const r = await fetch(
          `${PROXY_BASE}/history?sessionKey=${encodeURIComponent(sessionKey)}&limit=${limit}`,
          { cache: "no-store" }
        );
        const data = await r.json();
        return NextResponse.json(data);
      }
      default:
        return NextResponse.json(
          { ok: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case "send": {
        const { agentId, message, sessionKey } = body;
        if (!agentId || !message)
          return NextResponse.json(
            { ok: false, error: "agentId and message required" },
            { status: 400 }
          );
        const result = await sendToAgent(agentId, message, sessionKey);
        return NextResponse.json(result);
      }
      case "spawn": {
        const { agentId, task, model } = body;
        if (!agentId || !task)
          return NextResponse.json(
            { ok: false, error: "agentId and task required" },
            { status: 400 }
          );
        const result = await spawnAgent(agentId, task, model);
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json(
          { ok: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
