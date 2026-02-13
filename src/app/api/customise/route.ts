import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'
import { createCheckoutSession } from '@/lib/stripe'
import { getUserBundleBalance, redeemBundleCredit } from '@/lib/bundles/redemption'
import { buildRichPrompt } from '@/lib/promptBuilder'

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
      voice: z.string().optional(),
      language: z.string().optional(),
      tempo: z.string().optional(),
      relationship: z.string().optional(),
      pronunciation: z.string().max(100).optional(),
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

    // Create rich prompt from all selections
    const prompt = buildRichPrompt(customisation)

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
        pronunciation: customisation.pronunciation || null,
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

    // Check for available prepaid songs (bundle credits)
    const bundleBalance = await getUserBundleBalance(userId)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'

    if (bundleBalance.totalRemaining > 0) {
      const redemption = await redeemBundleCredit(userId)

      if (redemption.redeemed) {
        // Create order directly (skip Stripe)
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            customization_id: customisationRecord.id,
            status: 'paid',
            amount: 0,
            order_type: 'base',
            payment_method: 'bundle_credit',
            occasion_date: customisation.occasionDate || null,
          })
          .select()
          .single()

        if (orderError) {
          console.error('Failed to create order from prepaid song:', orderError)
          // Fall through to Stripe
        } else {
          // Create variant records
          const variantRecords = [1, 2, 3].map((n) => ({
            order_id: order.id,
            user_id: userId,
            variant_number: n,
            storage_path: `${order.id}/variant-${n}.mp3`,
            generation_status: 'pending' as const,
          }))

          await supabase.from('song_variants').insert(variantRecords)

          // Trigger generation
          const generationSecret = process.env.GENERATION_SECRET
          if (generationSecret) {
            fetch(`${appUrl}/api/generate/start`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: order.id, secret: generationSecret }),
            }).catch(err => console.error('Failed to trigger generation:', err))
          }

          return NextResponse.json({
            customisationId: customisationRecord.id,
            checkoutUrl: `${appUrl}/generate/${order.id}?prepaid=true&remaining=${redemption.remainingCredits ?? 0}`,
          })
        }
      }
    }

    // No prepaid songs or redemption failed - use Stripe checkout
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
