'use server'

import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'
import { getUserBundleBalance, redeemBundleCredit } from '@/lib/bundles/redemption'

export async function createCheckout(customisationId: string) {
  // Verify user authentication (cookie-based)
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  const supabase = createServerSupabaseClient()

  // Verify customisation ownership
  const { data: customisation, error: customisationError } = await supabase
    .from('customizations')
    .select('id')
    .eq('id', customisationId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (customisationError || !customisation) {
    throw new Error('Customisation not found')
  }

  // Check for available bundle credits (PAY-06: Bundle credit redemption)
  const bundleBalance = await getUserBundleBalance(user.id)

  if (bundleBalance.totalRemaining > 0) {
    // Attempt to redeem a bundle credit
    const redemption = await redeemBundleCredit(user.id)

    if (redemption.redeemed) {
      // Fetch occasion_date from customisation for retention tracking
      const { data: customisationWithDate } = await supabase
        .from('customizations')
        .select('occasion_date')
        .eq('id', customisationId)
        .single()

      // Create order directly (bypass Stripe checkout)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customization_id: customisationId,
          status: 'paid',
          amount: 0, // Free via bundle credit
          order_type: 'base',
          payment_method: 'bundle_credit',
          occasion_date: customisationWithDate?.occasion_date || null,
        })
        .select()
        .single()

      if (orderError) {
        throw new Error('Failed to create order from bundle credit')
      }

      // Create variant records (generation triggered by client on generate page)
      const variantRecords = [1, 2, 3].map((variantNumber) => ({
        order_id: order.id,
        user_id: user.id,
        variant_number: variantNumber,
        storage_path: `${order.id}/variant-${variantNumber}.mp3`,
        generation_status: 'pending' as const,
      }))

      const { error: variantError } = await supabase
        .from('song_variants')
        .insert(variantRecords)

      if (variantError && variantError.code !== '23505') {
        console.error('Failed to create variant records:', variantError)
      }

      // Redirect to generation page
      return { url: `${process.env.NEXT_PUBLIC_APP_URL}/generate/${order.id}` }
    }

    // If redemption failed (race condition), fall through to Stripe checkout
  }

  // No bundle credits available or redemption failed - use Stripe checkout
  const session = await createCheckoutSession({
    customisationId,
    userId: user.id,
    email: user.email!,
    orderType: 'base',
  })

  return { url: session.url }
}
