'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Promo config - update these to change/disable the banner
const PROMO_CODE = 'VALENTINE50'
const PROMO_DISCOUNT = '50%'
const PROMO_END = new Date('2026-02-16T23:59:59Z') // Sunday 16th Feb midnight UTC

function getTimeLeft(target: Date): { hours: number; minutes: number; seconds: number } | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(PROMO_END))
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeLeft(PROMO_END)
      setTimeLeft(remaining)
      if (!remaining) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Don't render if promo expired or dismissed
  if (!timeLeft || dismissed) return null

  return (
    <div className="bg-gradient-to-r from-brand-500 to-amber-500 text-white relative z-50">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm sm:text-base">
        <span className="font-medium text-center">
          Valentine&apos;s Day Sale: {PROMO_DISCOUNT} off with code{' '}
          <code className="bg-white/20 px-1.5 py-0.5 rounded font-bold text-sm">{PROMO_CODE}</code>
          {' '}&middot;{' '}
          <span className="tabular-nums font-semibold">
            {timeLeft.hours}h {timeLeft.minutes.toString().padStart(2, '0')}m {timeLeft.seconds.toString().padStart(2, '0')}s
          </span>
        </span>
        <Link
          href="/customise"
          className="hidden sm:inline-flex px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors whitespace-nowrap"
        >
          Create a Song
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
