'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'
import { useDownloadSong } from '@/lib/hooks/useDownloadSong'
import { format } from 'date-fns'
import { MusicalNoteIcon } from '@heroicons/react/24/solid'

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
  onDelete?: () => void
}

export default function SongCard({ song, onDelete }: SongCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const downloadMutation = useDownloadSong()

  const CONFIRM_WORD = 'DELETE'

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

  const handleDelete = async () => {
    if (deleteInput !== CONFIRM_WORD) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/songs/${song.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete song')
      setShowDeleteConfirm(false)
      setDeleteInput('')
      onDelete?.()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete song. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-surface-50 rounded-xl border border-surface-200 p-4">
      <div className="flex items-start gap-4">
        {/* Gradient icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <MusicalNoteIcon className="w-6 h-6 text-white" />
        </div>

        {/* Song details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white">{song.recipientName}</h3>
          <div className="flex flex-wrap gap-2 mt-1 text-sm text-zinc-400">
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
                  className="px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded-full text-xs font-medium"
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
                <div className="h-16 bg-surface-200 animate-pulse rounded-xl"></div>
              ) : audioUrl ? (
                <>
                  <style jsx global>{`
                    .rhap_container {
                      background: linear-gradient(to right, #e74c3c, #8b5cf6);
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
                <div className="text-red-400 text-sm">Failed to load audio</div>
              )}

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloadMutation.isPending}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {downloadMutation.isPending ? 'Downloading...' : 'Download'}
              </button>
            </div>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-400 font-medium mb-2">
                This will permanently delete this song. Type <span className="font-bold">{CONFIRM_WORD}</span> to confirm.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder={`Type ${CONFIRM_WORD}`}
                  className="flex-1 px-3 py-2 bg-surface-100 border border-surface-300 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={handleDelete}
                  disabled={deleteInput !== CONFIRM_WORD || isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                  className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all text-sm"
          >
            {isExpanded ? 'Collapse' : 'Play'}
          </button>
          <Link
            href={`/song/${song.id}`}
            className="px-4 py-2 border border-surface-300 text-zinc-300 rounded-lg font-medium hover:bg-surface-100 hover:text-white transition-all text-sm text-center"
          >
            Share
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="px-4 py-2 border border-red-500/20 text-red-400 rounded-lg font-medium hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/10 transition-all text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
