import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminUser } from '@/lib/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServerSupabaseClient()

  const { data: jobs, error } = await supabase
    .from('failed_jobs')
    .select('*')
    .is('resolved_at', null)
    .order('failed_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Admin failed jobs error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }

  return NextResponse.json({ jobs: jobs || [] })
}
