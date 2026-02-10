import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

export async function GET(request: NextRequest) {
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

    // Flatten nested customisations
    const flattenedOrders = (orders || []).map(order => {
      const customisationData = order.customizations
      const customisation = Array.isArray(customisationData)
        ? customisationData[0]
        : customisationData

      return {
        id: order.id,
        status: order.status,
        amount: order.amount,
        orderType: order.order_type,
        createdAt: order.created_at,
        stripeSessionId: order.stripe_session_id,
        recipientName: customisation?.recipient_name || 'Unknown',
        occasion: customisation?.occasion || 'unknown',
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
