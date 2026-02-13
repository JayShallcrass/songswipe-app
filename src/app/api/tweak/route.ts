import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'
import { buildRichPrompt } from '@/lib/promptBuilder'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, specialMemories, thingsToAvoid, pronunciation } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Fetch order and verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, customization_id, status, tweak_count')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Order does not belong to current user' }, { status: 403 })
    }

    if (order.status !== 'completed') {
      return NextResponse.json({ error: 'Order must be completed before tweaking' }, { status: 400 })
    }

    // If free tweak already used, tell frontend to redirect to paid checkout
    if (order.tweak_count >= 1) {
      return NextResponse.json({ requiresPayment: true })
    }

    // Fetch the linked customization record
    const { data: customization, error: custError } = await supabase
      .from('customizations')
      .select('*')
      .eq('id', order.customization_id)
      .single()

    if (custError || !customization) {
      return NextResponse.json({ error: 'Customization not found' }, { status: 404 })
    }

    // Update customization text fields
    const updatedFields: Record<string, string | null> = {}
    if (specialMemories !== undefined) updatedFields.special_memories = specialMemories || null
    if (thingsToAvoid !== undefined) updatedFields.things_to_avoid = thingsToAvoid || null
    if (pronunciation !== undefined) updatedFields.pronunciation = pronunciation || null

    if (Object.keys(updatedFields).length > 0) {
      const { error: updateCustError } = await supabase
        .from('customizations')
        .update(updatedFields)
        .eq('id', customization.id)

      if (updateCustError) {
        console.error('Failed to update customization:', updateCustError)
        return NextResponse.json({ error: 'Failed to update customization' }, { status: 500 })
      }
    }

    // Rebuild prompt using existing locked fields + updated text fields
    const promptData = {
      occasion: customization.occasion,
      mood: customization.mood,
      genre: customization.genre,
      voice: (customization as any).voice,
      language: (customization as any).language,
      tempo: (customization as any).tempo,
      relationship: (customization as any).relationship,
      recipientName: customization.recipient_name,
      yourName: customization.your_name,
      songLength: customization.song_length,
      specialMemories: specialMemories !== undefined ? specialMemories : customization.special_memories,
      thingsToAvoid: thingsToAvoid !== undefined ? thingsToAvoid : customization.things_to_avoid,
      pronunciation: pronunciation !== undefined ? pronunciation : customization.pronunciation,
    }

    const newPrompt = buildRichPrompt(promptData)

    // Update prompt on customization
    await supabase
      .from('customizations')
      .update({ prompt: newPrompt })
      .eq('id', customization.id)

    // Increment tweak_count
    await supabase
      .from('orders')
      .update({ tweak_count: order.tweak_count + 1 })
      .eq('id', orderId)

    // Count existing variants to determine next variant_number
    const { count: existingCount } = await supabase
      .from('song_variants')
      .select('id', { count: 'exact', head: true })
      .eq('order_id', orderId)

    const nextVariantNumber = (existingCount || 0) + 1

    // Create 1 new variant
    const { error: variantError } = await supabase
      .from('song_variants')
      .insert({
        order_id: orderId,
        user_id: user.id,
        variant_number: nextVariantNumber,
        storage_path: `${orderId}/variant-${nextVariantNumber}.mp3`,
        generation_status: 'pending' as const,
      })

    if (variantError) {
      console.error('Failed to create tweak variant:', variantError)
      return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 })
    }

    // Set order status back to generating
    await supabase
      .from('orders')
      .update({ status: 'generating' })
      .eq('id', orderId)

    // Trigger generation (fire-and-forget)
    const generationSecret = process.env.GENERATION_SECRET
    if (generationSecret) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'
      fetch(`${appUrl}/api/generate/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, secret: generationSecret }),
      }).catch(err => console.error('Failed to trigger tweak generation:', err))
    }

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('Tweak API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
