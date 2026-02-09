---
phase: 08-user-dashboard
plan: 01
subsystem: backend-api
tags: [api-routes, react-query, dashboard-data, pagination, date-fns]

dependency_graph:
  requires:
    - 01-01-database-schema
    - 05-01-song-delivery-api
  provides:
    - dashboard-api-endpoints
    - dashboard-data-hooks
    - paginated-song-history
    - paginated-order-history
    - occasion-tracking-api
  affects:
    - 08-02-dashboard-ui

tech_stack:
  added:
    - date-fns: "^4.1.0"
  patterns:
    - react-query-pagination
    - date-calculations-with-date-fns
    - mutation-with-blob-cleanup
    - nested-supabase-response-flattening

key_files:
  created:
    - src/app/api/dashboard/songs/route.ts
    - src/app/api/dashboard/orders/route.ts
    - src/app/api/dashboard/occasions/route.ts
    - src/lib/hooks/useSongHistory.ts
    - src/lib/hooks/useOrderHistory.ts
    - src/lib/hooks/useOccasions.ts
    - src/lib/hooks/useDownloadSong.ts
  modified:
    - package.json

decisions:
  - context: "Pagination approach for dashboard lists"
    choice: "Server-side pagination with offset/limit via .range()"
    rationale: "Prevents loading all songs at once, scales to 100+ items, uses count: 'estimated' for total count"
  - context: "Occasion date filtering logic"
    choice: "Client-side filtering in React Query select for upcoming occasions (next 90 days)"
    rationale: "API returns all occasions with dates, select transforms to filter/format/sort for upcoming only - keeps API simple while providing computed UI data"
  - context: "Download mutation pattern"
    choice: "useMutation with blob URL creation and immediate cleanup in onSuccess"
    rationale: "Triggers browser download, extracts filename from Content-Disposition header, revokes blob URL to prevent memory leaks"
  - context: "Stale time for dashboard queries"
    choice: "60s for songs/orders, 300s (5min) for occasions, refetchOnWindowFocus: false"
    rationale: "Dashboard data doesn't change frequently - longer stale times reduce unnecessary API calls while keeping data reasonably fresh"

metrics:
  duration: 3.5 min
  completed: 2026-02-09
---

# Phase [8] Plan [1]: Dashboard Data Layer Summary

**One-liner:** Backend API endpoints and React Query hooks for paginated song history, order history, occasion tracking, and song downloads.

## What Was Built

Created a complete dashboard data layer with three API endpoints and four React Query hooks:

### API Endpoints

1. **GET /api/dashboard/songs** (paginated song history):
   - Accepts `page` and `pageSize` query params (defaults: page=1, pageSize=10)
   - Queries `song_variants` where `user_id = user.id`, `selected = true`, `generation_status = 'complete'`
   - Joins with `orders` -> `customizations` for recipient, occasion, genre, mood
   - Uses `.range(from, to)` for offset-based pagination
   - Returns flattened camelCase response with `songs`, `page`, `pageSize`, `total`, `pageCount`
   - Estimated count for performance (`{ count: 'estimated' }`)

2. **GET /api/dashboard/orders** (order/purchase history):
   - Accepts `page` and `pageSize` query params
   - Queries `orders` where `user_id = user.id`
   - Joins with `customizations` for recipient name and occasion
   - Returns order status, amount, order_type, stripe_session_id, created_at
   - Paginated with total count and pageCount

3. **GET /api/dashboard/occasions** (occasion date tracking):
   - No pagination (typically small dataset)
   - Queries `orders` where `user_id = user.id` AND `occasion_date IS NOT NULL`
   - Filters server-side for non-null occasion dates
   - Returns id, occasion_date, created_at, recipient_name, occasion
   - Sorted by occasion_date ASC

### React Query Hooks

1. **useSongHistory(page)**:
   - Fetches from `/api/dashboard/songs?page=${page}`
   - queryKey: `['songs', 'history', page]`
   - staleTime: 60s, refetchOnWindowFocus: false
   - Returns typed `SongHistoryResponse` with pagination metadata

2. **useOrderHistory(page)**:
   - Fetches from `/api/dashboard/orders?page=${page}`
   - queryKey: `['orders', 'history', page]`
   - staleTime: 60s, refetchOnWindowFocus: false
   - Returns typed `OrderHistoryResponse` with pagination metadata

3. **useOccasions()**:
   - Fetches from `/api/dashboard/occasions`
   - queryKey: `['occasions']`
   - Uses `select` to transform data: filters to upcoming occasions (next 90 days), calculates daysUntil, formats date with date-fns `format(date, 'MMM d, yyyy')`, sorts by daysUntil ASC
   - Imports `format`, `isAfter`, `isBefore`, `addDays` from 'date-fns'
   - staleTime: 300s (5 minutes)

4. **useDownloadSong()**:
   - useMutation (not useQuery) with `mutationFn` accepting songId
   - Fetches `/api/songs/${songId}/download`
   - Extracts filename from Content-Disposition header (fallback: 'songswipe-song.mp3')
   - onSuccess: creates blob URL, creates anchor element, triggers download, cleans up with URL.revokeObjectURL
   - Returns mutation object for isPending state in UI

All endpoints use the established `createServerSupabaseClient().auth.getUser()` authentication pattern. All hooks follow the patterns from Phase 4/5 (useGenerationStatus, useSongData).

## Decisions Made

### 1. Server-side pagination with offset/limit
**Context:** Dashboard lists could grow to 100+ songs/orders
**Decision:** Use Supabase `.range(from, to)` with `{ count: 'estimated' }` for all paginated endpoints
**Rationale:** Prevents loading all data at once (client-side pagination would cause memory/performance issues), scales well, provides total count for UI pagination controls without expensive exact count queries

### 2. Client-side filtering for upcoming occasions
**Context:** Occasion tracking needs to show only upcoming dates within 90 days
**Decision:** API returns all occasions with non-null dates, React Query `select` option filters/formats/sorts
**Rationale:** Keeps API simple and reusable (could support "all occasions" view later), client-side transformation provides computed UI data (daysUntil, formattedDate, isUpcoming) without additional API calls

### 3. Download mutation with blob cleanup
**Context:** Triggering song download from dashboard history
**Decision:** useMutation with blob URL creation in onSuccess callback and immediate cleanup via URL.revokeObjectURL
**Rationale:** Reuses existing `/api/songs/[id]/download` endpoint (no new API code), blob pattern allows filename extraction from headers, immediate cleanup prevents memory leaks from blob URLs

### 4. Stale time configuration
**Context:** Balancing data freshness with API call efficiency
**Decision:** 60s for songs/orders, 300s for occasions, refetchOnWindowFocus: false for all
**Rationale:** Dashboard data rarely changes (songs/orders are historical, occasions update infrequently) - longer stale times reduce unnecessary API calls while keeping data reasonably fresh, disabling refetch on focus prevents jarring updates during navigation

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Dashboard API endpoints and date-fns | 089f800 | package.json, src/app/api/dashboard/songs/route.ts, src/app/api/dashboard/orders/route.ts, src/app/api/dashboard/occasions/route.ts |
| 2 | React Query hooks for dashboard | ce46305 | src/lib/hooks/useSongHistory.ts, src/lib/hooks/useOrderHistory.ts, src/lib/hooks/useOccasions.ts, src/lib/hooks/useDownloadSong.ts |

## Deviations from Plan

None - plan executed exactly as written.

## Technical Details

### Nested Supabase Response Flattening
All API endpoints flatten nested joins using the established pattern from Phase 5:
```typescript
const order = Array.isArray(song.orders) ? song.orders[0] : song.orders
const customizationData = order?.customizations
const customization = Array.isArray(customizationData)
  ? customizationData[0]
  : customizationData
```

This handles Supabase's nested array responses from joins, unwrapping to single objects with null safety.

### React Query Type Safety
All hooks define inline TypeScript interfaces for request/response shapes:
- `SongHistoryResponse`, `SongHistoryItem`
- `OrderHistoryResponse`, `OrderHistoryItem`
- `OccasionsResponse`, `OccasionData`, `OccasionWithCalculations`

The `useOccasions` hook uses full generic syntax to specify queryFn return type differs from final data type:
```typescript
useQuery<OccasionsResponse, Error, OccasionWithCalculations[]>
```

This allows TypeScript to correctly type the `select` transformation.

### Pagination Calculation
Offset-based pagination calculates range from page number:
```typescript
const from = (page - 1) * pageSize
const to = from + pageSize - 1
```

Returns metadata for UI pagination controls:
```typescript
{
  page,
  pageSize,
  total: count || 0,
  pageCount: Math.ceil((count || 0) / pageSize)
}
```

### Date Calculations
The `useOccasions` hook transforms occasion dates with date-fns:
- `isAfter(occDate, now)` - checks if future date
- `isBefore(occDate, futureThreshold)` - checks if within 90 days
- `format(occDate, 'MMM d, yyyy')` - formats as "Feb 9, 2026"
- `daysUntil` - calculated via millisecond difference

## Next Phase Readiness

**Phase 8-2 (Dashboard UI) is ready to begin:**
- All data endpoints provide paginated, flattened responses ready for UI consumption
- React Query hooks provide typed data fetching with pagination, stale time, and error handling
- Download mutation ready to trigger from song cards
- Occasion calculations pre-computed for countdown/reminder UI
- date-fns installed and integrated for date formatting throughout dashboard

**Blockers:** None

**Concerns:** None - all hooks follow established patterns from Phase 4/5, no new architectural decisions

## Verification

Completed verification steps:
- [x] `npx tsc --noEmit` passes with zero errors
- [x] `date-fns` appears in package.json dependencies (v4.1.0)
- [x] All 3 API routes exist under src/app/api/dashboard/
- [x] All 4 hooks exist under src/lib/hooks/
- [x] API routes use createServerSupabaseClient auth pattern
- [x] Song history endpoint paginates with .range() and returns total count
- [x] Order history endpoint includes order_type in response
- [x] Occasions endpoint filters for non-null occasion_date
- [x] useDownloadSong uses useMutation with blob URL cleanup

## Performance Notes

**Execution:** 3.5 minutes (3m 28s)
**Task breakdown:**
- Task 1 (API endpoints + date-fns install): ~1m 50s
- Task 2 (React Query hooks): ~1m 38s

**Efficiency:** Established auth pattern and hook patterns from Phase 4/5 accelerated implementation. TypeScript error in `useOccasions` fixed quickly (generic type mismatch). No blocking issues.

## Self-Check: PASSED

All created files verified:
- src/app/api/dashboard/songs/route.ts
- src/app/api/dashboard/orders/route.ts
- src/app/api/dashboard/occasions/route.ts
- src/lib/hooks/useSongHistory.ts
- src/lib/hooks/useOrderHistory.ts
- src/lib/hooks/useOccasions.ts
- src/lib/hooks/useDownloadSong.ts

All commits verified:
- 089f800 (Task 1: Dashboard API endpoints and date-fns)
- ce46305 (Task 2: React Query hooks for dashboard)
