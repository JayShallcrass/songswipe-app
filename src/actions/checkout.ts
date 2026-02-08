'use server'

import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase'

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

  // Create Stripe checkout session
  const session = await createCheckoutSession({
    customizationId,
    userId: user.id,
    email: user.email!,
    orderType: 'base',
  })

  return { url: session.url }
}
