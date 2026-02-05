import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Return empty orders for anonymous users
      return NextResponse.json({ orders: [] })
    }

    // Get user's orders with customization and song details
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        customizations (recipient_name, your_name, occasion, genre, mood, song_length),
        songs (audio_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Format response
    const formattedOrders = (orders || []).map((order: Record<string, unknown>) => ({
      id: order.id,
      status: order.status,
      created_at: order.created_at,
      recipient_name: (order.customizations as Record<string, unknown>)?.recipient_name,
      occasion: (order.customizations as Record<string, unknown>)?.occasion,
      song_length: (order.customizations as Record<string, unknown>)?.song_length,
      audio_url: (order.songs as Record<string, unknown>)?.audio_url,
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
