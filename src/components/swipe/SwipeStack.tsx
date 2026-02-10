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
}: SwipeStackProps) {
  const visibleCards = cards.slice(currentCardIndex, currentCardIndex + 3)
  const currentCard = cards[currentCardIndex]
  const hasMoreCards = currentCardIndex < cards.length

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
        {!hasMoreCards ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-4">No more options</p>
              {canUndo && (
                <p className="text-gray-500 text-sm">Tap undo to go back</p>
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {visibleCards.map((card, index) => {
              const isTop = index === 0
              const scale = 1 - index * 0.05
              const translateY = index * 8

              return (
                <motion.div
                  key={card.id}
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
        )}

        {/* Hints overlay */}
        {showHints && <SwipeHints onDismiss={onHintsDismiss} />}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Desktop fallback buttons */}
        <button
          onClick={handleSkip}
          disabled={!hasMoreCards}
          className="px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-600 font-medium rounded-xl hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
          disabled={!hasMoreCards}
          className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          Select
        </button>
      </div>
    </div>
  )
}
