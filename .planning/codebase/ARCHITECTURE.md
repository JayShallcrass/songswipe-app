# Architecture

**Analysis Date:** 2026-02-08

## Pattern Overview

**Overall:** Next.js 14 full-stack monolith with client-server separation

**Key Characteristics:**
- Server-side rendering (SSR) for protected routes via middleware
- Client-side React components for interactive UI (customize flow is fully client-side)
- API-driven backend (REST routes in `src/app/api/`)
- Stripe checkout integration with webhook-based async song generation
- External AI generation (ElevenLabs) triggered after payment completion

## Layers

**Presentation Layer:**
- Purpose: Render UI components for users (pages, forms, authentication)
- Location: `src/app/*/page.tsx`, `src/components/`
- Contains: Server components (pages with data fetching), client components (`use client` marked)
- Depends on: Client-side Supabase SDK, routing via Next.js
- Used by: Browser requests directly

**Business Logic / Services:**
- Purpose: Encapsulate reusable logic for authentication, payment, AI generation, validation
- Location: `src/lib/` (supabase.ts, stripe.ts, elevenlabs.ts)
- Contains: Helper functions, schema validation (Zod), SDK clients, prompt building
- Depends on: External SDKs (Supabase, Stripe, Fetch API)
- Used by: API routes and client pages

**API Layer:**
- Purpose: Handle HTTP requests, coordinate between frontend and databases/external services
- Location: `src/app/api/` (following Next.js App Router convention)
- Contains: Route handlers using `NextRequest`/`NextResponse`, webhook processors
- Depends on: Service layer (lib/), server-side Supabase client
- Used by: Client-side fetch requests, Stripe webhooks

**Data/Database Layer:**
- Purpose: Define schema and types for Supabase PostgreSQL
- Location: `src/types/database.ts` (TypeScript-only type definitions)
- Contains: TypeScript interfaces for users, customizations, orders, songs
- Depends on: Supabase schema (external)
- Used by: All layers for type safety

**Authentication Layer:**
- Purpose: Manage user sessions, OAuth flow, and auth state
- Location: `src/app/auth/` (login page, callback route, actions)
- Contains: Supabase auth client setup, form handling, OAuth redirect processing
- Depends on: Supabase Auth service
- Used by: Protected routes check user session before rendering

## Data Flow

**Song Creation Flow:**

1. User lands on landing page (`src/app/landing/page.tsx`)
2. User clicks "Create a Song" -> redirects to login if not authenticated
3. User completes 3-step customize form (`src/app/customize/page.tsx`, client-side state)
4. Form submission calls `POST /api/customize` with customization data
5. API route (`src/app/api/customize/route.ts`):
   - Validates input with Zod schema
   - Checks user authentication via server-side Supabase client
   - Saves customization record to `customizations` table
   - Creates Stripe checkout session via `createCheckoutSession()` helper
   - Returns checkout URL to client
6. Client redirects to Stripe Checkout page
7. User completes payment on Stripe
8. Stripe sends `checkout.session.completed` webhook to `POST /api/webhook`
9. Webhook handler (`src/app/api/webhook/route.ts`):
   - Verifies Stripe signature
   - Creates order record in `orders` table with status `paid`
   - Calls async function `generateAndStoreSong()` (fire-and-forget)
10. Song generation (async, no blocking):
   - Fetches customization record
   - Calls ElevenLabs API via `generateSong()` to create MP3
   - Uploads audio to Supabase Storage bucket `songs/`
   - Generates signed URL for download (15-minute expiry)
   - Creates song record in `songs` table
   - Updates order status to `completed`
   - On error: updates order status to `failed`
11. User can view order status and download song from dashboard (`src/app/dashboard/page.tsx`)

**Authentication Flow:**

1. User visits login page (`src/app/auth/login/page.tsx`)
2. Option A - Email/Password: POST form data to `/auth/login/actions`
   - `actions.ts` processes signup or signin request
   - On success, redirects to `/dashboard`
   - On error, redirects back to login with error message
3. Option B - Google OAuth: POST to `/auth/login/google`
   - Initiates OAuth flow with Supabase
4. Supabase redirects user back to `/auth/callback?code=...`
   - Callback route (`src/app/auth/callback/route.ts`) exchanges code for session
   - Sets auth cookies via Supabase SSR client
   - Redirects to dashboard or next parameter
5. All protected routes check for user session before rendering
   - Server components use `createServerClient()` and check `auth.getUser()`
   - Client components use browser client from `supabase.ts`

**State Management:**

- Authentication: Supabase Auth session (cookies stored by SSR client)
- Customize form state: React local state (`useState`) in client component
- Order/song data: PostgreSQL database with denormalized relationships (order references customization, song references order)
- Real-time updates: None currently (polling would be needed for order status updates)

## Key Abstractions

**Supabase Client Factory:**
- Purpose: Provide dual-client pattern for client-side and server-side database access
- Examples: `src/lib/supabase.ts`
- Pattern: Lazy initialization of client (only when needed), separate anon vs. service role keys

**Stripe Checkout Helper:**
- Purpose: Encapsulate Stripe session creation logic with consistent metadata
- Examples: `src/lib/stripe.ts` exports `createCheckoutSession()`, `verifyWebhookSignature()`
- Pattern: Functions accept configuration object, return Stripe objects

**ElevenLabs Integration:**
- Purpose: Encapsulate AI music generation and prompt building
- Examples: `src/lib/elevenlabs.ts` exports `generateSong()`, `buildPrompt()`, schema validation
- Pattern: Accept customization object (Zod-validated), return audio buffer, occasion-specific questions are metadata

**Zod Schema Validation:**
- Purpose: Type-safe runtime validation of customization form input
- Examples: `customizationSchema` in `src/lib/elevenlabs.ts`
- Pattern: Single schema definition reused in client form validation and API request validation

## Entry Points

**Web Application:**
- Location: `src/app/page.tsx` (root route redirects to landing page)
- Triggers: User visits domain
- Responsibilities: Route to landing page, define root layout (Header, metadata)

**Landing Page:**
- Location: `src/app/landing/page.tsx`
- Triggers: User visits `/` or root domain
- Responsibilities: Display hero, features, pricing, call-to-action; no data fetching

**Authentication:**
- Location: `src/app/auth/login/page.tsx`
- Triggers: User clicks "Create a Song" or visits `/auth/login`
- Responsibilities: Render login/signup form, handle form submission via server action, display auth status

**Customize Wizard:**
- Location: `src/app/customize/page.tsx`
- Triggers: User is authenticated and visits `/customize`
- Responsibilities: Multi-step form with client-side state, trigger API call on submit, redirect to Stripe

**Dashboard:**
- Location: `src/app/dashboard/page.tsx`
- Triggers: User is authenticated and visits `/dashboard`
- Responsibilities: Fetch user orders and songs, display list with status, audio playback

**API Endpoints:**
- `POST /api/customize`: Accept customization, create DB record, return Stripe checkout URL
- `POST /api/webhook`: Stripe webhook receiver, create order, trigger song generation
- `GET /api/orders`: Fetch user orders (currently returns empty, needs completion)
- `GET/POST /api/orders/[id]`: Order detail endpoints (stubs, not fully implemented)

## Error Handling

**Strategy:** Try-catch at API layer with console logging; client-side form validation with Zod

**Patterns:**
- API routes return `NextResponse.json({ error: string }, { status: number })`
- Client forms show inline validation errors via Zod schema parsing
- Auth errors redirect user back to login with error message in query string
- Song generation failures update order status to `failed` (allows retry)
- Webhook failures log to console but return 200 (Stripe retries later)

## Cross-Cutting Concerns

**Logging:**
- Console.error() for warnings and errors (no structured logging library)
- Webhook errors, auth failures, database errors logged but not aggregated

**Validation:**
- Form input: Zod schema `customizationSchema` validated client-side and in API
- Database records: Types defined in `src/types/database.ts` (TypeScript only, no runtime DB validation)
- Stripe signature: Verified via `stripe.webhooks.constructEvent()` in webhook handler

**Authentication:**
- Supabase Auth session checked on every protected page
- Server-side Supabase client uses service role key for privileged operations (e.g., accessing database as admin)
- Client-side Supabase client uses public anon key (safe to expose)
- OAuth redirect flow uses Supabase's built-in callback handling

---

*Architecture analysis: 2026-02-08*
