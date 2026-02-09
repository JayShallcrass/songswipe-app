'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useSwipeState } from '@/lib/swipe-state'
import { useSwipeKeyboard } from '@/lib/swipe-keyboard'
import { SwipeStack } from '@/components/swipe/SwipeStack'
import { SwipeProgress } from '@/components/swipe/SwipeProgress'
import { PersonalizationForm, PersonalizationData, clearPersonalizationCache } from '@/components/forms/PersonalizationForm'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'

export default function CustomizePage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showHints, setShowHints] = useState(true)

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
  } = useSwipeState()

  // Get current card for keyboard navigation
  const currentCard = currentStageConfig?.cards[state.currentCardIndex]

  // Set up keyboard navigation (disabled when on personalization form)
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

  const handleFormSubmit = async (data: PersonalizationData) => {
    setIsLoading(true)

    try {
      // Check authentication
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/customize')
        return
      }

      // Build request body combining swipe selections + form data
      const body = {
        recipientName: data.recipientName,
        yourName: data.yourName,
        occasion: state.selections.occasion,
        songLength: '90', // Default to 90s
        mood: [state.selections.mood], // Wrap in array to match existing schema
        genre: state.selections.genre,
        specialMemories: data.specialMemories || undefined,
        thingsToAvoid: data.thingsToAvoid || undefined,
        occasionDate: data.occasionDate || undefined,
      }

      // Submit to API
      const response = await fetch('/api/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to create customization')
      }

      const { checkoutUrl } = await response.json()
      // Clear swipe state and personalization cache before redirecting
      reset()
      clearPersonalizationCache()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    // Go back to last swipe stage
    undo()
  }

  const handleStartOver = () => {
    // Clear all swipe state and sessionStorage
    reset()
    setShowHints(true)
  }

  const handleHintsDismiss = () => {
    setShowHints(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SongSwipe
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
              My Songs
            </Link>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="text-gray-500 hover:text-gray-700 text-sm">
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* SwipeProgress component */}
        <SwipeProgress
          currentStage={state.currentStage}
          selections={state.selections}
        />
      </header>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          {!isSwipeComplete ? (
            <motion.div
              key="swipe-interface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
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
                  showHints={showHints}
                  onHintsDismiss={handleHintsDismiss}
                />
              )}

              {/* Start Over link */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleStartOver}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="personalization-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PersonalizationForm
                onSubmit={handleFormSubmit}
                onBack={handleBack}
                isLoading={isLoading}
                selections={state.selections}
              />

              {/* Start Over link */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleStartOver}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
