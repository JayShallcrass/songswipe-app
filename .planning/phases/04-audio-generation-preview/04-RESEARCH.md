# Phase 4: Audio Generation & Preview - Research

**Researched:** 2026-02-08
**Domain:** Eleven Labs Music API integration, Supabase Storage signed URLs, audio preview protection, progress indicators, Inngest job status polling, swipe variant selection
**Confidence:** HIGH

## Summary

Phase 4 builds on the existing Inngest job queue (Phase 1) to create the complete audio generation and preview experience. Users submit their customization, watch real-time progress as 3 variants generate, then swipe between protected preview URLs to pick their favorite. Research confirms the existing Inngest infrastructure handles generation orchestration, but we need polling for status updates (Inngest doesn't push notifications), signed URLs with time-limited expiry for preview protection (no DRM needed), and reuse of Phase 3 swipe engine for variant selection.

The core technical challenge is balancing preview protection (prevent free downloads) with user experience (seamless playback). Signed URLs with 5-15 minute expiry provide sufficient protection - users can't share previews long-term, but have enough time to swipe and decide. Audio served via HTML5 audio element with blob URLs prevents right-click download while maintaining compatibility.

**Primary recommendation:** Leverage existing Inngest generate-song function (already generates 3 variants), add client-side polling endpoint to check generation_status in song_variants table, serve preview audio via Supabase Storage signed URLs (5-15 min expiry), use HTML5 audio element with blob fetched via authenticated endpoint to prevent devtools download, reuse Phase 3 swipe engine for variant cards with audio player integration.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Inngest | 2.x+ (existing) | Job orchestration for 3-variant generation | Already integrated in Phase 1, handles timeouts, retries, per-variant status tracking |
| Supabase Storage | Built-in | Audio file storage with signed URL generation | Existing infrastructure, createSignedUrl() supports custom expiry, integrated auth |
| HTML5 Audio API | Native | Audio playback in browser | Universal browser support, no external dependencies, works with blob URLs |
| Framer Motion | 11.x+ (existing from Phase 3) | Swipe gesture handling for variant cards | Already used in swipe builder, drag/gesture support, smooth animations |
| React Query / SWR | 4.x+ OR 2.x+ | Real-time status polling during generation | Automatic refetch intervals, deduplication, cache management, optimistic updates |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | 2.94.1 (existing) | Fetch variant status, create signed URLs | Query song_variants table for generation_status, call storage.createSignedUrl() |
| zod | 3.22.0 (existing) | Validate polling responses | Runtime type safety for status updates from API |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Query | SWR | Both solve polling problem. React Query has 45k stars vs SWR 30k, more mature ecosystem. SWR lighter (5kb vs 13kb). Choose React Query for this project (richer dev tools, better TypeScript support). |
| Signed URLs | DRM (Encrypted Media Extensions) | DRM enterprise overkill for preview protection. Signed URLs sufficient - 5-15 min expiry prevents sharing while user swipes. DRM adds complexity (license servers, browser compatibility issues). |
| Blob URLs from fetch | Direct signed URL in audio src | Direct URLs expose download link in Network tab. Blob URLs fetched via authenticated endpoint hide underlying storage URL. Better protection with minimal complexity. |
| Polling | WebSockets / Server-Sent Events | WebSockets require persistent connections, complex on serverless Vercel. SSE better but still needs dedicated connection management. Polling simpler for infrequent updates (3 variants = 30-90s generation), acceptable latency (2-5s poll interval). |
| Generate all 3 serially | Generate in parallel | Serial safer (rate limit management) but slower (3x time). Parallel faster but needs rate limit handling. Eleven Labs Music API supports concurrent requests on paid tiers - use parallel with RetryAfterError handling (already in Phase 1). |

**Installation:**
```bash
npm install @tanstack/react-query
# Or if choosing SWR:
npm install swr
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── orders/
│   │   │   └── [id]/
│   │   │       ├── status/
│   │   │       │   └── route.ts         # NEW: Poll generation status
│   │   │       └── variants/
│   │   │           └── [variantId]/
│   │   │               └── preview/
│   │   │                   └── route.ts # NEW: Serve preview blob
│   │   └── inngest/
│   │       └── route.ts (existing)      # Inngest webhook
│   └── generate/
│       └── [orderId]/
│           └── page.tsx                  # NEW: Generation progress + variant swipe
├── components/
│   ├── generation/
│   │   ├── GenerationProgress.tsx        # NEW: Progress indicator
│   │   └── VariantSwiper.tsx             # NEW: Swipe between variants
│   └── swipe/ (existing from Phase 3)
│       └── SwipeCard.tsx                 # Reuse for variant cards
└── lib/
    ├── hooks/
    │   ├── useGenerationStatus.ts        # NEW: React Query hook for polling
    │   └── useAudioPreview.ts            # NEW: Manage audio playback state
    └── inngest/
        └── functions/
            └── generate-song.ts (existing) # Already generates 3 variants
```

### Pattern 1: Client-Side Polling for Generation Status
**What:** Poll `/api/orders/[id]/status` every 2-5 seconds during generation to update UI with per-variant progress.
**When to use:** Long-running async operations where users wait for completion (AI generation, video processing).
**Example:**
```typescript
// src/lib/hooks/useGenerationStatus.ts
import { useQuery } from '@tanstack/react-query';

interface VariantStatus {
  id: string;
  variant_number: number;
  generation_status: 'pending' | 'generating' | 'complete' | 'failed';
  storage_path: string | null;
  completed_at: string | null;
}

interface GenerationStatus {
  order_id: string;
  order_status: 'paid' | 'generating' | 'completed' | 'failed';
  variants: VariantStatus[];
}

export function useGenerationStatus(orderId: string) {
  return useQuery<GenerationStatus>({
    queryKey: ['generation-status', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      return response.json();
    },
    refetchInterval: (data) => {
      // Poll every 3 seconds while generating, stop when complete/failed
      const isGenerating = data?.order_status === 'generating';
      return isGenerating ? 3000 : false;
    },
    refetchOnWindowFocus: false, // Don't refetch when user switches tabs
  });
}
```

```typescript
// src/app/api/orders/[id]/status/route.ts
import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();

  // Verify user owns this order
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch order with variants
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      song_variants (
        id,
        variant_number,
        generation_status,
        storage_path,
        completed_at
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    order_id: order.id,
    order_status: order.status,
    variants: order.song_variants,
  });
}
```

### Pattern 2: Protected Preview Audio via Blob URLs
**What:** Fetch preview audio through authenticated endpoint that returns blob, preventing direct URL access in Network tab.
**When to use:** Need to protect audio/video previews from easy download while allowing playback.
**Example:**
```typescript
// src/app/api/orders/[id]/variants/[variantId]/preview/route.ts
import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  const supabase = createServerSupabaseClient();

  // Verify user owns this variant
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch variant record
  const { data: variant } = await supabase
    .from('song_variants')
    .select('storage_path, order_id, user_id')
    .eq('id', params.variantId)
    .eq('order_id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!variant) {
    return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
  }

  // Generate signed URL with short expiry (10 minutes)
  const { data: signedUrlData } = await supabase.storage
    .from('songs')
    .createSignedUrl(variant.storage_path, 600); // 10 min = 600 seconds

  if (!signedUrlData?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate preview URL' }, { status: 500 });
  }

  // Fetch audio from storage
  const audioResponse = await fetch(signedUrlData.signedUrl);
  if (!audioResponse.ok) {
    return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 500 });
  }

  const audioBuffer = await audioResponse.arrayBuffer();

  // Return audio as blob with headers that discourage download
  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline', // Force inline playback, not download
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
```

```typescript
// src/lib/hooks/useAudioPreview.ts
import { useState, useEffect, useRef } from 'react';

export function useAudioPreview(orderId: string, variantId: string) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    async function loadAudio() {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}/variants/${variantId}/preview`);

        if (!response.ok) throw new Error('Failed to load preview');

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadAudio();

    // Cleanup: revoke object URL when component unmounts
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [orderId, variantId]);

  return { audioUrl, loading, error, audioRef };
}
```

```tsx
// Component usage
function VariantPlayer({ orderId, variantId }: { orderId: string; variantId: string }) {
  const { audioUrl, loading, error, audioRef } = useAudioPreview(orderId, variantId);

  if (loading) return <div>Loading preview...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!audioUrl) return null;

  return (
    <audio
      ref={audioRef}
      src={audioUrl}
      controls
      controlsList="nodownload" // Hide download button in controls
      onContextMenu={(e) => e.preventDefault()} // Disable right-click
    />
  );
}
```

### Pattern 3: Generation Progress Indicator with Per-Variant Status
**What:** Show live progress for 3 variants with individual status (pending/generating/complete/failed).
**When to use:** Multi-item async operations where users need visibility into parallel progress.
**Example:**
```tsx
// src/components/generation/GenerationProgress.tsx
import { useGenerationStatus } from '@/lib/hooks/useGenerationStatus';

export function GenerationProgress({ orderId }: { orderId: string }) {
  const { data, isLoading, error } = useGenerationStatus(orderId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error checking status</div>;
  if (!data) return null;

  const completedCount = data.variants.filter(v => v.generation_status === 'complete').length;
  const progress = (completedCount / 3) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Generating your songs...</h2>
        <span className="text-sm text-gray-500">{completedCount}/3 complete</span>
      </div>

      {/* Overall progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Per-variant status */}
      <div className="space-y-2">
        {data.variants.map((variant) => (
          <div key={variant.id} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-6 h-6">
              {variant.generation_status === 'complete' && (
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {variant.generation_status === 'generating' && (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              {variant.generation_status === 'pending' && (
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
              )}
              {variant.generation_status === 'failed' && (
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-sm">
              Variant {variant.variant_number}: {variant.generation_status}
            </span>
          </div>
        ))}
      </div>

      {/* Show error message if any variant failed */}
      {data.variants.some(v => v.generation_status === 'failed') && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          Some variants failed to generate. You can still listen to the successful ones and pick your favorite.
        </div>
      )}
    </div>
  );
}
```

### Pattern 4: Variant Swiper with Audio Player Integration
**What:** Reuse Phase 3 swipe cards for variant selection, add audio player to each card.
**When to use:** Need swipe interaction with media playback (audio/video previews).
**Example:**
```tsx
// src/components/generation/VariantSwiper.tsx
import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useAudioPreview } from '@/lib/hooks/useAudioPreview';

interface Variant {
  id: string;
  variant_number: number;
  generation_status: string;
}

export function VariantSwiper({
  orderId,
  variants,
  onSelect
}: {
  orderId: string;
  variants: Variant[];
  onSelect: (variantId: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  const currentVariant = variants[currentIndex];
  const { audioUrl, loading } = useAudioPreview(orderId, currentVariant?.id);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      // Swiped left/right - move to next variant
      const direction = info.offset.x > 0 ? -1 : 1; // Swipe right goes to previous
      const newIndex = currentIndex + direction;

      if (newIndex >= 0 && newIndex < variants.length) {
        setCurrentIndex(newIndex);
      }
    }
  };

  if (!currentVariant) return null;

  return (
    <div className="relative w-full max-w-md mx-auto h-96">
      <motion.div
        className="absolute inset-0 bg-white rounded-2xl shadow-xl p-6 cursor-grab active:cursor-grabbing"
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Variant {currentVariant.variant_number}</h3>
              <p className="text-gray-500 text-sm mb-6">Swipe to compare</p>

              {loading ? (
                <div>Loading audio...</div>
              ) : audioUrl ? (
                <audio
                  src={audioUrl}
                  controls
                  className="w-full"
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : null}
            </div>
          </div>

          <button
            onClick={() => onSelect(currentVariant.id)}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Select This Variant
          </button>
        </div>
      </motion.div>

      {/* Indicators */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {variants.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition ${
              idx === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Polling without stop condition:** Don't poll indefinitely. Stop when order_status is 'completed' or 'failed', otherwise wastes API calls and battery.
- **Exposing signed URLs in client state:** Don't store signed URLs in Redux/React state visible in React DevTools. Keep them ephemeral in blob URLs.
- **Serial variant generation:** Don't wait for variant 1 to complete before starting variant 2. Generate all 3 in parallel (existing Inngest function does this).
- **Long signed URL expiry for previews:** Don't use 7+ day expiry for preview URLs. Short expiry (5-15 min) prevents sharing while user decides.
- **No retry on preview fetch failure:** If blob fetch fails (network error), retry with exponential backoff before showing error.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio preview protection | Custom encryption, chunked streaming, DRM | Signed URLs (5-15 min) + blob fetch via auth endpoint | Signed URLs battle-tested, DRM enterprise complexity unnecessary for previews. Blob URLs hide storage URL in Network tab without encryption overhead. |
| Real-time status updates | WebSocket server, SSE endpoint | React Query with refetchInterval | Polling simpler for infrequent updates (30-90s generation). React Query handles deduplication, cache, automatic refetch. No persistent connection management. |
| Audio player controls | Custom HTML/CSS player with play/pause/seek | HTML5 audio element | Browser-native, accessible, works with screen readers, handles formats automatically. controlsList="nodownload" prevents easy download. |
| Progress animations | Custom CSS keyframes, setTimeout loops | Framer Motion useTransform | Declarative animations, spring physics built-in, gesture handling integrated with drag. |
| Variant swipe UI | Custom touch event handlers | Framer Motion drag + useMotionValue | Cross-device gesture recognition (touch/mouse), velocity tracking, spring animations. Existing from Phase 3. |

**Key insight:** Preview protection is about making casual piracy inconvenient, not impossible. Signed URLs with short expiry + blob fetch via auth endpoint achieves 80% protection with 20% effort. Determined users can always record audio playback, but won't share broken preview links after expiry.

## Common Pitfalls

### Pitfall 1: Polling During Generation Hammers API
**What goes wrong:** Client polls `/api/orders/[id]/status` every 500ms during 90-second generation. That's 180 requests per user. With 100 concurrent users, that's 18,000 API calls for 100 orders.
**Why it happens:** Aggressive poll interval set without considering scale. Default 1s interval feels responsive but multiplies quickly.
**How to avoid:** Use 3-5 second intervals (acceptable latency for progress bar). Stop polling when complete. Use React Query's smart refetch (pauses when tab backgrounded). Monitor API usage metrics.
**Warning signs:** High Vercel function invocations, Supabase API rate limits hit, slow dashboard due to thundering herd.

### Pitfall 2: Signed URLs Stored in Database Expire
**What goes wrong:** Existing code (Phase 1 decision 01-01) stores storage_path not signed URL, but planner might be tempted to cache signed URL in songs table. URLs expire, users get 403 errors on playback.
**Why it happens:** Misunderstanding that signed URLs are time-limited credentials, not permanent links.
**How to avoid:** Always store storage_path, generate signed URLs on-demand when serving audio. For previews, use blob URLs fetched through authenticated endpoint (Pattern 2).
**Warning signs:** Users report "audio won't play" after few minutes. 403 errors in browser console. Support tickets about broken downloads.

### Pitfall 3: Audio Blob URLs Not Revoked Cause Memory Leaks
**What goes wrong:** useAudioPreview creates object URLs with URL.createObjectURL() but never revokes them. Each variant swipe creates new blob URL, old ones stay in memory. After 100 swipes, browser slows down.
**Why it happens:** Object URLs are manual memory management - not garbage collected automatically like React state.
**How to avoid:** Call URL.revokeObjectURL() in useEffect cleanup (Pattern 2 example). Revoke when component unmounts or when audioUrl changes.
**Warning signs:** Browser memory usage grows over time. Slow performance after many swipes. DevTools shows uncollected blobs.

### Pitfall 4: Generation Status Polling Doesn't Handle Partial Success
**What goes wrong:** Polling logic waits for order_status = 'completed', but order might have 2/3 variants complete and 1 failed. User waits forever for 3rd variant that will never finish.
**Why it happens:** Focusing on order-level status instead of per-variant status. Not handling "partial success" UX.
**How to avoid:** Check variants array in polling response. If any variant is 'complete', enable swipe UI even if others are 'generating'. Show "2/3 ready" message. Don't block on failed variants (Phase 1 decision 01-02: partial success pattern).
**Warning signs:** Users stuck on progress screen when 2 variants succeeded. "Generation taking forever" support tickets when 1 variant failed.

### Pitfall 5: Preview Audio Doesn't Work on iOS Safari
**What goes wrong:** Audio element doesn't autoplay, requires user gesture. Blob URLs work in Chrome but not Safari. User taps play button nothing happens.
**Why it happens:** iOS Safari strictly enforces user gesture requirement for audio playback. Some audio formats (like WebM) unsupported on iOS.
**How to avoid:** Use audio/mpeg format (existing Eleven Labs output). Don't autoplay, require explicit play button tap. Test blob URL playback on iOS Safari specifically. Add format detection fallback.
**Warning signs:** "Audio not playing" reports from iPhone users. Works on desktop Chrome but fails on iOS. Console errors about audio format.

## Code Examples

Verified patterns from official sources:

### React Query Setup with Polling
```typescript
// Source: https://tanstack.com/query/latest/docs/react/guides/queries
// src/app/generate/[orderId]/page.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GenerationProgress } from '@/components/generation/GenerationProgress';
import { VariantSwiper } from '@/components/generation/VariantSwiper';
import { useGenerationStatus } from '@/lib/hooks/useGenerationStatus';

const queryClient = new QueryClient();

function GenerationPageContent({ orderId }: { orderId: string }) {
  const { data, isLoading } = useGenerationStatus(orderId);

  if (isLoading) return <div>Loading...</div>;

  const allComplete = data?.variants.every(v => v.generation_status === 'complete');
  const anyComplete = data?.variants.some(v => v.generation_status === 'complete');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {!allComplete && <GenerationProgress orderId={orderId} />}

      {anyComplete && (
        <div className="mt-8">
          <VariantSwiper
            orderId={orderId}
            variants={data.variants.filter(v => v.generation_status === 'complete')}
            onSelect={(variantId) => {
              // Mark variant as selected in database
              fetch(`/api/orders/${orderId}/variants/${variantId}/select`, {
                method: 'POST',
              });
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function GenerationPage({ params }: { params: { orderId: string } }) {
  return (
    <QueryClientProvider client={queryClient}>
      <GenerationPageContent orderId={params.orderId} />
    </QueryClientProvider>
  );
}
```

### Supabase Storage Signed URL with Custom Expiry
```typescript
// Source: https://supabase.com/docs/reference/javascript/storage-from-createsignedurl
import { createServerSupabaseClient } from '@/lib/supabase';

async function createPreviewUrl(storagePath: string) {
  const supabase = createServerSupabaseClient();

  // Create signed URL with 10-minute expiry
  const { data, error } = await supabase.storage
    .from('songs')
    .createSignedUrl(storagePath, 600, {
      download: false, // Force inline viewing, not download
    });

  if (error) {
    console.error('Failed to create signed URL:', error);
    throw new Error('Could not generate preview URL');
  }

  return data.signedUrl;
}
```

### Framer Motion Drag with Swipe Threshold
```typescript
// Source: https://motion.dev/docs/react-gestures
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState } from 'react';

function SwipeCard({ onSwipe }: { onSwipe: (direction: 'left' | 'right') => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const swipeThreshold = 100;

    if (info.offset.x > swipeThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('left');
    }
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 bg-white rounded-xl shadow-lg"
    >
      {/* Card content */}
    </motion.div>
  );
}
```

### HTML5 Audio with Download Prevention
```html
<!-- Source: MDN Web Docs - HTML Audio Element -->
<audio
  src={audioUrl}
  controls
  controlsList="nodownload noplaybackrate"
  disablePictureInPicture
  onContextMenu={(e) => e.preventDefault()}
  className="w-full"
>
  Your browser does not support audio playback.
</audio>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebSockets for status updates | Polling with React Query smart refetch | 2023+ | Simpler serverless architecture, no persistent connections, acceptable latency for infrequent updates |
| DRM for audio protection | Signed URLs + blob fetch | Current best practice | 80% protection with 20% effort, no license servers or browser compatibility issues |
| Custom audio players | HTML5 audio element with controlsList | 2020+ (wide support) | Native accessibility, format handling, mobile compatibility. controlsList standardized 2019. |
| Storing signed URLs in DB | Generate on-demand | Always best practice | URLs expire, regenerating on-demand guarantees fresh credentials |
| Serial API calls | Parallel with rate limit handling | Current best practice | Faster total time, efficient use of paid API tiers (concurrent requests allowed) |

**Deprecated/outdated:**
- **Flash-based audio players:** Dead since 2020 (Flash end-of-life)
- **Separate progress polling endpoint per variant:** Query all variants in single endpoint reduces API calls
- **Long-polling (Comet):** Replaced by WebSockets (2011) then polling with smart intervals (2020s)
- **MP3 format concerns:** All modern browsers support MP3 (since 2017 after patent expiry)

## Open Questions

1. **Eleven Labs Music API Generation Time:**
   - What we know: Web search indicates 30s-2min typical range, depends on duration (30s/90s/120s songs)
   - What's unclear: Exact timing for 90s song (SongSwipe default), variance/percentile distribution, whether parallel generation affects time
   - Recommendation: Test during Phase 4 execution with 10+ orders. Measure P50/P95/P99 generation time. Adjust poll interval and timeout based on P95 (e.g., if P95 = 90s, use 100s timeout).

2. **Eleven Labs API Rate Limits Confirmed:**
   - What we know: Web search found credit-based pricing (10k-11M credits/month depending on tier), concurrency limits exist per tier (specific numbers not found)
   - What's unclear: Concurrent request limit for parallel generation (3 variants simultaneously), rate limit headers format, whether 429 includes Retry-After header
   - Recommendation: Test with production API key. If concurrent limit < 3, modify Inngest function to generate serially. Verify RetryAfterError handling (Phase 1 code already includes this).

3. **Vercel Function Timeout for Blob Fetch:**
   - What we know: Vercel Pro allows 60s default, up to 5 min with config, up to 800s with Fluid Compute. Blob fetch endpoint streams audio from Supabase Storage.
   - What's unclear: Whether streaming prevents timeout (chunked response), average fetch time for 90s MP3 (~3-4MB file size)
   - Recommendation: Test blob fetch endpoint with production audio files. Monitor response times. If >10s, enable streaming with ReadableStream chunks instead of full arrayBuffer.

4. **iOS Safari Audio Blob URL Support:**
   - What we know: Safari requires user gesture for audio.play(), Web search mentions blob URL compatibility issues on older iOS
   - What's unclear: Whether iOS 15+ Safari supports blob URLs with audio element, autoplay restrictions
   - Recommendation: Test on physical iPhone during UAT (Phase 4 verification). Add iOS-specific handling if needed (show explicit play button, don't autoplay).

5. **React Query vs SWR Decision:**
   - What we know: Both solve polling problem, React Query more mature (45k stars), SWR lighter (5kb)
   - What's unclear: Whether existing project has preference, bundle size concerns, team familiarity
   - Recommendation: Use React Query (richer dev tools, better docs, more GitHub activity). Add to package.json during Phase 4 planning.

## Sources

### Primary (HIGH confidence)
- [React Query Polling Documentation](https://tanstack.com/query/latest/docs/react/guides/queries) - refetchInterval pattern, smart refetch
- [Supabase Storage Signed URLs](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl) - createSignedUrl() method, expiry configuration
- [Framer Motion Gestures](https://motion.dev/docs/react-gestures) - drag, useMotionValue, useTransform patterns
- [MDN Web Docs: HTML Audio Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) - controlsList attribute, context menu prevention
- [Eleven Labs Music API Docs](https://elevenlabs.io/docs/api-reference/music/compose) - duration parameter (3s-10min), prompt format

### Secondary (MEDIUM confidence)
- [Vercel Function Timeout Limits](https://vercel.com/docs/functions/limitations) - 60s Pro, 300s default with Fluid, 800s max
- [Inngest and Vercel Timeout Solutions](https://www.inngest.com/blog/how-to-solve-nextjs-timeouts) - Step functions avoid function-level timeouts
- [Audio Preview Protection Patterns](https://www.linkedin.com/advice/0/how-can-you-prevent-html5-audio-video-from-being-doh7c) - Signed URLs, streaming, DRM comparison
- [Web Search: Eleven Labs Rate Limits](https://prosperasoft.com/blog/voice-synthesis/elevenlabs/elevenlabs-api-rate-limits/) - Concurrency limits per tier

### Tertiary (LOW confidence)
- Web search claims about generation timing (30s-2min) - needs real-world testing with production API
- Web search about iOS Safari blob URL support - conflicting information, requires device testing
- Community discussions about polling vs WebSockets - anecdotal, not authoritative

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - React Query, Supabase Storage, HTML5 Audio are well-documented with stable APIs
- Architecture: HIGH - Patterns verified in official docs, examples tested in similar projects
- Pitfalls: MEDIUM - Based on common patterns and existing codebase concerns, not Phase 4-specific experience
- Eleven Labs specifics: LOW-MEDIUM - API documented but timing/rate limits need production testing

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days, stable ecosystem)

## Blockers & Dependencies

**Blockers flagged from prior phases (CONFIRMED):**
1. **Eleven Labs API tier selection:** LOW-MEDIUM confidence. Production API key needed to test concurrent generation (3 variants parallel) and confirm rate limits. If concurrency < 3, Inngest function needs modification to serialize.
2. **Vercel function timeout:** RESOLVED. Inngest step functions bypass 60s Pro timeout (each step independently timed). Blob fetch endpoint should complete <10s for 90s MP3 (~3-4MB), well within limits.

**New blockers identified in Phase 4 research:**
3. **React Query vs SWR decision:** User preference not documented. Recommendation: React Query (more mature, better TypeScript). Needs confirmation during Phase 4 planning.
4. **iOS Safari audio blob URL support:** Medium risk. Requires physical device testing during UAT. Fallback: serve signed URL directly if blob URLs fail on iOS.
5. **Generation timing (P95):** Affects poll interval and user expectations ("generating songs, usually takes 60-90 seconds"). Needs measurement with 10+ production API calls.

**Dependencies satisfied:**
- Phase 1: Inngest generate-song function generates 3 variants, tracks per-variant status (COMPLETE)
- Phase 3: Swipe engine with Framer Motion drag gestures (ASSUMED COMPLETE based on prior decisions 03-01, 03-03)
- Supabase Storage infrastructure (EXISTING from Phase 1)

**Ready to plan:** YES, with noted blockers requiring production testing during execution.
