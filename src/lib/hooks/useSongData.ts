'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

interface SongData {
  id: string
  variantNumber: number
  durationMs: number | null
  createdAt: string
  shareToken: string
  recipientName: string
  occasion: string
  senderName: string
  genre: string
  mood: string[]
  occasionDate: string | null
  orderCreatedAt: string
}

export function useSongData(songId: string) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Fetch metadata
  const { data, isLoading: isQueryLoading, error } = useQuery<SongData>({
    queryKey: ['song', songId],
    queryFn: async () => {
      const response = await fetch(`/api/songs/${songId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch song data: ${response.statusText}`)
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - metadata doesn't change
    enabled: !!songId,
    refetchOnWindowFocus: false,
  })

  // Fetch audio blob and create object URL
  useEffect(() => {
    if (!data) {
      setAudioUrl(null)
      return
    }

    let objectUrl: string | null = null

    const fetchAudio = async () => {
      setAudioLoading(true)

      try {
        const response = await fetch(`/api/songs/${songId}/stream`)

        if (!response.ok) {
          throw new Error(`Failed to fetch audio stream: ${response.statusText}`)
        }

        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        setAudioUrl(objectUrl)
      } catch (err) {
        console.error('Failed to load audio stream:', err)
      } finally {
        setAudioLoading(false)
      }
    }

    fetchAudio()

    // Cleanup: revoke object URL to prevent memory leaks
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [data, songId])

  // Download function
  const downloadSong = async () => {
    try {
      setIsDownloading(true)

      const link = document.createElement('a')
      link.href = `/api/songs/${songId}/download`
      link.download = '' // Let server Content-Disposition control filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Brief delay before resetting state (can't track actual download completion)
      setTimeout(() => {
        setIsDownloading(false)
      }, 500)
    } catch (err) {
      console.error('Failed to download song:', err)
      setIsDownloading(false)
    }
  }

  return {
    song: data,
    audioUrl,
    isLoading: isQueryLoading || audioLoading,
    error,
    isDownloading,
    downloadSong,
  }
}
