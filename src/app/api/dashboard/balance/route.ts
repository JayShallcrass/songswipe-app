import { NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { data: bundles } = await supabase
      .from('bundles')
      .select('quantity_remaining')
      .eq('user_id', user.id)
      .gt('quantity_remaining', 0)

    const remaining = (bundles || []).reduce((sum, b) => sum + b.quantity_remaining, 0)

    return NextResponse.json({ songsRemaining: remaining })
  } catch (error) {
    console.error('Error fetching balance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
