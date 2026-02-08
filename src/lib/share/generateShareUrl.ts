/**
 * Generate a full share URL from a share token
 */
export function generateShareUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/share/${token}`
}
