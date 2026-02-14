'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MusicalNoteIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Don't show header on dashboard, auth pages, customise, order, or checkout
  if (pathname?.startsWith('/dashboard') ||
      pathname?.startsWith('/auth') ||
      pathname?.startsWith('/customise') ||
      pathname?.startsWith('/order') ||
      pathname?.startsWith('/checkout') ||
      pathname?.startsWith('/share')) {
    return null
  }

  return (
    <header className="bg-surface-DEFAULT/80 backdrop-blur-xl sticky top-0 z-50 border-b border-surface-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <MusicalNoteIcon className="w-7 h-7 text-brand-500" />
          <span className="text-xl font-heading font-bold text-white">
            SongSwipe
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-3">
          <Link
            href="/pricing"
            className="px-4 py-2 text-zinc-400 hover:text-white font-medium transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 text-zinc-400 hover:text-white font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/login"
            className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-amber-500 text-white rounded-full font-medium hover:from-brand-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
          >
            Create a Song
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-surface-200 bg-surface-DEFAULT/95 backdrop-blur-xl">
          <nav className="flex flex-col px-4 py-3 space-y-1">
            <Link
              href="/pricing"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 text-zinc-400 hover:text-white hover:bg-surface-100 font-medium transition-colors rounded-xl"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 text-zinc-400 hover:text-white hover:bg-surface-100 font-medium transition-colors rounded-xl"
            >
              Sign In
            </Link>
            <Link
              href="/auth/login"
              onClick={() => setIsMenuOpen(false)}
              className="mx-4 mt-2 py-3 bg-gradient-to-r from-brand-500 to-amber-500 text-white rounded-full font-medium text-center hover:from-brand-600 hover:to-amber-600 transition-all shadow-md"
            >
              Create a Song
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
