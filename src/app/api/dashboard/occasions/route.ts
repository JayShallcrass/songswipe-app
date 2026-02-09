import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
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

    // Query orders with occasion dates (no pagination - typically small dataset)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        occasion_date,
        created_at,
        customizations(
          recipient_name,
          occasion
        )
      `)
      .eq('user_id', user.id)
      .not('occasion_date', 'is', null)
      .order('occasion_date', { ascending: true })

    if (error) {
      console.error('Error fetching occasions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch occasions' },
        { status: 500 }
      )
    }

    // Flatten nested customizations
    const flattenedOccasions = (orders || []).map(order => {
      const customizationData = order.customizations
      const customization = Array.isArray(customizationData)
        ? customizationData[0]
        : customizationData

      return {
        id: order.id,
        occasionDate: order.occasion_date,
        createdAt: order.created_at,
        recipientName: customization?.recipient_name || 'Unknown',
        occasion: customization?.occasion || 'unknown',
      }
    })

    return NextResponse.json({
      occasions: flattenedOccasions,
    })
  } catch (error) {
    console.error('Error in dashboard occasions endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
