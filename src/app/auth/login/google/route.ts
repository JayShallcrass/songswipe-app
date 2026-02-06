import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const origin = (process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io').replace(/\n/g, '').trim()
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\n/g, '').trim()
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(
      new URL('/auth/login?error=Configuration error', origin)
    )
  }

  const cookieStore = cookies()
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, origin),
      303
    )
  }

  if (data.url) {
    // Must use 303 to convert the POST into a GET when redirecting to Google's OAuth page
    return NextResponse.redirect(data.url, 303)
  }

  return NextResponse.redirect(
    new URL('/auth/login?error=Failed to initiate Google sign in', origin),
    303
  )
}
