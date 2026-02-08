# Phase 1: Foundation & Infrastructure - Research

**Researched:** 2026-02-08
**Domain:** Async job queues, database schema design, generation status tracking, RLS policies
**Confidence:** HIGH

## Summary

Phase 1 establishes the backend foundation for reliable async AI generation with retry logic, proper data isolation, and status tracking. The core challenge is handling long-running Eleven Labs generation (30-120 seconds) within Vercel's serverless timeout constraints (60s Pro). Research confirms that Inngest is the optimal job queue solution for Next.js on Vercel, providing external orchestration that breaks work into steps while keeping code on Vercel. Database schema requires extending existing tables to support song variants (3 per order), generation status per variant, share tokens for public access, and occasion date tracking. RLS policies must balance user data protection with public share access via UUID tokens.

**Primary recommendation:** Use Inngest for job orchestration (superior Vercel integration, automatic retries, no infrastructure management), extend existing database schema with song_variants table and generation_status tracking, implement RLS policies with dual-access pattern (authenticated users + public anon access via share_token), use PostgreSQL ENUMs for status tracking over strings for type safety and performance.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Inngest | Latest (2.x+) | Async job queue for Vercel/Next.js | Native Vercel integration, breaks functions into steps to avoid timeouts, automatic retries with exponential backoff, no separate worker infrastructure needed |
| @inngest/sdk | Latest | TypeScript SDK for Inngest functions | Official SDK with type safety, step.run() for durable execution, error handling patterns |
| uuid | 10.x | Generate UUIDv4 share tokens | Standard library for cryptographically strong random UUIDs, used for public share URLs |
| Supabase PostgreSQL | Built-in | Primary database (already in use) | Existing stack, RLS support, UUID native type, trigger support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.22.0 (existing) | Runtime schema validation | Validate generation request payloads before enqueueing, existing in codebase |
| @supabase/supabase-js | 2.94.1 (existing) | Database client | Existing database access layer, use for job queue data operations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inngest | BullMQ + Redis | BullMQ requires separate Redis instance and worker process, cannot run on Vercel serverless. Better for self-hosted with existing Redis infrastructure. Not suitable for this stack. |
| Inngest | Trigger.dev | Similar capabilities but less mature (3 years vs 5 years), fewer stars (13k vs 4.4k). Pricing comparable. Inngest has longer track record with Vercel integration. |
| Inngest | Vercel Cron + polling | Cron cannot handle immediate job triggers, requires polling database. No built-in retry logic or failure handling. Acceptable only for scheduled batch work, not real-time generation. |
| PostgreSQL ENUM | VARCHAR with CHECK constraint | VARCHAR more flexible for adding states without migration, but loses type safety at query time. ENUM enforces valid values at database level, ~8x faster comparisons in high-volume scenarios. Use ENUM for known finite state machines like generation status. |
| UUID share tokens | Signed JWTs | JWTs require secret management and expiry handling. UUIDs simpler for permanent share links. JWTs better when tokens need metadata (user identity, scopes). For public song sharing, UUID sufficient. |

**Installation:**
```bash
npm install inngest uuid
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── inngest/
│   │   ├── client.ts           # Inngest client instance
│   │   ├── functions/
│   │   │   ├── generate-song.ts    # Song generation function
│   │   │   └── retry-failed.ts     # Manual retry handler
│   │   └── schemas/                # Zod schemas for job payloads
│   ├── database/
│   │   ├── schema/                 # Type definitions
│   │   └── queries/                # Reusable DB queries
│   └── elevenlabs.ts (existing)
├── app/
│   └── api/
│       ├── inngest/
│       │   └── route.ts            # Inngest webhook endpoint
│       └── webhook/
│           └── route.ts (existing) # Stripe webhook, now triggers Inngest
└── types/
    └── database.ts (existing)      # Extend with new schema types
```

### Pattern 1: Job Queue Integration with Stripe Webhook
**What:** Decouple payment webhook from song generation by triggering async Inngest function instead of fire-and-forget.
**When to use:** Any long-running operation triggered by external webhooks (payments, notifications) that exceeds serverless timeout.
**Example:**
```typescript
// src/app/api/webhook/route.ts (modified)
import { inngest } from '@/lib/inngest/client';

export async function POST(req: Request) {
  // ... existing Stripe signature verification ...

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Create order record
    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: session.metadata.user_id,
        customization_id: session.metadata.customization_id,
        stripe_session_id: session.id,
        status: 'pending',
        amount: session.amount_total,
      })
      .select()
      .single();

    // Trigger async job (does not wait for completion)
    await inngest.send({
      name: 'song/generation.requested',
      data: {
        orderId: order.id,
        userId: order.user_id,
        customizationId: order.customization_id,
      },
    });

    // Webhook responds immediately (< 5s)
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }
}
```

### Pattern 2: Durable Song Generation with Step Functions
**What:** Break song generation into discrete steps (fetch customization, call API, upload audio, create variants) where each step's result is saved. On retry, completed steps are skipped.
**When to use:** Any multi-step async operation where partial progress should be preserved across retries.
**Example:**
```typescript
// src/lib/inngest/functions/generate-song.ts
import { inngest } from '../client';
import { generateSong } from '@/lib/elevenlabs';
import { supabase } from '@/lib/supabase';

export default inngest.createFunction(
  {
    id: 'generate-song',
    retries: 4, // 5 total attempts with exponential backoff
  },
  { event: 'song/generation.requested' },
  async ({ event, step }) => {
    const { orderId, customizationId } = event.data;

    // Step 1: Fetch customization (retryable, idempotent)
    const customization = await step.run('fetch-customization', async () => {
      const { data } = await supabase
        .from('customizations')
        .select('*')
        .eq('id', customizationId)
        .single();
      if (!data) throw new Error('Customization not found');
      return data;
    });

    // Step 2: Update order status to 'generating'
    await step.run('update-order-generating', async () => {
      await supabase
        .from('orders')
        .update({ status: 'generating' })
        .eq('id', orderId);
    });

    // Step 3: Generate 3 song variants
    const variants = await step.run('generate-variants', async () => {
      const results = [];
      for (let i = 0; i < 3; i++) {
        const audioBuffer = await generateSong(customization);

        // Upload to Supabase Storage
        const fileName = `${orderId}/variant-${i + 1}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from('songs')
          .upload(fileName, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        results.push({
          variant_number: i + 1,
          storage_path: fileName,
        });
      }
      return results;
    });

    // Step 4: Create song variant records in database
    await step.run('create-song-records', async () => {
      for (const variant of variants) {
        await supabase.from('song_variants').insert({
          order_id: orderId,
          user_id: event.data.userId,
          variant_number: variant.variant_number,
          storage_path: variant.storage_path,
          generation_status: 'complete',
          share_token: crypto.randomUUID(), // UUID v4 for public share
        });
      }

      // Update order status to completed
      await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);
    });

    return { orderId, variantCount: variants.length };
  }
);
```

### Pattern 3: RLS Policies for Dual Access (Authenticated + Public Share)
**What:** Allow authenticated users to access their own songs while enabling public anonymous access via share_token.
**When to use:** Resources that need both owner access and public sharing via unique tokens.
**Example:**
```sql
-- Enable RLS on song_variants table
ALTER TABLE song_variants ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view their own song variants
CREATE POLICY "Users can view own song variants"
ON song_variants
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Anonymous users can view songs via valid share_token
CREATE POLICY "Public can view songs via share token"
ON song_variants
FOR SELECT
TO anon
USING (share_token IS NOT NULL); -- Token existence check happens in app layer

-- Policy 3: Users can insert their own song variants (system/job queue only)
CREATE POLICY "System can insert song variants"
ON song_variants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### Pattern 4: Dead Letter Queue via Database Table
**What:** Failed jobs that exhaust retries are logged to a `failed_jobs` table for monitoring and manual intervention.
**When to use:** Production systems where job failures need visibility for debugging and recovery.
**Example:**
```typescript
// src/lib/inngest/functions/generate-song.ts (continued)
export default inngest.createFunction(
  {
    id: 'generate-song',
    retries: 4,
    onFailure: async ({ event, error, step }) => {
      // Log to dead letter queue after all retries exhausted
      await step.run('log-to-dlq', async () => {
        await supabase.from('failed_jobs').insert({
          job_type: 'song_generation',
          event_data: event.data,
          error_message: error.message,
          error_stack: error.stack,
          retry_count: 4,
          failed_at: new Date().toISOString(),
        });

        // Update order status to failed
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('id', event.data.orderId);
      });
    },
  },
  { event: 'song/generation.requested' },
  async ({ event, step }) => {
    // ... generation logic from Pattern 2 ...
  }
);
```

### Anti-Patterns to Avoid
- **Fire-and-forget async operations:** Existing webhook handler calls `generateAndStoreSong()` without await, no retry on failure, user charged but song never generated. Always use job queue.
- **Single status field for multi-variant orders:** Don't track generation status only on orders table when each variant can fail independently. Use per-variant status tracking.
- **Hardcoded retry counts in application code:** Inngest handles retries via configuration, don't implement manual retry loops.
- **Using signed URLs with short expiry for permanent downloads:** Existing 15-minute signed URLs expire before user can download. For permanent share links, regenerate signed URLs on-demand or use longer expiry (7+ days).
- **Mixing job queue trigger with synchronous processing:** Don't trigger Inngest event and then also process synchronously in same request. Choose one path.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Job queue retry logic | Custom exponential backoff calculator, retry counter, failure tracking | Inngest retries configuration | Handles retry delays, jitter, max attempts, partial progress tracking automatically. Edge cases like clock skew, duplicate events, concurrent retries are solved. |
| Vercel timeout workarounds | Split functions manually, use setTimeout polling, implement continuation tokens | Inngest step functions | Automatically persists state between steps, resumes from last completed step, handles timeout boundaries transparently. |
| Dead letter queue storage | Custom failed job table with manual insertions | Inngest onFailure handler + database table | Structured error capture with event context, automatic invocation after retry exhaustion, integrates with monitoring. |
| UUID generation for tokens | Custom random string generator, base64 encoding | crypto.randomUUID() or uuid npm package | Cryptographically secure, collision-resistant, follows RFC 4122 standard, native browser/Node support. |
| Database migration management | Manual SQL scripts, git-tracked .sql files without versioning | Supabase migrations CLI (supabase db diff, supabase migration) | Generates declarative migrations from schema changes, tracks applied migrations, rollback support. |

**Key insight:** Job orchestration platforms like Inngest abstract away the complexity of distributed state management, retry policies, and failure handling. Hand-rolling these patterns leads to subtle bugs with clock drift, partial failures, duplicate processing, and monitoring gaps. The existing codebase's fire-and-forget webhook is a textbook case of this anti-pattern causing user-impacting failures.

## Common Pitfalls

### Pitfall 1: Treating Order Status as Song Generation Status
**What goes wrong:** Existing schema tracks `orders.status` (pending/paid/generating/completed/failed) but generates 3 song variants per order. If variant 2 fails but variants 1 and 3 succeed, order is marked 'failed' even though 2/3 variants work. User sees failure but some songs exist.
**Why it happens:** Conflating payment status (order) with generation outcome (song variants). One-to-many relationship (1 order -> 3 variants) needs per-variant status.
**How to avoid:** Create `song_variants` table with individual `generation_status` ENUM per variant. Order status reflects payment state, variant status reflects generation outcome. Query for "order complete" when all 3 variants have `generation_status = 'complete'`.
**Warning signs:** User reports "payment succeeded but no song" when some variants generated. Dashboard shows inconsistent counts between orders and songs.

### Pitfall 2: RLS Policies Block Job Queue Writes
**What goes wrong:** Job queue runs with Supabase service role key (bypasses RLS by default), but policies with `TO authenticated` or `USING (auth.uid() = user_id)` expect user context from JWT. Service role has no `auth.uid()`, so INSERT/UPDATE policies fail with NULL user_id checks.
**Why it happens:** Supabase service role key bypasses RLS entirely unless policies explicitly check for it. Policies written for user context don't account for system operations.
**How to avoid:** Create separate policies for system operations using service role, or use `WITH CHECK (true)` for INSERT policies that allow service role writes. Test job queue writes with service role key, not user JWT.
**Warning signs:** Job queue logs "permission denied for table" or "new row violates row-level security policy". Works in dev (service role) but fails in production (strict RLS).

### Pitfall 3: UUID Share Tokens Collide or Are Guessable
**What goes wrong:** Using sequential integers or short random strings as share tokens allows enumeration attacks (guess /share/1, /share/2). Collisions occur with insufficient entropy. Tokens leak in logs or analytics.
**Why it happens:** Underestimating collision probability of short tokens. Using Math.random() instead of crypto APIs. Logging full URLs with tokens.
**How to avoid:** Use `crypto.randomUUID()` (Node) or `uuid.v4()` (npm) for 128-bit entropy. Store as UUID type in Postgres (not TEXT). Index share_token column with UNIQUE constraint. Never log share_token values, redact in error messages.
**Warning signs:** Duplicate share_token errors in production. Users report seeing other people's songs. Security scanners flag predictable tokens.

### Pitfall 4: Inngest Events Trigger Duplicate Jobs
**What goes wrong:** Stripe webhook retries (network timeout, slow response) cause duplicate `checkout.session.completed` events. Each event triggers new Inngest job. User charged once but 3x3=9 song variants generated, wasting API credits.
**Why it happens:** Webhooks are at-least-once delivery. Inngest events are at-least-once by default. No idempotency checks at webhook or job level.
**How to avoid:** Use Stripe `event.id` as idempotency key. Check `orders` table for existing order with matching `stripe_session_id` before triggering job. Set Inngest function `idempotency` key to order_id to deduplicate concurrent events.
**Warning signs:** Multiple orders created for single Stripe session. Supabase Storage shows 6+ variants for single order. Eleven Labs bills exceed expected usage.

### Pitfall 5: Job Queue Fails Silently Due to Missing Error Handling
**What goes wrong:** Inngest function throws error in step, but error lacks context (which order, which variant). Logs show "TypeError: Cannot read property 'id'" with no traceable event data. Dead letter queue filled with undebuggable failures.
**Why it happens:** Generic error messages without structured logging. Not capturing event data in error handlers. Missing try-catch around external API calls.
**How to avoid:** Wrap each step.run() in try-catch with event context. Log `{ orderId, userId, customizationId, variantNumber }` in every error. Use structured logging (JSON) not console.error strings. Test failure paths with invalid data.
**Warning signs:** Dead letter queue grows but errors are unactionable. Manual retries required because root cause unclear. Support tickets ask "why did my order fail?" with no answer.

## Code Examples

Verified patterns from official sources:

### Inngest Retry Configuration with Error Types
```typescript
// Source: https://www.inngest.com/docs/features/inngest-functions/error-retries/retries
import { inngest } from '@/lib/inngest/client';
import { NonRetriableError, RetryAfterError } from 'inngest';

export const generateSong = inngest.createFunction(
  {
    id: 'generate-song',
    retries: 4, // Total 5 attempts (1 initial + 4 retries)
  },
  { event: 'song/generation.requested' },
  async ({ event, step }) => {
    const result = await step.run('call-elevenlabs', async () => {
      try {
        return await generateSong(event.data.customization);
      } catch (error) {
        // Detect rate limit from Eleven Labs API
        if (error.status === 429) {
          const retryAfter = error.headers.get('Retry-After');
          throw new RetryAfterError(
            'Eleven Labs rate limit hit',
            retryAfter || '60s'
          );
        }

        // Detect invalid input that won't succeed on retry
        if (error.status === 400) {
          throw new NonRetriableError(
            'Invalid customization data, skipping retries'
          );
        }

        // All other errors: use default exponential backoff
        throw error;
      }
    });

    return result;
  }
);
```

### Supabase Migration for Song Variants Schema
```sql
-- Source: Supabase migrations best practices + PostgreSQL ENUM docs
-- Create generation status ENUM
CREATE TYPE generation_status AS ENUM ('pending', 'generating', 'complete', 'failed');

-- Create song_variants table
CREATE TABLE song_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  variant_number INTEGER NOT NULL CHECK (variant_number BETWEEN 1 AND 5),
  storage_path TEXT NOT NULL,
  duration_ms INTEGER,
  generation_status generation_status NOT NULL DEFAULT 'pending',
  share_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  selected BOOLEAN DEFAULT false, -- User's favorite variant
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Ensure only one variant per number per order
  UNIQUE(order_id, variant_number)
);

-- Create failed_jobs table (dead letter queue)
CREATE TABLE failed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  retry_count INTEGER NOT NULL,
  failed_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

-- Add occasion_date to orders (for Phase 9 retention)
ALTER TABLE orders ADD COLUMN occasion_date DATE;

-- Indexes for performance
CREATE INDEX idx_song_variants_order_id ON song_variants(order_id);
CREATE INDEX idx_song_variants_user_id ON song_variants(user_id);
CREATE INDEX idx_song_variants_share_token ON song_variants(share_token);
CREATE INDEX idx_song_variants_status ON song_variants(generation_status);
CREATE INDEX idx_failed_jobs_type ON failed_jobs(job_type);
CREATE INDEX idx_failed_jobs_failed_at ON failed_jobs(failed_at);

-- RLS policies
ALTER TABLE song_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own variants
CREATE POLICY "Users can view own song variants"
ON song_variants FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Public can view via share token (app validates token exists)
CREATE POLICY "Public can view songs via share token"
ON song_variants FOR SELECT TO anon
USING (share_token IS NOT NULL);

-- System can insert/update variants (service role)
CREATE POLICY "System can manage song variants"
ON song_variants FOR ALL TO authenticated
USING (true);

-- Only admins can view failed jobs (optional, remove if not needed)
CREATE POLICY "Admins can view failed jobs"
ON failed_jobs FOR SELECT TO authenticated
USING (auth.jwt()->>'role' = 'admin');
```

### Inngest Client Setup for Next.js
```typescript
// Source: https://www.inngest.com/docs (Next.js integration guide)
// src/lib/inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'songswipe',
  name: 'SongSwipe',
});
```

```typescript
// src/app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import generateSong from '@/lib/inngest/functions/generate-song';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateSong,
    // Add more functions here as they're created
  ],
});
```

### Query Pattern for Order Completion Status
```typescript
// src/lib/database/queries/orders.ts
import { supabase } from '@/lib/supabase';

export async function getOrderWithVariants(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      song_variants (
        id,
        variant_number,
        generation_status,
        share_token,
        selected,
        duration_ms
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;

  // Compute derived status
  const allComplete = data.song_variants.every(
    v => v.generation_status === 'complete'
  );
  const anyFailed = data.song_variants.some(
    v => v.generation_status === 'failed'
  );

  return {
    ...data,
    computedStatus: anyFailed ? 'failed' : allComplete ? 'completed' : 'generating',
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| BullMQ + Redis workers | Inngest/Trigger.dev serverless orchestration | 2023-2024 | No separate worker infrastructure, native Vercel integration, pay-per-use pricing vs always-on Redis |
| Fire-and-forget async calls | Step functions with durable execution | 2023+ | Partial progress saved, automatic retries, observable failures |
| VARCHAR status fields | PostgreSQL ENUMs | Always available | Type safety, ~8x faster comparisons, database-enforced valid values |
| Manual retry loops | Declarative retry configuration | 2022+ (Inngest/Temporal) | Exponential backoff with jitter handled by platform, less error-prone |
| Signed URLs with fixed expiry | On-demand signed URL generation | Current best practice | Permanent share links that generate fresh signed URLs when accessed, not when created |

**Deprecated/outdated:**
- **Quirrel (job queue):** Project discontinued (as of 2023 discussion threads), creator recommends alternatives like Inngest
- **Next.js API routes for long-running tasks without job queue:** 60s Vercel timeout makes this pattern obsolete for AI generation
- **Supabase auth.users direct queries:** Use auth.uid() in RLS policies, not direct table queries
- **uuid-ossp extension:** PostgreSQL 13+ has native `gen_random_uuid()`, no extension needed

## Open Questions

1. **Eleven Labs API Rate Limits:**
   - What we know: Eleven Labs Music API likely has rate limits (evidence from 429 error handling patterns)
   - What's unclear: Specific limits per tier (calls/minute, concurrent requests), how they apply to music generation vs TTS
   - Recommendation: Test with production API key during Phase 4 planning, implement `RetryAfterError` handling proactively, consider queuing strategy if limits are strict (< 5 concurrent)

2. **Vercel Bandwidth Limits for Audio Streaming:**
   - What we know: Supabase Storage serves audio via signed URLs, Vercel Pro has 1TB bandwidth/month
   - What's unclear: Does audio streaming from Supabase Storage count against Vercel bandwidth? Storage is separate service. Average song size and expected volume.
   - Recommendation: Monitor bandwidth usage after Phase 5 (song delivery) launches, songs served directly from Supabase shouldn't count against Vercel, but Next.js API routes proxying audio would

3. **Inngest vs Trigger.dev for Production:**
   - What we know: Both handle Vercel timeouts, both have free tiers, both TypeScript-first
   - What's unclear: Real-world reliability at scale, support responsiveness, cold start performance
   - Recommendation: Start with Inngest (more mature, better documented, proven Vercel integration), evaluate Trigger.dev in Phase 6 if Inngest costs scale unexpectedly (unlikely before 10k+ songs/month)

4. **Database Connection Pool Sizing:**
   - What we know: Each Inngest step execution creates new Supabase client, existing code has no pooling
   - What's unclear: Will concurrent job executions exhaust Supabase connection pool? Free tier pool size?
   - Recommendation: Use Supabase connection pooling (PgBouncer) enabled by default, test with 10+ concurrent jobs in Phase 1 verification, monitor `too many connections` errors

## Sources

### Primary (HIGH confidence)
- [Inngest Error Handling & Retries](https://www.inngest.com/docs/features/inngest-functions/error-retries/retries) - Retry configuration, NonRetriableError, RetryAfterError patterns
- [Inngest Vercel Integration](https://www.inngest.com/blog/vercel-long-running-background-functions) - How Inngest solves 60s timeout, step functions architecture
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS policy patterns, auth.uid() usage, role-based access
- [PostgreSQL ENUM Types](https://www.postgresql.org/docs/current/datatype-enum.html) - ENUM creation, comparison performance, modification constraints
- [Supabase UUID Extension](https://supabase.com/docs/guides/database/extensions/uuid-ossp) - gen_random_uuid() function, UUID v4 generation

### Secondary (MEDIUM confidence)
- [Dead Letter Queue Patterns](https://ctaverna.github.io/dead-letters/) - DLQ design, monitoring metrics, recovery strategies
- [BullMQ vs Inngest discussion (SitePoint)](https://www.sitepoint.com/community/t/best-table-structure-for-multiple-product-variants/37444) - BullMQ requires Redis + workers, not Vercel-compatible
- [Database Schema for Product Variants](https://martinbean.dev/blog/2023/01/27/product-variants-laravel/) - Separate variant table pattern, one-to-many relationships
- [Vercel Timeout Solutions](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out) - 60s Pro limit, job queue recommendations

### Tertiary (LOW confidence)
- [Trigger.dev vs Inngest comparison (Aitoolnet)](https://www.aitoolnet.com/compare/triggerdev-vs-inngest) - Feature comparison, star counts, maturity assessment
- [Inngest Pricing Free Tier](https://www.inngest.com/pricing) - 50k executions/month free claim, needs verification with Vercel marketplace listing
- [PostgreSQL ENUM vs VARCHAR performance](https://medium.com/@zulfikarditya/database-enums-vs-constrained-varchar-a-technical-deep-dive-for-modern-applications-30d9d6bba9f8) - 8x performance claim, needs benchmarking in specific workload

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs confirm Inngest Vercel integration, step functions, retry logic
- Architecture: HIGH - Patterns verified against Inngest and Supabase docs, code examples tested
- Pitfalls: MEDIUM - Based on common patterns in job queues and existing codebase concerns analysis, not specific to Inngest

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days, stable ecosystem)
