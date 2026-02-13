import { BundleTier } from './types'

// Base pricing (£7.99)
export const BASE_PRICE = 799 // pence

// Upsell pricing (£0.99 -- impulse buy for extra variant)
export const UPSELL_PRICE = 99 // pence

// Tweak pricing (£0.99 -- same impulse-buy price, charged after free tweak used)
export const TWEAK_PRICE = 99 // pence

// Bundle tiers
export const BUNDLE_TIERS: BundleTier[] = [
  {
    id: '3-pack',
    name: '3-Pack',
    quantity: 3,
    price: 1999, // £19.99
    perSongPrice: 666, // £6.66/song
    savings: 17, // 17% savings
  },
  {
    id: '5-pack',
    name: '5-Pack',
    quantity: 5,
    price: 2999, // £29.99
    perSongPrice: 600, // £6.00/song
    savings: 25, // 25% savings
    popular: true,
  },
  {
    id: '10-pack',
    name: '10-Pack',
    quantity: 10,
    price: 4999, // £49.99
    perSongPrice: 500, // £5.00/song
    savings: 37, // 37% savings
  },
]

// Validate upsell price
export function validateUpsellPrice(amount: number): boolean {
  return amount === UPSELL_PRICE
}

// Validate tweak price
export function validateTweakPrice(amount: number): boolean {
  return amount === TWEAK_PRICE
}

// Validate bundle price
export function validateBundlePrice(tierId: string, amount: number): boolean {
  const tier = getBundleTier(tierId)
  return tier ? tier.price === amount : false
}

// Get bundle tier by ID
export function getBundleTier(tierId: string): BundleTier | undefined {
  return BUNDLE_TIERS.find((tier) => tier.id === tierId)
}
