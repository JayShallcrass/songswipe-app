'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useMotionValue, animate, PanInfo } from 'framer-motion'
import { SwipeCardData, SwipeStage } from '@/types/swipe'
import { SwipeCard } from '@/components/swipe/SwipeCard'

interface CardCarouselProps {
  cards: SwipeCardData[]
  stage: SwipeStage
  stageTitle: string
  stageSubtitle: string
  onSelect: (cardId: string) => void
  previousSelection?: string
}

export function CardCarousel({
  cards,
  stage,
  stageTitle,
  stageSubtitle,
  onSelect,
  previousSelection,
}: CardCarouselProps) {
  const initialIndex = previousSelection
    ? Math.max(0, cards.findIndex(c => c.id === previousSelection))
    : 0
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const cardWidthRef = useRef(0)
  const centerOffsetRef = useRef(0)

  // Reset when stage changes
  useEffect(() => {
    const idx = previousSelection
      ? Math.max(0, cards.findIndex(c => c.id === previousSelection))
      : 0
    setActiveIndex(idx)
    setSelectedId(null)
    setActiveAudioId(null)
  }, [stage, cards, previousSelection])

  // Stop audio when navigating to a different card
  useEffect(() => {
    setActiveAudioId(null)
  }, [activeIndex])

  // Calculate card width and set initial position
  useEffect(() => {
    const updateCardWidth = () => {
      if (containerRef.current) {
        // Card takes 75% of container on mobile, 60% on desktop
        const containerWidth = containerRef.current.offsetWidth
        const isMobile = window.innerWidth < 640
        cardWidthRef.current = containerWidth * (isMobile ? 0.75 : 0.6)
        // Center the active card in the container
        centerOffsetRef.current = (containerWidth - cardWidthRef.current) / 2
        // Snap to active card (centered)
        x.set(-activeIndex * cardWidthRef.current + centerOffsetRef.current)
      }
    }
    updateCardWidth()
    window.addEventListener('resize', updateCardWidth)
    return () => window.removeEventListener('resize', updateCardWidth)
  }, [activeIndex, x, stage])

  const snapToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, cards.length - 1))
    setActiveIndex(clamped)
    animate(x, -clamped * cardWidthRef.current + centerOffsetRef.current, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    })
  }, [cards.length, x])

  const goNext = useCallback(() => {
    if (activeIndex < cards.length - 1) {
      snapToIndex(activeIndex + 1)
    }
  }, [activeIndex, cards.length, snapToIndex])

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
          handleSelectCard(cards[activeIndex].id)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, activeIndex, cards])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const cardWidth = cardWidthRef.current
    const offset = info.offset.x
    const velocity = info.velocity.x

    // Determine which direction to snap
    let newIndex = activeIndex
    if (Math.abs(offset) > cardWidth * 0.2 || Math.abs(velocity) > 300) {
      if (offset > 0) {
        newIndex = activeIndex - 1
      } else {
        newIndex = activeIndex + 1
      }
    }

    snapToIndex(newIndex)
  }

  const handleSelectCard = (cardId: string) => {
    setActiveAudioId(null)
    setSelectedId(cardId)
    // Brief highlight animation, then advance
    setTimeout(() => {
      onSelect(cardId)
    }, 400)
  }

  const handleCardClick = (index: number, cardId: string) => {
    if (index === activeIndex) {
      handleSelectCard(cardId)
    } else {
      snapToIndex(index)
    }
  }

  const handleToggleAudio = (cardId: string) => {
    setActiveAudioId((prev) => (prev === cardId ? null : cardId))
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Stage header */}
      <div className="mb-3 sm:mb-5 text-center px-2">
        <h1 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">{stageTitle}</h1>
        <p className="text-xs sm:text-base text-zinc-400">{stageSubtitle}</p>
      </div>

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
            aria-label="Previous card"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {activeIndex < cards.length - 1 && (
          <button
            onClick={goNext}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface-50/80 backdrop-blur border border-surface-200 rounded-full items-center justify-center text-white hover:bg-surface-50 transition-colors"
            aria-label="Next card"
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
            left: -(cards.length - 1) * (cardWidthRef.current || 200) + centerOffsetRef.current,
            right: centerOffsetRef.current,
          }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="flex items-center py-4"
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="flex-shrink-0 px-2"
              style={{ width: cardWidthRef.current || '75%' }}
            >
              <SwipeCard
                card={card}
                isActive={index === activeIndex}
                isSelected={card.id === selectedId}
                onClick={() => handleCardClick(index, card.id)}
                isPlaying={activeAudioId === card.id}
                onToggleAudio={() => handleToggleAudio(card.id)}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Counter */}
      <p className="text-zinc-400 text-sm font-medium mt-2 mb-3">
        {activeIndex + 1} of {cards.length}
      </p>

      {/* Select button */}
      <button
        onClick={() => handleSelectCard(cards[activeIndex].id)}
        className="px-8 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white font-semibold rounded-xl hover:from-brand-600 hover:to-purple-700 transition-colors text-sm sm:text-base"
      >
        Select This One
      </button>

      {/* Disclaimer */}
      <p className="text-zinc-500 text-xs mt-2 text-center">
        Previews are illustrative. Your final song will be unique and personalised.
      </p>
    </div>
  )
}
