import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
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

    // Verify user owns this variant and get storage path
    const { data: variant, error: variantError } = await supabase
      .from('song_variants')
      .select('storage_path, generation_status')
      .eq('id', params.variantId)
      .eq('order_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (variantError || !variant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      )
    }

    // Check if variant is ready
    if (variant.generation_status !== 'complete') {
      return NextResponse.json(
        { error: 'Variant not ready' },
        { status: 400 }
      )
    }

    // Generate signed URL with 10-minute expiry
    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from('songs')
      .createSignedUrl(variant.storage_path, 600)

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

    // Return audio with anti-download headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Error serving preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
