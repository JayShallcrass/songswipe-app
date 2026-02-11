'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useSwipeState } from '@/lib/swipe-state'
import { CardCarousel } from '@/components/swipe/CardCarousel'
import { SwipeProgress } from '@/components/swipe/SwipeProgress'
import { PersonalisationForm, PersonalisationData, clearPersonalisationCache } from '@/components/forms/PersonalisationForm'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useSongBalance } from '@/lib/hooks/useSongBalance'
import { STAGE_ORDER } from '@/lib/swipe-data'

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
    handleSelect,
    goBack,
    goToStage,
    reset,
    isSwipeComplete,
    currentStageConfig,
  } = useSwipeState()

  const currentStageIndex = STAGE_ORDER.indexOf(state.currentStage)

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
    if (isSwipeComplete) {
      // Go back from personalisation form to last swipe stage
      goToStage('voice')
    } else {
      goBack()
    }
  }

  const handleStartOver = () => {
    reset()
  }

  return (
    <div className="bg-surface-DEFAULT min-h-screen">
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

        {/* SwipeProgress - now with navigation */}
        <SwipeProgress
          currentStage={state.currentStage}
          selections={state.selections}
          isPersonalising={isSwipeComplete}
          onStageClick={goToStage}
        />
      </header>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {!isSwipeComplete ? (
          <motion.div
            key={`swipe-${state.currentStage}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center px-4 py-4 sm:py-8"
          >
            {/* Back button (stages 2-4) */}
            {currentStageIndex > 0 && (
              <button
                onClick={goBack}
                className="self-start mb-2 flex items-center gap-1 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}

            {currentStageConfig && (
              <CardCarousel
                cards={currentStageConfig.cards}
                stage={currentStageConfig.stage}
                stageTitle={currentStageConfig.title}
                stageSubtitle={currentStageConfig.subtitle}
                onSelect={handleSelect}
                previousSelection={state.selections[currentStageConfig.stage]}
              />
            )}

            {/* Start Over link */}
            <button
              onClick={handleStartOver}
              className="mt-6 text-zinc-600 hover:text-zinc-400 text-xs font-medium transition-colors"
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
