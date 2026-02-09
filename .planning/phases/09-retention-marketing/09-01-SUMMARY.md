---
phase: 09-retention-marketing
plan: 01
subsystem: database
tags: [email, supabase, postgres, RLS, unsubscribe]

# Dependency graph
requires:
  - phase: 01-database-foundation
    provides: "Database schema patterns, RLS policies, migration structure"
  - phase: 02-payment-flow
    provides: "Webhook handler for order creation"
provides:
  - "email_preferences table with unsubscribe management"
  - "EmailPreferences and OccasionReminder TypeScript types"
  - "Automatic preference record creation on first order"
affects: [09-02-reminder-scheduling, 09-03-email-templates]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Upsert with onConflict for idempotency", "Non-blocking email preference creation"]

key-files:
  created:
    - "supabase/migrations/004_add_email_preferences.sql"
    - "src/types/email-preferences.ts"
  modified:
    - "src/types/database.ts"
    - "src/app/api/webhook/route.ts"

key-decisions:
  - "Email preferences use upsert with onConflict: 'user_id' for idempotency (first order creates, subsequent are no-ops)"
  - "Email preference creation is non-blocking (logs error but doesn't break order flow)"
  - "unsubscribe_token uses crypto.randomUUID() for secure random tokens"
  - "occasion_unsubscribes stores array of order UUIDs for granular opt-out"

patterns-established:
  - "Migration pattern: CREATE TABLE → CREATE INDEX → ENABLE RLS → RLS policies"
  - "Database type pattern: Row/Insert/Update for each table"
  - "Service role RLS policy: FOR ALL TO service_role USING (true)"

# Metrics
duration: 2min
completed: 2026-02-09
---

# Phase 09 Plan 01: Email Preferences Infrastructure Summary

**Email preferences foundation with migration, TypeScript types, and automatic record creation on first order**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-09T00:59:39Z
- **Completed:** 2026-02-09T01:01:44Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created email_preferences table with RLS policies for unsubscribe management
- Added TypeScript interfaces for EmailPreferences and OccasionReminder
- Integrated email preference creation into webhook handler (upserts on first order)

## Task Commits

Each task was committed atomically:

1. **Task 1: Email preferences migration and TypeScript types** - `f7ed9f9` (feat)
2. **Task 2: Create email preference record on first order** - `7405fe7` (feat)

## Files Created/Modified
- `supabase/migrations/004_add_email_preferences.sql` - Email preferences table with RLS policies, indexes, and constraints
- `src/types/email-preferences.ts` - EmailPreferences, OccasionReminder, UnsubscribeAction types
- `src/types/database.ts` - Added email_preferences table definition (Row/Insert/Update)
- `src/app/api/webhook/route.ts` - Upserts email_preferences after order creation

## Decisions Made

1. **Upsert with onConflict for idempotency**: First order creates email_preferences record, subsequent orders are no-ops via onConflict: 'user_id' constraint
2. **Non-blocking preference creation**: Email preference upsert logs errors but doesn't break order flow (order processing is critical path)
3. **Secure unsubscribe tokens**: crypto.randomUUID() generates unique unsubscribe_token for URL-based opt-out
4. **Granular occasion opt-out**: occasion_unsubscribes array stores specific order UUIDs for per-occasion unsubscribe capability
5. **Placement in webhook**: Preference creation happens after order creation, before order type branching (applies to all order types)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Manual database migration required.** The migration file must be executed in Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/004_add_email_preferences.sql`
3. Verify table created: `SELECT * FROM email_preferences LIMIT 1;`

This is a Supabase free tier limitation (no automated migrations).

## Next Phase Readiness

- Email preferences table ready for Plan 02 (reminder scheduling)
- Preference records will be created automatically for all new orders
- Existing users will get preference records on their next order
- Ready for Resend integration and reminder cron jobs

---
*Phase: 09-retention-marketing*
*Completed: 2026-02-09*

## Self-Check: PASSED

All files created:
- supabase/migrations/004_add_email_preferences.sql
- src/types/email-preferences.ts

All commits exist:
- f7ed9f9
- 7405fe7
