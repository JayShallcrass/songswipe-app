import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

export async function POST(
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

    const supabase = createServerSupabaseClient()

    // Verify user owns the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Reset failed variants back to pending
    const { data: resetVariants, error: updateError } = await supabase
      .from('song_variants')
      .update({ generation_status: 'pending', completed_at: null })
      .eq('order_id', params.id)
      .eq('generation_status', 'failed')
      .select('id')

    if (updateError) {
      console.error('Failed to reset variants:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset failed variants' },
        { status: 500 }
      )
    }

    const resetCount = resetVariants?.length ?? 0

    // If order was marked as failed, reset it to paid so generation can restart
    if (order.status === 'failed' && resetCount > 0) {
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', params.id)
    }

    return NextResponse.json({ resetCount })
  } catch (error) {
    console.error('Error in retry-failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
