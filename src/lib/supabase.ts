import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL
const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const getServiceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY

// Client-side Supabase client (anon key is safe to expose)
// Only initialized when actually used
let supabaseClient: ReturnType<typeof createClient> | null = null

const getSupabaseClient = () => {
  if (!supabaseClient) {
    const url = getSupabaseUrl()
    const key = getSupabaseAnonKey()
    if (url && key && url.startsWith('http')) {
      supabaseClient = createClient(url, key)
    }
  }
  return supabaseClient
}

export const supabase = {
  get get() {
    return getSupabaseClient()
  }
}

// Server-side client with service role (for admin operations)
export const createServerSupabaseClient = () => {
  const url = getSupabaseUrl()
  const key = getServiceRoleKey()
  
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Get authenticated user from session cookies (for API routes)
// Also ensures the user exists in public.users (trigger can fail due to RLS)
export async function getAuthUser() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) return null

  const cookieStore = cookies()
  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Ensure public.users row exists (auth trigger can silently fail)
    const serviceClient = createServerSupabaseClient()
    await serviceClient
      .from('users')
      .upsert({ id: user.id, email: user.email ?? '' }, { onConflict: 'id' })
  }

  return user
}

// Export createClient for client-side use
export { createClient }
