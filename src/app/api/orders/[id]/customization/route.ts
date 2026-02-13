import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Fetch order to get customization_id and verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('customization_id, user_id')
      .eq('id', params.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Order does not belong to current user' }, { status: 403 })
    }

    // Fetch customization text fields
    const { data: customization, error: custError } = await supabase
      .from('customizations')
      .select('special_memories, things_to_avoid, pronunciation')
      .eq('id', order.customization_id)
      .single()

    if (custError || !customization) {
      return NextResponse.json({ error: 'Customization not found' }, { status: 404 })
    }

    return NextResponse.json(customization)
  } catch (error) {
    console.error('Error fetching customization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
