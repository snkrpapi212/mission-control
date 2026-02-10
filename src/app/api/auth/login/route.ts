import { NextResponse } from "next/server";

const SESSION_COOKIE = "mc_session";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const password = body.password || "";

  const expectedPassword = process.env.MC_LOGIN_PASSWORD;
  const sessionToken = process.env.MC_SESSION_TOKEN;

  if (!expectedPassword || !sessionToken) {
    return NextResponse.json(
      { error: "Auth env vars missing (MC_LOGIN_PASSWORD / MC_SESSION_TOKEN)" },
      { status: 500 }
    );
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
