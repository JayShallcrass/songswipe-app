import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, cookies } = request
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/callback?code=${code}`, {
        headers: {
          apikey: supabaseAnonKey!,
        },
      })

      if (response.ok) {
        // Redirect to dashboard or specified page
        return NextResponse.redirect(new URL(next, request.url))
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // Redirect to home on error
  return NextResponse.redirect(new URL('/', request.url))
}
