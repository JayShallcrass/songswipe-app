import { useMutation } from '@tanstack/react-query'

export function useDownloadSong() {
  return useMutation({
    mutationFn: async (songId: string) => {
      const response = await fetch(`/api/songs/${songId}/download`)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      const blob = await response.blob()

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition')
      let filename = 'songswipe-song.mp3' // fallback

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/i)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/"/g, '')
        }
      }

      return { blob, filename }
    },
    onSuccess: ({ blob, filename }) => {
      // Create blob URL and trigger download
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)

      // Clean up blob URL immediately after download
      URL.revokeObjectURL(url)
    },
  })
}
