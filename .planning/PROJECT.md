# SongSwipe

## What This Is

An AI-powered personalized song gift platform where users create custom songs for occasions (Valentine's, birthdays, anniversaries, etc.) using a swipe-based interface. Users swipe through style options Tinder-style, preview AI-generated song snippets, and unlock their favorite with credits. Songs can be shared with recipients via branded reveal links or downloaded as MP3s.

## Core Value

The swipe mechanic must feel fun and natural - swiping through song options should be the core experience that makes SongSwipe different from competitors like SongFinch. If the swipe doesn't feel good, the product doesn't work.

## Requirements

### Validated

- ✓ Supabase auth (email/password + Google OAuth) - existing
- ✓ Stripe payment integration - existing
- ✓ Eleven Labs music generation API - existing
- ✓ Database schema (users, customizations, orders, songs) - existing
- ✓ Landing page with hero, features, pricing - existing
- ✓ Basic customization form (3-step wizard) - existing
- ✓ Stripe webhook handler for order processing - existing
- ✓ Row Level Security policies - existing

### Active

- [ ] Swipe-based song builder (Tinder-style cards for occasion, mood, genre, voice style selection)
- [ ] Text input sections for personalization (recipient name, memories, special details)
- [ ] Credit-based monetization (freemium entry + purchasable credit packs)
- [ ] AI preview generation (short snippet previews users swipe through to pick favorite)
- [ ] Preview audio protection (prevent downloading previews via devtools/console)
- [ ] Full song unlock with credits
- [ ] User dashboard (view previous songs, order history, play/download)
- [ ] Stream + download delivery for unlocked songs
- [ ] Shareable song link (unique URL where recipient can listen)
- [ ] Branded gift reveal experience (recipient unwraps their song on a themed page)
- [ ] Song library/history for logged-in users

### Out of Scope

- Physical products (vinyl, USB, cards) - not aligned with digital-first approach
- Mobile app (iOS/Android) - web-first, validate concept before native
- Real-time collaboration - unnecessary complexity for gift-giving flow
- Social media integration/posting - potential v2 upsell, not v1
- Video generation - high cost, defer to extras/upsells later
- Subscription model - credit packs are the monetization model

## Context

- Existing codebase has basic flow: landing -> auth -> customize form -> Stripe checkout -> webhook -> Eleven Labs generation -> download
- Competitors (SongFinch, Songlorious) charge significantly more and use flat pricing. SongSwipe's credit-based model is a differentiation bet that needs validation
- The "swipe" in the brand name is a promise - the UX must deliver on it. Tinder-style cards work for discrete choices (genre, mood) but text fields still needed for personalization
- Web swipe works on mobile browsers via touch events; desktop uses keyboard arrows or draggable cards
- Preview audio must be protected - short clips, watermarked, or server-streamed to prevent free downloads
- Freemium credits could be a promotional tool (e.g., free credits for Valentine's Day)
- Codebase mapped in `.planning/codebase/` - key concerns include fire-and-forget song generation, type safety issues, no test coverage

## Constraints

- **Tech stack**: Next.js 14 + Supabase + Stripe + Eleven Labs (already established, don't migrate)
- **Deployment**: Vercel (existing setup with vercel.json)
- **Audio protection**: Preview snippets must not be downloadable from browser devtools
- **Web-first**: Must work well on both mobile browsers and desktop (touch + keyboard swipe)
- **Credit system**: Must replace existing flat £7.99 pricing with credit packs via Stripe

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Credit-based monetization over flat pricing | Encourages engagement loop (more swipes = more credits needed), differentiates from competitors | - Pending |
| Tinder-style swipe for discrete choices | Plays on brand name, natural for binary/selection choices (genre, mood, occasion) | - Pending |
| Traditional form for text personalization | Swipe doesn't work for free-text input (names, memories) | - Pending |
| Web-first over native app | Faster to validate, no app store approval, still supports touch swipe | - Pending |
| Freemium credit entry | Lowers barrier, lets users try before buying | - Pending |
| Protected preview audio | Prevents users from getting free songs by downloading snippets from devtools | - Pending |

---
*Last updated: 2026-02-08 after initialization*
