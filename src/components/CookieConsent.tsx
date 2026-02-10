'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'songswipe_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      setVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          We use essential cookies to keep you signed in and process payments.{' '}
          <Link href="/privacy#cookies" className="text-purple-400 hover:text-purple-300 underline">
            Privacy Policy
          </Link>
        </p>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
        >
          OK
        </button>
      </div>
    </div>
  )
}
