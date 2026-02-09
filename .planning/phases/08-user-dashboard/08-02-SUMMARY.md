---
phase: 08-user-dashboard
plan: 02
subsystem: ui
tags: [dashboard, react-components, audio-player, pagination, tabs, react-query]

dependency_graph:
  requires:
    - 08-01-dashboard-data-layer
    - 05-02-song-delivery-ui
  provides:
    - dashboard-ui-components
    - song-card-with-player
    - tabbed-dashboard-layout
    - occasion-countdown-ui
  affects:
    - none

tech_stack:
  added: []
  patterns:
    - expand-collapse-audio-player
    - tab-state-with-pagination-preservation
    - blob-url-cleanup-pattern
    - css-in-js-for-audio-player-styling
    - loading-skeletons
    - empty-state-pattern

key_files:
  created:
    - src/components/dashboard/EmptyState.tsx
    - src/components/dashboard/Pagination.tsx
    - src/components/dashboard/OccasionCard.tsx
    - src/components/dashboard/OrderRow.tsx
    - src/components/dashboard/SongCard.tsx
  modified:
    - src/app/dashboard/page.tsx

decisions:
  - context: "Audio player configuration for SongCard"
    choice: "Use CSS-in-js styling instead of customProgressBarSection/customControlsSection props"
    rationale: "Same approach as Phase 5 SongPlayer - avoids TypeScript errors with CustomUIModule types, provides full control over styling via global CSS"
  - context: "Tab state management with pagination"
    choice: "Separate page state for songs and orders (songPage, orderPage)"
    rationale: "Switching tabs preserves pagination position, better UX when browsing between sections"
  - context: "Auth pattern for dashboard"
    choice: "Client-side auth check with useEffect and redirect"
    rationale: "Dashboard is 'use client' component (needs React Query hooks), browser client checks auth on mount and redirects if unauthorized"
  - context: "Empty state CTAs"
    choice: "Songs link to /customize, Orders link to /pricing, Occasions have no CTA"
    rationale: "Directs users to relevant actions - create first song or view pricing to make purchase. Occasions are passive tracking."

metrics:
  duration: 2.7 min
  completed: 2026-02-09
---

# Phase [8] Plan [2]: Dashboard UI Summary

**One-liner:** Complete dashboard UI with tabbed layout, expandable song cards with audio player, order history with badges, occasion countdown cards, pagination, and empty states.

## What Was Built

Created a fully-featured user dashboard with three tabbed sections and five reusable components:

### Reusable Components

1. **EmptyState.tsx** (generic across all sections):
   - Props: icon (ReactNode), title, description, optional action CTA
   - Centered layout with padding, used for empty songs/orders/occasions
   - Purple-to-pink gradient styling on CTA buttons

2. **Pagination.tsx** (shared by songs and orders):
   - Props: page, pageCount, onPageChange callback
   - Previous/Next buttons with disabled states at boundaries
   - "Page X of Y" display
   - Only renders if pageCount > 1
   - Purple-to-pink gradient on active buttons, gray when disabled

3. **OccasionCard.tsx**:
   - Props: recipientName, occasion, date (formatted), daysUntil
   - Glass-morphism card style (bg-white/80 backdrop-blur-sm)
   - Days-until badge with color coding: green (30+ days), yellow (7-30 days), red (<7 days)
   - Badge text: "Today", "Tomorrow", or "{N} days away"
   - formatOccasion helper: removes hyphens, capitalizes words

4. **OrderRow.tsx**:
   - Props: orderId, status, amount (pence), orderType, date, recipientName, occasion
   - Row layout for order list display
   - Two badge types: status (completed/paid/generating/failed) and orderType (base/upsell/bundle)
   - Date formatted with date-fns: "MMM d, yyyy"
   - Amount displayed as £X.XX

5. **SongCard.tsx**:
   - Props: song object (id, recipientName, occasion, genre, mood, createdAt)
   - Expand/collapse pattern for lazy audio loading
   - Collapsed: shows recipient, occasion, genre, date, mood badges, "Play" button
   - Expanded: mounts AudioPlayer fetching from /api/songs/[id]/stream + Download button
   - Audio player uses react-h5-audio-player with CSS-in-js gradient styling
   - Blob URL cleanup on collapse/unmount via useEffect
   - Download button uses useDownloadSong mutation with isPending state

### Dashboard Page Rewrite

Complete rewrite of src/app/dashboard/page.tsx from server component to 'use client':

- **Auth check:** useEffect with Supabase browser client, redirects to /auth/login if not authenticated
- **Three tabs:** "My Songs" (default), "Orders", "Occasions"
- **Tab bar:** Purple gradient underline on active tab
- **Quick stats row:** Total songs, total orders, total spent (calculated from order data)
- **Header:** Gradient "My Dashboard" title, user email, sign out button

**My Songs tab:**
- useSongHistory(songPage) hook for data fetching
- Maps songs to SongCard components
- Loading skeletons (3 pulsing cards) when isLoading
- EmptyState when no songs (CTA links to /customize)
- Pagination component below list

**Orders tab:**
- useOrderHistory(orderPage) hook for data fetching
- Maps orders to OrderRow components in bordered list
- Loading skeletons when isLoading
- EmptyState when no orders (CTA links to /pricing)
- Pagination component below list

**Occasions tab:**
- useOccasions() hook (no pagination)
- Maps occasions to OccasionCard components in 2-column grid
- Loading skeletons when isLoading
- EmptyState when no occasions (no CTA - passive tracking)

## Decisions Made

### 1. CSS-in-js for AudioPlayer styling
**Context:** Need to style react-h5-audio-player with purple-to-pink gradient in SongCard
**Decision:** Use CSS-in-js (style jsx global) instead of customProgressBarSection/customControlsSection props
**Rationale:** Same approach as Phase 5 SongPlayer - customProgressBarSection/customControlsSection strings ('PROGRESS_BAR', etc.) cause TypeScript errors ("not assignable to CustomUIModule"). CSS-in-js provides full styling control without type issues. Targets .rhap_container and .rhap_* classes.

### 2. Separate page state for songs and orders
**Context:** Dashboard has three tabs, two use pagination
**Decision:** Maintain separate songPage and orderPage state variables
**Rationale:** When user switches tabs (Songs -> Orders -> Songs), pagination position is preserved. Better UX than resetting to page 1 on every tab switch. Occasions don't need pagination (typically small dataset).

### 3. Client-side auth with redirect
**Context:** Dashboard needs authentication but uses React Query hooks
**Decision:** 'use client' component with useEffect auth check and redirect on unauthorized
**Rationale:** Dashboard requires React Query hooks (useSongHistory, etc.) which need client component. useEffect checks auth on mount using Supabase browser client. Redirects to /auth/login if no user. Sign out button calls supabase.auth.signOut() then redirects.

### 4. Empty state CTA routing
**Context:** Empty states should direct users to relevant actions
**Decision:** Songs empty state links to /customize, Orders links to /pricing, Occasions has no CTA
**Rationale:** Songs empty state = no songs created yet, direct to song creation flow. Orders empty state = no purchases yet, direct to pricing page. Occasions empty state = passive tracking, no action needed (occasions auto-populate from song creation).

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Reusable dashboard components | 0375b38 | EmptyState.tsx, Pagination.tsx, OccasionCard.tsx, OrderRow.tsx |
| 2 | SongCard and dashboard page rewrite | b0a6649 | SongCard.tsx, page.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed AudioPlayer customProgressBarSection TypeScript error**
- **Found during:** Task 2 verification (npx tsc --noEmit)
- **Issue:** `customProgressBarSection={['PROGRESS_BAR']}` and `customControlsSection={['MAIN_CONTROLS', 'VOLUME_CONTROLS']}` caused TypeScript error - strings not assignable to CustomUIModule type
- **Fix:** Removed custom props, used CSS-in-js styling approach from Phase 5 (style jsx global targeting .rhap_* classes)
- **Files modified:** src/components/dashboard/SongCard.tsx
- **Verification:** TypeScript compilation passed
- **Committed in:** b0a6649 (Task 2 commit)

---

**Total deviations:** 1 auto-fix (1 bug)
**Impact on plan:** Bug fix necessary to pass TypeScript compilation. Same pattern used successfully in Phase 5. No scope changes.

## Technical Details

### Expand/Collapse Audio Player Pattern

SongCard implements lazy audio loading via expand/collapse:

1. **Collapsed state:** Shows song metadata, "Play" button
2. **User clicks "Play":** setIsExpanded(true)
3. **useEffect triggers:** Fetches audio blob from `/api/songs/${song.id}/stream`
4. **Blob URL created:** URL.createObjectURL(blob), stored in state
5. **AudioPlayer mounts:** Rendered with blob URL as src
6. **User clicks "Collapse":** setIsExpanded(false)
7. **Cleanup useEffect triggers:** URL.revokeObjectURL(audioUrl) to prevent memory leak
8. **Component unmount:** Cleanup function revokes any active blob URL

This pattern prevents loading audio for all songs at once (bandwidth/memory optimization).

### Tab State Management

Dashboard uses single activeTab state for current view, but separate pagination states:

```typescript
const [activeTab, setActiveTab] = useState<'songs' | 'orders' | 'occasions'>('songs')
const [songPage, setSongPage] = useState(1)
const [orderPage, setOrderPage] = useState(1)
```

When rendering tabs:
- Songs tab: uses songPage, passes setSongPage to Pagination
- Orders tab: uses orderPage, passes setOrderPage to Pagination
- Occasions tab: no pagination (single fetch)

Switching tabs preserves pagination position per section.

### Loading Skeletons

All three tabs use loading skeletons during data fetch:

```typescript
{isLoading ? (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-24 w-full" />
    ))}
  </div>
) : /* render data or empty state */}
```

Prevents layout shift, better perceived performance.

### Occasion Countdown Badge Logic

OccasionCard calculates badge style and text based on daysUntil:

- **daysUntil >= 30:** Green badge ("X days away")
- **7 <= daysUntil < 30:** Yellow badge ("X days away")
- **daysUntil < 7:** Red badge ("X days away")
- **daysUntil === 1:** Any color ("Tomorrow")
- **daysUntil === 0:** Any color ("Today")

daysUntil is pre-calculated in useOccasions hook (client-side date math).

### Order Type and Status Badges

OrderRow displays two badge types:

**Order Type Badge:**
- Base orders: Purple (bg-purple-100 text-purple-700)
- Upsell orders: Pink (bg-pink-100 text-pink-700)
- Bundle orders: Blue (bg-blue-100 text-blue-700)

**Status Badge:**
- Completed: Green (bg-green-100 text-green-700)
- Paid/Generating: Blue (bg-blue-100 text-blue-700)
- Failed: Red (bg-red-100 text-red-700)
- Other: Gray (bg-gray-100 text-gray-700)

Both badges rendered inline for compact order history display.

## Next Phase Readiness

**Phase 9 (Admin Controls) is ready to begin:**
- Dashboard UI complete, all user-facing features delivered
- Song history with playback/download functional
- Order history with purchase tracking complete
- Occasion tracking with countdown UI complete
- All DASH requirements satisfied

**Blockers:** None

**Concerns:** None - all components follow established patterns from Phase 5 (audio player) and Phase 4 (React Query hooks)

## Verification

Completed verification steps:
- [x] `npx tsc --noEmit` passes with zero errors
- [x] All 5 component files exist under src/components/dashboard/
- [x] Dashboard page.tsx is 'use client' component with tabbed layout
- [x] SongCard expands to show audio player and download button
- [x] SongCard cleans up blob URLs on collapse/unmount
- [x] OrderRow shows order type (base/upsell/bundle) and formatted amount
- [x] OccasionCard shows days-until countdown with color-coded badges
- [x] EmptyState shows CTA linking to /customize or /pricing
- [x] Pagination renders only when pageCount > 1
- [x] Tab switching preserves pagination state per section
- [x] Dashboard page imports useSongHistory, useOrderHistory, useOccasions hooks
- [x] SongCard imports useDownloadSong and react-h5-audio-player
- [x] All components have 'use client' directive

## Performance Notes

**Execution:** 2.7 minutes (2m 43s)
**Task breakdown:**
- Task 1 (4 reusable components): ~1m 20s
- Task 2 (SongCard + dashboard rewrite): ~1m 23s

**Efficiency:** Established patterns from Phase 5 (audio player styling) and Phase 4 (React Query hooks) accelerated implementation. TypeScript error fixed quickly with known CSS-in-js pattern. No blocking issues.

## Self-Check: PASSED

All created files verified:
- src/components/dashboard/EmptyState.tsx
- src/components/dashboard/Pagination.tsx
- src/components/dashboard/OccasionCard.tsx
- src/components/dashboard/OrderRow.tsx
- src/components/dashboard/SongCard.tsx

All modified files verified:
- src/app/dashboard/page.tsx (completely rewritten)

All commits verified:
- 0375b38 (Task 1: Reusable dashboard components)
- b0a6649 (Task 2: SongCard and dashboard page rewrite)
