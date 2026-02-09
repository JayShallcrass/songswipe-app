---
phase: 09-retention-marketing
plan: 04
subsystem: retention
tags: [email-marketing, database, forms, anniversary-reminders, retention]
requires:
  - 09-01-email-preferences
  - 09-02-anniversary-engine
dependencies:
  provides:
    - occasion_date capture from user input
    - occasion_date stored on order records
    - anniversary query uses correct field from customizations
  affects:
    - Future anniversary reminders will now have correct data
tech-stack:
  added: []
  patterns:
    - Optional form field pattern for occasion_date
    - Join query to customizations for occasion field
key-files:
  created:
    - supabase/migrations/005_add_customization_occasion_date.sql
  modified:
    - src/types/database.ts
    - src/components/forms/PersonalizationForm.tsx
    - src/app/api/customize/route.ts
    - src/app/customize/page.tsx
    - src/app/api/webhook/route.ts
    - src/actions/checkout.ts
    - src/lib/inngest/functions/check-anniversaries.ts
decisions:
  - what: Optional date input pattern
    why: Date is optional since not all occasions have specific dates
    impact: Users can skip if occasion has no date (e.g., just-because)
  - what: Fetch occasion_date on order creation
    why: Orders need occasion_date for anniversary checking
    impact: Both Stripe webhook and bundle credit paths query customizations
  - what: Query occasion from customizations join
    why: Occasion type is on customizations, not orders
    impact: Removed non-existent occasion_type from query
metrics:
  duration: 3.5 min
  completed: 2026-02-09
---

# Phase 09 Plan 04: Gap Closure (Occasion Date Capture) Summary

Closed two critical gaps preventing the retention system from functioning by adding occasion date capture and fixing the anniversary query.

## Objective

Close verification gaps RETAIN-01 (occasion_date never captured) and RETAIN-02 (non-existent field queried) to enable anniversary reminders.

## What Was Built

### Task 1: Occasion Date Capture Pipeline
- Created migration 005_add_customization_occasion_date.sql to add DATE column
- Updated TypeScript database types with occasion_date field on customizations
- Added optional date picker to PersonalizationForm with "We'll send you a reminder next year" subtitle
- Updated customize API to accept and validate occasionDate field
- Wired occasionDate through customize page request body
- Empty string = no date provided (fully optional)

### Task 2: Order Creation and Query Fixes
- Webhook path: Fetches occasion_date from customization before order insert
- Bundle credit path: Fetches occasion_date from customization before order insert
- Removed non-existent occasion_type column from anniversary query
- Changed customizations join to include occasion field
- Extract occasionType from customizations join data instead of order.occasion_type
- Zero references to occasion_type remain in codebase

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add occasion date capture to form, API, and database | d6a5e32 | migration, database.ts, PersonalizationForm, customize route, customize page |
| 2 | Wire occasion_date to order creation and fix anniversary query | 97cb397 | webhook, checkout action, check-anniversaries |

## Decisions Made

**1. Optional date input pattern**
- Decision: Date picker is optional, no validation required
- Rationale: Not all occasions have specific dates (e.g., just-because)
- Impact: Users can skip field if occasion has no date
- Alternative: Could make required for specific occasions, but adds complexity

**2. Fetch occasion_date on order creation**
- Decision: Both Stripe webhook and bundle credit paths query customizations for occasion_date
- Rationale: Orders need occasion_date for anniversary checking
- Impact: Ensures occasion_date is always populated when available
- Trade-off: Extra query on order creation, but necessary for retention

**3. Query occasion from customizations join**
- Decision: Removed occasion_type from orders query, use customizations join instead
- Rationale: Occasion type lives on customizations table, not orders
- Impact: Fixes runtime crash from querying non-existent column
- Note: This was a bug from initial implementation

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Blockers:** None

**Manual steps required:**
- Migration 005_add_customization_occasion_date.sql must be run manually in Supabase SQL Editor (free tier limitation)

**Integration points verified:**
- Form captures occasionDate and includes in PersonalizationData interface
- Customize API validates and stores on customizations.occasion_date
- Webhook extracts from customizations and writes to orders.occasion_date
- Bundle credit path extracts from customizations and writes to orders.occasion_date
- Anniversary checker joins customizations(recipient_name, occasion) correctly

**Known issues:** None

**Phase 9 status:** Complete. All retention marketing features implemented and gaps closed. System ready for anniversary reminders.

## Self-Check: PASSED

All files created:
- FOUND: supabase/migrations/005_add_customization_occasion_date.sql

All commits verified:
- FOUND: d6a5e32
- FOUND: 97cb397
