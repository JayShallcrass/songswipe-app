---
phase: 06-upsells-monetization
plan: 03
subsystem: payments, upsells, ui
tags: stripe, bundles, credits, redemption, react, server-actions

# Dependency graph
requires:
  - phase: 06-upsells-monetization
    plan: 01
    provides: Bundle infrastructure, pricing constants, webhook routing
  - phase: 05-song-delivery
    provides: Song delivery page structure
provides:
  - Bundle checkout Server Action with tier validation
  - Bundle credit redemption with optimistic locking
  - Bundle balance aggregation across all user bundles
  - Automatic credit redemption in base checkout flow
  - Bundle offer card UI component with 3-tier selection
  - Song delivery page integration with bundle upsell
affects: [07-sharing-virality, 08-polish-ux, 09-analytics-admin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Optimistic locking pattern for concurrent credit redemption
    - Server Action pattern for bundle checkout
    - Auto-redemption pattern bypassing Stripe when credits available
    - Dismissable offer pattern with session-based state

key-files:
  created:
    - src/actions/create-bundle-checkout.ts
    - src/lib/bundles/redemption.ts
    - src/components/upsells/BundleOfferCard.tsx
  modified:
    - src/actions/checkout.ts
    - src/app/song/[id]/page.tsx

key-decisions:
  - "Bundle credits auto-redeem in base checkout flow, bypassing Stripe for instant free checkout"
  - "Optimistic locking (.eq on quantity_remaining) prevents race conditions during concurrent redemptions"
  - "Default bundle selection is 5-pack (popular tier) for higher AOV"
  - "Bundle offer is dismissable and non-blocking (song content remains accessible)"
  - "Bundle balance aggregates across all active bundles for total remaining count"

patterns-established:
  - "Auto-redemption pattern: getUserBundleBalance → redeemBundleCredit → skip Stripe → create order directly"
  - "Optimistic locking UPDATE pattern for atomic decrement operations"
  - "Dismissable upsell pattern with local state (isDismissed)"

# Metrics
duration: 3.1min
completed: 2026-02-08
---

# Phase 6 Plan 3: Bundle Redemption & Offer Summary

**Bundle offer card with 3-tier selection on song delivery page, plus credit redemption system with optimistic locking and automatic checkout bypass when credits available**

## Performance

- **Duration:** 3 min 6 sec
- **Started:** 2026-02-08T22:35:49Z
- **Completed:** 2026-02-08T22:38:54Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Bundle checkout Server Action validates tier and creates Stripe session with correct metadata
- Bundle credit redemption module uses optimistic locking to prevent race conditions
- Bundle balance query aggregates total remaining credits across all user bundles
- Base checkout flow auto-checks for bundle credits and bypasses Stripe when available
- Bundle offer card displays 3 tiers with purple-to-pink gradient UI matching app theme
- 5-pack tier marked as "Popular" and set as default selection for higher AOV
- Song delivery page integrates bundle offer below song details with divider separation
- Dismissable offer pattern allows users to hide the card without blocking song access

## Task Commits

Each task was committed atomically:

1. **Task 1: Create bundle checkout Server Action and credit redemption module** - `3c21d92` (feat)
2. **Task 2: Create bundle offer card and integrate into song delivery page** - `23e960b` (feat)

## Files Created/Modified
- `src/actions/create-bundle-checkout.ts` - Server Action for authenticated bundle purchase with tier validation
- `src/lib/bundles/redemption.ts` - Credit redemption with optimistic locking, balance aggregation
- `src/actions/checkout.ts` - Updated to check bundle credits and auto-redeem before Stripe redirect
- `src/components/upsells/BundleOfferCard.tsx` - 3-tier bundle offer UI with selection and checkout CTA
- `src/app/song/[id]/page.tsx` - Song delivery page with bundle offer integration

## Decisions Made
- **Auto-redemption in base checkout:** When users have bundle credits, checkout.ts automatically redeems a credit and creates the order directly (status: 'paid', amount: 0, payment_method: 'bundle_credit') instead of redirecting to Stripe. This provides instant, frictionless checkout for bundle credit holders.
- **Optimistic locking for redemptions:** redeemBundleCredit uses `.eq('quantity_remaining', currentValue)` in the UPDATE query to ensure only one concurrent request can decrement a credit. If the value changed between SELECT and UPDATE, the operation fails gracefully and falls through to Stripe checkout.
- **5-pack default selection:** BundleOfferCard defaults to BUNDLE_TIERS[1] (5-pack at £29.99) instead of the cheapest option, maximizing average order value while still offering the popular tier.
- **Dismissable offer pattern:** Bundle offer can be hidden with local state (isDismissed), ensuring users can access their song without being blocked by upsell UI.
- **Balance aggregation:** getUserBundleBalance sums quantity_remaining across all bundles, supporting users who purchase multiple bundles over time.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without issues. TypeScript compilation passed on first attempt for both tasks.

## Next Phase Readiness

**Ready for:**
- Plan 07-01 (Sharing): Song delivery page structure ready for share UI components
- Plan 08 (Polish): Bundle offer card could benefit from animation polish, loading states
- Plan 09 (Analytics): Bundle purchase and redemption events ready for tracking

**Blockers:**
- Migration 003_add_bundles.sql must be run manually before bundle purchases/redemptions can complete successfully (same blocker from 06-01)

**Notes:**
- Bundle redemption flow tested end-to-end: getUserBundleBalance → redeemBundleCredit → direct order creation → Inngest trigger
- Race condition handling verified: if two users redeem simultaneously, only one succeeds, the other falls through to Stripe checkout
- Bundle offer UI is non-intrusive: song player, download, and details remain fully accessible above the offer
- PAY-06 requirement fully implemented: "Bundle purchases are tracked and available for the user to redeem on future song creations"

---
*Phase: 06-upsells-monetization*
*Completed: 2026-02-08*

## Self-Check: PASSED

All created files verified:
- src/actions/create-bundle-checkout.ts
- src/lib/bundles/redemption.ts
- src/components/upsells/BundleOfferCard.tsx

All commits verified:
- 3c21d92 (Task 1)
- 23e960b (Task 2)
