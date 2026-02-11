import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminUser } from '@/lib/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServerSupabaseClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    totalRevenueRes,
    ordersTodayRes,
    ordersWeekRes,
    ordersMonthRes,
    songsGeneratedRes,
    songsFailedRes,
    activeUsersRes,
    unresolvedFailedRes,
  ] = await Promise.all([
    // Total revenue (sum of paid orders)
    supabase
      .from('orders')
      .select('amount')
      .in('status', ['paid', 'generating', 'completed']),

    // Orders today
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .in('status', ['paid', 'generating', 'completed']),

    // Orders this week
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekStart)
      .in('status', ['paid', 'generating', 'completed']),

    // Orders this month
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart)
      .in('status', ['paid', 'generating', 'completed']),

    // Songs generated (completed variants)
    supabase
      .from('song_variants')
      .select('id', { count: 'exact', head: true })
      .eq('generation_status', 'complete'),

    // Songs failed
    supabase
      .from('song_variants')
      .select('id', { count: 'exact', head: true })
      .eq('generation_status', 'failed'),

    // Active users (have at least one order)
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true }),

    // Unresolved failed jobs
    supabase
      .from('failed_jobs')
      .select('id', { count: 'exact', head: true })
      .is('resolved_at', null),
  ])

  const totalRevenue = (totalRevenueRes.data || []).reduce(
    (sum, o) => sum + (o.amount || 0),
    0
  )

  return NextResponse.json({
    totalRevenue: totalRevenue / 100, // cents to pounds/dollars
    ordersToday: ordersTodayRes.count || 0,
    ordersWeek: ordersWeekRes.count || 0,
    ordersMonth: ordersMonthRes.count || 0,
    songsGenerated: songsGeneratedRes.count || 0,
    songsFailed: songsFailedRes.count || 0,
    activeUsers: activeUsersRes.count || 0,
    unresolvedFailedJobs: unresolvedFailedRes.count || 0,
  })
}
