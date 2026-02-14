import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = formData.get('email') as string

  if (!email) {
    return NextResponse.json(
      { error: 'Please enter your email address first.' },
      { status: 400 }
    )
  }

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

  // Always show success message to prevent email enumeration
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${requestUrl.origin}/auth/callback?next=/dashboard`,
  })

  return NextResponse.json({
    message: 'If an account exists with that email, you\'ll receive a password reset link shortly.',
  })
}
