import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminUser } from '@/lib/admin'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100)
  const offset = (page - 1) * limit

  const supabase = createServerSupabaseClient()

  // Get total count
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })

  // Get orders with customization join
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      customization_id,
      stripe_session_id,
      status,
      amount,
      order_type,
      created_at,
      updated_at,
      occasion_date,
      customizations (
        id,
        recipient_name,
        your_name,
        occasion,
        mood,
        genre,
        special_memories,
        things_to_avoid,
        pronunciation,
        prompt
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  // Get user emails for display
  const userIds = Array.from(new Set((orders || []).map((o) => o.user_id)))
  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .in('id', userIds)

  const userMap = new Map((users || []).map((u) => [u.id, u.email]))

  // Get variant statuses per order
  const orderIds = (orders || []).map((o) => o.id)
  const { data: variants } = await supabase
    .from('song_variants')
    .select('order_id, variant_number, generation_status')
    .in('order_id', orderIds)

  const variantMap = new Map<string, Array<{ variant_number: number; generation_status: string }>>()
  for (const v of variants || []) {
    if (!variantMap.has(v.order_id)) variantMap.set(v.order_id, [])
    variantMap.get(v.order_id)!.push(v)
  }

  const enrichedOrders = (orders || []).map((o) => ({
    ...o,
    userEmail: userMap.get(o.user_id) || 'Unknown',
    variants: variantMap.get(o.id) || [],
  }))

  return NextResponse.json({
    orders: enrichedOrders,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
