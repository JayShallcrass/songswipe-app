import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminUser } from '@/lib/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServerSupabaseClient()
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [pendingRes, generatingRes, failedRecentRes] = await Promise.all([
    // Queue depth (pending variants)
    supabase
      .from('song_variants')
      .select('id, order_id, variant_number, created_at', { count: 'exact' })
      .eq('generation_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50),

    // Currently generating
    supabase
      .from('song_variants')
      .select('id, order_id, variant_number, created_at')
      .eq('generation_status', 'generating')
      .order('created_at', { ascending: true }),

    // Recently failed (last 24h)
    supabase
      .from('song_variants')
      .select('id, order_id, variant_number, created_at, completed_at')
      .eq('generation_status', 'failed')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return NextResponse.json({
    pendingCount: pendingRes.count || 0,
    pending: pendingRes.data || [],
    generating: generatingRes.data || [],
    recentlyFailed: failedRecentRes.data || [],
  })
}
