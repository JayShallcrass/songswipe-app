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
    <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">😵</div>
        <h1 className="text-3xl font-heading font-bold mb-3 text-white">Something went wrong</h1>
        <p className="text-zinc-500 mb-8">
          Don&apos;t worry, your songs are safe. This is just a temporary hiccup.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-500 to-amber-500 text-white rounded-full font-semibold hover:from-brand-600 hover:to-amber-600 transition-all shadow-md"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border border-surface-300 text-zinc-300 rounded-full font-semibold hover:bg-surface-100 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
