import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createCheckoutSession } from '@/lib/stripe'
import { buildPrompt } from '@/lib/elevenlabs'
import { customizationSchema } from '@/lib/elevenlabs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = customizationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      )
    }

    const customization = validationResult.data
    const supabase = createServerSupabaseClient()

    // Get current user (optional for MVP)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'anonymous'

    // Create prompt
    const prompt = buildPrompt(customization)

    // Save customization to database
    const { data: customizationRecord, error: dbError } = await (supabase
      .from('customizations') as any)
      .insert({
        user_id: userId,
        recipient_name: customization.recipientName,
        your_name: customization.yourName,
        occasion: customization.occasion,
        song_length: parseInt(customization.songLength),
        mood: customization.mood,
        genre: customization.genre,
        special_memories: customization.specialMemories || null,
        things_to_avoid: customization.thingsToAvoid || null,
        prompt,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save customization' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      customizationId: customizationRecord.id,
      userId,
      email: user?.email || '',
    })

    // Update customization with session ID
    await (supabase
      .from('customizations') as any)
      .update({ 
        // Add any additional fields if needed
      })
      .eq('id', customizationRecord.id)

    return NextResponse.json({
      customizationId: customizationRecord.id,
      checkoutUrl: session.url,
    })
  } catch (error) {
    console.error('Error in customize API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
