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
    const agents = await convexFetch("agents/getAll", {});
    return NextResponse.json({ status: "success", data: agents });
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}
