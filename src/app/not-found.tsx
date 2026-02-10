import Link from 'next/link';

// Explicitly mark as static for proper prerendering
export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-400 mb-8">Page not found</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        Go back home
      </Link>
    </div>
  );
}
