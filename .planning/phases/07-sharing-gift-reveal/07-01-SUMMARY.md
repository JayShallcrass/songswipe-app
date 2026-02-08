---
phase: 07-sharing-gift-reveal
plan: 01
subsystem: public-sharing
tags: [nextjs, server-component, og-image, metadata, seo, social-sharing]
requires:
  - 01-01-database-schema
  - 05-01-song-delivery-api
provides:
  - Public share page route at /share/[token]
  - Dynamic OG image generation for social media
  - Share URL helper utility
affects:
  - 07-02-gift-reveal-ui
  - 07-03-social-sharing
tech-stack:
  added: [next/og]
  patterns:
    - Server component data fetching with service role
    - Dynamic metadata generation
    - ImageResponse for OG images
key-files:
  created:
    - src/app/share/[token]/page.tsx
    - src/app/share/[token]/loading.tsx
    - src/app/share/[token]/opengraph-image.tsx
    - src/lib/share/generateShareUrl.ts
  modified: []
decisions:
  - token: uuid-validation-404
    what: Invalid UUID tokens trigger 404 via notFound()
    why: Better UX than showing error page, prevents token enumeration
  - token: service-role-public-access
    what: Share page uses service role Supabase client for public access
    why: No authentication required, bypasses RLS while maintaining security through share_token filter
  - token: og-image-gradient
    what: OG images use purple-to-pink gradient matching app theme
    why: Brand consistency across sharing experience
  - token: format-occasion-helper
    what: formatOccasion helper capitalizes and removes hyphens
    why: Clean display of occasions in metadata and OG images
metrics:
  duration: 1.6 min
  completed: 2026-02-08
---

# Phase 07 Plan 01: Share Page Server Component Summary

Public share page foundation with server-side data fetching via service role key, personalized metadata for SEO, and dynamic OG images for social media previews

## What Was Built

### Share Page Infrastructure
- **Route**: `/share/[token]` as Next.js server component
- **Data fetching**: Service role Supabase client bypasses RLS for public access
- **Token validation**: UUID regex with 404 for invalid tokens
- **Query pattern**: Filter by share_token + selected + generation_status='complete'
- **Data unwrapping**: Same pattern as `/api/songs/[id]` for nested orders/customizations

### Dynamic Metadata
- **generateMetadata**: Async function returns personalized title/description
- **SEO optimization**: `{Occasion} Song for {RecipientName} | SongSwipe`
- **OpenGraph**: Custom title, description, type='music.song'
- **Twitter Card**: summary_large_image for large previews
- **Fallback**: Generic metadata for invalid tokens

### OG Image Generation
- **File convention**: `opengraph-image.tsx` in route directory
- **Size**: 1200x630 PNG (standard social media format)
- **Personalization**: Recipient name, occasion, sender name, gift emoji
- **Branding**: SongSwipe at bottom, purple-to-pink gradient background
- **Fallback**: Generic branded image with music note emoji for invalid tokens
- **Technology**: next/og ImageResponse with inline styles (Satori subset)

### Supporting Files
- **generateShareUrl**: Helper builds full URL from token using NEXT_PUBLIC_APP_URL
- **loading.tsx**: Skeleton with gradient background and "Loading your gift..." message
- **Placeholders**: Comments for GiftReveal and ShareButtons (Plan 02)

## Technical Decisions

**UUID Validation Pattern**
Used stricter UUID v4 regex (`4` in third group, `[89ab]` in fourth group) vs generic UUID format. Triggers `notFound()` from `next/navigation` for better UX than error messages.

**Service Role Public Access**
Share page intentionally skips authentication and uses service role key. Security maintained through:
- Share tokens are UUIDs (not guessable)
- Filter enforces selected=true + generation_status='complete'
- Only completed, selected variants accessible
- No RLS bypass risk since query is highly specific

**Dynamic Metadata vs Static**
Each share token generates unique metadata at request time. Alternative (static generation) would require build-time knowledge of all tokens. Dynamic approach supports unlimited share links without rebuilds.

**OG Image Inline Styles**
ImageResponse uses Satori which only supports CSS-in-JS objects (not Tailwind). All styling as inline style props with flexbox layouts. No custom font loading in v1 (uses system fonts).

## Data Flow

```
User visits /share/{token}
  ↓
Next.js calls page.tsx + generateMetadata + opengraph-image.tsx
  ↓
All three fetch from song_variants table (service role client)
  ↓
Filter: share_token + selected + generation_status='complete'
  ↓
Join: orders → customizations
  ↓
Unwrap nested data (array or object forms)
  ↓
page.tsx renders HTML, metadata in <head>, OG image at /share/{token}/opengraph-image
```

## Verification Results

All verification criteria passed:
- ✓ TypeScript compiles with zero errors
- ✓ Share page route exists at correct path
- ✓ generateMetadata exports and returns personalized data
- ✓ OG image exports alt, size, contentType, default function
- ✓ Loading skeleton exists
- ✓ Share URL helper exists
- ✓ No authentication required
- ✓ Invalid UUID tokens trigger 404

## Task Commits

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Share page server component with data fetching | 87c0c4e | page.tsx, loading.tsx, generateShareUrl.ts |
| 2 | Dynamic OG image generator | 119956a | opengraph-image.tsx |

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

**Dependencies:**
- `createServerSupabaseClient` from src/lib/supabase.ts
- Database schema from 01-01 (song_variants, orders, customizations tables)
- share_token column with UNIQUE constraint

**Consumed by:**
- Plan 07-02: GiftReveal client component will replace placeholder
- Plan 07-03: ShareButtons will use generateShareUrl helper

## Next Phase Readiness

**Plan 07-02 can begin immediately:**
- Share page route established
- Data fetching pattern proven
- Placeholders marked for client components

**No blockers identified.**

## Self-Check: PASSED
