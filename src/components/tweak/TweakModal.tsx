'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TWEAK_PRICE } from '@/lib/bundles/pricing'
import { createTweakCheckout } from '@/actions/create-tweak-checkout'

interface TweakModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tweakUsed: boolean
  initialData: {
    specialMemories: string
    thingsToAvoid: string
    pronunciation: string
  }
}

export function TweakModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
  tweakUsed,
  initialData,
}: TweakModalProps) {
  const [specialMemories, setSpecialMemories] = useState(initialData.specialMemories)
  const [thingsToAvoid, setThingsToAvoid] = useState(initialData.thingsToAvoid)
  const [pronunciation, setPronunciation] = useState(initialData.pronunciation)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasChanges =
    specialMemories !== initialData.specialMemories ||
    thingsToAvoid !== initialData.thingsToAvoid ||
    pronunciation !== initialData.pronunciation

  const handleFreeTweak = async () => {
    if (!hasChanges) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tweak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          specialMemories,
          thingsToAvoid,
          pronunciation,
        }),
      })

      const result = await response.json()

      if (result.requiresPayment) {
        // Shouldn't happen for free tweak, but handle gracefully
        setError('Free tweak already used. Please use the paid option.')
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit tweak')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  const handlePaidTweak = async () => {
    if (!hasChanges) return
    setIsLoading(true)
    setError(null)

    try {
      const { url } = await createTweakCheckout({
        orderId,
        specialMemories,
        thingsToAvoid,
        pronunciation,
      })
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
          >
            <div className="bg-surface-50 border border-surface-200 rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
              {/* Headline */}
              <h2 className="text-2xl font-bold text-white mb-1 text-center">
                Tweak Your Song
              </h2>
              <p className="text-zinc-400 text-center text-sm mb-6">
                Add more detail to get a better result. Mood, genre, and tempo stay the same.
              </p>

              {/* Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Special Memories
                  </label>
                  <textarea
                    value={specialMemories}
                    onChange={(e) => setSpecialMemories(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Add specific memories, inside jokes, or moments..."
                    className="w-full bg-surface-100 border border-surface-300 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-zinc-500 mt-1 text-right">{specialMemories.length}/500</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Things to Avoid
                  </label>
                  <input
                    type="text"
                    value={thingsToAvoid}
                    onChange={(e) => setThingsToAvoid(e.target.value)}
                    maxLength={300}
                    placeholder="Topics or words to steer clear of..."
                    className="w-full bg-surface-100 border border-surface-300 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Pronunciation Guide
                  </label>
                  <input
                    type="text"
                    value={pronunciation}
                    onChange={(e) => setPronunciation(e.target.value)}
                    maxLength={100}
                    placeholder='e.g. "Saoirse" = "Seer-sha"'
                    className="w-full bg-surface-100 border border-surface-300 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={tweakUsed ? handlePaidTweak : handleFreeTweak}
                  disabled={isLoading || !hasChanges}
                  className="w-full px-6 py-4 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-xl font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? 'Loading...'
                    : tweakUsed
                      ? `Tweak for \u00A3${(TWEAK_PRICE / 100).toFixed(2)}`
                      : 'Generate New Variant'}
                </button>
                {!tweakUsed && (
                  <p className="text-xs text-zinc-500 text-center">First tweak is free</p>
                )}
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full px-6 py-4 border-2 border-surface-300 text-zinc-300 rounded-xl font-semibold hover:bg-surface-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
