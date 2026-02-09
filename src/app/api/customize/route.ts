import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'
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
      occasionDate: z.string().optional(),
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

    // Require authentication - read user from session cookies
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to create a song' },
        { status: 401 }
      )
    }

    const userId = user.id
    const supabase = createServerSupabaseClient()

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
        occasion_date: customization.occasionDate || null,
        prompt,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', JSON.stringify({ code: dbError.code, message: dbError.message, details: dbError.details, hint: dbError.hint }))
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
