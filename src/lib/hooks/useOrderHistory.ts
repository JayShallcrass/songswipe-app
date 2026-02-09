import { useQuery } from '@tanstack/react-query'

interface OrderHistoryItem {
  id: string
  status: string
  amount: number
  orderType: string
  createdAt: string
  stripeSessionId: string
  recipientName: string
  occasion: string
}

interface OrderHistoryResponse {
  orders: OrderHistoryItem[]
  page: number
  pageSize: number
  total: number
  pageCount: number
}

export function useOrderHistory(page: number = 1) {
  return useQuery<OrderHistoryResponse>({
    queryKey: ['orders', 'history', page],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/orders?page=${page}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch order history: ${response.statusText}`)
      }
      return response.json()
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  })
}
