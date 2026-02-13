import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { LockClosedIcon } from '@heroicons/react/24/solid'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Create a personalised AI song package - 3 unique variants for £7.99',
}

export default function PricingPage({
  searchParams,
}: {
  searchParams: { canceled?: string }
}) {
  const plainParams = { ...searchParams }
  const wasCanceled = plainParams.canceled === 'true'

  return (
    <div className="min-h-screen bg-surface-DEFAULT">
      {/* Main content wrapper */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Canceled checkout banner */}
        {wasCanceled && (
          <div className="mb-8 max-w-2xl mx-auto bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
            <p className="text-amber-400 font-medium">
              Checkout was canceled. You can try again when you&apos;re ready.
            </p>
          </div>
        )}

        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4 text-white leading-tight">
            Create Your Perfect Song
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Get 3 AI-generated song variants. Swipe to pick your favourite.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-md mx-auto bg-surface-50 border border-surface-200 rounded-2xl p-5 sm:p-8 mb-8">
          <div className="text-center mb-6">
            <p className="text-sm font-semibold text-brand-500 uppercase mb-2 tracking-wider">
              Song Package
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl sm:text-6xl font-bold text-white">&pound;7.99</span>
              <span className="text-zinc-500 text-lg">one-time</span>
            </div>
          </div>

          {/* Feature list */}
          <div className="space-y-4 mb-8">
            {[
              { title: '3 unique song variants', desc: 'AI-generated variations to swipe between' },
              { title: 'Fully personalised lyrics', desc: 'Your memories and message woven throughout' },
              { title: 'High-quality audio download', desc: 'MP3 format, ready to share' },
              { title: 'Shareable gift link', desc: 'Send a unique URL to your recipient' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-semibold text-white">{feature.title}</p>
                  <p className="text-sm text-zinc-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <Link
            href="/customise"
            className="block w-full py-4 text-center font-bold text-lg text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-full hover:from-brand-600 hover:to-purple-700 transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            Create Your Song
          </Link>
        </div>

        {/* Competitor comparison */}
        <div className="text-center mb-8">
          <p className="text-sm text-zinc-600 max-w-lg mx-auto">
            Other personalised song services charge &pound;45-&pound;199+ and take days. SongSwipe delivers in minutes.
          </p>
        </div>

        {/* Trust signals */}
        <div className="max-w-2xl mx-auto bg-surface-50 border border-surface-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-zinc-400">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-semibold text-white">4.9/5</span>
            </div>

            {/* Secure payment */}
            <div className="flex items-center gap-1.5">
              <LockClosedIcon className="w-4 h-4 text-zinc-400" />
              <span>Secure payment via Stripe</span>
            </div>

            {/* Fast generation */}
            <div className="flex items-center gap-1.5">
              <span>Generated in minutes</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
