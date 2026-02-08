# Codebase Concerns

**Analysis Date:** 2026-02-08

## Tech Debt

**TypeScript Type Safety - `as any` Type Coercion:**
- Issue: Multiple files bypass TypeScript type checking with unsafe `as any` casts instead of properly typing data structures
- Files: `src/app/api/webhook/route.ts` (line 8, 5), `src/lib/stripe.ts` (line 5), `src/app/api/orders/route.ts` (line 20), `src/app/api/orders/[id]/route.ts` (lines 17, 26)
- Impact: Loses type safety benefits at runtime. Hidden data structure mismatches between API responses and expected types. Brittle when API contracts change.
- Fix approach: Create proper TypeScript interfaces for order responses, properly type Supabase joins, update Stripe SDK to newer version that supports '2026-01-28.clover' API version natively

**Zod Schema Duplication:**
- Issue: Schema is defined twice with identical constraints - once in `src/lib/elevenlabs.ts` and again in `src/app/api/customize/route.ts` (lines 7-22)
- Files: `src/lib/elevenlabs.ts` (lines 4-24), `src/app/api/customize/route.ts` (lines 7-22)
- Impact: Maintenance burden. Schema changes require updates in two places. Risk of versions diverging and causing validation inconsistencies between client and server
- Fix approach: Export single schema from `src/lib/elevenlabs.ts`, import and use in API route

**Hardcoded Price in Multiple Locations:**
- Issue: Price (799 pence = £7.99) appears hardcoded in multiple files without centralized configuration
- Files: `src/app/api/webhook/route.ts` (line 52 - default value), `src/lib/stripe.ts` (line 14), `src/app/customize/page.tsx` (line 344 - hardcoded display)
- Impact: Changing pricing requires changes across multiple files. Easy to miss updates, resulting in mismatched prices between UI and backend
- Fix approach: Create `src/lib/constants.ts` with `SONG_PRICE_PENCE` constant, import everywhere

**Fire-and-Forget Async Operation:**
- Issue: Song generation via `generateAndStoreSong()` in `src/app/api/webhook/route.ts` (line 63) is called without await. Function runs in background with no retry mechanism or dead-letter queue
- Files: `src/app/api/webhook/route.ts` (lines 63, 88-164)
- Impact: If song generation fails (API error, network timeout), user is charged but gets no song. No way to retry or alert. Order stuck in 'generating' state forever
- Fix approach: Implement proper async job queue (Bull, Inngest, or Supabase pg_cron), add retry logic with exponential backoff, implement status polling in order details page

## Known Bugs

**Signed URL Expiry is Too Short:**
- Symptoms: Users download songs, but links expire after 15 minutes. If user closes window and tries to download later from email/bookmark, link is dead
- Files: `src/app/api/webhook/route.ts` (line 137)
- Trigger: User receives song notification, waits >15 minutes, clicks download link
- Workaround: Regenerate signed URL on demand by fetching order details again
- Fix: Increase expiry to 7 days or generate fresh signed URL via dedicated endpoint on each download attempt

**Supabase Optional Chaining Bypassed:**
- Symptoms: `supabase.storage.createSignedUrl()` response handling assumes `data?.signedUrl` exists without proper null checks in all paths
- Files: `src/app/api/webhook/route.ts` (lines 135-142)
- Trigger: Supabase storage returns error (quota exceeded, bucket misconfigured), `signedUrl` is undefined
- Workaround: Check Supabase bucket permissions and quotas before order processing
- Fix: Add explicit error handling for `signedUrlData.error`, throw before attempting to use `signedUrl`

**Unhandled Error in Song Generation Flow:**
- Symptoms: If Eleven Labs API call fails (line 110), error is caught at top level but order status updated to 'failed' doesn't notify user. User might retry, creating duplicate orders
- Files: `src/app/api/webhook/route.ts` (lines 88-164)
- Trigger: Eleven Labs API returns 429 (rate limit), 503 (service unavailable), or invalid prompt
- Workaround: Manual database update to reset order status, user initiates payment again
- Fix: Send transactional email to user on order.status = 'failed', include support link and retry instructions

**Window Location Redirect Loses Error Context:**
- Symptoms: After successful checkout, `window.location.href = checkoutUrl` (line 127) redirects immediately. If Stripe session creation failed silently, user never sees error
- Files: `src/app/customize/page.tsx` (line 127)
- Trigger: Stripe API error during session creation (auth failure, network error), but try-catch doesn't cover the assignment
- Workaround: User tries again from beginning
- Fix: Check `checkoutUrl` exists before redirect, show error toast if missing

## Security Considerations

**Service Role Key Exposed in Browser Requires Trust of RLS Policies:**
- Risk: `.env` is excluded from git, but if accidentally committed or leaked, attacker can read all user data via Supabase anon key + bypass via custom SQL if RLS is misconfigured
- Files: `src/lib/supabase.ts` (line 5), `src/app/customize/page.tsx` (line 46), `.env.example`
- Current mitigation: RLS policies in `supabase-schema.sql` + `supabase-rls-fix.sql` enforce user_id checks. Service role key only used server-side
- Recommendations:
  - Monitor RLS policies: add audit logging when service role makes writes
  - Rotate service role key quarterly
  - Set up Supabase alerts for bulk deletes/updates on all tables
  - Consider namespace signing URLs with customer IP in signed URL metadata

**Stripe Webhook Signature Verification Present But Single Point of Failure:**
- Risk: If webhook secret is leaked/wrong, attacker can forge payment_intent.payment_failed events to block orders. No additional payment verification
- Files: `src/app/api/webhook/route.ts` (lines 23-27)
- Current mitigation: Signature validation in place, endpoint secret required
- Recommendations:
  - Log all webhook events (success and failures) to audit table
  - Cross-verify payment status by calling Stripe API for high-value orders
  - Implement webhook duplicate detection (Stripe can re-send same event)

**User Input in AI Prompt Not Sanitized:**
- Risk: User-provided text (names, special memories, things to avoid) is inserted directly into Eleven Labs API prompt without sanitization. Potential for prompt injection
- Files: `src/lib/elevenlabs.ts` (lines 39-49), `src/app/api/customize/route.ts` (line 53)
- Current mitigation: Zod schema validates max length (100, 500, 300 chars) but not content
- Recommendations:
  - Add explicit prompt injection detection (scan for patterns like "ignore previous instructions")
  - Use parameterized prompt structure vs string concatenation
  - Log all prompts sent to Eleven Labs for monitoring

**Download Tracking Table Unused:**
- Risk: `downloads` table exists but is never written to. No audit trail of who downloaded what
- Files: `supabase-schema.sql` (lines 69-76), but no code writes to this table
- Current mitigation: None - table exists but dormant
- Recommendations:
  - Implement POST endpoint `/api/songs/[id]/download` that logs IP, user-agent, user_id
  - Use this endpoint in download button instead of direct S3 links
  - Monitor for suspicious patterns (same IP downloading many songs, rapid downloads)

## Performance Bottlenecks

**Eleven Labs Music Generation Not Cached or Optimized:**
- Problem: Each order calls Eleven Labs API to generate unique audio. Generation takes 30-60 seconds per song. No caching of similar prompts
- Files: `src/app/api/webhook/route.ts` (lines 110-119), `src/lib/elevenlabs.ts` (lines 55-80)
- Cause: Full end-to-end generation on every order. Eleven Labs charges per API call. User waits synchronously (webhook blocks)
- Improvement path:
  - Move to async job queue with background processing (user gets instant confirmation email, song generates in background)
  - Add simple memo cache for identical prompts (e.g., same recipient + occasion + genre within 1 hour)
  - Consider batch generation for similar orders during off-peak hours

**Large Component Size Creates Render Performance Risk:**
- Problem: `src/app/customize/page.tsx` is 366 lines and handles all form state in single component. Any state change re-renders all 4 steps
- Files: `src/app/customize/page.tsx`
- Cause: Monolithic component with no split into smaller sub-components. Form array operations (mood selection) trigger full page re-render
- Improvement path:
  - Extract each step into separate memoized component (`Step1Names`, `Step2Occasion`, `Step3Styled`)
  - Use useCallback for event handlers to prevent unnecessary re-renders
  - Consider moving step state to URL params or URL-based router to prevent state loss on refresh

**Order Fetching Returns Full Relationships Without Pagination:**
- Problem: `/api/orders` endpoint returns all user's orders with all customizations and songs joined (line 21), no pagination or lazy loading
- Files: `src/app/api/orders/route.ts` (line 21)
- Cause: `select('id,status,created_at,customizations,songs')` fetches relationships eagerly without LIMIT
- Improvement path:
  - Add LIMIT/OFFSET pagination (e.g., 20 orders per page)
  - Return only order summary initially, lazy-load details when user clicks order
  - Add created_at DESC ordering with cursor-based pagination for infinite scroll

## Fragile Areas

**Authentication State Management in Customize Page:**
- Files: `src/app/customize/page.tsx` (lines 44-51)
- Why fragile: Supabase client initialization deferred to useEffect, but form submission (handleSubmit, line 110) calls `supabase.auth.getUser()` without null check. If component renders before useEffect runs, supabase is null
- Safe modification:
  - Initialize supabase at module level or use context provider
  - Add explicit null checks before calling supabase methods
  - Add loading skeleton until supabase is ready
- Test coverage: No tests for authentication state transitions

**Webhook Song Generation Error Path:**
- Files: `src/app/api/webhook/route.ts` (lines 88-164)
- Why fragile: Multiple async operations (fetch customization, call Eleven Labs, upload to storage, create signed URL, insert song record) without transaction-like atomicity. If step 3 fails, user has paid but no audio uploaded
- Safe modification:
  - Add Supabase transaction wrapper or implement manual rollback
  - Validate all preconditions before starting async work (customization exists, storage bucket writable)
  - Add specific error logging at each step
- Test coverage: No integration tests for webhook flow

**RLS Policies Depend on Hardcoded Guest UUID:**
- Files: `supabase-rls-fix.sql` (lines 19, 34, 48, 71-72)
- Why fragile: Policies allow access if `user_id = '00000000-0000-0000-0000-000000000000'`. This is a well-known UUID. If guest user record is ever modified or deleted, policies break silently
- Safe modification:
  - Use a random UUID instead of well-known null UUID
  - Add CHECK constraint to guest user record to prevent modification
  - Document RLS policy design and add migration tests
- Test coverage: No automated tests for RLS policy enforcement

**Stripe API Version Hardcoded to Beta:**
- Files: `src/app/api/webhook/route.ts` (line 8), `src/lib/stripe.ts` (line 5)
- Why fragile: Uses beta API version `'2026-01-28.clover'` instead of stable. If Stripe deprecates this version, code breaks. Using `as any` means no type safety to catch breaking changes
- Safe modification:
  - Upgrade to latest stable Stripe SDK version
  - Use environment variable for API version: `process.env.STRIPE_API_VERSION || 'stable'`
  - Add type guards to catch API response changes
- Test coverage: No tests for Stripe API responses

## Scaling Limits

**Webhook Handler Not Rate Limited:**
- Current capacity: Single webhook handler processes all Stripe events sequentially. No queue depth limit
- Limit: If 100 webhooks arrive in 1 second and song generation takes 60 seconds each, 99 requests will timeout waiting for handler
- Scaling path:
  - Move webhook to job queue (BullMQ, AWS SQS) with configurable concurrency (e.g., 5 concurrent song generations)
  - Add dead-letter queue for failed webhooks
  - Monitor queue depth and add alerts for backlog

**Supabase Storage Signed URLs Not Rate Limited:**
- Current capacity: No throttling on signed URL generation. Attacker could generate thousands of URLs
- Limit: Supabase has API rate limits, but application has no per-user limit
- Scaling path:
  - Add Redis-based rate limiter: max 5 signed URL requests per user per minute
  - Cache signed URLs in browser localStorage (check expiry before regenerating)
  - Implement link analytics to detect suspicious patterns

**No Database Connection Pooling:**
- Current capacity: Each API request creates new Supabase client connection
- Limit: 100 concurrent requests = 100 connections, potentially exhausting Supabase connection pool
- Scaling path:
  - Use Supabase connection pooling (PgBouncer)
  - Reuse Supabase client instances instead of creating new ones per request
  - Add connection pool metrics to monitoring

## Dependencies at Risk

**Stripe SDK Using Undocumented Beta API Version:**
- Risk: `'2026-01-28.clover'` appears to be a beta/testing version. Stripe may not support it in production or deprecate it
- Impact: Code might fail in production if version doesn't exist or has breaking changes
- Migration plan:
  - Check Stripe SDK changelog for stable version
  - Test with latest stable version (currently 2024-12-27 or later)
  - Remove `as any` type assertion to catch type errors during testing

**Next.js 14.2.0 End-of-Life Risk:**
- Risk: Released early 2024, will likely be unsupported by 2026
- Impact: Security patches end, vulnerability known to exist unfixed
- Migration plan: Plan upgrade to Next.js 15+ in Q2 2026, test existing APIs compatibility

**Eleven Labs Music API in Beta:**
- Risk: Eleven Labs music generation is relatively new service, API surface may change
- Impact: Breaking changes could require code updates with no warning
- Migration plan: Monitor Eleven Labs announcements, add fallback to alternative TTS service if needed

## Test Coverage Gaps

**No Tests for Webhook Handler:**
- What's not tested:
  - Stripe signature verification (both valid and invalid signatures)
  - Order creation from webhook event
  - Song generation flow (success and failure paths)
  - Idempotency (duplicate webhooks with same event ID)
- Files: `src/app/api/webhook/route.ts`
- Risk: Critical payment flow untested. Silent failures possible
- Priority: High - webhook is payment path

**No Tests for API Routes:**
- What's not tested:
  - Authentication checks in `/api/customize`, `/api/orders`
  - Input validation edge cases (empty strings, SQL injection attempts)
  - Database error handling (timeouts, constraint violations)
  - Stripe session creation failures
- Files: `src/app/api/**/*.ts`
- Risk: API behavior unknown under stress or with invalid input
- Priority: High - all backend operations

**No Tests for RLS Policies:**
- What's not tested:
  - User can only access own orders
  - Service role can bypass RLS
  - Guest user UUID allows anonymous access
  - Policy enforcement under concurrent access
- Files: SQL policies in `supabase-schema.sql` and `supabase-rls-fix.sql`
- Risk: Security regressions invisible until production
- Priority: High - security-critical

**No End-to-End Tests:**
- What's not tested:
  - Full user flow: login -> customize -> payment -> order completion
  - Song generation to download completion
  - Error recovery (payment fails, retry succeeds)
- Files: All of `src/`
- Risk: Integration failures only caught by manual testing
- Priority: Medium - integration testing

**No Load Tests:**
- What's not tested:
  - How system behaves with 100 concurrent webhook events
  - Database performance under 1000 simultaneous orders
  - Eleven Labs API rate limiting response
- Files: Infrastructure and API layer
- Risk: Performance issues and scaling problems unknown until live traffic
- Priority: Medium - scalability validation

---

*Concerns audit: 2026-02-08*
