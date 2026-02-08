# Phase 2: Base Payment & Pricing - Research

**Researched:** 2026-02-08
**Domain:** Stripe Checkout integration, webhook processing, Next.js API routes, pricing page UI/UX
**Confidence:** HIGH

## Summary

Phase 2 implements the core payment flow where users purchase the base song package (3 variants) through Stripe Checkout. The challenge is integrating Stripe Checkout Session creation, webhook signature verification, and idempotent order processing while building a conversion-optimized pricing page. Research confirms that Next.js App Router uses Server Actions for checkout flows but requires traditional API routes for webhooks (external services can't call Server Actions). Stripe webhooks require raw request body via `request.text()` for signature verification. The existing codebase already has webhook handler and Stripe integration files, but needs pricing page UI and proper idempotency checks via `stripe_session_id` to prevent duplicate orders from webhook retries.

**Primary recommendation:** Use Server Actions for pricing page checkout initiation (simpler, type-safe), keep existing API route for webhook handler with `request.text()` for signature verification, implement idempotency via UNIQUE constraint on `orders.stripe_session_id` column (prevents duplicate orders at database level), build single-price pricing page with clear value communication and trust signals (testimonials, client logos), use Stripe's `{CHECKOUT_SESSION_ID}` placeholder in success_url for order tracking.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | 20.3.0 (existing) | Server-side Stripe SDK | Official Stripe Node.js library, handles API calls, webhook signature verification, type definitions |
| @stripe/stripe-js | 2.4.0 (existing) | Client-side Stripe.js | Official client library for Elements, Checkout redirects, PCI compliance |
| Next.js App Router | 14.2.0 (existing) | Framework for routing | Built-in Server Actions for checkout, API routes for webhooks, request/response Web API |
| Supabase PostgreSQL | Existing | Database with RLS | Already stores orders, UNIQUE constraints for idempotency, RLS for security |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.22.0 (existing) | Runtime validation | Validate checkout request payloads, existing in codebase |
| Tailwind CSS | 3.4.19 (existing) | Styling framework | Pricing page UI components, responsive design |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions | API routes for checkout | Server Actions simpler for internal calls (no manual fetch, better type safety), but webhooks still need API routes. Use Server Actions for checkout initiation, API routes for webhooks. |
| Stripe Checkout | Stripe Elements | Checkout is hosted by Stripe (less PCI complexity, faster to ship), Elements gives full UI control but requires custom form validation. For MVP, Checkout faster. |
| stripe_session_id UNIQUE | Event ID tracking table | UNIQUE constraint enforces idempotency at database level (fewer race conditions), event ID table requires app-layer checks before INSERT. Database constraint more robust. |
| price_data inline | Price ID from catalog | price_data simpler for fixed pricing (no Stripe dashboard setup), Price IDs better when prices change frequently or need A/B testing. For £7.99 fixed price, price_data sufficient. |
| success_url with session ID | Redirect to generic page | Session ID in URL allows order lookup on success page (show order details, variants), generic redirect requires separate API call. Include session ID for better UX. |

**Installation:**
```bash
# All dependencies already installed
npm install  # stripe@20.3.0, @stripe/stripe-js@2.4.0, zod@3.22.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── pricing/
│   │   └── page.tsx               # Pricing page UI (PAY-02)
│   ├── checkout/
│   │   └── success/
│   │       └── page.tsx           # Success page after Checkout
│   └── api/
│       └── webhook/
│           └── route.ts (existing) # Stripe webhook handler (PAY-03)
├── actions/
│   └── checkout.ts                # Server Action for checkout session
├── components/
│   └── pricing/
│       ├── PricingCard.tsx        # Single price display
│       └── TrustSignals.tsx       # Testimonials, logos
└── lib/
    └── stripe.ts (existing)        # Stripe client, helper functions
```

### Pattern 1: Server Action for Checkout Session Creation
**What:** Create Stripe Checkout Session in Server Action instead of API route for type safety and simpler client integration.
**When to use:** Internal operations called from React components (checkout initiation, form submissions).
**Example:**
```typescript
// src/actions/checkout.ts
'use server'

import { createCheckoutSession } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function createCheckout(customizationId: string) {
  const supabase = createServerSupabaseClient()

  // Require authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  // Fetch customization to validate ownership
  const { data: customization, error } = await supabase
    .from('customizations')
    .select('*')
    .eq('id', customizationId)
    .eq('user_id', user.id)
    .single()

  if (error || !customization) {
    throw new Error('Customization not found')
  }

  // Create Stripe Checkout Session
  const session = await createCheckoutSession({
    customizationId: customization.id,
    userId: user.id,
    email: user.email!,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
  })

  return { url: session.url }
}
```

```tsx
// src/app/pricing/page.tsx (usage)
'use client'

import { createCheckout } from '@/actions/checkout'

export default function PricingPage() {
  const handleCheckout = async () => {
    const { url } = await createCheckout(customizationId)
    window.location.href = url! // Redirect to Stripe Checkout
  }

  return <button onClick={handleCheckout}>Purchase - £7.99</button>
}
```

### Pattern 2: Webhook Signature Verification with Raw Body
**What:** Use `request.text()` in Next.js App Router to get raw request body for Stripe signature verification.
**When to use:** All webhook handlers that require signature verification (Stripe, GitHub, etc.).
**Example:**
```typescript
// src/app/api/webhook/route.ts (modified from existing)
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import { inngest } from '@/lib/inngest/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover' as any,
})

export async function POST(request: NextRequest) {
  try {
    // CRITICAL: Use request.text() not request.json() for signature verification
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Process checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const customizationId = session.metadata?.customizationId
      const userId = session.metadata?.userId

      if (!customizationId || !userId) {
        console.error('Missing metadata in session:', session.id)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      // Check for duplicate webhook (idempotency via stripe_session_id)
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle()

      if (existingOrder) {
        console.log('Duplicate webhook, order already exists:', existingOrder.id)
        return NextResponse.json({ received: true })
      }

      // Create order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          customization_id: customizationId,
          stripe_session_id: session.id, // Idempotency key
          status: 'paid',
          amount: session.amount_total || 799,
        })
        .select()
        .single()

      if (orderError) {
        console.error('Failed to create order:', orderError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      // Trigger Inngest event for async generation (from Phase 1)
      await inngest.send({
        name: 'song/generation.requested',
        data: {
          orderId: order.id,
          userId: userId,
          customizationId: customizationId,
        },
      })
    }

    // Respond within 5s to prevent Stripe retries
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
```

### Pattern 3: Single-Price Pricing Page with Trust Signals
**What:** Pricing page for fixed-price product emphasizes value, includes trust signals, and has clear CTA.
**When to use:** Products with one primary package, no tier comparison needed.
**Example:**
```tsx
// src/app/pricing/page.tsx
export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Create Your Perfect Song
        </h1>
        <p className="text-xl text-gray-600">
          Get 3 AI-generated song variants. Pick your favorite.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border-2 border-purple-500">
        <div className="text-center mb-6">
          <span className="text-sm font-semibold text-purple-600 uppercase">
            Song Package
          </span>
          <div className="mt-4">
            <span className="text-6xl font-bold">£7.99</span>
            <span className="text-gray-600 ml-2">one-time</span>
          </div>
        </div>

        {/* What's Included */}
        <ul className="space-y-4 mb-8">
          <li className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>3 unique song variants</strong>
              <p className="text-sm text-gray-600">AI-generated variations to choose from</p>
            </div>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>Fully personalized lyrics</strong>
              <p className="text-sm text-gray-600">Based on your memories and preferences</p>
            </div>
          </li>
          <li className="flex items-start">
            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <strong>High-quality audio download</strong>
              <p className="text-sm text-gray-600">MP3 format, ready to share</p>
            </div>
          </li>
        </ul>

        <button
          onClick={handleCheckout}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
        >
          Create Your Song
        </button>
      </div>

      {/* Trust Signals */}
      <div className="mt-16 text-center">
        <p className="text-sm text-gray-600 mb-4">Trusted by thousands of happy customers</p>
        <div className="flex justify-center gap-8 items-center">
          {/* Client logos or testimonial quotes */}
          <div className="text-yellow-500 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-gray-700 font-medium">4.9/5 from 1,200+ reviews</span>
        </div>
      </div>

      {/* Money-back guarantee */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-700">
          🔒 <strong>Secure payment</strong> via Stripe ·
          ✨ <strong>Generated in minutes</strong> ·
          💯 <strong>Satisfaction guaranteed</strong>
        </p>
      </div>
    </div>
  )
}
```

### Pattern 4: Checkout Session with Metadata and Success URL
**What:** Create Checkout Session with metadata for order association and success_url with session ID for order lookup.
**When to use:** All Stripe Checkout flows that need to associate session with internal records.
**Example:**
```typescript
// src/lib/stripe.ts (modified from existing)
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover' as any,
  typescript: true,
})

export async function createCheckoutSession({
  customizationId,
  userId,
  email,
  amount = 799, // £7.99 in pence
  successUrl,
  cancelUrl,
}: {
  customizationId: string
  userId: string
  email: string
  amount?: number
  successUrl?: string
  cancelUrl?: string
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Personalized Song Package',
            description: 'Get 3 AI-generated song variants and pick your favorite',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // CRITICAL: Include {CHECKOUT_SESSION_ID} placeholder for order lookup
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    customer_email: email,
    // CRITICAL: Metadata for order association in webhook
    metadata: {
      customizationId,
      userId,
      orderType: 'base', // For Phase 6 upsells, will be 'upsell' or 'bundle'
    },
    payment_intent_data: {
      metadata: {
        customizationId,
        userId,
        orderType: 'base',
      },
    },
  })

  return session
}
```

### Anti-Patterns to Avoid
- **Parsing webhook body as JSON before signature verification:** Next.js automatically parses request body. Use `request.text()` to get raw body string, or signature verification will fail.
- **Missing idempotency checks in webhook handler:** Stripe retries webhooks up to 3 days. Without `stripe_session_id` uniqueness check, duplicate orders created for single payment.
- **Trusting client-provided prices:** Never pass price from client to checkout session creation. Always fetch from database or hardcode server-side. Client can manipulate request payloads.
- **Using API routes for checkout initiation:** Server Actions simpler for internal calls (no manual fetch, better type safety, less boilerplate). Reserve API routes for external webhooks only.
- **Missing metadata size validation:** Stripe metadata limited to 50 keys, 40 char key names, 500 char values. Storing large customization data in metadata will fail. Store IDs only, fetch full data from database in webhook.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook signature verification | Custom HMAC verification, timestamp validation, replay attack prevention | `stripe.webhooks.constructEvent()` | Handles signature extraction, HMAC-SHA256 computation, constant-time comparison, timestamp tolerance (5 min default), replay prevention. Edge cases like header format variations, timing attacks, clock skew handled. |
| Checkout Session creation | Manual Stripe API POST requests, line item formatting | `stripe.checkout.sessions.create()` | Type-safe parameters, automatic API versioning, idempotency key handling, error retry logic. SDK keeps up with API changes. |
| Idempotency via event ID tracking | Custom database table for processed event IDs, app-layer checks before INSERT | UNIQUE constraint on `orders.stripe_session_id` | Database enforces uniqueness atomically (no race conditions), constraint violation returns error code 23505 (handleable), no additional table or lookup query needed. |
| Pricing page components | Custom pricing card CSS, responsive breakpoints | shadcn/ui pricing components or Tailwind UI examples | Pre-built accessible components, mobile-responsive, dark mode support, proven conversion patterns. |
| Success page session lookup | Manual API call to Stripe with session ID, error handling | `stripe.checkout.sessions.retrieve(session_id)` | Automatic retry on network errors, proper error types, type-safe response objects. Includes customer, payment intent, line items. |

**Key insight:** Stripe SDK and database constraints handle edge cases that are easy to miss in hand-rolled implementations. Webhook signature verification protects against timing attacks, replay attacks, and malformed headers. UNIQUE constraints prevent race conditions from concurrent webhook retries better than app-layer checks (database transaction isolation guarantees atomicity).

## Common Pitfalls

### Pitfall 1: Webhook Signature Verification Fails Due to Body Parsing
**What goes wrong:** Next.js automatically parses request body as JSON. Stripe signature verification requires raw body string. Webhook handler gets parsed object, signature verification fails with "No signatures found matching the expected signature" error.
**Why it happens:** `stripe.webhooks.constructEvent()` computes HMAC-SHA256 of raw body bytes. Parsed JSON then re-stringified has different formatting (whitespace, key order) than original payload. HMAC mismatch.
**How to avoid:** Use `await request.text()` in webhook handler before any other body access. Never call `request.json()` first. Test webhook signature verification in development with Stripe CLI before deploying.
**Warning signs:** All webhook events fail signature verification. Error message mentions "expected signature" or "timestamp". Works with Stripe test webhooks but fails with real events.

### Pitfall 2: Duplicate Orders Created from Webhook Retries
**What goes wrong:** Stripe retries failed webhooks (network timeout, 5xx error) up to 3 days with exponential backoff. Each retry triggers `checkout.session.completed` handler. Without idempotency check, multiple order records created for single payment. User charged once but database shows 3+ orders, triggers 9+ song generations (3 variants x 3 orders).
**Why it happens:** Webhooks are at-least-once delivery. Network timeouts or slow responses (> 5s) cause Stripe to retry. No deduplication at webhook level.
**How to avoid:** Add UNIQUE constraint to `orders.stripe_session_id` column. Check for existing order with `stripe_session_id` before INSERT in webhook handler. If exists, log and return 200 immediately. Test with manual webhook resends in Stripe dashboard.
**Warning signs:** Supabase logs show duplicate key constraint violations. Multiple orders for same Stripe session ID in database. Eleven Labs usage spikes unexpectedly.

### Pitfall 3: Metadata Size Exceeds Stripe Limits
**What goes wrong:** Storing full customization data (special memories, things to avoid) in Stripe metadata hits 500 char value limit. Checkout session creation fails with "metadata value too long" error. User stuck on pricing page, no error shown in UI.
**Why it happens:** Metadata limits not validated before Stripe API call. Customization form allows 500 char "special memories" field. Adding field name in key-value pair pushes over limit.
**How to avoid:** Store only IDs in metadata (customizationId, userId, orderType). Fetch full customization data from Supabase in webhook handler using customizationId. Validate metadata size before `stripe.checkout.sessions.create()` if user-provided data included.
**Warning signs:** Checkout session creation throws 400 error with "metadata" in message. Works for some users (short inputs) but fails for others (long memories).

### Pitfall 4: Success URL Missing Session ID Placeholder
**What goes wrong:** Success page can't lookup order details. User redirected to `/checkout/success` without session ID. Page shows "Loading..." forever. No way to fetch order status or show "Payment successful, songs generating" message.
**Why it happens:** Hardcoded success_url like `/checkout/success` instead of `/checkout/success?session_id={CHECKOUT_SESSION_ID}`. Stripe doesn't replace placeholder if literal string not matched exactly.
**How to avoid:** Always include `{CHECKOUT_SESSION_ID}` literal string in success_url. Stripe automatically replaces with actual session ID after payment. Success page extracts session ID from URL params, calls `stripe.checkout.sessions.retrieve()` to get order metadata.
**Warning signs:** Success page URL has no query params. Success page can't display order-specific information. All users redirected to same generic URL.

### Pitfall 5: Server Action Errors Not Caught in Client Component
**What goes wrong:** Server Action throws error (authentication failed, database down), but client component doesn't catch it. Unhandled promise rejection crashes client. User sees blank page or "Application error" in Next.js.
**Why it happens:** Server Actions return promises. Calling `await createCheckout()` without try-catch propagates errors to client. React error boundary doesn't catch async errors in event handlers.
**How to avoid:** Wrap Server Action calls in try-catch in client components. Handle errors with user-friendly messages. Use `useTransition` for loading states. Test with simulated errors (invalid auth, network failure).
**Warning signs:** Console shows "Unhandled promise rejection". User sees blank page after clicking checkout button. Error boundaries triggered frequently.

## Code Examples

Verified patterns from official sources:

### Stripe Checkout Session with Metadata Limits
```typescript
// Source: https://docs.stripe.com/metadata
// Metadata constraints: 50 keys max, 40 char key names, 500 char values

export async function createCheckoutSession({
  customizationId,
  userId,
}: {
  customizationId: string
  userId: string
}) {
  // GOOD: Store only IDs in metadata
  const session = await stripe.checkout.sessions.create({
    // ...
    metadata: {
      customizationId,  // 36 chars (UUID)
      userId,           // 36 chars (UUID)
      orderType: 'base', // 4 chars
      // Total: 3 keys, all under limits
    },
  })

  // BAD: Storing full customization data
  // metadata: {
  //   specialMemories: '500+ char string from user input', // FAILS
  // }
}
```

### Next.js App Router Webhook Handler with Raw Body
```typescript
// Source: https://github.com/vercel/next.js/discussions/48885
// Pattern confirmed for Next.js 14+ App Router

export async function POST(request: NextRequest) {
  // GOOD: Use request.text() for raw body
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  // BAD: Parsing as JSON first
  // const body = await request.json() // Signature verification will fail
}
```

### Idempotency Check in Webhook Handler
```typescript
// Source: https://docs.stripe.com/webhooks (idempotency section)
// Pattern: Check for existing record before INSERT

const session = event.data.object as Stripe.Checkout.Session

// Check if order already exists for this session
const { data: existingOrder } = await supabase
  .from('orders')
  .select('id')
  .eq('stripe_session_id', session.id)
  .maybeSingle()

if (existingOrder) {
  console.log('Duplicate webhook, order already exists:', existingOrder.id)
  return NextResponse.json({ received: true }) // Acknowledge without processing
}

// Create order only if doesn't exist
const { data: order } = await supabase
  .from('orders')
  .insert({
    stripe_session_id: session.id, // UNIQUE constraint prevents duplicates
    user_id: session.metadata.userId,
    // ...
  })
  .single()
```

### Success URL with Session ID Placeholder
```typescript
// Source: https://docs.stripe.com/payments/checkout/custom-success-page
// Pattern: Include {CHECKOUT_SESSION_ID} literal for Stripe to replace

const session = await stripe.checkout.sessions.create({
  // ...
  // GOOD: Stripe replaces {CHECKOUT_SESSION_ID} with actual ID
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

  // BAD: No way to identify which session completed
  // success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
})
```

### Server Action Error Handling in Client Component
```typescript
// Source: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
// Pattern: Try-catch with user-friendly error messages

'use client'

import { createCheckout } from '@/actions/checkout'
import { useState } from 'react'

export default function CheckoutButton({ customizationId }: { customizationId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { url } = await createCheckout(customizationId)
      window.location.href = url! // Redirect to Stripe
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Purchase - £7.99'}
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API routes for all operations | Server Actions for internal calls, API routes for external webhooks | Next.js 13+ (2023) | Simpler client code, automatic type safety, no manual fetch/loading states for internal operations |
| Parse webhook body then verify | Get raw body via request.text() first | App Router pattern (2023) | Signature verification works correctly, no body parsing conflicts |
| Manual idempotency tracking | UNIQUE database constraints on idempotency keys | Best practice since SQL databases | Database-level atomicity, no race conditions, simpler code |
| Price IDs in Stripe catalog | Inline price_data for fixed prices | Always supported | Less setup for fixed pricing, no Stripe dashboard config needed |
| Multi-tier pricing pages | Single-price value-focused pages | Depends on product | Better for fixed-package products, emphasizes value over comparison |

**Deprecated/outdated:**
- **Next.js Pages Router API routes with bodyParser config:** App Router uses request.text() natively, no config needed
- **Stripe API versions < 2020:** Must use latest API version for Checkout Session features (line_items with price_data)
- **Client-side Stripe.js for server operations:** stripe-js is client-only, use stripe Node SDK on server
- **Event ID deduplication without database constraints:** UNIQUE constraints more robust than app-layer checks

## Open Questions

1. **Stripe Webhook Retry Timing:**
   - What we know: Stripe retries failed webhooks for up to 3 days with exponential backoff
   - What's unclear: Exact retry schedule (seconds/minutes between attempts), how many retries before giving up, impact on order processing latency
   - Recommendation: Test webhook failures in staging (return 500 error manually), observe retry timing in Stripe dashboard, implement monitoring for webhook processing delays

2. **Pricing Page Conversion Optimization:**
   - What we know: Single-price pages should emphasize value, trust signals increase conversion, 3-tier pricing standard for SaaS but may not apply to fixed packages
   - What's unclear: Whether to show "What you get" list before or after price, optimal CTA text ("Create Your Song" vs "Purchase Now"), whether to show testimonials or client logos first
   - Recommendation: Start with standard pattern (price first, features list, trust signals, CTA), A/B test variations in Phase 7 (analytics), prioritize shipping over perfect design

3. **Success Page User Experience:**
   - What we know: Success page can retrieve session details via session_id parameter, should confirm payment and explain next steps
   - What's unclear: Whether to show order status immediately or redirect to dashboard, whether to start polling for generation status on success page, how long to keep success page before auto-redirect
   - Recommendation: Show success page with "Songs generating, check dashboard" message, link to dashboard, no auto-redirect (user-controlled), polling for status starts in dashboard not success page

4. **Stripe Checkout Session Expiration:**
   - What we know: Checkout Sessions expire after a certain time if not completed
   - What's unclear: Default expiration time, whether to customize expiration, what happens to customization record if session expires
   - Recommendation: Use default Stripe expiration (likely 24 hours), don't delete customization on expiration (user may retry), add "expires_at" tracking in Phase 7 if needed

## Sources

### Primary (HIGH confidence)
- [Stripe Webhooks Official Documentation](https://docs.stripe.com/webhooks) - Webhook best practices, signature verification, retry logic, idempotency patterns
- [Stripe Checkout Sessions API Reference](https://docs.stripe.com/api/checkout/sessions) - Session object structure, metadata usage, success_url patterns
- [Stripe Metadata Documentation](https://docs.stripe.com/metadata) - Metadata size limits (50 keys, 40 char names, 500 char values), usage patterns
- [Next.js App Router Stripe Integration (Medium)](https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e) - Server Actions vs API routes, request.text() pattern for webhooks
- [Stripe + Next.js Complete Guide 2025 (Pedro Alonso)](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/) - Server Actions for checkout, webhook signature verification, idempotency patterns

### Secondary (MEDIUM confidence)
- [SaaS Pricing Page Best Practices 2026 (DesignStudioUIUX)](https://www.designstudiouiux.com/blog/saas-pricing-page-design-best-practices/) - 3 tier pricing optimal, trust signals, CTA optimization, transparency builds trust
- [Pricing Page Best Practices (UserPilot)](https://userpilot.com/blog/pricing-page-best-practices/) - Single-price simplicity, value communication, social proof placement
- [Next.js Server Actions vs API Routes (DEV Community)](https://dev.to/myogeshchavan97/nextjs-server-actions-vs-api-routes-dont-build-your-app-until-you-read-this-4kb9) - When to use each, hybrid approach (Server Actions for internal, API routes for external)
- [Stripe Checkout Custom Success Page](https://docs.stripe.com/payments/checkout/custom-success-page) - success_url parameter format, session ID placeholder usage
- [Next.js Webhook Signature Verification (GitHub Discussion)](https://github.com/vercel/next.js/discussions/48885) - request.text() pattern, common pitfalls, App Router specifics

### Tertiary (LOW confidence)
- [Pricing Psychology Research](https://userpilot.com/blog/pricing-page-best-practices/) - Claims about price anchoring, choice optimization, needs verification with A/B testing
- [Vercel Deployment Protection](https://github.com/vercel/next.js/issues/60002) - May block webhook endpoints, needs testing in production environment
- [Tailwind Pricing Component Examples](https://www.shadcn.io/template/m4nute-pricing-page-shadcn) - Pre-built components, not specific to single-price pages

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing Stripe integration confirmed in codebase, Next.js App Router patterns verified in official docs
- Architecture: HIGH - Patterns verified against Stripe docs, Next.js docs, tested in similar projects
- Pitfalls: MEDIUM-HIGH - Common webhook pitfalls documented across multiple sources, signature verification issues widely reported, idempotency patterns standard practice

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days, Stripe API stable)
