'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SongPlayer } from '@/components/song/SongPlayer'
import AlbumArt from '@/components/AlbumArt'
import { ShareButtons } from '@/components/share/ShareButtons'
import Link from 'next/link'
import { MusicalNoteIcon } from '@heroicons/react/24/outline'

interface GiftRevealProps {
  recipientName: string
  senderName: string
  message: string
  shareToken: string
  shareUrl: string
  occasion: string
  genre?: string
}

type Stage = 'box' | 'revealing' | 'revealed'

// Confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#f97316', '#f59e0b', '#ea580c', '#ec4899', '#10b981', '#3b82f6']
  const color = colors[index % colors.length]
  const left = Math.random() * 100
  const delay = Math.random() * 0.5
  const duration = 2 + Math.random() * 2
  const size = 6 + Math.random() * 6
  const rotation = Math.random() * 360

  return (
    <div
      className="absolute pointer-events-none animate-confetti"
      style={{
        left: `${left}%`,
        top: '-10px',
        width: `${size}px`,
        height: `${size * 0.6}px`,
        backgroundColor: color,
        borderRadius: '2px',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  )
}

export function GiftReveal({ recipientName, senderName, message, shareToken, shareUrl, occasion, genre }: GiftRevealProps) {
  const [stage, setStage] = useState<Stage>('box')
  const [showSkip, setShowSkip] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Show skip button after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Load audio when revealed
  useEffect(() => {
    if (stage === 'revealed' && !audioUrl) {
      setIsLoadingAudio(true)
      setShowConfetti(true)

      // Hide confetti after 4 seconds
      const confettiTimer = setTimeout(() => setShowConfetti(false), 4000)

      fetch(`/api/share/${shareToken}/stream`)
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Failed to load audio')
          }
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setAudioUrl(url)
        })
        .catch((error) => {
          console.error('Error loading audio:', error)
        })
        .finally(() => {
          setIsLoadingAudio(false)
        })

      return () => clearTimeout(confettiTimer)
    }
  }, [stage, shareToken, audioUrl])

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const handleOpenGift = () => {
    setStage('revealing')
  }

  const handleSkipToSong = () => {
    setStage('revealed')
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = `/api/share/${shareToken}/download`
    link.download = ''
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isPreReveal = stage === 'box' || stage === 'revealing'

  return (
    <div className={`min-h-screen bg-surface-DEFAULT relative overflow-hidden ${isPreReveal ? 'flex items-center justify-center' : ''}`}>
      {/* Ambient glow - SVG radial gradient (no blur filter) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <defs>
          <radialGradient id="glow" cx="50%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
            <stop offset="40%" stopColor="#f97316" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#glow)" />
      </svg>

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === 'box' && (
          <motion.div
            key="box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8 px-6 relative z-10"
          >
            {/* Gift Box */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-brand-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-brand-500/20"
            >
              <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </motion.div>

            {/* Heading */}
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
                {recipientName}, you have a gift!
              </h1>
              <p className="text-zinc-400 mt-2 text-sm">From {senderName}</p>
            </div>

            {/* Open Button */}
            <motion.button
              onClick={handleOpenGift}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-brand-500 to-amber-500 text-white text-xl font-semibold rounded-full hover:from-brand-600 hover:to-amber-600 transition-all shadow-lg shadow-brand-500/20"
            >
              Open Your Gift
            </motion.button>

            {/* Skip Link */}
            {showSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleSkipToSong}
                className="block text-zinc-600 hover:text-zinc-400 underline text-sm mx-auto transition-colors"
              >
                Skip to song
              </motion.button>
            )}
          </motion.div>
        )}

        {stage === 'revealing' && (
          <motion.div
            key="revealing"
            initial={{ opacity: 1, rotateZ: 0, scale: 1 }}
            animate={{ opacity: 0, rotateZ: 720, scale: [1, 1.2, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            onAnimationComplete={() => setStage('revealed')}
            className="w-32 h-32 rounded-3xl bg-gradient-to-br from-brand-500 to-amber-500 flex items-center justify-center"
          >
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </motion.div>
        )}

        {stage === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full"
          >
            <div className="max-w-lg mx-auto px-5 pt-8 pb-12 space-y-6">
              {/* Mini logo */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center gap-1.5"
              >
                <MusicalNoteIcon className="w-5 h-5 text-brand-500" />
                <span className="text-sm font-heading font-semibold text-zinc-500">SongSwipe</span>
              </motion.div>

              {/* Main song card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface-50 border border-surface-200 rounded-3xl overflow-hidden"
              >
                {/* Album art + occasion tag */}
                <div className="flex flex-col items-center pt-8 pb-4 px-6">
                  <AlbumArt
                    recipientName={recipientName}
                    occasion={occasion}
                    genre={genre}
                    size="lg"
                  />
                  <div className="mt-4 text-center">
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                      Your {occasion} Song
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">
                      A personalised song from {senderName}
                    </p>
                  </div>
                </div>

                {/* Message from sender */}
                {message && (
                  <div className="mx-6 mb-4 bg-surface-100 rounded-xl p-4 border border-surface-200">
                    <p className="text-sm text-zinc-400 italic text-center leading-relaxed">
                      &ldquo;{message}&rdquo;
                    </p>
                  </div>
                )}

                {/* Player */}
                <div className="px-6 pb-6">
                  <SongPlayer audioUrl={audioUrl} isLoading={isLoadingAudio} />
                </div>
              </motion.div>

              {/* Download button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={handleDownload}
                  disabled={!audioUrl}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-surface-50 border border-surface-200 rounded-xl text-white font-medium hover:bg-surface-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download MP3
                </button>
              </motion.div>

              {/* Share section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <ShareButtons
                  url={shareUrl}
                  title={`${occasion} Song for ${recipientName}`}
                  recipientName={recipientName}
                  occasion={occasion}
                />
              </motion.div>

              {/* Create your own CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-surface-50 border border-surface-200 rounded-2xl p-6 sm:p-8 text-center"
              >
                <h3 className="text-lg sm:text-xl font-heading font-bold text-white mb-2">
                  Create a song for someone you love
                </h3>
                <p className="text-zinc-500 text-sm mb-5">
                  Personalised AI songs for birthdays, anniversaries, and more.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-8 py-3 text-white bg-gradient-to-r from-brand-500 to-amber-500 rounded-full font-semibold hover:from-brand-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Create a Song
                </Link>
              </motion.div>

              {/* Footer branding */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center pb-4"
              >
                <p className="text-zinc-600 text-sm">
                  Created with{' '}
                  <Link href="/" className="text-gradient font-semibold hover:underline">
                    SongSwipe
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall 3s ease-out forwards;
        }
      `}} />
    </div>
  )
}
