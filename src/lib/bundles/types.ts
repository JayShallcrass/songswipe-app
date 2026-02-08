// Bundle tier configuration
export interface BundleTier {
  id: string
  name: string
  quantity: number
  price: number // in pence
  perSongPrice: number // in pence
  savings: number // percentage
  popular?: boolean
}

// Database bundle record
export interface BundleRecord {
  id: string
  user_id: string
  order_id: string
  bundle_tier: string
  quantity_purchased: number
  quantity_remaining: number
  purchased_at: string
  expires_at: string | null
}

// Bundle balance summary
export interface BundleBalance {
  totalRemaining: number
  bundles: Array<{
    id: string
    tier: string
    remaining: number
    purchased: number
    purchasedAt: string
  }>
}
