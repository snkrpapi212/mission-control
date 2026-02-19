import { NextResponse } from "next/server";

const SESSION_COOKIE = "mc_session";

type AttemptState = {
  count: number;
  windowStartMs: number;
  lockUntilMs: number;
};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOCK_MS = 15 * 60 * 1000; // 15 minutes

const attemptsStore =
  (globalThis as typeof globalThis & { __mcLoginAttempts?: Map<string, AttemptState> })
    .__mcLoginAttempts ?? new Map<string, AttemptState>();

(globalThis as typeof globalThis & { __mcLoginAttempts?: Map<string, AttemptState> }).__mcLoginAttempts = attemptsStore;

function getClientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const rip = req.headers.get("x-real-ip")?.trim();
  return xff || rip || "unknown";
}

function getRateState(key: string, now: number): AttemptState {
  const existing = attemptsStore.get(key);
  if (!existing) {
    const initial = { count: 0, windowStartMs: now, lockUntilMs: 0 };
    attemptsStore.set(key, initial);
    return initial;
  }

  if (existing.lockUntilMs > 0 && now >= existing.lockUntilMs) {
    const reset = { count: 0, windowStartMs: now, lockUntilMs: 0 };
    attemptsStore.set(key, reset);
    return reset;
  }

  if (now - existing.windowStartMs > WINDOW_MS) {
    const reset = { count: 0, windowStartMs: now, lockUntilMs: 0 };
    attemptsStore.set(key, reset);
    return reset;
  }

  return existing;
}

function incrementFailure(key: string, now: number): AttemptState {
  const state = getRateState(key, now);
  const next: AttemptState = { ...state, count: state.count + 1 };

  if (next.count >= MAX_ATTEMPTS) {
    next.lockUntilMs = now + LOCK_MS;
  }

  attemptsStore.set(key, next);
  return next;
}

function clearFailures(key: string): void {
  attemptsStore.delete(key);
}

export async function POST(req: Request) {
  if (process.env.MC_AUTH_ENABLED !== "true") {
    return NextResponse.json({ error: "Auth is disabled" }, { status: 400 });
  }

  const key = getClientKey(req);
  const now = Date.now();
  const rate = getRateState(key, now);

  if (rate.lockUntilMs > now) {
    const retryAfterSec = Math.ceil((rate.lockUntilMs - now) / 1000);
    const res = NextResponse.json(
      {
        error: `Too many failed attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
        code: "RATE_LIMITED",
      },
      { status: 429 }
    );
    res.headers.set("Retry-After", String(retryAfterSec));
    return res;
  }

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
    const nextState = incrementFailure(key, now);

    if (nextState.lockUntilMs > now) {
      const retryAfterSec = Math.ceil((nextState.lockUntilMs - now) / 1000);
      const res = NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
      res.headers.set("Retry-After", String(retryAfterSec));
      return res;
    }

    return NextResponse.json(
      {
        error: "Invalid password",
        code: "INVALID_PASSWORD",
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - nextState.count),
      },
      { status: 401 }
    );
  }

  clearFailures(key);

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
