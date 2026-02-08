# Phase 8: User Dashboard - Research

**Researched:** 2026-02-08
**Domain:** User dashboard with song history, order history, audio playback, and occasion tracking
**Confidence:** HIGH

## Summary

Phase 8 implements a user dashboard where authenticated users can view all previously created songs, replay/re-download any song with fresh signed URLs, view purchase history, and see tracked occasion dates with upcoming reminders. The dashboard leverages Next.js 15 with React Query for data fetching, Supabase RLS policies for data isolation, and react-h5-audio-player for in-list audio playback.

The 2026 consensus for dashboard data fetching is a hybrid pattern: React Server Components fetch initial data for fast page loads, while TanStack Query (React Query) handles client-side mutations, refetching, and real-time updates. For user dashboards with private data, Supabase RLS policies using `auth.uid()` provide database-level access control, ensuring users can only see their own songs and orders.

**Primary recommendation:** Use server-side data fetching for initial page load via Next.js 15 App Router, client-side React Query for mutations and refetching, offset-based pagination with indexed user_id for performance, and on-demand signed URL generation (not storage) for secure downloads.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15 | App Router, Server Components, API routes | Industry standard for React SSR/SSG, excellent Vercel integration |
| TanStack Query | 5.90.20 | Client data fetching, caching, mutations | De facto standard for server state management in React, excellent Next.js 15 RSC support |
| Supabase JS | 2.94.1+ | Database queries, RLS, signed URLs | Already in stack, built-in auth integration, automatic RLS with auth.uid() |
| react-h5-audio-player | 3.10.1 | Audio player component | Already in stack (Phase 5), customizable UI, keyboard controls |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TanStack Table | 8.x | Headless table/datagrid | If implementing sortable/filterable tables (optional for v1) |
| date-fns | 2.x | Date formatting and calculations | For occasion date formatting and "upcoming" logic |
| Framer Motion | 11.18.2 | Animations for empty states, loading | Already in stack, consistent with existing UI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Query | SWR | SWR is lighter but less feature-rich; React Query has better devtools, mutation support, and prefetching |
| Offset pagination | Cursor pagination | Cursor is more performant for large datasets but adds complexity; offset is sufficient for v1 user dashboards |
| TanStack Table | Custom table | Custom is simpler for basic lists but TanStack provides sorting/filtering/selection for free if needed later |

**Installation:**
```bash
npm install @tanstack/react-query date-fns
# TanStack Table only if implementing sortable tables
npm install @tanstack/react-table
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── dashboard/
│   ├── page.tsx              # Dashboard overview (stats, recent activity)
│   ├── songs/
│   │   └── page.tsx          # Song history list
│   ├── orders/
│   │   └── page.tsx          # Order/purchase history
│   └── occasions/
│       └── page.tsx          # Occasion dates and reminders
├── api/
│   ├── dashboard/
│   │   ├── songs/
│   │   │   └── route.ts      # GET /api/dashboard/songs (with pagination)
│   │   ├── orders/
│   │   │   └── route.ts      # GET /api/dashboard/orders
│   │   └── occasions/
│   │       └── route.ts      # GET /api/dashboard/occasions
│   └── songs/
│       └── [id]/
│           ├── stream/
│           │   └── route.ts  # Existing from Phase 5
│           └── download/
│               └── route.ts  # Existing from Phase 5
src/
├── components/
│   └── dashboard/
│       ├── SongHistoryList.tsx
│       ├── SongCard.tsx
│       ├── OrderHistoryTable.tsx
│       ├── OccasionCard.tsx
│       └── EmptyState.tsx
└── hooks/
    ├── useSongHistory.ts     # React Query hook
    ├── useOrderHistory.ts    # React Query hook
    └── useOccasions.ts       # React Query hook
```

### Pattern 1: Hybrid Data Fetching (RSC + React Query)

**What:** Use React Server Components for initial data fetch (fast first load), then hydrate with React Query for client-side updates, mutations, and refetching.

**When to use:** Dashboard pages where initial data should load server-side but users need real-time updates or mutations.

**Example:**
```typescript
// app/dashboard/songs/page.tsx (Server Component)
import { createServerSupabaseClient } from '@/lib/supabase/server'
import SongHistoryClient from '@/components/dashboard/SongHistoryClient'

export default async function SongsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  // Server-side initial fetch
  const { data: initialSongs } = await supabase
    .from('song_variants')
    .select(`
      id,
      variant_number,
      created_at,
      storage_path,
      orders (
        customizations (
          recipient_name,
          occasion,
          genre,
          mood
        )
      )
    `)
    .eq('user_id', user?.user?.id)
    .eq('selected', true)
    .order('created_at', { ascending: false })
    .range(0, 9) // First 10 songs

  return <SongHistoryClient initialData={initialSongs} />
}

// components/dashboard/SongHistoryClient.tsx (Client Component)
'use client'
import { useQuery } from '@tanstack/react-query'

export default function SongHistoryClient({ initialData }) {
  const { data: songs } = useQuery({
    queryKey: ['songs', 'history'],
    queryFn: fetchSongs,
    initialData, // Hydrate from server
    refetchOnMount: false, // Don't refetch if server data is fresh
  })

  return <SongHistoryList songs={songs} />
}
```

**Source:** [Next.js 15 Advanced Patterns](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/), [React Server Components + TanStack Query](https://dev.to/krish_kakadiya_5f0eaf6342/react-server-components-tanstack-query-the-2026-data-fetching-power-duo-you-cant-ignore-21fj)

### Pattern 2: RLS-Secured Dashboard Queries

**What:** Use Supabase RLS policies with `(select auth.uid()) = user_id` pattern for optimal performance. Wrap auth.uid() in subquery to cache result per statement instead of per row.

**When to use:** All dashboard data fetching where users should only see their own data.

**Example:**
```sql
-- Optimized RLS policy for song_variants
CREATE POLICY "Users can view own songs (dashboard)"
  ON song_variants
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Index for performance (CRITICAL)
CREATE INDEX IF NOT EXISTS idx_song_variants_user_created
  ON song_variants(user_id, created_at DESC);
```

**Why wrapped auth.uid():** The `(select auth.uid())` wrapper causes Postgres to run an initPlan that caches the result per statement, avoiding repeated function calls on each row. This can improve query performance by 100x+ on large tables.

**Source:** [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv), [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Pattern 3: Offset Pagination with Total Count

**What:** Use `.range(from, to)` with `.select('*', { count: 'estimated' })` for paginated lists. Combine with `.order()` for consistent results.

**When to use:** Song history, order history, any list that could grow beyond 20-50 items.

**Example:**
```typescript
// API route: /api/dashboard/songs
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = await createServerSupabaseClient()
  const { data: user } = await supabase.auth.getUser()

  const { data: songs, count } = await supabase
    .from('song_variants')
    .select(`
      id,
      variant_number,
      created_at,
      storage_path,
      orders!inner (
        id,
        customizations (
          recipient_name,
          occasion,
          genre,
          mood
        )
      )
    `, { count: 'estimated' })
    .eq('user_id', user?.user?.id)
    .eq('selected', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  return Response.json({
    songs,
    page,
    pageSize,
    total: count,
    pageCount: Math.ceil(count / pageSize)
  })
}
```

**Source:** [Supabase Pagination in React](https://makerkit.dev/blog/tutorials/pagination-supabase-react)

### Pattern 4: Fresh Signed URL Generation

**What:** Generate signed URLs on-demand when user clicks download/play, not at render time. Store storage_path in database, generate signed URLs via API endpoint with 2-hour expiry.

**When to use:** Re-downloading songs from dashboard, replaying from history.

**Example:**
```typescript
// Existing endpoint from Phase 5: /api/songs/[id]/download
// Dashboard reuses this endpoint - no new code needed

// React Query mutation for download
const downloadMutation = useMutation({
  mutationFn: async (songId: string) => {
    const res = await fetch(`/api/songs/${songId}/download`)
    if (!res.ok) throw new Error('Download failed')

    const blob = await res.blob()
    const filename = res.headers.get('content-disposition')
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || 'song.mp3'

    // Trigger browser download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url) // Clean up
  },
})

// Usage in SongCard
<button onClick={() => downloadMutation.mutate(song.id)}>
  {downloadMutation.isPending ? 'Downloading...' : 'Download'}
</button>
```

**Source:** Existing Phase 5 implementation (05-01 decision: signed URL expiry 2 hours, personalized filename)

### Pattern 5: Lazy Audio Loading in Lists

**What:** Only mount audio player for visible/active song. Use IntersectionObserver or explicit "expand" interaction to prevent loading all audio files simultaneously.

**When to use:** Song history lists with 10+ items containing playable audio.

**Example:**
```typescript
// SongCard with expand/collapse pattern
export function SongCard({ song }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3>{song.orders.customizations.recipient_name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatOccasion(song.orders.customizations.occasion)} • {formatDate(song.created_at)}
          </p>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Collapse' : 'Play'}
        </button>
      </div>

      {/* Only load player when expanded */}
      {isExpanded && (
        <div className="mt-4">
          <AudioPlayerWithData songId={song.id} />
        </div>
      )}
    </div>
  )
}

// AudioPlayerWithData fetches stream URL and renders player
function AudioPlayerWithData({ songId }) {
  const { data: audioUrl, isLoading } = useQuery({
    queryKey: ['song', songId, 'stream'],
    queryFn: async () => {
      const res = await fetch(`/api/songs/${songId}/stream`)
      const blob = await res.blob()
      return URL.createObjectURL(blob)
    },
    // Clean up blob URL on unmount
    onSuccess: (url) => () => URL.revokeObjectURL(url),
  })

  if (isLoading) return <Skeleton className="h-16 w-full" />

  return (
    <AudioPlayer
      src={audioUrl}
      autoPlayAfterSrcChange={false}
      customAdditionalControls={[]}
    />
  )
}
```

**Source:** [Improved lazy loading for audio](https://www.sitelint.com/blog/improved-lazy-loading-for-image-video-and-audio), [Lazy loading performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading)

### Pattern 6: Empty States and Loading Skeletons

**What:** Show skeleton loaders during initial load, empty states when user has no data. Empty states should match brand and guide user toward creating their first song.

**When to use:** All dashboard sections (songs, orders, occasions).

**Example:**
```typescript
// SongHistoryList with loading and empty states
export function SongHistoryList({ songs, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (!songs || songs.length === 0) {
    return (
      <EmptyState
        icon={<MusicIcon />}
        title="No songs yet"
        description="Create your first personalized song to see it here."
        action={
          <Button asChild>
            <Link href="/customize">Create a Song</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {songs.map(song => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  )
}
```

**Source:** [Empty state UX examples](https://www.eleken.co/blog-posts/empty-state-ux), [Carbon Design System loading patterns](https://carbondesignsystem.com/patterns/loading-pattern/)

### Anti-Patterns to Avoid

- **Don't fetch all data at once and paginate client-side:** With 100+ songs, this causes performance issues and memory spikes. Always paginate server-side.
- **Don't store signed URLs in database:** URLs expire. Store storage_path and generate signed URLs on-demand via API endpoints.
- **Don't load all audio players simultaneously:** In a list of 20 songs, loading 20 audio files at once causes network congestion and memory leaks. Use lazy loading with expand/collapse.
- **Don't use auth.uid() without wrapping in subquery:** `auth.uid() = user_id` calls function on every row. Use `(select auth.uid()) = user_id` for 100x+ performance improvement.
- **Don't forget cleanup for blob URLs:** `URL.createObjectURL()` creates memory that persists until revoked. Always call `URL.revokeObjectURL()` on unmount or when replacing URL.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination logic | Custom offset/limit calculator | Supabase `.range(from, to)` | Built-in, works with RLS, returns total count automatically |
| Audio player UI | Custom HTML5 audio controls | react-h5-audio-player | Already in stack, cross-browser, keyboard controls, mobile-friendly |
| Data fetching/caching | Custom fetch with useState/useEffect | TanStack Query | Automatic caching, deduplication, refetching, error handling, devtools |
| Date formatting | Manual date arithmetic | date-fns | Battle-tested, handles timezones, i18n-ready, tree-shakeable |
| Table sorting/filtering | Custom sort/filter logic | TanStack Table (if needed) | Headless, handles complex state, works with server pagination |
| Empty states | Ad-hoc conditional renders | Reusable EmptyState component | Consistent UX, design system integration, less duplication |

**Key insight:** Dashboards involve coordinating data fetching, pagination, caching, optimistic updates, and loading states across multiple views. React Query eliminates 90% of this boilerplate by handling cache invalidation, request deduplication, background refetching, and error recovery automatically. Hand-rolling this state management leads to bugs around stale data, race conditions, and inconsistent loading states.

## Common Pitfalls

### Pitfall 1: Client-Side Pagination with Large Datasets

**What goes wrong:** Fetching all user songs at once and paginating in the browser. Works fine with 10 songs, but with 100+ songs the page becomes sluggish, mobile devices struggle, and initial load times spike.

**Why it happens:** Developers default to simple client-side pagination without considering future scale. Early testing with small datasets masks the problem.

**How to avoid:** Always implement server-side pagination from day one using `.range(from, to)`. Pass `page` and `pageSize` as query params to API endpoints.

**Warning signs:** Page sluggishness on mobile, long initial load times, large network payloads (>100KB for a single list fetch).

**Source:** [The Pagination Pitfall](https://dev.to/ozkanpakdil/the-pagination-pitfall-a-react-spring-boot-cautionary-tale-c6i)

### Pitfall 2: Signed URL Caching/Storage

**What goes wrong:** Storing signed URLs in database or React Query cache with long staleTime. URLs expire (2 hours in this app), causing broken download/playback links.

**Why it happens:** Developers treat signed URLs like permanent URLs, or cache them too aggressively to reduce API calls.

**How to avoid:** Store `storage_path` in database, generate signed URLs on-demand in API routes. Set React Query staleTime to 0 for signed URL endpoints to ensure fresh URLs on each request.

**Warning signs:** "URL expired" errors, 403 responses when replaying old songs, users reporting "download doesn't work after a while".

**Source:** [Supabase createSignedUrl docs](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl)

### Pitfall 3: Memory Leaks from Blob URLs

**What goes wrong:** Creating blob URLs via `URL.createObjectURL()` for audio streams but never calling `URL.revokeObjectURL()`. Memory accumulates with each song played, eventually causing browser slowdown or crashes.

**Why it happens:** Blob URLs persist in memory until explicitly revoked. React component cleanup is forgotten, or cleanup function isn't properly scoped.

**How to avoid:** Always return cleanup function from useEffect or React Query's onSuccess callback. Use `URL.revokeObjectURL(blobUrl)` when component unmounts or when replacing with new URL.

**Warning signs:** Browser memory usage grows continuously, DevTools shows leaked blob URLs, app becomes sluggish after viewing many songs.

**Source:** [react-h5-audio-player issue #33](https://github.com/lhz516/react-h5-audio-player/issues/33), Phase 5 decisions (05-02, 07-02)

### Pitfall 4: Missing Indexes on RLS Policy Columns

**What goes wrong:** RLS policies filter on `user_id`, but `user_id` column isn't indexed. Dashboard queries scan entire table, causing slow load times as song count grows.

**Why it happens:** RLS policies are added without considering query performance. Indexes are forgotten during schema migrations.

**How to avoid:** Always index columns used in RLS policies. Create composite indexes for common query patterns (e.g., `user_id + created_at DESC`).

**Warning signs:** Dashboard queries take >500ms, Supabase Performance Advisor flags slow queries, query time increases linearly with total row count.

**Source:** [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)

### Pitfall 5: Race Conditions in Optimistic Updates

**What goes wrong:** User clicks download on two songs rapidly. Second click happens before first completes. Both mutations trigger, causing UI flicker or duplicate downloads.

**Why it happens:** React Query mutations aren't properly isolated. UI doesn't disable buttons during pending state.

**How to avoid:** Disable action buttons when mutation is pending. Use `mutation.isPending` to show loading state. Consider `{ throwOnError: true }` to prevent silent failures.

**Warning signs:** Double downloads, UI flickering, inconsistent button states, error toasts appearing unexpectedly.

**Source:** [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

### Pitfall 6: Unmounted Audio Player Cleanup

**What goes wrong:** User expands song card to play audio, then navigates away. Audio continues playing in background, or keyboard controls trigger playback on unmounted component.

**Why it happens:** react-h5-audio-player doesn't auto-pause on unmount. Component cleanup doesn't explicitly stop playback.

**How to avoid:** Add cleanup logic to pause audio and revoke blob URLs on unmount. Use `<AudioPlayer ... onPlay={() => { /* Track active player */ }} />` to manage global playback state.

**Warning signs:** Audio playing after navigating away, console warnings about state updates on unmounted component, keyboard shortcuts triggering hidden players.

**Source:** [react-h5-audio-player unmount issue](https://github.com/lhz516/react-h5-audio-player/issues/33)

## Code Examples

Verified patterns from official sources:

### React Query Hook for Song History
```typescript
// hooks/useSongHistory.ts
import { useQuery } from '@tanstack/react-query'

export function useSongHistory(page: number = 1) {
  return useQuery({
    queryKey: ['songs', 'history', page],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/songs?page=${page}`)
      if (!res.ok) throw new Error('Failed to fetch songs')
      return res.json()
    },
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    refetchOnWindowFocus: false,
  })
}

// Usage in component
export function SongsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useSongHistory(page)

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState />

  return (
    <>
      <SongHistoryList songs={data.songs} />
      <Pagination
        page={page}
        pageCount={data.pageCount}
        onPageChange={setPage}
      />
    </>
  )
}
```

### Order History with Date Formatting
```typescript
// hooks/useOrderHistory.ts
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

export function useOrderHistory() {
  return useQuery({
    queryKey: ['orders', 'history'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/orders')
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json()
    },
    select: (data) => data.map(order => ({
      ...order,
      formattedDate: format(new Date(order.created_at), 'MMM d, yyyy'),
      formattedAmount: `£${(order.amount / 100).toFixed(2)}`,
    })),
  })
}

// OrderHistoryTable component
export function OrderHistoryTable() {
  const { data: orders, isLoading } = useOrderHistory()

  if (isLoading) return <Skeleton className="h-64 w-full" />

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your purchase history will appear here."
      />
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Date</th>
          <th>Recipient</th>
          <th>Type</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>{order.formattedDate}</td>
            <td>{order.customizations.recipient_name}</td>
            <td className="capitalize">{order.order_type}</td>
            <td>{order.formattedAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Upcoming Occasions with date-fns
```typescript
// hooks/useOccasions.ts
import { useQuery } from '@tanstack/react-query'
import { isAfter, isBefore, addDays, format } from 'date-fns'

export function useOccasions() {
  return useQuery({
    queryKey: ['occasions'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/occasions')
      if (!res.ok) throw new Error('Failed to fetch occasions')
      return res.json()
    },
    select: (data) => {
      const now = new Date()
      const futureThreshold = addDays(now, 90) // Next 90 days

      return data
        .filter(occ => occ.occasion_date) // Only orders with dates
        .map(occ => {
          const occDate = new Date(occ.occasion_date)
          const daysUntil = Math.ceil((occDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

          return {
            ...occ,
            occasion_date: occDate,
            daysUntil,
            isUpcoming: isAfter(occDate, now) && isBefore(occDate, futureThreshold),
            formattedDate: format(occDate, 'MMM d, yyyy'),
          }
        })
        .filter(occ => occ.isUpcoming)
        .sort((a, b) => a.daysUntil - b.daysUntil)
    },
  })
}

// OccasionsList component
export function OccasionsList() {
  const { data: occasions, isLoading } = useOccasions()

  if (isLoading) return <Skeleton className="h-48 w-full" />

  if (!occasions || occasions.length === 0) {
    return (
      <EmptyState
        title="No upcoming occasions"
        description="Track special dates to get reminded when they're coming up."
      />
    )
  }

  return (
    <div className="space-y-3">
      {occasions.map(occ => (
        <OccasionCard
          key={occ.id}
          recipientName={occ.customizations.recipient_name}
          occasion={occ.customizations.occasion}
          date={occ.formattedDate}
          daysUntil={occ.daysUntil}
        />
      ))}
    </div>
  )
}
```

### Download Mutation with Blob Cleanup
```typescript
// hooks/useDownloadSong.ts
import { useMutation } from '@tanstack/react-query'

export function useDownloadSong() {
  return useMutation({
    mutationFn: async (songId: string) => {
      const res = await fetch(`/api/songs/${songId}/download`)
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const filename = res.headers.get('content-disposition')
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'song.mp3'

      return { blob, filename }
    },
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url) // Clean up immediately after download
    },
  })
}

// Usage in SongCard
export function SongCard({ song }) {
  const downloadMutation = useDownloadSong()

  return (
    <button
      onClick={() => downloadMutation.mutate(song.id)}
      disabled={downloadMutation.isPending}
    >
      {downloadMutation.isPending ? 'Downloading...' : 'Download'}
    </button>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Class components with lifecycle methods | Functional components with hooks | React 16.8 (2019) | Simpler code, better composition, easier testing |
| Manual fetch + useState/useEffect | React Query / TanStack Query | Mainstream ~2021 | Automatic caching, deduplication, background refetching |
| Client-side pagination for all lists | Server-side pagination by default | Industry shift ~2023 | Better performance, lower memory, scales to large datasets |
| Storing signed URLs in database | Generate on-demand via API | Security best practice since ~2020 | Prevents broken links from expired URLs, better security |
| `auth.uid() = user_id` in RLS | `(select auth.uid()) = user_id` | Supabase best practice ~2023 | 100x+ performance improvement via initPlan caching |
| react-table v7 | TanStack Table v8 (headless) | Released 2022 | Full control over markup/styles, better TypeScript, smaller bundle |

**Deprecated/outdated:**
- **Redux for server state:** React Query has replaced Redux for API data fetching in most modern apps. Redux is still used for global UI state, but server state (API data) belongs in React Query.
- **SWR over React Query:** SWR is still valid but React Query has become the industry standard due to better mutation support, prefetching, and devtools. React Query v5 (2024) added even better Next.js 15 RSC support.
- **Client-side-only data fetching:** With Next.js 15 App Router, hybrid approach (RSC initial fetch + React Query hydration) is preferred over purely client-side fetching.

## Open Questions

1. **TanStack Table adoption**
   - What we know: TanStack Table v8 is the industry standard for complex tables with sorting/filtering/pagination
   - What's unclear: Whether v1 dashboard needs sortable tables or simple lists are sufficient
   - Recommendation: Start with simple lists. Add TanStack Table in v2 if users request sorting/filtering (YAGNI principle).

2. **Occasion reminder UI placement**
   - What we know: Users need to see upcoming occasions (DASH-05 requirement)
   - What's unclear: Whether occasions deserve dedicated page or should be widget on main dashboard
   - Recommendation: Start with dedicated `/dashboard/occasions` page. Can add dashboard widget in v2 if users want at-a-glance view.

3. **Pagination page size**
   - What we know: Offset pagination is standard, page size should balance UX and performance
   - What's unclear: Optimal page size for song/order history (10? 20? 25?)
   - Recommendation: Default to 10 items per page (mobile-friendly, fast queries). Allow user preference in v2 if needed.

## Sources

### Primary (HIGH confidence)
- [TanStack Query Docs - Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)
- [TanStack Query Docs - Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Pagination in React](https://makerkit.dev/blog/tutorials/pagination-supabase-react)
- [Supabase createSignedUrl](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl)
- [TanStack Table Docs](https://tanstack.com/table/latest)
- [shadcn/ui Data Table](https://ui.shadcn.com/docs/components/radix/data-table)

### Secondary (MEDIUM confidence)
- [Next.js 15 Advanced Patterns](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/)
- [React Server Components + TanStack Query](https://dev.to/krish_kakadiya_5f0eaf6342/react-server-components-tanstack-query-the-2026-data-fetching-power-duo-you-cant-ignore-21fj)
- [Mastering React Query in Next.js 15](https://fygs.dev/en/blog/mastering-react-query-nextjs15)
- [Next.js Dashboard App Tutorial - Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination)
- [The Pagination Pitfall](https://dev.to/ozkanpakdil/the-pagination-pitfall-a-react-spring-boot-cautionary-tale-c6i)
- [Improved lazy loading for audio](https://www.sitelint.com/blog/improved-lazy-loading-for-image-video-and-audio)
- [MDN Lazy Loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading)
- [Empty state UX examples](https://www.eleken.co/blog-posts/empty-state-ux)
- [Carbon Design System - Loading Patterns](https://carbondesignsystem.com/patterns/loading-pattern/)
- [Carbon Design System - Empty States](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- [react-h5-audio-player GitHub](https://github.com/lhz516/react-h5-audio-player)
- [react-h5-audio-player unmount issue](https://github.com/lhz516/react-h5-audio-player/issues/33)

### Tertiary (LOW confidence)
- [SaaS Dashboard UI Examples](https://www.saasframe.io/categories/dashboard) - Design inspiration only, not technical guidance
- [Dribbble Order History](https://dribbble.com/tags/order-history) - Design patterns, verify with user testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - React Query, Supabase, react-h5-audio-player all verified via official docs and existing codebase
- Architecture: HIGH - Hybrid RSC + React Query pattern confirmed via official Next.js 15 and TanStack Query docs, RLS performance pattern from Supabase official troubleshooting guide
- Pitfalls: HIGH - All pitfalls verified via official docs (Supabase RLS perf, blob URL cleanup) or well-documented community issues (pagination, signed URL expiry)

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days - stable ecosystem, React Query v5 and Next.js 15 are current stable versions)
