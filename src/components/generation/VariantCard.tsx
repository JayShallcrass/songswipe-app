'use client'

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, useAnimate, PanInfo } from 'framer-motion'
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
  isTop: boolean
  onSwipe: (direction: 'left' | 'right') => void
}

export function VariantCard({ orderId, variantId, variantNumber, isActive, isTop, onSwipe }: VariantCardProps) {
  const { audioUrl, loading, error, audioRef } = useAudioPreview(orderId, isActive ? variantId : null)
  const [isPlaying, setIsPlaying] = useState(false)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10])
  const skipOpacity = useTransform(x, [-200, -80, 0], [0.4, 0.8, 0])
  const selectOpacity = useTransform(x, [0, 80, 200], [0, 0.8, 0.4])
  const [scope, animate] = useAnimate()
  const hasInteracted = useRef(false)
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nudgeInterval = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const clearTimers = useCallback(() => {
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current)
    if (nudgeInterval.current) clearInterval(nudgeInterval.current)
  }, [])

  // Idle nudge
  const playNudge = useCallback(async () => {
    if (hasInteracted.current || !scope.current) return
    try {
      await animate(scope.current, { x: -40 }, { duration: 0.25, ease: 'easeOut' })
      await animate(scope.current, { x: 0 }, { duration: 0.2, ease: 'easeIn' })
      await new Promise(r => setTimeout(r, 250))
      if (hasInteracted.current) return
      await animate(scope.current, { x: 40 }, { duration: 0.25, ease: 'easeOut' })
      await animate(scope.current, { x: 0 }, { duration: 0.2, ease: 'easeIn' })
    } catch { /* interrupted */ }
  }, [animate, scope])

  useEffect(() => {
    if (!isTop) return
    hasInteracted.current = false
    clearTimers()
    nudgeTimer.current = setTimeout(() => {
      playNudge()
      nudgeInterval.current = setInterval(playNudge, 6000)
    }, 2000)
    return clearTimers
  }, [isTop, variantId, playNudge, clearTimers])

  const markInteracted = () => {
    hasInteracted.current = true
    clearTimers()
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const target = _event.currentTarget as HTMLElement | null
    const cardWidth = target?.offsetWidth ?? 300
    const threshold = cardWidth * 0.35
    const shouldSwipe = Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > 400
    if (shouldSwipe) {
      // Stop audio before swiping away
      audioRef.current?.pause()
      onSwipe(info.offset.x > 0 ? 'right' : 'left')
    }
  }

  const togglePlay = () => {
    markInteracted()
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  return (
    <motion.div
      ref={scope}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragStart={markInteracted}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, touchAction: 'none', cursor: isTop ? 'grab' : 'default' }}
      whileDrag={isTop ? { scale: 1.02, cursor: 'grabbing' } : undefined}
      className="absolute inset-0 w-full h-full"
    >
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
                  className="w-full py-3 sm:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Play
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* SKIP / SELECT indicators */}
          <motion.div
            style={{ opacity: skipOpacity }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-white/30 text-white font-bold text-sm sm:text-lg px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl rotate-[-15deg] pointer-events-none backdrop-blur-sm"
          >
            NEXT
          </motion.div>
          <motion.div
            style={{ opacity: selectOpacity }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-green-500/80 text-white font-bold text-sm sm:text-lg px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl rotate-[15deg] pointer-events-none shadow-lg"
          >
            SELECT
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
