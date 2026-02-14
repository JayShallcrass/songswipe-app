import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    if (!UUID_REGEX.test(params.token)) {
      return NextResponse.json(
        { error: 'Invalid share token format' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Fetch variant + recipient name for filename
    const { data: variant, error: variantError } = await supabase
      .from('song_variants')
      .select(`
        storage_path,
        generation_status,
        orders(
          customizations(
            recipient_name
          )
        )
      `)
      .eq('share_token', params.token)
      .eq('selected', true)
      .eq('generation_status', 'complete')
      .single()

    if (variantError || !variant) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    // Extract recipient name for filename
    const order = Array.isArray(variant.orders) ? variant.orders[0] : variant.orders
    const customisationData = order?.customizations
    const customisation = Array.isArray(customisationData) ? customisationData[0] : customisationData
    const recipientName = customisation?.recipient_name || 'your-song'

    const sanitizedName = recipientName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const filename = `songswipe-${sanitizedName}.mp3`

    // Generate signed URL
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

    const audioResponse = await fetch(signedUrlData.signedUrl)

    if (!audioResponse.ok) {
      console.error('Failed to fetch audio:', audioResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to retrieve audio file' },
        { status: 500 }
      )
    }

    const audioBuffer = await audioResponse.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error downloading shared song:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
