# Roadmap: SongSwipe

## Overview

SongSwipe delivers an AI-powered song gift platform where the swipe mechanic is the core differentiator. The roadmap builds from infrastructure up through the complete creation-to-delivery pipeline: foundation and job queue, payment integration, the swipe builder, AI generation with protected previews, song delivery, monetization upsells, branded gift sharing, user dashboard, and finally retention via occasion reminders. Each phase delivers a coherent, testable capability that unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Infrastructure** - Database schema, RLS policies, async job queue, and generation status tracking (completed 2026-02-08)
- [x] **Phase 2: Base Payment & Pricing** - Stripe package checkout, pricing page, webhook processing, and order recording (completed 2026-02-08)
- [ ] **Phase 3: Swipe Builder** - Tinder-style swipe cards for occasion, mood, genre, voice selection with text personalization
- [ ] **Phase 4: Audio Generation & Preview** - Eleven Labs integration, 3-variant generation, protected preview playback, variant swiping
- [ ] **Phase 5: Song Delivery** - Stream and download for selected songs with dedicated song pages
- [ ] **Phase 6: Upsells & Monetization** - +1 variant upsell after swiping 3, post-completion bundle offers, bundle tracking
- [ ] **Phase 7: Sharing & Gift Reveal** - Shareable URLs, branded reveal animation, OG images, social share buttons
- [ ] **Phase 8: User Dashboard** - Song library, replay, re-download, order history, occasion date tracking
- [ ] **Phase 9: Retention & Marketing** - Occasion date storage, annual email reminders, opt-out controls

## Phase Details

### Phase 1: Foundation & Infrastructure
**Goal**: The system has a reliable backend capable of processing async AI generation jobs with retry logic, proper data isolation, and generation status tracking
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. Song generation jobs are processed asynchronously with automatic retry on failure (up to 3-5 attempts with exponential backoff)
  2. Database schema supports song variants, generation status per song, share tokens, and occasion dates
  3. Row-level security prevents users from accessing other users' data while allowing public share access via UUID tokens
  4. Failed generation jobs land in a dead-letter queue visible for monitoring
  5. Each song's generation status (pending/generating/complete/failed) is queryable and accurate
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md -- Database schema migration (song_variants, failed_jobs, occasion_date, ENUM, RLS policies, TypeScript types)
- [x] 01-02-PLAN.md -- Inngest job queue setup, generate-song function with step functions and DLQ, webhook refactor

### Phase 2: Base Payment & Pricing
**Goal**: Users can purchase a song package through a clear pricing page and Stripe Checkout, with the order recorded in the system
**Depends on**: Phase 1
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-07
**Success Criteria** (what must be TRUE):
  1. User can view a pricing page that clearly explains what the song package includes (3 variants to swipe between, pick favorite)
  2. User can complete a Stripe Checkout purchase for the base song package
  3. After successful payment, an order record is automatically created via webhook processing
  4. All purchases are recorded with date, amount, and order type for later display
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md -- Stripe helper update, checkout Server Action, order_type migration, webhook + types update
- [x] 02-02-PLAN.md -- Pricing page UI, checkout success page, header navigation update

### Phase 3: Swipe Builder
**Goal**: Users can build their custom song by swiping through occasion, mood, genre, and voice style cards, then entering personal details -- the core experience that makes SongSwipe feel different
**Depends on**: Phase 1
**Requirements**: SWIPE-01, SWIPE-02, SWIPE-03, SWIPE-04, SWIPE-05, SWIPE-06, SWIPE-07, SWIPE-08, SWIPE-09
**Success Criteria** (what must be TRUE):
  1. User can swipe (drag/flick) through cards for occasion, mood, genre, and voice style selection on both mobile (touch) and desktop (keyboard arrows/mouse drag)
  2. User fills a text form with recipient name, memories, and special details after completing swipe selections
  3. First-time users see visual hints guiding them on how to swipe, and accidental swipes are prevented by requiring 40%+ card width movement
  4. User can undo their last swipe action
  5. Completed swipe selections and text input are submitted as a song creation request
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Audio Generation & Preview
**Goal**: After submitting their song request, users receive 3 AI-generated song variants and can swipe between protected previews to pick their favorite
**Depends on**: Phase 1, Phase 3
**Requirements**: GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06
**Success Criteria** (what must be TRUE):
  1. System generates 3 song variants via Eleven Labs API using the user's swipe selections and text input
  2. User sees a progress/status indicator while variants are being generated
  3. Preview audio is served via signed URLs with short expiry (5-15 min) and cannot be downloaded via browser devtools
  4. User swipes between the 3 generated variants to listen and pick their favorite
  5. If a generation fails, the system automatically retries via the job queue without user intervention
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Song Delivery
**Goal**: Users can stream and download their selected song, with a dedicated song page displaying all relevant details
**Depends on**: Phase 4
**Requirements**: SONG-01, SONG-02, SONG-03, SONG-04
**Success Criteria** (what must be TRUE):
  1. User can stream their selected song in-browser with a built-in audio player
  2. User can download their selected song as an MP3 file
  3. Each song has a dedicated page (/song/[id]) with player, download button, and song details
  4. Song page displays the occasion type, recipient name, and date created
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Upsells & Monetization
**Goal**: After the core purchase-create-deliver flow works, users are offered natural upsell opportunities that extend their experience without feeling forced
**Depends on**: Phase 4, Phase 5
**Requirements**: PAY-04, PAY-05, PAY-06
**Success Criteria** (what must be TRUE):
  1. After swiping through 3 variants, user is offered the option to generate a 4th variant at a reduced price
  2. After completing and sharing their song, user is offered a discounted multi-generation bundle for other occasions or recipients
  3. Bundle purchases are tracked and available for the user to redeem on future song creations
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Sharing & Gift Reveal
**Goal**: Users can share their song via a unique URL where recipients experience a branded gift reveal without needing an account
**Depends on**: Phase 5
**Requirements**: SHARE-01, SHARE-02, SHARE-03, SHARE-04, SHARE-05, SHARE-06
**Success Criteria** (what must be TRUE):
  1. Each song has a unique shareable URL (/share/[token]) using UUID v4 tokens that works without login
  2. Recipients experience a branded cinematic gift reveal animation before hearing the song, including the sender's personal message
  3. Share pages generate dynamic OG images for rich social media previews when the link is shared
  4. Social share buttons (WhatsApp, Facebook, Twitter/X, copy link) are available on the share page
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: User Dashboard
**Goal**: Logged-in users can view their complete song history, replay or re-download any song, review purchases, and see tracked occasion dates
**Depends on**: Phase 5
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. User can view all previously created songs with dates and recipient names
  2. User can replay any song and re-download it with a freshly generated signed URL
  3. User can view their order/purchase history with dates, amounts, and order types (base/upsell/bundle)
  4. User can see their tracked occasion dates and upcoming reminders
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

### Phase 9: Retention & Marketing
**Goal**: The system captures occasion dates and sends annual "continue the story" email reminders to drive repeat song creation, with user opt-out controls
**Depends on**: Phase 5
**Requirements**: RETAIN-01, RETAIN-02, RETAIN-03, RETAIN-04
**Success Criteria** (what must be TRUE):
  1. System stores the occasion date and recipient info each time a user creates a song
  2. System sends an email reminder before the anniversary of each tracked occasion
  3. Reminder email includes a "continue the story" call-to-action linking to a new song creation flow for that recipient/occasion
  4. User can opt out of reminder emails per individual occasion or globally
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9
Note: Phases 2 and 3 both depend only on Phase 1 and could execute in parallel. Phases 7, 8, and 9 all depend on Phase 5 and could execute in parallel.

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation & Infrastructure | 2/2 | ✓ Complete | 2026-02-08 |
| 2. Base Payment & Pricing | 2/2 | ✓ Complete | 2026-02-08 |
| 3. Swipe Builder | 0/TBD | Not started | - |
| 4. Audio Generation & Preview | 0/TBD | Not started | - |
| 5. Song Delivery | 0/TBD | Not started | - |
| 6. Upsells & Monetization | 0/TBD | Not started | - |
| 7. Sharing & Gift Reveal | 0/TBD | Not started | - |
| 8. User Dashboard | 0/TBD | Not started | - |
| 9. Retention & Marketing | 0/TBD | Not started | - |
