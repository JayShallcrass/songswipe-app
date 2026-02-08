# Testing Patterns

**Analysis Date:** 2026-02-08

## Test Framework

**Status:** NOT CONFIGURED - No test framework installed

**Dependencies Not Present:**
- Jest (not in package.json)
- Vitest (not in package.json)
- Testing Library (not in package.json)
- Cypress or Playwright for E2E (not configured)

**Finding:** One test file exists in `.claude/` directory but is unrelated to production code:
- `.claude/get-shit-done/bin/gsd-tools.test.js` (part of GSD tooling)

**Recommendation:** Testing infrastructure needs to be established before writing tests.

## Test File Organization

**Current State:** No test files for production code

**Suggested Convention (based on codebase style):**
- Co-located pattern: Place `.test.ts` or `.spec.ts` file next to source file
- Example structure:
  ```
  src/
  ├── lib/
  │   ├── stripe.ts
  │   ├── stripe.test.ts
  │   ├── elevenlabs.ts
  │   └── elevenlabs.test.ts
  └── app/
      └── api/
          └── webhook/
              ├── route.ts
              └── route.test.ts
  ```

**Naming Convention:**
- `[filename].test.ts` for unit tests
- `[filename].spec.ts` for integration tests (if used)

## Test Structure

**Pattern (to implement):**
Given codebase uses async/await and functional approach, tests should follow:

```typescript
// Example test structure based on codebase style
describe('stripe', () => {
  describe('createCheckoutSession', () => {
    it('should create a valid checkout session', async () => {
      // Arrange: Set up test data
      const mockInput = {
        customizationId: 'test-123',
        userId: 'user-456',
        email: 'test@example.com'
      }

      // Act: Call function
      const session = await createCheckoutSession(mockInput)

      // Assert: Verify output
      expect(session).toHaveProperty('url')
      expect(session.metadata?.customizationId).toBe('test-123')
    })

    it('should throw when STRIPE_SECRET_KEY is missing', async () => {
      // Arrange: Mock missing env var
      delete process.env.STRIPE_SECRET_KEY

      // Act & Assert
      expect(() => {
        new Stripe(process.env.STRIPE_SECRET_KEY!)
      }).toThrow()
    })
  })
})
```

**Setup Pattern:**
- Describe block per module/function
- Nested describe blocks for related functionality
- Async test functions for async code
- No explicit setup/teardown observed in codebase

**Teardown Pattern:**
- Not used (no persistent state in functions)
- Mock cleanup would be handled by test framework

**Assertion Pattern:**
- Use Jest matcher syntax (e.g., `expect(...).toEqual(...)`)
- Null checks: `expect(value).toBeDefined()`, `expect(value).not.toBeNull()`
- String checks: `expect(string).toMatch(regex)`
- Exception checks: `expect(() => fn()).toThrow()`

## Mocking

**Framework:** Jest (when implemented) with manual mocks

**Mock Patterns (to implement):**

```typescript
// Mock external services
jest.mock('@supabase/supabase-js')
jest.mock('stripe')

// Mock environment variables
const originalEnv = process.env
beforeEach(() => {
  process.env = { ...originalEnv }
})
afterEach(() => {
  process.env = originalEnv
})

// Example: Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } }
    })
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: { id: 'customization-123' },
      error: null
    })
  })
}

jest.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: jest.fn(() => mockSupabaseClient)
}))
```

**What to Mock:**
- External API clients: Stripe, Eleven Labs, Supabase
- Environment variables (configure per test)
- Fetch requests using jest.mock or MSW
- Next.js specific utilities: `useRouter()`, `usePathname()`

**What NOT to Mock:**
- Zod schema validation (test real validation logic)
- Business logic in lib functions (test actual prompts, calculations)
- HTTP status codes and response structures (should match real API)
- Authentication flow (critical path, mock at service level not schema level)

## Fixtures and Factories

**Test Data (to establish):**

```typescript
// fixtures/customization.ts
export const mockCustomization = {
  recipientName: 'Sarah',
  yourName: 'John',
  occasion: 'birthday' as const,
  songLength: '90',
  mood: ['happy', 'romantic'] as const,
  genre: 'pop' as const,
  specialMemories: 'Our first trip to Paris',
  thingsToAvoid: 'Anything sad'
}

export const mockOrder = {
  id: 'order-123',
  user_id: 'user-456',
  customization_id: 'cust-789',
  stripe_session_id: 'cs_test_abc123',
  status: 'paid' as const,
  amount: 799,
  created_at: '2026-02-08T10:00:00Z',
  updated_at: '2026-02-08T10:00:00Z'
}

// fixtures/stripe.ts
export const mockStripeSession = {
  id: 'cs_test_abc123',
  url: 'https://checkout.stripe.com/pay/cs_test_abc123',
  amount_total: 799,
  customer_email: 'test@example.com',
  metadata: {
    customizationId: 'cust-789',
    userId: 'user-456'
  }
}
```

**Location:**
- Create `src/__tests__/fixtures/` directory for test data
- One file per domain: `customization.ts`, `stripe.ts`, `supabase.ts`

## Coverage

**Requirements:** No coverage targets enforced (none configured in package.json)

**Current State:** 0% - No tests exist

**View Coverage (when implemented):**
```bash
npm test -- --coverage
```

**Target Areas (high priority):**
- API route handlers in `src/app/api/` (payment flow, webhooks, validation)
- Lib utilities in `src/lib/` (schema validation, prompt building, API integration)
- Authentication flows in `src/app/auth/`

**Low priority:**
- UI components in `src/components/` (interactive, tested manually)
- Page routes (render tests, lower business impact)

## Test Types

**Unit Tests:**
- Scope: Single function/module in isolation
- Approach: Mock external dependencies (Supabase, Stripe, Eleven Labs)
- Files to test:
  - `src/lib/stripe.ts` - createCheckoutSession, verifyWebhookSignature
  - `src/lib/elevenlabs.ts` - buildPrompt, customizationSchema validation
  - `src/lib/supabase.ts` - client initialization logic

**Integration Tests:**
- Scope: Multiple modules working together
- Approach: Mock external APIs, test real internal dependencies
- Examples:
  - Webhook route handling: Verify signature -> Create order -> Queue song generation
  - Customize API: Validate input -> Save to DB -> Create Stripe session
  - Auth flow: Sign up -> Send email -> Callback -> Create user session

**E2E Tests:**
- Framework: Not implemented (suggest Playwright when needed)
- Scope: Full user journeys
- Examples:
  - Create account -> Fill customization form -> Checkout -> Download song
  - Sign in -> View orders -> Play preview -> Download song

## Common Patterns

**Async Testing:**

```typescript
// Test async function with proper error handling
it('should handle async errors gracefully', async () => {
  // Arrange
  jest.mock('@/lib/stripe', () => ({
    createCheckoutSession: jest.fn().mockRejectedValue(new Error('API error'))
  }))

  // Act & Assert
  await expect(createCheckoutSession({...})).rejects.toThrow('API error')
})

// Test async function that succeeds
it('should return session on success', async () => {
  const result = await createCheckoutSession({...})
  expect(result.url).toBeDefined()
})
```

**Error Testing:**

```typescript
// Test validation errors (Zod)
it('should reject invalid customization data', () => {
  const invalid = { recipientName: '' } // violates min(1)
  const result = customizationSchema.safeParse(invalid)
  expect(result.success).toBe(false)
  expect(result.error.errors).toContainEqual(
    expect.objectContaining({
      path: ['recipientName'],
      message: expect.stringContaining('required')
    })
  )
})

// Test API response errors
it('should return 400 for invalid input', async () => {
  const req = new NextRequest('http://localhost:3000/api/customize', {
    method: 'POST',
    body: JSON.stringify({ recipientName: '' })
  })

  const res = await POST(req)
  expect(res.status).toBe(400)
  const data = await res.json()
  expect(data.error).toBeDefined()
})

// Test try-catch paths
it('should catch and log errors', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

  // Trigger error path
  await generateAndStoreSong('invalid-id', 'order-123', 'user-456')

  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('failed'),
    expect.any(Error)
  )
  consoleSpy.mockRestore()
})
```

**HTTP Response Testing:**

```typescript
// Test NextResponse patterns
it('should return redirect on successful signup', async () => {
  const req = new NextRequest('http://localhost:3000/auth/login/actions', {
    method: 'POST',
    body: new FormData() // with email, password, action='signup'
  })

  const res = await POST(req)
  expect(res.status).toBe(303) // See Other redirect
  expect(res.headers.get('location')).toContain('/auth/login?message=')
})

// Test JSON response
it('should return JSON error', async () => {
  const req = new NextRequest('http://localhost:3000/api/orders', {
    method: 'GET'
  })

  const res = await GET(req)
  const data = await res.json()
  expect(data).toEqual({ orders: [] })
})
```

## Setup Instructions (To Implement)

Install test framework:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest ts-jest
npm install --save-dev jest-mock-extended
```

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/page.tsx',
  ],
}
```

Add test script to `package.json`:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

---

*Testing analysis: 2026-02-08*
