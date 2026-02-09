import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Validate UUID format
    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json(
        { error: 'Invalid song ID format' },
        { status: 400 }
      )
    }

    // Query song_variants for selected variant owned by user
    const { data: variant, error: variantError } = await supabase
      .from('song_variants')
      .select('storage_path, generation_status')
      .eq('id', params.id)
      .eq('selected', true)
      .eq('user_id', user.id)
      .single()

    // Return 404 for non-existent or non-owned variants (prevents enumeration)
    if (variantError || !variant) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    // Check if variant is ready
    if (variant.generation_status !== 'complete') {
      return NextResponse.json(
        { error: 'Song not ready' },
        { status: 400 }
      )
    }

    // Generate signed URL with 2-hour expiry (7200 seconds)
    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from('songs')
      .createSignedUrl(variant.storage_path, 7200)

    if (urlError || !signedUrlData) {
      console.error('Failed to generate signed URL:', urlError)
      return NextResponse.json(
        { error: 'Failed to access audio file' },
        { status: 500 }
      )
    }

    // Fetch the audio from storage
    const audioResponse = await fetch(signedUrlData.signedUrl)

    if (!audioResponse.ok) {
      console.error('Failed to fetch audio:', audioResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to retrieve audio file' },
        { status: 500 }
      )
    }

    // Convert to ArrayBuffer
    const audioBuffer = await audioResponse.arrayBuffer()

    // Return audio with streaming headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, max-age=3600', // 1 hour browser cache
        'Accept-Ranges': 'bytes', // Hint for progressive loading
      },
    })
  } catch (error) {
    console.error('Error streaming song:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
