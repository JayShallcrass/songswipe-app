'use client'

import { SwipeCard } from '@/components/swipe/SwipeCard'
import { SwipeHints } from '@/components/swipe/SwipeHints'
import { SwipeCardData, SwipeStage } from '@/types/swipe'
import { AnimatePresence, motion } from 'framer-motion'

interface SwipeStackProps {
  cards: SwipeCardData[]
  currentCardIndex: number
  stage: SwipeStage
  stageTitle: string
  stageSubtitle: string
  onSwipe: (cardId: string, direction: 'left' | 'right') => void
  onUndo: () => void
  canUndo: boolean
  showHints: boolean
  onHintsDismiss: () => void
  didLoop?: boolean
}

export function SwipeStack({
  cards,
  currentCardIndex,
  stage,
  stageTitle,
  stageSubtitle,
  onSwipe,
  onUndo,
  canUndo,
  showHints,
  onHintsDismiss,
  didLoop,
}: SwipeStackProps) {
  // Build visible cards with wrapping support
  const visibleCards: SwipeCardData[] = []
  for (let i = 0; i < Math.min(3, cards.length); i++) {
    const idx = (currentCardIndex + i) % cards.length
    visibleCards.push(cards[idx])
  }
  const currentCard = cards[currentCardIndex]

  const handleCardSwipe = (direction: 'left' | 'right') => {
    if (currentCard) {
      onSwipe(currentCard.id, direction)
    }
  }

  const handleSkip = () => handleCardSwipe('left')
  const handleSelect = () => handleCardSwipe('right')

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Stage header */}
      <div className="mb-2 sm:mb-4 text-center px-2">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1">{stageTitle}</h1>
        <p className="text-xs sm:text-base text-gray-600">{stageSubtitle}</p>
      </div>

      {/* Card stack container - touch-action:none prevents scroll hijacking */}
      <div
        className="relative w-full max-w-[260px] sm:max-w-sm aspect-[4/5] sm:aspect-[3/4] mx-auto mb-3 sm:mb-6"
        style={{ touchAction: 'none' }}
      >
        <AnimatePresence mode="popLayout">
          {visibleCards.map((card, index) => {
            const isTop = index === 0
            const scale = 1 - index * 0.05
            const translateY = index * 8

            return (
              <motion.div
                key={`${stage}-${card.id}`}
                className="absolute inset-0"
                initial={{ scale, y: translateY }}
                animate={{ scale, y: translateY }}
                exit={{
                  x: 300,
                  opacity: 0,
                  rotate: 15,
                  transition: { duration: 0.3 },
                }}
                style={{ zIndex: visibleCards.length - index }}
              >
                <SwipeCard
                  card={card}
                  onSwipe={handleCardSwipe}
                  isTop={isTop}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Hints overlay */}
        {showHints && <SwipeHints onDismiss={onHintsDismiss} />}
      </div>

      {/* Loop indicator */}
      <AnimatePresence>
        {didLoop && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-purple-600 text-xs sm:text-sm font-medium mb-2 text-center"
          >
            Back to the start - swipe right on one you like!
          </motion.p>
        )}
      </AnimatePresence>

      {/* Card position dots */}
      <div className="flex gap-1.5 mb-3">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentCardIndex
                ? 'bg-purple-600 w-3'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={handleSkip}
          className="px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-600 font-medium rounded-xl hover:border-gray-400 hover:text-gray-700 transition-colors text-sm sm:text-base"
        >
          Skip
        </button>

        {/* Undo button */}
        {canUndo && (
          <button
            onClick={onUndo}
            className="px-3 py-2.5 text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm"
          >
            <span className="mr-1">↩</span>
            Undo
          </button>
        )}

        <button
          onClick={handleSelect}
          className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg text-sm sm:text-base"
        >
          Select
        </button>
      </div>
    </div>
  )
}
