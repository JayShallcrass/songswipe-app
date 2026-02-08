---
phase: 04-audio-generation-preview
plan: 01
subsystem: api
tags: [nextjs, supabase, auth, api-routes, audio-streaming]

# Dependency graph
requires:
  - phase: 01-foundation-infrastructure
    provides: Database schema with orders and song_variants tables, Supabase client setup with service_role pattern
provides:
  - Three authenticated API endpoints for order status polling, audio preview proxy, and variant selection
  - Auth verification pattern using service_role client's auth.getUser() for API routes
affects: [04-02-client-hooks, 04-03-generation-page]

# Tech tracking
tech-stack:
  added: []
  patterns: [API route auth verification using service_role getUser(), Audio blob proxying to hide signed URLs]

key-files:
  created:
    - src/app/api/orders/[id]/status/route.ts
    - src/app/api/orders/[id]/variants/[variantId]/preview/route.ts
    - src/app/api/orders/[id]/variants/[variantId]/select/route.ts
  modified: []

key-decisions:
  - "Auth pattern for API routes uses createServerSupabaseClient().auth.getUser() to verify user identity"
  - "Preview endpoint proxies audio through API to prevent signed URL exposure in browser devtools"
  - "Select endpoint atomically unselects other variants before selecting chosen variant"
  - "Anti-download headers (inline, no-cache, nosniff) prevent easy download of preview audio"

patterns-established:
  - "API route auth: Get user from service_role client's auth.getUser(), filter queries by user_id, return 401 if no user"
  - "Ownership verification: Query with user_id filter before serving data, return 404 if not found"
  - "Audio streaming: Generate signed URL server-side, fetch blob, stream to client without exposing URL"

# Metrics
duration: 1min
completed: 2026-02-08
---

# Phase 04 Plan 01: Backend API Endpoints Summary

**Three authenticated API endpoints for status polling, audio preview streaming, and variant selection with ownership verification**

## Performance

- **Duration:** 1 min 28 sec
- **Started:** 2026-02-08T21:18:19Z
- **Completed:** 2026-02-08T21:19:47Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created GET /api/orders/[id]/status endpoint returning order status with per-variant generation progress
- Created GET /api/orders/[id]/variants/[variantId]/preview endpoint serving audio as blob proxy to hide signed URLs
- Created POST /api/orders/[id]/variants/[variantId]/select endpoint for atomic variant selection
- All endpoints verify user authentication and ownership before serving data

## Task Commits

Each task was committed atomically:

1. **Task 1: Create order status polling endpoint and variant selection endpoint** - `0552d38` (feat)
2. **Task 2: Create protected audio preview endpoint** - `4ba0a56` (feat)

## Files Created/Modified
- `src/app/api/orders/[id]/status/route.ts` - Returns order status with joined song_variants array showing generation progress
- `src/app/api/orders/[id]/variants/[variantId]/preview/route.ts` - Proxies audio blob with anti-download headers, never exposes signed URL to client
- `src/app/api/orders/[id]/variants/[variantId]/select/route.ts` - Atomically toggles selected flag on chosen variant and unselects others

## Decisions Made

- **Auth pattern:** Used service_role client's `auth.getUser()` method (consistent with existing /api/customize pattern) rather than cookie-based auth to verify user identity in API routes
- **Preview proxy pattern:** Audio fetched server-side from Supabase Storage via signed URL, then streamed to client as blob. Signed URL never exposed to client devtools.
- **Atomic selection:** Select endpoint first unselects all other variants for the order, then selects the chosen variant to ensure only one variant is selected at a time
- **Anti-download headers:** Content-Disposition set to inline, Cache-Control prevents caching, X-Content-Type-Options prevents MIME sniffing to discourage downloads

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all endpoints created successfully with TypeScript compilation passing.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Backend API infrastructure complete for generation progress page
- Status endpoint ready for client-side polling hooks
- Preview endpoint ready for audio player component
- Select endpoint ready for "Choose this variant" button functionality
- Ready to proceed with 04-02 (client hooks) and 04-03 (generation page UI)

---
*Phase: 04-audio-generation-preview*
*Completed: 2026-02-08*

## Self-Check: PASSED

All files verified to exist:
- src/app/api/orders/[id]/status/route.ts
- src/app/api/orders/[id]/variants/[variantId]/preview/route.ts
- src/app/api/orders/[id]/variants/[variantId]/select/route.ts

All commits verified:
- 0552d38 (Task 1)
- 4ba0a56 (Task 2)
