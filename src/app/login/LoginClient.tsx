"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function getSafeNext(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith("/")) return "/dashboard";
  return nextParam;
}

export default function LoginClient() {
  const searchParams = useSearchParams();
  const next = getSafeNext(searchParams.get("next"));
  const reason = searchParams.get("reason");
  const nextLabel = useMemo(() => (next === "/dashboard" ? "dashboard" : next), [next]);

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          code?: string;
          attemptsRemaining?: number;
        };

        if (data.code === "INVALID_PASSWORD" && typeof data.attemptsRemaining === "number") {
          setError(`Invalid password. ${data.attemptsRemaining} attempt(s) remaining.`);
        } else {
          setError(data.error || "Login failed");
        }

        setLoading(false);
        return;
      }

      window.location.assign(next);
    } catch {
      setError("Sign-in service unavailable. Try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[var(--mc-bg)] px-4">
      <form
        onSubmit={handleSubmit}
        method="post"
        noValidate
        className="w-full max-w-sm rounded-xl border border-[var(--mc-line)] bg-[var(--mc-card)] p-6 shadow-[var(--sh-card)]"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--mc-text)] text-xs font-bold text-white">
            MC
          </div>
          <p className="inline-flex items-center rounded-full border border-[var(--mc-line)] bg-[var(--mc-panel)] px-2.5 py-1 text-xs font-medium text-[var(--mc-text-soft)]">
            🔒 Secure internal workspace
          </p>
        </div>

        <h1 className="mb-2 text-xl font-semibold text-[var(--mc-text)]">Mission Control Login</h1>
        <p className="mb-1 text-sm text-[var(--mc-text-muted)]">Enter password to continue.</p>
        <p className="mb-2 text-xs text-[var(--mc-text-soft)]">Signing in to continue to: {nextLabel}</p>

        {reason === "session_expired" && (
          <p className="mb-2 rounded-md border border-[var(--mc-amber)]/40 bg-[var(--mc-amber-soft)] px-2.5 py-2 text-xs text-[var(--mc-text)]">
            Your session expired. Please sign in again.
          </p>
        )}

        {reason === "auth_required" && (
          <p className="mb-2 rounded-md border border-[var(--mc-line)] bg-[var(--mc-panel)] px-2.5 py-2 text-xs text-[var(--mc-text)]">
            Sign in required to open {nextLabel}.
          </p>
        )}

        <p className="mb-4 text-[11px] text-[var(--mc-text-soft)]">After 5 failed attempts, sign-in is temporarily locked.</p>

        <label htmlFor="password" className="mb-3 block">
          <span className="mb-1 block text-xs text-[var(--mc-text-soft)]">Password</span>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--mc-line-strong)] bg-[var(--mc-card)] px-3 py-2 pr-16 text-sm text-[var(--mc-text)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-[var(--mc-text-muted)] hover:bg-[var(--mc-panel)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {error && (
          <p className="mb-3 rounded-md border border-[var(--mc-red)]/30 bg-[var(--mc-red-soft)] px-2.5 py-2 text-sm text-[var(--mc-red)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--mc-text)] px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-3 text-center text-xs text-[var(--mc-text-soft)]">
          Need access?{" "}
          <a className="underline underline-offset-2" href="mailto:support@mission-control.local">
            Contact admin
          </a>
        </p>
      </form>
    </main>
  );
}
