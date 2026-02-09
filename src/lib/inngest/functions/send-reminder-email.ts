import { inngest } from '@/lib/inngest/client'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { AnniversaryReminderEmail } from '@/lib/emails/anniversary-reminder'

// Helper to format occasion for display
function formatOccasion(occasion: string): string {
  return occasion
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface ReminderEventData {
  orderId: string
  userId: string
  occasionDate: string
  occasionType: string
  recipientName: string
  userEmail: string
  sendAt: string
}

export const sendReminderEmail = inngest.createFunction(
  {
    id: 'send-reminder-email',
    name: 'Send Anniversary Reminder Email',
    retries: 3,
  },
  { event: 'email/anniversary-reminder.requested' },
  async ({ event, step }) => {
    const data = event.data as ReminderEventData

    // Step 1: Sleep until send date (7 days before anniversary at 9am UTC)
    await step.sleepUntil('wait-for-send-date', data.sendAt)

    // Step 2: Check email preferences at send time (not schedule time)
    const preferences = await step.run('check-preferences', async () => {
      const supabase = createServerSupabaseClient()

      const { data: prefs, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', data.userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is OK
        console.error('Failed to fetch preferences:', error)
        return null
      }

      return prefs
    })

    // Check if user has globally unsubscribed
    if (preferences && preferences.global_unsubscribe) {
      return { skipped: true, reason: 'global_unsubscribe' }
    }

    // Check if user has unsubscribed from this specific occasion
    if (preferences && preferences.occasion_unsubscribes?.includes(data.orderId)) {
      return { skipped: true, reason: 'occasion_unsubscribe' }
    }

    // Step 3: Fetch user email (verify user still exists)
    const userData = await step.run('fetch-user-email', async () => {
      const supabase = createServerSupabaseClient()
      const { data: user, error } = await supabase.auth.admin.getUserById(data.userId)

      if (error || !user.user?.email) {
        return null
      }

      return { email: user.user.email }
    })

    if (!userData) {
      return { skipped: true, reason: 'user_not_found' }
    }

    // Step 4: Send email via Resend
    const result = await step.run('send-email', async () => {
      const resend = new Resend(process.env.RESEND_API_KEY)

      // Get unsubscribe token (or use a default if preferences don't exist)
      const unsubscribeToken = preferences?.unsubscribe_token || ''

      // Build URLs
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.app'
      const createSongUrl = `${baseUrl}/customize?occasion=${encodeURIComponent(data.occasionType)}`
      const unsubscribeUrl = `${baseUrl}/api/unsubscribe/${unsubscribeToken}?order_id=${data.orderId}`
      const unsubscribeAllUrl = `${baseUrl}/api/unsubscribe/${unsubscribeToken}`

      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'SongSwipe <reminders@songswipe.app>',
        to: userData.email,
        subject: `Continue the story for ${formatOccasion(data.occasionType)}`,
        react: AnniversaryReminderEmail({
          recipientName: data.recipientName,
          occasionType: formatOccasion(data.occasionType),
          createSongUrl,
          unsubscribeUrl,
          unsubscribeAllUrl,
        }),
        headers: {
          'List-Unsubscribe': `<${unsubscribeAllUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })

      if (error) {
        console.error('Failed to send email:', error)
        throw new Error(`Resend API error: ${error.message}`)
      }

      return { sent: true, to: userData.email, emailId: emailData?.id }
    })

    return result
  }
)
