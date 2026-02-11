'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface OrderDetails {
  id: string
  status: string
  recipient_name: string
  song_length: number
  audio_url?: string
  created_at: string
}

export default function OrderPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isSuccess = searchParams.get('success') === 'true'

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        if (!response.ok) throw new Error('Order not found')

        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError('Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Order not found'}</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const isGenerating = order.status === 'paid' || order.status === 'generating'
  const isReady = order.status === 'completed'

  return (
    <main className="min-h-screen bg-surface-DEFAULT py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Success Banner */}
        {isSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-8">
            <strong className="font-bold">Payment successful!</strong>
            <span className="block sm:inline"> Your song is being generated.</span>
          </div>
        )}

        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8">
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">
              {isReady ? '🎉' : isGenerating ? '🎵' : '⏳'}
            </span>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">
              {isReady
                ? 'Your Song is Ready!'
                : isGenerating
                  ? 'Generating Your Song...'
                  : 'Order Confirmed'
              }
            </h1>
            <p className="text-zinc-400">
              {order.recipient_name}'s personalised song
            </p>
          </div>

          {/* Status */}
          <div className="bg-surface-100 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Status</span>
              <span className={`font-medium ${
                isReady ? 'text-green-400' : 'text-brand-400'
              }`}>
                {isReady
                  ? 'Ready to Download'
                  : isGenerating
                    ? 'Generating...'
                    : order.status
                }
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-zinc-400">Song Length</span>
              <span className="font-medium text-white">{order.song_length} seconds</span>
            </div>
          </div>

          {/* Audio Player (if ready) */}
          {isReady && order.audio_url && (
            <div className="mb-6">
              <audio controls className="w-full" src={order.audio_url}>
                Your browser does not support the audio element.
              </audio>
              <a
                href={order.audio_url}
                download={`songswipe-${order.recipient_name}.mp3`}
                className="block w-full mt-4 py-3 text-center bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all"
              >
                Download MP3
              </a>
            </div>
          )}

          {/* Generating State */}
          {isGenerating && (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="text-4xl mb-4">🎵</div>
                <p className="text-zinc-400">
                  AI is composing your personalised song...
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  This usually takes about 60-90 seconds
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 text-brand-500 hover:text-brand-400 transition-colors"
              >
                Refresh to check status
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <Link href="/" className="flex-1 py-4 text-center text-zinc-400 hover:text-white transition-colors">
              Create Another Song
            </Link>
            <Link href="/dashboard" className="flex-1 py-4 text-center bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
