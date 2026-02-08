# Codebase Structure

**Analysis Date:** 2026-02-08

## Directory Layout

```
songswipe-app/
├── src/
│   ├── app/                         # Next.js App Router pages and API routes
│   │   ├── layout.tsx               # Root layout (Header, metadata)
│   │   ├── page.tsx                 # Root route (redirects to landing)
│   │   ├── globals.css              # Global Tailwind/CSS
│   │   ├── landing/
│   │   │   └── page.tsx             # Landing page (hero, features, pricing)
│   │   ├── customize/
│   │   │   └── page.tsx             # 3-step song customization wizard
│   │   ├── dashboard/
│   │   │   └── page.tsx             # User dashboard (orders, songs, downloads)
│   │   ├── order/
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Order detail page (not fully implemented)
│   │   ├── blog/
│   │   │   └── page.tsx             # Blog listing (stub)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── page.tsx         # Login/signup form
│   │   │   │   ├── actions.ts       # Server action for email/password auth
│   │   │   │   └── google/
│   │   │   │       └── route.ts     # Google OAuth initiator
│   │   │   ├── callback/
│   │   │   │   └── route.ts         # OAuth callback handler
│   │   │   ├── signout/
│   │   │   │   └── route.ts         # Logout handler
│   │   │   └── debug/
│   │   │       └── route.ts         # Debug endpoint (unused)
│   │   └── api/
│   │       ├── customize/
│   │       │   └── route.ts         # POST /api/customize - create customization & checkout
│   │       ├── webhook/
│   │       │   └── route.ts         # POST /api/webhook - Stripe webhook handler
│   │       └── orders/
│   │           ├── route.ts         # GET /api/orders - fetch user orders (stub)
│   │           └── [id]/
│   │               └── route.ts     # GET/POST /api/orders/[id] (stubs)
│   ├── components/
│   │   ├── Header.tsx               # Navigation header
│   │   └── SwipeInterface.tsx       # Unused component
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client factory (browser + server)
│   │   ├── stripe.ts                # Stripe client & helpers (checkout, webhooks)
│   │   └── elevenlabs.ts            # ElevenLabs API client & schema (music generation)
│   └── types/
│       └── database.ts              # TypeScript types for Supabase tables
├── public/                          # Static assets
├── .env.example                     # Environment variable template
├── package.json                     # Dependencies (Next.js, React, Stripe, Supabase, Zod, Tailwind)
├── tsconfig.json                    # TypeScript config (@ path alias to src/)
├── next.config.js                   # Next.js config (image domains, env vars)
├── tailwind.config.js               # Tailwind CSS config
├── postcss.config.mjs               # PostCSS config (Tailwind)
├── vercel.json                      # Vercel deployment config
├── supabase-schema.sql              # Database schema (users, customizations, orders, songs)
├── supabase-rls-fix.sql             # Row-level security fixes
├── create-promotion-code.js         # Utility script for Stripe promo codes (unused)
└── create-coupon.js                 # Utility script for Stripe coupons (unused)
```

## Directory Purposes

**`src/app`:**
- Purpose: Next.js App Router entry point for all routes (pages and API)
- Contains: Page components (TSX files), API route handlers (route.ts)
- Organized by route path (e.g., `auth/login/page.tsx` -> `/auth/login`)

**`src/app/auth`:**
- Purpose: Authentication flows (login, signup, OAuth, logout)
- Contains: Login form, Google OAuth handler, callback processor, signout
- Handles: Email/password, Google OAuth, Supabase session management

**`src/app/api`:**
- Purpose: REST API endpoints for client requests and webhooks
- Contains: HTTP route handlers (POST, GET) that return JSON
- Follows: Next.js App Router API route convention (route.ts files)

**`src/components`:**
- Purpose: Reusable React components
- Contains: Header component (navigation), unused SwipeInterface
- Key files: `Header.tsx` (conditional nav based on pathname)

**`src/lib`:**
- Purpose: Business logic, SDK clients, helper functions
- Contains: Supabase client setup, Stripe integration, ElevenLabs integration
- Key files:
  - `supabase.ts`: Dual-client pattern (browser anon key + server service role key)
  - `stripe.ts`: Stripe client initialization and checkout session creation
  - `elevenlabs.ts`: Music generation API calls, Zod schema, prompt building

**`src/types`:**
- Purpose: Shared TypeScript type definitions
- Contains: Supabase database schema as TypeScript interfaces
- Key files: `database.ts` (Row, Insert, Update types for each table)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Root route (imports landing page)
- `src/app/layout.tsx`: Root layout (HTML structure, Header component, metadata)
- `src/app/landing/page.tsx`: Public landing page (hero, features, pricing)

**Configuration:**
- `tsconfig.json`: TypeScript config with @ alias pointing to src/
- `next.config.js`: Next.js env var exposure, image domains
- `tailwind.config.js`: Tailwind CSS customization
- `.env.example`: Template for environment variables

**Core Logic:**
- `src/lib/supabase.ts`: Database client setup and initialization
- `src/lib/stripe.ts`: Payment processing setup and helpers
- `src/lib/elevenlabs.ts`: AI music generation API and form schema

**API Endpoints:**
- `src/app/api/customize/route.ts`: Create customization and Stripe session
- `src/app/api/webhook/route.ts`: Stripe webhook handler, song generation trigger
- `src/app/api/orders/route.ts`: Fetch user orders (stub, returns empty)

**Authentication:**
- `src/app/auth/login/page.tsx`: Login/signup form UI
- `src/app/auth/login/actions.ts`: Email/password auth server action
- `src/app/auth/login/google/route.ts`: Google OAuth initiator
- `src/app/auth/callback/route.ts`: OAuth callback processor

**Protected Pages:**
- `src/app/customize/page.tsx`: Multi-step song customization form (requires auth)
- `src/app/dashboard/page.tsx`: User orders and songs display (requires auth)

**Database Schema:**
- `supabase-schema.sql`: PostgreSQL schema definition (tables: users, customizations, orders, songs)
- `src/types/database.ts`: TypeScript types mirroring schema

## Naming Conventions

**Files:**
- Page components: `page.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Server actions: `actions.ts` (function files in route folder)
- Components: PascalCase (e.g., `Header.tsx`, `SwipeInterface.tsx`)
- Utilities: camelCase (e.g., `supabase.ts`, `elevenlabs.ts`)

**Directories:**
- App routes: kebab-case (e.g., `/auth`, `/customize`, `/dashboard`)
- Dynamic segments: square brackets (e.g., `[id]`, `[slug]`)
- Public files: lowercase (e.g., `/public/images`)

**Functions:**
- Server actions: camelCase verbs (e.g., `generateAndStoreSong()`)
- Helper functions: camelCase (e.g., `buildPrompt()`, `createCheckoutSession()`)
- React components: PascalCase exported functions (e.g., `export default function CustomizePage()`)

**Variables:**
- Constants: UPPER_SNAKE_CASE (e.g., `occasions`, `moods` arrays in customize page)
- Form data: camelCase with descriptive names (e.g., `formData`, `customization`)

## Where to Add New Code

**New Feature (Song customization enhancements):**
- Primary code: `src/lib/elevenlabs.ts` (add prompt logic) and `src/app/api/customize/route.ts` (API)
- Tests: Create `__tests__/lib/elevenlabs.test.ts` (not currently set up)

**New Page (e.g., /about):**
- Implementation: `src/app/about/page.tsx` (new TSX file)
- Add to Header navigation: `src/components/Header.tsx` (add Link)

**New API Endpoint (e.g., GET /api/user/profile):**
- Implementation: `src/app/api/user/profile/route.ts` (following App Router pattern)
- Export async function: `export async function GET(request: NextRequest)`
- Use server-side Supabase client from `src/lib/supabase.ts`

**Reusable Component (e.g., SongCard):**
- Implementation: `src/components/SongCard.tsx` (PascalCase file)
- Export as `export default function SongCard(props)`
- Use in pages like `src/app/dashboard/page.tsx`

**Utility Function (e.g., formatDuration):**
- Implementation: `src/lib/formatting.ts` (new utilities file)
- Export functions: `export function formatDuration(ms: number): string`
- Import in components/pages as needed

**Environment Configuration:**
- Add to `.env.example` as template
- Reference in code as `process.env.VARIABLE_NAME`
- Public vars: prefix with `NEXT_PUBLIC_` (exposed to browser)
- Private vars: no prefix (server-side only)

## Special Directories

**`.next`:**
- Purpose: Next.js build output directory
- Generated: Yes (created by `npm run build`)
- Committed: No (in .gitignore)

**`node_modules`:**
- Purpose: npm dependencies
- Generated: Yes (`npm install`)
- Committed: No (in .gitignore)

**`public`:**
- Purpose: Static assets (images, fonts, icons)
- Generated: No (hand-created)
- Committed: Yes (checked into git)

**`.planning`:**
- Purpose: GSD planning documents and analysis
- Generated: Yes (created by gsd:map-codebase)
- Committed: Yes (checked into git for team reference)

---

*Structure analysis: 2026-02-08*
