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
    if (msg.includes('password') && (msg.includes('short') || msg.includes('weak') || msg.includes('least'))) {
      return 'Password must be at least 6 characters.'
    }
  }

  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }

  return supabaseMessage
}

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const action = formData.get('action') as string

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

  const tabParam = action === 'signup' ? '&tab=signup' : ''

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
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=${encodeURIComponent(friendlyError(error.message, action))}${tabParam}`,
          { status: 303 }
        )
      }

      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?message=Check your email for the confirmation link`,
        { status: 303 }
      )
    } else {
      // Sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=${encodeURIComponent(friendlyError(error.message, action))}${tabParam}`,
          { status: 303 }
        )
      }

      return NextResponse.redirect(
        `${requestUrl.origin}/dashboard`,
        { status: 303 }
      )
    }
  } catch {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=Something went wrong. Please try again.${tabParam}`,
      { status: 303 }
    )
  }
}
