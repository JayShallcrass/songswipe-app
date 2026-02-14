'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LockClosedIcon, CreditCardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin'

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab)

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-DEFAULT py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-heading font-bold text-gradient">
            SongSwipe
          </Link>
          <p className="mt-2 text-zinc-500">AI-Powered Personalised Songs</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8">
          {/* Tabs */}
          {!message && (
            <div className="flex mb-6 border-b border-surface-200">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                  tab === 'signin'
                    ? 'text-white border-b-2 border-brand-500'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                  tab === 'signup'
                    ? 'text-white border-b-2 border-brand-500'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          <h1 className="text-2xl font-bold text-white mb-1 text-center">
            {message ? 'Check Your Email' : tab === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          {!message && (
            <p className="text-sm text-zinc-500 text-center mb-6">
              {tab === 'signin'
                ? 'Sign in to view your songs'
                : 'Free to sign up. Only pay when you order.'}
            </p>
          )}

          {message && (
            <div className="mt-4 mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <span className="text-amber-200">{error}</span>
            </div>
          )}

          {!message && (
            <>
              {/* Google Sign In */}
              <form action="/auth/login/google" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-surface-50 text-zinc-500">or use email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form
                action="/auth/login/actions"
                method="POST"
                className="space-y-4"
                id="auth-form"
              >
                <input type="hidden" name="action" value={tab === 'signup' ? 'signup' : 'signin'} />

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-surface-100 border border-surface-200 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors placeholder-zinc-600"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
                      Password
                    </label>
                    {tab === 'signup' && (
                      <span className="text-xs text-zinc-600">Min. 6 characters</span>
                    )}
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-surface-100 border border-surface-200 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors placeholder-zinc-600"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-500 to-amber-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-brand-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                >
                  {tab === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              {/* Forgot password (sign in only) */}
              {tab === 'signin' && (
                <div className="mt-3 text-center">
                  <button
                    type="submit"
                    form="auth-form"
                    formAction="/auth/forgot-password"
                    formNoValidate
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Tab switcher link */}
              <p className={`${tab === 'signin' ? 'mt-4' : 'mt-5'} text-center text-sm text-zinc-500`}>
                {tab === 'signin' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('signup')}
                      className="text-brand-500 hover:text-brand-400 font-medium"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('signin')}
                      className="text-brand-500 hover:text-brand-400 font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}

          {message && (
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-brand-500 hover:text-brand-400 font-medium"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm">
            &larr; Back to Home
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex justify-center items-center gap-6 text-xs text-zinc-600">
          <span className="flex items-center gap-1"><LockClosedIcon className="w-3.5 h-3.5" /> Secure</span>
          <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Verified</span>
          <span className="flex items-center gap-1"><CreditCardIcon className="w-3.5 h-3.5" /> Stripe</span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface-DEFAULT">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
