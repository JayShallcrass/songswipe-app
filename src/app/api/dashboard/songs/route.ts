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

    // Query song_variants with pagination
    const { data: songs, count, error } = await supabase
      .from('song_variants')
      .select(`
        id,
        variant_number,
        created_at,
        storage_path,
        orders(
          id,
          customizations(
            recipient_name,
            occasion,
            genre,
            mood
          )
        )
      `, { count: 'estimated' })
      .eq('user_id', user.id)
      .eq('selected', true)
      .eq('generation_status', 'complete')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching song history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch songs' },
        { status: 500 }
      )
    }

    // Flatten nested Supabase response
    const flattenedSongs = (songs || []).map(song => {
      const order = Array.isArray(song.orders) ? song.orders[0] : song.orders
      const customizationData = order?.customizations
      const customization = Array.isArray(customizationData)
        ? customizationData[0]
        : customizationData

      return {
        id: song.id,
        variantNumber: song.variant_number,
        createdAt: song.created_at,
        storagePath: song.storage_path,
        recipientName: customization?.recipient_name || 'Unknown',
        occasion: customization?.occasion || 'unknown',
        genre: customization?.genre || 'unknown',
        mood: customization?.mood || [],
      }
    })

    return NextResponse.json({
      songs: flattenedSongs,
      page,
      pageSize,
      total: count || 0,
      pageCount: Math.ceil((count || 0) / pageSize),
    })
  } catch (error) {
    console.error('Error in dashboard songs endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
