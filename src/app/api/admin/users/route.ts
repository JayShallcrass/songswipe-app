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

  // Get total users
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })

  // Get users
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  // Get order counts per user
  const userIds = (users || []).map((u) => u.id)

  const [ordersRes, songsRes, bundlesRes] = await Promise.all([
    supabase
      .from('orders')
      .select('user_id')
      .in('user_id', userIds)
      .in('status', ['paid', 'generating', 'completed']),

    supabase
      .from('song_variants')
      .select('user_id')
      .in('user_id', userIds)
      .eq('generation_status', 'complete'),

    supabase
      .from('bundles')
      .select('user_id, quantity_remaining')
      .in('user_id', userIds)
      .gt('quantity_remaining', 0),
  ])

  // Count per user
  const orderCounts = new Map<string, number>()
  for (const o of ordersRes.data || []) {
    orderCounts.set(o.user_id, (orderCounts.get(o.user_id) || 0) + 1)
  }

  const songCounts = new Map<string, number>()
  for (const s of songsRes.data || []) {
    songCounts.set(s.user_id, (songCounts.get(s.user_id) || 0) + 1)
  }

  const bundleBalances = new Map<string, number>()
  for (const b of bundlesRes.data || []) {
    bundleBalances.set(b.user_id, (bundleBalances.get(b.user_id) || 0) + b.quantity_remaining)
  }

  const enrichedUsers = (users || []).map((u) => ({
    ...u,
    totalOrders: orderCounts.get(u.id) || 0,
    totalSongs: songCounts.get(u.id) || 0,
    bundleBalance: bundleBalances.get(u.id) || 0,
  }))

  return NextResponse.json({
    users: enrichedUsers,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
