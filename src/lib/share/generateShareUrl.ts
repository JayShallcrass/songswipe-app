/**
 * Generate a full share URL from a share token
 */
export function generateShareUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io'
  return `${baseUrl}/share/${token}`
}
