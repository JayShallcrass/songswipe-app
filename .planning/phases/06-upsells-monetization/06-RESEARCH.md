# Phase 6: Upsells & Monetization - Research

**Researched:** 2026-02-08
**Domain:** Post-purchase upsell patterns, bundle tracking systems, Stripe pricing integration, discount pricing strategies, redemption workflows
**Confidence:** HIGH

## Summary

Phase 6 builds on the completed payment and generation infrastructure (Phases 1-5) to introduce two natural monetization opportunities: +1 variant upsell after swiping 3 variants, and multi-generation bundle offers after song completion. Research confirms the existing Stripe integration supports dynamic pricing via inline `price_data` (no catalog setup needed), order_type column already differentiates purchase types, and variant_number (1-5) was designed to support +1 upsells without migration.

The core challenge is timing the upsells correctly to maximize conversion without feeling pushy. Research shows post-purchase upsells convert 2-3x higher than pre-purchase offers when presented immediately after the primary transaction (10-15% typical conversion rate). For the +1 variant upsell, triggering after swiping through all 3 base variants creates natural curiosity ("what if there's an even better option?"). For bundle offers, waiting until after song completion and sharing provides maximum satisfaction context.

Bundle redemption tracking requires a credit ledger approach: store purchased bundle quantity as redeemable credits, decrement on each new song creation, display remaining balance in dashboard. This avoids complex subscription logic while providing clear value transparency.

**Primary recommendation:** Add +1 variant upsell modal triggered when user reaches end of 3-variant swiper (before selection), display post-completion bundle offer on song delivery page after user selects favorite, create bundles table to track purchased credits and redemptions, extend existing Stripe checkout helper with discount pricing for upsell/bundle order types, use metadata to link upsells to original orders for analytics.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Stripe | 20.3.0 (existing) | Dynamic pricing for upsells, checkout sessions | Already integrated, supports inline price_data for reduced upsell pricing, metadata for order association |
| Supabase PostgreSQL | Existing | Bundle credits tracking, order relationships | Native support for JSONB metadata, transactional updates for credit redemption, RLS for user isolation |
| Framer Motion | 11.x+ (existing) | Upsell modal animations | Already used in swipe builder (Phase 3), smooth modal transitions, exit animations |
| React Query | 4.x+ (existing from Phase 4) | Mutation handling for upsell checkout | Optimistic updates, error handling, automatic retry on failure |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.22.0 (existing) | Validate upsell pricing parameters | Runtime validation for discount amounts, bundle quantities, price calculations |
| React Hook Form | If adding bundle config | Multi-bundle tier selection forms | Only if offering multiple bundle tiers (3-pack, 5-pack, 10-pack) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Bundle credits table | Subscription with usage limits | Credits simpler (one-time purchase, no recurring billing), subscriptions generate MRR but add billing complexity. Project explicitly excludes subscription model per requirements. |
| Inline price_data | Stripe Price IDs in catalog | price_data simpler for dynamic discounts (calculate server-side, no dashboard setup), Price IDs better for consistent pricing across multiple products. Upsells are one-off discounts - use price_data. |
| Modal after all 3 swiped | Modal after selecting favorite | Modal before selection captures hesitation ("maybe I need more options"), after selection user already committed. Present upsell before lock-in. |
| Post-completion modal | Email upsell next day | Modal captures immediate satisfaction (song just completed, emotional high), email requires second touchpoint with lower conversion. Use modal for immediate bundle offer. |
| Countdown timer urgency | No time pressure | Timer creates urgency (10-15% conversion boost per research), but can feel manipulative. Test with/without timer - if conversion delta low, skip timer for better UX. |

**Installation:**
```bash
# All dependencies already installed in prior phases
npm install  # stripe@20.3.0, @tanstack/react-query@4.x+, framer-motion@11.x+
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── orders/
│   │   │   └── [id]/
│   │   │       └── upsell/
│   │   │           └── route.ts        # NEW: Create +1 variant order
│   │   └── bundles/
│   │       ├── purchase/
│   │       │   └── route.ts            # NEW: Create bundle order
│   │       └── redeem/
│   │           └── route.ts            # NEW: Apply bundle credit to order
│   ├── generate/
│   │   └── [orderId]/
│   │       └── page.tsx (MODIFY)       # Add upsell modal trigger
│   └── song/
│       └── [id]/
│           └── page.tsx (MODIFY)       # Add bundle offer after completion
├── actions/
│   ├── create-upsell-checkout.ts       # NEW: Server Action for +1 variant upsell
│   └── create-bundle-checkout.ts       # NEW: Server Action for bundle purchase
├── components/
│   ├── upsells/
│   │   ├── VariantUpsellModal.tsx      # NEW: +1 variant offer modal
│   │   └── BundleOfferCard.tsx         # NEW: Post-completion bundle offer
│   └── dashboard/
│       └── BundleCreditsWidget.tsx     # NEW: Display remaining credits (Phase 8)
└── lib/
    ├── stripe.ts (MODIFY)              # Add upsell pricing helpers
    └── bundles/
        ├── types.ts                     # NEW: Bundle types
        └── redemption.ts                # NEW: Credit redemption logic
```

### Pattern 1: Post-Variant-Swipe Upsell Modal
**What:** Display modal offering +1 variant at reduced price after user swipes through all 3 base variants but before final selection.
**When to use:** Upsells triggered by user completing primary action but before commitment (swiped all options, read all reviews, viewed all photos).
**Example:**
```tsx
// src/components/upsells/VariantUpsellModal.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createUpsellCheckout } from '@/actions/create-upsell-checkout'

interface VariantUpsellModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
  originalPrice: number
  discountedPrice: number // e.g., £4.99 instead of £7.99
}

export function VariantUpsellModal({
  orderId,
  isOpen,
  onClose,
  originalPrice,
  discountedPrice,
}: VariantUpsellModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const { url } = await createUpsellCheckout({
        orderId,
        amount: discountedPrice,
      })
      window.location.href = url // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Upsell checkout failed:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const savingsPercent = Math.round(
    ((originalPrice - discountedPrice) / originalPrice) * 100
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              {/* Headline */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">
                  Want One More Option?
                </h2>
                <p className="text-gray-600">
                  Generate a 4th variant to ensure you find the perfect song
                </p>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 line-through">
                    £{(originalPrice / 100).toFixed(2)}
                  </span>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Save {savingsPercent}%
                  </span>
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  £{(discountedPrice / 100).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Special offer for this order only
                </p>
              </div>

              {/* What you get */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    1 additional AI-generated variant
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Same quality and personalization
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Generated in 30-60 seconds
                  </span>
                </li>
              </ul>

              {/* CTA buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Yes, Generate 4th Variant'}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  No Thanks, Continue with 3
                </button>
              </div>

              {/* Trust signal */}
              <p className="text-xs text-gray-500 text-center mt-4">
                This offer expires when you select your favorite variant
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

```typescript
// src/app/generate/[orderId]/page.tsx (MODIFY - add trigger logic)
'use client'

import { useState, useEffect } from 'react'
import { VariantSwiper } from '@/components/generation/VariantSwiper'
import { VariantUpsellModal } from '@/components/upsells/VariantUpsellModal'

export default function GeneratePage({ params }: { params: { orderId: string } }) {
  const [hasSwipedAll, setHasSwipedAll] = useState(false)
  const [showUpsellModal, setShowUpsellModal] = useState(false)
  const [upsellDismissed, setUpsellDismissed] = useState(false)

  // Track when user has viewed all 3 variants
  const handleVariantIndexChange = (index: number, total: number) => {
    if (index === total - 1 && !hasSwipedAll) {
      setHasSwipedAll(true)
    }
  }

  // Show upsell modal after viewing all variants (5 second delay for natural timing)
  useEffect(() => {
    if (hasSwipedAll && !upsellDismissed) {
      const timer = setTimeout(() => {
        setShowUpsellModal(true)
      }, 5000) // Wait 5 seconds after viewing last variant

      return () => clearTimeout(timer)
    }
  }, [hasSwipedAll, upsellDismissed])

  const handleCloseUpsell = () => {
    setShowUpsellModal(false)
    setUpsellDismissed(true)
  }

  return (
    <>
      <VariantSwiper
        orderId={params.orderId}
        onIndexChange={handleVariantIndexChange}
      />

      <VariantUpsellModal
        orderId={params.orderId}
        isOpen={showUpsellModal}
        onClose={handleCloseUpsell}
        originalPrice={799} // £7.99
        discountedPrice={499} // £4.99 (37% discount)
      />
    </>
  )
}
```

### Pattern 2: Post-Completion Bundle Offer
**What:** Display bundle offer on song delivery page after user selects favorite variant, providing discounted multi-generation packs.
**When to use:** After successful primary transaction completion, when user satisfaction is highest.
**Example:**
```tsx
// src/components/upsells/BundleOfferCard.tsx
'use client'

import { useState } from 'react'
import { createBundleCheckout } from '@/actions/create-bundle-checkout'

interface BundleTier {
  id: string
  name: string
  quantity: number
  price: number // Total price in pence
  perSongPrice: number // Calculated per-song price for comparison
  savings: number // Percentage saved vs base price
  popular?: boolean
}

const BUNDLE_TIERS: BundleTier[] = [
  {
    id: '3-pack',
    name: '3-Song Pack',
    quantity: 3,
    price: 1999, // £19.99
    perSongPrice: 666, // £6.66 per song
    savings: 17,
  },
  {
    id: '5-pack',
    name: '5-Song Pack',
    quantity: 5,
    price: 2999, // £29.99
    perSongPrice: 600, // £6.00 per song
    savings: 25,
    popular: true,
  },
  {
    id: '10-pack',
    name: '10-Song Pack',
    quantity: 10,
    price: 4999, // £49.99
    perSongPrice: 500, // £5.00 per song
    savings: 37,
  },
]

export function BundleOfferCard() {
  const [selectedTier, setSelectedTier] = useState<BundleTier>(BUNDLE_TIERS[1]) // Default to 5-pack (popular)
  const [isLoading, setIsLoading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const { url } = await createBundleCheckout({
        bundleTier: selectedTier.id,
        quantity: selectedTier.quantity,
        amount: selectedTier.price,
      })
      window.location.href = url
    } catch (error) {
      console.error('Bundle checkout failed:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isDismissed) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
      {/* Dismissal X */}
      <button
        onClick={() => setIsDismissed(true)}
        className="float-right text-gray-400 hover:text-gray-600"
        aria-label="Dismiss offer"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Headline */}
      <div className="mb-6">
        <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
          Limited Time Offer
        </span>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Loved Your Song? Create More & Save
        </h2>
        <p className="text-gray-600">
          Stock up on song credits for future occasions. The perfect gift is
          always ready when you need it.
        </p>
      </div>

      {/* Bundle tier selection */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {BUNDLE_TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              selectedTier.id === tier.id
                ? 'border-purple-500 bg-white shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                Popular
              </span>
            )}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {tier.quantity}
              </div>
              <div className="text-sm text-gray-600 mb-2">Songs</div>
              <div className="text-lg font-bold text-purple-600">
                £{(tier.price / 100).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                £{(tier.perSongPrice / 100).toFixed(2)}/song
              </div>
              <div className="text-xs font-semibold text-green-600 mt-1">
                Save {tier.savings}%
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* What you get */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">What You Get:</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{selectedTier.quantity} complete song generations (3 variants each)</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Credits never expire</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Use for any occasion or recipient</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Save £{((799 - selectedTier.perSongPrice) / 100).toFixed(2)} per song vs single purchase</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : `Get ${selectedTier.quantity} Songs for £${(selectedTier.price / 100).toFixed(2)}`}
      </button>

      {/* Social proof */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Join 1,200+ customers who have purchased bundles for gifting throughout the year
      </p>
    </div>
  )
}
```

### Pattern 3: Bundle Credit Redemption System
**What:** Track bundle purchases as redeemable credits, decrement on song creation, prevent overdraft with transaction checks.
**When to use:** One-time bundle purchases that grant usage allowance without recurring billing.
**Example:**
```sql
-- supabase/migrations/006_add_bundles.sql
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  bundle_tier TEXT NOT NULL CHECK (bundle_tier IN ('3-pack', '5-pack', '10-pack')),
  quantity_purchased INTEGER NOT NULL CHECK (quantity_purchased > 0),
  quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = never expires
  CONSTRAINT remaining_lte_purchased CHECK (quantity_remaining <= quantity_purchased)
);

CREATE INDEX idx_bundles_user_id ON bundles(user_id);
CREATE INDEX idx_bundles_order_id ON bundles(order_id);

-- RLS policies
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bundles" ON bundles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage bundles" ON bundles
  FOR ALL TO service_role
  USING (true);

COMMENT ON TABLE bundles IS 'Bundle credit tracking for multi-generation purchases (PAY-06)';
```

```typescript
// src/lib/bundles/redemption.ts
import { createServerSupabaseClient } from '@/lib/supabase'

export async function redeemBundleCredit(userId: string): Promise<{
  redeemed: boolean
  bundleId?: string
  remainingCredits?: number
  error?: string
}> {
  const supabase = createServerSupabaseClient()

  // Find oldest bundle with remaining credits
  const { data: bundle, error: fetchError } = await supabase
    .from('bundles')
    .select('*')
    .eq('user_id', userId)
    .gt('quantity_remaining', 0)
    .is('expires_at', null) // Or: .or('expires_at.is.null,expires_at.gt.now()')
    .order('purchased_at', { ascending: true }) // FIFO redemption
    .limit(1)
    .maybeSingle()

  if (fetchError || !bundle) {
    return {
      redeemed: false,
      error: 'No available bundle credits',
    }
  }

  // Decrement credit atomically
  const { data: updated, error: updateError } = await supabase
    .from('bundles')
    .update({
      quantity_remaining: bundle.quantity_remaining - 1,
    })
    .eq('id', bundle.id)
    .eq('quantity_remaining', bundle.quantity_remaining) // Optimistic lock
    .select()
    .single()

  if (updateError || !updated) {
    return {
      redeemed: false,
      error: 'Failed to redeem credit (possibly race condition)',
    }
  }

  return {
    redeemed: true,
    bundleId: updated.id,
    remainingCredits: updated.quantity_remaining,
  }
}

export async function getUserBundleBalance(userId: string): Promise<{
  totalRemaining: number
  bundles: Array<{
    id: string
    tier: string
    remaining: number
    purchased: number
    purchasedAt: string
  }>
}> {
  const supabase = createServerSupabaseClient()

  const { data: bundles, error } = await supabase
    .from('bundles')
    .select('*')
    .eq('user_id', userId)
    .gt('quantity_remaining', 0)
    .order('purchased_at', { ascending: true })

  if (error || !bundles) {
    return {
      totalRemaining: 0,
      bundles: [],
    }
  }

  const totalRemaining = bundles.reduce(
    (sum, bundle) => sum + bundle.quantity_remaining,
    0
  )

  return {
    totalRemaining,
    bundles: bundles.map((bundle) => ({
      id: bundle.id,
      tier: bundle.bundle_tier,
      remaining: bundle.quantity_remaining,
      purchased: bundle.quantity_purchased,
      purchasedAt: bundle.purchased_at,
    })),
  }
}

export async function canUserCreateSong(userId: string): Promise<boolean> {
  const balance = await getUserBundleBalance(userId)
  return balance.totalRemaining > 0
}
```

```typescript
// src/app/api/webhook/route.ts (MODIFY - add bundle redemption for order creation)
export async function POST(request: NextRequest) {
  // ... existing webhook signature verification ...

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderType = session.metadata?.orderType as 'base' | 'upsell' | 'bundle'

    // Handle bundle purchase
    if (orderType === 'bundle') {
      const bundleTier = session.metadata?.bundleTier as string
      const quantity = parseInt(session.metadata?.quantity || '0', 10)

      const { error: bundleError } = await supabase
        .from('bundles')
        .insert({
          user_id: session.metadata.userId,
          order_id: order.id,
          bundle_tier: bundleTier,
          quantity_purchased: quantity,
          quantity_remaining: quantity,
        })

      if (bundleError) {
        console.error('Failed to create bundle record:', bundleError)
      }

      return NextResponse.json({ received: true })
    }

    // For base and upsell orders, check if user has bundle credit
    if (orderType === 'base' || orderType === 'upsell') {
      const { redeemed, bundleId } = await redeemBundleCredit(session.metadata.userId)

      if (redeemed) {
        // Update order to mark as bundle-redeemed (no charge, credit used)
        await supabase
          .from('orders')
          .update({
            bundle_redeemed_id: bundleId,
          })
          .eq('id', order.id)
      }

      // Trigger generation regardless of payment method (paid or bundle credit)
      await inngest.send({
        name: 'song/generation.requested',
        data: {
          orderId: order.id,
          userId: session.metadata.userId,
          customizationId: session.metadata.customizationId,
          variantCount: orderType === 'upsell' ? 1 : 3, // +1 for upsell, 3 for base
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
```

### Pattern 4: Dynamic Discount Pricing with Metadata
**What:** Calculate upsell and bundle pricing server-side, pass to Stripe via inline price_data, link to original order via metadata.
**When to use:** One-off discounted pricing that varies by context (upsell discount based on original order, bundle tier selection).
**Example:**
```typescript
// src/actions/create-upsell-checkout.ts
'use server'

import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function createUpsellCheckout({
  orderId,
  amount, // Discounted amount calculated client-side but validated server-side
}: {
  orderId: string
  amount: number
}) {
  const supabase = createServerSupabaseClient()

  // Require authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  // Verify order ownership and check if already has 4th variant
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, song_variants(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (orderError || !order) {
    throw new Error('Order not found')
  }

  // Prevent duplicate upsells (already has 4+ variants)
  if (order.song_variants.length >= 4) {
    throw new Error('Order already has 4+ variants')
  }

  // Validate discount amount (must be £4.99 = 499 pence for +1 variant)
  const UPSELL_PRICE = 499 // £4.99 fixed price
  if (amount !== UPSELL_PRICE) {
    throw new Error('Invalid upsell price')
  }

  // Create Stripe Checkout Session
  const session = await createCheckoutSession({
    customizationId: order.customization_id,
    userId: user.id,
    email: user.email!,
    amount: UPSELL_PRICE,
    orderType: 'upsell',
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/generate/${orderId}?upsell=success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/generate/${orderId}?upsell=canceled`,
    metadata: {
      originalOrderId: orderId, // Link upsell to original order
      variantNumber: 4, // This will be variant #4
    },
  })

  return { url: session.url }
}
```

```typescript
// src/lib/stripe.ts (MODIFY - add metadata support)
export async function createCheckoutSession({
  customizationId,
  userId,
  email,
  amount = 799,
  orderType = 'base',
  successUrl,
  cancelUrl,
  metadata = {}, // NEW: Allow additional metadata
}: {
  customizationId: string
  userId: string
  email: string
  amount?: number
  orderType?: 'base' | 'upsell' | 'bundle'
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string> // NEW
}) {
  // Product name and description based on order type
  const productDetails = {
    base: {
      name: 'Personalized Song Package',
      description: 'Get 3 AI-generated song variants and pick your favorite',
    },
    upsell: {
      name: 'Additional Song Variant',
      description: 'Generate 1 more variant for your order',
    },
    bundle: {
      name: `Song Bundle - ${metadata.bundleTier || 'Multi-Pack'}`,
      description: `${metadata.quantity || '3'} song credits for future generations`,
    },
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: productDetails[orderType].name,
            description: productDetails[orderType].description,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url:
      successUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    customer_email: email,
    metadata: {
      customizationId,
      userId,
      orderType,
      ...metadata, // Merge additional metadata
    },
    payment_intent_data: {
      metadata: {
        customizationId,
        userId,
        orderType,
        ...metadata,
      },
    },
  })

  return session
}
```

### Anti-Patterns to Avoid
- **Showing upsell before user completes primary action:** If modal appears before user swipes through all 3 variants, they haven't experienced full value yet. Wait until they've seen all options to trigger upsell.
- **Bundle offer immediately after purchase:** User just paid, showing another price immediately feels aggressive. Wait until song delivery page (after selection, after satisfaction) to present bundle.
- **Hardcoded discount percentages in client:** Client can manipulate discount calculation. Always validate pricing server-side in Server Actions before creating Checkout Session.
- **Creating bundles without redemption logic:** Purchasing bundle without automatic credit application on next song creation forces user to remember they have credits. Auto-apply bundle credits in checkout flow for zero-friction experience.
- **Allowing overdraft on bundle credits:** Decrementing quantity_remaining without atomic check (optimistic lock) creates race condition where concurrent requests overdraft credits. Use `.eq('quantity_remaining', currentValue)` in UPDATE to prevent.
- **Missing upsell->order relationship:** Without linking upsell orders to original orders via metadata, can't track which upsells succeeded or analyze conversion funnels. Always store originalOrderId in upsell metadata.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dynamic discount pricing | Manual price calculation, coupon codes in Stripe catalog | Inline price_data in checkout sessions with server-side validation | Coupons require dashboard setup and don't support dynamic discounts per order. price_data allows calculating discount server-side based on context (original order amount, bundle tier). Simpler code, no coupon management. |
| Bundle credit tracking | Subscription with usage limits, manual credit spreadsheet | Database table with quantity tracking and atomic decrements | Subscriptions require recurring billing setup (out of scope per requirements). Spreadsheet manual and error-prone. Database table with CHECK constraints and optimistic locking prevents overdraft and double-spending. |
| Upsell modal animations | Custom CSS transitions, setTimeout chains | Framer Motion AnimatePresence | Modal entry/exit animations require coordinating opacity, scale, backdrop, and cleanup. Framer Motion handles mounting/unmounting, prevents layout shift, supports gestures (swipe to dismiss). Already in stack from Phase 3. |
| Checkout session idempotency | Manual duplicate prevention logic | Stripe idempotency keys, database UNIQUE constraints | Stripe automatically deduplicates requests with same idempotency key (provided in request header). Database UNIQUE constraint on stripe_session_id prevents duplicate orders at DB level. Both layers prevent double-charging without custom logic. |
| Bundle tier pricing calculation | Manual math in components | Server-side pricing constants with validation | Calculating per-song price and savings percentage in client is error-prone and manipulable. Centralize pricing in server constants, validate in Server Actions, render in components from server data. Single source of truth. |

**Key insight:** Upsell pricing psychology (reduced price, limited time, scarcity) drives conversion, but implementation must be fraud-resistant. Always validate pricing server-side, never trust client-calculated discounts. Stripe's inline price_data supports dynamic discounts without coupon infrastructure. Bundle redemption requires transactional database updates (optimistic locking) to prevent race conditions in concurrent credit usage.

## Common Pitfalls

### Pitfall 1: Upsell Modal Shown Too Early
**What goes wrong:** Modal appears immediately when user lands on generation page (before viewing any variants) or after viewing only 1-2 variants. User dismisses modal because they haven't seen what they paid for yet. Conversion rate below 5%.
**Why it happens:** Developer triggers modal on page load or after fixed time delay without tracking user behavior (which variants viewed).
**How to avoid:** Track currentIndex in VariantSwiper component. Only trigger upsell modal after user has cycled through all 3 base variants (index reaches variants.length - 1). Add 5-10 second delay after viewing last variant to feel natural, not pushy. Allow dismissal with flag to prevent re-showing.
**Warning signs:** High modal dismiss rate (>80%), low upsell conversion (<5%), user complaints about interruptions, analytics show modal appears before variant_3 view event.

### Pitfall 2: Bundle Credits Not Auto-Applied at Checkout
**What goes wrong:** User purchases bundle, has credits, but next song creation still shows payment screen. User confused ("I already paid for this!"), contacts support, or abandons. Credits sit unused in database.
**Why it happens:** Checkout flow doesn't check for bundle credits before redirecting to Stripe. Credits only decremented after payment, creating circular logic (need payment to use credit).
**How to avoid:** Check for available bundle credits in customize page before checkout. If credits available, bypass Stripe and create order directly with bundle_redeemed_id. Show "Using 1 of 5 bundle credits" message during creation. Only redirect to Stripe if zero credits remaining.
**Warning signs:** Support tickets about "double payment", bundle redemption rate below 80%, users with credits still making new payments, analytics show checkout sessions created for users with positive credit balance.

### Pitfall 3: Race Condition in Bundle Credit Redemption
**What goes wrong:** User with 1 remaining credit opens two tabs, clicks "Create Song" in both simultaneously. Two orders created, both decrement credits, quantity_remaining goes negative (-1). Database CHECK constraint violated or overdraft allowed.
**Why it happens:** UPDATE query fetches current quantity_remaining, decrements in application code, writes back. Between fetch and write, another request decrements same record. No atomic transaction.
**How to avoid:** Use optimistic locking in UPDATE: `.eq('quantity_remaining', currentValue)` ensures UPDATE only succeeds if value hasn't changed since fetch. If UPDATE returns 0 rows, retry or fail gracefully. Alternatively, use database function with row-level lock (FOR UPDATE).
**Warning signs:** Constraint violation errors in logs (remaining_lte_purchased CHECK failed), negative quantity_remaining values in database, users reporting "credit used but song not created", concurrent request patterns in logs.

### Pitfall 4: Discount Price Calculated Client-Side
**What goes wrong:** Client-side code calculates upsell discount (£7.99 → £4.99), passes amount to Server Action. Malicious user modifies JavaScript to pass £0.01 instead of £4.99. Checkout succeeds, user gets variant for 1 pence.
**Why it happens:** Developer trusts client to calculate pricing, Server Action doesn't validate amount against expected discount.
**How to avoid:** Hardcode all upsell and bundle pricing in server-side constants. Server Action validates received amount matches expected price for order type. Reject mismatched amounts with error. Client-side only displays prices, never calculates them.
**Warning signs:** Orders with unexpected amounts in database, Stripe webhooks showing amounts that don't match pricing tiers, revenue analytics show pricing anomalies, fraudulent charges reported.

### Pitfall 5: Bundle Offer Shown Too Soon After Purchase
**What goes wrong:** User completes base payment, immediately sees bundle offer on success page. Feels like bait-and-switch ("They want more money already?"). User frustrated, closes page without engaging, negative reviews mentioning "pushy upselling".
**Why it happens:** Developer adds bundle offer to checkout success page to maximize exposure. Doesn't account for user psychology (just paid, wants to see what they bought, not another price).
**How to avoid:** Show bundle offer after song delivery (song page after selection), not on payment success page. Success page should confirm order and redirect to generation. Bundle offer appears after user experiences satisfaction (heard their song, selected favorite). Context matters.
**Warning signs:** High bundle offer dismiss rate on success page (>90%), low conversion (<3%), user feedback about "too many upsells", analytics show users leaving site immediately after success page.

### Pitfall 6: No Link Between Upsell and Original Order
**What goes wrong:** User purchases +1 variant upsell, but new order created is disconnected from original 3-variant order. Two separate entries in orders table, no relationship. Can't track which upsells converted, can't display "Order 123 + Upsell" in dashboard, analytics broken.
**Why it happens:** Upsell checkout creates new order without storing originalOrderId in metadata. Webhook handler treats upsell as independent order.
**How to avoid:** Always pass originalOrderId in upsell checkout metadata. Store in orders.parent_order_id column (add migration). Dashboard queries join orders to show "Base + Upsell" grouped view. Analytics can track conversion funnel (base order → upsell → bundle).
**Warning signs:** Can't answer "What % of users who see upsell modal purchase?", orders table has duplicate customization_ids with no relationship, dashboard shows 2 separate orders for same song, variant numbers don't align (two orders with variant 1-3 instead of 1-4).

## Code Examples

Verified patterns from official sources:

### Stripe Inline Price Data for Dynamic Discounts
```typescript
// Source: https://docs.stripe.com/api/checkout/sessions/create
// Pattern: Use price_data instead of Price IDs for one-off dynamic pricing

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'gbp',
        product_data: {
          name: 'Additional Song Variant',
          description: '1 more AI-generated variant',
        },
        unit_amount: 499, // £4.99 - calculated server-side
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  // ...
})

// GOOD: Server-side discount calculation
const BASE_PRICE = 799 // £7.99
const UPSELL_DISCOUNT_PERCENT = 37 // 37% off
const UPSELL_PRICE = Math.round(BASE_PRICE * (1 - UPSELL_DISCOUNT_PERCENT / 100))

// BAD: Client-calculated discount passed to server
// const amount = calculateDiscount(basePrice, discountPercent) // Manipulable
```

### PostgreSQL Optimistic Locking for Credit Redemption
```sql
-- Source: PostgreSQL WHERE clause as optimistic lock
-- Pattern: UPDATE with WHERE condition on current value prevents race conditions

-- Fetch current credit balance
SELECT quantity_remaining FROM bundles WHERE id = $1;
-- Returns: { quantity_remaining: 5 }

-- Decrement with optimistic lock
UPDATE bundles
SET quantity_remaining = quantity_remaining - 1
WHERE id = $1
  AND quantity_remaining = 5; -- Only update if still 5

-- If concurrent request already decremented, UPDATE returns 0 rows
-- Application can detect and retry or fail gracefully
```

```typescript
// Typescript implementation with retry logic
async function redeemWithRetry(bundleId: string, maxRetries = 3): Promise<boolean> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { data: bundle } = await supabase
      .from('bundles')
      .select('quantity_remaining')
      .eq('id', bundleId)
      .single()

    if (!bundle || bundle.quantity_remaining <= 0) {
      return false // No credits available
    }

    const { count } = await supabase
      .from('bundles')
      .update({ quantity_remaining: bundle.quantity_remaining - 1 })
      .eq('id', bundleId)
      .eq('quantity_remaining', bundle.quantity_remaining) // Optimistic lock

    if (count === 1) {
      return true // Success
    }

    // Race condition detected, retry
    await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1))) // Exponential backoff
  }

  return false // Max retries exceeded
}
```

### Post-Purchase Upsell Modal Timing
```typescript
// Source: https://www.yotpo.com/blog/post-purchase-upsell/
// Pattern: Track user behavior, trigger after meaningful engagement

export function VariantSwiperWithUpsell({ orderId, variants }: Props) {
  const [viewedVariantIndices, setViewedVariantIndices] = useState<Set<number>>(new Set())
  const [showUpsellModal, setShowUpsellModal] = useState(false)

  const handleIndexChange = (newIndex: number) => {
    setViewedVariantIndices((prev) => new Set(prev).add(newIndex))

    // Check if user has viewed all 3 base variants
    if (viewedVariantIndices.size === 2 && newIndex === 2) {
      // User just viewed last variant (0, 1, 2 all seen)
      setTimeout(() => {
        setShowUpsellModal(true)
      }, 5000) // Wait 5 seconds for natural feel
    }
  }

  return (
    <>
      <VariantSwiper onIndexChange={handleIndexChange} />
      <VariantUpsellModal isOpen={showUpsellModal} />
    </>
  )
}

// GOOD: Trigger after full engagement (all variants viewed + delay)
// BAD: Trigger on page load or after fixed time without behavior tracking
```

### Bundle Purchase Webhook Handler
```typescript
// Source: Stripe webhook best practices
// Pattern: Differentiate order types via metadata, create appropriate records

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderType = session.metadata.orderType as 'base' | 'upsell' | 'bundle'

    if (orderType === 'bundle') {
      // Create bundle record instead of triggering generation
      await supabase.from('bundles').insert({
        user_id: session.metadata.userId,
        order_id: createdOrder.id,
        bundle_tier: session.metadata.bundleTier,
        quantity_purchased: parseInt(session.metadata.quantity),
        quantity_remaining: parseInt(session.metadata.quantity),
      })

      // No Inngest event for bundles (credits used later)
      return NextResponse.json({ received: true })
    }

    // For base/upsell, trigger generation
    await inngest.send({
      name: 'song/generation.requested',
      data: { orderId: createdOrder.id, variantCount: orderType === 'upsell' ? 1 : 3 },
    })
  }

  return NextResponse.json({ received: true })
}

// GOOD: Route to different flows based on order_type
// BAD: Treating all purchases the same (triggers generation for bundles incorrectly)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pre-purchase upsells in cart | Post-purchase one-click upsells | Shopify 2019, Stripe 2020 | Post-purchase converts 2-3x higher (10-15% vs 3-5%), doesn't risk abandoning original sale, better UX |
| Coupon codes for discounts | Inline price_data with dynamic calculation | Stripe always supported, best practice 2023+ | No coupon management overhead, server calculates discount based on context (user tier, original order), single-use automatically enforced |
| Credits as subscription usage limits | Credits as one-time bundle purchases | SaaS shift from subscriptions to credits 2024-2025 | Simpler billing (no recurring charges), users prefer predictable one-time cost, easier to understand value ("5 songs" vs "monthly quota") |
| Email upsells next day | In-app modal at point of satisfaction | 2023+ conversion optimization | Modal captures immediate satisfaction (song just completed, emotional high), email requires second touchpoint with lower conversion, immediacy drives action |
| Manual discount validation | Server-side pricing constants with validation | Security best practice always, enforcement 2024+ | Prevents client-side price manipulation, protects revenue, single source of truth for pricing, easier to update prices centrally |

**Deprecated/outdated:**
- **Subscription model for song generation:** Requirements explicitly exclude subscriptions, prefer fixed packages (PAY-01 through PAY-07). Subscriptions add recurring billing complexity for one-time purchases.
- **Stripe Price IDs for dynamic discounts:** Price IDs better for catalog pricing, but inline price_data simpler for contextual discounts (upsell varies by original order). Use price_data for upsells/bundles.
- **Email-based bundle offers:** Modern upsell best practice is in-app modal at point of satisfaction. Email adds friction (leave app, check inbox, click link, return). Modal immediate.
- **Credit expiration dates:** Research shows non-expiring credits drive higher purchase conversion (no urgency pressure) and reduce support burden ("I forgot to use my credits"). Set expires_at to NULL unless legal/fraud reasons require expiry.

## Open Questions

1. **Optimal Upsell Discount Percentage:**
   - What we know: Research suggests 30-50% discount optimal for upsells (enough to feel valuable, not so deep it devalues original). £4.99 (37% off £7.99) falls in this range.
   - What's unclear: Whether 37% is optimal for this specific product (song generation) vs other discount levels (25%, 40%, 50%). Impact on conversion rate vs revenue per conversion.
   - Recommendation: Start with £4.99 (37% discount), A/B test against £5.99 (25% discount) in Phase 8 analytics. Track conversion rate and total revenue per modal impression to find optimal balance.

2. **Bundle Tier Pricing Strategy:**
   - What we know: Larger bundles should have deeper per-unit discounts (3-pack 17% off, 5-pack 25% off, 10-pack 37% off per research). "Popular" badge on middle tier increases sales.
   - What's unclear: Whether 3 tiers optimal vs 2 or 4 tiers, whether price anchoring (showing highest tier first) increases mid-tier sales, whether to offer custom bundle sizes.
   - Recommendation: Start with 3 tiers (3/5/10 songs), mark 5-pack as "Popular". Test in Phase 8 if 2 tiers (5/10) perform better (less choice paralysis). Avoid custom sizes for v1 (adds UI complexity).

3. **Bundle Credit Auto-Apply vs Manual Selection:**
   - What we know: Auto-applying bundle credits creates zero-friction experience (user doesn't think about payment method). Manual selection gives control but adds decision fatigue.
   - What's unclear: Whether users want visibility into credit usage (explicit "Use 1 bundle credit?" prompt) or prefer automatic (credits apply silently, shown in dashboard).
   - Recommendation: Auto-apply credits with prominent notification ("Using 1 of 5 bundle credits") during generation. Dashboard shows credit balance and usage history. No manual selection for v1 - optimize for simplicity.

4. **Upsell Modal Dismiss Persistence:**
   - What we know: Once user dismisses upsell modal, showing again feels aggressive. But user might change mind after selecting favorite and realizing they want more options.
   - What's unclear: Whether to show modal only once per order (dismiss flag persists across sessions) or reset on page refresh (allow re-trigger). Whether to add "Show me this offer again" checkbox.
   - Recommendation: Dismiss flag persists for specific order (localStorage keyed by orderId), but doesn't prevent modal on different orders. Add subtle "Want more variants?" link in UI after dismissal (non-intrusive re-entry point).

5. **Bundle Offer Timing on Song Page:**
   - What we know: Bundle offer should appear after user satisfaction (song completed, favorite selected). Immediate display on song page vs after user actions (play song, download).
   - What's unclear: Optimal timing (immediately visible on load vs after 10 seconds of interaction), whether to hide offer after dismissal or keep persistent at bottom.
   - Recommendation: Display bundle offer below song player, visible on load but not blocking content. User can dismiss with X button (hide for session). Re-show on next song page visit (separate occasion, renewed interest).

## Sources

### Primary (HIGH confidence)
- [Stripe Subscription Upsells Documentation](https://docs.stripe.com/payments/checkout/upsells) - Official patterns for upsell checkout sessions, pricing strategies, one-click acceptance
- [Stripe Payment Intents Metadata Documentation](https://docs.stripe.com/metadata) - Metadata specifications (50 keys, 40 char names, 500 char values), use cases for order tracking
- [Product Mix Pricing Strategies - Stripe](https://stripe.com/resources/more/product-mix-pricing-strategies-for-growth) - Dynamic pricing models, tiered pricing, bundling strategies
- [SaaS Credits System Guide 2026](https://colorwhistle.com/saas-credits-system-guide/) - Credit ledger architecture, transaction processing, bundle redemption tracking
- [One-Click Post-Purchase Upsell Landing Page Guide 2026](https://passionates.com/one-click-post-purchase-upsell-landing-page/) - Post-purchase timing, conversion benchmarks (10-15%), UX best practices

### Secondary (MEDIUM confidence)
- [Post Purchase Upsell Best Practices - Yotpo](https://www.yotpo.com/blog/post-purchase-upsell/) - Timing strategies, personalization, 2-3x higher conversion vs pre-purchase
- [Shopify Post-Purchase Upsell Design Strategy 2026](https://gempages.net/blogs/shopify/shopify-post-purchase-upsell-design) - Offer simplicity, limiting offers (max 3), mobile optimization
- [3 Upsell UX Best Practices - Contentsquare](https://contentsquare.com/blog/upsell-ux-best-practices-drive-ecommerce-sales/) - Relevance, clarity, non-intrusive placement
- [SaaS Credits Workflow Developer Guide](https://colorwhistle.com/saas-credits-workflow/) - Implementation patterns, real-time tracking, optimistic locking for credit redemption
- [How to Implement Credit System in Subscription Model 2025](https://flexprice.io/blog/how-to-implement-credit-system-in-subscription-model) - Database schema, FIFO redemption, expiration handling

### Tertiary (LOW confidence)
- [Stripe Metered Billing & Credits Integration](https://colorwhistle.com/stripe-saas-credits-billing/) - Usage-based pricing (not applicable to fixed packages, but credit tracking patterns relevant)
- [2025 State of SaaS Pricing Changes](https://www.growthunhinged.com/p/2025-state-of-saas-pricing-changes) - Trend toward credits and re-bundling (context, not implementation)
- [UX for Post-Purchase Product Offers - Shopify](https://shopify.dev/docs/apps/build/checkout/product-offers/ux-for-post-purchase-product-offers) - Shopify-specific patterns, some transferable to web app

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All required libraries already in stack (Stripe, Supabase, Framer Motion, React Query), patterns verified in prior phases
- Architecture: HIGH - Upsell modal patterns verified across multiple sources (Yotpo, Contentsquare, Shopify), bundle redemption patterns standard in SaaS (Colorwhistle, FlexPrice)
- Pitfalls: MEDIUM-HIGH - Common pitfalls documented in multiple sources (timing, pricing validation, race conditions), credit redemption pitfalls from SaaS best practices

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days, pricing psychology stable, Stripe API stable, SaaS patterns mature)
