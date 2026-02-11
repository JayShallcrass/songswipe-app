import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminUser } from '@/lib/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { action, notes } = body as { action: 'resolve' | 'retry'; notes?: string }

  const supabase = createServerSupabaseClient()

  if (action === 'resolve') {
    const { error } = await supabase
      .from('failed_jobs')
      .update({
        resolved_at: new Date().toISOString(),
        notes: notes || 'Resolved by admin',
      })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to resolve job' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  if (action === 'retry') {
    // Get the job to access event_data
    const { data: job, error: fetchError } = await supabase
      .from('failed_jobs')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Mark as resolved (retried)
    await supabase
      .from('failed_jobs')
      .update({
        resolved_at: new Date().toISOString(),
        notes: notes || 'Retried by admin',
      })
      .eq('id', params.id)

    // If the job has an orderId in event_data, trigger generation
    const eventData = job.event_data as Record<string, unknown>
    const orderId = eventData?.orderId as string

    if (orderId) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'
      const generationSecret = process.env.GENERATION_SECRET

      if (generationSecret) {
        fetch(`${appUrl}/api/generate/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, secret: generationSecret }),
        }).catch((err) => console.error('Failed to trigger retry:', err))
      }
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
