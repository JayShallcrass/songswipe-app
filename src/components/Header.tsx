'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  // Don't show header on dashboard, auth pages, customize, order, or checkout
  if (pathname?.startsWith('/dashboard') ||
      pathname?.startsWith('/auth') ||
      pathname?.startsWith('/customize') ||
      pathname?.startsWith('/order') ||
      pathname?.startsWith('/checkout')) {
    return null
  }

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SongSwipe
          </span>
        </Link>
        
        <nav className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/login"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
          >
            Create a Song
          </Link>
        </nav>
      </div>
    </header>
  )
}
