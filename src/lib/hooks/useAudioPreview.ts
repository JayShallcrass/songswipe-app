import { useState, useEffect, useRef } from 'react'

export function useAudioPreview(orderId: string, variantId: string | null) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Skip if no variantId
    if (!variantId) {
      setAudioUrl(null)
      return
    }

    let objectUrl: string | null = null

    const fetchAudio = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/orders/${orderId}/variants/${variantId}/preview`)

        if (!response.ok) {
          throw new Error(`Failed to fetch audio preview: ${response.statusText}`)
        }

        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        setAudioUrl(objectUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audio')
      } finally {
        setLoading(false)
      }
    }

    fetchAudio()

    // Cleanup: revoke object URL to prevent memory leaks
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [orderId, variantId])

  return {
    audioUrl,
    loading,
    error,
    audioRef,
  }
}
