import Link from 'next/link'

export const metadata = {
  title: 'SongSwipe - AI-Powered Personalized Songs',
  description: 'Create unique, personalized songs for your loved ones. AI-generated music for Valentine\'s, birthdays, anniversaries, and more.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🎵</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Songs Made Just for Them
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered personalized songs for Valentine's, birthdays, anniversaries, 
            and every special moment. A gift they'll never forget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customize"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Create a Song 🎶
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-purple-600 bg-white border-2 border-purple-200 rounded-full hover:border-purple-400 transition-all"
            >
              Sign In 🔐
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">Starting at £7.99 • 60-120 second songs</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Tell Us About Them</h3>
              <p className="text-gray-600">
                Share their name, the occasion, mood, and any special memories you want included.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="text-xl font-semibold mb-2">AI Generates Your Song</h3>
              <p className="text-gray-600">
                Our AI creates a unique, professional-quality song in minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Download & Share</h3>
              <p className="text-gray-600">
                Get your personalized MP3 and make their day unforgettable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why SongSwipe?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">100% Personalized</h3>
              <p className="text-gray-600">
                Every song is unique, written specifically for your recipient with their name, memories, and your message woven throughout.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Ready in Minutes</h3>
              <p className="text-gray-600">
                No waiting weeks for a human songwriter. Your AI-generated song is ready almost instantly.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">10x Cheaper</h3>
              <p className="text-gray-600">
                Professional human songs cost £100+. Our AI delivers comparable quality for just £7.99.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="text-lg font-semibold mb-2">Perfect Gift</h3>
              <p className="text-gray-600">
                Stand out from generic cards and flowers with a truly unique, personal gift they'll treasure forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-8">Simple, Transparent Pricing</h2>
          <div className="bg-white rounded-3xl p-8 max-w-md mx-auto">
            <div className="text-gray-600 mb-2">Single Song</div>
            <div className="text-5xl font-bold text-gray-900 mb-4">£7.99</div>
            <ul className="text-left text-gray-600 space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 60-120 second personalized song
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Professional AI-generated music
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> MP3 download included
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited replays
              </li>
            </ul>
            <Link
              href="/customize"
              className="block w-full py-4 text-center font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Create Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🎵</span>
            <span className="text-xl font-bold text-white">SongSwipe</span>
          </div>
          <p className="text-sm">© 2025 SongSwipe. AI-generated personalized songs.</p>
          <p className="text-xs mt-2">
            Powered by{' '}
            <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              ElevenLabs
            </a>{' '}
            AI Technology
          </p>
        </div>
      </footer>
    </div>
  )
}
