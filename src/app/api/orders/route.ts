import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ orders: [] })
    }

    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ orders: [] })
    }

    const supabase = createServerSupabaseClient()

    // Check for session_id query param for order lookup after checkout
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (sessionId) {
      // Look up order by stripe_session_id
      const { data: order, error } = await supabase
        .from('orders')
        .select('id, status, created_at, customization_id')
        .eq('user_id', user.id)
        .eq('stripe_session_id', sessionId)
        .single()

      if (error) {
        // Order not found yet (webhook hasn't fired)
        return NextResponse.json({ order: null }, { status: 404 })
      }

      return NextResponse.json({ order })
    }

    // Default: fetch all user orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, status, created_at, customization_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
