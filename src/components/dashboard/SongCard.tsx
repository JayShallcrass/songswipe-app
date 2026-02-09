'use client'

import { useState, useEffect } from 'react'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { useDownloadSong } from '@/lib/hooks/useDownloadSong'
import { format } from 'date-fns'

interface SongCardProps {
  song: {
    id: string
    recipientName: string
    occasion: string
    genre: string
    mood: string[]
    createdAt: string
    senderName?: string
  }
}

export default function SongCard({ song }: SongCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const downloadMutation = useDownloadSong()

  // Format occasion: remove hyphens, capitalize first letter of each word
  const formatOccasion = (occ: string) => {
    return occ
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Fetch audio when expanded
  useEffect(() => {
    if (isExpanded && !audioUrl) {
      setIsLoadingAudio(true)
      fetch(`/api/songs/${song.id}/stream`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to load audio')
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          setAudioUrl(url)
          setIsLoadingAudio(false)
        })
        .catch((err) => {
          console.error('Failed to load audio:', err)
          setIsLoadingAudio(false)
        })
    }
  }, [isExpanded, audioUrl, song.id])

  // Cleanup blob URL on collapse or unmount
  useEffect(() => {
    if (!isExpanded && audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [isExpanded, audioUrl])

  const handleDownload = () => {
    downloadMutation.mutate(song.id)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start gap-4">
        {/* Gradient icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl">🎵</span>
        </div>

        {/* Song details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">{song.recipientName}</h3>
          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
            <span>{formatOccasion(song.occasion)}</span>
            <span>•</span>
            <span>{song.genre}</span>
            <span>•</span>
            <span>{format(new Date(song.createdAt), 'MMM d, yyyy')}</span>
          </div>
          {song.mood && song.mood.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {song.mood.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          )}

          {/* Expanded audio player */}
          {isExpanded && (
            <div className="mt-4">
              {isLoadingAudio ? (
                <div className="h-16 bg-gray-200 animate-pulse rounded-xl"></div>
              ) : audioUrl ? (
                <>
                  <style jsx global>{`
                    .rhap_container {
                      background: linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153));
                      border-radius: 0.75rem;
                      padding: 1rem;
                      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                    }

                    .rhap_progress-filled,
                    .rhap_progress-indicator {
                      background: white;
                    }

                    .rhap_button-clear {
                      color: white;
                    }

                    .rhap_button-clear:hover {
                      color: rgba(255, 255, 255, 0.8);
                    }

                    .rhap_time {
                      color: rgba(255, 255, 255, 0.9);
                    }

                    .rhap_volume-indicator,
                    .rhap_volume-filled {
                      background: white;
                    }
                  `}</style>
                  <AudioPlayer
                    src={audioUrl}
                    showJumpControls={false}
                    customAdditionalControls={[]}
                    autoPlayAfterSrcChange={false}
                  />
                </>
              ) : (
                <div className="text-red-600 text-sm">Failed to load audio</div>
              )}

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloadMutation.isPending}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {downloadMutation.isPending ? 'Downloading...' : 'Download'}
              </button>
            </div>
          )}
        </div>

        {/* Play/Collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm text-sm flex-shrink-0"
        >
          {isExpanded ? 'Collapse' : 'Play'}
        </button>
      </div>
    </div>
  )
}
