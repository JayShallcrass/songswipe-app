# SongSwipe Production Status

**Last updated**: 2026-02-09
**Project**: SongSwipe - AI personalised song gift platform
**Repo**: https://github.com/JayShallcrass/songswipe-app (PUBLIC)
**Supabase project**: `xnhstgdgwonqjolmjvps`
**Vercel project**: `prj_6whE7EsvmmOiOBp865PO93cO8no2` (team: `team_zCmsgnxiA1zdfDicfpJ7Z46l`)
**Vercel domains**: songswipe.io, songswipe-app-storylinr.vercel.app

## What's Done

- All 9 development phases COMPLETE (built with GSD workflow)
- Mobile responsive pass across all pages (12 files)
- Vercel build passing (latest deploy `dpl_2GHViUetF3rxuqmGfWozRbgqxv2D` is READY)
- Suspense boundary fix for `/checkout/success` pushed
- Google OAuth callback fixes from earlier sessions
- Stripe lazy-init fix from earlier sessions
- Combined migration SQL file created at `supabase-full-migration.sql`

## Supabase Database Status

### Already applied (Part 1 - base schema)
- 5 tables: `users`, `customizations`, `orders`, `songs`, `downloads`
- RLS enabled on all 5 with 13 user-scoped policies
- `songs` storage bucket (private) with 4 user storage policies
- `handle_new_user` trigger function (auto-creates user row on auth signup)
- `update_updated_at_column` trigger function
- `uuid-ossp` extension
- All base indexes (8 indexes)

### Still needs applying (Parts 2-7)
Run **`supabase-delta-migration.sql`** in the SQL editor (NOT the full migration - that will fail on duplicate policies).

URL: `https://supabase.com/dashboard/project/xnhstgdgwonqjolmjvps/sql`

This creates:
- `generation_status` enum type
- `song_variants` table (variant generation, share tokens, swipe UI)
- `failed_jobs` table (dead-letter queue for failed generation)
- `bundles` table (pre-purchased song credit packs)
- `email_preferences` table (unsubscribe/anniversary reminders)
- `orders.occasion_date`, `orders.order_type`, `orders.parent_order_id` columns
- `customizations.occasion_date` column
- Guest user row (`00000000-...` / `guest@songswipe.io`)
- Service role + guest-aware RLS policies on all tables
- Service role storage policies for server-side song uploads
- All associated indexes

### Code status
All app code is correct and already references these tables/columns (built during phases 2-9). No code changes needed, just the DB migration.

## What's Remaining (Production Readiness Checklist)

### 1. Supabase Delta Migration (PRIORITY)
- Run `supabase-delta-migration.sql` in Supabase SQL editor
- URL: `https://supabase.com/dashboard/project/xnhstgdgwonqjolmjvps/sql`

### 2. Supabase Auth
- Enable Google OAuth in Supabase > Authentication > Providers (may already be done from earlier work)

### 3. Vercel Environment Variables (11 needed)
Check/set in Vercel project settings (some likely already configured):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ELEVEN_LABS_API_KEY`
- `INNGEST_EVENT_KEY`
- `INNGEST_SIGNING_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` = `https://songswipe.io`

### 4. Stripe Webhook
- Create webhook in Stripe Dashboard pointing to `https://songswipe.io/api/webhook`
- Event: `checkout.session.completed`
- Copy signing secret to `STRIPE_WEBHOOK_SECRET` in Vercel

### 5. Inngest
- Sign up at inngest.com, create app, sync with `https://songswipe.io/api/inngest`

### 6. Resend
- Set up account, verify sending domain, add API key to Vercel

### 7. End-to-End Testing
- Test full flow: sign up > customise > checkout > generation > swipe > download
- Test share link functionality
- Test dashboard (songs, orders, occasions tabs)

## Tech Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase (auth + DB + storage), Stripe (payments), ElevenLabs (music AI)
- Inngest (job queue/cron), Resend (email)

## MCP Access
- Vercel MCP: connected, working (team: Storylinr)
- Supabase MCP: connected to correct project `xnhstgdgwonqjolmjvps` (read-only mode)

## Key Decisions
- User rejected PostHog/analytics - not needed
- Stripe uses dynamic `price_data` (no pre-created products)
- No em-dashes in any output (user preference)
