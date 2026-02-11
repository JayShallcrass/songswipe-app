import { getAuthUser } from '@/lib/supabase'

/**
 * Check if an email is in the admin allowlist.
 * Set ADMIN_EMAILS env var as a comma-separated list.
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS || ''
  const allowlist = adminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allowlist.includes(email.toLowerCase())
}

/**
 * Get the current user and verify they are an admin.
 * Returns the user if admin, null otherwise.
 */
export async function getAdminUser() {
  const user = await getAuthUser()
  if (!user?.email) return null
  if (!isAdminEmail(user.email)) return null
  return user
}
