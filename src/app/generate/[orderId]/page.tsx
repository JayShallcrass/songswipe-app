'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useGenerationStatus } from '@/lib/hooks/useGenerationStatus'
import { GenerationProgress } from '@/components/generation/GenerationProgress'
import { VariantSwiper } from '@/components/generation/VariantSwiper'
import { VariantUpsellModal } from '@/components/upsells/VariantUpsellModal'

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
  const generationStarted = useRef(false)

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

  // Auto-start generation when page loads and order has pending variants
  useEffect(() => {
    if (
      !generationStarted.current &&
      data &&
      !isLoading &&
      (data.order_status === 'paid' || data.order_status === 'generating') &&
      data.variants.some(v => v.generation_status === 'pending')
    ) {
      generationStarted.current = true
      triggerGeneration()
    }
  }, [data, isLoading, triggerGeneration])

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

      setSelectedVariantId(variantId)
    } catch (err) {
      setSelectError(err instanceof Error ? err.message : 'Failed to select variant')
      window.alert('Failed to select variant. Please try again.')
    }
  }

  // No orderId
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">&#10060;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Order</h1>
          <p className="text-gray-600 mb-6">No order ID was provided.</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">&#10060;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">&#128542;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Generation Failed</h1>
          <p className="text-gray-600 mb-6">
            Unfortunately, all song variants failed to generate. Please try again or contact support.
          </p>
          <div className="bg-gray-100 rounded-lg px-4 py-2 mb-6">
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-mono font-semibold text-gray-700">{orderId.slice(-8)}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                generationStarted.current = false
                setGenerationError(null)
                triggerGeneration()
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
            >
              Retry Generation
            </button>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Phase C: Variant selected - show confirmation
  if (selectedVariantId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-6">&#9989;</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your song has been selected!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your chosen variant is ready. You can listen to it and download it from your dashboard.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Phase B: Show swiper for completed variants
  if (showSwiper && completedCount > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Favourite</h1>
            <p className="text-lg text-gray-600">
              Listen to each variant and select the one you love
            </p>
          </div>

          <VariantSwiper
            orderId={orderId}
            variants={completedVariants}
            onSelect={handleSelect}
            onIndexChange={handleVariantIndexChange}
          />

          {selectError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">{selectError}</p>
            </div>
          )}

          {/* Upsell Modal */}
          <VariantUpsellModal
            orderId={orderId}
            isOpen={showUpsellModal}
            onClose={handleCloseUpsell}
          />

          {/* Upsell success notification */}
          {searchParams.get('upsell') === 'success' && (
            <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-pulse">
              <p className="text-green-600 font-medium">4th variant is being generated...</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Phase A: Show progress during generation
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-purple-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto w-full">
        <GenerationProgress
          orderId={orderId}
          onAllComplete={() => setShowSwiper(true)}
        />

        {/* Generation error with retry */}
        {generationError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 text-sm mb-3">{generationError}</p>
            <button
              onClick={() => {
                setGenerationError(null)
                triggerGeneration()
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Preview ready variants button (partial success) */}
        {completedCount > 0 && !isComplete && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowSwiper(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
            >
              Preview Ready Variants ({completedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
