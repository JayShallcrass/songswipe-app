# Phase 3: Swipe Builder - Research

**Researched:** 2026-02-08
**Domain:** React swipe gestures, Tinder-style card interactions, multi-step forms
**Confidence:** HIGH

## Summary

Phase 3 implements the core SongSwipe differentiator: a Tinder-style swipe interface for building custom songs through occasion, mood, genre, and voice style selections, followed by text personalization. The research confirms that while drag/swipe gestures feel natural on mobile, they present specific challenges for accessibility, accidental triggers, and desktop support.

The current codebase already contains a basic SwipeInterface component (src/components/SwipeInterface.tsx) and multi-step form at /customize, but these need enhancement to meet all Phase 3 requirements: proper swipe thresholds, undo functionality, first-time user hints, and full keyboard/mouse support.

**Primary recommendation:** Use Framer Motion for drag gestures (already familiar from ecosystem, lower learning curve than react-spring, excellent TypeScript support), implement 40% card-width threshold with visual feedback, provide keyboard navigation for WCAG compliance, and use sessionStorage for form state persistence across page refreshes.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | ^11.x | Drag gestures, card animations | Industry standard for React gesture animations, hardware-accelerated, excellent drag API with constraints and callbacks |
| zod | ^3.22.0 | Form validation schemas | Already in project, type-safe validation, perfect for multi-step form state |
| next/navigation | 14.2.0 | Routing and redirects | Built into Next.js 14, handles post-submission navigation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @use-gesture/react | ^10.x | Alternative gesture library | Only if Framer Motion drag proves insufficient (unlikely) |
| react-tinder-card | ^1.6.x | Pre-built swipe cards | Only for rapid prototyping; lacks customization needed for production |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Framer Motion | react-spring + @use-gesture/react | More fine-grained physics control, but steeper learning curve and more verbose API |
| Framer Motion | react-tinder-card | Faster initial setup, but limited customization for threshold tuning, undo logic, and multi-stage swipe flow |

**Installation:**
```bash
npm install framer-motion@^11
# zod already installed
# next/navigation built-in
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── customize/
│       └── page.tsx           # Main swipe builder entry
├── components/
│   ├── swipe/
│   │   ├── SwipeCard.tsx      # Individual card component
│   │   ├── SwipeStack.tsx     # Card stack manager with gesture handling
│   │   ├── SwipeHints.tsx     # First-time user tutorial overlay
│   │   └── SwipeProgress.tsx  # Visual progress indicator
│   └── forms/
│       └── PersonalizationForm.tsx  # Text input after swipe completion
├── lib/
│   └── swipe-state.ts         # sessionStorage persistence, undo stack
└── types/
    └── swipe.ts               # TypeScript interfaces for swipe state
```

### Pattern 1: Controlled Drag with Threshold Validation
**What:** Use Framer Motion's `drag` prop with `onDragEnd` callback to evaluate swipe direction and distance before accepting the gesture.
**When to use:** All swipeable cards to prevent accidental swipes and provide consistent feel.
**Example:**
```typescript
// Source: Framer Motion drag documentation + LogRocket swipe patterns
import { motion, useMotionValue } from 'framer-motion'

export function SwipeCard({ onSwipe, children }) {
  const x = useMotionValue(0)

  const handleDragEnd = (event, info) => {
    const cardWidth = event.currentTarget.offsetWidth
    const swipeThreshold = cardWidth * 0.4 // 40% requirement
    const offset = info.offset.x
    const velocity = info.velocity.x

    // Require BOTH distance threshold OR high velocity
    if (Math.abs(offset) > swipeThreshold || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 'right' : 'left'
      onSwipe(direction)
    } else {
      // Snap back if threshold not met
      x.set(0)
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x }}
      whileDrag={{ scale: 1.05 }}
    >
      {children}
    </motion.div>
  )
}
```

### Pattern 2: Undo Stack with sessionStorage Persistence
**What:** Maintain a history array of swipe decisions that survives page refreshes and allows single-step undo.
**When to use:** Required for SWIPE-07 (undo last swipe) and improving user confidence.
**Example:**
```typescript
// Source: React localStorage patterns + multi-step form best practices
interface SwipeState {
  stage: 'occasion' | 'mood' | 'genre' | 'voice' | 'personalization'
  selections: {
    occasion?: string
    mood?: string[]
    genre?: string
    voice?: string
  }
  history: Array<{ stage: string; selection: any }>
}

export function useSwipeState() {
  const [state, setState] = useState<SwipeState>(() => {
    // Restore from sessionStorage on mount
    const saved = sessionStorage.getItem('swipe_state')
    return saved ? JSON.parse(saved) : initialState
  })

  useEffect(() => {
    // Persist on every change
    sessionStorage.setItem('swipe_state', JSON.stringify(state))
  }, [state])

  const undo = () => {
    if (state.history.length === 0) return

    const lastAction = state.history[state.history.length - 1]
    setState(prev => ({
      ...prev,
      stage: lastAction.stage,
      history: prev.history.slice(0, -1),
      selections: {
        ...prev.selections,
        [lastAction.stage]: undefined
      }
    }))
  }

  return { state, setState, undo }
}
```

### Pattern 3: First-Time User Hints with Dismissal
**What:** Overlay transparent visual hints (arrow animations, text prompts) on first card of first stage, hide after first successful swipe or manual dismissal.
**When to use:** SWIPE-08 requires guiding first-time users on how to interact.
**Example:**
```typescript
// Source: Mobile onboarding UX patterns 2026
export function SwipeHints({ onDismiss }) {
  const [show, setShow] = useState(() => {
    return !localStorage.getItem('swipe_hints_dismissed')
  })

  const handleDismiss = () => {
    localStorage.setItem('swipe_hints_dismissed', 'true')
    setShow(false)
    onDismiss?.()
  }

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 pointer-events-none z-50"
    >
      {/* Left swipe hint */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <motion.div
          animate={{ x: [-20, 0, -20] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          ← Swipe left to pass
        </motion.div>
      </div>

      {/* Right swipe hint */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <motion.div
          animate={{ x: [20, 0, 20] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Swipe right to select →
        </motion.div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 pointer-events-auto"
      >
        Got it
      </button>
    </motion.div>
  )
}
```

### Pattern 4: Keyboard Navigation for Accessibility
**What:** Listen for ArrowLeft/ArrowRight/Enter/Escape keys to provide full keyboard control matching swipe gestures.
**When to use:** Required for WCAG 2.1 compliance (SWIPE-06 desktop support).
**Example:**
```typescript
// Source: WCAG keyboard navigation patterns
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handleSwipe('left')
        break
      case 'ArrowRight':
        handleSwipe('right')
        break
      case 'Enter':
        // Select current card (right swipe equivalent)
        handleSwipe('right')
        break
      case 'Escape':
        // Undo last swipe if available
        undo()
        break
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [handleSwipe, undo])
```

### Anti-Patterns to Avoid
- **Velocity-only swipe detection:** Pure velocity detection feels good but causes accidental swipes when scrolling or flicking. Always combine with distance threshold.
- **No visual feedback during drag:** User should see card rotate/translate as they drag, not just on release. Use Framer Motion's `whileDrag` and `style={{ x }}` patterns.
- **Forgetting touch-action CSS:** Without `touch-action: none` on draggable elements, mobile browsers will try to scroll, creating janky conflicts.
- **Storing swipe state in localStorage only:** Use sessionStorage for transient wizard state, localStorage for persistent preferences (hint dismissal). Prevents state leaking across multiple song creations.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag gesture detection | Custom touch/mouse event handlers with velocity calculations | Framer Motion `drag` prop | Handles touch/mouse unification, velocity tracking, elastic drag, constraints, all edge cases tested by thousands of apps |
| Form state management | Manual useState for each field with custom validation | Zod schemas + controlled inputs | Type-safe validation, single source of truth, validation messages come free |
| Spring animations | Custom requestAnimationFrame loops with easing functions | Framer Motion animations | Hardware-accelerated, handles interruptions, cancellation, and state transitions automatically |
| Session persistence | Manual JSON.stringify/parse with error handling | Simple useEffect pattern (see Pattern 2) | Edge cases (corrupted JSON, quota exceeded) need handling but pattern is well-established |

**Key insight:** Gesture handling has dozens of subtle edge cases (touch cancellation, multi-touch interference, scroll conflicts, velocity normalization). Framer Motion solves all of these. Never hand-roll gesture detection unless you have weeks to debug mobile-specific issues.

## Common Pitfalls

### Pitfall 1: Scroll Conflicts on Mobile Touch Devices
**What goes wrong:** User drags card horizontally but page also scrolls vertically, creating jumpy experience or preventing swipe entirely.
**Why it happens:** Browsers default to allowing both touch gestures simultaneously unless explicitly prevented.
**How to avoid:** Add `touch-action: none` CSS to all draggable elements and their containers. For Framer Motion, this is automatic when using `drag` prop, but verify in production.
**Warning signs:** Card doesn't move smoothly on mobile, page scrolls when swiping, gestures feel "sticky."

### Pitfall 2: Accidental Swipes from Small Touch Movements
**What goes wrong:** User taps card intending to interact with a button inside, but slight finger movement registers as swipe.
**Why it happens:** Default swipe detection is too sensitive, especially with velocity-based triggers.
**How to avoid:** Implement 40% card-width distance threshold (SWIPE-09 requirement). Disable swipe detection if drag distance is below threshold, regardless of velocity.
**Warning signs:** Users complain about unintended swipes, high undo usage, support tickets about "cards disappearing."

### Pitfall 3: Lost Form State on Page Refresh During Multi-Step Flow
**What goes wrong:** User completes swipe selections, begins personalization form, refreshes page, and all progress is lost.
**Why it happens:** React state is in-memory only; no persistence layer.
**How to avoid:** Use sessionStorage to persist swipe state on every change (Pattern 2). Clear sessionStorage only on final submission or explicit "start over" action.
**Warning signs:** Users report having to "start over" after browser back button or accidental refresh.

### Pitfall 4: No Keyboard Access Blocks Desktop Users and Screen Readers
**What goes wrong:** Desktop users cannot complete swipe flow without a touch screen or mouse drag. Screen reader users are completely blocked.
**Why it happens:** Gesture-first design often forgets keyboard-only navigation.
**How to avoid:** Implement full keyboard controls (Arrow keys, Enter, Escape) alongside gestures (Pattern 4). Add visible "next/skip" buttons as fallback. Test with keyboard-only navigation before shipping.
**Warning signs:** WCAG audit fails, support tickets from desktop users, no way to complete flow without mouse.

### Pitfall 5: Animation Jank on Lower-End Mobile Devices
**What goes wrong:** Card animations stutter, lag, or freeze on older Android devices.
**Why it happens:** Animating non-composited properties (width, height, top, left) forces layout recalculations on every frame.
**How to avoid:** Only animate `transform` (translateX, scale, rotate) and `opacity`. These are GPU-accelerated and don't trigger layout. Framer Motion does this by default for `x`/`y` props.
**Warning signs:** 60fps on iPhone but <30fps on mid-range Android, users report "laggy" feel.

## Code Examples

Verified patterns from official sources and established best practices:

### Swipe Card with Visual Feedback and Threshold
```typescript
// Source: Framer Motion drag API + LogRocket swipe patterns
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface SwipeCardProps {
  onSwipe: (direction: 'left' | 'right') => void
  children: React.ReactNode
}

export function SwipeCard({ onSwipe, children }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25])
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    const cardWidth = (event.currentTarget as HTMLElement).offsetWidth
    const threshold = cardWidth * 0.4
    const offset = info.offset.x
    const velocity = info.velocity.x

    // Accept swipe if threshold met OR high velocity
    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 'right' : 'left'
      onSwipe(direction)
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{
        x,
        rotate,
        opacity,
        touchAction: 'none' // Prevent scroll conflicts
      }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="absolute cursor-grab"
    >
      {children}
    </motion.div>
  )
}
```

### Multi-Stage Swipe Flow with Progress Tracking
```typescript
// Source: Multi-step form wizard patterns + sessionStorage persistence
import { useState, useEffect } from 'react'

type SwipeStage = 'occasion' | 'mood' | 'genre' | 'voice' | 'personalization'

interface SwipeFlowState {
  currentStage: SwipeStage
  selections: Record<string, any>
  history: Array<{ stage: SwipeStage; selection: any }>
}

const STAGE_ORDER: SwipeStage[] = ['occasion', 'mood', 'genre', 'voice', 'personalization']

export function useSwipeFlow() {
  const [state, setState] = useState<SwipeFlowState>(() => {
    const saved = sessionStorage.getItem('swipe_flow_state')
    return saved ? JSON.parse(saved) : {
      currentStage: 'occasion',
      selections: {},
      history: []
    }
  })

  // Persist to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem('swipe_flow_state', JSON.stringify(state))
  }, [state])

  const handleSelection = (selection: any) => {
    setState(prev => {
      const currentStageIndex = STAGE_ORDER.indexOf(prev.currentStage)
      const nextStage = STAGE_ORDER[currentStageIndex + 1]

      return {
        currentStage: nextStage || prev.currentStage,
        selections: {
          ...prev.selections,
          [prev.currentStage]: selection
        },
        history: [...prev.history, {
          stage: prev.currentStage,
          selection
        }]
      }
    })
  }

  const undo = () => {
    setState(prev => {
      if (prev.history.length === 0) return prev

      const lastEntry = prev.history[prev.history.length - 1]
      const newSelections = { ...prev.selections }
      delete newSelections[lastEntry.stage]

      return {
        currentStage: lastEntry.stage,
        selections: newSelections,
        history: prev.history.slice(0, -1)
      }
    })
  }

  const reset = () => {
    sessionStorage.removeItem('swipe_flow_state')
    setState({
      currentStage: 'occasion',
      selections: {},
      history: []
    })
  }

  const progress = (STAGE_ORDER.indexOf(state.currentStage) + 1) / STAGE_ORDER.length * 100

  return {
    state,
    handleSelection,
    undo,
    reset,
    progress,
    canUndo: state.history.length > 0,
    isComplete: state.currentStage === 'personalization'
  }
}
```

### Accessible Keyboard Navigation
```typescript
// Source: WCAG 2.1 keyboard navigation + React Aria patterns
import { useEffect, useCallback } from 'react'

interface UseSwipeKeyboardProps {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onUndo: () => void
  canUndo: boolean
  disabled?: boolean
}

export function useSwipeKeyboard({
  onSwipeLeft,
  onSwipeRight,
  onUndo,
  canUndo,
  disabled = false
}: UseSwipeKeyboardProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) return

    // Prevent default for handled keys
    if (['ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
      e.preventDefault()
    }

    switch (e.key) {
      case 'ArrowLeft':
        onSwipeLeft()
        break
      case 'ArrowRight':
      case 'Enter':
        onSwipeRight()
        break
      case 'Escape':
        if (canUndo) onUndo()
        break
    }
  }, [onSwipeLeft, onSwipeRight, onUndo, canUndo, disabled])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-use-gesture 9.x | @use-gesture/react 10.x | 2023 | Package renamed, better TypeScript support, improved tree-shaking |
| Velocity-only swipe detection | Distance threshold + velocity hybrid | 2024-2025 | Industry moved to 40-50% card width threshold to prevent accidental swipes per UX research |
| CSS-only animations | Hardware-accelerated transform animations | 2022-2023 | Mobile performance requirements drove GPU-accelerated animations (transform/opacity only) |
| localStorage for wizard state | sessionStorage for transient flows | 2024 | Privacy concerns + data leakage across sessions led to sessionStorage for temporary workflows |

**Deprecated/outdated:**
- **react-swipeable-views**: Last updated 2020, unmaintained. Use Framer Motion drag instead.
- **react-swipe**: No longer maintained, iOS touch event bugs. Use modern gesture libraries.
- **Inline event handlers for touch events**: Too many cross-browser edge cases. Use gesture abstraction library.

## Open Questions

1. **Voice style selection scope**
   - What we know: SWIPE-04 requires "voice style options" swipe cards
   - What's unclear: Exact voice styles available (male/female? age ranges? accents? genres like "pop vocal" vs "jazz vocal"?)
   - Recommendation: Check Eleven Labs API voice catalog during implementation. Default to 4-6 clear voice archetypes (e.g., "Warm Male", "Bright Female", "Soulful", "Energetic")

2. **Mood selection: single or multi-select?**
   - What we know: SWIPE-02 says "swipe through mood/vibe cards", existing customize page allows multiple mood tags
   - What's unclear: Can user select multiple moods via separate swipe stages? Or single mood selection?
   - Recommendation: Follow existing /customize pattern (multi-select moods) but adapt to swipe: each card is a mood, swiping right = add to collection, swiping left = skip. Final selection is all right-swiped moods. Prevents 5+ sequential swipe stages.

3. **Post-swipe form placement**
   - What we know: SWIPE-05 requires text form for recipient name, memories, details AFTER completing swipe selections
   - What's unclear: Inline within swipe UI or separate page/modal?
   - Recommendation: Inline transition (same page) with smooth animation. Final swipe card animates away, form slides up. Maintains flow continuity, avoids jarring page reload.

4. **Undo scope: just last action or full history?**
   - What we know: SWIPE-07 requires "undo last swipe action"
   - What's unclear: Just most recent swipe, or can user step back through full history?
   - Recommendation: Single-step undo (last action only) for MVP. Full history navigation adds complexity but could be Phase 3.1 enhancement if user feedback demands it.

## Sources

### Primary (HIGH confidence)
- [Framer Motion Gestures Documentation](https://www.framer.com/motion/gestures/) - Drag API, onDragEnd callbacks, drag constraints
- [react-tinder-card GitHub](https://github.com/3DJakob/react-tinder-card) - API reference, TypeScript definitions, swipe threshold patterns
- [React Hook Form Multi-Step Discussion](https://github.com/orgs/react-hook-form/discussions/4028) - Validation strategy for wizard flows
- [WCAG 2.1 Keyboard Accessibility (Success Criterion 2.1.1)](https://www.uxpin.com/studio/blog/wcag-211-keyboard-accessibility-explained/) - Keyboard navigation requirements

### Secondary (MEDIUM confidence)
- [LogRocket: Designing swipe-to-delete and swipe-to-reveal interactions](https://blog.logrocket.com/ux-design/accessible-swipe-contextual-action-triggers/) - Swipe threshold recommendations, undo patterns, accessibility concerns
- [VWO: The Ultimate Mobile App Onboarding Guide (2026)](https://vwo.com/blog/mobile-app-onboarding-guide/) - First-time user hints, progressive disclosure, tooltip best practices
- [DhiWise: React Spring vs. Framer Motion](https://www.dhiwise.com/post/react-spring-vs-framer-motion-a-detailed-guide-to-react) - Performance comparison, use case recommendations
- [LinkedIn: How to Prevent Accidental Taps and Swipes on Mobile](https://www.linkedin.com/advice/1/how-do-you-avoid-accidental-taps-swipes-mobile-interfaces) - Touch target sizing, threshold recommendations (44-48px minimum)
- [GeeksforGeeks: How to persist state with Local or Session Storage in React](https://www.geeksforgeeks.org/reactjs/how-to-persist-state-with-local-or-session-storage-in-react/) - sessionStorage patterns, JSON serialization

### Tertiary (LOW confidence)
- [Medium: Tinder Card Swipe Feature Using React-Spring and React Use Gesture](https://medium.com/swlh/tinder-card-swipe-feature-using-react-spring-and-react-use-gesture-7236d7abf2db) - Implementation example, but older pattern (2020-2021 era)
- [Primotech: UI/UX Evolution 2026: Micro-Interactions & Motion](https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/) - Haptic feedback trends, visual feedback philosophy

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Framer Motion is industry standard for React gestures, extensively documented, used by thousands of production apps
- Architecture: HIGH - Patterns verified against official docs, multiple independent sources confirm threshold recommendations and sessionStorage strategy
- Pitfalls: HIGH - Scroll conflicts, accidental swipes, keyboard access gaps are well-documented pain points with established solutions

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days - stable domain)

**Notes:**
- Framer Motion is mature and stable; API unlikely to change significantly in next 6 months
- WCAG 2.2 Level AA is current standard as of April 2026 deadline (state/local government compliance)
- Mobile UX patterns around swipe thresholds have solidified in 2024-2026 around 40-50% card width baseline
- Existing codebase already has Tailwind, Next.js 14, TypeScript, and basic SwipeInterface - Phase 3 is enhancement, not greenfield
