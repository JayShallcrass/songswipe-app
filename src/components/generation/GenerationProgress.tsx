'use client'

import { useEffect, useState, useCallback } from 'react'
import { useGenerationStatus } from '@/lib/hooks/useGenerationStatus'
import { musicFacts } from '@/lib/music-facts'

interface GenerationProgressProps {
  orderId: string
  onAllComplete?: () => void
  onRetryFailed?: () => void
}

// Shuffle array using Fisher-Yates and return a copy
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function GenerationProgress({ orderId, onAllComplete, onRetryFailed }: GenerationProgressProps) {
  const {
    data,
    isLoading,
    error,
    isComplete,
    completedCount,
    totalVariants,
  } = useGenerationStatus(orderId)

  // Shuffled facts so each session gets a unique order
  const [shuffledFacts] = useState(() => shuffleArray(musicFacts))
  const [factIndex, setFactIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  // Cycle through facts every 8 seconds with fade transition
  const rotateFact = useCallback(() => {
    setFadeIn(false)
    setTimeout(() => {
      setFactIndex((prev) => (prev + 1) % shuffledFacts.length)
      setFadeIn(true)
    }, 400)
  }, [shuffledFacts.length])

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(rotateFact, 8000)
    return () => clearInterval(interval)
  }, [isComplete, rotateFact])

  // Call onAllComplete when generation finishes
  useEffect(() => {
    if (isComplete && onAllComplete) {
      onAllComplete()
    }
  }, [isComplete, onAllComplete])

  if (isLoading) {
    return (
      <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-surface-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-surface-200 rounded w-1/3 mb-6"></div>
        <div className="h-4 bg-surface-200 rounded w-full mb-6"></div>
        <div className="space-y-4">
          <div className="h-6 bg-surface-200 rounded"></div>
          <div className="h-6 bg-surface-200 rounded"></div>
          <div className="h-6 bg-surface-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">&#x274C;</div>
        <h2 className="text-2xl font-bold text-white mb-2">Error Loading Status</h2>
        <p className="text-zinc-400">{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const progressPercentage = totalVariants > 0 ? (completedCount / totalVariants) * 100 : 0
  const hasFailedVariants = data.variants.some(v => v.generation_status === 'failed')
  const hasCompletedVariants = completedCount > 0

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8">
      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isComplete ? 'Your songs are ready!' : 'Creating your songs...'}
        </h1>
        <p className="text-lg text-zinc-400">
          {completedCount}/{totalVariants} variants complete
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="mb-8">
        <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Music fact / joke */}
      {!isComplete && (
        <div className="mb-8 text-center min-h-[4rem] flex items-center justify-center px-4">
          <p
            className={`text-sm text-zinc-500 italic transition-opacity duration-400 ${
              fadeIn ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {shuffledFacts[factIndex]}
          </p>
        </div>
      )}

      {/* Per-variant status list */}
      <div className="space-y-4 mb-6">
        {data.variants.map((variant) => (
          <div key={variant.id} className="flex items-center gap-3">
            {/* Status icon */}
            <div className="flex-shrink-0 w-6 h-6">
              {variant.generation_status === 'pending' && (
                <div className="w-6 h-6 border-2 border-surface-300 rounded-full" />
              )}
              {variant.generation_status === 'generating' && (
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              )}
              {variant.generation_status === 'complete' && (
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {variant.generation_status === 'failed' && (
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Status text */}
            <div className="flex-1">
              {variant.generation_status === 'pending' && (
                <p className="text-zinc-500">Variant {variant.variant_number}: Waiting...</p>
              )}
              {variant.generation_status === 'generating' && (
                <p className="text-brand-400 font-medium">Variant {variant.variant_number}: Generating...</p>
              )}
              {variant.generation_status === 'complete' && (
                <p className="text-green-400 font-medium">Variant {variant.variant_number}: Ready</p>
              )}
              {variant.generation_status === 'failed' && (
                <p className="text-red-400 font-medium">Variant {variant.variant_number}: Failed</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Partial success banner */}
      {hasFailedVariants && hasCompletedVariants && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex gap-2 items-start">
            <div className="text-yellow-400 flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-yellow-300">
                Some variants could not be generated. You can still listen to the successful ones.
              </p>
              {onRetryFailed && (
                <button
                  onClick={onRetryFailed}
                  className="mt-2 px-4 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Retry Failed Variants
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
