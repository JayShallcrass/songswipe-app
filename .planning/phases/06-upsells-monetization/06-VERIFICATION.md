---
phase: 06-upsells-monetization
verified: 2026-02-08T23:15:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
---

# Phase 6: Upsells & Monetization Verification Report

**Phase Goal:** After the core purchase-create-deliver flow works, users are offered natural upsell opportunities that extend their experience without feeling forced

**Verified:** 2026-02-08T23:15:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | After swiping through 3 variants, user is offered the option to generate a 4th variant at a reduced price | ✓ VERIFIED | VariantUpsellModal appears after hasSwipedAll=true with 5-second delay, displays £4.99 price (37% discount), calls createUpsellCheckout on acceptance |
| 2 | After completing and sharing their song, user is offered a discounted multi-generation bundle for other occasions or recipients | ✓ VERIFIED | BundleOfferCard renders on song delivery page (/song/[id]) with 3 tiers (3-pack, 5-pack, 10-pack) with progressive discounts (17%, 25%, 37%), calls createBundleCheckout on purchase |
| 3 | Bundle purchases are tracked and available for the user to redeem on future song creations | ✓ VERIFIED | Webhook creates bundle credit records in bundles table, checkout.ts checks getUserBundleBalance and calls redeemBundleCredit before Stripe redirect, optimistic locking prevents race conditions |

**Score:** 3/3 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/003_add_bundles.sql` | Bundles table migration with RLS, parent_order_id | ✓ VERIFIED | 37 lines, CREATE TABLE bundles with CHECK constraints, RLS policies, indexes, ALTER TABLE orders ADD parent_order_id |
| `src/lib/bundles/types.ts` | Bundle tier types and interfaces | ✓ VERIFIED | 35 lines, exports BundleTier, BundleRecord, BundleBalance interfaces |
| `src/lib/bundles/pricing.ts` | Server-side pricing constants | ✓ VERIFIED | 53 lines, BASE_PRICE=799, UPSELL_PRICE=499, BUNDLE_TIERS array with 3 tiers, validation functions |
| `src/types/database.ts` | Bundle table types, parent_order_id in Order | ✓ VERIFIED | 262 lines, includes bundles table types (Row/Insert/Update), parent_order_id in orders table types |
| `src/lib/stripe.ts` | Updated checkout helper with orderType support | ✓ VERIFIED | 101 lines, accepts orderType/amount/metadata params, dynamic product names, inline price_data |
| `src/app/api/webhook/route.ts` | Webhook branching for base/upsell/bundle | ✓ VERIFIED | 163 lines, branching logic at lines 80-141: bundle→insert bundles, upsell→generate 1 variant with parent_order_id, base→generate 3 variants |
| `src/actions/create-upsell-checkout.ts` | Server Action for upsell checkout | ✓ VERIFIED | 59 lines, auth check, order ownership validation, variant count check (prevents >4), hardcoded UPSELL_PRICE, returns session URL |
| `src/components/upsells/VariantUpsellModal.tsx` | Animated upsell modal | ✓ VERIFIED | 135 lines, AnimatePresence, pricing card with savings badge, benefits list, accept/dismiss buttons, calls createUpsellCheckout |
| `src/app/generate/[orderId]/page.tsx` | Generation page with upsell trigger | ✓ VERIFIED | 242 lines, hasSwipedAll state, 5-second delay useEffect, upsellDismissed flag, renders VariantUpsellModal, handleVariantIndexChange callback |
| `src/components/generation/VariantSwiper.tsx` | Updated with onIndexChange callback | ✓ VERIFIED | 161 lines, onIndexChange prop added to interface (line 16), called in goToNext/goToPrevious/dot click (lines 38, 47, 142) |
| `src/actions/create-bundle-checkout.ts` | Server Action for bundle checkout | ✓ VERIFIED | 39 lines, auth check, tier lookup via getBundleTier, hardcoded tier.price (not client amount), returns session URL |
| `src/lib/bundles/redemption.ts` | Bundle credit redemption with optimistic locking | ✓ VERIFIED | 90 lines, redeemBundleCredit uses .eq('quantity_remaining', currentValue) for atomic decrement, getUserBundleBalance aggregates across bundles |
| `src/actions/checkout.ts` | Updated base checkout with bundle credit check | ✓ VERIFIED | 83 lines, checks getUserBundleBalance (line 30), calls redeemBundleCredit if credits available (line 34), creates order directly and triggers Inngest when redeemed (bypasses Stripe) |
| `src/components/upsells/BundleOfferCard.tsx` | 3-tier bundle offer card | ✓ VERIFIED | 128 lines, BUNDLE_TIERS[1] default (5-pack), purple-to-pink gradient, dismissable, calls createBundleCheckout, displays per-song savings |
| `src/app/song/[id]/page.tsx` | Song page with bundle offer | ✓ VERIFIED | 113 lines, imports and renders BundleOfferCard at line 104, positioned below song details with divider |

**All artifacts verified:** 15/15

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/lib/stripe.ts` | Stripe API | price_data with dynamic amount | WIRED | Line 56-62: price_data with unit_amount from parameter |
| `src/app/api/webhook/route.ts` | supabase bundles table | insert on bundle purchase | WIRED | Lines 90-98: supabase.from('bundles').insert() with tier/quantity from metadata |
| `src/lib/bundles/pricing.ts` | `src/lib/stripe.ts` | pricing constants imported | WIRED | Line 2: import { BASE_PRICE } from './bundles/pricing' |
| `src/app/generate/[orderId]/page.tsx` | `VariantUpsellModal` | hasSwipedAll state triggers modal | WIRED | Lines 19-21: state vars, lines 33-41: useEffect with 5s delay, line 201: renders modal |
| `VariantUpsellModal` | `createUpsellCheckout` | handleAccept calls Server Action | WIRED | Lines 20-30: async handleAccept calls createUpsellCheckout and redirects |
| `createUpsellCheckout` | `src/lib/stripe.ts` | creates checkout with upsell orderType | WIRED | Lines 43-55: calls createCheckoutSession with orderType='upsell', metadata with originalOrderId |
| `src/app/song/[id]/page.tsx` | `BundleOfferCard` | rendered below song player | WIRED | Line 10: import, line 104: <BundleOfferCard /> |
| `BundleOfferCard` | `createBundleCheckout` | handlePurchase calls Server Action | WIRED | Lines 15-25: async handlePurchase calls createBundleCheckout with selectedTier.id |
| `createBundleCheckout` | `src/lib/stripe.ts` | creates checkout with bundle orderType | WIRED | Lines 23-35: calls createCheckoutSession with orderType='bundle', metadata with bundleTier/quantity |
| `src/lib/bundles/redemption.ts` | supabase bundles table | optimistic lock UPDATE | WIRED | Lines 36-42: .update().eq('id').eq('quantity_remaining', currentValue) for atomic decrement |
| `src/actions/checkout.ts` | `redemption.ts` | checks balance and redeems credit | WIRED | Lines 5, 30, 34: imports and calls getUserBundleBalance/redeemBundleCredit before Stripe redirect |

**All key links wired:** 11/11

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| PAY-04: After swiping 3 variants, user can purchase +1 additional variant at reduced price | ✓ SATISFIED | None — modal appears after viewing all 3, offers £4.99 (37% discount), server validates pricing/ownership/variant count |
| PAY-05: After completing and sharing song, user is offered a discounted multi-generation bundle | ✓ SATISFIED | None — BundleOfferCard with 3 tiers renders on song delivery page, progressive discounts (17%/25%/37%), server validates tier/pricing |
| PAY-06: Bundle purchases are tracked and available for future song creations | ✓ SATISFIED | None — webhook creates bundle credits, checkout.ts auto-redeems before Stripe (instant free checkout), optimistic locking prevents race conditions |

**Requirements coverage:** 3/3 satisfied

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| N/A | - | None found | - | - |

**Zero blocker anti-patterns detected.**

Console.log statements in webhook handler (lines 53, 105, 125, 139, 151) are legitimate operational logging after successful operations, not stub patterns.

### Must-Haves Summary (from PLAN frontmatter)

#### Plan 06-01 (Bundle Infrastructure)

**Truths:**
- ✓ Bundles table exists in database with quantity tracking and RLS policies
- ✓ Stripe checkout helper supports base, upsell, and bundle order types with dynamic pricing
- ✓ Webhook handler routes bundle purchases to create bundle credit records instead of triggering generation
- ✓ Webhook handler routes upsell purchases to generate a single variant linked to original order
- ✓ All pricing is validated server-side with fixed constants (never client-calculated)
- ✓ Bundle credit redemption integration into base checkout flow is planned in Plan 03 (06-03), which creates the redemption module and wires it into the order flow

**All 6 truths verified.**

#### Plan 06-02 (Upsell UI)

**Truths:**
- ✓ After swiping through all 3 variants, user sees a modal offering a 4th variant at reduced price (£4.99)
- ✓ Modal appears after a 5-second delay once all 3 variants are viewed (not before)
- ✓ Dismissing the modal prevents it from re-appearing for that order
- ✓ Accepting the upsell redirects to Stripe Checkout for the discounted amount
- ✓ Server Action validates pricing server-side and verifies order ownership before creating checkout session

**All 5 truths verified.**

#### Plan 06-03 (Bundle Redemption & Offer)

**Truths:**
- ✓ After selecting their favorite song and viewing the delivery page, user sees a bundle offer with 3 tier options (3-pack, 5-pack, 10-pack)
- ✓ User can select a bundle tier and proceed to Stripe Checkout for the bundle purchase
- ✓ Bundle purchases create credit records in the database with correct quantity
- ✓ Bundle credit redemption uses optimistic locking to prevent race conditions
- ✓ Base checkout flow checks for available bundle credits before redirecting to Stripe, auto-applying a credit if available (PAY-06 redemption)
- ✓ Bundle offer can be dismissed and does not block access to the song
- ✓ Server Action validates bundle tier and pricing server-side before creating checkout

**All 7 truths verified.**

**Combined must-haves:** 18/18 verified

### Human Verification Required

#### 1. Upsell Modal Timing and UX Flow

**Test:** 
1. Complete base checkout and reach generation page
2. Navigate through all 3 variants (swipe to last variant)
3. Wait 5 seconds while remaining on last variant
4. Observe upsell modal appearance
5. Dismiss modal, navigate back and forth between variants
6. Verify modal does NOT re-appear after dismissal

**Expected:**
- Modal appears exactly 5 seconds after reaching final variant (not immediately)
- Modal has smooth fade-in animation (AnimatePresence)
- Pricing clearly shows £4.99 with crossed-out £7.99 and "Save 37%" badge
- Dismissing hides modal permanently for that session
- Modal does not re-appear when navigating between variants after dismissal

**Why human:** Timing precision (5-second delay), animation smoothness, visual appearance, session-persistent state behavior cannot be verified programmatically

#### 2. Upsell Checkout and 4th Variant Generation

**Test:**
1. From upsell modal, click "Yes, Generate 4th Variant"
2. Verify redirect to Stripe Checkout
3. Complete payment with test card (4242 4242 4242 4242)
4. Return to generation page with ?upsell=success param
5. Wait 30-60 seconds for generation
6. Verify 4th variant appears in swiper

**Expected:**
- Stripe Checkout shows "Additional Song Variant" for £4.99
- After payment, return to /generate/{orderId}?upsell=success
- Green notification shows "4th variant is being generated..."
- Within 30-60 seconds, variant swiper updates to show "Variant 4 of 4"
- Can listen to and select the 4th variant

**Why human:** End-to-end payment flow, real-time generation monitoring, visual notification appearance, audio playback functionality

#### 3. Bundle Offer Display and Tier Selection

**Test:**
1. Select a favorite variant and reach song delivery page (/song/[id])
2. Scroll below song player and details to view bundle offer
3. Verify 3 tiers are displayed (3-pack, 5-pack, 10-pack)
4. Verify 5-pack has "POPULAR" badge and is pre-selected (white background)
5. Click each tier and verify visual selection state changes
6. Verify pricing, per-song price, and savings % for each tier
7. Click X button to dismiss offer
8. Verify offer disappears and song remains accessible

**Expected:**
- Bundle offer card has purple-to-pink gradient background
- 5-pack is selected by default with white background and shadow
- Clicking tiers changes selection (purple border + scale animation)
- Savings calculated correctly: 3-pack (17%), 5-pack (25%), 10-pack (37%)
- "What You Get" section shows correct quantity for selected tier
- Dismissing hides card, song player and download remain functional

**Why human:** Visual design verification, interaction feedback, animation smoothness, layout and spacing, dismissal behavior

#### 4. Bundle Checkout and Credit Creation

**Test:**
1. From bundle offer card, select a tier (e.g., 5-pack)
2. Click "Get 5 Songs for £29.99"
3. Verify redirect to Stripe Checkout
4. Complete payment with test card
5. After success, navigate to dashboard (or return URL)
6. Verify bundle purchase recorded (requires dashboard implementation or database query)

**Expected:**
- Stripe Checkout shows "Song Bundle - 5-Pack" for £29.99 with "5 song credits"
- After payment, redirect to /dashboard?bundle=success
- Bundle credit record created in database with quantity_purchased=5, quantity_remaining=5

**Why human:** End-to-end payment flow, Stripe product details display, database verification (or dashboard UI when implemented)

#### 5. Bundle Credit Redemption (Auto-Apply)

**Test:**
1. Ensure user has bundle credits (purchase a bundle or insert test data)
2. Start a new song creation flow (swipe builder → personalization form)
3. Click "Continue to Checkout" on customize page
4. Verify redirect to generation page WITHOUT Stripe Checkout
5. Verify order record created with payment_method='bundle_credit' and amount=0
6. Verify generation starts immediately
7. Complete second song creation cycle
8. Verify credit count decrements (requires dashboard or database query)

**Expected:**
- When bundle credits available, no Stripe Checkout screen appears
- Immediate redirect to /generate/{orderId} with generation starting
- Order record shows payment_method='bundle_credit', amount=0, status='paid'
- Bundle record's quantity_remaining decrements by 1
- If multiple songs created rapidly (race condition test), only one credit redeemed per generation

**Why human:** Full user flow verification, Stripe bypass behavior, database state verification, race condition handling in real concurrent usage

#### 6. Pricing Consistency and Server-Side Validation

**Test:**
1. Open browser devtools and modify pricing constants in frontend code
2. Attempt to trigger upsell checkout with tampered pricing
3. Attempt to trigger bundle checkout with tampered tier data
4. Verify server rejects invalid pricing

**Expected:**
- Server-side validation rejects any client-side pricing manipulation
- Server uses hardcoded constants (UPSELL_PRICE=499, BUNDLE_TIERS prices)
- Error thrown if pricing mismatch detected
- No way to bypass server validation via client manipulation

**Why human:** Security testing requires deliberate manipulation and observation of rejection behavior

---

## Gaps Summary

**No gaps found.** All must-haves verified, all artifacts substantive and wired, all requirements satisfied.

---

_Verified: 2026-02-08T23:15:00Z_
_Verifier: Claude (gsd-verifier)_
