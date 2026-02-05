import { createClient } from '@supabase/supabase-js'

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

// Export createClient for client-side use
export { createClient }
