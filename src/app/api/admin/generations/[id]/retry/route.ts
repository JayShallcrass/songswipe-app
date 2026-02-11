import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminUser } from '@/lib/admin'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const variantId = params.id
  const supabase = createServerSupabaseClient()

  // Get the variant to find order_id
  const { data: variant, error: fetchError } = await supabase
    .from('song_variants')
    .select('id, order_id, generation_status')
    .eq('id', variantId)
    .single()

  if (fetchError || !variant) {
    return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
  }

  if (variant.generation_status !== 'failed') {
    return NextResponse.json(
      { error: `Cannot retry variant with status "${variant.generation_status}"` },
      { status: 400 }
    )
  }

  // Reset to pending
  const { error: updateError } = await supabase
    .from('song_variants')
    .update({ generation_status: 'pending', completed_at: null })
    .eq('id', variantId)

  if (updateError) {
    console.error('Failed to reset variant:', updateError)
    return NextResponse.json({ error: 'Failed to reset variant' }, { status: 500 })
  }

  // Trigger generation
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'
  const generationSecret = process.env.GENERATION_SECRET

  if (generationSecret) {
    fetch(`${appUrl}/api/generate/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: variant.order_id, secret: generationSecret }),
    }).catch((err) => console.error('Failed to trigger retry generation:', err))
  }

  return NextResponse.json({ success: true, variantId, orderId: variant.order_id })
}
