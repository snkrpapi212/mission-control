import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-5">
      <h1 className="text-7xl font-bold mb-4">404</h1>
      <p className="text-2xl text-gray-400 mb-8">Page not found</p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white no-underline"
      >
        Go back home
      </Link>
    </div>
  );
}
