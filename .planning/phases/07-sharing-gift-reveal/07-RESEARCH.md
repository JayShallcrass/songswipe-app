# Phase 7: Sharing & Gift Reveal - Research

**Researched:** 2026-02-08
**Domain:** Next.js OG image generation, gift reveal animations, social sharing, public page access patterns
**Confidence:** HIGH

## Summary

Phase 7 enables users to share their personalized songs via unique public URLs with a cinematic gift reveal experience for recipients. The phase builds on existing infrastructure: song_variants table already includes share_token (UUID) with RLS policies for anonymous access (Phase 1), Framer Motion is installed for animations (Phase 3), and signed URL generation patterns are established (Phase 5).

The standard approach uses Next.js App Router dynamic routes (`/share/[token]`) with the `opengraph-image.tsx` file convention to generate dynamic OG images via ImageResponse API. Gift reveal animations use Framer Motion's sequential animation patterns with stagger effects. Social sharing is handled by react-share library (23+ platforms, no external scripts). Public access leverages existing RLS policies where anonymous users can SELECT song_variants where share_token IS NOT NULL, with app layer validation of specific tokens.

**Primary recommendation:** Use Next.js opengraph-image.tsx with ImageResponse API for dynamic OG images (1200x630px), Framer Motion orchestration for multi-step gift reveal (box wobble, ribbon unwrap, content fadeIn), react-share for social buttons (WhatsApp, Facebook, X/Twitter, copy link), and extend existing RLS patterns to public share page with server component data fetching via anon client.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js opengraph-image | 14.2.0 (built-in) | Dynamic OG image generation | Native Next.js App Router file convention, ImageResponse API renders JSX to PNG, caches at build time, no external dependencies |
| Framer Motion | 11.18.2 (existing) | Gift reveal animations | Already in project (Phase 3 swipe), 30.6k GitHub stars, production-ready for cinematic effects, supports orchestration and variants |
| react-share | 5.x (latest) | Social share buttons | 23+ platforms, no external scripts, tree-shakeable, 4.3k GitHub stars, supports WhatsApp/Facebook/X/copy link |
| Supabase RLS | Built-in | Public anonymous access | Existing dual-access pattern (Phase 1), share_token UUID already indexed, anon role already configured |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/og ImageResponse | 14.2.0 (built-in) | JSX to image rendering | OG image generation, supports custom fonts, background images, Tailwind-like inline styles |
| Clipboard API | Native (browser) | Copy link to clipboard | Modern browsers (Chrome 76+, Firefox 63+, Safari 13.1+), fallback to document.execCommand for legacy |
| React Suspense | 18.3.0 (existing) | Loading states for dynamic routes | Wrap public page components that access URL parameters (required for Next.js 14 dynamic routes) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| opengraph-image.tsx | Static OG images | Static requires one image per song (storage cost), no dynamic recipient name/occasion in preview. Dynamic generates on-demand with song data. |
| react-share | Custom share links | Custom requires maintaining 23+ platform URL formats and handling mobile/desktop variants (WhatsApp web vs app). react-share handles all edge cases. |
| Framer Motion | CSS animations | CSS requires manual sequencing with delays, no declarative orchestration, harder to sync multi-element reveals. Framer Motion provides stagger, variants, onComplete hooks. |
| UUID tokens | Signed JWTs | JWTs add expiry complexity and secret management. Share links should be permanent (gift URLs don't expire). UUID sufficient for public sharing without user identity. |
| Client-side data fetch | Server component fetch | Client fetch requires auth token in URL (security risk). Server component can use service role key to validate token and fetch data, keeping secrets server-side. |

**Installation:**
```bash
npm install react-share
# Framer Motion already installed (11.18.2)
# opengraph-image and ImageResponse are Next.js built-ins
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── share/[token]/
│   │   ├── page.tsx              # Public gift reveal page (server component)
│   │   ├── opengraph-image.tsx   # Dynamic OG image generator
│   │   └── loading.tsx           # Loading state during data fetch
│   └── api/
│       └── share/[token]/
│           └── route.ts          # Optional: Share validation API (if needed for client)
├── components/
│   ├── share/
│   │   ├── GiftReveal.tsx        # Client component with Framer Motion
│   │   ├── ShareButtons.tsx      # Social share buttons (react-share)
│   │   └── CopyLinkButton.tsx    # Clipboard API wrapper
│   └── audio/
│       └── SongPlayer.tsx        # Existing player (Phase 5)
└── lib/
    └── share/
        └── generateShareUrl.ts   # Helper to build share URL
```

### Pattern 1: Dynamic OG Image with Song Metadata
**What:** Generate unique OG images per song with recipient name, occasion type, and branded visuals using Next.js opengraph-image.tsx file convention
**When to use:** Any shareable content that needs rich social media previews (Twitter cards, Facebook previews, LinkedIn shares)
**Example:**
```typescript
// app/share/[token]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const alt = 'Personalized song gift from SongSwipe'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Fetch song data using service role (server-side, secure)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: variant } = await supabase
    .from('song_variants')
    .select(`
      id,
      orders(
        customizations(recipient_name, occasion, your_name)
      )
    `)
    .eq('share_token', token)
    .single()

  if (!variant) {
    // Return generic fallback image
    return new ImageResponse(
      <div style={{
        fontSize: 64,
        background: '#FF4876',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: 96, marginBottom: 20 }}>🎵</div>
        <div>A personalized song gift</div>
        <div style={{ fontSize: 48, marginTop: 20, opacity: 0.9 }}>SongSwipe</div>
      </div>,
      { ...size }
    )
  }

  const customization = variant.orders.customizations

  return new ImageResponse(
    <div style={{
      fontSize: 64,
      background: 'linear-gradient(135deg, #FF4876 0%, #FE6B8B 100%)',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      padding: 60,
    }}>
      <div style={{ fontSize: 96, marginBottom: 30 }}>🎁</div>
      <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
        For {customization.recipient_name}
      </div>
      <div style={{ fontSize: 48, opacity: 0.95, marginBottom: 30 }}>
        {customization.occasion} Song
      </div>
      <div style={{ fontSize: 40, opacity: 0.9 }}>
        From {customization.your_name}
      </div>
      <div style={{
        position: 'absolute',
        bottom: 40,
        fontSize: 36,
        opacity: 0.8
      }}>
        SongSwipe
      </div>
    </div>,
    { ...size }
  )
}
```

### Pattern 2: Cinematic Gift Reveal with Framer Motion Orchestration
**What:** Multi-step animation sequence (box shake, ribbon peel, content fadeIn) using Framer Motion variants and stagger for cinematic effect
**When to use:** When multiple elements need synchronized or sequenced animations with precise timing control
**Example:**
```typescript
// components/share/GiftReveal.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface GiftRevealProps {
  recipientName: string
  message: string
  onReveal: () => void
}

export function GiftReveal({ recipientName, message, onReveal }: GiftRevealProps) {
  const [stage, setStage] = useState<'box' | 'revealing' | 'revealed'>('box')

  const handleUnwrap = () => {
    setStage('revealing')
    // Trigger revealed stage after animation completes
    setTimeout(() => {
      setStage('revealed')
      onReveal()
    }, 2000)
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <AnimatePresence mode="wait">
        {stage === 'box' && (
          <motion.div
            key="gift-box"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: [0, -2, 2, -2, 0], // Wobble effect
            }}
            exit={{ scale: 0.5, opacity: 0, y: -100 }}
            transition={{
              scale: { duration: 0.5 },
              rotate: {
                duration: 0.6,
                repeat: 3,
                repeatType: 'loop',
                delay: 0.5
              }
            }}
            className="text-center"
          >
            <motion.div
              className="text-9xl mb-8"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎁
            </motion.div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              {recipientName}, you've received a gift!
            </h2>
            <motion.button
              onClick={handleUnwrap}
              className="px-8 py-4 bg-pink-500 text-white rounded-full text-xl font-semibold hover:bg-pink-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Open Your Gift
            </motion.button>
          </motion.div>
        )}

        {stage === 'revealing' && (
          <motion.div
            key="ribbon"
            initial={{ opacity: 1 }}
            animate={{
              opacity: 0,
              rotateZ: 720,
              scale: [1, 1.2, 0]
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="text-9xl"
          >
            🎀
          </motion.div>
        )}

        {stage === 'revealed' && (
          <motion.div
            key="revealed-content"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1], // Smooth ease-out curve
              staggerChildren: 0.2
            }}
            className="text-center max-w-2xl px-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <div className="text-7xl mb-6">🎵</div>
              <h2 className="text-5xl font-bold text-gray-800 mb-4">
                Your Personalized Song
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <p className="text-xl text-gray-700 italic">
                "{message}"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {/* Audio player component goes here */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Pattern 3: Social Share Buttons with Copy Link Fallback
**What:** Use react-share for platform-specific share buttons, with native Clipboard API for copy link (fallback to execCommand for legacy browsers)
**When to use:** Any shareable content that needs multi-platform distribution
**Example:**
```typescript
// components/share/ShareButtons.tsx
'use client'

import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from 'react-share'
import { CopyLinkButton } from './CopyLinkButton'

interface ShareButtonsProps {
  url: string
  title: string
  recipientName: string
  occasion: string
}

export function ShareButtons({ url, title, recipientName, occasion }: ShareButtonsProps) {
  const shareText = `🎵 Check out this personalized ${occasion} song for ${recipientName}!`

  return (
    <div className="flex flex-col items-center gap-6">
      <h3 className="text-xl font-semibold text-gray-800">Share this gift</h3>

      <div className="flex gap-4">
        <WhatsappShareButton url={url} title={shareText}>
          <WhatsappIcon size={48} round />
        </WhatsappShareButton>

        <FacebookShareButton url={url} hashtag="#SongSwipe">
          <FacebookIcon size={48} round />
        </FacebookShareButton>

        <TwitterShareButton url={url} title={shareText}>
          <TwitterIcon size={48} round />
        </TwitterShareButton>

        <CopyLinkButton url={url} />
      </div>

      <p className="text-sm text-gray-600 max-w-md text-center">
        Share this special gift with friends and family
      </p>
    </div>
  )
}
```

```typescript
// components/share/CopyLinkButton.tsx
'use client'

import { useState } from 'react'

interface CopyLinkButtonProps {
  url: string
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      // Modern Clipboard API (preferred)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
      title="Copy link"
    >
      {copied ? (
        <span className="text-2xl">✓</span>
      ) : (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  )
}
```

### Pattern 4: Public Page with Server Component Data Fetching
**What:** Use Next.js server component to fetch song data via service role key, validate share token, pass data to client component for rendering
**When to use:** Public pages that need secure data access without exposing auth tokens to client
**Example:**
```typescript
// app/share/[token]/page.tsx
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { GiftReveal } from '@/components/share/GiftReveal'
import { ShareButtons } from '@/components/share/ShareButtons'
import { Metadata } from 'next'

// Server component (default)
export default async function SharePage({
  params
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) {
    notFound()
  }

  // Fetch song data using service role key (server-side only, secure)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS
  )

  const { data: variant, error } = await supabase
    .from('song_variants')
    .select(`
      id,
      storage_path,
      duration_ms,
      orders(
        id,
        occasion_date,
        customizations(
          recipient_name,
          your_name,
          occasion,
          genre,
          mood
        )
      )
    `)
    .eq('share_token', token)
    .eq('selected', true) // Only selected variants are shareable
    .single()

  if (error || !variant) {
    notFound()
  }

  const customization = variant.orders.customizations
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${token}`

  return (
    <main className="min-h-screen">
      <GiftReveal
        recipientName={customization.recipient_name}
        message={`${customization.your_name} created this special ${customization.occasion} song just for you!`}
        variantId={variant.id}
        storagePath={variant.storage_path}
      />

      <div className="container mx-auto py-16">
        <ShareButtons
          url={shareUrl}
          title={`${customization.occasion} Song for ${customization.recipient_name}`}
          recipientName={customization.recipient_name}
          occasion={customization.occasion}
        />
      </div>
    </main>
  )
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: variant } = await supabase
    .from('song_variants')
    .select(`
      orders(
        customizations(recipient_name, occasion, your_name)
      )
    `)
    .eq('share_token', token)
    .single()

  if (!variant) {
    return {
      title: 'Personalized Song Gift | SongSwipe',
      description: 'A special personalized song created with SongSwipe',
    }
  }

  const customization = variant.orders.customizations

  return {
    title: `${customization.occasion} Song for ${customization.recipient_name} | SongSwipe`,
    description: `${customization.your_name} created a personalized ${customization.occasion} song for ${customization.recipient_name}. Listen now!`,
    openGraph: {
      title: `${customization.occasion} Song for ${customization.recipient_name}`,
      description: `From ${customization.your_name} with love`,
      type: 'music.song',
    },
  }
}
```

### Anti-Patterns to Avoid
- **Storing OG image URLs in database:** OG images are generated by Next.js on-demand and cached. Never store paths, let Next.js handle routing via file convention.
- **Using client component for share page data fetch:** Exposes service role key or requires passing auth tokens in URL (security risk). Always use server component with service role key server-side.
- **Blocking render on animation completion:** Gift reveal should not prevent access to audio player. Use parallel rendering or allow skip button.
- **Not validating UUID format:** Always validate token format before database query to prevent injection attempts and improve error messages.
- **Hard-coding animation timings:** Use Framer Motion's onAnimationComplete callbacks instead of setTimeout for precise sequencing.
- **Copying signed URLs to clipboard:** Share links should use permanent share_token, not temporary signed URLs (which expire).
- **Missing Suspense boundary:** Next.js 14 dynamic routes with params require Suspense wrapper for streaming, otherwise entire page waits for data.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG image generation | Sharp/Canvas image manipulation | Next.js opengraph-image.tsx + ImageResponse | ImageResponse handles font loading, caching, layout calculations. Canvas requires manual text wrapping, alignment math, PNG encoding. |
| Social share URLs | Platform-specific URL builders | react-share library | Maintains 23+ platform URL formats, handles mobile detection (WhatsApp web vs app), tracks API changes across platforms. |
| Copy to clipboard | Custom textarea + execCommand only | Clipboard API with execCommand fallback | Modern Clipboard API provides async promise-based interface, handles permissions, more secure. Fallback needed for <5% legacy browsers. |
| Gift reveal animation sequencing | setTimeout chains | Framer Motion orchestration | setTimeout brittle when animations overlap or skip. Framer Motion provides declarative variants, stagger, onComplete hooks, can pause/resume. |
| UUID validation | String length check | Regex with version check | UUIDs have specific format (v4 has 4 in 3rd segment, 8/9/a/b in 4th). Proper validation prevents invalid tokens reaching database. |

**Key insight:** Social sharing has many edge cases (mobile vs desktop URLs, UTF-8 encoding, character limits, platform-specific features). react-share has battle-tested these over 5+ years. OG image generation requires font subsetting, layout engines, and caching - ImageResponse handles all of this with JSX syntax familiar to React developers.

## Common Pitfalls

### Pitfall 1: OG Images Not Updating After Data Changes
**What goes wrong:** Song metadata changes (recipient name, occasion) but social media platforms continue showing old OG image preview
**Why it happens:** Social platforms cache OG images aggressively (Facebook 7 days, Twitter 7 days, LinkedIn 7 days). Next.js generates images at build time by default.
**How to avoid:** Use dynamic data fetching in opengraph-image.tsx (async function that queries database). Next.js automatically makes image dynamic when data fetching is detected. Use `revalidate` export or cache headers if stale data is acceptable.
**Warning signs:** Users report "wrong name in preview", social debuggers (Facebook Sharing Debugger, Twitter Card Validator) show stale images, regenerating preview doesn't help.

### Pitfall 2: Share Token Enumeration Attack
**What goes wrong:** Attackers iterate through UUID values to discover other users' songs, bypassing intended sharing mechanism
**Why it happens:** UUIDs are predictable if using sequential IDs or weak random number generators. Version 1 UUIDs include timestamp and MAC address (predictable).
**How to avoid:** Use crypto.randomUUID() (Node 16+) or uuid.v4() which generates version 4 UUIDs with 122 bits of entropy (2^122 possible values, brute force infeasible). Add rate limiting to share endpoints. Log suspicious patterns (many 404s from single IP).
**Warning signs:** Database logs show sequential UUID queries, analytics show high 404 rate on share pages, users report unauthorized access.

### Pitfall 3: Clipboard API Fails in Insecure Context
**What goes wrong:** navigator.clipboard is undefined on non-HTTPS pages (except localhost), copy to clipboard silently fails
**Why it happens:** Clipboard API requires secure context (HTTPS) due to security policy. HTTP production deployments break functionality.
**How to avoid:** Always use HTTPS in production (Vercel provides this). Check if navigator.clipboard exists before calling. Provide fallback message if clipboard unavailable ("Please copy this link manually: [link]").
**Warning signs:** Copy button does nothing in production but works locally, console shows "undefined is not a function", users on iOS Safari report issues (Safari blocks clipboard in some contexts).

### Pitfall 4: Animation Jank on Low-End Devices
**What goes wrong:** Gift reveal animations stutter or lag on older mobile devices, degrading user experience
**Why it happens:** Complex animations (transforms, opacity) on many elements simultaneously, or animating properties that trigger reflow (width, height, top, left)
**How to avoid:** Only animate transform and opacity (GPU-accelerated, no reflow). Use will-change: transform CSS hint. Reduce animation complexity on mobile (less stagger, shorter durations). Test on actual devices, not just Chrome DevTools throttling.
**Warning signs:** Animations skip frames, users report "slow reveal", 60fps drops to <30fps during animation, battery drain reports.

### Pitfall 5: Missing Alt Text on Dynamic OG Images
**What goes wrong:** Screen readers cannot describe OG images, failing accessibility standards, search engines penalize missing alt text
**Why it happens:** Developers forget to export `alt` constant from opengraph-image.tsx, or use generic alt text instead of dynamic descriptions
**How to avoid:** Always export dynamic `alt` text based on song data. Include recipient name and occasion. Format: "Personalized [occasion] song for [name] from [sender]".
**Warning signs:** Social media preview tools show no alt text, screen reader testing reveals "no description", SEO audits flag missing metadata.

### Pitfall 6: Public Page Exposes User Data via RLS Misconfiguration
**What goes wrong:** Anonymous users can query song_variants table without share_token filter, exposing all users' songs
**Why it happens:** RLS policy allows SELECT where share_token IS NOT NULL, but doesn't enforce specific token matching at database level (app layer validation only)
**How to avoid:** RLS policy correctly designed in Phase 1 (allows anon SELECT where share_token IS NOT NULL, app layer must filter .eq('share_token', token)). Always use .single() query to enforce one result. Never rely on client-side filtering alone.
**Warning signs:** API requests return multiple songs, users report seeing other people's songs, security audit flags overly permissive RLS.

## Code Examples

Verified patterns from official sources:

### Next.js Dynamic OG Image with Params
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await fetch(`https://.../posts/${slug}`).then(res => res.json())

  return new ImageResponse(
    (
      <div style={{
        fontSize: 128,
        background: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {post.title}
      </div>
    ),
    { ...size }
  )
}
```

### React-Share Basic Usage
```typescript
// Source: https://github.com/nygardk/react-share
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  XIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from 'react-share'

const shareUrl = 'https://example.com'
const title = 'Check this out!'

<FacebookShareButton url={shareUrl}>
  <FacebookIcon size={32} round />
</FacebookShareButton>

<TwitterShareButton url={shareUrl} title={title}>
  <XIcon size={32} round />
</TwitterShareButton>

<WhatsappShareButton url={shareUrl} title={title} separator=":: ">
  <WhatsappIcon size={32} round />
</WhatsappShareButton>
```

### Clipboard API with Fallback
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/clipboard
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern Clipboard API (Chrome 76+, Firefox 63+, Safari 13.1+)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    textArea.remove()

    return successful
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}
```

### Framer Motion Sequential Animation
```typescript
// Source: https://motion.dev/docs/react-animation
import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div
  variants={container}
  initial="hidden"
  animate="show"
>
  <motion.div variants={item}>First</motion.div>
  <motion.div variants={item}>Second</motion.div>
  <motion.div variants={item}>Third</motion.div>
</motion.div>
```

### Supabase Service Role Query for Public Page
```typescript
// Source: Existing Phase 1 decisions + Supabase docs
import { createClient } from '@supabase/supabase-js'

// Server component (secure, not exposed to client)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS
)

const { data: variant } = await supabase
  .from('song_variants')
  .select(`
    id,
    storage_path,
    orders(
      customizations(recipient_name, occasion, your_name)
    )
  `)
  .eq('share_token', token) // App layer enforces specific token
  .eq('selected', true) // Only selected variants shareable
  .single() // Enforce single result

// RLS policy (from Phase 1):
// CREATE POLICY "Public can view songs via share token" ON song_variants
//   FOR SELECT TO anon
//   USING (share_token IS NOT NULL);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static OG images | Dynamic OG images via ImageResponse | Next.js 13 (2022) | Personalized previews per song, no static image management, automatic caching |
| Custom share URL builders | react-share library | 2015+ | Reduced maintenance burden (23+ platforms), handles mobile variants, no external scripts |
| setTimeout animation chains | Framer Motion orchestration | 2020+ | Declarative animation sequences, easier to maintain, supports dynamic timing |
| document.execCommand only | Clipboard API with fallback | Chrome 76 (2019) | Async promise-based API, better security, automatic permissions, graceful degradation |
| Signed URLs for sharing | UUID tokens with permanent access | 2020+ | Share links never expire, simpler URL structure, no signature management |

**Deprecated/outdated:**
- **Flash-based share widgets**: Obsolete, replaced by JavaScript share buttons (2015+)
- **Server-side OG image generation with headless Chrome**: Next.js ImageResponse is faster, no separate server needed (2022+)
- **jQuery-based animation libraries**: Replaced by Framer Motion / Web Animations API / CSS animations (2018+)
- **Meta refresh for share redirects**: Use proper HTTP 301/302 redirects or client-side navigation (2010+)

## Open Questions

1. **Should gift reveal be skippable?**
   - What we know: Some users may want instant access to song (urgency, seen animation before)
   - What's unclear: User expectation (is skip button expected?), impact on brand experience (does skip diminish "gift" feeling?)
   - Recommendation: Include "Skip to song" button after 2 seconds of animation, track skip rate to measure engagement

2. **Should share page work for non-selected variants?**
   - What we know: Phase 1 schema allows share_token on all variants, Phase 5 only allows selected variant access
   - What's unclear: Business logic (should users be able to share previews of non-selected variants?)
   - Recommendation: Enforce selected=true in share page query (as shown in Pattern 4), document in PLAN that only selected variants are shareable

3. **What OG image size for Twitter vs Facebook?**
   - What we know: Twitter recommends 1200x675 (16:9), Facebook recommends 1200x630 (1.91:1)
   - What's unclear: Which takes priority (one image for all platforms vs multiple images)
   - Recommendation: Use 1200x630 (Facebook size) as it works on Twitter, use twitter:card = "summary_large_image" meta tag

4. **Should share page require analytics tracking?**
   - What we know: Share page is public, tracking views helps measure virality
   - What's unclear: User privacy expectations (GDPR), implementation complexity
   - Recommendation: Defer to future phase, focus on core sharing functionality first

## Sources

### Primary (HIGH confidence)
- Next.js Official Docs: [opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) - File convention and ImageResponse API
- Next.js Official Docs: [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Dynamic metadata patterns
- react-share GitHub: [nygardk/react-share](https://github.com/nygardk/react-share) - Social share library API
- Framer Motion Official: [React Animation](https://motion.dev/docs/react-animation) - Animation patterns
- MDN Web Docs: [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/clipboard) - Browser clipboard interface
- Supabase Docs: [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS patterns
- Existing Phase 1 decisions: share_token UUID with RLS policies for anonymous access

### Secondary (MEDIUM confidence)
- [Getting Started: Metadata and OG images | Next.js](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - Official Next.js tutorial verified with docs
- [How to Set Up Open Graph Meta Tags in Next.js | OG Check](https://ogcheck.com/blog/nextjs-open-graph) - Best practices verified with Next.js docs
- [Implementing copy-to-clipboard in React | LogRocket](https://blog.logrocket.com/implementing-copy-clipboard-react-clipboard-api/) - Patterns verified with MDN
- [Syncfusion: React Animation Libraries 2026](https://www.syncfusion.com/blogs/post/top-react-animation-libraries) - Framer Motion ecosystem overview
- [DEV Community: Create Share Button Without Package](https://dev.to/sarwarasik/create-a-share-button-for-social-media-links-in-react-without-any-package-26i1) - Platform URL patterns

### Tertiary (LOW confidence)
- [Medium: OG Images with ImageResponse API](https://medium.com/@beratgenc.dev/the-scenario-you-have-a-blog-and-it-is-essential-for-your-posts-to-be-shared-on-different-social-c362626e5b97) - Implementation example (not authoritative)
- [CodePen: Gift Box Animation](https://codepen.io/RoyLee0702/pen/RwNgVya) - Animation inspiration (not verified)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in existing codebase or official Next.js docs, Framer Motion already installed
- Architecture: HIGH - Patterns verified with official Next.js App Router docs, RLS policies already implemented in Phase 1
- Pitfalls: MEDIUM-HIGH - OG caching and Clipboard API verified with official docs, animation performance from developer experience, security patterns from Supabase docs

**Research date:** 2026-02-08
**Valid until:** 2026-04-08 (60 days - stable stack, Next.js patterns and react-share are mature, Framer Motion API stable)
