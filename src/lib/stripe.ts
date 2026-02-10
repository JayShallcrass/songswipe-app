import Stripe from 'stripe'
import { BASE_PRICE } from './bundles/pricing'

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover' as any, // Use 'as any' to bypass type check for beta versions
  typescript: true,
})

// Create checkout session
export async function createCheckoutSession({
  customisationId,
  userId,
  email,
  amount = BASE_PRICE,
  orderType = 'base',
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  customisationId: string
  userId: string
  email: string
  amount?: number
  orderType?: 'base' | 'upsell' | 'bundle'
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string>
}) {
  // Dynamic product data based on order type
  let productName: string
  let productDescription: string

  switch (orderType) {
    case 'upsell':
      productName = 'Additional Song Variant'
      productDescription = '1 more variant for your order'
      break
    case 'bundle':
      const bundleTier = metadata.bundleTier || 'Bundle'
      const quantity = metadata.quantity || ''
      productName = `Song Bundle - ${bundleTier}`
      productDescription = `${quantity} song credits`
      break
    case 'base':
    default:
      productName = 'Personalised Song Package'
      productDescription = '3 AI-generated song variants'
      break
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    allow_promotion_codes: true,
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'}/pricing?canceled=true`,
    customer_email: email,
    metadata: {
      customizationId: customisationId,
      userId,
      orderType,
      ...metadata,
    },
    payment_intent_data: {
      metadata: {
        customizationId: customisationId,
        userId,
        orderType,
        ...metadata,
      },
    },
  })

  return session
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
