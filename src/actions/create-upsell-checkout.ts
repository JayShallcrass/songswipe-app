'use server'

import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import { UPSELL_PRICE, validateUpsellPrice } from '@/lib/bundles/pricing'

export async function createUpsellCheckout({ orderId }: { orderId: string }): Promise<{ url: string }> {
  const supabase = createServerSupabaseClient()

  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Verify order ownership and check variant count
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, customization_id, song_variants(id)')
    .eq('id', orderId)
    .maybeSingle()

  if (orderError || !order) {
    throw new Error('Order not found')
  }

  if (order.user_id !== user.id) {
    throw new Error('Order does not belong to current user')
  }

  // Prevent duplicate upsells (user already has 4+ variants)
  const variantCount = order.song_variants?.length || 0
  if (variantCount >= 4) {
    throw new Error('Order already has maximum variants')
  }

  // Server-side price validation (never trust client)
  if (!validateUpsellPrice(UPSELL_PRICE)) {
    throw new Error('Invalid pricing configuration')
  }

  // Create Stripe checkout session
  const session = await createCheckoutSession({
    customizationId: order.customization_id,
    userId: user.id,
    email: user.email!,
    amount: UPSELL_PRICE,
    orderType: 'upsell',
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/generate/${orderId}?upsell=success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/generate/${orderId}?upsell=canceled`,
    metadata: {
      originalOrderId: orderId,
      variantNumber: '4',
    },
  })

  return { url: session.url! }
}
