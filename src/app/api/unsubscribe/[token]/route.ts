import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

/**
 * Helper to generate styled HTML page for unsubscribe confirmations and errors
 */
function generateHtmlPage(title: string, message: string, isError: boolean): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.app'
  const iconColor = isError ? '#ef4444' : '#10b981'
  const icon = isError
    ? `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2">
         <circle cx="12" cy="12" r="10"/>
         <line x1="15" y1="9" x2="9" y2="15"/>
         <line x1="9" y1="9" x2="15" y2="15"/>
       </svg>`
    : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2">
         <circle cx="12" cy="12" r="10"/>
         <path d="M9 12l2 2 4-4"/>
       </svg>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - SongSwipe</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f9fafb;
    }
    .container {
      max-width: 480px;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .icon {
      margin: 0 auto 20px;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 12px;
      color: #1f2937;
    }
    p {
      font-size: 16px;
      color: #6b7280;
      margin: 0 0 24px;
      line-height: 1.5;
    }
    a {
      display: inline-block;
      padding: 12px 24px;
      background: #f97316;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: background 0.2s;
    }
    a:hover {
      background: #ea580c;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${appUrl}">Return to SongSwipe</a>
  </div>
</body>
</html>`
}

/**
 * GET handler: Web-based unsubscribe from email link clicks
 * Supports both per-occasion and global unsubscribe via query parameters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const isGlobal = searchParams.get('all') !== null || !orderId

    // Use service role client (no auth required for unsubscribe)
    const supabase = createServerSupabaseClient()

    // Query email preferences by unsubscribe token
    const { data: preferences, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('unsubscribe_token', token)
      .single()

    if (error || !preferences) {
      const html = generateHtmlPage(
        'Invalid Link',
        'This unsubscribe link is invalid or has expired. If you continue to receive unwanted emails, please contact support.',
        true
      )
      return new NextResponse(html, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Handle per-occasion unsubscribe
    if (!isGlobal && orderId) {
      const currentUnsubscribes = preferences.occasion_unsubscribes || []

      // Idempotent: only update if order_id not already in array
      if (!currentUnsubscribes.includes(orderId)) {
        const { error: updateError } = await supabase
          .from('email_preferences')
          .update({
            occasion_unsubscribes: [...currentUnsubscribes, orderId],
            updated_at: new Date().toISOString(),
          })
          .eq('id', preferences.id)

        if (updateError) {
          throw updateError
        }
      }

      const html = generateHtmlPage(
        'Unsubscribed',
        "You've been unsubscribed from reminders for this occasion. You'll still receive reminders for your other occasions.",
        false
      )
      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Handle global unsubscribe
    const { error: updateError } = await supabase
      .from('email_preferences')
      .update({
        global_unsubscribe: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', preferences.id)

    if (updateError) {
      throw updateError
    }

    const html = generateHtmlPage(
      'Unsubscribed',
      "You've been unsubscribed from all SongSwipe reminder emails. You can still access your songs anytime in your dashboard.",
      false
    )
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('Unsubscribe GET error:', error)
    const html = generateHtmlPage(
      'Error',
      'An error occurred while processing your request. Please try again or contact support.',
      true
    )
    return new NextResponse(html, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

/**
 * POST handler: RFC 8058 one-click unsubscribe from email client buttons
 * Always performs global unsubscribe (per RFC 8058 standard)
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // Use service role client (no auth required for unsubscribe)
    const supabase = createServerSupabaseClient()

    // Query email preferences by unsubscribe token
    const { data: preferences, error } = await supabase
      .from('email_preferences')
      .select('id')
      .eq('unsubscribe_token', token)
      .single()

    if (error || !preferences) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // One-click unsubscribe always does global (per RFC 8058)
    const { error: updateError } = await supabase
      .from('email_preferences')
      .update({
        global_unsubscribe: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', preferences.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscribe POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
