---
phase: 04-audio-generation-preview
plan: 02
subsystem: client-state
tags: [react-query, hooks, polling, audio-preview]
status: complete

requires:
  - phases: []
  - context: Phase 4 Plan 01 API endpoints for polling targets

provides:
  - Client-side data fetching infrastructure
  - Polling mechanism for generation status
  - Protected audio preview with memory leak prevention

affects:
  - 04-03: Generation page UI will consume these hooks

tech-stack:
  added:
    - "@tanstack/react-query@5.90.20"
  patterns:
    - React Query for server state management
    - Polling with conditional refetch intervals
    - Blob URL management with cleanup

key-files:
  created:
    - src/lib/providers.tsx
    - src/lib/hooks/useGenerationStatus.ts
    - src/lib/hooks/useAudioPreview.ts
  modified:
    - package.json
    - src/app/layout.tsx

decisions:
  - slug: rq-polling-pattern
    choice: Use React Query refetchInterval callback to conditionally poll based on order status
    context: Stops polling automatically when generation completes or fails
  - slug: blob-url-cleanup
    choice: Use useEffect cleanup function to revoke object URLs
    context: Prevents memory leaks when variantId changes or component unmounts
  - slug: query-client-ssr
    choice: Create QueryClient in useState to avoid sharing between SSR requests
    context: Standard Next.js pattern for React Query

metrics:
  duration: 1.4 min
  completed: 2026-02-08
---

# Phase 04 Plan 02: React Query Hooks Summary

**One-liner:** React Query provider with polling hook (3s interval during generation) and audio preview hook (blob URL with cleanup).

## What Was Built

Installed React Query and created two client-side hooks for the generation page:

1. **useGenerationStatus**: Polls order status every 3 seconds while generating, stops when complete/failed. Returns typed response with derived convenience values (isGenerating, isComplete, completedCount, etc.)

2. **useAudioPreview**: Fetches audio preview as blob, converts to object URL for playback, revokes URL on cleanup to prevent memory leaks.

3. **Providers wrapper**: QueryClientProvider configured at app level with sensible defaults (5s staleTime, 1 retry).

## Decisions Made

**1. Conditional polling with refetchInterval callback**
- Used React Query's refetchInterval callback pattern (not static number)
- Returns 3000ms when order status is 'paid' or 'generating'
- Returns false when 'completed' or 'failed' to stop polling
- Prevents unnecessary network requests after generation finishes

**2. Memory leak prevention in useAudioPreview**
- Object URLs created from blobs must be manually revoked
- Cleanup function in useEffect calls URL.revokeObjectURL
- Runs when variantId changes or component unmounts
- Critical for multi-variant preview without memory buildup

**3. QueryClient in useState for SSR safety**
- Creating QueryClient at module level would share between SSR requests
- useState ensures each request gets isolated QueryClient instance
- Standard Next.js + React Query pattern

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Install React Query and create app-level provider | 4589875 | package.json, src/lib/providers.tsx, src/app/layout.tsx |
| 2 | Create useGenerationStatus and useAudioPreview hooks | f231af6 | src/lib/hooks/useGenerationStatus.ts, src/lib/hooks/useAudioPreview.ts |

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

**Consumed by:**
- Phase 04 Plan 03: Generation page UI components

**Depends on:**
- Phase 04 Plan 01: API endpoints (/api/orders/[id]/status, /api/orders/[id]/variants/[variantId]/preview)

**Data flow:**
```
useGenerationStatus → /api/orders/[id]/status → Supabase orders + song_variants
useAudioPreview → /api/orders/[id]/variants/[variantId]/preview → Supabase Storage
```

## Next Phase Readiness

**Ready for Plan 03:** Generation page UI can now consume these hooks for:
- Polling order status with automatic stop on completion
- Previewing audio variants with protected blob URLs
- No memory leaks or unnecessary network requests

**Testing considerations:**
- Plan 03 will need to handle loading/error states from both hooks
- Audio playback controls should use the audioRef provided by useAudioPreview
- Generation progress should derive from completedCount/totalVariants

## Technical Notes

**React Query configuration:**
- 5 second staleTime (balance between freshness and request reduction)
- 1 retry on failure (avoid excessive retries for 404/403 errors)
- refetchOnWindowFocus: false for polling queries (prevent double-fetch on tab switch)

**TypeScript interfaces:**
- VariantStatus and GenerationStatusResponse match Plan 01 API response shape
- Both hooks return typed objects (not React Query's full result)
- Derived values computed from data for convenience

**Hook API design:**
- useGenerationStatus returns convenience booleans (isGenerating, isComplete, isFailed)
- useAudioPreview returns loading/error states for UI feedback
- audioRef provided for direct audio element manipulation if needed

## Self-Check: PASSED

All created files exist:
- src/lib/providers.tsx
- src/lib/hooks/useGenerationStatus.ts
- src/lib/hooks/useAudioPreview.ts

All commits exist:
- 4589875 (Task 1)
- f231af6 (Task 2)
