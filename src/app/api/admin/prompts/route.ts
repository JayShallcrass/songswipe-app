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

  const { count } = await supabase
    .from('customizations')
    .select('id', { count: 'exact', head: true })

  const { data: customizations, error } = await supabase
    .from('customizations')
    .select(`
      id,
      user_id,
      recipient_name,
      your_name,
      occasion,
      mood,
      genre,
      pronunciation,
      prompt,
      created_at
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Admin prompts error:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }

  // Get user emails
  const userIds = Array.from(new Set((customizations || []).map((c) => c.user_id)))
  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .in('id', userIds)

  const userMap = new Map((users || []).map((u) => [u.id, u.email]))

  const enriched = (customizations || []).map((c) => ({
    ...c,
    userEmail: userMap.get(c.user_id) || 'Unknown',
  }))

  return NextResponse.json({
    prompts: enriched,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
