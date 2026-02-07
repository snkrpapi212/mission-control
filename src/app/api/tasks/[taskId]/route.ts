import { NextRequest, NextResponse } from "next/server";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://tidy-salamander-925.eu-west-1.convex.cloud";

async function convexFetch(functionName: string, args: Record<string, unknown>) {
  const response = await fetch(`${CONVEX_URL}/api/run/${functionName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args }),
  });
  const data = await response.json();
  if (data.status === "error") throw new Error(data.message);
  return data.value;
}

/* eslint-disable no-console */

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const body = await req.json();
    const { status, priority, assigneeIds } = body;

    const updatedTask = await convexFetch("tasks/update", {
      id: params.taskId,
      agentId: "main", // System update
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeIds && { assigneeIds }),
    });

    return NextResponse.json({ status: "success", data: updatedTask });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}
