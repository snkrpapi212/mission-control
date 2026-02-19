import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[var(--mc-bg)] px-4 text-[var(--mc-text-muted)]">
          Loading login…
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
