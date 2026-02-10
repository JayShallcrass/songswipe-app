import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import crypto from 'crypto'

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
      event = getStripe().webhooks.constructEvent(body, signature, endpointSecret)
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

        if (orderType === 'upsell') {
          // Upsell: add variant to the PARENT order (not the upsell order)
          // The upsell order exists purely for payment tracking
          if (!parentOrderId) {
            console.error('Upsell order missing parent_order_id:', order.id)
            break
          }

          // Count existing variants on parent order to get next number
          const { count: existingCount } = await supabase
            .from('song_variants')
            .select('id', { count: 'exact', head: true })
            .eq('order_id', parentOrderId)

          const nextVariantNumber = (existingCount || 0) + 1

          const { error: variantError } = await supabase
            .from('song_variants')
            .insert({
              order_id: parentOrderId,
              user_id: userId,
              variant_number: nextVariantNumber,
              storage_path: `${parentOrderId}/variant-${nextVariantNumber}.mp3`,
              generation_status: 'pending' as const,
            })

          if (variantError && variantError.code !== '23505') {
            console.error('Failed to create upsell variant:', variantError)
            break
          }

          // Set parent order back to generating so the status poll resumes
          await supabase
            .from('orders')
            .update({ status: 'generating' })
            .eq('id', parentOrderId)

          console.log('Upsell variant added to parent order:', {
            upsellOrderId: order.id,
            parentOrderId,
            variantNumber: nextVariantNumber,
          })

          // Trigger generation on the PARENT order
          const generationSecret = process.env.GENERATION_SECRET
          if (generationSecret) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'
            fetch(`${appUrl}/api/generate/start`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: parentOrderId, secret: generationSecret }),
            }).catch(err => {
              console.error('Failed to trigger upsell generation:', err)
            })
          }
          break
        }

        // Base order: create 3 variant records
        const variantRecords = Array.from({ length: 3 }, (_, i) => ({
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
          variantCount: 3,
        })

        // Trigger generation immediately (fire-and-forget)
        const generationSecret = process.env.GENERATION_SECRET
        if (generationSecret) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'
          fetch(`${appUrl}/api/generate/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id, secret: generationSecret }),
          }).catch(err => {
            console.error('Failed to trigger generation from webhook:', err)
          })
        }
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
