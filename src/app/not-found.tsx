import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">🎵</div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-xl text-gray-700 font-medium mb-2">This page doesn&apos;t exist (yet)</p>
        <p className="text-gray-500 mb-8">Looks like this note is missing from the song.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
          >
            Go Home
          </Link>
          <Link
            href="/customise"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-purple-300 text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-all"
          >
            Create a Song
          </Link>
        </div>
      </div>
    </div>
  )
}
