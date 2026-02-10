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

    // Total completed songs
    const { count: totalSongs } = await supabase
      .from('song_variants')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('selected', true)
      .eq('generation_status', 'complete')

    // Unique recipients (via orders -> customizations)
    const { data: recipientData } = await supabase
      .from('orders')
      .select('customizations(recipient_name)')
      .eq('user_id', user.id)
      .not('customization_id', 'is', null)

    const uniqueRecipients = new Set<string>()
    for (const order of recipientData || []) {
      const customisation = Array.isArray(order.customizations)
        ? order.customizations[0]
        : order.customizations
      const name = customisation?.recipient_name
      if (name) uniqueRecipients.add(name.toLowerCase().trim())
    }

    // Upcoming occasions
    const { count: upcomingOccasions } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('occasion_date', 'is', null)
      .gte('occasion_date', new Date().toISOString().split('T')[0])

    return NextResponse.json({
      totalSongs: totalSongs || 0,
      peopleSerenaded: uniqueRecipients.size,
      upcomingOccasions: upcomingOccasions || 0,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
