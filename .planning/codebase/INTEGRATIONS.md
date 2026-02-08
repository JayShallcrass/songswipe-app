# External Integrations

**Analysis Date:** 2026-02-08

## APIs & External Services

**Payment Processing:**
- Stripe - Payment processing and checkout
  - SDK/Client: `@stripe/stripe-js` (client) and `stripe` npm package (server)
  - Auth: `STRIPE_SECRET_KEY` (server-only), `STRIPE_PUBLISHABLE_KEY` (public), `STRIPE_WEBHOOK_SECRET` (server-only)
  - Usage: Payment processing at `src/lib/stripe.ts`, webhook handling at `src/app/api/webhook/route.ts`

**Music Generation:**
- Eleven Labs Music API - AI-powered song generation
  - Endpoint: `https://api.elevenlabs.io/v1/music/compose`
  - Auth: `ELEVEN_LABS_API_KEY` (server-only)
  - Usage: Song generation logic in `src/lib/elevenlabs.ts`, called via `generateSong()` function
  - Method: HTTP POST with JSON request body containing prompt, music_length_ms, force_instrumental flag

**Image CDN:**
- Unsplash - Stock image hosting
  - Domain: `images.unsplash.com` (configured in `next.config.js`)
  - Auth: None (public CDN)
  - Usage: Image optimization and caching

## Data Storage

**Databases:**
- Supabase PostgreSQL - Primary database
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client), `SUPABASE_SERVICE_ROLE_KEY` (server)
  - Client: `@supabase/supabase-js` with optional SSR support via `@supabase/ssr`
  - Tables: `users`, `customizations`, `orders`, `songs`, `downloads`
  - Auth: Supabase built-in auth (Google OAuth + email/password via `src/app/auth/`)

**File Storage:**
- Supabase Storage (private `songs` bucket)
  - Implementation: Audio files stored in `songs/` bucket with user folder structure `{userId}/{orderId}/song.mp3`
  - Access: Signed URLs with 15-minute expiry (generated in `src/app/api/webhook/route.ts`)
  - Policy: User Row Level Security - only owners can access their files

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: Email/password and Google OAuth
  - Login routes: `src/app/auth/login/page.tsx`, `src/app/auth/login/google/route.ts`
  - Auth callback: `src/app/auth/callback/route.ts`
  - Signout: `src/app/auth/signout/route.ts`
  - Server-side client: `createServerClient()` from `@supabase/ssr`
  - Row Level Security: All tables protected with auth.uid() policies

## Monitoring & Observability

**Error Tracking:**
- None detected (manual console.error() logging only)

**Logs:**
- Console logging only (`console.log()`, `console.error()` in API routes and webhooks)
- No structured logging or external service integration

## CI/CD & Deployment

**Hosting:**
- Vercel (default, based on `vercel.json` presence)
- App URL: `NEXT_PUBLIC_APP_URL` (http://localhost:3000 in dev, production URL in deploy)

**CI Pipeline:**
- Not detected

## Environment Configuration

**Required env vars:**

**Client-exposed (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `NEXT_PUBLIC_APP_URL` - App base URL for redirects
- `NEXT_PUBLIC_MARKETING_URL` - Marketing site URL (optional)

**Server-only (secret):**
- `STRIPE_SECRET_KEY` - Stripe secret key (required for payment processing)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (required for webhook verification)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (required for admin operations like song generation)
- `ELEVEN_LABS_API_KEY` - Eleven Labs Music API key (required for song generation)

**Secrets location:**
- `.env.local` (development)
- Vercel environment variables (production)
- Template: `.env.example`

## Webhooks & Callbacks

**Incoming:**
- Stripe webhook endpoint: `POST /api/webhook`
  - Signature verification: Using `stripe.webhooks.constructEvent()`
  - Events handled:
    - `checkout.session.completed` - Creates order and triggers song generation
    - `payment_intent.payment_failed` - Logs payment failure
  - Security: Signature validation required, returns 400 if missing/invalid

**Outgoing:**
- None detected

## Integration Flow

**Song Purchase & Generation Pipeline:**

1. User submits customization form (`/customize`)
2. API POST to `/api/customize` validates input and creates Supabase `customizations` record
3. Stripe checkout session created via `createCheckoutSession()` in `src/lib/stripe.ts`
4. User completes payment in Stripe
5. Stripe sends `checkout.session.completed` webhook to `/api/webhook`
6. Webhook handler:
   - Verifies signature
   - Creates `orders` record with status 'paid'
   - Calls `generateAndStoreSong()` asynchronously
7. Song generation:
   - Fetches customization from Supabase
   - Calls Eleven Labs API via `generateSong()` with prompt
   - Receives audio buffer
   - Uploads to Supabase Storage bucket
   - Creates signed URL (15-min expiry)
   - Inserts `songs` record with signed URL
   - Updates order status to 'completed'
8. User downloads song via signed URL

---

*Integration audit: 2026-02-08*
