'use client'

import { useState, useRef, useEffect } from 'react'

interface PreviewTrack {
  id: string
  title: string
  occasion: string
  genre: string
  src: string
}

const previewTracks: PreviewTrack[] = [
  {
    id: 'birthday',
    title: 'Happy Birthday Sarah',
    occasion: 'Birthday',
    genre: 'Pop',
    src: '/samples/birthday-preview.mp3',
  },
  {
    id: 'valentines',
    title: 'My Valentine',
    occasion: "Valentine's",
    genre: 'Acoustic',
    src: '/samples/valentines-preview.mp3',
  },
  {
    id: 'anniversary',
    title: 'Our Story',
    occasion: 'Anniversary',
    genre: 'Soul',
    src: '/samples/anniversary-preview.mp3',
  },
  {
    id: 'celebration',
    title: 'Celebrate You',
    occasion: 'Celebration',
    genre: 'Upbeat',
    src: '/samples/celebration-preview.mp3',
  },
]

function EqualiserBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-[3px] bg-brand-500 rounded-full transition-all ${
            isPlaying ? 'animate-equaliser' : 'h-1'
          }`}
          style={{
            animationDelay: isPlaying ? `${i * 0.15}s` : undefined,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes equaliser {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-equaliser {
          animation: equaliser 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default function AudioPreview() {
  const [activeTrack, setActiveTrack] = useState<string | null>(null)
  const [hasAudioFiles, setHasAudioFiles] = useState(true)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  // Check if audio files exist (gracefully degrade if not)
  useEffect(() => {
    fetch(previewTracks[0].src, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) setHasAudioFiles(false)
      })
      .catch(() => setHasAudioFiles(false))
  }, [])

  const handleToggle = (trackId: string) => {
    // Pause all other tracks
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (id !== trackId) {
        audio.pause()
        audio.currentTime = 0
      }
    })

    const audio = audioRefs.current[trackId]
    if (!audio) return

    if (activeTrack === trackId) {
      audio.pause()
      setActiveTrack(null)
    } else {
      audio.play().catch(() => {
        // Autoplay blocked or file missing
      })
      setActiveTrack(trackId)
    }
  }

  const handleEnded = (trackId: string) => {
    if (activeTrack === trackId) {
      setActiveTrack(null)
    }
  }

  if (!hasAudioFiles) {
    return null
  }

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {previewTracks.map((track) => {
          const isPlaying = activeTrack === track.id
          return (
            <button
              key={track.id}
              onClick={() => handleToggle(track.id)}
              className={`flex-shrink-0 snap-start w-56 p-5 rounded-2xl border transition-all duration-300 text-left group ${
                isPlaying
                  ? 'bg-brand-500/10 border-brand-500/40'
                  : 'bg-surface-50 border-surface-200 hover:border-surface-300 hover:bg-surface-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">
                  {track.occasion}
                </span>
                <EqualiserBars isPlaying={isPlaying} />
              </div>
              <p className="text-white font-medium text-sm mb-1">{track.title}</p>
              <p className="text-zinc-500 text-xs">{track.genre}</p>

              <div className="mt-4 flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isPlaying
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-200 text-zinc-400 group-hover:bg-surface-300'
                  }`}
                >
                  {isPlaying ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-zinc-500">
                  {isPlaying ? 'Playing' : 'Preview'}
                </span>
              </div>

              <audio
                ref={(el) => {
                  if (el) audioRefs.current[track.id] = el
                }}
                src={track.src}
                preload="none"
                onEnded={() => handleEnded(track.id)}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
