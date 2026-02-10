'use client'

import { motion, useMotionValue, useTransform, useAnimate, PanInfo } from 'framer-motion'
import { SwipeCardData } from '@/types/swipe'
import { useEffect, useRef, useCallback } from 'react'

interface SwipeCardProps {
  card: SwipeCardData
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

export function SwipeCard({ card, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15])
  const leftOpacity = useTransform(x, [-200, -100, 0], [0.3, 0.8, 0])
  const rightOpacity = useTransform(x, [0, 100, 200], [0, 0.8, 0.3])
  const [scope, animate] = useAnimate()
  const hasInteracted = useRef(false)
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nudgeInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = useCallback(() => {
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current)
    if (nudgeInterval.current) clearInterval(nudgeInterval.current)
  }, [])

  // Nudge animation: wiggle left then right to show SKIP/SELECT pills
  const playNudge = useCallback(async () => {
    if (hasInteracted.current || !scope.current) return
    try {
      // Wiggle left to flash SKIP
      await animate(scope.current, { x: -60 }, { duration: 0.3, ease: 'easeOut' })
      await animate(scope.current, { x: 0 }, { duration: 0.2, ease: 'easeIn' })
      // Small pause
      await new Promise(r => setTimeout(r, 200))
      if (hasInteracted.current) return
      // Wiggle right to flash SELECT
      await animate(scope.current, { x: 60 }, { duration: 0.3, ease: 'easeOut' })
      await animate(scope.current, { x: 0 }, { duration: 0.2, ease: 'easeIn' })
    } catch {
      // Animation interrupted, that's fine
    }
  }, [animate, scope])

  // Start idle nudge timer when this card becomes the top card
  useEffect(() => {
    if (!isTop) return
    hasInteracted.current = false
    clearTimers()

    // First nudge after 1.5s
    nudgeTimer.current = setTimeout(() => {
      playNudge()
      // Repeat every 5s
      nudgeInterval.current = setInterval(playNudge, 5000)
    }, 1500)

    return clearTimers
  }, [isTop, card.id, playNudge, clearTimers])

  const markInteracted = () => {
    hasInteracted.current = true
    clearTimers()
  }

  const handleDragStart = () => {
    markInteracted()
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const target = _event.currentTarget as HTMLElement | null
    const cardWidth = target?.offsetWidth ?? 300
    const threshold = cardWidth * 0.4

    const shouldSwipe = Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > 500

    if (shouldSwipe) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      onSwipe(direction)
    }
  }

  return (
    <motion.div
      ref={scope}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        x,
        rotate,
        touchAction: 'none',
        cursor: isTop ? 'grab' : 'default',
      }}
      whileDrag={isTop ? { scale: 1.02, cursor: 'grabbing' } : undefined}
      className="absolute inset-0 w-full h-full"
    >
      {/* Solid white background behind gradient to prevent any transparency bleed */}
      <div className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`relative w-full h-full bg-gradient-to-br ${card.gradient} p-4 sm:p-8 flex flex-col items-center justify-center`}>
          {/* Icon */}
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-6">{card.icon}</div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-3 text-center">{card.title}</h2>

          {/* Description */}
          <p className="text-white/90 text-center text-xs sm:text-sm px-2">{card.description}</p>

          {/* Left indicator (SKIP) */}
          <motion.div
            style={{ opacity: leftOpacity }}
            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 bg-red-500/90 text-white font-bold text-sm sm:text-xl px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl rotate-[-20deg] shadow-lg pointer-events-none"
          >
            SKIP
          </motion.div>

          {/* Right indicator (SELECT) */}
          <motion.div
            style={{ opacity: rightOpacity }}
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 bg-green-500/90 text-white font-bold text-sm sm:text-xl px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl rotate-[20deg] shadow-lg pointer-events-none"
          >
            SELECT
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
