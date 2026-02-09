import { inngest } from '@/lib/inngest/client'
import { createServerSupabaseClient } from '@/lib/supabase'
import { addDays, format, getMonth, getDate, setMonth, setDate, isSameDay } from 'date-fns'
import type { OccasionReminder } from '@/types/email-preferences'

export const checkAnniversaries = inngest.createFunction(
  {
    id: 'check-anniversaries',
    name: 'Check Upcoming Anniversaries',
  },
  { cron: '0 9 * * *' }, // Daily at 9am UTC
  async ({ step }) => {
    const reminders = await step.run('query-upcoming-occasions', async () => {
      const supabase = createServerSupabaseClient()
      const today = new Date()
      const sendDate = today // We send 7 days before, so we look for anniversaries 7 days from now
      const targetAnniversaryDate = addDays(today, 7)

      // Get the month and day we're looking for (7 days from now)
      const targetMonth = getMonth(targetAnniversaryDate)
      const targetDay = getDate(targetAnniversaryDate)

      // Query all completed orders with occasion dates
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          occasion_date,
          created_at,
          customizations(recipient_name, occasion)
        `)
        .not('occasion_date', 'is', null)
        .in('status', ['completed', 'paid'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to query orders:', error)
        return []
      }

      if (!orders || orders.length === 0) {
        return []
      }

      const occasionReminders: OccasionReminder[] = []

      for (const order of orders) {
        if (!order.occasion_date || !order.customizations) continue

        const occasionDate = new Date(order.occasion_date)
        const occasionMonth = getMonth(occasionDate)
        const occasionDay = getDate(occasionDate)

        // Check if this occasion's anniversary (month + day) matches our target
        if (occasionMonth !== targetMonth || occasionDay !== targetDay) {
          continue
        }

        // Extract recipient name and occasion from customizations
        const customizations = order.customizations as any
        const recipientName = Array.isArray(customizations)
          ? customizations[0]?.recipient_name || 'someone special'
          : customizations?.recipient_name || 'someone special'
        const occasionType = Array.isArray(customizations)
          ? customizations[0]?.occasion || 'special occasion'
          : customizations?.occasion || 'special occasion'

        // Check user engagement - only include if last order within 18 months
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('created_at')
          .eq('user_id', order.user_id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (recentOrders && recentOrders.length > 0) {
          const lastOrderDate = new Date(recentOrders[0].created_at)
          const eighteenMonthsAgo = new Date()
          eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18)

          if (lastOrderDate < eighteenMonthsAgo) {
            // User inactive for 18+ months, skip
            continue
          }
        }

        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          order.user_id
        )

        if (userError || !userData.user?.email) {
          console.error('Failed to fetch user email:', userError)
          continue
        }

        // Calculate the next anniversary year
        let nextAnniversary = new Date()
        nextAnniversary = setMonth(nextAnniversary, occasionMonth)
        nextAnniversary = setDate(nextAnniversary, occasionDay)
        nextAnniversary.setHours(9, 0, 0, 0) // 9am UTC

        // If the anniversary already passed this year, use next year
        if (nextAnniversary < today) {
          nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1)
        }

        occasionReminders.push({
          orderId: order.id,
          userId: order.user_id,
          occasionDate: order.occasion_date,
          occasionType: occasionType,
          recipientName,
          userEmail: userData.user.email,
        })
      }

      return occasionReminders
    })

    const scheduledCount = await step.run('schedule-reminder-events', async () => {
      const today = new Date()
      const sendAt = new Date(today)
      sendAt.setHours(9, 0, 0, 0) // Send at 9am UTC today (7 days before anniversary)

      let count = 0
      for (const reminder of reminders) {
        try {
          // Calculate the next anniversary for deduplication ID
          const occasionDate = new Date(reminder.occasionDate)
          const occasionMonth = getMonth(occasionDate)
          const occasionDay = getDate(occasionDate)

          let nextAnniversary = new Date()
          nextAnniversary = setMonth(nextAnniversary, occasionMonth)
          nextAnniversary = setDate(nextAnniversary, occasionDay)

          if (nextAnniversary < today) {
            nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1)
          }

          await inngest.send({
            name: 'email/anniversary-reminder.requested',
            id: `anniversary-${reminder.orderId}-${format(nextAnniversary, 'yyyy-MM-dd')}`,
            data: {
              ...reminder,
              sendAt: sendAt.toISOString(),
            },
          })
          count++
        } catch (error) {
          console.error('Failed to schedule reminder event:', error)
        }
      }

      return count
    })

    return { remindersScheduled: scheduledCount }
  }
)
