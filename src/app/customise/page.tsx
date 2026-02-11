'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useSwipeState } from '@/lib/swipe-state'
import { useSwipeKeyboard } from '@/lib/swipe-keyboard'
import { SwipeStack } from '@/components/swipe/SwipeStack'
import { SwipeProgress } from '@/components/swipe/SwipeProgress'
import { PersonalisationForm, PersonalisationData, clearPersonalisationCache } from '@/components/forms/PersonalisationForm'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useSongBalance } from '@/lib/hooks/useSongBalance'

export default function CustomisePage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { data: balance } = useSongBalance()

  // Initialize Supabase client on mount
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      setSupabase(createBrowserClient(url, key))
    }
  }, [])

  // Get swipe state
  const {
    state,
    handleSwipe,
    undo,
    reset,
    canUndo,
    isSwipeComplete,
    currentStageConfig,
    didLoop,
  } = useSwipeState()

  // Get current card for keyboard navigation
  const currentCard = currentStageConfig?.cards[state.currentCardIndex]

  // Set up keyboard navigation (disabled when on personalisation form)
  useSwipeKeyboard({
    onSwipeLeft: useCallback(() => {
      if (currentCard) {
        handleSwipe(currentCard.id, 'left')
      }
    }, [currentCard, handleSwipe]),
    onSwipeRight: useCallback(() => {
      if (currentCard) {
        handleSwipe(currentCard.id, 'right')
      }
    }, [currentCard, handleSwipe]),
    onUndo: undo,
    canUndo,
    disabled: isSwipeComplete,
  })

  const handleFormSubmit = async (data: PersonalisationData) => {
    setIsLoading(true)

    try {
      // Check authentication
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/customise')
        return
      }

      // Build request body combining swipe selections + form data
      const body = {
        recipientName: data.recipientName,
        yourName: data.yourName,
        occasion: state.selections.occasion,
        songLength: data.songLength || '90',
        mood: [state.selections.mood], // Wrap in array to match existing schema
        genre: state.selections.genre,
        voice: state.selections.voice,
        language: data.language || 'en-GB',
        tempo: data.tempo || 'mid-tempo',
        relationship: data.relationship || undefined,
        specialMemories: data.specialMemories || undefined,
        thingsToAvoid: data.thingsToAvoid || undefined,
        occasionDate: data.occasionDate || undefined,
      }

      // Submit to API
      const response = await fetch('/api/customise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to create customisation')
      }

      const { checkoutUrl } = await response.json()
      // Clear swipe state and personalisation cache before redirecting
      reset()
      clearPersonalisationCache()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    undo()
  }

  const handleStartOver = () => {
    reset()
  }

  return (
    <div className={`bg-surface-DEFAULT ${!isSwipeComplete ? 'h-[100dvh] overflow-hidden flex flex-col' : 'min-h-screen'}`}>
      {/* App Header */}
      <header className="bg-surface-50 border-b border-surface-200 flex-shrink-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-2 sm:py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl">🎵</span>
            <span className="text-lg sm:text-xl font-heading font-bold text-white">
              SongSwipe
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {balance && balance.songsRemaining > 0 && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                {balance.songsRemaining} prepaid
              </span>
            )}
            <Link href="/dashboard" className="text-zinc-400 hover:text-white font-medium text-sm transition-colors">
              My Songs
            </Link>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="text-zinc-500 hover:text-zinc-300 text-xs sm:text-sm transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* SwipeProgress component */}
        <SwipeProgress
          currentStage={state.currentStage}
          selections={state.selections}
          isPersonalising={isSwipeComplete}
        />
      </header>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {!isSwipeComplete ? (
          <motion.div
            key="swipe-interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center px-4 py-2 overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            {currentStageConfig && (
              <SwipeStack
                cards={currentStageConfig.cards}
                currentCardIndex={state.currentCardIndex}
                stage={currentStageConfig.stage}
                stageTitle={currentStageConfig.title}
                stageSubtitle={currentStageConfig.subtitle}
                onSwipe={handleSwipe}
                onUndo={undo}
                canUndo={canUndo}
                didLoop={didLoop}
              />
            )}

            {/* Start Over link */}
            <button
              onClick={handleStartOver}
              className="mt-2 text-zinc-600 hover:text-zinc-400 text-xs font-medium transition-colors"
            >
              Start Over
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="personalisation-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8"
          >
            <PersonalisationForm
              onSubmit={handleFormSubmit}
              onBack={handleBack}
              isLoading={isLoading}
              selections={state.selections}
            />

            {/* Start Over link */}
            <div className="mt-8 text-center">
              <button
                onClick={handleStartOver}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
