'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { SwipeCardData } from '@/types/swipe'

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

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const cardWidth = (_event.currentTarget as HTMLElement).offsetWidth
    const threshold = cardWidth * 0.4

    const shouldSwipe = Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > 500

    if (shouldSwipe) {
      const direction = info.offset.x > 0 ? 'right' : 'left'
      onSwipe(direction)
    }
  }

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
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
      <div className={`relative w-full h-full bg-gradient-to-br ${card.gradient} rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col items-center justify-center`}>
        {/* Icon */}
        <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">{card.icon}</div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 text-center">{card.title}</h2>

        {/* Description */}
        <p className="text-white/80 text-center text-xs sm:text-sm px-2">{card.description}</p>

        {/* Left indicator (SKIP) */}
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 bg-red-500/90 text-white font-bold text-base sm:text-xl px-4 sm:px-6 py-2 sm:py-3 rounded-xl rotate-[-20deg] shadow-lg pointer-events-none"
        >
          SKIP
        </motion.div>

        {/* Right indicator (SELECT) */}
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 bg-green-500/90 text-white font-bold text-base sm:text-xl px-4 sm:px-6 py-2 sm:py-3 rounded-xl rotate-[20deg] shadow-lg pointer-events-none"
        >
          SELECT
        </motion.div>
      </div>
    </motion.div>
  )
}
