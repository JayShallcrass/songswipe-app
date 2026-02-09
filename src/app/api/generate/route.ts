import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase'
import { generateNextVariant } from '@/lib/generate-songs'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      )
    }

    const result = await generateNextVariant(orderId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Generation endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
