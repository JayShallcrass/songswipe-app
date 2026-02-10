import { useQuery } from '@tanstack/react-query'

interface SongBalance {
  songsRemaining: number
}

export function useSongBalance() {
  return useQuery<SongBalance>({
    queryKey: ['song-balance'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/balance')
      if (!response.ok) {
        throw new Error('Failed to fetch song balance')
      }
      return response.json()
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  })
}
