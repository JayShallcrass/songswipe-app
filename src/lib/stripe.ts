import Stripe from 'stripe'

// Server-side Stripe client (lazy-initialized to avoid build-time errors when env vars aren't set)
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover' as any, // Use 'as any' to bypass type check for beta versions
      typescript: true,
    })
  }
  return _stripe
}

// Create checkout session
export async function createCheckoutSession({
  customizationId,
  userId,
  email,
  amount = 799, // £7.99 in pence
  successUrl,
  cancelUrl,
}: {
  customizationId: string
  userId: string
  email: string
  amount?: number
  successUrl?: string
  cancelUrl?: string
}) {
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Personalized Song',
            description: 'Custom AI-generated song for your special someone',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/order/{ORDER_ID}?success=true`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/customize?canceled=true`,
    customer_email: email,
    metadata: {
      customizationId,
      userId,
    },
    payment_intent_data: {
      metadata: {
        customizationId,
        userId,
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
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
