import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
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

    // Verify user owns this variant
    const { data: variant, error: variantError } = await supabase
      .from('song_variants')
      .select('id, order_id')
      .eq('id', params.variantId)
      .eq('order_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (variantError || !variant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      )
    }

    // Unselect all other variants for this order
    const { error: unselectError } = await supabase
      .from('song_variants')
      .update({ selected: false })
      .eq('order_id', params.id)
      .neq('id', params.variantId)

    if (unselectError) {
      console.error('Error unselecting variants:', unselectError)
      return NextResponse.json(
        { error: 'Failed to update selections' },
        { status: 500 }
      )
    }

    // Select the chosen variant
    const { error: selectError } = await supabase
      .from('song_variants')
      .update({ selected: true })
      .eq('id', params.variantId)

    if (selectError) {
      console.error('Error selecting variant:', selectError)
      return NextResponse.json(
        { error: 'Failed to select variant' },
        { status: 500 }
      )
    }

    // Fetch share data for the post-selection experience
    const { data: shareData } = await supabase
      .from('song_variants')
      .select(`
        share_token,
        orders(
          occasion_date,
          customizations(
            recipient_name,
            your_name,
            occasion
          )
        )
      `)
      .eq('id', params.variantId)
      .single()

    const order = Array.isArray(shareData?.orders) ? shareData.orders[0] : shareData?.orders
    const customisation = Array.isArray(order?.customizations) ? order.customizations[0] : order?.customizations

    return NextResponse.json({
      success: true,
      selected_variant_id: params.variantId,
      share_token: shareData?.share_token || null,
      recipient_name: customisation?.recipient_name || null,
      sender_name: customisation?.your_name || null,
      occasion: customisation?.occasion || null,
      occasion_date: order?.occasion_date || null,
    })
  } catch (error) {
    console.error('Error in variant selection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
