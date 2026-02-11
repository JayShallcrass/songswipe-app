import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-surface-50 border-t border-surface-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-2xl">🎵</span>
              <span className="text-xl font-heading font-bold text-white">
                SongSwipe
              </span>
            </Link>
            <p className="text-zinc-500 text-sm mt-2">
              AI-powered personalised songs for every occasion.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="/pricing" className="text-zinc-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/faq" className="text-zinc-400 hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="/blog" className="text-zinc-400 hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
              Terms
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>&copy; 2025-2026 SongSwipe. All rights reserved.</p>
          <p className="text-xs">
            Powered by{' '}
            <a
              href="https://elevenlabs.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ElevenLabs
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
