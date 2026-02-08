import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Validate UUID format
    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json(
        { error: 'Invalid song ID format' },
        { status: 400 }
      )
    }

    // Query song_variants with join to get recipient_name for filename
    const { data: variant, error: variantError } = await supabase
      .from('song_variants')
      .select(`
        storage_path,
        generation_status,
        order_id,
        orders(
          customizations(
            recipient_name
          )
        )
      `)
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

    // Extract recipient name for filename
    const order = Array.isArray(variant.orders) ? variant.orders[0] : variant.orders
    const customizationData = order?.customizations
    const customization = Array.isArray(customizationData) ? customizationData[0] : customizationData
    const recipientName = customization?.recipient_name || 'your-song'

    // Sanitize recipient name for filename (lowercase, replace non-alphanumeric with hyphens)
    const sanitizedName = recipientName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

    const filename = `songswipe-${sanitizedName}.mp3`

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

    // Return audio with download headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (error) {
    console.error('Error downloading song:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
