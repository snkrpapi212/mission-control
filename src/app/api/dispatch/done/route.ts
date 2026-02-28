import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const BRIDGE_SECRET = process.env.TASK_DISPATCH_BRIDGE_SECRET;
const CALLBACK_SECRET = process.env.DISPATCH_CALLBACK_SECRET;

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

export async function POST(req: NextRequest) {
  try {
    if (!CALLBACK_SECRET) {
      return NextResponse.json({ ok: false, error: "DISPATCH_CALLBACK_SECRET missing" }, { status: 500 });
    }
    if (!BRIDGE_SECRET) {
      return NextResponse.json({ ok: false, error: "TASK_DISPATCH_BRIDGE_SECRET missing" }, { status: 500 });
    }

    const header = req.headers.get("x-dispatch-secret") || "";
    if (header !== CALLBACK_SECRET) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (body?.mc !== "done" || typeof body?.taskId !== "string") {
      return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
    }

    const agentId = typeof body.agentId === "string" ? body.agentId : "unknown";

    const result = await convexRun("dispatcher/done", {
      secret: BRIDGE_SECRET,
      taskId: body.taskId,
      agentId,
      raw: JSON.stringify(body),
      summary: typeof body.summary === "string" ? body.summary : undefined,
      output: typeof body.output === "string" ? body.output : undefined,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
