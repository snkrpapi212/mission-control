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

export async function GET(request: NextRequest) {
  try {
    const tasks = await convexFetch("tasks/getAll", {});
    return NextResponse.json({ status: "success", data: tasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, priority, createdBy, assigneeIds } = body;

    if (!title || !description || !priority || !createdBy) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields: title, description, priority, createdBy",
        },
        { status: 400 }
      );
    }

    const newTask = await convexFetch("tasks/create", {
      title,
      description,
      priority,
      createdBy,
      assigneeIds: assigneeIds || [],
      tags: [],
    });

    return NextResponse.json({ status: "success", data: newTask }, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}
