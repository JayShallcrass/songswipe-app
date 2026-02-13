import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user from session cookies
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Query order with variants, ensuring user owns it
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        tweak_count,
        song_variants (
          id,
          variant_number,
          generation_status,
          storage_path,
          completed_at
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Return status with variants
    return NextResponse.json({
      order_id: order.id,
      order_status: order.status,
      tweak_count: order.tweak_count,
      variants: order.song_variants || [],
    })
  } catch (error) {
    console.error('Error fetching order status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
