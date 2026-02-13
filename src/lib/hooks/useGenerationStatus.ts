import { useQuery } from '@tanstack/react-query'

interface VariantStatus {
  id: string
  variant_number: number
  generation_status: 'pending' | 'generating' | 'complete' | 'failed'
  storage_path: string | null
  completed_at: string | null
}

interface GenerationStatusResponse {
  order_id: string
  order_status: 'paid' | 'generating' | 'completed' | 'failed'
  tweak_count: number
  variants: VariantStatus[]
}

export function useGenerationStatus(orderId: string) {
  const query = useQuery<GenerationStatusResponse>({
    queryKey: ['generation-status', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/status`)
      if (!response.ok) {
        throw new Error(`Failed to fetch generation status: ${response.statusText}`)
      }
      return response.json()
    },
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false

      // Poll every 3 seconds while generating or if any variants are still in progress
      const hasActiveVariants = data.variants.some(
        v => v.generation_status === 'pending' || v.generation_status === 'generating'
      )
      if (data.order_status === 'paid' || data.order_status === 'generating' || hasActiveVariants) {
        return 3000
      }

      // Stop polling when complete or failed
      return false
    },
    refetchOnWindowFocus: false,
    enabled: !!orderId,
  })

  // Derived convenience values
  const isGenerating = query.data?.order_status === 'generating' || query.data?.order_status === 'paid'
  const isComplete = query.data?.order_status === 'completed'
  const isFailed = query.data?.order_status === 'failed'
  const completedVariants = query.data?.variants.filter(v => v.generation_status === 'complete') || []
  const completedCount = completedVariants.length
  const totalVariants = query.data?.variants.length || 0

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isGenerating,
    isComplete,
    isFailed,
    completedVariants,
    completedCount,
    totalVariants,
  }
}
