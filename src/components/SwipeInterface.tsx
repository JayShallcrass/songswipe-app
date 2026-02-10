'use client'

import { useState, useCallback, useEffect } from 'react'

interface SwipeCardProps {
  variant: number
  isActive: boolean
}

export function SwipeCard({ variant, isActive }: SwipeCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  
  const variants = [
    {
      bg: 'from-purple-500 to-pink-500',
      title: 'Romantic Pop',
      mood: '❤️ Romantic',
      preview: '🎵 20s preview',
    },
    {
      bg: 'from-blue-500 to-cyan-500',
      title: 'Acoustic Journey',
      mood: '🎸 Acoustic',
      preview: '🎵 20s preview',
    },
    {
      bg: 'from-orange-500 to-red-500',
      title: 'Epic Ballad',
      mood: '💫 Epic',
      preview: '🎵 20s preview',
    },
  ]

  const current = variants[variant % variants.length]

  return (
    <div 
      className={`swipe-card ${
        isActive ? 'opacity-100 z-10' : 'opacity-50 z-0'
      }`}
      style={{
        transform: isActive ? 'scale(1)' : 'scale(0.95)',
      }}
    >
      {/* Card Background */}
      <div className={`h-full w-full rounded-3xl bg-gradient-to-br ${current.bg} p-6 text-white flex flex-col`}>
        {/* Album Art Placeholder */}
        <div className="flex-1 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-6xl">🎵</span>
        </div>
        
        {/* Song Info */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold mb-1">{current.title}</h3>
          <p className="text-white/80">{current.mood}</p>
        </div>

        {/* Audio Preview */}
        <div className="bg-white/20 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>{current.preview}</span>
                <span>0:20</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-1/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hints */}
        <div className="text-center text-white/70 text-sm">
          <p>Swipe right to like, left to pass</p>
        </div>
      </div>
    </div>
  )
}

interface SwipeInterfaceProps {
  onComplete: (selections: number[]) => void
}

export function SwipeInterface({ onComplete }: SwipeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selections, setSelections] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)

  const totalCards = 3
  const progress = ((currentIndex + 1) / totalCards) * 100

  const handleSwipe = useCallback((dir: 'left' | 'right') => {
    if (currentIndex >= totalCards) return

    const newSelections = [...selections]
    if (dir === 'right') {
      newSelections.push(currentIndex)
    }
    setSelections(newSelections)
    setDirection(dir)
    
    // Reset direction after animation
    setTimeout(() => {
      setDirection(null)
      setCurrentIndex(prev => {
        const next = prev + 1
        if (next >= totalCards) {
          onComplete(newSelections)
        }
        return next
      })
    }, 300)
  }, [currentIndex, selections, onComplete, totalCards])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe('left')
      if (e.key === 'ArrowRight') handleSwipe('right')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSwipe])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Option {Math.min(currentIndex + 1, totalCards)} of {totalCards}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Instructions */}
      {currentIndex < totalCards && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Preview Your Options
          </h2>
          <p className="text-gray-600">
            Listen to previews and swipe to pick your favourite version
          </p>
        </div>
      )}

      {/* Cards Container */}
      <div className="relative w-full max-w-sm aspect-[3/4]">
        {Array.from({ length: Math.min(3, totalCards - currentIndex) }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{ zIndex: 10 - i }}
          >
            <SwipeCard
              variant={currentIndex + i}
              isActive={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Swipe Actions */}
      {currentIndex < totalCards && (
        <div className="flex gap-8 mt-8">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition"
          >
            ✖
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-3xl text-white hover:scale-110 transition"
          >
            ♥
          </button>
        </div>
      )}

      {/* Completed State */}
      {currentIndex >= totalCards && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Selection Complete!
          </h3>
          <p className="text-gray-600">
            You selected {selections.length} version(s)
          </p>
        </div>
      )}
    </div>
  )
}
