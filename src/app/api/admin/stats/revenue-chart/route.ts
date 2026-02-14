import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminUser } from '@/lib/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServerSupabaseClient()

  // Fetch last 30 days of paid orders
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('amount, created_at')
    .in('status', ['paid', 'generating', 'completed'])
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Revenue chart query error:', error)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }

  // Aggregate by day
  const dailyMap = new Map<string, number>()

  // Pre-fill all 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = date.toISOString().split('T')[0]
    dailyMap.set(key, 0)
  }

  // Sum revenue per day
  for (const order of orders || []) {
    const key = new Date(order.created_at).toISOString().split('T')[0]
    const current = dailyMap.get(key) || 0
    dailyMap.set(key, current + (order.amount || 0))
  }

  const days = Array.from(dailyMap.entries()).map(([date, amount]) => ({
    date,
    revenue: amount / 100, // pence to pounds
  }))

  // Period summaries
  const now = new Date()
  const todayKey = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const revenueToday = days.find((d) => d.date === todayKey)?.revenue || 0
  const revenueWeek = days
    .filter((d) => d.date >= weekAgo)
    .reduce((sum, d) => sum + d.revenue, 0)
  const revenueMonth = days.reduce((sum, d) => sum + d.revenue, 0)

  return NextResponse.json({
    days,
    revenueToday,
    revenueWeek,
    revenueMonth,
  })
}
