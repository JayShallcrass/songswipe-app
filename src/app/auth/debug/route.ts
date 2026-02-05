import { NextResponse } from 'next/server'

export async function GET() {
  const origin = (process.env.NEXT_PUBLIC_APP_URL || 'https://songswipe.io').replace(/\n/g, '').trim()
  const url = `${origin}/auth/callback`
  
  return NextResponse.json({
    origin,
    constructedUrl: url,
    hasNewline: origin.includes('\n'),
    charCodes: origin.split('').map(c => c.charCodeAt(0)).slice(-5),
  })
}
