# Technology Stack

**Analysis Date:** 2026-02-08

## Languages

**Primary:**
- TypeScript 5.0.0 - Full codebase (frontend and API routes)

**Secondary:**
- JavaScript - Build configuration, scripts (Next.js config, Tailwind, PostCSS)
- SQL - Database schema and triggers in `supabase-schema.sql`

## Runtime

**Environment:**
- Node.js 18+ (specified in README prerequisites)

**Package Manager:**
- npm 9+
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 14.2.0 - Full-stack React framework with App Router
- React 18.3.0 - UI library
- React DOM 18.3.0 - DOM rendering

**Styling:**
- Tailwind CSS 3.4.19 - Utility-first CSS framework
- PostCSS 8.5.6 - CSS transformation
- Autoprefixer 10.4.24 - Browser prefix handling

**Validation:**
- Zod 3.22.0 - Schema validation (used in `src/lib/elevenlabs.ts` and API route `src/app/api/customize/route.ts`)

**Type System:**
- TypeScript with strict mode enabled (`tsconfig.json`)
- Node types 20.0.0
- React types 18.3.0

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.94.1 - Supabase client library (database and auth)
- @supabase/auth-helpers-nextjs 0.15.0 - Server-side auth helper for Next.js
- @supabase/ssr 0.8.0 - Server-side rendering support for Supabase auth
- @stripe/stripe-js 2.4.0 - Client-side Stripe JavaScript library
- stripe 20.3.0 - Server-side Stripe SDK (devDependency, used in `src/lib/stripe.ts`)

**Infrastructure:**
- No database ORM (direct Supabase client queries via `@supabase/supabase-js`)

## Configuration

**Environment:**
- `.env.local` required at runtime
- `.env.example` provided with template variables
- Environment variables exposed to client via `next.config.js` (marked NEXT_PUBLIC_)
- Server-side secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `ELEVEN_LABS_API_KEY`

**Build:**
- `next.config.js` - Configures image domains (`images.unsplash.com`), environment variables exposure
- `tsconfig.json` - Strict TypeScript, path alias `@/*` maps to `./src/*`
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.mjs` - PostCSS plugins for Tailwind
- `vercel.json` - Deployment configuration for Vercel

## Platform Requirements

**Development:**
- Node.js 18+
- npm or yarn
- Text editor/IDE with TypeScript support

**Production:**
- Vercel (default deployment target based on `vercel.json` and README)
- Node.js runtime for API routes
- Supabase project instance
- Stripe merchant account with API keys
- Eleven Labs account with Music API access

---

*Stack analysis: 2026-02-08*
