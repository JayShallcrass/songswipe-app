'use client'

import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'

interface SongPlayerProps {
  audioUrl: string | null
  isLoading: boolean
}

export function SongPlayer({ audioUrl, isLoading }: SongPlayerProps) {
  if (isLoading || !audioUrl) {
    return (
      <div className="flex items-center justify-center w-full h-32 bg-white/5 backdrop-blur rounded-2xl animate-pulse">
        <div className="text-white/40">Loading audio player...</div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        .rhap_container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: none;
        }

        .rhap_progress-filled,
        .rhap_progress-indicator {
          background: linear-gradient(to right, #8B5CF6, #EC4899);
        }

        .rhap_button-clear {
          color: white;
        }

        .rhap_button-clear:hover {
          color: #EC4899;
        }

        .rhap_time {
          color: rgba(255, 255, 255, 0.7);
        }

        .rhap_volume-indicator {
          background: linear-gradient(to right, #8B5CF6, #EC4899);
        }

        .rhap_volume-filled {
          background: linear-gradient(to right, #8B5CF6, #EC4899);
        }

        .rhap_progress-container {
          margin: 0 0 1rem 0;
        }
      `}</style>
      <AudioPlayer
        src={audioUrl}
        showJumpControls={false}
        customAdditionalControls={[]}
        layout="stacked-reverse"
      />
    </>
  )
}
