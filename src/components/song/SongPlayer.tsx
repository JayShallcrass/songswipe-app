'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SongPlayerProps {
  audioUrl: string | null
  isLoading: boolean
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function SongPlayer({ audioUrl, isLoading }: SongPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Time update listener
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      if (!isDragging) setCurrentTime(audio.currentTime)
    }
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [isDragging])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const seekTo = useCallback((clientX: number) => {
    const bar = progressRef.current
    const audio = audioRef.current
    if (!bar || !audio || !duration) return
    const rect = bar.getBoundingClientRect()
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newTime = fraction * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }, [duration])

  const handleProgressClick = (e: React.MouseEvent) => {
    seekTo(e.clientX)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    seekTo(e.clientX)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    seekTo(e.clientX)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  if (isLoading || !audioUrl) {
    return (
      <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5">
          {/* Skeleton play button */}
          <div className="w-16 h-16 rounded-full bg-surface-200 animate-pulse" />
          {/* Skeleton progress bar */}
          <div className="w-full space-y-2">
            <div className="h-1.5 bg-surface-200 rounded-full animate-pulse" />
            <div className="flex justify-between">
              <div className="w-8 h-3 bg-surface-200 rounded animate-pulse" />
              <div className="w-8 h-3 bg-surface-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 sm:p-8">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex flex-col items-center gap-5">
        {/* Play / Pause button */}
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 flex items-center justify-center transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 active:scale-95"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div className="w-full space-y-1.5">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full h-1.5 bg-surface-300 rounded-full cursor-pointer group touch-none"
          >
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-amber-500 rounded-full transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
            {/* Scrubber handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          </div>

          {/* Times */}
          <div className="flex justify-between text-xs text-zinc-500 font-medium tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
