import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-8">Page not found</p>
        <Link href="/" className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}