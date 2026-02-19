"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PHRASES = [
  "This mission went dark.",
  "Agent not found.",
  "Signal lost.",
  "Page went rogue.",
  "Objective not located.",
];

export default function NotFound() {
  const [phrase, setPhrase] = useState(PHRASES[0]);

  useEffect(() => {
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--mc-bg)] text-[var(--mc-text)] p-5">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-6">
          <span className="text-[120px] font-black leading-none tracking-tighter text-[var(--mc-text-soft)] select-none">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-[120px] font-black leading-none tracking-tighter text-[var(--mc-accent)] opacity-10 blur-sm select-none">
            404
          </span>
        </div>

        <p className="text-lg font-semibold text-[var(--mc-text)] mb-2">{phrase}</p>
        <p className="text-sm text-[var(--mc-text-muted)] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[var(--mc-text)] text-[var(--mc-bg)] text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-px"
          >
            ← Back to Mission Control
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[var(--mc-line)] text-[var(--mc-text-muted)] text-sm font-medium transition-all hover:text-[var(--mc-text)] hover:border-[var(--mc-line-strong)]"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
