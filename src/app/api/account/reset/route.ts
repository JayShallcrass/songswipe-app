import { NextResponse } from 'next/server'
import { createServerSupabaseClient, getAuthUser } from '@/lib/supabase'

export async function DELETE() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Delete in dependency order: variants -> orders -> customisations
    // Also delete bundles, email prefs, and failed jobs

    await supabase
      .from('song_variants')
      .delete()
      .eq('user_id', user.id)

    await supabase
      .from('failed_jobs')
      .delete()
      .eq('job_type', 'song_generation')

    await supabase
      .from('bundles')
      .delete()
      .eq('user_id', user.id)

    await supabase
      .from('orders')
      .delete()
      .eq('user_id', user.id)

    await supabase
      .from('customizations')
      .delete()
      .eq('user_id', user.id)

    await supabase
      .from('email_preferences')
      .delete()
      .eq('user_id', user.id)

    // Delete song files from storage
    const { data: files } = await supabase.storage
      .from('songs')
      .list(user.id)

    if (files && files.length > 0) {
      const paths = files.map(f => `${user.id}/${f.name}`)
      await supabase.storage.from('songs').remove(paths)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset account' },
      { status: 500 }
    )
  }
}
