---
phase: 09-retention-marketing
verified: 2026-02-09T01:54:07Z
status: passed
score: 4/4 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 2/4
  gaps_closed:
    - "System stores the occasion date and recipient info each time a user creates a song"
    - "System sends an email reminder before the anniversary of each tracked occasion"
  gaps_remaining: []
  regressions: []
---

# Phase 09: Retention & Marketing Verification Report

**Phase Goal:** The system captures occasion dates and sends annual "continue the story" email reminders to drive repeat song creation, with user opt-out controls

**Verified:** 2026-02-09T01:54:07Z
**Status:** passed
**Re-verification:** Yes - after gap closure (Plan 09-04)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | System stores the occasion date and recipient info each time a user creates a song | ✓ VERIFIED | PersonalizationForm (line 11, 31, 57) captures occasionDate, customize API (line 19, 69) validates and stores it, customizations table has occasion_date column (migration 005) |
| 2 | System sends an email reminder before the anniversary of each tracked occasion | ✓ VERIFIED | check-anniversaries.ts (line 11) runs daily cron at 9am UTC, queries orders with occasion_date (line 33), schedules reminder 7 days before anniversary (line 143), correctly joins customizations(recipient_name, occasion) (line 31), NO references to occasion_type |
| 3 | Reminder email includes "continue the story" call-to-action linking to a new song creation flow for that recipient/occasion | ✓ VERIFIED | Email template has "Create This Year's Song" button linking to /customize?occasion={type}, formatOccasion() helper capitalizes occasion, unsubscribe links present |
| 4 | User can opt out of reminder emails per individual occasion or globally | ✓ VERIFIED | Unsubscribe route handles both per-occasion (order_id param) and global (no param), RFC 8058 POST handler, styled HTML responses, idempotent operations |

**Score:** 4/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/005_add_customization_occasion_date.sql` | Adds occasion_date column to customizations | ✓ VERIFIED | 9 lines, ALTER TABLE with IF NOT EXISTS, DATE type, comment describing purpose |
| `src/types/database.ts` | occasion_date in customizations types (Row/Insert/Update) | ✓ VERIFIED | Lines 49, 64, 79 (customizations), lines 94, 107, 120 (orders), all include occasion_date: string \| null |
| `src/components/forms/PersonalizationForm.tsx` | Optional date picker with reminder subtitle | ✓ VERIFIED | 204 lines, occasionDate in interface (line 11), state (line 31), input type="date" (line 175), subtitle "We'll send you a reminder next year" (line 173), included in onSubmit (line 57) |
| `src/app/api/customize/route.ts` | Validates and stores occasionDate | ✓ VERIFIED | 102 lines, Zod schema includes occasionDate: z.string().optional() (line 19), insert includes occasion_date: customization.occasionDate \|\| null (line 69) |
| `src/app/customize/page.tsx` | Passes occasionDate in request body | ✓ VERIFIED | Line 85, occasionDate: data.occasionDate \|\| undefined in body object |
| `src/app/api/webhook/route.ts` | Fetches occasion_date from customization, includes in order insert | ✓ VERIFIED | Lines 58-63 fetch occasion_date from customizations, line 78 includes in order insert: occasion_date: customizationData?.occasion_date \|\| null |
| `src/actions/checkout.ts` | Bundle credit path fetches occasion_date, includes in order insert | ✓ VERIFIED | Lines 37-42 fetch occasion_date from customizations, line 54 includes in order insert: occasion_date: customizationWithDate?.occasion_date \|\| null |
| `src/lib/inngest/functions/check-anniversaries.ts` | Queries customizations.occasion via join, NOT occasion_type | ✓ VERIFIED | 163 lines, line 31 joins customizations(recipient_name, occasion), lines 65-67 extract occasionType from join data, line 113 uses occasionType variable, ZERO references to occasion_type (grep confirmed) |
| `supabase/migrations/004_add_email_preferences.sql` | email_preferences table with RLS policies | ✓ VERIFIED | 37 lines, CREATE TABLE with all required columns, indexes, RLS policies, service role policy (no regression) |
| `src/lib/emails/anniversary-reminder.tsx` | React Email template with CAN-SPAM footer | ✓ VERIFIED | 115 lines, purple CTA button, "Create This Year's Song" (grep found 1 match), personalized content, company address, two unsubscribe links (no regression) |
| `src/lib/inngest/functions/send-reminder-email.ts` | Event-triggered email sender with sleepUntil | ✓ VERIFIED | 122 lines, sleepUntil line 35, preference check lines 57-58 (global_unsubscribe) and 62 (occasion_unsubscribes), Resend integration, List-Unsubscribe headers (no regression) |
| `src/app/api/unsubscribe/[token]/route.ts` | GET and POST handlers for unsubscribe | ✓ VERIFIED | 238 lines, both handlers present, per-occasion + global logic, styled HTML, RFC 8058 POST (no regression) |
| `src/app/api/inngest/route.ts` | Registers checkAnniversaries and sendReminderEmail | ✓ VERIFIED | Line 9, both functions registered in array (no regression) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| PersonalizationForm | PersonalizationData interface | occasionDate export | ✓ WIRED | Line 11 exports occasionDate in interface, consumed by customize page via onSubmit callback |
| customize page | /api/customize | occasionDate in request body | ✓ WIRED | Line 85, occasionDate: data.occasionDate \|\| undefined in POST body |
| customize API | customizations table | occasion_date insert | ✓ WIRED | Line 69, occasion_date: customization.occasionDate \|\| null |
| webhook route | customizations table | occasion_date query | ✓ WIRED | Lines 58-63, fetches occasion_date before order creation |
| webhook route | orders table | occasion_date insert | ✓ WIRED | Line 78, occasion_date: customizationData?.occasion_date \|\| null |
| checkout action | customizations table | occasion_date query | ✓ WIRED | Lines 37-42, fetches occasion_date in bundle credit path |
| checkout action | orders table | occasion_date insert | ✓ WIRED | Line 54, occasion_date: customizationWithDate?.occasion_date \|\| null |
| check-anniversaries | customizations join | occasion field select | ✓ WIRED | Line 31, customizations(recipient_name, occasion) - occasion_type REMOVED |
| check-anniversaries | anniversary-reminder.requested event | inngest.send() | ✓ WIRED | Line 143, sends event with deduplication ID (no regression) |
| send-reminder-email | AnniversaryReminderEmail template | Resend send | ✓ WIRED | Template rendered in resend.emails.send() (no regression) |
| send-reminder-email | email_preferences table | Supabase query | ✓ WIRED | Lines 57-62, checks global_unsubscribe and occasion_unsubscribes (no regression) |
| Inngest route | check-anniversaries function | functions array | ✓ WIRED | Line 9, imported and registered (no regression) |
| unsubscribe route | email_preferences table | Supabase query + update | ✓ WIRED | Queries by token then updates (no regression) |

### Requirements Coverage

Phase 9 maps to RETAIN-01, RETAIN-02, RETAIN-03, RETAIN-04 (per ROADMAP.md)

| Requirement | Status | Supporting Evidence |
|-------------|--------|---------------------|
| RETAIN-01: Capture occasion date on song creation | ✓ SATISFIED | Form captures date, API validates and stores on customizations, both order creation paths (webhook + bundle credit) fetch and include on orders |
| RETAIN-02: Send anniversary reminder emails 7 days before | ✓ SATISFIED | Daily cron queries orders with occasion_date, correctly extracts occasion from customizations join (occasion_type bug fixed), schedules email 7 days before anniversary |
| RETAIN-03: Email includes "continue the story" CTA | ✓ SATISFIED | Email template has "Create This Year's Song" button linking to /customize?occasion={type} |
| RETAIN-04: User opt-out controls (per-occasion + global) | ✓ SATISFIED | Unsubscribe route handles both patterns, email sender checks preferences before sending |

### Anti-Patterns Found

None. Previous blockers resolved:

| Previous Issue | Status | Resolution |
|----------------|--------|------------|
| check-anniversaries.ts queried non-existent occasion_type column | ✗ FIXED | Line 31 now joins customizations(recipient_name, occasion), lines 65-67 extract occasionType from join data, zero grep hits for "occasion_type" |
| webhook/route.ts omitted occasion_date from order insert | ✗ FIXED | Lines 58-63 fetch occasion_date from customizations, line 78 includes in order insert |
| checkout.ts bundle credit path omitted occasion_date | ✗ FIXED | Lines 37-42 fetch occasion_date from customizations, line 54 includes in order insert |

### Gap Closure Summary

**Previous verification (2026-02-09T01:35:00Z):** 2/4 truths verified, gaps_found

**Gap 1: RETAIN-01 (occasion_date never captured) - CLOSED**
- Root cause: Webhook and bundle credit paths didn't include occasion_date when creating orders
- Fix implemented (Plan 09-04):
  1. Created migration 005_add_customization_occasion_date.sql (adds DATE column)
  2. Updated TypeScript types with occasion_date on customizations and orders
  3. Added optional date picker to PersonalizationForm (line 169-181)
  4. Updated customize API to validate and store occasionDate (line 19, 69)
  5. Webhook now fetches occasion_date from customization (lines 58-63) and includes in order (line 78)
  6. Bundle credit path fetches occasion_date from customization (lines 37-42) and includes in order (line 54)
- Verification: All 6 artifacts exist, substantive, and wired. occasionDate flows from form -> API -> customizations -> orders on both payment paths.

**Gap 2: RETAIN-02 (non-existent field queried) - CLOSED**
- Root cause: check-anniversaries.ts queried occasion_type from orders table, but column doesn't exist
- Fix implemented (Plan 09-04):
  1. Removed occasion_type from orders select query (line 30 deleted)
  2. Changed customizations join from (recipient_name) to (recipient_name, occasion) (line 31)
  3. Extract occasionType from customizations join data (lines 65-67)
  4. Use extracted occasionType variable instead of order.occasion_type (line 113)
- Verification: grep "occasion_type" returns zero results. Query joins customizations correctly. Runtime crash eliminated.

**Regressions:** None. All previously passing truths (3, 4) still verified. Email template, unsubscribe route, send-reminder-email function, Inngest registration all unchanged and functional.

**TypeScript compilation:** npx tsc --noEmit passes with zero errors.

### Human Verification Required

None. All success criteria verifiable programmatically and verified.

## Phase Status: COMPLETE

All 4 observable truths verified. All 13 required artifacts exist, are substantive, and wired correctly. Both verification gaps closed. Zero regressions. TypeScript compiles cleanly. Phase 09 goal achieved.

---

_Verified: 2026-02-09T01:54:07Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification: Yes (after Plan 09-04 gap closure)_
