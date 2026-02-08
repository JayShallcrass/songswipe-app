'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createUpsellCheckout } from '@/actions/create-upsell-checkout'
import { UPSELL_PRICE, BASE_PRICE } from '@/lib/bundles/pricing'

interface VariantUpsellModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
}

export function VariantUpsellModal({ orderId, isOpen, onClose }: VariantUpsellModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Calculate savings percentage
  const savingsPercent = Math.round(((BASE_PRICE - UPSELL_PRICE) / BASE_PRICE) * 100)

  const handleAccept = async () => {
    try {
      setIsLoading(true)
      const { url } = await createUpsellCheckout({ orderId })
      window.location.href = url
    } catch (error) {
      console.error('Failed to create upsell checkout:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.')
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              {/* Headline */}
              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                Want One More Option?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Get a 4th variant for just £{(UPSELL_PRICE / 100).toFixed(2)}
              </p>

              {/* Pricing Card */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm opacity-80 line-through">
                      £{(BASE_PRICE / 100).toFixed(2)}
                    </p>
                    <p className="text-4xl font-bold">
                      £{(UPSELL_PRICE / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-sm font-semibold">
                      Save {savingsPercent}%
                    </p>
                  </div>
                </div>
                <p className="text-sm opacity-90">
                  One additional variant to choose from
                </p>
              </div>

              {/* Benefits List */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Additional variant to choose from</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Same high quality as your other variants</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Generated in 30-60 seconds</span>
                </li>
              </ul>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Yes, Generate 4th Variant'}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  No Thanks, Continue with 3
                </button>
              </div>

              {/* Trust Signal */}
              <p className="text-xs text-gray-500 text-center mt-4">
                This offer expires once you select a variant
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
