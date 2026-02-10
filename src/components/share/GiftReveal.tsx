'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SongPlayer } from '@/components/song/SongPlayer'

interface GiftRevealProps {
  recipientName: string
  message: string
  shareToken: string
  occasion: string
}

type Stage = 'box' | 'revealing' | 'revealed'

export function GiftReveal({ recipientName, message, shareToken, occasion }: GiftRevealProps) {
  const [stage, setStage] = useState<Stage>('box')
  const [showSkip, setShowSkip] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {stage === 'box' && (
          <motion.div
            key="box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8 px-4"
          >
            {/* Gift Box Emoji with Float Animation */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-8xl"
            >
              🎁
            </motion.div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {recipientName}, you have received a gift!
            </h1>

            {/* Open Button */}
            <motion.button
              onClick={handleOpenGift}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Open Your Gift
            </motion.button>

            {/* Skip Link */}
            {showSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleSkipToSong}
                className="block text-white/50 hover:text-white/70 underline text-sm mx-auto transition-colors"
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
            className="text-8xl"
          >
            🎀
          </motion.div>
        )}

        {stage === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
            className="max-w-2xl mx-auto px-4 space-y-8 w-full"
          >
            {/* Music Note Emoji */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl text-center"
            >
              🎵
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Your Personalised Song
            </motion.h2>

            {/* Personal Message Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur rounded-2xl p-8"
            >
              <p className="text-lg md:text-xl text-white/90 italic text-center">
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

            {/* Branding */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center pt-8"
            >
              <p className="text-white/40 text-sm">
                Created with{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                  SongSwipe
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
