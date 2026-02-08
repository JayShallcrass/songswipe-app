'use client'

import { useAudioPreview } from '@/lib/hooks/useAudioPreview'

interface VariantCardProps {
  orderId: string
  variantId: string
  variantNumber: number
  isActive: boolean
  onSelect: () => void
}

export function VariantCard({ orderId, variantId, variantNumber, isActive, onSelect }: VariantCardProps) {
  const { audioUrl, loading, error, audioRef } = useAudioPreview(orderId, isActive ? variantId : null)

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center min-h-[500px]">
      {/* Variant number label */}
      <div className="mb-6 text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Variant {variantNumber}
        </h2>
        <p className="text-gray-600 text-sm mt-2">Swipe to compare, or tap Select</p>
      </div>

      {/* Audio player section */}
      <div className="w-full max-w-md mb-8">
        {loading && (
          <div className="flex items-center justify-center h-20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading audio...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {audioUrl && !loading && !error && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              controlsList="nodownload noplaybackrate"
              onContextMenu={(e) => e.preventDefault()}
              className="w-full"
              style={{
                borderRadius: '0.5rem',
              }}
            />
          </div>
        )}
      </div>

      {/* Select button */}
      <button
        onClick={onSelect}
        disabled={loading || !!error}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
      >
        Select This One
      </button>
    </div>
  )
}
