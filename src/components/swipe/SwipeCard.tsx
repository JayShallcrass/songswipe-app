'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SwipeCardData } from '@/types/swipe'

interface SwipeCardProps {
  card: SwipeCardData
  isActive: boolean
  isSelected: boolean
  onClick: () => void
  isPlaying?: boolean
  onToggleAudio?: () => void
}

export function SwipeCard({ card, isActive, isSelected, onClick, isPlaying, onToggleAudio }: SwipeCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [hasAudio, setHasAudio] = useState(!!card.sampleUrl)

  // Check if audio file exists
  useEffect(() => {
    if (!card.sampleUrl) {
      setHasAudio(false)
      return
    }
    fetch(card.sampleUrl, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) setHasAudio(false)
      })
      .catch(() => setHasAudio(false))
  }, [card.sampleUrl])

  // Sync playback with isPlaying prop
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay blocked or file missing
      })
    } else {
      audio.pause()
      audio.currentTime = 0
    }
  }, [isPlaying])

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleAudio?.()
  }

  return (
    <motion.div
      onClick={onClick}
      animate={{
        opacity: isActive ? 1 : 0.7,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex-shrink-0 w-full cursor-pointer"
    >
      <div className="w-full bg-surface-50 rounded-2xl border border-surface-200 overflow-hidden">
        <div className={`relative w-full aspect-[4/5] bg-gradient-to-br ${card.gradient} p-4 sm:p-8 flex flex-col items-center justify-center`}>
          {/* Illustration background */}
          {card.illustration && (
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {card.illustration}
            </div>
          )}

          {/* Dark gradient overlay for text readability */}
          {card.illustration && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent pointer-events-none" />
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Icon */}
            <div className="w-10 h-10 sm:w-14 sm:h-14 mb-3 sm:mb-6">{card.icon}</div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-3 text-center">{card.title}</h2>

            {/* Description */}
            <p className="text-white/90 text-center text-xs sm:text-sm px-2">{card.description}</p>
          </div>

          {/* Audio play/pause button */}
          {hasAudio && (
            <button
              onClick={handlePlayClick}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}

          {/* Hidden audio element */}
          {card.sampleUrl && (
            <audio
              ref={audioRef}
              src={card.sampleUrl}
              preload="none"
              onEnded={() => onToggleAudio?.()}
            />
          )}

          {/* Selected checkmark overlay */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-green-500/30 flex items-center justify-center rounded-2xl"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
