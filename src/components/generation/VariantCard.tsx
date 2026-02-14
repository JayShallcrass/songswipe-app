'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useAudioPreview } from '@/lib/hooks/useAudioPreview'
import {
  MusicalNoteIcon,
  SparklesIcon,
  SpeakerWaveIcon,
  StarIcon,
} from '@heroicons/react/24/solid'

const VARIANT_GRADIENTS = [
  'from-brand-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
]

const VARIANT_ICONS: ReactNode[] = [
  <MusicalNoteIcon key="note" className="w-full h-full text-white" />,
  <SparklesIcon key="sparkles" className="w-full h-full text-white" />,
  <SpeakerWaveIcon key="speaker" className="w-full h-full text-white" />,
  <StarIcon key="star" className="w-full h-full text-white" />,
]

const VARIANT_NAMES = [
  'The First Take',
  'The Remix',
  'The Encore',
  'The Bonus Track',
]

// Animated equaliser bars
function Equaliser({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="w-[3px] bg-white/90 rounded-full"
          animate={isPlaying ? {
            height: ['8px', `${16 + Math.random() * 16}px`, '8px'],
          } : { height: '8px' }}
          transition={isPlaying ? {
            duration: 0.4 + i * 0.1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.08,
          } : { duration: 0.3 }}
        />
      ))}
    </div>
  )
}

interface VariantCardProps {
  orderId: string
  variantId: string
  variantNumber: number
  isActive: boolean
}

export function VariantCard({ orderId, variantId, variantNumber, isActive }: VariantCardProps) {
  const { audioUrl, loading, error, audioRef } = useAudioPreview(orderId, isActive ? variantId : null)
  const [isPlaying, setIsPlaying] = useState(false)

  const gradient = VARIANT_GRADIENTS[(variantNumber - 1) % VARIANT_GRADIENTS.length]
  const icon = VARIANT_ICONS[(variantNumber - 1) % VARIANT_ICONS.length]
  const name = VARIANT_NAMES[(variantNumber - 1) % VARIANT_NAMES.length]

  // Track play state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [audioRef, audioUrl])

  // Pause audio when card becomes inactive
  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause()
    }
  }, [isActive, audioRef])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  return (
    <div className="w-full h-full bg-surface-50 rounded-2xl border border-surface-200 overflow-hidden">
      <div className={`relative w-full h-full bg-gradient-to-br ${gradient} p-5 sm:p-8 flex flex-col items-center justify-center`}>
        {/* Variant label */}
        <div className="w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-3">{icon}</div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-0.5">{name}</h2>
        <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6">Variant {variantNumber}</p>

        {/* Equaliser */}
        <div className="mb-4 sm:mb-6">
          <Equaliser isPlaying={isPlaying} />
        </div>

        {/* Audio player / play button */}
        <div className="w-full max-w-xs mb-4 sm:mb-6">
          {loading && (
            <div className="flex items-center justify-center h-14">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-white/80 text-sm">Loading...</span>
            </div>
          )}

          {error && (
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-white/90 text-xs">{error}</p>
            </div>
          )}

          {audioUrl && !loading && !error && (
            <>
              <audio
                ref={audioRef}
                src={audioUrl}
                controlsList="nodownload noplaybackrate"
                onContextMenu={(e) => e.preventDefault()}
              />
              <button
                onClick={togglePlay}
                className="w-full py-4 sm:py-5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-3"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play Preview
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
