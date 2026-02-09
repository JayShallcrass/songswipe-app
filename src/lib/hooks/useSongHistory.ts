import { useQuery } from '@tanstack/react-query'

interface SongHistoryItem {
  id: string
  variantNumber: number
  createdAt: string
  storagePath: string | null
  recipientName: string
  occasion: string
  genre: string
  mood: string[]
}

interface SongHistoryResponse {
  songs: SongHistoryItem[]
  page: number
  pageSize: number
  total: number
  pageCount: number
}

export function useSongHistory(page: number = 1) {
  return useQuery<SongHistoryResponse>({
    queryKey: ['songs', 'history', page],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/songs?page=${page}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch song history: ${response.statusText}`)
      }
      return response.json()
    },
    staleTime: 60000, // 1 minute - data doesn't change frequently
    refetchOnWindowFocus: false,
  })
}
