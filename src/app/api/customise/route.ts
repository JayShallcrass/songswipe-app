import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'
import { createCheckoutSession } from '@/lib/stripe'
import { buildPrompt } from '@/lib/elevenlabs'

// Zod schema for validation
const customisationSchema = {
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
    const validationResult = customisationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      )
    }

    const customisation = validationResult.data

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
    const prompt = `A ${customisation.mood.join(', ')} ${customisation.genre} song about ${customisation.recipientName} for ${customisation.occasion}. Written by ${customisation.yourName}. Include: ${customisation.specialMemories || 'personal touches'}. Avoid: ${customisation.thingsToAvoid || 'nothing'}. Duration: ${customisation.songLength} seconds.`

    // Save customisation to database
    const { data: customisationRecord, error: dbError } = await supabase
      .from('customizations')
      .insert({
        user_id: userId,
        recipient_name: customisation.recipientName,
        your_name: customisation.yourName,
        occasion: customisation.occasion,
        song_length: parseInt(customisation.songLength),
        mood: customisation.mood,
        genre: customisation.genre,
        special_memories: customisation.specialMemories || null,
        things_to_avoid: customisation.thingsToAvoid || null,
        occasion_date: customisation.occasionDate || null,
        prompt,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', JSON.stringify({ code: dbError.code, message: dbError.message, details: dbError.details, hint: dbError.hint }))
      return NextResponse.json(
        { error: 'Failed to save customisation' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      customisationId: customisationRecord.id,
      userId,
      email: user?.email || '',
    })

    return NextResponse.json({
      customisationId: customisationRecord.id,
      checkoutUrl: session.url,
    })
  } catch (error) {
    console.error('Error in customise API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
