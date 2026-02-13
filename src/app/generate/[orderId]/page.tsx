'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useGenerationStatus } from '@/lib/hooks/useGenerationStatus'
import { GenerationProgress } from '@/components/generation/GenerationProgress'
import { VariantSwiper } from '@/components/generation/VariantSwiper'
import { VariantUpsellModal } from '@/components/upsells/VariantUpsellModal'
import { TweakModal } from '@/components/tweak/TweakModal'
import { PostSelectionShare } from '@/components/generation/PostSelectionShare'
import { XCircleIcon, FaceFrownIcon } from '@heroicons/react/24/solid'

export default function GenerationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.orderId as string

  const [showSwiper, setShowSwiper] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [selectError, setSelectError] = useState<string | null>(null)
  const [hasSwipedAll, setHasSwipedAll] = useState(false)
  const [showUpsellModal, setShowUpsellModal] = useState(false)
  const [upsellDismissed, setUpsellDismissed] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareData, setShareData] = useState<{
    variantId: string
    shareToken: string | null
    recipientName: string
    senderName: string
    occasion: string
    occasionDate: string | null
  } | null>(null)
  const [showTweakModal, setShowTweakModal] = useState(false)
  const [tweakGenerating, setTweakGenerating] = useState(false)
  const [tweakVariantReady, setTweakVariantReady] = useState(false)
  const [tweakData, setTweakData] = useState<{
    specialMemories: string
    thingsToAvoid: string
    pronunciation: string
  } | null>(null)
  const generationStarted = useRef(false)

  const isUpsellReturn = searchParams.get('upsell') === 'success'
  const isTweakReturn = searchParams.get('tweak') === 'success'
  const isPrepaid = searchParams.get('prepaid') === 'true'
  const prepaidRemaining = searchParams.get('remaining')
  const [upsellVariantReady, setUpsellVariantReady] = useState(false)
  const [showPrepaidBanner, setShowPrepaidBanner] = useState(isPrepaid)
  const prevCompletedCount = useRef(0)

  const {
    data,
    isLoading,
    error,
    isComplete,
    completedVariants,
    completedCount,
  } = useGenerationStatus(orderId)

  // Trigger generation of the next variant
  const triggerGeneration = useCallback(async () => {
    if (isGenerating) return
    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Generation failed (${response.status})`)
      }

      const result = await response.json()

      // If there are more pending variants, trigger the next one
      if (result.status === 'generated' && result.remaining > 0) {
        setIsGenerating(false)
        // Small delay before kicking off next variant
        setTimeout(() => triggerGeneration(), 1000)
        return
      }

      // All done or no more pending
      setIsGenerating(false)
    } catch (err) {
      console.error('Generation error:', err)
      setGenerationError(err instanceof Error ? err.message : 'Generation failed')
      setIsGenerating(false)
    }
  }, [orderId, isGenerating])

  // Auto-start generation as fallback if webhook trigger didn't fire.
  useEffect(() => {
    if (
      !generationStarted.current &&
      data &&
      !isLoading &&
      (data.order_status === 'paid' || data.order_status === 'generating') &&
      data.variants.some(v => v.generation_status === 'pending') &&
      !data.variants.some(v => v.generation_status === 'generating')
    ) {
      generationStarted.current = true
      triggerGeneration()
    }
  }, [data, isLoading, triggerGeneration])

  // On upsell return, show swiper immediately with existing variants
  useEffect(() => {
    if (isUpsellReturn && completedCount > 0 && !showSwiper) {
      setShowSwiper(true)
      setUpsellDismissed(true)
      setHasSwipedAll(false)
    }
  }, [isUpsellReturn, completedCount, showSwiper])

  // Track when the 4th variant finishes generating
  useEffect(() => {
    if (isUpsellReturn && completedCount > prevCompletedCount.current && completedCount >= 4) {
      setUpsellVariantReady(true)
      const timer = setTimeout(() => setUpsellVariantReady(false), 4000)
      return () => clearTimeout(timer)
    }
    prevCompletedCount.current = completedCount
  }, [isUpsellReturn, completedCount])

  // On tweak return from Stripe, show swiper with generating banner
  useEffect(() => {
    if (isTweakReturn && completedCount > 0 && !showSwiper) {
      setShowSwiper(true)
      setTweakGenerating(true)
      setUpsellDismissed(true)
    }
  }, [isTweakReturn, completedCount, showSwiper])

  // Track when tweak variant finishes (same logic as upsell variant tracking)
  useEffect(() => {
    if ((isTweakReturn || tweakGenerating) && completedCount > prevCompletedCount.current) {
      // A new variant just completed while tweak was generating
      setTweakGenerating(false)
      setTweakVariantReady(true)
      const timer = setTimeout(() => setTweakVariantReady(false), 4000)
      return () => clearTimeout(timer)
    }
    prevCompletedCount.current = completedCount
  }, [isTweakReturn, tweakGenerating, completedCount])

  // Fetch customization data for tweak modal pre-population
  useEffect(() => {
    if (data && !tweakData) {
      fetch(`/api/orders/${orderId}/customization`)
        .then(res => res.ok ? res.json() : null)
        .then(cust => {
          if (cust) {
            setTweakData({
              specialMemories: cust.special_memories || '',
              thingsToAvoid: cust.things_to_avoid || '',
              pronunciation: cust.pronunciation || '',
            })
          }
        })
        .catch(() => {})
    }
  }, [data, orderId, tweakData])

  // Handle tweak success (free tweak submitted)
  const handleTweakSuccess = () => {
    setShowTweakModal(false)
    setTweakGenerating(true)
    generationStarted.current = false
  }

  // Trigger upsell modal after viewing all variants (5-second delay)
  useEffect(() => {
    if (hasSwipedAll && !upsellDismissed && !selectedVariantId) {
      const timer = setTimeout(() => {
        setShowUpsellModal(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [hasSwipedAll, upsellDismissed, selectedVariantId])

  // Handle variant index change
  const handleVariantIndexChange = (index: number, total: number) => {
    if (index === total - 1 && !hasSwipedAll) {
      setHasSwipedAll(true)
    }
  }

  // Handle upsell modal close
  const handleCloseUpsell = () => {
    setShowUpsellModal(false)
    setUpsellDismissed(true)
  }

  // Handle variant selection
  const handleSelect = async (variantId: string) => {
    try {
      setSelectError(null)
      const response = await fetch(`/api/orders/${orderId}/variants/${variantId}/select`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to select variant')
      }

      const result = await response.json()

      setShareData({
        variantId,
        shareToken: result.share_token,
        recipientName: result.recipient_name || 'them',
        senderName: result.sender_name || 'Someone',
        occasion: result.occasion || 'just-because',
        occasionDate: result.occasion_date,
      })
      setSelectedVariantId(variantId)
    } catch (err) {
      setSelectError(err instanceof Error ? err.message : 'Failed to select variant')
      window.alert('Failed to select variant. Please try again.')
    }
  }

  // No orderId
  if (!orderId) {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-surface-50 border border-surface-200 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-4"><XCircleIcon className="w-14 h-14 text-red-500" /></div>
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Order</h1>
          <p className="text-zinc-400 mb-6">No order ID was provided.</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8 animate-pulse">
            <div className="h-8 bg-surface-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-surface-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-4 bg-surface-200 rounded w-full mb-6"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-surface-50 border border-surface-200 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-4"><XCircleIcon className="w-14 h-14 text-red-500" /></div>
          <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
          <p className="text-zinc-400 mb-6">{error.message}</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // All variants failed
  if (data && completedCount === 0 && data.order_status === 'failed') {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-surface-50 border border-surface-200 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-4"><FaceFrownIcon className="w-14 h-14 text-red-400" /></div>
          <h1 className="text-2xl font-bold text-white mb-4">Generation Failed</h1>
          <p className="text-zinc-400 mb-6">
            Unfortunately, all song variants failed to generate. Please try again or contact support.
          </p>
          <div className="bg-surface-100 rounded-xl px-4 py-2 mb-6">
            <p className="text-sm text-zinc-500">
              Order ID: <span className="font-mono font-semibold text-zinc-300">{orderId.slice(-8)}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                generationStarted.current = false
                setGenerationError(null)
                triggerGeneration()
              }}
              className="px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Retry Generation
            </button>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 border border-surface-300 text-zinc-300 rounded-full font-semibold hover:bg-surface-100 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Phase C: Variant selected - show share experience
  if (selectedVariantId && shareData) {
    return <PostSelectionShare data={shareData} />
  }

  // Phase B: Show swiper for completed variants
  if (showSwiper && completedCount > 0) {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-white mb-2">Choose Your Favourite</h1>
            <p className="text-lg text-zinc-400">
              Listen to each variant and select the one you love
            </p>
          </div>

          <VariantSwiper
            orderId={orderId}
            variants={completedVariants}
            onSelect={handleSelect}
            onIndexChange={handleVariantIndexChange}
          />

          {/* Tweak CTA */}
          {tweakData && !selectedVariantId && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowTweakModal(true)}
                className="text-zinc-400 hover:text-white text-sm transition-colors underline underline-offset-4 decoration-zinc-600 hover:decoration-zinc-400"
              >
                Not quite right? Tweak your details
              </button>
            </div>
          )}

          {selectError && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm">{selectError}</p>
            </div>
          )}

          {/* Upsell Modal */}
          <VariantUpsellModal
            orderId={orderId}
            isOpen={showUpsellModal}
            onClose={handleCloseUpsell}
          />

          {/* Tweak Modal */}
          {tweakData && (
            <TweakModal
              orderId={orderId}
              isOpen={showTweakModal}
              onClose={() => setShowTweakModal(false)}
              onSuccess={handleTweakSuccess}
              tweakUsed={(data?.tweak_count ?? 0) >= 1}
              initialData={tweakData}
            />
          )}

          {/* Tweak variant generating banner */}
          {tweakGenerating && data?.variants.some(v => v.generation_status === 'pending' || v.generation_status === 'generating') && (
            <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-purple-400 font-medium text-sm">Your tweaked variant is generating...</p>
              </div>
            </div>
          )}

          {/* Tweak variant ready notification */}
          {tweakVariantReady && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-green-400 font-medium text-sm">Your tweaked variant is ready! Swipe through to find it.</p>
            </div>
          )}

          {/* 4th variant generating banner */}
          {isUpsellReturn && !tweakGenerating && data?.variants.some(v => v.generation_status === 'pending' || v.generation_status === 'generating') && (
            <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-purple-400 font-medium text-sm">Your 4th variant is being generated...</p>
              </div>
            </div>
          )}

          {/* 4th variant ready notification */}
          {upsellVariantReady && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-green-400 font-medium text-sm">Your 4th variant is ready! Swipe through to find it.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Phase A: Show progress during generation
  return (
    <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto w-full">
        {/* Prepaid song banner */}
        {showPrepaidBanner && (
          <div className="mb-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
            <p className="text-purple-400 font-medium text-sm">
              Using one of your prepaid songs{prepaidRemaining ? ` (${prepaidRemaining} remaining)` : ''}
            </p>
            <button onClick={() => setShowPrepaidBanner(false)} className="text-purple-500 text-xs mt-1 hover:text-purple-300 transition-colors">
              Dismiss
            </button>
          </div>
        )}

        <GenerationProgress
          orderId={orderId}
          onAllComplete={() => setShowSwiper(true)}
        />

        {/* Generation error with retry */}
        {generationError && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm mb-3">{generationError}</p>
            <button
              onClick={() => {
                setGenerationError(null)
                triggerGeneration()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
