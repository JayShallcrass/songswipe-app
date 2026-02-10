import { useQuery } from '@tanstack/react-query'

interface DashboardStats {
  totalSongs: number
  peopleSerenaded: number
  upcomingOccasions: number
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      return response.json()
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  })
}
