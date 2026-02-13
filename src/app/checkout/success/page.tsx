'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [orderId, setOrderId] = useState<string | null>(null)
  const [polling, setPolling] = useState(true)
  const [pollAttempts, setPollAttempts] = useState(0)

  // Poll for order by session_id (webhook may not have fired yet)
  useEffect(() => {
    if (!sessionId || orderId) return

    const pollForOrder = async () => {
      try {
        const response = await fetch(`/api/orders?session_id=${sessionId}`)

        if (response.ok) {
          const data = await response.json()
          if (data.order) {
            setOrderId(data.order.id)
            setPolling(false)
            return
          }
        }

        // Keep polling for up to 30 seconds (15 attempts x 2 seconds)
        setPollAttempts(prev => prev + 1)
        if (pollAttempts >= 15) {
          setPolling(false)
        }
      } catch (error) {
        console.error('Error polling for order:', error)
      }
    }

    const interval = setInterval(pollForOrder, 2000)
    pollForOrder() // Initial call

    return () => clearInterval(interval)
  }, [sessionId, orderId, pollAttempts])

  // If no session_id, show error
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-surface-50 border border-surface-200 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-4"><XCircleIcon className="w-14 h-14 text-red-500" /></div>
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Checkout Session</h1>
          <p className="text-zinc-400 mb-6">
            We couldn&apos;t find your checkout session. Please try again or contact support.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Back to Pricing
          </Link>
        </div>
      </div>
    )
  }

  // Show last 8 characters of session_id as reference
  const sessionReference = sessionId.slice(-8)

  return (
    <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto bg-surface-50 border border-surface-200 rounded-2xl p-8">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><CheckCircleIcon className="w-16 h-16 text-green-500" /></div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-lg text-zinc-400">
            Your personalised song is being generated. This usually takes a few minutes.
          </p>
          <div className="mt-4 inline-block bg-surface-100 rounded-xl px-4 py-2">
            <p className="text-sm text-zinc-500">
              Reference: <span className="font-mono font-semibold text-zinc-300">...{sessionReference}</span>
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">What happens next</h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <p className="text-zinc-300 font-medium">Our AI is generating 3 unique song variants based on your preferences</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <p className="text-zinc-300 font-medium">You&apos;ll be able to swipe through them and pick your favourite</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <p className="text-zinc-300 font-medium">Download your chosen song as a high-quality MP3</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {orderId ? (
            <Link
              href={`/generate/${orderId}`}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-center"
            >
              Watch Your Song Being Created
            </Link>
          ) : polling ? (
            <div className="w-full sm:w-auto px-8 py-3 bg-surface-200 text-zinc-400 rounded-full font-semibold text-center flex items-center justify-center gap-2 cursor-wait">
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-center"
            >
              Go to Dashboard
            </Link>
          )}
          <Link
            href="/"
            className="text-zinc-500 hover:text-white font-medium transition-colors"
          >
            Create Another Song
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
