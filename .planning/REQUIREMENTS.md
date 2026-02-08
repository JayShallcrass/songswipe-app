# Requirements: SongSwipe

**Defined:** 2026-02-08
**Core Value:** The swipe mechanic must feel fun and natural - swiping through song options should be the core experience that makes SongSwipe different from competitors.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Async job queue processes AI generation with retry logic (3-5 attempts, exponential backoff)
- [ ] **INFRA-02**: Database schema supports song variants, generation status, share tokens, and occasion dates
- [ ] **INFRA-03**: RLS policies protect user data and enable public share access via UUID tokens
- [ ] **INFRA-04**: Dead-letter queue captures failed generations for monitoring and manual intervention
- [ ] **INFRA-05**: Generation status tracking per song (pending/generating/complete/failed)

### Payments & Pricing

- [ ] **PAY-01**: User can purchase a base song package via Stripe Checkout (generates 3 variants)
- [ ] **PAY-02**: Pricing page clearly communicates what the package includes before purchase
- [ ] **PAY-03**: Stripe webhook handler processes checkout.session.completed and creates order record
- [ ] **PAY-04**: After swiping 3 variants, user can purchase +1 additional variant at reduced price
- [ ] **PAY-05**: After completing and sharing song, user is offered a discounted multi-generation bundle
- [ ] **PAY-06**: Bundle purchases are tracked and available for future song creations
- [ ] **PAY-07**: All purchases recorded with dates, amounts, and order type (base/upsell/bundle)

### Swipe UI & Song Creation

- [ ] **SWIPE-01**: User swipes through occasion cards (Tinder-style drag/flick) to select occasion type
- [ ] **SWIPE-02**: User swipes through mood/vibe cards to select song mood
- [ ] **SWIPE-03**: User swipes through genre cards (5-8 core genres) to select genre
- [ ] **SWIPE-04**: User swipes through voice style options to select vocal style
- [ ] **SWIPE-05**: User fills text form with recipient name, memories, and special details for personalization
- [ ] **SWIPE-06**: Swipe works via touch gestures on mobile and keyboard arrows / mouse drag on desktop
- [ ] **SWIPE-07**: User can undo their last swipe action
- [ ] **SWIPE-08**: Visual swipe hints guide first-time users on how to interact
- [ ] **SWIPE-09**: Swipe requires 40%+ card width movement to prevent accidental swipes

### Audio Generation & Preview

- [ ] **GEN-01**: System generates 3 song variants via Eleven Labs API based on user's swipe selections and text input
- [ ] **GEN-02**: User sees generation progress/status indicator while variants are being created
- [ ] **GEN-03**: Preview audio served via signed URLs with short expiry (5-15 min) to prevent unauthorized access
- [ ] **GEN-04**: Preview audio cannot be directly downloaded via browser devtools or console
- [ ] **GEN-05**: User swipes between 3 generated variants to pick their favorite
- [ ] **GEN-06**: Failed generations automatically retry via job queue without user intervention

### Song Delivery

- [ ] **SONG-01**: User can stream their selected song in-browser with a built-in player
- [ ] **SONG-02**: User can download their selected song as MP3
- [ ] **SONG-03**: Each song has a dedicated page (/song/[id]) with player, download, and song details
- [ ] **SONG-04**: Song page displays occasion, recipient name, and date created

### Sharing & Gift Reveal

- [ ] **SHARE-01**: Each song has a unique shareable URL (/share/[token]) using UUID v4 tokens
- [ ] **SHARE-02**: Recipient experiences a branded cinematic gift reveal animation before hearing the song
- [ ] **SHARE-03**: Gift reveal page displays the sender's personal message
- [ ] **SHARE-04**: Dynamic OG images generated per song for rich social media previews (next/og)
- [ ] **SHARE-05**: Social share buttons available (WhatsApp, Facebook, Twitter/X, copy link)
- [ ] **SHARE-06**: Share page is publicly accessible without requiring login or account

### User Dashboard

- [ ] **DASH-01**: User can view all previously created songs with dates and recipient names
- [ ] **DASH-02**: User can replay any song from the dashboard
- [ ] **DASH-03**: User can re-download any song with a fresh signed URL
- [ ] **DASH-04**: User can view order/purchase history with dates, amounts, and order types
- [ ] **DASH-05**: User can see tracked occasion dates and upcoming reminders

### Retention & Marketing

- [ ] **RETAIN-01**: System stores occasion date and recipient info for each song creation
- [ ] **RETAIN-02**: System sends email reminder before the anniversary of each tracked occasion
- [ ] **RETAIN-03**: Reminder email includes "continue the story" CTA to create a new song version
- [ ] **RETAIN-04**: User can opt out of reminder emails per occasion or globally

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Song Refinement

- **REFINE-01**: User can edit/preview lyrics before generation
- **REFINE-02**: User can remix or iterate on an existing song with new inputs

### Delivery Enhancements

- **DELIV-01**: Gift scheduling (send at a specific date/time)
- **DELIV-02**: Multiple format options (WAV, FLAC in addition to MP3)
- **DELIV-03**: Quality guarantee / free remake policy

### Growth Features

- **GROW-01**: Referral program (share a discount code after creating a song)
- **GROW-02**: Social media integration / direct posting to platforms

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Mobile native app (iOS/Android) | Web-first, validate concept before native investment |
| Real-time collaboration | Unnecessary complexity for gift-giving flow |
| Video generation | High production cost, defer to extras/upsells later |
| Subscription model | Package pricing is the monetization model |
| Credit-based pricing | Replaced by fixed packages after competitive analysis; credits felt too commodity |
| Physical products (vinyl, USB, cards) | Not aligned with digital-first approach; supply chain complexity |
| DRM for audio protection | Enterprise overkill; signed URLs with short expiry sufficient for previews |
| Multi-language support | Market validation first; English-only for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| _(populated by roadmap)_ | | |

**Coverage:**
- v1 requirements: 45 total
- Mapped to phases: 0
- Unmapped: 45

---
*Requirements defined: 2026-02-08*
*Last updated: 2026-02-08 after initial definition*
