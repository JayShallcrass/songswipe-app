# Stack Research: SongSwipe Additional Features

**Domain:** AI personalized song gift platform (swipe UI + credit monetization)
**Researched:** 2026-02-08
**Confidence:** HIGH

## Existing Stack (No Changes)

The base stack remains unchanged:
- Next.js 14 (App Router)
- React 18
- Supabase (auth + database + storage)
- Stripe (payments)
- Eleven Labs (music generation)
- Tailwind CSS
- Zod (validation)
- Vercel (hosting)

## New Libraries for Additional Features

### Gesture & Swipe Interaction

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Framer Motion | ^11.x | Drag gestures, card animations, spring physics | Industry standard for React animations with excellent drag gesture support. Provides `drag`, `dragConstraints`, `whileDrag`, and inertia animations out of the box. Optimized for performance using requestAnimationFrame. Better DX than alternatives for card swipe UIs. |
| react-swipeable | ^7.0.2 | Fallback touch swipe detection | Lightweight (no animation dependencies), provides useSwipeable hook for simple directional swipe detection. Supports both touch and mouse events. Use for basic swipe detection if Framer Motion drag feels too heavy. |

**Confidence:** HIGH (both libraries verified with official docs and active maintenance)

### Social Sharing

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-share | ^5.x | Social media share buttons (WhatsApp, Facebook, Twitter, etc.) | Actively maintained (nygardk/react-share). Supports 20+ platforms. Use for pre-built share buttons with counts. |
| next/og | Built-in (Next.js 14+) | Dynamic OG image generation for gift reveal pages | Next.js native API. Generates PNG from JSX/CSS using Satori + resvg. Average 800ms generation time. Use for personalized share previews. |

**Confidence:** HIGH (react-share is standard, next/og is official Next.js API)

### Audio Protection

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase Storage Signed URLs | Built-in | Temporary audio preview access | Already in stack. Create signed URLs with short expiration (5-15 min) to prevent link sharing. RLS policies protect URL generation. Free with existing Supabase. |
| Custom audio player | Browser native | HTML5 audio with disabled download | Build custom player using HTML5 `<audio>` with `controlsList="nodownload"` and disable right-click. Prevents casual downloading but not determined users. |

**Confidence:** MEDIUM (signed URLs are standard Supabase pattern, but audio protection is fundamentally limited on web. Real DRM like Widevine requires enterprise solutions incompatible with current stack)

### Credit System Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Stripe Billing Meters | API v1 | Track credit usage per customer | Official Stripe API for usage-based billing. Create meter to track song generations. |
| Stripe Credit Grants | API v1 | Issue credit packs to customers | Official Stripe billing credits feature. Grant credits after pack purchase. Auto-applies to metered usage. |
| Vercel Edge Config | Latest | Rate limiting & credit balance caching | Optional. Cache credit balances at edge for fast checks before expensive operations. Reduces Stripe API calls. |

**Confidence:** HIGH (Stripe billing credits are official feature with comprehensive docs. Edge Config is optional optimization)

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-spring/web | ^9.7.x | Alternative to Framer Motion for physics animations | Use if team prefers spring-based animation API. More performant for complex physics but steeper learning curve than Framer Motion. |
| react-hot-toast | ^2.x | User feedback for swipe actions | Already likely in stack. Use for "Song added!" / "Credits used" notifications. |
| zustand | ^4.x | Client-side credit balance state | If not using React Context. Lightweight state for credit count, swipe history. Syncs with Stripe on operations. |

## Installation

```bash
# Gesture & Animation
npm install framer-motion react-swipeable

# Social Sharing
npm install react-share

# State Management (optional)
npm install zustand

# Toast Notifications (if not present)
npm install react-hot-toast

# No additional install needed for:
# - next/og (built into Next.js 14)
# - Supabase signed URLs (existing SDK)
# - Stripe billing credits (existing SDK)
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Gesture handling | Framer Motion | @use-gesture/react | More complex API, requires separate animation library. Framer Motion provides gestures + animations in one. |
| Gesture handling | Framer Motion | react-tinder-card | Abandoned (last update 2 years ago). Built for React Native, awkward for web. |
| Social sharing | react-share | next-share | Abandoned (last update 2 years ago). react-share is actively maintained. |
| Social sharing | react-share | Custom share URLs | Manual Web Share API implementation works but loses share counts and pre-built icons. |
| Audio protection | Signed URLs | DRM (Widevine, FairPlay) | Enterprise cost, complex setup. Overkill for song previews. Signed URLs + basic controls sufficient for MVP. |
| Animation | Framer Motion | React Spring | Both excellent. Framer Motion wins for gestures + animation combo and better DX for card UIs. React Spring better for pure spring physics. |
| OG images | next/og (ImageResponse) | Cloudinary/external service | next/og is free, fast (800ms), and native. External services add cost and latency. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @vercel/og package | Deprecated for Next.js 14+ projects | next/og (import from 'next/og') |
| react-tinder-card | Unmaintained, React Native focused | Framer Motion with custom card stack |
| Full DRM solutions (Shaka Player, Widevine) | Enterprise complexity, doesn't prevent determined users anyway | Supabase signed URLs + basic player controls |
| Stripe Checkout for credits | Wrong pattern. Checkout is for one-time/subscription products | Stripe Billing Meters + Credit Grants for usage-based |
| Client-side credit tracking only | Security risk, users can manipulate balance | Server-side Stripe meter as source of truth |
| ZingTouch | Abandoned (last commit 2018) | react-swipeable or Framer Motion |

## Stack Patterns by Feature

**Swipe Card Stack:**
- Use Framer Motion `drag` with `dragConstraints` for swipe detection
- Track `drag` distance via `onDragEnd` to determine accept/reject
- Use `spring` transition for snap-back animation
- Layer cards with z-index, animate next card on swipe completion
- Optional: Add `whileDrag` rotation for Tinder-style tilt

**Credit Purchase Flow:**
1. User clicks "Buy 10 Credits" button
2. Create Stripe Checkout session with product for credit pack
3. On `invoice.paid` webhook, call Stripe Credit Grants API
4. Grant credits to customer's billing account
5. Return user to app with updated balance (query Credit Balance Summary API)

**Audio Preview Protection:**
1. Store audio in private Supabase bucket (RLS: no public access)
2. Server endpoint generates signed URL (5 min expiration)
3. Pass signed URL to custom HTML5 audio player
4. Disable download, right-click, inspect element via JS
5. Track preview count in meter (optional: charge credits for previews)

**Gift Reveal Sharing:**
1. Create public gift page route: `/gift/[giftId]`
2. Generate OG image using next/og ImageResponse (JSX with gift details)
3. Set metadata with `generateMetadata()` (OG image, title, description)
4. Add react-share buttons (WhatsApp, Facebook, Twitter, Copy Link)
5. Track shares in analytics (PostHog/Mixpanel)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Framer Motion ^11.x | React 18.x | Fully compatible. React 19 support in 11.x. |
| react-swipeable ^7.x | React 18.x | Works with React 19 RC. No known issues. |
| next/og (Next.js 14) | @vercel/og features | Same API. next/og wraps @vercel/og internally. |
| Stripe SDK ^14.x | Node 18+ | Next.js 14 requires Node 18+. Stripe SDK compatible. |
| react-share ^5.x | Next.js 14 | SSR compatible with 'use client' directive. |

## Performance Considerations

**Framer Motion Bundle Size:**
- ~40KB minified + gzipped
- Tree-shakeable (only import what you use)
- Use dynamic import for swipe cards route to reduce initial bundle

**OG Image Generation:**
- Average 800ms per image (Vercel Edge Function)
- Cache generated images in Supabase Storage (reuse for same gift)
- Set cache headers for social media crawlers

**Stripe API Calls:**
- Credit Balance Summary: Cache for 30s in Redis/Edge Config
- Rate limit: 100 req/sec (sufficient for MVP)
- Use webhooks for balance updates, not polling

**Audio Streaming:**
- Supabase Storage serves files via CDN (fast)
- Signed URLs add ~50ms latency (negligible)
- Use audio preloading for smooth UX (`<audio preload="metadata">`)

## Security Notes

**Audio Protection Reality:**
Browser-based audio protection is fundamentally limited. Signed URLs with short expiration + disabled download controls will stop 95% of casual sharing but determined users can always capture audio (screen recording, browser dev tools, network inspection). This is acceptable for MVP. True DRM requires enterprise solutions incompatible with current stack.

**Credit Manipulation Prevention:**
- NEVER trust client-side credit balance
- Server validates credits before expensive operations (song generation)
- Use Stripe Billing Meters as single source of truth
- Webhook delays: Handle race conditions (user clicks twice before webhook)

**Signed URL Exposure:**
- Once user has signed URL, they can share it (until expiration)
- Don't use long expiration times (max 15 min for previews)
- Consider one-time-use tokens if sharing is critical concern (requires custom middleware)

## Sources

### Gesture & Animation
- [React Swipeable on npm](https://www.npmjs.com/package/react-swipeable) - Version info, official package
- [React Swipeable GitHub](https://github.com/FormidableLabs/react-swipeable) - v7.0.2 confirmed, active maintenance
- [@use-gesture/react documentation](https://use-gesture.netlify.app/) - Feature comparison
- [Framer Motion gestures documentation](https://motion.dev/motion/gestures/) - Drag features, constraints
- [LogRocket: Best React Animation Libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) - Performance comparison
- [React Spring vs Framer Motion comparison](https://www.dhiwise.com/post/react-spring-vs-framer-motion-a-detailed-guide-to-react) - Performance benchmarks

### Social Sharing
- [react-share GitHub](https://github.com/nygardk/react-share) - Active maintenance verified
- [next-share GitHub](https://github.com/Bunlong/next-share) - Confirmed abandoned (2 years)
- [Next.js OG image documentation](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - Official API
- [Next.js ImageResponse API](https://nextjs.org/docs/app/api-reference/functions/image-response) - Implementation guide
- [Vercel: Introducing OG Image Generation](https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images) - Performance metrics

### Audio Protection
- [Supabase Storage signed URLs documentation](https://supabase.com/docs/reference/javascript/storage-from-createsignedurls) - Official API
- [Supabase Storage security guide](https://www.supadex.app/blog/best-security-practices-in-supabase-a-comprehensive-guide) - Best practices
- [TrustedAudio watermarking](https://www.trustedaudio.com/) - Enterprise DRM comparison
- [Google SynthID audio watermarking](https://deepmind.google/models/synthid/) - Advanced protection context

### Credit System
- [Stripe billing credits documentation](https://docs.stripe.com/billing/subscriptions/usage-based/billing-credits) - Official feature overview
- [Stripe credit implementation guide](https://docs.stripe.com/billing/subscriptions/usage-based/billing-credits/implementation-guide) - Setup steps, APIs
- [Stripe credit-based pricing model](https://docs.stripe.com/billing/subscriptions/usage-based/use-cases/credits-based-pricing-model) - Usage patterns
- [Moesif: Stripe prepaid credit billing](https://www.moesif.com/blog/technical/api-development/Pre-paid-Credit-Based-Billing-With-Stripe/) - Implementation example
- [Vercel Edge Config documentation](https://vercel.com/docs/edge-config/edge-config-limits) - Caching strategy

---
*Stack research for: SongSwipe swipe UI + credit monetization milestone*
*Researched: 2026-02-08*
*Confidence: HIGH for libraries (verified with official docs), MEDIUM for audio protection (inherent web limitations)*
