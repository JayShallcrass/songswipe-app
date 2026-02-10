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
      const customisationData = order?.customizations
      const customisation = Array.isArray(customisationData)
        ? customisationData[0]
        : customisationData

      return {
        id: song.id,
        variantNumber: song.variant_number,
        createdAt: song.created_at,
        storagePath: song.storage_path,
        recipientName: customisation?.recipient_name || 'Unknown',
        occasion: customisation?.occasion || 'unknown',
        genre: customisation?.genre || 'unknown',
        mood: customisation?.mood || [],
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
