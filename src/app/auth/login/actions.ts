import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const action = formData.get('action') as string

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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
          `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`,
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
          `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`,
          { status: 303 }
        )
      }

      return NextResponse.redirect(
        `${requestUrl.origin}/dashboard`,
        { status: 303 }
      )
    }
  } catch (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=An unexpected error occurred`,
      { status: 303 }
    )
  }
}
