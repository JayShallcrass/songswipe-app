'use server'

import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import { validateBundlePrice, getBundleTier } from '@/lib/bundles/pricing'

export async function createBundleCheckout({ bundleTierId }: { bundleTierId: string }): Promise<{ url: string }> {
  const supabase = createServerSupabaseClient()

  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Look up bundle tier
  const tier = getBundleTier(bundleTierId)
  if (!tier) {
    throw new Error('Invalid bundle tier')
  }

  // Create Stripe checkout session with bundle order type
  const session = await createCheckoutSession({
    customizationId: 'bundle-purchase', // Bundles are not tied to a specific customization
    userId: user.id,
    email: user.email!,
    amount: tier.price,
    orderType: 'bundle',
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?bundle=success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?bundle=canceled`,
    metadata: {
      bundleTier: tier.id,
      quantity: String(tier.quantity),
    },
  })

  return { url: session.url! }
}
