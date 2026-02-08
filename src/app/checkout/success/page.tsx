'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  // If no session_id, show error
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Checkout Session</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find your checkout session. Please try again or contact support.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-purple-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Your personalised song is being generated. This usually takes a few minutes.
          </p>
          <div className="mt-4 inline-block bg-gray-100 rounded-lg px-4 py-2">
            <p className="text-sm text-gray-500">
              Reference: <span className="font-mono font-semibold text-gray-700">...{sessionReference}</span>
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What happens next</h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <p className="text-gray-800 font-medium">Our AI is generating 3 unique song variants based on your preferences</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <p className="text-gray-800 font-medium">You&apos;ll be able to swipe through them and pick your favourite</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <p className="text-gray-800 font-medium">Download your chosen song as a high-quality MP3</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg text-center"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Create Another Song
          </Link>
        </div>
      </div>
    </div>
  )
}
