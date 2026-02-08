# Architecture Research

**Domain:** AI-powered personalized song gift platform with swipe UI
**Researched:** 2026-02-08
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Swipe   │  │ Credit  │  │ Gift    │  │ User    │        │
│  │ Builder │  │ System  │  │ Reveal  │  │ Library │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                   Server Actions Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Form handlers, Credit mutations, Audio generation   │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Integration Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Supabase │  │  Stripe  │  │  Eleven  │  │ Storage  │    │
│  │   Auth   │  │  Billing │  │   Labs   │  │  (CDN)   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Swipe Builder** | Card-based UI for song customization (occasion, mood, genre, voice) | React component with react-tinder-card or Framer Motion, local state for swipe decisions |
| **Credit System** | Display balance, handle credit purchases, track consumption | Server Actions to query/mutate credits, Stripe Products for packs, Meters for usage tracking |
| **Audio Protection** | Serve preview snippets without allowing downloads | Supabase signed URLs with short expiry (5-15 min), watermarked or truncated previews |
| **Gift Reveal** | Branded unwrap experience for recipients | Public page with share_token lookup, RLS policy for shared songs, OG image generation |
| **User Library** | Dashboard for viewing/playing past songs | Authenticated page querying user's unlocked songs, download links via signed URLs |
| **Server Actions** | Handle mutations (credit purchase, song unlock, preview generation) | Next.js Server Actions with Supabase RPC calls and Stripe API integration |

## Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/             # Auth-protected routes
│   │   ├── dashboard/      # User library/history
│   │   ├── create/         # Swipe builder flow
│   │   └── credits/        # Credit purchase page
│   ├── share/
│   │   └── [token]/        # Public gift reveal page
│   ├── api/
│   │   ├── stripe-webhook/ # Webhook handler for credit packs
│   │   └── audio/          # Audio streaming proxy (optional)
│   └── page.tsx            # Landing page
├── components/
│   ├── swipe/              # Swipe card components
│   │   ├── SwipeCard.tsx   # Individual card
│   │   ├── SwipeStack.tsx  # Card stack container
│   │   └── SwipeControls.tsx # Arrow buttons, undo
│   ├── audio/              # Audio player components
│   │   ├── ProtectedPlayer.tsx # Preview player with protections
│   │   └── SongPlayer.tsx  # Full song player
│   ├── credits/            # Credit UI components
│   │   ├── CreditBalance.tsx
│   │   └── CreditPacks.tsx
│   └── reveal/             # Gift reveal components
│       └── RevealPage.tsx
├── lib/
│   ├── actions/            # Server Actions
│   │   ├── credits.ts      # Credit mutations
│   │   ├── songs.ts        # Song unlock/generation
│   │   └── sharing.ts      # Share link generation
│   ├── supabase/           # Supabase utilities
│   │   ├── client.ts       # Client-side client
│   │   ├── server.ts       # Server-side client
│   │   └── types.ts        # Generated types
│   ├── stripe/             # Stripe utilities
│   │   ├── client.ts       # Stripe client
│   │   └── products.ts     # Credit pack definitions
│   └── audio/              # Audio utilities
│       ├── protection.ts   # Signed URL generation
│       └── watermark.ts    # Audio watermarking (optional)
└── hooks/
    ├── useSwipeState.ts    # Swipe decision tracking
    ├── useCredits.ts       # Credit balance fetching
    └── useAudioPlayer.ts   # Audio playback control
```

### Structure Rationale

- **(auth)/ route group:** Protects routes requiring authentication via middleware, keeping auth logic centralized
- **share/[token]:** Public route for recipient access without authentication, uses RLS policies for secure data access
- **components/:** Feature-based organization (swipe, audio, credits) makes component discovery intuitive
- **lib/actions/:** Server Actions grouped by domain (credits, songs, sharing) for clear separation of concerns
- **hooks/:** Custom hooks encapsulate state logic for reusability across components

## Architectural Patterns

### Pattern 1: Credit Balance as Server-Side Single Source of Truth

**What:** Credits are stored in Supabase (users.credit_balance column) and queried/mutated exclusively via Server Actions. Client never directly updates credit state.

**When to use:** Always for credit system. Prevents client-side tampering and ensures consistency across sessions.

**Trade-offs:**
- **Pros:** Security, consistency, works with RLS policies
- **Cons:** Requires server round-trip for balance updates (mitigated with optimistic UI updates)

**Example:**
```typescript
// lib/actions/credits.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function getCreditBalance() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('users')
    .select('credit_balance')
    .eq('id', user.id)
    .single()

  return data?.credit_balance ?? 0
}

export async function deductCredits(amount: number, songId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Use RPC for atomic decrement
  const { error } = await supabase.rpc('deduct_credits', {
    user_id: user.id,
    amount,
    song_id: songId
  })

  if (error) throw error
  return { success: true }
}
```

### Pattern 2: Signed URLs with Short Expiry for Audio Protection

**What:** Audio previews are served via Supabase Storage with signed URLs that expire in 5-15 minutes. Full songs use longer expiry (1-24 hours) but still time-limited.

**When to use:** For all audio serving. Prevents direct linking and devtools download.

**Trade-offs:**
- **Pros:** Native Supabase feature, CDN caching, prevents casual piracy
- **Cons:** Not foolproof (screen recording, audio capture still possible), requires URL regeneration on expiry

**Example:**
```typescript
// lib/audio/protection.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function getPreviewUrl(songId: string): Promise<string> {
  const supabase = await createClient()

  // 10 minute expiry for previews
  const { data, error } = await supabase.storage
    .from('audio-previews')
    .createSignedUrl(`${songId}.mp3`, 600)

  if (error) throw error
  return data.signedUrl
}

export async function getFullSongUrl(songId: string): Promise<string> {
  const supabase = await createClient()

  // Verify user has unlocked this song (RLS policy also enforces this)
  const { data: song } = await supabase
    .from('songs')
    .select('id')
    .eq('id', songId)
    .eq('unlocked', true)
    .single()

  if (!song) throw new Error('Song not unlocked')

  // 1 hour expiry for full songs
  const { data, error } = await supabase.storage
    .from('songs')
    .createSignedUrl(`${songId}.mp3`, 3600)

  if (error) throw error
  return data.signedUrl
}
```

### Pattern 3: Public Share Links with Token-Based Access

**What:** Gift reveal pages use a unique share_token (UUID) in the URL, not the song ID. RLS policy allows public SELECT where share_token matches, but only returns specific columns (song URL, metadata, not user data).

**When to use:** For all shareable content that needs to be public but not enumerable.

**Trade-offs:**
- **Pros:** No authentication required for recipients, URL is unguessable, RLS prevents data leakage
- **Cons:** If token leaks, anyone with link has access (acceptable for gifts)

**Example:**
```typescript
// Database schema
// songs table:
// - id (uuid, primary key)
// - user_id (uuid, foreign key to auth.users)
// - share_token (uuid, unique, indexed)
// - title, artist_name, song_url, etc.
// - unlocked (boolean)
// - created_at

// RLS policy for public sharing
CREATE POLICY "Anyone can view shared songs"
ON songs FOR SELECT
USING (
  share_token IS NOT NULL
  AND unlocked = true
);

// lib/actions/sharing.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function getSharedSong(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist_name, recipient_name, occasion, created_at')
    .eq('share_token', token)
    .single()

  if (error || !data) return null

  // Generate signed URL for audio playback (1 hour expiry)
  const audioUrl = await getFullSongUrl(data.id)

  return { ...data, audioUrl }
}
```

### Pattern 4: Swipe State Management with URL Persistence

**What:** Multi-step swipe flow persists progress in URL query parameters (useSearchParams) so users can refresh/share partial progress. Final submission uses Server Action.

**When to use:** For multi-step forms where each step is a discrete decision (occasion, mood, genre).

**Trade-offs:**
- **Pros:** Survives refresh, enables back button, shareable mid-flow
- **Cons:** URL gets long, sensitive data shouldn't be in URL (use session storage for personalization text)

**Example:**
```typescript
// app/create/page.tsx
'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { SwipeStack } from '@/components/swipe/SwipeStack'

export default function CreatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const step = searchParams.get('step') || 'occasion'
  const occasion = searchParams.get('occasion')
  const mood = searchParams.get('mood')
  const genre = searchParams.get('genre')

  const handleSwipe = (choice: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(step, choice)

    // Progress to next step
    const nextStep = step === 'occasion' ? 'mood'
      : step === 'mood' ? 'genre'
      : 'voice'

    if (nextStep === 'voice') {
      params.set('step', nextStep)
      router.push(`/create?${params}`)
    } else {
      params.set('step', nextStep)
      router.push(`/create?${params}`)
    }
  }

  return <SwipeStack options={OPTIONS[step]} onSwipe={handleSwipe} />
}
```

### Pattern 5: Stripe Credit Packs as One-Time Products

**What:** Credit packs are Stripe Products with one-time Prices, not subscriptions. Webhook handler increments user.credit_balance on successful payment.

**When to use:** For consumable credit system (not recurring billing).

**Trade-offs:**
- **Pros:** Simple, no subscription management complexity
- **Cons:** No automatic renewal (acceptable for credits)

**Example:**
```typescript
// lib/stripe/products.ts
export const CREDIT_PACKS = [
  {
    name: 'Starter Pack',
    credits: 3,
    price: 999, // £9.99 in pence
    stripePriceId: 'price_starter_pack',
  },
  {
    name: 'Popular Pack',
    credits: 10,
    price: 2999, // £29.99 (10% discount)
    stripePriceId: 'price_popular_pack',
  },
  {
    name: 'Power Pack',
    credits: 25,
    price: 6999, // £69.99 (20% discount)
    stripePriceId: 'price_power_pack',
  },
]

// app/api/stripe-webhook/route.ts
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, credits } = session.metadata

    const supabase = await createClient()
    await supabase.rpc('add_credits', {
      user_id: userId,
      amount: parseInt(credits)
    })
  }

  return new Response('OK')
}
```

## Data Flow

### Request Flow: Swipe to Song Unlock

```
[User swipes through cards]
    ↓
[Client state tracks: occasion, mood, genre, voice]
    ↓
[User enters personalization text (name, memories)]
    ↓
[Submit form → Server Action: createSongPreview]
    ↓
[Server Action queries credit balance]
    ↓ (if insufficient credits)
[Redirect to /credits page]
    ↓ (if sufficient credits)
[Call Eleven Labs API → Generate 30s preview]
    ↓
[Upload preview to Supabase Storage (audio-previews bucket)]
    ↓
[Insert record in songs table: unlocked=false, preview_url]
    ↓
[Deduct preview generation cost (e.g., 1 credit)]
    ↓
[Return song ID to client]
    ↓
[Redirect to /preview/[songId] page]
    ↓
[Server Component fetches song, generates signed URL]
    ↓
[Client plays preview in ProtectedPlayer component]
    ↓
[User clicks "Unlock Full Song"]
    ↓
[Server Action: unlockSong(songId)]
    ↓
[Verify credit balance, deduct unlock cost (e.g., 2 credits)]
    ↓
[Call Eleven Labs API → Generate full song (2-3 min)]
    ↓
[Upload full song to Supabase Storage (songs bucket)]
    ↓
[Update songs table: unlocked=true, song_url, share_token=UUID]
    ↓
[Return { songId, shareToken }]
    ↓
[Redirect to /song/[songId] with share link displayed]
```

### State Management: Credits

```
[Supabase users table: credit_balance column]
    ↓ (read via Server Action)
[Server Component fetches balance]
    ↓ (passes to Client Component as prop)
[Client displays balance in CreditBalance component]
    ↓ (user clicks "Buy Credits")
[Redirect to /credits page]
    ↓ (user selects pack)
[Server Action: createCheckoutSession(packId)]
    ↓
[Create Stripe Checkout Session with metadata: { userId, credits }]
    ↓
[Redirect to Stripe Checkout]
    ↓ (user completes payment)
[Stripe calls webhook: checkout.session.completed]
    ↓
[Webhook handler calls Supabase RPC: add_credits(userId, amount)]
    ↓
[Postgres function: UPDATE users SET credit_balance = credit_balance + amount]
    ↓
[User redirected to success page]
    ↓
[Page refetches credit balance, shows updated amount]
```

### Key Data Flows

1. **Swipe Decision Capture:** Client state (useState or URL params) tracks swipe choices, submitted to Server Action only at final step
2. **Audio Serving:** Always proxied through Server Actions that generate signed URLs, never direct Supabase Storage URLs exposed to client
3. **Credit Mutations:** All credit changes go through Supabase RPC functions (atomic operations) called by Server Actions
4. **Share Link Generation:** On song unlock, generate UUID, store in share_token column, construct public URL /share/[token]

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith Next.js app on Vercel, Supabase Free tier, direct Eleven Labs API calls from Server Actions |
| 1k-100k users | Move to Supabase Pro (connection pooling), add Redis cache for credit balances, queue Eleven Labs jobs via Inngest/Trigger.dev for async processing |
| 100k+ users | Separate audio generation into dedicated worker service, use CDN (Cloudflare/Fastly) in front of Supabase Storage, consider moving to Supabase Enterprise for dedicated resources |

### Scaling Priorities

1. **First bottleneck:** Eleven Labs API rate limits and generation time (30s-2min per song). Solution: Queue system (Inngest/BullMQ) for async job processing, show "generating..." status to user
2. **Second bottleneck:** Supabase connection limits (Free tier: 60 connections, Pro: 200). Solution: Enable connection pooling (pgBouncer), migrate to Supabase Pro, optimize Server Action queries

## Anti-Patterns

### Anti-Pattern 1: Client-Side Credit Balance Tracking

**What people do:** Store credit balance in React state (useState/zustand), decrement on unlock
**Why it's wrong:** Client state can be tampered with (user opens devtools, sets balance to 9999). Server Actions would still verify, but creates confusing UX where client shows incorrect state
**Do this instead:** Fetch credit balance from Server Action/Component, treat it as read-only on client. Use optimistic updates for UX (show pending state, revert on error)

### Anti-Pattern 2: Exposing Direct Supabase Storage URLs

**What people do:** Return permanent Supabase Storage public URLs (https://[project].supabase.co/storage/v1/object/public/songs/123.mp3) to client
**Why it's wrong:** URLs are permanent and shareable, defeating audio protection. Anyone can download via curl/wget
**Do this instead:** Always use signed URLs with expiry. For previews: 5-15 min. For full songs: 1-24 hours. Regenerate on expiry

### Anti-Pattern 3: Storing Swipe Choices in Database Mid-Flow

**What people do:** On each swipe, INSERT into database (song_customizations table) to save progress
**Why it's wrong:** Creates database bloat (100 abandoned customizations for every 1 completed song), requires cleanup job
**Do this instead:** Use URL params or sessionStorage for mid-flow state. Only INSERT to database on final submission (when preview is generated)

### Anti-Pattern 4: Sync Eleven Labs API Calls in Server Actions

**What people do:** Call Eleven Labs API directly in Server Action, wait for response (30s-2min), then return to client
**Why it's wrong:** Vercel function timeout (10s free, 60s Pro), poor UX (user waits on loading spinner), blocks concurrent requests
**Do this instead:** Queue job (Inngest/Trigger.dev), return immediately with job ID, poll for completion or use webhooks/Server-Sent Events for status updates

### Anti-Pattern 5: Using Stripe Subscriptions for Credit Packs

**What people do:** Create recurring Stripe Subscription for credit "subscriptions" (renews monthly)
**Why it's wrong:** Adds complexity (cancellation flow, proration), doesn't match mental model (credits are one-time purchase)
**Do this instead:** Use one-time Stripe Products/Prices. If recurring credits desired, create separate subscription product (e.g., "Premium Plan: 10 credits/month")

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Stripe** | Webhook-based (checkout.session.completed) | Use metadata to pass userId and credit amount, verify webhook signature, use idempotency keys for credit grants |
| **Eleven Labs** | Direct API calls (initially), queue-based (at scale) | Rate limit: 10 req/min (free), use queue (Inngest) to handle bursts, store job status in database |
| **Supabase Auth** | Server-side client via cookies (middleware) | Use middleware.ts to refresh session, createClient from @supabase/ssr package |
| **Supabase Storage** | Signed URL generation via Server Actions | Private buckets for audio (audio-previews, songs), public bucket for static assets (logos, OG images) |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Client ↔ Server Actions** | Direct function calls (RSC magic) | Server Actions serialized as POST requests, return serializable data only (no functions/classes) |
| **Server Actions ↔ Supabase** | Supabase client (server-side) | Use createClient from @supabase/ssr with cookies, respect RLS policies (actions run as authenticated user) |
| **Server Actions ↔ Stripe** | Stripe SDK (Node.js) | Initialize with API key, use webhooks for async events (payments), use Checkout Sessions for payments |
| **Webhook Handler ↔ Supabase** | Direct database mutations (RPC) | Webhook runs unauthenticated, use service role key for Supabase client to bypass RLS |

## Component Dependencies

### Build Order Recommendations

**Phase 1: Foundation (1-2 days)**
- Supabase tables: users.credit_balance, songs table with share_token
- RLS policies: authenticated users can CRUD their own songs, public can SELECT shared songs
- Stripe Products: Create credit pack products in Stripe Dashboard
- Basic Server Actions: getCreditBalance, deductCredits (using RPC functions)

**Phase 2: Swipe UI (2-3 days)**
- Swipe components: SwipeCard, SwipeStack (use react-tinder-card or Framer Motion)
- Create flow: /create page with URL param state management
- Form submission: Server Action to save swipe choices to database
- No audio generation yet (stub with mock data)

**Phase 3: Credit System (1-2 days)**
- Credit purchase page: /credits with pack selection
- Stripe integration: createCheckoutSession Server Action
- Webhook handler: api/stripe-webhook/route.ts
- Credit balance display: CreditBalance component in header

**Phase 4: Audio Generation (2-3 days)**
- Eleven Labs integration: Server Action to call API
- Preview generation: 30s clips, upload to Supabase Storage (audio-previews)
- Signed URL generation: getPreviewUrl Server Action
- Preview player: ProtectedPlayer component with HTML5 audio

**Phase 5: Full Song Unlock (1-2 days)**
- Unlock flow: unlockSong Server Action (credit check, API call, storage upload)
- Share token generation: UUID on unlock, inserted into share_token column
- Full song player: SongPlayer component with download button

**Phase 6: Gift Reveal (1-2 days)**
- Public share page: /share/[token] route
- RLS policy for public access via share_token
- Branded reveal UI: Animation/reveal effect, OG image meta tags
- Analytics: Track views (optional)

**Phase 7: User Library (1 day)**
- Dashboard: /dashboard page listing user's songs
- Song history: Table view with play/download/share actions
- Re-share: Generate new signed URLs for expired songs

### Critical Path Dependencies

1. **Supabase schema must exist before:** Any Server Actions (credit mutations depend on RPC functions)
2. **Credit system must work before:** Audio generation (need to deduct credits)
3. **Preview generation must work before:** Full unlock (user previews before deciding to unlock)
4. **Share token must exist before:** Gift reveal page (can't share without tokens)

## Sources

### Swipe UI Patterns
- [react-tinder-card npm package](https://www.npmjs.com/package/react-tinder-card) - HIGH confidence, official package docs
- [How I built a Tinder-style Card Swipe in Next.js 16](https://dev.to/asterios07/how-i-built-a-tinder-style-card-swipe-in-nextjs-16-592h) - MEDIUM confidence, recent implementation (2 weeks ago)
- [Framer Motion Swipe Actions Tutorial](https://motion.dev/tutorials/react-swipe-actions) - HIGH confidence, official Framer Motion docs
- [GitHub: rogue-kitten/swipe-cards](https://github.com/rogue-kitten/swipe-cards) - MEDIUM confidence, TypeScript + Framer Motion + Next.js example

### Credit System Architecture
- [Stripe: Set up a credit-based pricing model](https://docs.stripe.com/billing/subscriptions/usage-based/use-cases/credits-based-pricing-model) - HIGH confidence, official Stripe documentation
- [Stripe: What is a credits subscription model?](https://stripe.com/resources/more/what-is-a-credits-based-subscription-model-and-how-does-it-work) - HIGH confidence, official Stripe resource

### Audio Protection
- [Supabase: Serving assets from Storage](https://supabase.com/docs/guides/storage/serving/downloads) - HIGH confidence, official Supabase docs (signed URLs)
- [How can you prevent HTML5 audio and video from being downloaded](https://www.linkedin.com/advice/0/how-can-you-prevent-html5-audio-video-from-being-doh7c) - MEDIUM confidence, industry best practices (HLS, DRM, encryption)

### Shareable Links
- [Shareable Modals in Next.js: URL-Synced UI Made Simple](https://javascript-conference.com/blog/shareable-modals-nextjs/) - MEDIUM confidence, URL state management patterns
- [How to set up self-healing URLs in Next.js](https://mikebifulco.com/posts/self-healing-urls-nextjs-seo) - MEDIUM confidence, UUID-based URL patterns

### Supabase RLS
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - HIGH confidence, official docs
- [Supabase RLS: Complete Guide 2026](https://vibeappscanner.com/supabase-row-level-security) - MEDIUM confidence, comprehensive community guide

### State Management
- [State Management with Next.js App Router](https://www.pronextjs.dev/tutorials/state-management) - MEDIUM confidence, App Router patterns
- [Next.js Server Actions: Complete Guide with Examples for 2026](https://dev.to/marufrahmanlive/nextjs-server-actions-complete-guide-with-examples-for-2026-2do0) - MEDIUM confidence, recent guide
- [Next.js: Getting Started - Updating Data](https://nextjs.org/docs/app/getting-started/updating-data) - HIGH confidence, official Next.js docs

---
*Architecture research for: SongSwipe AI song gift platform*
*Researched: 2026-02-08*
