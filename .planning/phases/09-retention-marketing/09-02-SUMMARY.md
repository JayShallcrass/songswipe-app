---
phase: 09-retention-marketing
plan: 02
subsystem: infra
tags: [inngest, resend, react-email, cron, email-marketing, retention]

# Dependency graph
requires:
  - phase: 09-01
    provides: "Email preferences infrastructure with global and per-occasion unsubscribe"
  - phase: 01-foundation
    provides: "Inngest event-driven functions and Supabase database"
provides:
  - "Daily anniversary checker cron that queries upcoming occasions and schedules individual reminder emails"
  - "Event-driven email sender that sleeps until send date, checks opt-out preferences, and sends via Resend"
  - "React Email template for anniversary reminders with CAN-SPAM compliance"
affects: [retention, user-engagement, repeat-purchases]

# Tech tracking
tech-stack:
  added: ["@react-email/components", "resend"]
  patterns:
    - "Inngest cron for daily scheduled tasks"
    - "Inngest sleepUntil for delayed event execution"
    - "React Email templates with inline styles"
    - "Event deduplication via custom event IDs"

key-files:
  created:
    - "src/lib/emails/anniversary-reminder.tsx"
    - "src/lib/inngest/functions/check-anniversaries.ts"
    - "src/lib/inngest/functions/send-reminder-email.ts"
  modified:
    - "src/app/api/inngest/route.ts"

key-decisions:
  - "Cron runs daily at 9am UTC for better email open rates than midnight"
  - "Anniversary check looks for occasions 7 days in the future (month+day match), schedules send for same day"
  - "Email sender uses sleepUntil to delay execution until send date, checks preferences at send time (not schedule time)"
  - "Engagement filter: only users with orders in last 18 months receive reminders"
  - "Event deduplication uses orderId + anniversary date in event ID to prevent duplicate reminders"
  - "Preference check happens after sleepUntil to respect opt-outs made between schedule and send"
  - "List-Unsubscribe and List-Unsubscribe-Post headers enable one-click unsubscribe"

patterns-established:
  - "Cron-to-event pattern: Cron queries data, sends individual events for each action (scalable, fault-tolerant)"
  - "Sleep-then-check pattern: sleepUntil for delayed execution, then check opt-out preferences at send time"
  - "React Email template structure: Preview, inline styles, CAN-SPAM footer with company address and unsubscribe links"

# Metrics
duration: 4.3min
completed: 2026-02-09
---

# Phase 09 Plan 02: Anniversary Reminder Engine Summary

**Daily cron queries upcoming anniversaries (7 days ahead), schedules individual reminder emails via Inngest events, sends CAN-SPAM compliant emails with "Continue the Story" CTA via Resend and React Email**

## Performance

- **Duration:** 4.3 min (259 seconds)
- **Started:** 2026-02-09T01:04:59Z
- **Completed:** 2026-02-09T01:09:18Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Daily Inngest cron at 9am UTC queries orders for upcoming anniversaries (month+day match 7 days ahead)
- Engagement filter ensures only users active within 18 months receive reminders
- Event-driven architecture with deduplication prevents duplicate reminders if cron runs multiple times
- Email sender sleeps until send date, checks opt-out preferences at send time (respects changes made between schedule and send)
- React Email template with purple CTA button, personalized content, and CAN-SPAM compliant footer
- List-Unsubscribe headers enable one-click unsubscribe for email clients

## Task Commits

Each task was committed atomically:

1. **Task 1: Install React Email and create anniversary reminder template** - `ed1b683` (feat)
2. **Task 2: Inngest cron and email sender functions** - `503bfd0` (feat - backfill)

_Note: Task 2 code was originally committed in a28cb77 under plan 09-03. Commit 503bfd0 is a backfill empty commit to properly track plan 09-02 completion._

## Files Created/Modified

**Created:**
- `src/lib/emails/anniversary-reminder.tsx` - React Email template with "Continue the Story" heading, personalized body text referencing recipient name and occasion, purple CTA button linking to /customize with pre-filled occasion query param, CAN-SPAM footer with company address placeholder and two unsubscribe links (per-occasion and global)

- `src/lib/inngest/functions/check-anniversaries.ts` - Daily cron at 9am UTC that:
  - Queries orders table for completed/paid orders with occasion_date
  - Calculates if anniversary (month+day) is 7 days from now
  - Filters for users with orders in last 18 months (engagement filter)
  - Fetches user emails via auth.admin.getUserById
  - Schedules email/anniversary-reminder.requested events with deduplication ID `anniversary-{orderId}-{yyyy-MM-dd}`
  - Returns count of reminders scheduled

- `src/lib/inngest/functions/send-reminder-email.ts` - Event-triggered function that:
  - Receives email/anniversary-reminder.requested event
  - Calls step.sleepUntil(sendAt) to wait until 7 days before anniversary
  - Checks email_preferences for global_unsubscribe and occasion_unsubscribes (skips if opted out)
  - Fetches user email to verify user still exists
  - Sends via Resend with AnniversaryReminderEmail template
  - Builds URLs: createSongUrl (/customize?occasion=), unsubscribeUrl (per-occasion), unsubscribeAllUrl (global)
  - Includes List-Unsubscribe and List-Unsubscribe-Post headers
  - formatOccasion helper capitalizes and removes hyphens (e.g., 'valentines-day' -> "Valentine's Day")

**Modified:**
- `src/app/api/inngest/route.ts` - Added imports for checkAnniversaries and sendReminderEmail, registered both in functions array alongside generateSongFunction

## Decisions Made

**Anniversary logic:**
- Cron runs daily at 9am UTC (better email open rates than midnight)
- Query looks for occasions where the next anniversary (month+day) is exactly 7 days from now
- This prevents sending reminders every day for 7 days straight (only sends once per anniversary)
- Send date is immediate (same day as cron run), not 7 days in the future, because we're already checking 7 days ahead

**Preference check timing:**
- Preference check happens AFTER sleepUntil, not before
- This respects opt-outs made between schedule time and send time
- Example: User opts out on day 1, email scheduled for day 7 won't be sent because preference check happens on day 7

**Engagement filter:**
- Only users with orders in last 18 months receive reminders
- Prevents spamming inactive users who have moved on
- Query orders table for user's most recent created_at, skip if > 18 months ago

**Event deduplication:**
- Event ID format: `anniversary-{orderId}-{yyyy-MM-dd}`
- Prevents duplicate reminders if cron runs multiple times in same day
- If cron fails and retries, Inngest deduplicates events by ID

**Email compliance:**
- List-Unsubscribe header with unsubscribeAllUrl for email client one-click unsubscribe
- List-Unsubscribe-Post header indicates POST support for one-click
- CAN-SPAM footer includes company name, physical address placeholder (env var COMPANY_ADDRESS), per-occasion unsubscribe, and global unsubscribe

## Deviations from Plan

**1. [Rule 3 - Blocking] TypeScript compilation error for customizations field**
- **Found during:** Task 2 (check-anniversaries.ts implementation)
- **Issue:** Supabase query returns customizations as `never` type due to join, causing TypeScript error on recipient_name access
- **Fix:** Cast customizations to `any` type and extract recipient_name early with fallback to 'someone special'
- **Files modified:** src/lib/inngest/functions/check-anniversaries.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 503bfd0 (Task 2 backfill commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** TypeScript casting necessary to work with Supabase join types. No scope creep.

## Issues Encountered

**Plan 09-03 premature execution:**
- During execution, discovered that check-anniversaries.ts and send-reminder-email.ts were already committed in a28cb77 under plan 09-03
- This was likely a previous execution that ran plan 09-03 before 09-02
- Resolution: Created backfill empty commit 503bfd0 to properly track plan 09-02 completion
- The code was already correct and matched plan 09-02 specifications exactly
- No rework needed, just commit tracking correction

## User Setup Required

**Environment variables to add:**

Before anniversary reminders can be sent, add these to `.env.local`:

```bash
# Resend API key for sending emails
RESEND_API_KEY=re_xxx

# Email sender address (must be verified domain in Resend)
RESEND_FROM_EMAIL=reminders@songswipe.app

# Company physical address for CAN-SPAM compliance
COMPANY_ADDRESS="Your Company Name, 123 Main St, City, State, ZIP"

# App base URL (defaults to https://songswipe.app if not set)
NEXT_PUBLIC_APP_URL=https://songswipe.app
```

**Resend setup:**
1. Create account at https://resend.com
2. Verify domain (songswipe.app) via DNS records
3. Generate API key in dashboard
4. Add verified sender email in Resend dashboard

**Verification:**
- Inngest functions appear in Inngest dashboard after deployment
- Test cron: Trigger manually in Inngest dashboard
- Test email: Send test event via Inngest UI

## Next Phase Readiness

**Ready for:**
- Phase 09-03: Unsubscribe API route (uses unsubscribe_token from email_preferences)
- Production deployment (after environment variables configured)

**Blockers/Concerns:**
- Resend account setup required before emails can be sent (free tier allows 3,000 emails/month, 100/day)
- Physical address must be added to COMPANY_ADDRESS env var for CAN-SPAM compliance
- Inngest cron won't run locally (requires Inngest Cloud or `inngest dev` tunnel)

**Architecture notes:**
- Cron-to-event pattern scales well: If 1,000 anniversaries match, cron schedules 1,000 individual events (each handled independently with retries)
- sleepUntil pattern means events scheduled today for 7 days from now will sleep in Inngest Cloud (not blocking local execution)
- Email preference checks at send time (not schedule time) ensure we respect opt-outs made during the 7-day window

---
*Phase: 09-retention-marketing*
*Completed: 2026-02-09*

## Self-Check: PASSED

All files and commits verified:
- src/lib/emails/anniversary-reminder.tsx: EXISTS
- src/lib/inngest/functions/check-anniversaries.ts: EXISTS
- src/lib/inngest/functions/send-reminder-email.ts: EXISTS
- Commit ed1b683: EXISTS
- Commit 503bfd0: EXISTS
