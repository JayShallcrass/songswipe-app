---
phase: 09-retention-marketing
plan: 03
subsystem: email-marketing
tags: [unsubscribe, email-preferences, can-spam, rfc-8058, api-routes]
depends_on:
  requires: ["09-01"]
  provides: ["unsubscribe-api-route", "can-spam-compliance"]
  affects: ["09-02"]
tech_stack:
  added: []
  patterns: ["service-role-auth", "styled-html-responses", "one-click-unsubscribe"]
key_files:
  created: ["src/app/api/unsubscribe/[token]/route.ts"]
  modified: []
decisions:
  - key: "unsubscribe-html-responses"
    choice: "Self-contained styled HTML pages instead of redirects to app pages"
    rationale: "Better UX for email clients, no dependency on app routing, works offline"
  - key: "service-role-unsubscribe"
    choice: "Service role client for unsubscribe actions (no auth required)"
    rationale: "Users must be able to unsubscribe without logging in (CAN-SPAM requirement)"
  - key: "idempotent-unsubscribe"
    choice: "Check if order_id already in occasion_unsubscribes array before updating"
    rationale: "Re-clicking unsubscribe link has no side effects, prevents unnecessary DB writes"
metrics:
  duration: "1.3 min"
  completed: 2026-02-09
---

# Phase 09 Plan 03: Unsubscribe API Route Summary

**One-liner:** CAN-SPAM compliant unsubscribe route with per-occasion and global opt-out via styled HTML pages and RFC 8058 one-click support

## What Was Built

Built the complete unsubscribe API route handling both web-based (GET) and one-click (POST) unsubscribe requests. Users can opt out of individual occasion reminders or globally unsubscribe from all SongSwipe emails without requiring authentication. All responses use self-contained styled HTML pages with SongSwipe branding.

**Key capabilities:**
- Per-occasion unsubscribe via GET with order_id query parameter
- Global unsubscribe via GET without order_id or with 'all' parameter
- RFC 8058 one-click unsubscribe via POST (always global)
- Invalid/expired tokens show friendly error page (not crash or JSON)
- Success pages are styled HTML with "Return to SongSwipe" link
- No authentication required (service role client)
- Idempotent operations (re-clicking has no side effects)

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Unsubscribe API route with GET and POST handlers | 6d55824 | src/app/api/unsubscribe/[token]/route.ts |

## Decisions Made

**1. Self-contained HTML responses instead of app page redirects**
- Styled HTML pages generated inline with CSS
- No external dependencies (works in all email clients)
- Better UX than redirecting to app and showing success page there
- Users can see confirmation immediately without navigation

**2. Service role authentication for unsubscribe**
- Uses createServerSupabaseClient() with service role key
- No user authentication required (CAN-SPAM compliance)
- Token-based security instead of session-based

**3. Idempotent unsubscribe operations**
- Per-occasion: Check if order_id already in array before appending
- Global: Setting global_unsubscribe=true multiple times is safe
- Re-clicking unsubscribe link has no side effects
- Prevents unnecessary database writes

## Technical Highlights

**HTML page generator:**
- generateHtmlPage() helper creates styled responses
- Success: green checkmark, confirmation message
- Error: red X, friendly error message
- SongSwipe purple branding (#7c3aed) on links
- Mobile-responsive centered layout

**GET handler logic:**
1. Extract token from params (Next.js 15 dynamic route pattern)
2. Extract optional order_id and 'all' query params
3. Query email_preferences by unsubscribe_token
4. If not found, return 404 HTML error page
5. If order_id present, append to occasion_unsubscribes array (idempotent)
6. Otherwise, set global_unsubscribe = true
7. Return HTML success page with appropriate message

**POST handler logic (RFC 8058):**
1. Extract token from params
2. Query email_preferences by token
3. If not found, return 404 JSON
4. Set global_unsubscribe = true (always global per RFC 8058)
5. Return 200 JSON { success: true }

**Database fields updated:**
- occasion_unsubscribes: Array of order UUIDs user opted out of
- global_unsubscribe: Boolean flag for complete opt-out
- updated_at: Timestamp of last unsubscribe action

## Integration Points

**Used by:**
- Anniversary reminder emails (09-02) include unsubscribe links in footer
- List-Unsubscribe header (RFC 8058) points to POST endpoint
- List-Unsubscribe-Post header enables one-click in email clients

**Uses:**
- email_preferences table (09-01) for storing opt-out preferences
- Service role Supabase client for unauthenticated access

**Query pattern:**
```typescript
// Per-occasion unsubscribe
GET /api/unsubscribe/{token}?order_id={uuid}

// Global unsubscribe
GET /api/unsubscribe/{token}
GET /api/unsubscribe/{token}?all=true

// One-click unsubscribe (email client buttons)
POST /api/unsubscribe/{token}
```

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Blocks:** None

**Enables:**
- 09-02: Anniversary reminder emails can include unsubscribe links
- 09-02: List-Unsubscribe headers can reference this endpoint

**Risks/Concerns:** None

**Recommended next:** Proceed to 09-02 (anniversary reminder emails)

## Verification Notes

**TypeScript:** `npx tsc --noEmit` passed
**Exports:** Both GET and POST functions exported
**HTML responses:** Self-contained with inline CSS
**Error handling:** Invalid tokens return friendly 404 page
**Idempotency:** Per-occasion checks array before appending

## Self-Check: PASSED

All files created:
- FOUND: src/app/api/unsubscribe/[token]/route.ts

All commits exist:
- FOUND: 6d55824
