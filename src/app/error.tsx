'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">😵</div>
        <h1 className="text-3xl font-bold mb-3 text-gray-900">Something went wrong</h1>
        <p className="text-gray-500 mb-8">
          Don&apos;t worry, your songs are safe. This is just a temporary hiccup.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-purple-300 text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
