'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SongPlayer } from '@/components/song/SongPlayer'
import AlbumArt from '@/components/AlbumArt'
import Link from 'next/link'

interface GiftRevealProps {
  recipientName: string
  message: string
  shareToken: string
  occasion: string
}

type Stage = 'box' | 'revealing' | 'revealed'

// Confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#e74c3c', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#3b82f6']
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

export function GiftReveal({ recipientName, message, shareToken, occasion }: GiftRevealProps) {
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

  return (
    <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-purple-600/10 via-brand-500/5 to-transparent rounded-full blur-3xl" />
      </div>

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
            className="text-center space-y-8 px-4 relative z-10"
          >
            {/* Gift Box */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-brand-500/20"
            >
              <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </motion.div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
              {recipientName}, you have received a gift!
            </h1>

            {/* Open Button */}
            <motion.button
              onClick={handleOpenGift}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-brand-500 to-purple-600 text-white text-xl font-semibold rounded-full hover:from-brand-600 hover:to-purple-700 transition-all shadow-lg shadow-brand-500/20"
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
            className="w-32 h-32 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center"
          >
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </motion.div>
        )}

        {stage === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto px-4 space-y-8 w-full relative z-10"
          >
            {/* Album Art + Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <AlbumArt
                recipientName={recipientName}
                occasion={occasion}
                size="lg"
              />
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-heading font-bold text-center text-gradient"
            >
              Your Personalised Song
            </motion.h2>

            {/* Personal Message Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-8"
            >
              <p className="text-lg md:text-xl text-zinc-300 italic text-center">
                {message}
              </p>
            </motion.div>

            {/* Audio Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SongPlayer audioUrl={audioUrl} isLoading={isLoadingAudio} />
            </motion.div>

            {/* Create Your Own CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-surface-50 border border-surface-200 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                Create a song for someone you love
              </h3>
              <p className="text-zinc-500 text-sm mb-6">
                Personalised AI songs for birthdays, Valentine&apos;s, anniversaries, and more.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-3 text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Create a Song
              </Link>
            </motion.div>

            {/* Branding */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pt-4 pb-8"
            >
              <p className="text-zinc-600 text-sm">
                Created with{' '}
                <span className="text-gradient font-semibold">
                  SongSwipe
                </span>
              </p>
            </motion.div>
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
