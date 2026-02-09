import { createServerSupabaseClient } from '@/lib/supabase'
import { generateSong } from '@/lib/elevenlabs'

interface GenerateResult {
  status: 'generated' | 'all_complete' | 'all_failed' | 'no_pending'
  variantNumber?: number
  remaining: number
  error?: string
}

/**
 * Generates the next pending variant for an order.
 * Processes ONE variant per call to stay within Vercel's 60s timeout.
 * After processing, checks if all variants are done and updates order status.
 */
export async function generateNextVariant(orderId: string): Promise<GenerateResult> {
  const supabase = createServerSupabaseClient()

  // Find the next pending variant for this order
  const { data: variants, error: fetchError } = await supabase
    .from('song_variants')
    .select('*')
    .eq('order_id', orderId)
    .order('variant_number')

  if (fetchError || !variants || variants.length === 0) {
    return { status: 'no_pending', remaining: 0, error: 'No variants found for order' }
  }

  const pendingVariant = variants.find(v => v.generation_status === 'pending')
  if (!pendingVariant) {
    // No pending variants - check if order is already finalized
    const completedCount = variants.filter(v => v.generation_status === 'complete').length
    return {
      status: completedCount > 0 ? 'all_complete' : 'all_failed',
      remaining: 0,
    }
  }

  // Fetch the order to get userId and customizationId
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('user_id, customization_id, status')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { status: 'no_pending', remaining: 0, error: 'Order not found' }
  }

  // Update order status to generating if still paid
  if (order.status === 'paid') {
    await supabase.from('orders').update({ status: 'generating' }).eq('id', orderId)
  }

  // Fetch customization
  const { data: customization, error: custError } = await supabase
    .from('customizations')
    .select('*')
    .eq('id', order.customization_id)
    .single()

  if (custError || !customization) {
    return { status: 'no_pending', remaining: 0, error: 'Customization not found' }
  }

  // Mark variant as generating
  await supabase
    .from('song_variants')
    .update({ generation_status: 'generating' })
    .eq('id', pendingVariant.id)

  try {
    // Generate via ElevenLabs
    const audioBuffer = await generateSong({
      recipientName: customization.recipient_name,
      yourName: customization.your_name,
      occasion: customization.occasion,
      songLength: customization.song_length.toString(),
      mood: customization.mood,
      genre: customization.genre,
      specialMemories: customization.special_memories || undefined,
      thingsToAvoid: customization.things_to_avoid || undefined,
    })

    // Upload to Supabase Storage
    const storagePath = `${order.user_id}/${orderId}/variant-${pendingVariant.variant_number}.mp3`
    const { error: uploadError } = await supabase.storage
      .from('songs')
      .upload(storagePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Mark variant as complete
    await supabase
      .from('song_variants')
      .update({
        storage_path: storagePath,
        generation_status: 'complete',
        completed_at: new Date().toISOString(),
      })
      .eq('id', pendingVariant.id)

    console.log('Variant generated:', {
      orderId,
      variantNumber: pendingVariant.variant_number,
    })
  } catch (error: any) {
    console.error('Variant generation failed:', {
      orderId,
      variantNumber: pendingVariant.variant_number,
      error: error.message,
    })

    // Mark variant as failed
    await supabase
      .from('song_variants')
      .update({ generation_status: 'failed' })
      .eq('id', pendingVariant.id)

    // Log to failed_jobs table
    await supabase.from('failed_jobs').insert({
      job_type: 'song_generation',
      event_data: { orderId, variantNumber: pendingVariant.variant_number } as any,
      error_message: error.message,
      error_stack: error.stack || null,
      retry_count: 0,
    })
  }

  // Check remaining pending variants
  const remainingPending = variants.filter(
    v => v.generation_status === 'pending' && v.id !== pendingVariant.id
  ).length

  // If no more pending, finalize order status
  if (remainingPending === 0) {
    // Re-fetch to get updated statuses
    const { data: updatedVariants } = await supabase
      .from('song_variants')
      .select('generation_status')
      .eq('order_id', orderId)

    const completedCount = updatedVariants?.filter(v => v.generation_status === 'complete').length || 0

    if (completedCount > 0) {
      await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId)
      console.log('Order completed:', { orderId, completedVariants: completedCount })
    } else {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId)
      console.error('Order failed - no variants completed:', { orderId })
    }

    return {
      status: completedCount > 0 ? 'all_complete' : 'all_failed',
      variantNumber: pendingVariant.variant_number,
      remaining: 0,
    }
  }

  return {
    status: 'generated',
    variantNumber: pendingVariant.variant_number,
    remaining: remainingPending,
  }
}
