# Domain Pitfalls: AI Music Gift Platform

**Domain:** AI-powered personalized song gifts with credit-based monetization
**Researched:** 2026-02-08
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Fire-and-Forget AI Generation Without Retry Logic

**What goes wrong:**
AI song generation API calls (Eleven Labs) fail silently after user payment is processed. User is charged, order shows "generating" forever, no song delivered. No retry mechanism exists, leaving orders permanently stuck.

**Why it happens:**
Developers treat AI generation as synchronous operation in webhook handlers. Initial testing works fine (APIs are up, network is stable), but production introduces rate limits, service unavailability, and transient failures. Quick iteration pressure leads to shipping without proper async job infrastructure.

**How to avoid:**
- Implement proper async job queue (BullMQ, Inngest, or Supabase pg_cron) from day one
- Add exponential backoff retry logic (3-5 attempts with 1.5x multiplier starting at 3 seconds)
- Create dead-letter queue for permanently failed jobs
- Implement idempotent job processing (same input = same output, safe to retry)
- Add status polling endpoint for order details page to show real-time progress

**Warning signs:**
- Webhook handlers calling external APIs with `await` inside request lifecycle
- No job tracking table in database
- No visibility into "what's currently processing"
- Manual database updates needed to fix stuck orders
- Customer support tickets about "still generating after 30 minutes"

**Phase to address:**
Phase 1 (Foundation) - Must implement before credit system launches. Silent failures with free credits are annoying; silent failures after payment are catastrophic.

---

### Pitfall 2: Inadequate Signed URL Expiry for Audio Protection

**What goes wrong:**
Audio signed URLs expire too quickly (15 minutes), breaking user experience. Recipients who receive gift links via email but don't click immediately get broken links. Conversely, URLs that last too long (7+ days) enable unauthorized sharing and defeat preview protection.

**Why it happens:**
Teams copy-paste cloud storage examples without considering actual user behavior. For audio previews (short snippets), very short expiry prevents piracy. For full unlocked songs, too short breaks gift delivery. Developers pick arbitrary values without tracking how users actually consume content.

**How to avoid:**
**For previews (pre-credit unlock):**
- 15-30 minute expiry for preview snippets
- Watermark audio with "SongSwipe preview" voice overlay
- Use server-streamed audio chunks (not direct S3 URLs) to prevent download

**For full songs (post-unlock):**
- Generate fresh signed URL on each play/download attempt (not at unlock time)
- Set expiry to match expected session duration (4-6 hours for listening, 30 min for downloads)
- Add domain restrictions to prevent embedding on unauthorized sites
- Implement token refresh endpoint that requires re-authentication for long sessions

**Warning signs:**
- User complaints about "expired link" when clicking email hours later
- Support requests to "resend my song"
- GitHub issues filed about "can't download from network inspector"
- Songs appearing on file-sharing sites (expiry too long)

**Phase to address:**
Phase 2 (Audio Protection) - Must implement before preview generation. Changing URL strategy after users have bookmarked links causes support flood.

---

### Pitfall 3: Credit Consumption Tracking Without Metering Validation

**What goes wrong:**
Credit deductions don't match actual resource consumption. Users get charged for previews that never generated (API failed), or unlock songs without credit deduction (race condition). Revenue leakage or customer disputes follow.

**Why it happens:**
Credit deduction happens at request time, not after successful generation. Network failures between deduction and generation lose the credit. Database transactions span multiple external API calls without proper rollback. Teams trust client-side credit checks without server verification.

**How to avoid:**
- Deduct credits in database transaction AFTER successful API response, not before
- Use database-level constraints (check credit balance >= cost in same transaction as deduction)
- Implement two-phase commit: reserve credits (pending state) → complete generation → finalize deduction
- Add audit log table for all credit movements with reason, job_id, and API response status
- Never trust client-side balance checks; always verify server-side at deduction time
- Implement idempotency keys for credit operations (prevent double-charge on retry)

**Warning signs:**
- User balance goes negative (shouldn't be possible with proper constraints)
- Credits deducted but "generation failed" in order history
- Manual database adjustments needed to refund credits
- Customers report "charged twice for same song"
- Missing events in credit ledger (no audit trail for balance changes)

**Phase to address:**
Phase 3 (Credit System) - Must implement atomically with credit purchase feature. Retrofit is painful due to need for historical audit trail.

---

### Pitfall 4: Eleven Labs API Rate Limits Hit at Production Scale

**What goes wrong:**
Development works fine with 1-2 test requests. Launch day brings 100 concurrent orders, all hit Eleven Labs API simultaneously. API returns 429 (rate limit exceeded) or 503 (system_busy). All generations fail, queue backs up, webhook handler times out.

**Why it happens:**
Eleven Labs rate limits are tier-based: Free tier has minimal concurrency, Pro has ~5 concurrent requests, Scale tier needed for high concurrency. Teams test on Free tier, launch without load testing. No backpressure handling means spike of orders crashes system.

**How to avoid:**
- Understand tier limits BEFORE launch: Free (1-2 concurrent), Pro (~5 concurrent), Scale (higher)
- Implement rate limiter on application side BEFORE calling API (don't rely on API to reject)
- Add queue with configurable concurrency (start at 3, monitor, increase)
- Handle 429 errors explicitly: extract Retry-After header, back off for that duration
- Handle 503 (system_busy) differently than 429: exponential backoff without header
- Monitor concurrent job count and API response times; alert if queue depth > 10
- Have upgrade path planned: if hitting limits regularly, when to upgrade tier?

**Warning signs:**
- All orders failing at same time (not isolated API errors)
- Error logs showing 429 or "rate_limit_exceeded"
- Response from API saying "system_busy"
- Processing times spike from 30s to 5+ minutes during traffic bursts
- Queue depth grows linearly without processing

**Phase to address:**
Phase 1 (Foundation) - Implement before beta launch. Rate limits hit instantly with any real traffic, not gradually.

---

### Pitfall 5: Swipe UI Gesture Ambiguity and Accidental Actions

**What goes wrong:**
Users accidentally swipe away options they wanted to select. Swipe sensitivity too high causes unwanted actions (swipe to next while trying to scroll). Hidden swipe functionality goes undiscovered (users don't know they can swipe). Non-standard swipe direction confuses users (horizontal swipe does something unexpected).

**Why it happens:**
Developers implement swipe for novelty without considering discoverability, reversibility, or accessibility. Touch event thresholds picked arbitrarily without user testing. Swipe used for non-destructive actions where users don't expect it. No visual affordances indicate "this is swipeable."

**How to avoid:**
- Add visual indicators: animated card edges showing swipe direction, subtle arrow hints
- Implement generous undo: "Oops, didn't mean that? Undo" snackbar after swipe
- Set conservative swipe threshold: require 40%+ card width movement to trigger action
- Distinguish vertical scroll from horizontal swipe: angle > 30 degrees = swipe, else scroll
- Provide alternative input methods: keyboard arrows on desktop, buttons always visible as fallback
- Use swipe only for expected actions: next/previous (navigation), like/dislike (binary choice)
- Avoid swipe for text input, deletion, or purchase confirmation (use explicit buttons)
- Test on low-end Android devices (touch events behave differently than iOS)

**Warning signs:**
- User support requests: "How do I go back?" "I didn't mean to skip that"
- Analytics show high skip rates but low conversion (users swiping by accident)
- Accessibility audit fails (screen reader users can't complete swipe actions)
- Users on desktop don't realize swipe works with arrow keys or mouse drag

**Phase to address:**
Phase 4 (Swipe UI) - Must get right on first launch. Bad swipe UX creates negative first impression that's hard to recover from.

---

### Pitfall 6: Gift Sharing Link Privacy Leakage

**What goes wrong:**
Shareable gift links contain personally identifiable information in URL (recipient name, occasion). Links shared on social media or messaging apps expose private details in preview cards. Links are guessable (sequential IDs), allowing enumeration of all gifts. No authentication required to view gift, enabling mass scraping.

**Why it happens:**
Teams use database auto-increment IDs for share URLs without considering public exposure. URL structure includes user inputs directly: `/gift/12345?name=Sarah&occasion=birthday`. Social platform link previews fetch Open Graph metadata, exposing private song details. No access control added because "link is secret."

**How to avoid:**
- Use cryptographically random share tokens (UUID v4 or nanoid), not auto-increment IDs
- Never include PII in URL query params; store in database, fetch server-side
- Implement rate limiting on gift view endpoint (max 5 views per IP per hour prevents scraping)
- Add optional password protection for sensitive gifts (user chooses during creation)
- Set appropriate Open Graph metadata: generic for share link, specific only after view
- Add "report inappropriate content" button to gift page (abuse vector)
- Consider time-limited share links (expire after 30 days) with option to extend
- Log all gift views with IP, user-agent, timestamp for abuse detection

**Warning signs:**
- Gift links appearing in public forums or social media
- Sequential pattern in share URLs (`/gift/1`, `/gift/2`)
- Scraper bots hitting gift pages systematically
- Recipient complains "my ex saw the gift link and found out"
- Database ID enumeration attacks visible in logs

**Phase to address:**
Phase 5 (Gift Sharing) - Must implement before share feature launches. Can't retrofit privacy into publicly shared URLs.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded prices in multiple files | Faster to type inline | Price change requires hunting down all instances, high risk of inconsistency | Never - use constants file from day one |
| `as any` type assertions | Bypasses TypeScript errors quickly | Loses type safety, runtime errors invisible until production | Never - properly type external APIs instead |
| Duplicate Zod schemas (client + server) | Works immediately | Schema drift causes validation bugs, double maintenance | Never - export single source of truth |
| Client-side Supabase initialization in useEffect | Follows React patterns | Auth checks happen after render, race conditions | Only if server components unavailable; prefer server-side auth |
| No test coverage for critical paths | Ship features faster | Silent regressions, debugging takes 10x longer in production | Only for throwaway prototypes, never production |
| Webhook processing without job queue | One less dependency | Silent failures at scale, no retry mechanism | Only for MVP with <10 users/day, must refactor before launch |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Eleven Labs API | Not handling `system_busy` response (different from rate limit) | Exponential backoff for 503, Retry-After header for 429 |
| Stripe Webhooks | Processing webhook synchronously, causing timeout after 30s | Return 200 immediately, process in background job queue |
| Supabase Storage | Assuming signed URLs never fail to generate (no null check) | Check `signedUrlData.error` explicitly before using `signedUrl` |
| Stripe Checkout | Redirecting before verifying session creation succeeded | Verify `checkoutUrl` exists and is valid before `window.location` |
| Eleven Labs Prompt | Passing user input directly without sanitization | Detect prompt injection patterns ("ignore previous instructions"), use parameterized prompts |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching all orders with relationships in single query | Slow page load, high memory usage | Paginate orders (20/page), lazy-load details on expand | >100 orders per user |
| Processing all webhooks in single handler sequentially | Timeout errors, backed-up queue | Job queue with configurable concurrency (5 workers) | >10 concurrent orders |
| No database connection pooling | Connection exhaustion errors | Use Supabase PgBouncer, reuse client instances | >50 concurrent API requests |
| Regenerating signed URLs on every audio play | S3 API rate limits, slow playback start | Cache signed URLs in browser localStorage, check expiry | >100 plays/minute |
| Full song generation with no caching | High API costs, slow delivery | Memo cache identical prompts (1-hour TTL), batch similar requests | >500 songs/day |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Service role key in client-side code | Attacker bypasses RLS, reads all data | Use anon key client-side, service role ONLY server-side |
| Predictable share link URLs | Gift enumeration, privacy breach | Use UUID v4 or nanoid for share tokens, never sequential IDs |
| No webhook duplicate detection | Double-processing same event (double-charge) | Track processed webhook event IDs in database, check before processing |
| No rate limiting on signed URL generation | Attacker generates thousands of download links | Redis-based rate limiter: 5 URLs per user per minute |
| Audio files stored without DRM/watermarking | Songs downloadable via network inspector | Watermark previews, use server-streamed chunks for full songs |
| No prompt injection detection | User manipulates AI output with malicious prompts | Scan for patterns like "ignore", "system:", "forget previous" |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No undo after swipe | Accidental skips frustrate users | Show "Undo" snackbar for 3s after swipe action |
| Hidden swipe functionality | Users miss core feature, use slow form instead | Animated hints on first visit, arrow indicators on cards |
| Swipe-to-delete for unlocked songs | Data loss from accidental swipe | Use explicit "Delete" button with confirmation modal |
| No loading state during AI generation | User thinks app is broken, closes tab | Real-time progress indicators: "Generating melody... 40%" |
| Credit balance not visible during browsing | User runs out of credits mid-session, frustration | Persistent credit counter in header, warning at 1 credit remaining |
| Gift link expires before recipient opens | Broken links, support flood | Email includes "expires in 7 days" warning, extend link button |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Credit System:** Deduction logic exists BUT no refund mechanism for failed generations (stuck credits)
- [ ] **Audio Protection:** Signed URLs expire BUT no token refresh endpoint (breaks long sessions)
- [ ] **Swipe UI:** Gesture detection works BUT no keyboard navigation (accessibility failure)
- [ ] **Gift Sharing:** Link generation works BUT no abuse reporting (spam/harassment vector)
- [ ] **Order Processing:** Webhook handler responds 200 BUT no job status tracking (user has no visibility)
- [ ] ] **AI Generation:** Prompt sent to API BUT no output validation (gibberish songs possible)
- [ ] **Download Tracking:** Table exists BUT nothing writes to it (no audit trail)
- [ ] **Error Handling:** Try-catch blocks present BUT errors not logged to monitoring (blind debugging)
- [ ] **Type Safety:** TypeScript enabled BUT `as any` everywhere (defeats purpose)
- [ ] **RLS Policies:** Database rules active BUT no tests verify them (security regression risk)

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Fire-and-forget generation failures | MEDIUM | 1. Query orders stuck in "generating" >1hr, 2. Re-trigger generation jobs manually, 3. Email users with apology + bonus credits |
| Signed URL expiry too short | LOW | 1. Add `/api/songs/[id]/download` endpoint that generates fresh URL, 2. Update all emails with new endpoint, 3. Add "get new link" button to order page |
| Credit deduction without generation | HIGH | 1. Cross-reference orders table with songs table to find orphans, 2. Manual credit refunds via database, 3. Send apology email with refund notification |
| Rate limit exceeded (Eleven Labs) | LOW | 1. Upgrade Eleven Labs tier immediately, 2. Retry failed jobs from DLQ, 3. Add rate limiter to prevent recurrence |
| Gift link privacy leak | HIGH | 1. Regenerate all share tokens (invalidates old links), 2. Email users with new links, 3. Add URL structure to robots.txt |
| Swipe gesture ambiguity | MEDIUM | 1. Adjust sensitivity threshold in config (A/B test values), 2. Add visual indicators via CSS update, 3. Email users about keyboard shortcuts |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Fire-and-forget generation | Phase 1: Job Queue | Integration test: fail API call, verify retry happens |
| Signed URL expiry | Phase 2: Audio Protection | Manual test: generate URL, wait past expiry, verify refresh works |
| Credit metering | Phase 3: Credit System | Unit test: transaction rollback on API failure, credit not deducted |
| Eleven Labs rate limits | Phase 1: Job Queue | Load test: 20 concurrent requests, verify queue backpressure |
| Swipe gesture issues | Phase 4: Swipe UI | User testing: 5 users complete flow, track accidental swipes |
| Gift link privacy | Phase 5: Gift Sharing | Security audit: verify UUID randomness, test enumeration protection |
| Webhook duplicate processing | Phase 1: Job Queue | Integration test: send duplicate webhook, verify idempotency |
| Type safety (`as any`) | Phase 0: Technical Debt | Lint check: ESLint rule forbids `as any`, enforce in CI |
| RLS policy regression | Phase 0: Technical Debt | Integration test: attempt cross-user access, verify 403 |
| Hardcoded pricing | Phase 3: Credit System | Grep check: search codebase for "799", verify only in constants file |

## Sources

### Credit-Based Monetization
- [Credits-Based Monetization for SaaS](https://colorwhistle.com/credits-based-monetization-saas/)
- [AI Monetization Solutions Comparison 2026](https://blog.alguna.com/ai-monetization-solutions-saas/)
- [Revenue Leakage in Billing Systems](https://billingplatform.com/blog/revenue-leakage)
- [Token-Based Pricing for AI Credits](https://www.afternoon.co/blog/token-based-pricing-guide)

### Audio Protection & DRM
- [DRM Protection for Apps - Audiorista](https://www.audiorista.com/best-practices/does-your-app-need-drm-protection)
- [Signed URLs for Secure Playback - Mux](https://www.mux.com/articles/securing-video-playback-with-signed-urls)
- [AWS Presigned URL Best Practices](https://docs.aws.amazon.com/prescriptive-guidance/latest/presigned-url-best-practices/presigned-url-best-practices.pdf)
- [Google Cloud Signed URLs](https://docs.cloud.google.com/storage/docs/access-control/signed-urls)

### Swipe UI Implementation
- [7 UI Pitfalls Mobile Developers Should Avoid 2026](https://www.webpronews.com/7-ui-pitfalls-mobile-app-developers-should-avoid-in-2026/)
- [Designing Swipe-to-Delete Interactions - LogRocket](https://blog.logrocket.com/ux-design/accessible-swipe-contextual-action-triggers/)
- [Using Swipe to Trigger Actions - Nielsen Norman Group](https://www.nngroup.com/articles/contextual-swipe/)

### Eleven Labs API & Rate Limits
- [Handling ElevenLabs API Rate Limits](https://prosperasoft.com/blog/voice-synthesis/elevenlabs/elevenlabs-api-rate-limits/)
- [ElevenLabs API Error Code 429](https://help.elevenlabs.io/hc/en-us/articles/19571824571921-API-Error-Code-429)
- [Complete Guide to ElevenLabs Pricing 2026](https://flexprice.io/blog/elevenlabs-pricing-breakdown)

### AI Music Platform Mistakes
- [Distribute AI Music Without Getting Banned 2026](https://connectaitools.com/en/distribute-ai-music-2026-without-getting-banned/)
- [Releasing AI-Generated Music - Legal Requirements](https://landrypllc.com/releasing-ai-generated-music-on-streaming-platforms-what-creators-need-to-know/)

### Gift Sharing & Privacy
- [Security by Design: Privacy-First Apps 2026](https://booleaninc.com/blog/security-by-design-building-privacy-first-mobile-apps-in-2026/)
- [App Privacy Policy Common Mistakes](https://usercentrics.com/guides/privacy-policy/app-privacy-policy/)
- [Data Privacy Challenges 2025](https://usercentrics.com/knowledge-hub/2025-privacy-challenges-for-app-and-game-publishers/)

### Async Job Processing & Retry Logic
- [Implementing Retry Logic with SQS](https://oneuptime.com/blog/post/2026-02-02-sqs-retry-logic/view)
- [BullMQ Error Handling Strategies](https://oneuptime.com/blog/post/2026-01-21-bullmq-error-handling-strategies/view)
- [AWS Retry with Backoff Pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html)
- [Google Cloud Jobs Retries Best Practices](https://docs.cloud.google.com/run/docs/jobs-retries)

### Webhook Implementation
- [Webhook Retry Logic Best Practices - Latenode](https://latenode.com/blog/integration-api-management/webhook-setup-configuration/how-to-implement-webhook-retry-logic)
- [Handling Failed Webhooks with Exponential Backoff](https://medium.com/wellhub-tech-team/handling-failed-webhooks-with-exponential-backoff-72d2e01017d7)
- [Webhook Retry Best Practices - Svix](https://www.svix.com/resources/webhook-best-practices/retries/)

### Existing Codebase
- `.planning/codebase/CONCERNS.md` (internal audit, 2026-02-08)
- `.planning/PROJECT.md` (project requirements)

---

*Pitfalls research for: AI Music Gift Platform (SongSwipe)*
*Researched: 2026-02-08*
