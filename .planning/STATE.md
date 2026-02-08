# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** The swipe mechanic must feel fun and natural -- swiping through song options should be the core experience that makes SongSwipe different from competitors.
**Current focus:** Phase 6 in progress - Upsells & Monetization

## Current Position

Phase: 6 of 9 (Upsells & Monetization)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-08 -- Completed 06-01-PLAN.md (Bundle Infrastructure)

Progress: [████████████░░] 80%

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 2.6 min
- Total execution time: 0.59 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2/2 | 5 min | 2.5 min |
| 02 | 2/2 | 4 min | 2.0 min |
| 03 | 3/3 | 13 min | 4.3 min |
| 04 | 3/3 | 6 min | 2.0 min |
| 05 | 2/2 | 5 min | 2.5 min |
| 06 | 1/3 | 2.6 min | 2.6 min |

**Recent Trend:**
- Last 5 plans: 04-03 (2.9 min), 05-01 (1.8 min), 05-02 (3.2 min), 06-01 (2.6 min)
- Trend: Maintaining consistent velocity across phases

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Pricing model is fixed packages (not credits) -- research summary references credits but PROJECT.md and REQUIREMENTS.md confirm packages
- Roadmap: Upsells (PAY-04/05/06) separated into Phase 6 after core flow, not bundled with base payment
- Roadmap: Phases 7/8/9 can execute in parallel (all depend on Phase 5 only)
- 01-01: share_token uses UUID with UNIQUE constraint for public sharing (no signed URLs yet)
- 01-01: variant_number allows 1-5 to support +1 upsell without migration
- 01-01: storage_path stores Supabase Storage path, not signed URL (URLs generated on-demand)
- 01-01: RLS service_role policy added explicitly for Inngest job queue access
- 01-02: Inngest chosen over BullMQ/Trigger.dev for TypeScript-native step functions and Vercel compatibility
- 01-02: Partial success pattern - if any variant succeeds, order is 'completed' (better UX than all-or-nothing)
- 01-02: NonRetriableError for 400s (bad input), RetryAfterError for 429s (rate limits)
- 01-02: Idempotency via stripe_session_id prevents duplicate orders from webhook retries
- 02-01: Success URL uses {CHECKOUT_SESSION_ID} placeholder (Stripe replaces automatically) instead of {ORDER_ID} which doesn't exist at checkout time
- 02-01: Order type stored in both session metadata and payment_intent_data metadata for redundancy
- 02-01: Server Action pattern for checkout provides type-safe auth verification and ownership checks
- 02-02: Pricing page CTA links to /customize (not direct checkout) since customize form already handles checkout after collecting song details
- 02-02: Success page shows last 8 chars of session_id as reference for support while maintaining security
- 02-02: Header hidden on /checkout paths for clean post-payment experience
- 03-01: sessionStorage (not localStorage) for swipe state - clears on tab close for fresh start
- 03-01: 40% card width or 500px/s velocity triggers swipe (per SWIPE-09 research)
- 03-01: Voice cards are new data not in existing customize page (warm-male, bright-female, soulful, energetic, gentle)
- 03-01: Right swipe = select and advance, left swipe = skip and show next card in same stage
- 03-01: Only top card draggable (isTop prop) to prevent z-index issues
- 03-02: AnimatePresence exit animation with x offset (±300px), opacity fade, rotation (±15deg) over 0.3s
- 03-02: Card depth stacking shows up to 3 cards with progressive scale (1.0, 0.95, 0.90) and translateY (0, 8px, 16px)
- 03-02: Desktop fallback buttons (Skip/Select) alongside swipe for mouse-only users
- 03-02: Keyboard shortcuts - ArrowLeft (skip), ArrowRight/Enter (select), Escape (undo)
- 03-02: Form element detection prevents keyboard hijacking during text input
- 03-02: SwipeHints uses 'songswipe_hints_seen' localStorage key for one-time tutorial dismissal
- 03-03: Default songLength to 90s (song length selection removed from swipe flow per research)
- 03-03: Mood wrapped in array to match existing /api/customize schema (API expects mood: string[])
- 03-03: Voice style stored in state but not sent to current API (will be used in Phase 4 Eleven Labs enhancement)
- 03-03: Keyboard navigation disabled when isSwipeComplete to prevent hijacking text input
- 03-03: Back button on PersonalizationForm calls undo() to allow re-swiping last stage
- 04-01: Auth pattern for API routes uses createServerSupabaseClient().auth.getUser() to verify user identity
- 04-01: Preview endpoint proxies audio through API to prevent signed URL exposure in browser devtools
- 04-01: Select endpoint atomically unselects other variants before selecting chosen variant
- 04-01: Anti-download headers (inline, no-cache, nosniff) prevent easy download of preview audio
- 04-02: React Query refetchInterval callback conditionally polls based on order status (3s during generation, false when complete/failed)
- 04-02: Object URLs created from audio blobs must be revoked via cleanup function to prevent memory leaks
- 04-02: QueryClient created in useState to avoid sharing between SSR requests
- 04-03: Navigation via arrow buttons + dot indicators (not full swipe) to avoid conflict with audio player controls
- 04-03: Lazy audio loading - only active variant card loads audio (isActive prop) to prevent simultaneous loading
- 04-03: Checkout success polls /api/orders?session_id= every 2s for 30s to handle webhook timing delays
- 04-03: Partial success button allows previewing completed variants before all 3 finish
- 04-03: AnimatePresence slide transitions use directional x offset (±300px) based on navigation direction
- 05-01: Song API uses variant ID instead of order+variant pair for simpler routing (/api/songs/[id])
- 05-01: Signed URL expiry extended to 2 hours (7200s) for delivery endpoints to handle pause/resume scenarios
- 05-01: Download filename personalized with recipient name (songswipe-{sanitized-name}.mp3)
- 05-01: Stream endpoint allows 1-hour browser caching (private, max-age=3600) for playback performance
- 05-01: All delivery endpoints return 404 (not 403) for unauthorized access to prevent enumeration attacks
- 05-02: React Query metadata fetch + separate blob URL management with cleanup pattern prevents memory leaks
- 05-02: Anchor tag download pattern (programmatic click) avoids popup blockers and respects Content-Disposition
- 05-02: Loading skeleton matches player dimensions to prevent layout shift during audio load
- 05-02: react-h5-audio-player with purple-to-pink gradient styling matching app theme
- 06-01: UPSELL_PRICE = 499 pence (£4.99, 37% discount from base) for post-checkout upsell
- 06-01: Bundle tiers: 3-pack (£19.99, 17% savings), 5-pack (£29.99, 25% savings), 10-pack (£49.99, 37% savings)
- 06-01: Bundle purchases create credit records without triggering generation (orderType routing in webhook)
- 06-01: Upsell purchases generate single variant (variant_number 4) linked to parent order via parent_order_id
- 06-01: All pricing validated server-side with fixed constants in src/lib/bundles/pricing.ts
- 06-01: Inline Stripe price_data with dynamic amounts instead of predefined Price IDs for flexibility

### Pending Todos

None yet.

### Blockers/Concerns

- Research flagged: Eleven Labs API tier selection and rate limits need confirmation during Phase 4 planning
- Research flagged: Vercel function timeouts (60s Pro) may not cover full generation times (30s-2min)
- 01-01: Manual Supabase SQL execution required -- migration file must be run in Supabase SQL Editor (free tier doesn't support automated migrations)
- 01-02: Next.js build requires environment variables (Stripe API key) -- will be resolved during deployment setup
- 02-01: Migration 002_add_order_type.sql must be run manually before webhook can store order_type (free tier limitation)
- 06-01: Migration 003_add_bundles.sql must be run manually before upsell/bundle purchases can complete (free tier limitation)

## Session Continuity

Last session: 2026-02-08T22:32:15Z
Stopped at: Completed 06-01-PLAN.md (Bundle Infrastructure)
Resume file: None
