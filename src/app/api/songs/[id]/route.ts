import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json(
        { error: 'Invalid song ID format' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Fetch the variant to verify ownership and get storage/order info
    const { data: variant, error: fetchError } = await supabase
      .from('song_variants')
      .select('id, user_id, order_id, storage_path')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !variant) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    // Delete song file from storage
    if (variant.storage_path) {
      await supabase.storage.from('songs').remove([variant.storage_path])
    }

    // Delete the variant
    const { error: deleteError } = await supabase
      .from('song_variants')
      .delete()
      .eq('id', variant.id)

    if (deleteError) {
      console.error('Failed to delete variant:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete song' },
        { status: 500 }
      )
    }

    // Check if the parent order has any remaining variants
    if (variant.order_id) {
      const { count } = await supabase
        .from('song_variants')
        .select('id', { count: 'exact', head: true })
        .eq('order_id', variant.order_id)

      if (count === 0) {
        // Get the customization_id before deleting the order
        const { data: order } = await supabase
          .from('orders')
          .select('customization_id')
          .eq('id', variant.order_id)
          .single()

        await supabase
          .from('orders')
          .delete()
          .eq('id', variant.order_id)

        // If no other orders use this customisation, delete it too
        if (order?.customization_id) {
          const { count: orderCount } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('customization_id', order.customization_id)

          if (orderCount === 0) {
            await supabase
              .from('customizations')
              .delete()
              .eq('id', order.customization_id)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Validate UUID format
    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json(
        { error: 'Invalid song ID format' },
        { status: 400 }
      )
    }

    // Query song_variants with join to orders and customizations
    const { data, error } = await supabase
      .from('song_variants')
      .select(`
        id,
        variant_number,
        duration_ms,
        selected,
        created_at,
        completed_at,
        share_token,
        orders(
          id,
          occasion_date,
          created_at,
          customization_id,
          customizations(
            recipient_name,
            occasion,
            your_name,
            genre,
            mood
          )
        )
      `)
      .eq('id', params.id)
      .eq('selected', true)
      .eq('user_id', user.id)
      .single()

    // Return 404 for non-existent or non-owned variants (prevents enumeration)
    if (error || !data) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    // Map nested response to flat camelCase structure
    const order = Array.isArray(data.orders) ? data.orders[0] : data.orders
    const customisationData = order?.customizations
    const customisation = Array.isArray(customisationData) ? customisationData[0] : customisationData

    if (!order || !customisation) {
      console.error('Missing order or customisation data for song variant:', params.id)
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    const response = {
      id: data.id,
      variantNumber: data.variant_number,
      durationMs: data.duration_ms,
      createdAt: data.created_at,
      shareToken: data.share_token,
      recipientName: customisation.recipient_name,
      occasion: customisation.occasion,
      senderName: customisation.your_name,
      genre: customisation.genre,
      mood: customisation.mood,
      occasionDate: order.occasion_date,
      orderCreatedAt: order.created_at,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error fetching song metadata:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
