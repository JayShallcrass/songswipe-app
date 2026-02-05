'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  // Don't show header on dashboard
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SongSwipe
          </span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link
            href="/customize"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Create a Song
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            My Songs
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  )
}
