import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get order with customization and song details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        songs (audio_url, duration_ms, downloads),
        customizations (recipient_name, your_name, occasion, genre, mood, song_length, special_memories)
      `)
      .eq('id', params.id)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      recipient_name: order.customizations?.recipient_name,
      your_name: order.customizations?.your_name,
      occasion: order.customizations?.occasion,
      genre: order.customizations?.genre,
      mood: order.customizations?.mood,
      song_length: order.customizations?.song_length,
      audio_url: order.songs?.audio_url,
      created_at: order.created_at,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
