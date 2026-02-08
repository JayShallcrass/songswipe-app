'use client'

import { useState } from 'react'
import { createBundleCheckout } from '@/actions/create-bundle-checkout'
import { BUNDLE_TIERS } from '@/lib/bundles/pricing'
import { BundleTier } from '@/lib/bundles/types'
import { BASE_PRICE } from '@/lib/bundles/pricing'
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export function BundleOfferCard() {
  const [selectedTier, setSelectedTier] = useState<BundleTier>(BUNDLE_TIERS[1]) // Default to 5-pack
  const [isLoading, setIsLoading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const { url } = await createBundleCheckout({ bundleTierId: selectedTier.id })
      window.location.href = url
    } catch (error) {
      console.error('Failed to create bundle checkout:', error)
      alert('Failed to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  if (isDismissed) {
    return null
  }

  const savingsPerSong = BASE_PRICE - selectedTier.perSongPrice

  return (
    <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Dismiss offer"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

      {/* Headline */}
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold mb-2">Loved Your Song? Create More & Save</h3>
        <p className="text-purple-100 text-lg">
          Stock up on song credits for upcoming birthdays, anniversaries, and celebrations
        </p>
      </div>

      {/* Tier selection grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {BUNDLE_TIERS.map((tier) => {
          const isSelected = selectedTier.id === tier.id
          return (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier)}
              className={`relative p-6 rounded-xl transition-all ${
                isSelected
                  ? 'bg-white text-purple-900 shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </div>
              )}
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{tier.quantity}</div>
                <div className="text-sm mb-3">Songs</div>
                <div className="text-2xl font-bold mb-1">
                  £{(tier.price / 100).toFixed(2)}
                </div>
                <div className="text-sm opacity-75">
                  £{(tier.perSongPrice / 100).toFixed(2)}/song
                </div>
                <div className="mt-2 text-xs font-semibold">
                  Save {tier.savings}%
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* What You Get section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-lg mb-4">What You Get</h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>{selectedTier.quantity} complete song generations (3 variants each)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Credits never expire</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Use for any occasion or recipient</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Save £{(savingsPerSong / 100).toFixed(2)} per song vs single purchase</span>
          </li>
        </ul>
      </div>

      {/* CTA button */}
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full py-4 px-6 bg-gradient-to-r from-purple-900 to-pink-900 text-white font-semibold rounded-full hover:from-purple-800 hover:to-pink-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
      >
        {isLoading ? 'Loading...' : `Get ${selectedTier.quantity} Songs for £${(selectedTier.price / 100).toFixed(2)}`}
      </button>

      {/* Social proof */}
      <p className="text-center text-sm text-purple-100 mt-4">
        Join customers who have purchased bundles for gifting throughout the year
      </p>
    </div>
  )
}
