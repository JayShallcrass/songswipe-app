'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { VariantCard } from './VariantCard'

interface Variant {
  id: string
  variant_number: number
}

interface VariantSwiperProps {
  orderId: string
  variants: Variant[]
  onSelect: (variantId: string) => void
  onIndexChange?: (index: number, total: number) => void
}

export function VariantSwiper({ orderId, variants, onSelect, onIndexChange }: VariantSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const [exitingId, setExitingId] = useState<string | null>(null)

  if (variants.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <p className="text-gray-600">No variants available</p>
      </div>
    )
  }

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentVariant = variants[currentIndex]

    if (direction === 'right') {
      // SELECT - trigger exit animation then select
      setExitDirection('right')
      setExitingId(currentVariant.id)
      setTimeout(() => {
        onSelect(currentVariant.id)
      }, 300)
      return
    }

    // NEXT - cycle to next variant
    setExitDirection('left')
    setExitingId(currentVariant.id)
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % variants.length
      setCurrentIndex(nextIndex)
      setExitingId(null)
      setExitDirection(null)
      onIndexChange?.(nextIndex, variants.length)
    }, 250)
  }, [currentIndex, variants, onSelect, onIndexChange])

  // Build visible card stack (up to 3 cards, current on top)
  const visibleCards: { variant: Variant; stackIndex: number }[] = []
  for (let i = Math.min(2, variants.length - 1); i >= 0; i--) {
    const idx = (currentIndex + i) % variants.length
    visibleCards.push({ variant: variants[idx], stackIndex: i })
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Card stack */}
      <div
        className="relative w-full aspect-[4/5] sm:aspect-[3/4]"
        style={{ touchAction: 'none' }}
      >
        <AnimatePresence>
          {visibleCards.map(({ variant, stackIndex }) => {
            const isExiting = variant.id === exitingId

            if (isExiting) {
              return (
                <motion.div
                  key={variant.id}
                  className="absolute inset-0 w-full h-full"
                  initial={{ x: 0, opacity: 1 }}
                  animate={{
                    x: exitDirection === 'right' ? 400 : -400,
                    opacity: 0,
                    rotate: exitDirection === 'right' ? 15 : -15,
                  }}
                  transition={{ duration: 0.3, ease: 'easeIn' }}
                  style={{ zIndex: 30 }}
                />
              )
            }

            return (
              <motion.div
                key={variant.id}
                className="absolute inset-0 w-full h-full"
                style={{
                  zIndex: 10 - stackIndex,
                }}
                initial={false}
                animate={{
                  scale: 1 - stackIndex * 0.04,
                  y: stackIndex * 8,
                  opacity: stackIndex === 0 ? 1 : 0.7 - stackIndex * 0.2,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <VariantCard
                  orderId={orderId}
                  variantId={variant.id}
                  variantNumber={variant.variant_number}
                  isActive={stackIndex === 0}
                  isTop={stackIndex === 0 && !exitingId}
                  onSwipe={handleSwipe}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-5">
        {variants.map((variant, index) => (
          <div
            key={variant.id}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-6 bg-gradient-to-r from-purple-500 to-pink-500'
                : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Swipe hint text */}
      <p className="text-center text-sm text-gray-500 mt-3">
        Swipe right to select, left to skip
      </p>
    </div>
  )
}
