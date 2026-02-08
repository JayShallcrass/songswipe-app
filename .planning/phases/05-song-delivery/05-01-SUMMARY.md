---
phase: 05-song-delivery
plan: 01
subsystem: backend-api
tags: [api-routes, authentication, supabase-storage, audio-delivery]

dependency_graph:
  requires:
    - 01-01-database-schema
    - 04-01-preview-api
  provides:
    - song-metadata-api
    - audio-streaming-proxy
    - mp3-download-endpoint
  affects:
    - 05-02-song-delivery-ui
    - 06-01-sharing-flow

tech_stack:
  added: []
  patterns:
    - auth-and-proxy-pattern
    - signed-url-with-2hr-expiry
    - content-disposition-headers
    - uuid-validation
    - nested-query-flattening

key_files:
  created:
    - src/app/api/songs/[id]/route.ts
    - src/app/api/songs/[id]/stream/route.ts
    - src/app/api/songs/[id]/download/route.ts
  modified: []

decisions:
  - context: "Song API uses variant ID instead of order+variant pair"
    choice: "Primary identifier is song_variant.id (UUID) for simpler routing"
    rationale: "Cleaner URLs for delivery (/api/songs/[id] vs /api/orders/[id]/variants/[variantId]), matches sharing pattern"
  - context: "Signed URL expiry time for delivery endpoints"
    choice: "2-hour expiry (7200s) for both stream and download"
    rationale: "Longer than 10-minute preview expiry to handle pause/resume scenarios without re-authenticating"
  - context: "Filename for downloaded MP3"
    choice: "sanitized recipient name: songswipe-{sanitized-name}.mp3"
    rationale: "Personalized filename creates meaningful artifact, sanitization prevents file system issues"
  - context: "Browser cache policy for streaming"
    choice: "private, max-age=3600 (1 hour cache allowed)"
    rationale: "User owns the song, caching improves playback performance without security concerns"
  - context: "Return 404 vs 403 for non-owned variants"
    choice: "Return 404 for all non-existent/non-owned/non-selected variants"
    rationale: "Prevents enumeration attacks - attacker can't distinguish between non-existent and unauthorized"

metrics:
  duration: 1.8 min
  completed: 2026-02-08
---

# Phase [5] Plan [1]: Song Delivery API Summary

**One-liner:** Backend API endpoints for song metadata retrieval, audio streaming, and MP3 download with authentication and proxy pattern.

## What Was Built

Created three API route handlers for song delivery:

1. **Metadata endpoint (GET /api/songs/[id]/route.ts):**
   - Returns song variant metadata joined with order and customization data
   - Provides recipient name, occasion, sender name, genre, mood, dates
   - Maps nested Supabase response to flat camelCase structure for client consumption

2. **Stream endpoint (GET /api/songs/[id]/stream/route.ts):**
   - Proxies audio from Supabase Storage with Content-Disposition: inline
   - Uses 2-hour signed URL expiry for pause/resume scenarios
   - Allows 1-hour browser caching (private, max-age=3600)
   - Includes Accept-Ranges header for progressive loading

3. **Download endpoint (GET /api/songs/[id]/download/route.ts):**
   - Proxies audio with Content-Disposition: attachment to trigger browser download
   - Sanitizes recipient name for filename (e.g., "Sarah's Song" -> "songswipe-sarahs-song.mp3")
   - Includes Content-Length header for download progress tracking
   - Uses no-cache policy to ensure fresh downloads

All three endpoints:
- Enforce authentication via `createServerSupabaseClient().auth.getUser()`
- Validate UUID format with regex (return 400 for invalid)
- Require `selected=true` variant (only chosen song accessible)
- Check ownership via `user_id` filter
- Return 404 for non-existent/non-owned/non-selected variants (prevents enumeration)
- Check `generation_status='complete'` before serving audio (400 if not ready)

## Decisions Made

### 1. Song variant ID as primary identifier
**Context:** API routing pattern for song delivery
**Decision:** Use song_variant.id (UUID) directly instead of order+variant pair
**Rationale:** Simpler URLs (/api/songs/[id] vs /api/orders/[id]/variants/[variantId]) and matches the sharing pattern where share_token will map to variant ID

### 2. 2-hour signed URL expiry
**Context:** Balancing security with UX for audio playback
**Decision:** Use 7200-second (2-hour) expiry for both stream and download endpoints
**Rationale:** Longer than 10-minute preview expiry to handle real-world scenarios (user pauses song, takes call, resumes later) without forcing re-authentication. Still short enough to prevent link abuse.

### 3. Personalized download filenames
**Context:** User downloads MP3 file
**Decision:** Generate filename from recipient name: `songswipe-{sanitized-name}.mp3`
**Rationale:** Creates meaningful artifact for user ("songswipe-sarah.mp3" vs "song-variant-abc123.mp3"). Sanitization (lowercase, non-alphanumeric to hyphens) prevents file system issues with special characters.

### 4. Browser caching for streaming
**Context:** Performance optimization for audio playback
**Decision:** Allow 1-hour private cache for stream endpoint
**Rationale:** User owns the song, so browser caching doesn't create security issues. Improves performance for replay scenarios (user listens multiple times in same session).

### 5. 404 for all unauthorized access
**Context:** Error response for non-owned or non-selected variants
**Decision:** Return 404 (not 403) for all unauthorized access
**Rationale:** Prevents enumeration attacks - attackers can't distinguish between "variant doesn't exist" and "variant exists but you don't own it". Follows security best practice.

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Song metadata API endpoint | 95f0ba7 | src/app/api/songs/[id]/route.ts |
| 2 | Stream and download endpoints | c3b859d | src/app/api/songs/[id]/stream/route.ts, src/app/api/songs/[id]/download/route.ts |

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

### Authentication Pattern
All three endpoints use the established auth pattern from Phase 4:
```typescript
const supabase = createServerSupabaseClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
}
```

### UUID Validation
```typescript
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
if (!UUID_REGEX.test(params.id)) {
  return NextResponse.json({ error: 'Invalid song ID format' }, { status: 400 })
}
```

### Query Pattern
All endpoints filter by:
- `id` (variant UUID from URL)
- `selected=true` (only chosen variant)
- `user_id=user.id` (ownership verification)

Returns single record via `.single()`, returns 404 if error or no data.

### Nested Response Handling
Supabase joins return nested arrays. Code unwraps both levels:
```typescript
const order = Array.isArray(data.orders) ? data.orders[0] : data.orders
const customizationData = order?.customizations
const customization = Array.isArray(customizationData) ? customizationData[0] : customizationData
```

### Content-Disposition Headers
- **Stream:** `Content-Disposition: inline` - browser plays audio inline
- **Download:** `Content-Disposition: attachment; filename="..."` - browser triggers download

### Cache Headers
- **Stream:** `Cache-Control: private, max-age=3600` - 1 hour cache allowed
- **Download:** `Cache-Control: private, no-cache` - always fresh download

## Next Phase Readiness

**Phase 5-2 (Song Delivery UI) is ready to begin:**
- Metadata endpoint provides recipient name, occasion, dates for UI display
- Stream endpoint proxies audio for playback without exposing signed URLs
- Download endpoint triggers MP3 download with personalized filename
- All endpoints authenticated and ready for React Query integration

**Blockers:** None

**Concerns:** None - standard API route pattern, no new dependencies

## Verification

Completed verification steps:
- [x] `npx tsc --noEmit` passes with no TypeScript errors
- [x] Three route files created in correct locations
- [x] All endpoints enforce authentication and ownership
- [x] Download endpoint has Content-Disposition: attachment header
- [x] Stream endpoint has Content-Disposition: inline header
- [x] Both audio endpoints use 2-hour signed URL expiry (7200 seconds)
- [x] All endpoints enforce selected=true in queries
- [x] UUID validation returns 400 for invalid format
- [x] Metadata endpoint returns flat camelCase structure

## Performance Notes

**Execution:** 1.8 minutes (1m 50s)
**Task breakdown:**
- Task 1 (metadata endpoint): ~45 seconds
- Task 2 (stream + download endpoints): ~1 minute

**Efficiency:** Phase 4 auth pattern reuse accelerated implementation. No authentication gates or blocking issues.

## Self-Check: PASSED

All created files verified:
- src/app/api/songs/[id]/route.ts
- src/app/api/songs/[id]/stream/route.ts
- src/app/api/songs/[id]/download/route.ts

All commits verified:
- 95f0ba7 (Task 1: metadata endpoint)
- c3b859d (Task 2: stream and download endpoints)
