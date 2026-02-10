import { NextRequest, NextResponse } from 'next/server'
import { generateNextVariant } from '@/lib/generate-songs'

export const maxDuration = 60

/**
 * Internal generation trigger - called by webhook after payment.
 * Processes one variant per call, then chains to itself for the next.
 * Secured by GENERATION_SECRET, not user auth.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, secret } = body

    // Validate internal secret
    const expectedSecret = process.env.GENERATION_SECRET
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const result = await generateNextVariant(orderId)

    // If there are more pending variants, chain the next generation call
    if (result.status === 'generated' && result.remaining > 0) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'
      fetch(`${appUrl}/api/generate/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, secret }),
      }).catch(err => {
        console.error('Failed to chain next variant generation:', err)
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Internal generation error:', error)
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    )
  }
}
