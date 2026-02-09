# SongSwipe Production Status

**Last updated**: 2026-02-09 16:28
**Project**: SongSwipe - AI personalised song gift platform
**Repo**: https://github.com/JayShallcrass/songswipe-app (PUBLIC)
**Supabase project**: `xnhstgdgwonqjolmjvps`
**Vercel project**: `prj_6whE7EsvmmOiOBp865PO93cO8no2` (team: `team_zCmsgnxiA1zdfDicfpJ7Z46l`)
**Vercel domains**: songswipe.io, songswipe-app-storylinr.vercel.app

## Session Progress (2026-02-09)

### DONE this session
1. **Supabase DB migration** - Delta migration (Parts 2-7) applied successfully
   - 4 new tables: song_variants, failed_jobs, bundles, email_preferences
   - 3 new columns: orders.occasion_date, orders.order_type, orders.parent_order_id
   - customizations.occasion_date column
   - generation_status enum, guest user, all RLS policies + indexes
   - Had to create auth.users entry for guest BEFORE public.users (FK constraint)
2. **Google OAuth fixed** - Three issues resolved:
   - 303 status on redirects (was 307, causing file download instead of redirect)
   - `NEXT_PUBLIC_APP_URL` was set to `n` in Vercel (fixed to `https://songswipe.io`)
   - Supabase Site URL was `http://localhost:3000` (user changed to `https://songswipe.io`)
   - Added `https://songswipe.io/auth/callback` to Supabase redirect URLs allowlist
3. **Signout fixed** - Added 303 status, fixed localhost fallback
4. **All localhost:3000 fallbacks replaced** with `https://songswipe.io` (3 files)
5. **API auth fixed** - All 11 API routes were using service role client (no cookies) for auth.getUser()
   - Created `getAuthUser()` helper in `src/lib/supabase.ts` using `@supabase/ssr` with cookies
   - Updated all routes: customize, dashboard/songs, dashboard/orders, dashboard/occasions,
     songs/[id], songs/[id]/download, songs/[id]/stream, orders, orders/[id]/status,
     orders/[id]/variants/[variantId]/preview, orders/[id]/variants/[variantId]/select
6. **Users table RLS fixed** - Added INSERT policy + service role policy (was missing, causing trigger to silently fail)
7. **getAuthUser() upsert fallback** - Ensures public.users row exists even if trigger fails

### CURRENT ERROR (needs investigation)
- `POST /api/customize` returns 500
- Error: `Error in customize API: Y [...` (truncated in Vercel logs)
- DB insert now works (got past the previous 23xxx FK error)
- Error is now in the CATCH block, likely from `createCheckoutSession()` (Stripe)
- Most likely cause: `STRIPE_SECRET_KEY` not set or invalid in Vercel env vars
- Check: `https://vercel.com/storylinr/songswipe-app/settings/environment-variables`
- The customize route file: `src/app/api/customize/route.ts`
- Stripe helper: `src/lib/stripe.ts`

### Key code changes made
- `src/lib/supabase.ts` - Added `getAuthUser()` with cookie-based auth + users upsert fallback
- `src/app/auth/login/google/route.ts` - 303 redirects on all responses
- `src/app/auth/signout/route.ts` - 303 redirect, songswipe.io fallback
- `src/app/auth/login/page.tsx` - songswipe.io fallback
- `src/lib/share/generateShareUrl.ts` - songswipe.io fallback
- 11 API routes updated to use `getAuthUser()` + `createServerSupabaseClient()`
- `supabase-delta-migration.sql` - Created for Parts 2-7 only (Part 1 was pre-applied)

### SQL run manually by user in Supabase editor
1. Delta migration (Parts 2-7) from `supabase-delta-migration.sql`
2. Users table RLS fix:
   ```sql
   CREATE POLICY "Allow insert for authenticated users" ON users FOR INSERT WITH CHECK (auth.uid() = id);
   CREATE POLICY "Service role can manage users" ON users FOR ALL TO service_role USING (true);
   INSERT INTO public.users (id, email) SELECT id, email FROM auth.users WHERE id NOT IN (SELECT id FROM public.users) ON CONFLICT (id) DO NOTHING;
   ```

## What's Remaining (Production Readiness Checklist)

### 1. Supabase DB Migration - DONE
### 2. Supabase Auth (Google OAuth) - DONE
### 3. Vercel Environment Variables - PARTIALLY DONE
Confirmed set:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://xnhstgdgwonqjolmjvps.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = set (confirmed via MCP)
- `NEXT_PUBLIC_APP_URL` = `https://songswipe.io` (was `n`, fixed)

Needs checking (likely causing current 500 error):
- `SUPABASE_SERVICE_ROLE_KEY` - get from Supabase > Settings > API > service_role key
- `STRIPE_SECRET_KEY` - from Stripe Dashboard > Developers > API keys
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - same page (starts with `pk_`)

Not needed yet (later stages):
- `STRIPE_WEBHOOK_SECRET` - after creating webhook
- `ELEVEN_LABS_API_KEY` - for song generation
- `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` - for job queue
- `RESEND_API_KEY` - for email

### 4. Stripe Webhook - TODO
- Create webhook in Stripe Dashboard pointing to `https://songswipe.io/api/webhook`
- Event: `checkout.session.completed`

### 5. Inngest - TODO
- Sign up at inngest.com, create app, sync with `https://songswipe.io/api/inngest`

### 6. Resend - TODO
- Set up account, verify sending domain, add API key

### 7. End-to-End Testing - TODO

## Supabase Database Status - FULLY MIGRATED
- 9 tables: users, customizations, orders, songs, downloads, song_variants, failed_jobs, bundles, email_preferences
- All RLS policies including service role, guest user, INSERT on users
- All indexes, triggers, functions, storage bucket
- Guest user + James's user both exist in public.users
- MCP connected (read-only): project `xnhstgdgwonqjolmjvps`

## Tech Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Supabase (auth + DB + storage), Stripe (payments), ElevenLabs (music AI)
- Inngest (job queue/cron), Resend (email)

## Key Decisions
- User rejected PostHog/analytics - not needed
- Stripe uses dynamic `price_data` (no pre-created products)
- No em-dashes in any output (user preference)
