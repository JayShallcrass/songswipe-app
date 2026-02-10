'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createUpsellCheckout } from '@/actions/create-upsell-checkout'
import { UPSELL_PRICE } from '@/lib/bundles/pricing'

interface VariantUpsellModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
}

export function VariantUpsellModal({ orderId, isOpen, onClose }: VariantUpsellModalProps) {
  const [isLoading, setIsLoading] = useState(false)

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
                One More Take?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Add a 4th variant for just £{(UPSELL_PRICE / 100).toFixed(2)}
              </p>

              {/* Pricing Card */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 text-white text-center">
                <p className="text-5xl font-bold mb-1">
                  £{(UPSELL_PRICE / 100).toFixed(2)}
                </p>
                <p className="text-sm opacity-90">
                  One extra take added to your selection
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Add 4th Variant'}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  No Thanks
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
