import { NextRequest, NextResponse } from "next/server";
import {
  checkHealth,
  sendToAgent,
  listSessions,
  getSessionHistory,
  spawnAgent,
} from "@/lib/openclaw-client";

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  try {
    switch (action) {
      case "health": {
        const health = await checkHealth();
        return NextResponse.json(health);
      }
      case "sessions": {
        const sessions = await listSessions();
        return NextResponse.json({ ok: true, sessions });
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
        const messages = await getSessionHistory(sessionKey, limit);
        return NextResponse.json({ ok: true, messages });
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
