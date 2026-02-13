'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useSongData } from '@/lib/hooks/useSongData'
import { SongPlayer } from '@/components/song/SongPlayer'
import { SongDetails } from '@/components/song/SongDetails'
import { generateShareUrl } from '@/lib/share/generateShareUrl'
import { CopyLinkButton } from '@/components/share/CopyLinkButton'

export default function SongPage() {
  const params = useParams()
  const id = params.id as string

  const { song, audioUrl, isLoading, error, isDownloading, downloadSong } = useSongData(id)

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg animate-pulse">Loading your song...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !song) {
    return (
      <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">Song not found</h1>
          <p className="text-zinc-400 mb-8">
            This song may not exist or you may not have access.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-brand-500 to-amber-500 text-white font-semibold rounded-full hover:from-brand-600 hover:to-amber-600 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-surface-DEFAULT">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Logo/Home Link */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold text-gradient hover:opacity-80 transition-all">
                SongSwipe
              </h1>
            </Link>
          </div>

          {/* Song Title */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">
              A Song for {song.recipientName}
            </h2>
          </div>

          {/* Audio Player */}
          <SongPlayer audioUrl={audioUrl} isLoading={isLoading} />

          {/* Download Button */}
          <button
            onClick={downloadSong}
            disabled={isDownloading}
            className="w-full py-4 px-6 bg-gradient-to-r from-brand-500 to-amber-500 text-white font-semibold rounded-full hover:from-brand-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {isDownloading ? 'Downloading...' : 'Download MP3'}
          </button>

          {/* Share Your Song Section */}
          {song.shareToken && (
            <div className="space-y-4">
              <div className="border-t border-surface-200"></div>
              <h3 className="text-xl font-semibold text-white text-center">Share Your Song</h3>
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/5 rounded-lg p-3 overflow-hidden">
                    <p className="text-white/70 text-sm truncate">
                      {generateShareUrl(song.shareToken)}
                    </p>
                  </div>
                  <CopyLinkButton url={generateShareUrl(song.shareToken)} />
                </div>
                <p className="text-sm text-zinc-400 text-center">
                  Send this link to {song.recipientName} for a special gift reveal experience
                </p>
              </div>
            </div>
          )}

          {/* Song Details */}
          <SongDetails
            recipientName={song.recipientName}
            occasion={song.occasion}
            senderName={song.senderName}
            genre={song.genre}
            mood={song.mood}
            createdAt={song.orderCreatedAt}
            occasionDate={song.occasionDate}
          />

          {/* Bottom spacing for mobile */}
          <div className="h-12"></div>
        </motion.div>
      </div>
    </div>
  )
}
