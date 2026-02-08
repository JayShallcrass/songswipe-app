# Coding Conventions

**Analysis Date:** 2026-02-08

## Naming Patterns

**Files:**
- Page components: PascalCase in `src/app/[route]/page.tsx` (e.g., `page.tsx`)
- API route handlers: `route.ts` in `src/app/api/[route]/route.ts`
- Components: PascalCase filenames in `src/components/` (e.g., `Header.tsx`, `SwipeInterface.tsx`)
- Utilities/libraries: camelCase filenames in `src/lib/` (e.g., `stripe.ts`, `elevenlabs.ts`)
- Type files: `database.ts` in `src/types/`

**Functions:**
- camelCase for all functions: `createCheckoutSession()`, `buildPrompt()`, `generateSong()`, `handleSwipe()`
- Event handlers: `handle[EventName]` pattern (e.g., `handleSwipe()`, `handleNext()`, `handleBack()`, `handleKeyDown()`)
- Helper functions: descriptive camelCase (e.g., `verifyWebhookSignature()`, `buildPrompt()`, `createServerSupabaseClient()`)
- Internal async operations: `[noun]And[verb]` pattern (e.g., `generateAndStoreSong()`)

**Variables:**
- camelCase for all variables: `currentIndex`, `customizationId`, `isLoading`, `formData`, `supabase`
- Boolean flags: prefix with `is` or `has` (e.g., `isActive`, `isPlaying`, `isDragging`, `isLoading`)
- Array variables: plural form (e.g., `selections`, `moods`, `genres`, `errors`)
- React hooks: `[noun][State]` pattern (e.g., `currentIndex` for state, `setCurrentIndex` for setter)
- Direction/type enums: lowercase enum values (e.g., `'left' | 'right'`, `'paid' | 'generating' | 'completed'`)

**Types:**
- Interface names: PascalCase (e.g., `SwipeCardProps`, `SwipeInterfaceProps`, `OrderDetails`, `Database`)
- Type aliases: PascalCase (e.g., `Customization`, `Json`)
- Enum values: kebab-case for string enums (e.g., `'valentines'`, `'just-because'`, `'funny'`)
- Enum key names: UPPER_SNAKE_CASE when used as constants (e.g., `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`)

## Code Style

**Formatting:**
- Prettier: Configured via `.prettierrc` (assumed default)
- Indentation: 2 spaces
- Line length: No enforced limit observed
- Semicolons: Always present at end of statements
- Quotes: Single quotes for strings (e.g., `'use client'`, `'hello'`)
- Trailing commas: Used in multi-line objects/arrays

**Linting:**
- ESLint: Enabled via Next.js config with `npm run lint`
- No custom `.eslintrc` file found
- Next.js provides default ESLint rules

## Import Organization

**Order:**
1. External packages (React, Next.js, third-party libraries)
2. Internal utilities and types (via `@/` alias)
3. Relative imports (if any)

**Examples:**
```typescript
// Header.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
```

```typescript
// elevenlabs.ts
import { z } from 'zod'
```

```typescript
// stripe.ts
import Stripe from 'stripe'
```

```typescript
// customize/page.tsx
import { useState, useEffect } from 'react'
import { customizationSchema, type Customization } from '@/lib/elevenlabs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
```

**Path Aliases:**
- `@/*` maps to `./src/*` as configured in `tsconfig.json`
- Used consistently for internal imports: `@/lib/stripe`, `@/components/Header`, `@/types/database`

**Type Imports:**
- Use `type` keyword for type-only imports: `import { type Customization } from '@/lib/elevenlabs'`
- Mixes with other imports: `import { customizationSchema, type Customization }`

## Error Handling

**Patterns:**
- Try-catch blocks for all async operations (26 instances found)
- Error logging via `console.error()` with context: `console.error('Webhook signature verification failed:', err)`
- Database/API errors: Check `.error` property from response destructuring: `const { data, error } = await supabase.from('orders').select()` then `if (error) { console.error(...); return NextResponse.json(...) }`
- HTTP error handling: Check `.ok` property on fetch responses: `if (!response.ok) { const error = await response.text(); throw new Error(...) }`
- Authentication: Null check on user object: `const { data: { user } } = await supabase.auth.getUser(); if (!user) { return NextResponse.json(...) }`
- Redirect errors: Use `NextResponse.redirect()` with error in query string: `NextResponse.redirect(...?error=${encodeURIComponent(error.message)}`
- Form validation errors: Zod schema returns `success` boolean: `if (!validationResult.success) { return NextResponse.json({ error: validationResult.error.errors }) }`
- Async failures: Catch block at function level, update status and log: `catch (error) { console.error(...); await supabase.from('orders').update({ status: 'failed' }) }`

## Logging

**Framework:** `console` methods only (console.error, console.log)

**Patterns:**
- Errors: `console.error('[Context]: [Details]', [optional data])`
- Events: `console.log('[Action completed]: [details]')`
- Examples:
  ```typescript
  console.error('Webhook signature verification failed:', err)
  console.error('Missing metadata in session:', session.id)
  console.error('Failed to create order:', orderError)
  console.error('Payment failed:', paymentIntent.id)
  console.log(`Unhandled event type: ${event.type}`)
  console.log(`Song generated successfully for order ${orderId}`)
  console.error('Song generation failed:', error)
  console.error('Error fetching orders:', error)
  console.error('Database error:', dbError)
  console.error('Error in customize API:', error)
  ```

**When to Log:**
- Async operations that may fail (database, API calls, file uploads)
- Validation failures and error states
- Payment/webhook events for audit trail
- Errors that affect user experience should also have user-facing feedback

## Comments

**When to Comment:**
- Business logic that isn't obvious: `// Create order record`, `// Generate song via Eleven Labs API`
- Non-standard implementations: `// Use 'as any' to bypass type check for beta versions`
- Async side effects: `// Start song generation (async)` when function continues without await
- State management intent: `// Don't show header on dashboard, auth pages, or customize`
- Configuration defaults: `// Create checkout session` at function definition
- Client vs server distinction: `// Client-side Supabase client (anon key is safe to expose)`, `// Server-side client with service role (for admin operations)`

**JSDoc/TSDoc:**
- Not extensively used in codebase
- Function parameters have inline type annotations instead of JSDoc blocks
- Complex types documented inline with TypeScript interfaces

## Function Design

**Size:** Functions are generally small and focused:
- API route handlers: 30-100 lines (single responsibility)
- React components: 50-200 lines (includes JSX)
- Helper functions: 10-30 lines

**Parameters:**
- Named parameters using destructuring objects for multiple args: `async function createCheckoutSession({ customizationId, userId, email, amount, successUrl, cancelUrl })`
- Default values included in destructuring: `amount = 799`
- Optional parameters marked with `?` in type definitions
- Type annotations for all parameters using TypeScript

**Return Values:**
- Explicit type annotations: `async function createCheckoutSession(...): Promise<Stripe.Checkout.Session>`
- Use of union types for error cases: `const { data, error } = await supabase...` (Supabase pattern)
- Zod schema returns: `validationResult.success` boolean check
- Fetch returns: Check `.ok` property and parse response
- React components: No explicit return type (inferred)

## Module Design

**Exports:**
- Named exports for utilities: `export async function createCheckoutSession() { ... }`, `export function verifyWebhookSignature() { ... }`
- Default exports for pages/components: `export default function Header() { ... }`
- Mixed exports for complex modules: `export const stripe = ...` + `export async function createCheckoutSession() { ... }`

**Barrel Files:**
- Not used in codebase
- Direct imports from source files: `import { createCheckoutSession } from '@/lib/stripe'`

## Client vs Server Context

**Directive Usage:**
- `'use client'` at top of client components: `src/components/Header.tsx`, `src/app/customize/page.tsx`, `src/components/SwipeInterface.tsx`
- No directive = server component by default (Next.js 14 App Router)
- API routes are implicitly server-side

**Patterns:**
- React hooks (useState, useEffect, useCallback) only in `'use client'` components
- Direct environment variable access in server routes: `process.env.STRIPE_SECRET_KEY!`
- Client components must access sensitive keys via API routes, not directly

## TypeScript Usage

**Strict Mode:** Enabled in `tsconfig.json`:
- `"strict": true` enforces strict type checking
- Non-null assertions used selectively: `process.env.STRIPE_SECRET_KEY!`
- Type guards for optional values: `if (!user)`, `if (error)`

**Zod Validation:**
- Used for runtime schema validation: `customizationSchema` in `src/lib/elevenlabs.ts`
- Returns `Result` type with `.success` and `.data` or `.error`
- Type inference via `z.infer<typeof schema>`: `export type Customization = z.infer<typeof customizationSchema>`

---

*Convention analysis: 2026-02-08*
