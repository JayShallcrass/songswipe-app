import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client-side Supabase client (anon key is safe to expose)
// Only initialize if we have valid environment variables
let supabaseClient: ReturnType<typeof createClient> | null = null

if (SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const supabase = supabaseClient!

// Server-side client with service role (for admin operations)
export const createServerSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Auth helpers - only use on client side where supabase is guaranteed to be initialized
export const getUser = async () => {
  if (!supabaseClient) return null
  const { data: { user } } = await supabaseClient.auth.getUser()
  return user
}

export const signUp = async (email: string, password: string) => {
  if (!supabaseClient) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  if (!supabaseClient) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabaseClient) return { error: new Error('Supabase not configured') }
  const { error } = await supabaseClient.auth.signOut()
  return { error }
}
