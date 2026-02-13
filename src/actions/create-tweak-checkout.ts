'use server'

import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'
import { TWEAK_PRICE, validateTweakPrice } from '@/lib/bundles/pricing'

export async function createTweakCheckout({
  orderId,
  specialMemories,
  thingsToAvoid,
  pronunciation,
}: {
  orderId: string
  specialMemories: string
  thingsToAvoid: string
  pronunciation: string
}): Promise<{ url: string }> {
  // Verify user authentication via session cookies
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  const supabase = createServerSupabaseClient()

  // Verify order ownership and check tweak_count
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, customization_id, tweak_count')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    throw new Error('Order not found')
  }

  if (order.user_id !== user.id) {
    throw new Error('Order does not belong to current user')
  }

  // Must have used free tweak already
  if (order.tweak_count < 1) {
    throw new Error('Free tweak has not been used yet')
  }

  // Server-side price validation
  if (!validateTweakPrice(TWEAK_PRICE)) {
    throw new Error('Invalid pricing configuration')
  }

  // Create Stripe checkout session
  const session = await createCheckoutSession({
    customisationId: order.customization_id,
    userId: user.id,
    email: user.email!,
    amount: TWEAK_PRICE,
    orderType: 'tweak',
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/generate/${orderId}?tweak=success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/generate/${orderId}?tweak=canceled`,
    metadata: {
      originalOrderId: orderId,
      tweakSpecialMemories: specialMemories,
      tweakThingsToAvoid: thingsToAvoid,
      tweakPronunciation: pronunciation,
    },
  })

  return { url: session.url! }
}
