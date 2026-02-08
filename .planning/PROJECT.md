# SongSwipe

## What This Is

An AI-powered personalized song gift platform where users create custom songs for occasions (Valentine's, birthdays, anniversaries, etc.) using a swipe-based interface. Users build their song by swiping through style options Tinder-style, then receive 3 AI-generated variants to swipe between and pick their favorite. Songs can be shared with recipients via branded gift reveal links or downloaded as MP3s. Monetized via fixed-price packages with upsells (+1 variant, multi-gen bundles) and annual retention via occasion date tracking.

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
- [ ] Fixed-price package monetization (pay once, get 3 song variants to swipe between)
- [ ] +1 variant upsell (after swiping 3, offer a 4th generation at reduced price)
- [ ] Post-completion bundle upsell (discounted multi-generation pack for other people/occasions)
- [ ] AI preview generation (3 song variants users swipe through to pick favorite)
- [ ] Preview audio protection (prevent downloading previews via devtools/console)
- [ ] User dashboard (view previous songs, order history, play/download, occasion tracker)
- [ ] Stream + download delivery for selected songs
- [ ] Shareable song link (unique URL where recipient can listen)
- [ ] Branded gift reveal experience (recipient unwraps their song on a themed page)
- [ ] Annual occasion reminders ("continue the story" email marketing)
- [ ] Song library/history for logged-in users

### Out of Scope

- Physical products (vinyl, USB, cards) - not aligned with digital-first approach
- Mobile app (iOS/Android) - web-first, validate concept before native
- Real-time collaboration - unnecessary complexity for gift-giving flow
- Social media integration/posting - potential v2 upsell, not v1
- Video generation - high cost, defer to extras/upsells later
- Subscription model - package pricing is the monetization model
- Credit-based pricing - replaced by fixed package pricing after competitive analysis

## Context

- Existing codebase has basic flow: landing -> auth -> customize form -> Stripe checkout -> webhook -> Eleven Labs generation -> download
- Competitors (SongFinch $199+, Songlorious $45-$195, Songful $49+) all use flat pricing with human artists (1-7 day delivery). SongSwipe undercuts on price with AI instant generation while keeping premium feel via package pricing
- The "swipe" serves two purposes: (1) building the song (occasion/mood/genre/voice swipe cards) and (2) choosing from 3 AI-generated variants
- Web swipe works on mobile browsers via touch events; desktop uses keyboard arrows or draggable cards
- Preview audio must be protected - signed URLs with short expiry to prevent free downloads
- Monetization funnel: base package -> +1 variant upsell -> post-completion bundle -> annual retention emails
- Ad-driven social acquisition is the primary growth strategy
- Codebase mapped in `.planning/codebase/` - key concerns include fire-and-forget song generation, type safety issues, no test coverage

## Constraints

- **Tech stack**: Next.js 14 + Supabase + Stripe + Eleven Labs (already established, don't migrate)
- **Deployment**: Vercel (existing setup with vercel.json)
- **Audio protection**: Preview snippets must not be downloadable from browser devtools
- **Web-first**: Must work well on both mobile browsers and desktop (touch + keyboard swipe)
- **Package pricing**: Must replace existing flat £7.99 pricing with fixed-price song packages via Stripe

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fixed package pricing over credits | Credits felt too cheap/commodity; package pricing preserves premium feel while undercutting competitors | - Pending |
| 3 variants per package with swipe selection | Keeps swipe mechanic central, controls API costs (always 3 generations), gives user meaningful choice | - Pending |
| +1 variant upsell after initial 3 | Immediate revenue opportunity without feeling forced; user is already engaged | - Pending |
| Post-completion bundle for other occasions | Captures lifetime value after positive experience; heavily discounted to drive repeat usage | - Pending |
| Annual occasion date tracking + email reminders | "Continue the story" retention loop; reminder before anniversary with CTA to generate new version | - Pending |
| Tinder-style swipe for discrete choices | Plays on brand name, natural for binary/selection choices (genre, mood, occasion) | - Pending |
| Traditional form for text personalization | Swipe doesn't work for free-text input (names, memories) | - Pending |
| Web-first over native app | Faster to validate, no app store approval, still supports touch swipe | - Pending |
| Protected preview audio | Prevents users from getting free songs by downloading snippets from devtools | - Pending |
| Ad-driven social acquisition | Primary growth strategy; blast across socials; competitors not doing this effectively | - Pending |

---
*Last updated: 2026-02-08 after requirements definition (pricing model pivoted from credits to fixed packages)*
