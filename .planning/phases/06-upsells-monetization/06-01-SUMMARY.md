---
phase: 06-upsells-monetization
plan: 01
subsystem: database, payments
tags: stripe, supabase, postgresql, pricing, bundles, upsells

# Dependency graph
requires:
  - phase: 02-base-payment-and-pricing
    provides: Stripe checkout helper, webhook handler, order creation flow
provides:
  - Bundles table with RLS policies for pre-purchased song credits
  - Server-side pricing constants for upsell and bundle tiers
  - Stripe checkout helper supporting dynamic order types (base/upsell/bundle)
  - Webhook routing for bundle credit creation and upsell variant generation
  - Parent order tracking for upsell purchases
affects: [06-02-upsell-ui, 06-03-bundle-redemption, 07-sharing-virality, 08-polish-ux, 09-analytics-admin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server-side pricing validation with fixed constants
    - Order type routing in webhook handler
    - Inline Stripe price_data for dynamic pricing

key-files:
  created:
    - supabase/migrations/003_add_bundles.sql
    - src/lib/bundles/types.ts
    - src/lib/bundles/pricing.ts
  modified:
    - src/types/database.ts
    - src/lib/stripe.ts
    - src/app/api/webhook/route.ts

key-decisions:
  - "UPSELL_PRICE set to 499 pence (£4.99, 37% discount from base price)"
  - "Bundle tiers: 3-pack (£19.99, 17% savings), 5-pack (£29.99, 25% savings), 10-pack (£49.99, 37% savings)"
  - "Bundle purchases create credit records without triggering generation"
  - "Upsell purchases generate single variant (variant_number 4) linked to parent order via parent_order_id"
  - "All pricing validated server-side with fixed constants, never client-calculated"

patterns-established:
  - "Order type branching pattern in webhook: bundle → credit creation, upsell → single variant generation, base → 3 variants generation"
  - "Inline price_data in Stripe checkout for dynamic amounts without managing Price IDs"
  - "parent_order_id foreign key for linking child orders to their parent"

# Metrics
duration: 2.6min
completed: 2026-02-08
---

# Phase 6 Plan 1: Bundle Infrastructure Summary

**Bundles table with RLS policies, server-side pricing constants (UPSELL_PRICE=499, BUNDLE_TIERS with 3 tiers), and webhook routing for bundle credit creation vs upsell variant generation**

## Performance

- **Duration:** 2 min 36 sec
- **Started:** 2026-02-08T22:29:39Z
- **Completed:** 2026-02-08T22:32:15Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Bundles table migration with CHECK constraints, RLS policies, and indexes ready for manual execution
- Server-side pricing constants centralized in src/lib/bundles/pricing.ts with validation functions
- Stripe checkout helper updated to support base/upsell/bundle order types with dynamic product names and metadata
- Webhook handler branching logic implemented: bundle purchases create credit records without generation, upsell purchases generate single variant linked to parent order

## Task Commits

Each task was committed atomically:

1. **Task 1: Create bundles migration, pricing constants, and TypeScript types** - `ef16e23` (feat)
2. **Task 2: Update Stripe checkout helper and webhook handler for upsell/bundle routing** - `c23bbc2` (feat)

## Files Created/Modified
- `supabase/migrations/003_add_bundles.sql` - Bundles table with RLS policies, parent_order_id column for orders table
- `src/lib/bundles/types.ts` - BundleTier, BundleRecord, BundleBalance interfaces
- `src/lib/bundles/pricing.ts` - BASE_PRICE, UPSELL_PRICE, BUNDLE_TIERS constants with validation functions
- `src/types/database.ts` - Bundle table types, parent_order_id added to Order types
- `src/lib/stripe.ts` - Updated createCheckoutSession to accept orderType, amount, metadata, dynamic product names
- `src/app/api/webhook/route.ts` - Branching logic for base/upsell/bundle order types

## Decisions Made
- **UPSELL_PRICE = 499 pence (£4.99):** 37% discount from base price per research recommendation (Research flagged that immediate post-checkout upsell should have significant discount)
- **Bundle tier pricing:** 3-pack (£19.99, 17% savings), 5-pack (£29.99, 25% savings, marked popular), 10-pack (£49.99, 37% savings) with progressive discount structure
- **Bundle purchases skip generation:** orderType === 'bundle' creates credit record in bundles table without triggering Inngest generation event
- **Upsell purchases generate variant 4:** orderType === 'upsell' triggers generation with variantCount: 1 and links to parent order via parent_order_id
- **Inline price_data pattern:** Using Stripe's inline price_data with dynamic unit_amount instead of predefined Price IDs for flexibility across order types
- **Bundle credit redemption deferred:** This plan creates purchase infrastructure only. The redemption module (redeemBundleCredit, getUserBundleBalance) and its integration into base checkout flow is planned for 06-03

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without issues. TypeScript compilation passed on first attempt.

## User Setup Required

**External services require manual configuration.** Migration file must be executed manually:

**Supabase Setup:**
1. Navigate to Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/003_add_bundles.sql`
3. Verify tables created: `SELECT * FROM bundles LIMIT 1;`
4. Verify parent_order_id column added: `\d orders` or check table schema

This is required because Supabase free tier doesn't support automated migrations.

## Next Phase Readiness

**Ready for:**
- Plan 02 (06-02): Upsell UI can now use UPSELL_PRICE constant and createCheckoutSession with orderType='upsell'
- Plan 03 (06-03): Bundle redemption module can query bundles table and decrement quantity_remaining

**Blockers:**
- Migration 003_add_bundles.sql must be run manually before upsell/bundle purchases can complete successfully

**Notes:**
- variantCount and originalOrderId parameters added to Inngest event data but generation function (src/lib/inngest/functions/song-generation.ts) will need updates in Plan 02 to handle upsell variant generation (variant_number 4 instead of 1-3)
- Bundle credit redemption logic (checking if user has credits before redirecting to Stripe) is intentionally NOT in this plan - that's the focus of Plan 03

---
*Phase: 06-upsells-monetization*
*Completed: 2026-02-08*

## Self-Check: PASSED

All created files verified:
- supabase/migrations/003_add_bundles.sql
- src/lib/bundles/types.ts
- src/lib/bundles/pricing.ts

All commits verified:
- ef16e23 (Task 1)
- c23bbc2 (Task 2)
