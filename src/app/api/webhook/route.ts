import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover' as any, // Use 'as any' to bypass type check for beta versions
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const customizationId = session.metadata?.customizationId
        const userId = session.metadata?.userId
        const orderType = session.metadata?.orderType || 'base'

        if (!customizationId || !userId) {
          console.error('Missing metadata in session:', session.id)
          break
        }

        // Check for duplicate webhook
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_session_id', session.id)
          .maybeSingle()

        if (existingOrder) {
          console.log('Duplicate webhook, order already exists:', existingOrder.id)
          break
        }

        // Fetch occasion_date from customisation for retention tracking
        const { data: customisationData } = await supabase
          .from('customizations')
          .select('occasion_date')
          .eq('id', customizationId)
          .single()

        // Create order record
        const parentOrderId = session.metadata?.originalOrderId || null

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            customization_id: customizationId,
            stripe_session_id: session.id,
            status: 'paid',
            amount: session.amount_total || 799,
            order_type: orderType,
            parent_order_id: parentOrderId,
            occasion_date: customisationData?.occasion_date || null,
          })
          .select()
          .single()

        if (orderError) {
          console.error('Failed to create order:', orderError)
          break
        }

        // Create email preferences record for user (if not exists)
        const { error: prefError } = await supabase
          .from('email_preferences')
          .upsert(
            {
              user_id: userId,
              unsubscribe_token: crypto.randomUUID(),
              global_unsubscribe: false,
              occasion_unsubscribes: [],
            },
            { onConflict: 'user_id' }
          )

        if (prefError) {
          console.error('Failed to create email preferences:', prefError)
          // Non-blocking - continue with order processing
        } else {
          console.log('Email preferences created for user:', userId)
        }

        // Branch based on order type
        if (orderType === 'bundle') {
          // Bundle purchase: create credit record, no generation
          const bundleTier = session.metadata?.bundleTier
          const quantity = session.metadata?.quantity

          if (!bundleTier || !quantity) {
            console.error('Missing bundle metadata:', { bundleTier, quantity })
            break
          }

          const { error: bundleError } = await supabase
            .from('bundles')
            .insert({
              user_id: userId,
              order_id: order.id,
              bundle_tier: bundleTier,
              quantity_purchased: parseInt(quantity),
              quantity_remaining: parseInt(quantity),
            })

          if (bundleError) {
            console.error('Failed to create bundle:', bundleError)
            break
          }

          console.log('Bundle purchase completed:', { orderId: order.id, tier: bundleTier, quantity })
          break
        }

        // Base or upsell order: create variant records (generation triggered by client)
        const variantCount = orderType === 'upsell' ? 1 : 3

        const variantRecords = Array.from({ length: variantCount }, (_, i) => ({
          order_id: order.id,
          user_id: userId,
          variant_number: i + 1,
          storage_path: `${order.id}/variant-${i + 1}.mp3`,
          generation_status: 'pending' as const,
        }))

        const { error: variantError } = await supabase
          .from('song_variants')
          .insert(variantRecords)

        if (variantError && variantError.code !== '23505') {
          console.error('Failed to create variant records:', variantError)
        }

        console.log('Order created with pending variants:', {
          orderId: order.id,
          type: orderType,
          variantCount,
        })
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
