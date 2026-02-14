import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors from OAuth provider
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error_description || error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=No authorization code received', request.url)
    )
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\n/g, '').trim()
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\n/g, '').trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      new URL('/auth/login?error=Configuration error', request.url)
    )
  }

  const cookieStore = cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string }) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: { path?: string; maxAge?: number; domain?: string }) {
        cookieStore.delete({ name, ...options })
      },
    },
  })

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('Code exchange error:', exchangeError)

    // PKCE verifier missing = user opened the confirmation link in a different
    // browser or device. Their account IS confirmed, they just need to sign in.
    const msg = exchangeError.message.toLowerCase()
    if (msg.includes('pkce') || msg.includes('code verifier')) {
      return NextResponse.redirect(
        new URL('/auth/login?message=Your account is confirmed! Sign in with your email and password.', request.url)
      )
    }

    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
    )
  }

  return NextResponse.redirect(new URL(next, request.url))
}
