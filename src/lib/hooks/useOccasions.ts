import { useQuery } from '@tanstack/react-query'
import { format, isAfter, isBefore, addDays } from 'date-fns'

interface OccasionData {
  id: string
  occasionDate: string
  createdAt: string
  recipientName: string
  occasion: string
}

interface OccasionWithCalculations extends OccasionData {
  formattedDate: string
  daysUntil: number
  isUpcoming: boolean
}

interface OccasionsResponse {
  occasions: OccasionData[]
}

export function useOccasions() {
  return useQuery<OccasionsResponse, Error, OccasionWithCalculations[]>({
    queryKey: ['occasions'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/occasions')
      if (!response.ok) {
        throw new Error(`Failed to fetch occasions: ${response.statusText}`)
      }
      return response.json()
    },
    select: (data) => {
      const now = new Date()
      const futureThreshold = addDays(now, 90) // Next 90 days

      return data.occasions
        .map(occasion => {
          const occDate = new Date(occasion.occasionDate)
          const daysUntil = Math.ceil(
            (occDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
          const isUpcoming = isAfter(occDate, now) && isBefore(occDate, futureThreshold)

          return {
            ...occasion,
            formattedDate: format(occDate, 'MMM d, yyyy'),
            daysUntil,
            isUpcoming,
          }
        })
        .filter(occasion => occasion.isUpcoming)
        .sort((a, b) => a.daysUntil - b.daysUntil)
    },
    staleTime: 300000, // 5 minutes - occasion dates rarely change
    refetchOnWindowFocus: false,
  })
}
