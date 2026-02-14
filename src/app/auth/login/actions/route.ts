import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function friendlyError(supabaseMessage: string, action: string): string {
  const msg = supabaseMessage.toLowerCase()

  if (action === 'signin') {
    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
      return 'Incorrect email or password. If you don\'t have an account yet, switch to Create Account.'
    }
    if (msg.includes('email not confirmed')) {
      return 'Please check your inbox and confirm your email before signing in.'
    }
  }

  if (action === 'signup') {
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      return 'An account with this email already exists. Try signing in instead.'
    }
    if (msg.includes('password') && (msg.includes('short') || msg.includes('weak') || msg.includes('least') || msg.includes('characters'))) {
      return 'Password must be at least 6 characters and include uppercase, lowercase, and a digit.'
    }
  }

  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  return supabaseMessage
}

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const body = await request.json()
  const { email, password, action } = body as { email: string; password: string; action: string }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  )

  try {
    if (action === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${requestUrl.origin}/auth/callback`,
        },
      })

      if (error) {
        return NextResponse.json(
          { error: friendlyError(error.message, action) },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: 'Check your email for the confirmation link',
      })
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return NextResponse.json(
          { error: friendlyError(error.message, action) },
          { status: 400 }
        )
      }

      return NextResponse.json({ redirect: '/dashboard' })
    }
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
