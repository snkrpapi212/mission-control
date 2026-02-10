import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "mc_session";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const expectedToken = process.env.MC_SESSION_TOKEN;
  const session = req.cookies.get(SESSION_COOKIE)?.value;

  if (!expectedToken) {
    return NextResponse.json(
      { error: "MC_SESSION_TOKEN is not configured" },
      { status: 500 }
    );
  }

  if (session !== expectedToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
