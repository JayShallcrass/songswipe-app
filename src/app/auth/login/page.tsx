import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  const error = searchParams?.error
  const message = searchParams?.message

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            SongSwipe
          </Link>
          <p className="mt-2 text-gray-600">AI-Powered Personalized Songs</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {message ? 'Check Your Email' : 'Welcome Back'}
          </h1>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!message && (
            <form action="/auth/login/actions" method="POST" className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  name="action"
                  value="signin"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
                <button
                  type="submit"
                  name="action"
                  value="signup"
                  className="flex-1 bg-white text-purple-600 py-3 px-4 rounded-lg font-semibold border-2 border-purple-200 hover:border-purple-400 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {message && (
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Home
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex justify-center items-center gap-6 text-xs text-gray-400">
          <span>🔒 Secure</span>
          <span>✓ Verified</span>
          <span>💳 Stripe</span>
        </div>
      </div>
    </div>
  )
}
