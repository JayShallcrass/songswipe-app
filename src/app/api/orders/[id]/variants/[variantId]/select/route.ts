import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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

    return NextResponse.json({
      success: true,
      selected_variant_id: params.variantId,
    })
  } catch (error) {
    console.error('Error in variant selection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
