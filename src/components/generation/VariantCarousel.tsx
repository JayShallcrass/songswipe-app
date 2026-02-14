'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useMotionValue, animate, PanInfo } from 'framer-motion'
import { VariantCard } from './VariantCard'

interface Variant {
  id: string
  variant_number: number
}

interface VariantCarouselProps {
  orderId: string
  variants: Variant[]
  onSelect: (variantId: string) => void
}

export function VariantCarousel({ orderId, variants, onSelect }: VariantCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [cardWidth, setCardWidth] = useState(0)
  const cardWidthRef = useRef(0)
  const centerOffsetRef = useRef(0)

  // Calculate card width and set initial position
  useEffect(() => {
    const updateCardWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const isMobile = window.innerWidth < 640
        const cw = containerWidth * (isMobile ? 0.75 : 0.6)
        cardWidthRef.current = cw
        setCardWidth(cw)
        centerOffsetRef.current = (containerWidth - cw) / 2
        x.set(-activeIndex * cw + centerOffsetRef.current)
      }
    }
    updateCardWidth()
    window.addEventListener('resize', updateCardWidth)
    return () => window.removeEventListener('resize', updateCardWidth)
  }, [activeIndex, x])

  const snapToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, variants.length - 1))
    setActiveIndex(clamped)
    animate(x, -clamped * cardWidthRef.current + centerOffsetRef.current, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    })
  }, [variants.length, x])

  const goNext = useCallback(() => {
    if (activeIndex < variants.length - 1) {
      snapToIndex(activeIndex + 1)
    }
  }, [activeIndex, variants.length, snapToIndex])

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      snapToIndex(activeIndex - 1)
    }
  }, [activeIndex, snapToIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement
      ) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          goPrev()
          break
        case 'ArrowRight':
          e.preventDefault()
          goNext()
          break
        case 'Enter':
          e.preventDefault()
          onSelect(variants[activeIndex].id)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, activeIndex, variants, onSelect])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const cw = cardWidthRef.current
    const offset = info.offset.x
    const velocity = info.velocity.x

    let newIndex = activeIndex
    if (Math.abs(offset) > cw * 0.2 || Math.abs(velocity) > 300) {
      if (offset > 0) {
        newIndex = activeIndex - 1
      } else {
        newIndex = activeIndex + 1
      }
    }

    snapToIndex(newIndex)
  }

  if (variants.length === 0) {
    return (
      <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8 text-center">
        <p className="text-zinc-400">No variants available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Carousel container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Arrow buttons (desktop only) */}
        {activeIndex > 0 && (
          <button
            onClick={goPrev}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface-50/80 backdrop-blur border border-surface-200 rounded-full items-center justify-center text-white hover:bg-surface-50 transition-colors"
            aria-label="Previous variant"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {activeIndex < variants.length - 1 && (
          <button
            onClick={goNext}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface-50/80 backdrop-blur border border-surface-200 rounded-full items-center justify-center text-white hover:bg-surface-50 transition-colors"
            aria-label="Next variant"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Cards track */}
        <motion.div
          drag="x"
          dragConstraints={{
            left: -(variants.length - 1) * (cardWidthRef.current || 200) + centerOffsetRef.current,
            right: centerOffsetRef.current,
          }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="flex items-center py-4"
        >
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="flex-shrink-0 px-2"
              style={{ width: cardWidth || '75vw' }}
            >
              <div
                className="aspect-[4/5] sm:aspect-[3/4] transition-transform duration-300"
                style={{
                  transform: index === activeIndex ? 'scale(1)' : 'scale(0.9)',
                  opacity: index === activeIndex ? 1 : 0.6,
                }}
              >
                <VariantCard
                  orderId={orderId}
                  variantId={variant.id}
                  variantNumber={variant.variant_number}
                  isActive={index === activeIndex}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Counter */}
      <p className="text-zinc-400 text-sm font-medium mt-2 mb-3">
        {activeIndex + 1} of {variants.length}
      </p>

      {/* Select button */}
      <button
        onClick={() => onSelect(variants[activeIndex].id)}
        className="px-8 py-3 bg-gradient-to-r from-brand-500 to-amber-500 text-white font-semibold rounded-xl hover:from-brand-600 hover:to-amber-600 transition-colors text-sm sm:text-base"
      >
        Select This One
      </button>
    </div>
  )
}
