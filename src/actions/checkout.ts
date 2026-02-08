'use server'

import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getUserBundleBalance, redeemBundleCredit } from '@/lib/bundles/redemption'
import { inngest } from '@/lib/inngest/client'

export async function createCheckout(customizationId: string) {
  const supabase = createServerSupabaseClient()

  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Verify customization ownership
  const { data: customization, error: customizationError } = await supabase
    .from('customizations')
    .select('id')
    .eq('id', customizationId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (customizationError || !customization) {
    throw new Error('Customization not found')
  }

  // Check for available bundle credits (PAY-06: Bundle credit redemption)
  const bundleBalance = await getUserBundleBalance(user.id)

  if (bundleBalance.totalRemaining > 0) {
    // Attempt to redeem a bundle credit
    const redemption = await redeemBundleCredit(user.id)

    if (redemption.redeemed) {
      // Create order directly (bypass Stripe checkout)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customization_id: customizationId,
          status: 'paid',
          amount: 0, // Free via bundle credit
          order_type: 'base',
          payment_method: 'bundle_credit',
        })
        .select()
        .single()

      if (orderError) {
        throw new Error('Failed to create order from bundle credit')
      }

      // Trigger Inngest generation
      await inngest.send({
        name: 'song/generation.requested',
        data: {
          orderId: order.id,
          userId: user.id,
          customizationId: customizationId,
          variantCount: 3,
        },
      })

      // Redirect to generation page
      return { url: `${process.env.NEXT_PUBLIC_APP_URL}/generate/${order.id}` }
    }

    // If redemption failed (race condition), fall through to Stripe checkout
  }

  // No bundle credits available or redemption failed - use Stripe checkout
  const session = await createCheckoutSession({
    customizationId,
    userId: user.id,
    email: user.email!,
    orderType: 'base',
  })

  return { url: session.url }
}
