import Link from 'next/link'
import { MusicalNoteIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6"><MusicalNoteIcon className="w-20 h-20 text-brand-500" /></div>
        <h1 className="text-6xl font-heading font-bold mb-4 text-gradient">
          404
        </h1>
        <p className="text-xl text-white font-medium mb-2">This page doesn&apos;t exist (yet)</p>
        <p className="text-zinc-500 mb-8">Looks like this note is missing from the song.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-brand-500 to-amber-500 text-white rounded-full font-semibold hover:from-brand-600 hover:to-amber-600 transition-all shadow-md"
          >
            Go Home
          </Link>
          <Link
            href="/customise"
            className="inline-flex items-center justify-center px-6 py-3 border border-surface-300 text-zinc-300 rounded-full font-semibold hover:bg-surface-100 transition-all"
          >
            Create a Song
          </Link>
        </div>
      </div>
    </div>
  )
}
