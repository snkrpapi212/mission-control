import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f6f6f4] px-4 text-[#6e6a60]">
          Loading login…
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
