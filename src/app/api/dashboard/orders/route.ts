import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
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

    // Parse pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Query orders with pagination
    const { data: orders, count, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        amount,
        order_type,
        created_at,
        stripe_session_id,
        customizations(
          recipient_name,
          occasion
        )
      `, { count: 'estimated' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching order history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Flatten nested customizations
    const flattenedOrders = (orders || []).map(order => {
      const customizationData = order.customizations
      const customization = Array.isArray(customizationData)
        ? customizationData[0]
        : customizationData

      return {
        id: order.id,
        status: order.status,
        amount: order.amount,
        orderType: order.order_type,
        createdAt: order.created_at,
        stripeSessionId: order.stripe_session_id,
        recipientName: customization?.recipient_name || 'Unknown',
        occasion: customization?.occasion || 'unknown',
      }
    })

    return NextResponse.json({
      orders: flattenedOrders,
      page,
      pageSize,
      total: count || 0,
      pageCount: Math.ceil((count || 0) / pageSize),
    })
  } catch (error) {
    console.error('Error in dashboard orders endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
