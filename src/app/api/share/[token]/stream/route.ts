import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Validate UUID format
    if (!UUID_REGEX.test(params.token)) {
      return NextResponse.json(
        { error: 'Invalid share token format' },
        { status: 400 }
      )
    }

    // Use service role client for public access (no auth required)
    const supabase = createServerSupabaseClient()

    // Query song_variants by share_token
    const { data: variant, error: variantError } = await supabase
      .from('song_variants')
      .select('storage_path, generation_status')
      .eq('share_token', params.token)
      .eq('selected', true)
      .eq('generation_status', 'complete')
      .single()

    // Return 404 for non-existent variants (prevents enumeration)
    if (variantError || !variant) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
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

    // Return audio with streaming headers (public cache OK for share links)
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600', // 1 hour browser cache
        'Accept-Ranges': 'bytes', // Hint for progressive loading
      },
    })
  } catch (error) {
    console.error('Error streaming shared song:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
