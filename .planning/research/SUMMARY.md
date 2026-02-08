# Project Research Summary

**Project:** SongSwipe
**Domain:** AI-powered personalized song gift platform with swipe UI and credit monetization
**Researched:** 2026-02-08
**Confidence:** HIGH

## Executive Summary

SongSwipe is an AI-powered personalized song gift platform that differentiates from established competitors (SongFinch, Songlorious, Songful) through two core innovations: a Tinder-style swipe UI for song customization and a credit-based freemium monetization model. The existing market relies exclusively on web forms and flat pricing ($45-$230), so SongSwipe's approach is genuinely novel. The recommended stack extends the existing Next.js 14 / Supabase / Stripe / Eleven Labs foundation with Framer Motion for gesture handling, react-share for social distribution, and Supabase signed URLs for audio protection. No major stack additions are needed -- the existing choices are solid.

The architecture follows a server-first pattern where all credit mutations and audio serving flow through Next.js Server Actions backed by Supabase RPC functions. This prevents client-side tampering with credit balances and keeps audio URLs ephemeral. The swipe builder uses URL parameter persistence for multi-step state, and gift sharing uses cryptographically random tokens (UUID v4) rather than sequential IDs. Stripe credit packs are modeled as one-time products with webhook-driven balance updates, not subscriptions. The build order is tightly sequenced: database schema and job queue infrastructure must exist before anything else, because the credit system and audio generation both depend on atomic server-side operations.

The most dangerous risks are: (1) fire-and-forget AI generation without retry logic, which means users pay but never receive their song, (2) credit deduction without generation validation, causing revenue leakage or customer disputes, and (3) Eleven Labs API rate limits hitting immediately at any real traffic volume. All three demand a proper async job queue (Inngest or BullMQ) from day one -- not as a future optimization. The swipe UX also requires careful calibration of gesture thresholds, undo functionality, and keyboard fallbacks to avoid a frustrating first impression that kills retention.

## Key Findings

### Recommended Stack

The existing stack (Next.js 14, React 18, Supabase, Stripe, Eleven Labs, Tailwind, Zod, Vercel) requires no changes. New additions are targeted and minimal.

**Core additions:**
- **Framer Motion ^11.x**: Drag gestures, card animations, spring physics for swipe UI -- industry standard, tree-shakeable (~40KB gzipped), provides gestures + animations in one package
- **react-share ^5.x**: Social media share buttons (WhatsApp, Facebook, Twitter, Copy Link) -- actively maintained, SSR compatible with 'use client'
- **next/og (built-in)**: Dynamic OG image generation for gift reveal pages -- free, ~800ms generation, native to Next.js 14
- **Supabase Storage signed URLs**: Temporary audio access with 5-15 min expiry for previews -- already in stack, no additional dependency
- **Stripe one-time Products/Prices**: Credit packs as consumable purchases with webhook-driven balance updates -- official Stripe pattern for usage-based billing

**Avoid:** react-tinder-card (abandoned), next-share (abandoned), full DRM solutions (enterprise overkill), Stripe Subscriptions for credit packs (wrong pattern), client-side credit tracking (security risk).

### Expected Features

**Must have (table stakes -- launch blockers):**
- Swipe-based song building (core differentiator, no competitor has this)
- AI song generation with instant preview (vs 1-7 day human artist wait)
- Credit system with freemium entry (1-3 free credits)
- Custom lyric input (all competitors offer this)
- Song page with shareable player link
- Mobile-first responsive design (primary use case is mobile gifting)
- Genre selection (5-8 core genres for MVP)
- Digital delivery (MP3 download)

**Should have (add after core validation):**
- Lyric editing/preview before generation (trigger: user complaints about lyrics)
- Gift scheduling (trigger: users asking "can I schedule?")
- Gift reveal experience with cinematic UI (trigger: differentiation opportunity)
- Mood/vibe selection (trigger: genre alone feels limiting)
- Quality guarantee/free remake (trigger: customer support volume)

**Defer (v2+):**
- Remix/iteration with credits (unclear demand)
- Collaborative song building (coordination complexity)
- Physical add-ons / vinyl (supply chain complexity)
- Voice style selection (adds decision paralysis)
- Multi-language support (market validation first)

### Architecture Approach

The system follows a three-layer architecture: client layer (React components for swipe, credits, gift reveal, user library), server actions layer (all mutations and sensitive operations), and integration layer (Supabase, Stripe, Eleven Labs, CDN). All credit and audio operations are server-side only. Swipe state lives in URL parameters until final submission. Gift sharing uses UUID v4 tokens with RLS policies for public access.

**Major components:**
1. **Swipe Builder** -- Card-based UI for occasion/mood/genre/voice selection, Framer Motion drag gestures, URL param persistence
2. **Credit System** -- Server-side balance (Supabase users.credit_balance), Stripe one-time products for packs, webhook handler for balance updates, atomic RPC deductions
3. **Audio Generation Pipeline** -- Eleven Labs API integration, async job queue for generation, Supabase Storage with signed URLs, preview (30s) and full song (2-3 min) tiers
4. **Gift Reveal** -- Public /share/[token] route, UUID v4 tokens, OG image generation via next/og, react-share social buttons
5. **User Library** -- Dashboard of past songs, signed URL regeneration for playback/download

### Critical Pitfalls

1. **Fire-and-forget AI generation** -- Eleven Labs calls fail silently after payment. Implement async job queue with exponential backoff retry (3-5 attempts) from day one. Add dead-letter queue and status polling. This is the single most catastrophic failure mode.
2. **Credit deduction without generation validation** -- Deduct credits AFTER successful API response, never before. Use two-phase commit (reserve -> generate -> finalize). Add audit log table for all credit movements.
3. **Eleven Labs API rate limits** -- Free tier allows 1-2 concurrent requests. Any real traffic immediately hits limits. Implement application-side rate limiter and queue with configurable concurrency. Plan tier upgrade path before launch.
4. **Swipe gesture ambiguity** -- Users accidentally swipe, can't undo, or don't discover swipe functionality. Require 40%+ card width movement threshold, add undo snackbar, provide keyboard/button fallbacks, add visual swipe hints.
5. **Gift sharing privacy leakage** -- Use UUID v4 tokens (not sequential IDs), never include PII in URLs, add rate limiting on gift view endpoint, log views for abuse detection.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Infrastructure
**Rationale:** Database schema, RLS policies, and async job queue must exist before any feature code. The architecture research shows every component depends on Supabase tables, RPC functions, and server actions. The pitfalls research screams that job queue infrastructure is non-negotiable before processing any real operations.
**Delivers:** Supabase schema (users with credit_balance, songs with share_token), RLS policies, Supabase RPC functions (add_credits, deduct_credits), async job queue setup (Inngest or BullMQ), basic project structure with auth middleware.
**Addresses:** Foundation for all features; prevents pitfalls #1 (fire-and-forget) and #4 (rate limits).
**Avoids:** Technical debt from missing infrastructure (the most expensive kind to retrofit).

### Phase 2: Credit System and Stripe Integration
**Rationale:** Credits must work before any paid operations. Architecture research identifies credit system as prerequisite for audio generation. This phase is the revenue engine.
**Delivers:** Credit purchase page, Stripe Checkout integration with one-time products, webhook handler for checkout.session.completed, credit balance display in header, server-side balance validation.
**Addresses:** Credit system (P1 feature), digital delivery foundation.
**Avoids:** Pitfall #3 (credit deduction without validation) by implementing atomic RPC deductions with audit logging from the start.

### Phase 3: Swipe UI and Song Creation Flow
**Rationale:** Core differentiator. With infrastructure and credits in place, the creation flow can be built end-to-end. Swipe UI is the entire value proposition -- it must be polished.
**Delivers:** SwipeCard and SwipeStack components with Framer Motion, multi-step create flow (/create with URL param state), genre/mood/occasion card decks, lyric input form, form submission to Server Action.
**Addresses:** Swipe-based song building (P1), genre selection (P1), custom lyric input (P1), mobile-first design (P1).
**Avoids:** Pitfall #5 (swipe gesture ambiguity) through conservative thresholds, undo, keyboard fallbacks, and visual hints.

### Phase 4: Audio Generation and Preview
**Rationale:** Depends on both credits (Phase 2) and creation flow (Phase 3). This is the integration-heavy phase connecting Eleven Labs API to the job queue from Phase 1.
**Delivers:** Eleven Labs API integration, 30s preview generation via async queue, Supabase Storage upload to private bucket, signed URL generation, ProtectedPlayer component with disabled downloads, preview flow (generate -> play -> decide).
**Addresses:** AI song generation (P1), audio protection, preview experience.
**Avoids:** Pitfall #2 (signed URL expiry) by using short-lived preview URLs (15-30 min) and regeneration on play.

### Phase 5: Full Song Unlock and Download
**Rationale:** Natural extension of preview -- user heard the preview, now pays to unlock full version. Simple flow but critical path for monetization.
**Delivers:** Unlock Server Action (credit check + full generation), full song storage, download with signed URLs (4-6 hour expiry), song page (/song/[songId]).
**Addresses:** Digital delivery (P1), full song player.

### Phase 6: Gift Reveal and Social Sharing
**Rationale:** Depends on songs existing (Phase 5). Gift sharing is the viral growth mechanism and a key differentiator (competitors just send links).
**Delivers:** Public /share/[token] route, UUID v4 share tokens, OG image generation with next/og, react-share buttons, branded reveal UI.
**Addresses:** Song page with player (P1), gift reveal experience (P2 stretch).
**Avoids:** Pitfall #6 (gift link privacy) through UUID tokens, no PII in URLs, rate limiting.

### Phase 7: User Library and Polish
**Rationale:** Final phase wraps up the user experience with history, re-downloads, and re-sharing. Lower risk, well-documented patterns.
**Delivers:** Dashboard (/dashboard) with song history, re-download with fresh signed URLs, re-share functionality, credit balance history.
**Addresses:** User library, quality-of-life features.

### Phase Ordering Rationale

- **Infrastructure first (Phase 1)** because every subsequent phase depends on database schema, RLS policies, and the job queue. Skipping this guarantees painful retrofits.
- **Credits before creation (Phase 2 before 3)** because the architecture mandates server-side credit validation before any expensive operation. Building creation without credits means stubbing, then ripping out stubs.
- **Swipe UI before audio (Phase 3 before 4)** because users must complete the creation flow to trigger generation. Swipe is the input; audio is the output.
- **Preview before unlock (Phase 4 before 5)** because users preview before deciding to unlock. The two-tier audio model (preview = cheap, full = expensive) is the monetization lever.
- **Sharing last (Phase 6)** because it depends on complete songs existing and is the growth loop, not the core product loop.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Foundation):** Job queue selection (Inngest vs BullMQ vs Trigger.dev) needs hands-on evaluation. Inngest has native Vercel support but BullMQ gives more control. Research the Vercel function timeout constraints (10s free, 60s Pro) against generation times.
- **Phase 4 (Audio Generation):** Eleven Labs API integration details, prompt engineering for song quality, rate limit tier requirements, and generation time expectations (30s-2min) need deeper investigation. Consider whether preview generation can use a lighter/faster model.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Credit System):** Stripe Checkout + webhooks is extremely well-documented. Official Stripe docs cover this exact pattern.
- **Phase 3 (Swipe UI):** Framer Motion drag gestures have official tutorials and multiple open-source implementations.
- **Phase 6 (Gift Reveal):** next/og, react-share, and Supabase RLS for public access are all standard, well-documented patterns.
- **Phase 7 (User Library):** Basic CRUD dashboard with Supabase queries. No novel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries verified with official docs, active maintenance confirmed, version compatibility checked. Framer Motion and react-share are industry standards. |
| Features | MEDIUM | Competitor analysis is solid (pricing, features verified). Credit-based pricing model is LOW confidence for this specific market (no direct precedent), but supported by general SaaS monetization trends. |
| Architecture | HIGH | Patterns are well-established (Server Actions, Supabase RLS, Stripe webhooks, signed URLs). Code examples provided with rationale. Build order dependencies clearly mapped. |
| Pitfalls | HIGH | Sourced from official API docs (Eleven Labs rate limits, Stripe webhooks), established security patterns (signed URLs, UUID tokens), and community experience with similar platforms. |

**Overall confidence:** HIGH -- The stack and architecture are built on mature, well-documented technologies. The main uncertainty is market validation of the credit-based pricing model, which is a business question, not a technical one.

### Gaps to Address

- **Eleven Labs tier selection and costs:** Research identified rate limits as critical, but exact tier pricing and limits for production load need confirmation before launch. Plan for Scale tier if expecting more than 5 concurrent generations.
- **Credit economy design:** How many credits per preview vs full song? What's the free tier allocation (1 vs 3)? What are credit pack price points? These are product/business decisions that need user research or A/B testing, not just technical implementation.
- **AI song quality expectations:** 2026 AI music is "professional-grade" per research, but SongSwipe's specific Eleven Labs integration (voice, instruments, mixing) needs validation against user expectations shaped by human-artist competitors.
- **Audio watermarking feasibility:** Research suggests watermarking previews but does not detail implementation. Evaluate whether server-side audio watermarking is practical within Vercel function constraints or if it requires a separate worker.
- **Vercel function timeouts:** Song generation takes 30s-2min per the research. Vercel Pro allows 60s timeout. Full generation likely requires async queue even on Pro tier. Confirm whether preview generation (30s) fits within Pro timeout or also needs queuing.

## Sources

### Primary (HIGH confidence)
- Framer Motion official docs -- gestures, drag constraints, spring physics
- Next.js 14 official docs -- Server Actions, next/og ImageResponse, App Router patterns
- Stripe official docs -- billing credits, one-time products, webhook patterns, Checkout Sessions
- Supabase official docs -- Storage signed URLs, RLS policies, RPC functions, auth middleware
- Eleven Labs API docs -- rate limits (429/503 handling), generation endpoints

### Secondary (MEDIUM confidence)
- react-share GitHub (nygardk/react-share) -- active maintenance, 20+ platforms
- react-swipeable GitHub (FormidableLabs) -- v7.0.2, touch/mouse support
- Competitor websites (SongFinch, Songlorious, Songful) -- pricing, features, delivery times
- Community implementation guides -- Tinder-style swipe in Next.js, credit-based billing patterns
- UX research -- Nielsen Norman Group swipe patterns, Baymard gifting UX, mobile UI trends 2026

### Tertiary (LOW confidence)
- Credit-based pricing model viability in music gift market -- no direct precedent, inferred from SaaS trends
- AI music quality benchmarks -- general 2026 landscape articles, not SongSwipe-specific testing
- Audio watermarking implementation -- mentioned as option but not validated for Vercel/Next.js constraints

---
*Research completed: 2026-02-08*
*Ready for roadmap: yes*
