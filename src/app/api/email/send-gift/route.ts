import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getAuthUser } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipientEmail, recipientName, senderName, occasion, shareUrl, personalMessage, scheduledAt } = body

    if (!recipientEmail || !EMAIL_REGEX.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Valid recipient email is required' },
        { status: 400 }
      )
    }

    if (!shareUrl || !recipientName || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate scheduled date is in the future (if provided)
    if (scheduledAt) {
      const scheduleDate = new Date(scheduledAt)
      if (isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled date must be in the future' },
          { status: 400 }
        )
      }
    }

    const formatOccasion = (occ: string) =>
      occ.replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    const occasionText = occasion ? formatOccasion(occasion) : 'Special'
    const subject = `${senderName} has a ${occasionText} surprise for you!`

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#a855f7,#ec4899);padding:32px 24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">🎁</div>
        <h1 style="color:white;font-size:24px;font-weight:700;margin:0;">
          ${recipientName}, you have a gift!
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px;">
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
          ${senderName} created a personalised ${occasionText.toLowerCase()} song just for you.
        </p>

        ${personalMessage ? `
        <div style="background:#f3f4f6;border-radius:12px;padding:16px;margin:0 0 24px;">
          <p style="color:#6b7280;font-size:13px;margin:0 0 4px;font-weight:600;">Personal message:</p>
          <p style="color:#374151;font-size:15px;line-height:1.5;margin:0;font-style:italic;">
            "${personalMessage}"
          </p>
        </div>
        ` : ''}

        <!-- CTA Button -->
        <div style="text-align:center;margin:24px 0;">
          <a href="${shareUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;font-size:16px;font-weight:600;text-decoration:none;border-radius:50px;">
            Listen to Your Song
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #f3f4f6;padding:20px 24px;text-align:center;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">
          Created with <span style="background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:600;">SongSwipe</span>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`

    const emailOptions: Parameters<typeof resend.emails.send>[0] = {
      from: 'SongSwipe <gifts@songswipe.io>',
      to: recipientEmail,
      subject,
      html: emailHtml,
    }

    if (scheduledAt) {
      emailOptions.scheduledAt = scheduledAt
    }

    const { data, error } = await resend.emails.send(emailOptions)

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      scheduled: !!scheduledAt,
    })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
