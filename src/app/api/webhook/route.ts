import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyWebhookSignature, stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import { generateSong } from '@/lib/elevenlabs'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature)
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

        if (!customizationId || !userId) {
          console.error('Missing metadata in session:', session.id)
          break
        }

        // Create order record
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            customization_id: customizationId,
            stripe_session_id: session.id,
            status: 'paid',
            amount: session.amount_total || 799,
          })
          .select()
          .single()

        if (orderError) {
          console.error('Failed to create order:', orderError)
          break
        }

        // Update customization status
        await supabase
          .from('customizations')
          .update({})
          .eq('id', customizationId)

        // Start song generation (async)
        generateAndStoreSong(customizationId, order.id, userId)
        
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

// Async function to generate and store song
async function generateAndStoreSong(customizationId: string, orderId: string, userId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Update order status to generating
    await supabase
      .from('orders')
      .update({ status: 'generating' })
      .eq('id', orderId)

    // Get customization
    const { data: customization, error: customError } = await supabase
      .from('customizations')
      .select('*')
      .eq('id', customizationId)
      .single()

    if (customError || !customization) {
      throw new Error('Customization not found')
    }

    // Generate song
    const audioBuffer = await generateSong({
      recipientName: customization.recipient_name,
      yourName: customization.your_name,
      occasion: customization.occasion,
      songLength: customization.song_length.toString(),
      mood: customization.mood,
      genre: customization.genre,
      specialMemories: customization.special_memories,
      thingsToAvoid: customization.things_to_avoid,
    })

    // Upload audio to Supabase Storage
    const audioPath = `${userId}/${orderId}/song.mp3`
    const { error: uploadError } = await supabase
      .storage
      .from('songs')
      .upload(audioPath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      throw new Error('Failed to upload audio')
    }

    // Get signed URL for download (expires in 15 minutes)
    const { data: { signedUrl } } = await supabase
      .storage
      .from('songs')
      .createSignedUrl(audioPath, 900) // 15 minutes

    // Save song record
    await supabase
      .from('songs')
      .insert({
        order_id: orderId,
        user_id: userId,
        audio_url: signedUrl,
        duration_ms: customization.song_length * 1000,
        downloads: 0,
      })

    // Update order status to completed
    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId)

    console.log(`Song generated successfully for order ${orderId}`)
  } catch (error) {
    console.error('Song generation failed:', error)
    
    // Update order status to failed
    await supabase
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', orderId)
  }
}
