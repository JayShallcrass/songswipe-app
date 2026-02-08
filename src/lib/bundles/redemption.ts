import { createServerSupabaseClient } from '@/lib/supabase'
import { BundleBalance } from './types'

/**
 * Redeem a bundle credit using optimistic locking to prevent race conditions
 */
export async function redeemBundleCredit(userId: string): Promise<{
  redeemed: boolean
  bundleId?: string
  remainingCredits?: number
  error?: string
}> {
  const supabase = createServerSupabaseClient()

  // Find oldest bundle with remaining credits
  const { data: bundles, error: queryError } = await supabase
    .from('bundles')
    .select('*')
    .eq('user_id', userId)
    .gt('quantity_remaining', 0)
    .order('purchased_at', { ascending: true })
    .limit(1)

  if (queryError) {
    return { redeemed: false, error: `Query error: ${queryError.message}` }
  }

  if (!bundles || bundles.length === 0) {
    return { redeemed: false, error: 'No available bundle credits' }
  }

  const bundle = bundles[0]

  // Decrement credit atomically using optimistic locking
  // This prevents race conditions by only updating if quantity_remaining hasn't changed
  const { data: updatedBundle, error: updateError } = await supabase
    .from('bundles')
    .update({ quantity_remaining: bundle.quantity_remaining - 1 })
    .eq('id', bundle.id)
    .eq('quantity_remaining', bundle.quantity_remaining) // Optimistic lock
    .select()
    .maybeSingle()

  if (updateError) {
    return { redeemed: false, error: `Update error: ${updateError.message}` }
  }

  if (!updatedBundle) {
    // No rows updated - race condition occurred
    return { redeemed: false, error: 'Credit redemption failed (concurrent access)' }
  }

  return {
    redeemed: true,
    bundleId: bundle.id,
    remainingCredits: updatedBundle.quantity_remaining,
  }
}

/**
 * Get user's total bundle balance across all active bundles
 */
export async function getUserBundleBalance(userId: string): Promise<BundleBalance> {
  const supabase = createServerSupabaseClient()

  const { data: bundles, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('user_id', userId)
    .gt('quantity_remaining', 0)
    .order('purchased_at', { ascending: true })

  if (error || !bundles) {
    return { totalRemaining: 0, bundles: [] }
  }

  const totalRemaining = bundles.reduce((sum, b) => sum + b.quantity_remaining, 0)

  return {
    totalRemaining,
    bundles: bundles.map(b => ({
      id: b.id,
      tier: b.bundle_tier,
      remaining: b.quantity_remaining,
      purchased: b.quantity_purchased,
      purchasedAt: b.purchased_at,
    })),
  }
}
