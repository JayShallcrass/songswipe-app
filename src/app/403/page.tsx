import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-brand-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-zinc-400 mb-8">
          You don&apos;t have permission to access this page.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  )
}
