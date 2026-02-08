'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VariantCard } from './VariantCard'

interface Variant {
  id: string
  variant_number: number
}

interface VariantSwiperProps {
  orderId: string
  variants: Variant[]
  onSelect: (variantId: string) => void
}

export function VariantSwiper({ orderId, variants, onSelect }: VariantSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  if (variants.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <p className="text-gray-600">No variants available</p>
      </div>
    )
  }

  const currentVariant = variants[currentIndex]

  const goToNext = () => {
    if (currentIndex < variants.length - 1) {
      setDirection('right')
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setDirection('left')
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }

  return (
    <div
      className="max-w-2xl mx-auto"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Variant count indicator */}
      <div className="text-center mb-6">
        <p className="text-lg text-gray-600 font-medium">
          Variant {currentIndex + 1} of {variants.length}
        </p>
      </div>

      {/* Card container with navigation */}
      <div className="relative">
        {/* Left arrow button */}
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10"
          aria-label="Previous variant"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Animated card */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentVariant.id}
              custom={direction}
              initial={{
                x: direction === 'right' ? 300 : -300,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: direction === 'right' ? -300 : 300,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 w-full"
            >
              <VariantCard
                orderId={orderId}
                variantId={currentVariant.id}
                variantNumber={currentVariant.variant_number}
                isActive={true}
                onSelect={() => onSelect(currentVariant.id)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right arrow button */}
        <button
          onClick={goToNext}
          disabled={currentIndex === variants.length - 1}
          className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10"
          aria-label="Next variant"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {variants.map((variant, index) => (
          <button
            key={variant.id}
            onClick={() => {
              setDirection(index > currentIndex ? 'right' : 'left')
              setCurrentIndex(index)
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to variant ${index + 1}`}
          />
        ))}
      </div>

      {/* Keyboard hint */}
      <div className="text-center mt-4 text-sm text-gray-500">
        Use arrow keys to navigate between variants
      </div>
    </div>
  )
}
