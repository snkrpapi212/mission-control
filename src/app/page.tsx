import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-xl px-6">
        <h1 className="text-4xl font-bold mb-3 text-gray-900">Mission Control</h1>
        <p className="text-lg text-gray-700">Multi-agent AI squad dashboard</p>
        <p className="text-sm text-gray-500 mt-3">
          Phase 4 UI is now available. If Convex isn’t configured yet, the dashboard will run on mock data.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Open Dashboard
          </Link>
          <a
            href="https://docs.convex.dev"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Convex Docs
          </a>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          Tip: set <code className="px-1 py-0.5 bg-white border border-gray-200 rounded">NEXT_PUBLIC_CONVEX_URL</code> to connect real-time data.
        </div>
      </div>
    </main>
  );
}
