---
phase: 06-upsells-monetization
plan: 02
subsystem: payments, ui
tags: stripe, upsell, modal, framer-motion, react

# Dependency graph
requires:
  - phase: 06-upsells-monetization
    plan: 01
    provides: UPSELL_PRICE constant, createCheckoutSession with orderType support
provides:
  - Server Action for secure upsell checkout with ownership validation
  - Animated upsell modal component with pricing display and benefits
  - Generation page upsell trigger after viewing all 3 variants
  - Upsell success notification on return from checkout
affects: [06-03-bundle-redemption, 07-sharing-virality, 08-polish-ux, 09-analytics-admin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Action pattern for authenticated upsell checkout
    - AnimatePresence for modal mount/unmount animations
    - useEffect with setTimeout for delayed modal trigger
    - onIndexChange callback pattern for parent-child communication

key-files:
  created:
    - src/actions/create-upsell-checkout.ts
    - src/components/upsells/VariantUpsellModal.tsx
  modified:
    - src/app/generate/[orderId]/page.tsx
    - src/components/generation/VariantSwiper.tsx

key-decisions:
  - "Upsell modal appears after 5-second delay once user has viewed all 3 variants"
  - "Dismiss flag (upsellDismissed) prevents modal from re-appearing in same session"
  - "Server Action validates order ownership and prevents duplicate upsells (max 4 variants)"
  - "onIndexChange callback tracks variant navigation to detect when user reaches last variant"
  - "Success notification shows when returning from upsell checkout with ?upsell=success param"

patterns-established:
  - "Optional callback props pattern for child components to communicate state changes to parent"
  - "Server Action validates pricing server-side with hardcoded constants (never trusts client)"
  - "Modal dismissal state persists in component state for session-level persistence"

# Metrics
duration: 2.5min
completed: 2026-02-08
---

# Phase 6 Plan 2: Upsell UI Summary

**Animated upsell modal appears 5 seconds after viewing all 3 variants, offering 4th variant at £4.99 (37% discount) with server-validated checkout and session-persistent dismissal**

## Performance

- **Duration:** 2 min 29 sec
- **Started:** 2026-02-08T22:35:42Z
- **Completed:** 2026-02-08T22:38:11Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Server Action validates user auth, order ownership, and prevents duplicate upsells (max 4 variants per order)
- Upsell modal component with AnimatePresence animations, pricing card showing £4.99 with 37% savings badge
- Generation page triggers modal 5 seconds after user navigates to last variant (index === total - 1)
- VariantSwiper communicates current index to parent via onIndexChange callback
- Upsell success notification shows when returning from Stripe checkout
- Dismiss button sets upsellDismissed flag to prevent modal from re-appearing in same session

## Task Commits

Each task was committed atomically:

1. **Task 1: Create upsell Server Action and modal component** - `479b542` (feat)
2. **Task 2: Integrate upsell modal trigger into generation page** - `b7133ae` (feat)

## Files Created/Modified
- `src/actions/create-upsell-checkout.ts` - Server Action with auth, ownership, variant count validation, hardcoded UPSELL_PRICE
- `src/components/upsells/VariantUpsellModal.tsx` - Animated modal with pricing card, benefits list, accept/dismiss buttons
- `src/app/generate/[orderId]/page.tsx` - Upsell modal integration with 5-second delay trigger, success notification
- `src/components/generation/VariantSwiper.tsx` - onIndexChange callback for parent notification

## Decisions Made
- **5-second delay before modal appears:** Prevents interrupting user immediately when reaching last variant, gives time to consider options
- **Session-persistent dismissal:** upsellDismissed state variable ensures modal doesn't re-appear if user dismisses it, but resets on page reload (intentional for fresh session)
- **Server-side variant count check:** createUpsellCheckout queries song_variants count and throws error if >= 4 to prevent duplicate upsell purchases
- **onIndexChange callback pattern:** VariantSwiper calls optional callback when index changes (goToNext, goToPrevious, dot click) to notify parent component
- **Success param notification:** Generation page checks searchParams for ?upsell=success and shows green notification that 4th variant is being generated

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without issues. TypeScript compilation passed on first attempt.

## Next Phase Readiness

**Ready for:**
- Plan 03 (06-03): Bundle redemption can now coexist with upsell flow (both use same generation page)
- Phase 07: Sharing flow can display upsell offer for shared song recipients
- Phase 08: UX polish can refine upsell modal timing and messaging

**No blockers.**

**Notes:**
- Upsell modal only appears when user has exactly 3 variants (not 4+). If webhook creates 4th variant before user dismisses modal, modal will still appear but checkout will fail with "Order already has maximum variants" error.
- React Query polling in useGenerationStatus will automatically refetch variants when 4th variant is created, triggering re-render of VariantSwiper with 4 variants instead of 3.
- Modal appearance is tied to hasSwipedAll state (when user navigates to last variant index), not completedCount. This means if user navigates back and forth, modal only triggers once when they first reach the end.

---
*Phase: 06-upsells-monetization*
*Completed: 2026-02-08*

## Self-Check: PASSED

All created files verified:
- src/actions/create-upsell-checkout.ts
- src/components/upsells/VariantUpsellModal.tsx

All commits verified:
- 479b542 (Task 1)
- b7133ae (Task 2)
