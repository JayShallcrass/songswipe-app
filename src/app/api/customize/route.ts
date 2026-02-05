import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createCheckoutSession } from '@/lib/stripe'
import { buildPrompt } from '@/lib/elevenlabs'

// Zod schema for validation
const customizationSchema = {
  safeParse: (body: unknown) => {
    const z = require('zod')
    const schema = z.object({
      recipientName: z.string().min(1).max(100),
      yourName: z.string().min(1).max(100),
      occasion: z.enum(['valentines', 'birthday', 'anniversary', 'wedding', 'graduation', 'just-because']),
      songLength: z.enum(['60', '90', '120']),
      mood: z.array(z.enum(['romantic', 'happy', 'funny', 'nostalgic', 'epic'])),
      genre: z.enum(['pop', 'acoustic', 'electronic', 'orchestral', 'jazz']),
      specialMemories: z.string().max(500).optional(),
      thingsToAvoid: z.string().max(300).optional(),
    })
    return schema.safeParse(body)
  }
}

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

    // Require authentication - no anonymous users
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to create a song' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Create prompt
    const prompt = `A ${customization.mood.join(', ')} ${customization.genre} song about ${customization.recipientName} for ${customization.occasion}. Written by ${customization.yourName}. Include: ${customization.specialMemories || 'personal touches'}. Avoid: ${customization.thingsToAvoid || 'nothing'}. Duration: ${customization.songLength} seconds.`

    // Save customization to database
    const { data: customizationRecord, error: dbError } = await supabase
      .from('customizations')
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
