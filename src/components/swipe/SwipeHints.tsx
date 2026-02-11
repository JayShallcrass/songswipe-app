'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SwipeHintsProps {
  onDismiss: () => void
}

const HINTS_STORAGE_KEY = 'songswipe_hints_seen'

export function SwipeHints({ onDismiss }: SwipeHintsProps) {
  const [shouldShow, setShouldShow] = useState(true)

  useEffect(() => {
    // Check if hints have been seen before
    const hintsSeen = localStorage.getItem(HINTS_STORAGE_KEY)
    if (hintsSeen === 'true') {
      onDismiss()
      setShouldShow(false)
    }
  }, [onDismiss])

  const handleDismiss = () => {
    localStorage.setItem(HINTS_STORAGE_KEY, 'true')
    onDismiss()
    setShouldShow(false)
  }

  if (!shouldShow) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
      onClick={handleDismiss}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/20 rounded-2xl pointer-events-auto" />

      {/* Hints content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {/* Left arrow hint */}
        <motion.div
          className="absolute left-8 flex flex-col items-center gap-2"
          animate={{
            x: [-20, 0, -20],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="text-4xl text-white drop-shadow-lg">←</div>
          <div className="text-white text-sm font-semibold drop-shadow-lg text-center">
            Swipe left
            <br />
            to skip
          </div>
        </motion.div>

        {/* Right arrow hint */}
        <motion.div
          className="absolute right-8 flex flex-col items-center gap-2"
          animate={{
            x: [20, 0, 20],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="text-4xl text-white drop-shadow-lg">→</div>
          <div className="text-white text-sm font-semibold drop-shadow-lg text-center">
            Swipe right
            <br />
            to select
          </div>
        </motion.div>

        {/* Dismiss hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-white text-xs drop-shadow-lg">Tap anywhere to dismiss</p>
        </div>

        {/* Got it button */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <button
            onClick={handleDismiss}
            className="px-6 py-2 bg-white/90 text-surface-DEFAULT font-medium rounded-lg shadow-lg hover:bg-white transition-colors pointer-events-auto"
          >
            Got it!
          </button>
        </div>
      </div>
    </motion.div>
  )
}
