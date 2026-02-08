---
phase: 01-foundation-infrastructure
plan: 01
subsystem: database
tags: [supabase, postgres, rls, typescript, sql-migration]

# Dependency graph
requires:
  - phase: none
    provides: base schema from supabase-schema.sql
provides:
  - song_variants table with per-variant status tracking (pending/generating/complete/failed)
  - generation_status ENUM type
  - failed_jobs dead-letter queue with JSONB event storage
  - orders.occasion_date column for retention tracking
  - RLS policies with dual-access pattern (authenticated owner + anon share + service_role)
  - TypeScript types matching new schema
affects: [01-02-inngest-setup, 04-audio-generation, 03-payment-flow]

# Tech tracking
tech-stack:
  added: []
  patterns: [dual-access-rls, per-variant-status-tracking, dead-letter-queue]

key-files:
  created: [supabase-schema-v2.sql]
  modified: [src/types/database.ts]

key-decisions:
  - "share_token uses UUID with UNIQUE constraint for public sharing (no signed URLs yet)"
  - "variant_number allows 1-5 to support +1 upsell future expansion"
  - "storage_path stores Supabase Storage path, not signed URL (URLs generated on-demand)"
  - "RLS service_role policy added explicitly for Inngest job queue access"

patterns-established:
  - "Dual-access RLS: authenticated users (owner), anon users (share_token), service_role (system)"
  - "ENUM types for status tracking instead of TEXT with CHECK constraints"
  - "Dead-letter queue pattern with full event_data JSONB for debugging"

# Metrics
duration: 2min
completed: 2026-02-08
---

# Phase 01 Plan 01: Database Schema Foundation Summary

**PostgreSQL schema with song_variants table (per-variant generation status), failed_jobs dead-letter queue, and dual-access RLS policies for authenticated owners and public share tokens**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-08T18:54:59Z
- **Completed:** 2026-02-08T18:57:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created migration SQL with song_variants table supporting up to 5 variants per order
- Added generation_status ENUM (pending/generating/complete/failed) for per-variant tracking
- Implemented failed_jobs dead-letter queue with full JSONB event storage for debugging
- Established dual-access RLS pattern: owners via user_id, public via share_token, system via service_role
- Updated TypeScript database types to mirror SQL schema exactly

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration SQL for song_variants, failed_jobs, and orders.occasion_date** - `e969260` (feat)
2. **Task 2: Update TypeScript database types to match new schema** - `1461fe1` (feat)

## Files Created/Modified
- `supabase-schema-v2.sql` - Phase 1 migration adding song_variants, failed_jobs, ENUM, indexes, and RLS
- `src/types/database.ts` - TypeScript types for song_variants, failed_jobs, GenerationStatus, and orders.occasion_date

## Decisions Made

- **share_token as UUID with UNIQUE constraint:** Enables public sharing without signed URLs. Each variant gets its own shareable token. App layer will validate specific tokens on anon requests.
- **variant_number allows 1-5:** Base package is 3 variants, but schema allows up to 5 to support the +1 upsell (Phase 6) without migration.
- **storage_path stores path, not URL:** Stores Supabase Storage path like `{user_id}/{order_id}/variant-1.mp3`. Signed URLs generated on-demand via API to control expiration.
- **service_role policy explicit:** Although service_role bypasses RLS in Supabase by default, added explicit policy for clarity and future-proofing when Inngest functions write variants.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript not installed:** npm dependencies were not installed in repository. Ran `npm install` to install TypeScript and verify type compilation. This is expected for fresh clone and not a deviation.

## User Setup Required

**Manual Supabase SQL execution required.** The migration file `supabase-schema-v2.sql` must be run in the Supabase SQL Editor:

1. Log into Supabase Dashboard
2. Navigate to SQL Editor
3. Run `supabase-schema-v2.sql`
4. Verify tables created: `SELECT * FROM song_variants LIMIT 1;`

This cannot be automated as Supabase doesn't support migration files in the free tier without CLI setup.

## Next Phase Readiness

- Database schema ready for Inngest job queue (Plan 02)
- TypeScript types available for all generation function code
- RLS policies in place, but not yet tested with real authenticated/anon requests (will be validated in Phase 3)
- No blockers for next plan

## Self-Check: PASSED

---
*Phase: 01-foundation-infrastructure*
*Completed: 2026-02-08*
