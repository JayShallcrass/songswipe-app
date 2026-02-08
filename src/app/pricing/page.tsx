import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Create a personalised AI song package - 3 unique variants for £7.99',
}

export default function PricingPage({
  searchParams,
}: {
  searchParams: { canceled?: string }
}) {
  const wasCanceled = searchParams.canceled === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Main content wrapper */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Canceled checkout banner */}
        {wasCanceled && (
          <div className="mb-8 max-w-2xl mx-auto bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
            <p className="text-amber-800 font-medium">
              Checkout was canceled. You can try again when you&apos;re ready.
            </p>
          </div>
        )}

        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent leading-tight">
            Create Your Perfect Song
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get 3 AI-generated song variants. Swipe to pick your favourite.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-md mx-auto bg-white border-2 border-purple-200 rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <p className="text-sm font-semibold text-purple-600 uppercase mb-2">
              Song Package
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-6xl font-bold text-gray-900">£7.99</span>
              <span className="text-gray-500 text-lg">one-time</span>
            </div>
          </div>

          {/* Feature list */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-gray-900">3 unique song variants</p>
                <p className="text-sm text-gray-600">AI-generated variations to swipe between</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-gray-900">Fully personalised lyrics</p>
                <p className="text-sm text-gray-600">Your memories and message woven throughout</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-gray-900">High-quality audio download</p>
                <p className="text-sm text-gray-600">MP3 format, ready to share</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-gray-900">Shareable gift link</p>
                <p className="text-sm text-gray-600">Send a unique URL to your recipient</p>
              </div>
            </div>
          </div>

          {/* CTA button */}
          <Link
            href="/customize"
            className="block w-full py-4 text-center font-bold text-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            Create Your Song
          </Link>
        </div>

        {/* Competitor comparison */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Other personalised song services charge £45-£199+ and take days. SongSwipe delivers in minutes.
          </p>
        </div>

        {/* Trust signals */}
        <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-700">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-semibold">4.9/5</span>
            </div>

            {/* Secure payment */}
            <div className="flex items-center gap-1.5">
              <span>🔒</span>
              <span>Secure payment via Stripe</span>
            </div>

            {/* Fast generation */}
            <div className="flex items-center gap-1.5">
              <span>✨</span>
              <span>Generated in minutes</span>
            </div>

            {/* Satisfaction */}
            <div className="flex items-center gap-1.5">
              <span>Satisfaction guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
