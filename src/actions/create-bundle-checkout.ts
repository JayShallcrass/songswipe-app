'use server'

import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'
import { validateBundlePrice, getBundleTier } from '@/lib/bundles/pricing'

export async function createBundleCheckout({ bundleTierId }: { bundleTierId: string }): Promise<{ url: string }> {
  // Verify user authentication (cookie-based)
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  const supabase = createServerSupabaseClient()

  // Look up bundle tier
  const tier = getBundleTier(bundleTierId)
  if (!tier) {
    throw new Error('Invalid bundle tier')
  }

  // Create Stripe checkout session with bundle order type
  const session = await createCheckoutSession({
    customisationId: 'bundle-purchase', // Bundles are not tied to a specific customisation
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
