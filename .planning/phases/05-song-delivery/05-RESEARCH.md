# Phase 5: Song Delivery - Research

**Researched:** 2026-02-08
**Domain:** Audio streaming, file downloads, Next.js dynamic routing
**Confidence:** HIGH

## Summary

Phase 5 implements song delivery through in-browser streaming and MP3 downloads. The existing infrastructure already includes protected audio preview with signed URLs, React Query for data fetching, and Framer Motion for animations. The phase primarily needs to convert "preview-only" restrictions to "full playback + download" capabilities.

The standard approach uses native HTML5 `<audio>` elements wrapped in React components, served through Next.js API routes that proxy Supabase Storage signed URLs. For downloads, the same signed URL approach works with Content-Disposition headers set to "attachment". Custom audio player UI libraries like `react-h5-audio-player` provide professional controls while avoiding hand-rolling seekbar logic.

**Primary recommendation:** Reuse existing preview infrastructure (`/api/orders/[orderId]/variants/[variantId]/preview`) with a new download-enabled endpoint, implement song page with dynamic route (`/song/[id]`), use `react-h5-audio-player` for consistent UI, and ensure proper blob URL cleanup to prevent memory leaks.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| HTML5 Audio API | Native | Audio playback, streaming | Baseline browser feature since 2015, handles progressive download natively |
| Next.js 14 App Router | 14.2.0 | Dynamic routes, API routes | Already in project, used for `/order/[id]` pattern |
| React Query | 5.90.20 | Data fetching, polling | Already in project (`useGenerationStatus`), proven for audio metadata |
| Framer Motion | 11.18.2 | Page transitions | Already in project, used in Phase 4 swipe interface |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-h5-audio-player | ^3.9.x | Pre-built audio controls | Custom UI needed beyond browser defaults, seekbar, time display |
| @tanstack/react-query | 5.90.20 | Server state management | Fetching song metadata, refetch on download completion |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-h5-audio-player | Build custom controls | Custom = full control but must handle seekbar math, time formatting, touch/keyboard events |
| react-h5-audio-player | react-audio-player | Simpler wrapper but no built-in styled controls |
| Proxied downloads | Direct signed URLs | Direct URLs expose signed URL in browser (already avoided in Phase 4) |

**Installation:**
```bash
npm install react-h5-audio-player
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── song/[id]/           # Dedicated song page
│   │   └── page.tsx         # Server component for initial metadata, client for player
│   └── api/
│       └── orders/[id]/
│           └── variants/[variantId]/
│               ├── preview/          # Existing (Phase 4)
│               └── download/         # New: Content-Disposition: attachment
├── components/
│   └── SongPlayer.tsx       # Client component with react-h5-audio-player
└── lib/
    └── hooks/
        └── useSongMetadata.ts  # React Query hook for song details
```

### Pattern 1: Server Component for Initial Data, Client Component for Audio
**What:** Song page uses Next.js Server Component to fetch metadata at render time, passes to client component for audio playback
**When to use:** SEO matters (song title, artist in HTML), initial render performance critical
**Example:**
```typescript
// app/song/[id]/page.tsx (Server Component)
import { createServerSupabaseClient } from '@/lib/supabase'
import { SongPlayer } from '@/components/SongPlayer'

export default async function SongPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  // Fetch selected variant for this song
  const { data: variant } = await supabase
    .from('song_variants')
    .select('*, orders(recipient_name, occasion_type, created_at)')
    .eq('id', params.id)
    .eq('selected', true)
    .single()

  return <SongPlayer variant={variant} />
}
```

### Pattern 2: Blob URL Management with Cleanup
**What:** Fetch audio as blob, create object URL, revoke on unmount to prevent memory leaks
**When to use:** When proxying audio through API routes (Phase 4 preview pattern)
**Example:**
```typescript
// Source: React useEffect cleanup best practices
useEffect(() => {
  let objectUrl: string | null = null

  async function loadAudio() {
    const response = await fetch(`/api/orders/${orderId}/variants/${variantId}/preview`)
    const blob = await response.blob()
    objectUrl = URL.createObjectURL(blob)
    setAudioUrl(objectUrl)
  }

  loadAudio()

  // Cleanup function to prevent memory leaks
  return () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }
  }
}, [orderId, variantId])
```

### Pattern 3: Download Endpoint with Content-Disposition
**What:** API route returns audio file with "attachment" disposition to trigger browser download
**When to use:** User-initiated download (button click)
**Example:**
```typescript
// app/api/orders/[id]/variants/[variantId]/download/route.ts
export async function GET(request: NextRequest, { params }) {
  // Auth check (same as preview endpoint)
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch signed URL from Supabase Storage
  const { data: signedUrlData } = await supabase
    .storage
    .from('songs')
    .createSignedUrl(variant.storage_path, 3600) // 1 hour expiry

  const audioResponse = await fetch(signedUrlData.signedUrl)
  const audioBuffer = await audioResponse.arrayBuffer()

  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="songswipe-${recipientName}.mp3"`,
      'Cache-Control': 'private, no-cache',
    },
  })
}
```

### Pattern 4: Dynamic Route with ID Validation
**What:** Use Next.js dynamic segments for `/song/[id]`, validate UUID format
**When to use:** User-facing song pages
**Example:**
```typescript
// app/song/[id]/page.tsx
export default async function SongPage({ params }: { params: { id: string } }) {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(params.id)) {
    notFound()
  }

  // Fetch song...
}
```

### Anti-Patterns to Avoid
- **Storing signed URLs in state long-term:** Signed URLs expire (10 min in Phase 4 preview). Generate on-demand or refresh before expiry.
- **Not revoking blob URLs:** Creates memory leaks. Always use cleanup function in useEffect.
- **Using controlsList="nodownload" as security:** Limited browser support (Chrome-only), easily bypassed. Phase 4's proxy approach is better.
- **Fetching audio on every render:** Use React Query caching, store blob URLs in ref or state with proper lifecycle management.
- **Missing loadedmetadata event handler:** Audio duration is NaN until metadata loads. Show loading state until `loadedmetadata` fires.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio seekbar | Custom range input + time calculations | react-h5-audio-player or HTMLAudioElement.currentTime | Touch targets, keyboard nav, time formatting, buffered ranges visualization |
| Time formatting (mm:ss) | String manipulation | react-h5-audio-player built-in or library function | Edge cases (hours, negative time, NaN) |
| Progressive download indicator | Custom buffered range logic | react-h5-audio-player or HTMLMediaElement.buffered API | TimeRanges API is complex, need to handle gaps |
| Audio metadata loading | Custom fetch + parsing | HTMLAudioElement loadedmetadata event | Browser handles codec detection, duration extraction |
| Download progress tracking | XMLHttpRequest + progress events | Fetch API with streams (or skip) | Not critical for user experience, adds complexity |

**Key insight:** Audio playback has many edge cases (metadata loading, seeking before load, buffering, ended state). Libraries like `react-h5-audio-player` have solved these. Custom controls require handling touch events, keyboard shortcuts, ARIA attributes, and cross-browser quirks.

## Common Pitfalls

### Pitfall 1: Memory Leaks from Unreleased Blob URLs
**What goes wrong:** Creating object URLs with `URL.createObjectURL()` without calling `URL.revokeObjectURL()` causes memory leaks as the browser retains the blob in memory
**Why it happens:** React components unmount but cleanup functions are missing or incomplete
**How to avoid:** Always return a cleanup function from useEffect that revokes object URLs
**Warning signs:** Browser memory usage grows over time, DevTools shows increasing blob: URLs in Resources tab

### Pitfall 2: Accessing duration Before Metadata Loads
**What goes wrong:** `audioElement.duration` returns `NaN` if accessed before the `loadedmetadata` event fires, breaking time display and seekbar
**Why it happens:** Developers assume duration is immediately available after setting `src`
**How to avoid:** Wait for `loadedmetadata` event, show loading state until fired
**Warning signs:** Duration displays as "NaN:NaN", seekbar shows incorrect range, console errors about invalid time values

### Pitfall 3: Autoplay Blocked by Browser Policy
**What goes wrong:** Attempting to call `audioElement.play()` on page load fails silently or throws errors in modern browsers
**Why it happens:** Browsers require user gesture (click, tap) before playing audible audio to prevent annoying auto-playing ads
**How to avoid:** Only call `play()` in response to user interaction (button click), handle Promise rejection from `play()`
**Warning signs:** Audio doesn't start playing, console shows "DOMException: play() failed because the user didn't interact with the document first"

### Pitfall 4: Signed URL Expiry During Playback
**What goes wrong:** Audio stops mid-playback when signed URL expires (10 min in Phase 4 preview, 1 hour for download)
**Why it happens:** Long songs or paused playback exceeds signed URL expiry window
**How to avoid:** Set signed URL expiry longer than max song duration + reasonable pause time (suggest 2 hours), or regenerate URL on error event
**Warning signs:** Audio playback fails after X minutes, console shows 403/404 errors from storage endpoint

### Pitfall 5: Race Conditions with Audio State
**What goes wrong:** Setting state inside audio event handlers causes stale closures, leading to incorrect play/pause state
**Why it happens:** Event listeners capture state at creation time, don't see updates unless re-registered
**How to avoid:** Use refs for state that event listeners need to read, or use libraries like react-h5-audio-player that handle this
**Warning signs:** Play button shows wrong icon, audio plays but UI shows paused, multiple clicks needed to toggle state

### Pitfall 6: Not Handling the `ended` Event
**What goes wrong:** Audio reaches end but UI still shows "playing" state, seekbar stuck at 100%
**Why it happens:** Developers listen to `pause` but not `ended` event
**How to avoid:** Always handle `ended` event to reset UI state, move seekbar back to start
**Warning signs:** Play button stuck in pause icon after song finishes, replay requires page refresh

## Code Examples

Verified patterns from official sources:

### Using react-h5-audio-player
```typescript
// Source: https://github.com/lhz516/react-h5-audio-player
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'

function SongPlayer({ audioUrl }: { audioUrl: string }) {
  return (
    <AudioPlayer
      src={audioUrl}
      onPlay={(e) => console.log('Playing')}
      onEnded={() => console.log('Song finished')}
      customAdditionalControls={[]} // Remove extra controls
      showJumpControls={false}
      customProgressBarSection={[
        'PROGRESS_BAR',
      ]}
      customControlsSection={[
        'MAIN_CONTROLS',
        'VOLUME_CONTROLS',
      ]}
      layout="horizontal"
    />
  )
}
```

### Dynamic Route with generateMetadata for SEO
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes
import { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const song = await fetchSong(params.id)

  return {
    title: `${song.recipient_name}'s Song | SongSwipe`,
    description: `Personalized ${song.occasion_type} song created with SongSwipe`,
  }
}
```

### Supabase Signed URL Generation
```typescript
// Source: https://supabase.com/docs/reference/javascript/storage-from-createsignedurl
const { data, error } = await supabase
  .storage
  .from('songs')
  .createSignedUrl('path/to/song.mp3', 7200) // 2 hours

if (data) {
  console.log('Signed URL:', data.signedUrl)
  console.log('Expires at:', data.expiresAt)
}
```

### React Query Hook for Song Metadata
```typescript
// Source: Existing useGenerationStatus pattern in codebase
import { useQuery } from '@tanstack/react-query'

interface SongMetadata {
  id: string
  recipient_name: string
  occasion_type: string
  created_at: string
  storage_path: string
  duration_ms: number
}

export function useSongMetadata(songId: string) {
  return useQuery<SongMetadata>({
    queryKey: ['song-metadata', songId],
    queryFn: async () => {
      const response = await fetch(`/api/songs/${songId}`)
      if (!response.ok) throw new Error('Failed to fetch song')
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom audio controls from scratch | Use react-h5-audio-player or native controls | 2020-2022 | Reduces bugs, improves accessibility, faster development |
| Expose signed URLs to client | Proxy through API routes | 2023+ (security-conscious apps) | Prevents URL extraction via DevTools |
| Store signed URLs in database | Generate on-demand | 2021+ | Reduces stale URL bugs, simpler DB schema |
| Class components with lifecycle methods | Hooks with useEffect cleanup | 2019+ (React 16.8) | Simpler code, easier cleanup logic |

**Deprecated/outdated:**
- **controlsList="nodownload"**: Chrome-only, not baseline browser feature, unreliable for protection
- **Flash-based audio players**: Obsolete, replaced by HTML5 Audio API in 2015
- **Web Audio API for simple playback**: Overkill, must download entire file before playing (use HTML5 `<audio>` instead)

## Open Questions

1. **Should we support offline playback (Service Worker caching)?**
   - What we know: Service Workers can cache audio files for offline access
   - What's unclear: Business requirement (do users need offline replay?), storage quota limits
   - Recommendation: Defer to Phase 8 (User Dashboard) as "replay" feature, not MVP

2. **Should download endpoint validate "selected" status?**
   - What we know: Only selected variant should be downloadable (business logic)
   - What's unclear: User expectation (can they download non-selected variants later?)
   - Recommendation: Enforce `selected=true` in download endpoint, document in PLAN

3. **What signed URL expiry for download vs streaming?**
   - What we know: Phase 4 uses 10 min for preview, songs are ~60-90 seconds
   - What's unclear: User behavior (pause for 30 min, resume?)
   - Recommendation: 2 hours for both (covers pause/resume, not too long for security)

## Sources

### Primary (HIGH confidence)
- MDN Web Docs: [HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement) - Browser API reference
- MDN Web Docs: [HTMLMediaElement.controlsList](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList) - Browser compatibility
- Next.js Official Docs: [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) - File conventions
- Next.js Official Docs: [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) - API route patterns
- Supabase Docs: [JavaScript createSignedUrl](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl) - Storage API
- react-h5-audio-player: [GitHub Repository](https://github.com/lhz516/react-h5-audio-player) - Component API
- react-h5-audio-player: [NPM Package](https://www.npmjs.com/package/react-h5-audio-player) - Installation guide

### Secondary (MEDIUM confidence)
- LogRocket Blog: [Building an Audio Player in React](https://blog.logrocket.com/building-audio-player-react/) - React patterns verified with MDN
- Code Concisely: [Download File from Next.js App Router](https://www.codeconcisely.com/posts/nextjs-app-router-api-download-file/) - Content-Disposition pattern
- Eric Burel: [Streaming Files from Next.js Route Handlers](https://www.ericburel.tech/blog/nextjs-stream-files) - Streaming patterns
- Medium (AbuBakar Memon): [Memory Leaks in React.js](https://medium.com/@abubakarmemon/memory-leaks-in-react-js-b611745c5f08) - Cleanup patterns verified with React docs
- freeCodeCamp: [Fix Memory Leaks in React Applications](https://www.freecodecamp.org/news/fix-memory-leaks-in-react-apps/) - useEffect cleanup

### Tertiary (LOW confidence)
- GeeksforGeeks: [Remove Download Option from Audio Tag](https://www.geeksforgeeks.org/html/how-to-remove-the-download-option-from-audio-tag-in-html5/) - controlsList examples (not authoritative)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project or well-documented baseline features
- Architecture: HIGH - Patterns verified in existing codebase (Phase 4 preview, React Query setup)
- Pitfalls: MEDIUM-HIGH - Memory leak and event handling verified with React/MDN docs, some from developer blogs

**Research date:** 2026-02-08
**Valid until:** 2026-04-08 (60 days - stable technology stack, HTML5 Audio and React patterns are mature)
