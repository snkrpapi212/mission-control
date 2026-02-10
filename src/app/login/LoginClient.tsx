"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    window.location.assign(next);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f6f4] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-[#e6e5e1] bg-white p-6"
      >
        <h1 className="mb-2 text-xl font-semibold text-[#1f1f1d]">Mission Control Login</h1>
        <p className="mb-4 text-sm text-[#6e6a60]">Enter password to continue.</p>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs text-[#5f5b51]">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-[#dedcd7] px-3 py-2 text-sm"
            required
          />
        </label>

        {error && <p className="mb-3 text-sm text-[#a64b45]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
