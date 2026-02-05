'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Animated Sound Wave Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg className="absolute w-full h-full opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4"/>
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4"/>
            </linearGradient>
          </defs>
          {/* Wave 1 */}
          <path 
            fill="url(#wave-gradient)" 
            fillOpacity="0.4"
            d="M0,160 C320,120 480,200 720,160 C960,120 1120,200 1440,160 L1440,320 L0,320 Z"
            className="animate-wave-1"
          />
        </svg>
        <svg className="absolute w-full h-full opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ marginTop: '-80px' }}>
          <path 
            fill="url(#wave-gradient)" 
            fillOpacity="0.3"
            d="M0,200 C240,160 400,240 720,200 C1040,160 1200,240 1440,200 L1440,320 L0,320 Z"
            className="animate-wave-2"
          />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-bounce-slow">🎵</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent leading-tight">
            Songs Made Just for Them
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered personalised songs for Valentine&apos;s, birthdays, anniversaries, 
            and every special moment. A gift they&apos;ll never forget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Create a Song 🎶
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">Starting at £7.99 • 60-120 second songs • Instant download</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">1️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Tell Us About Them</h3>
              <p className="text-gray-600">
                Share their name, the occasion, mood, and any special memories you want included.
              </p>
            </div>
            <div className="text-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">2️⃣</div>
              <h3 className="text-xl font-semibold mb-2">AI Generates Your Song</h3>
              <p className="text-gray-600">
                Our AI creates a unique, professional-quality song in just a few minutes.
              </p>
            </div>
            <div className="text-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">3️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Download & Share</h3>
              <p className="text-gray-600">
                Get your personalised MP3 and make their day unforgettable.
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
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">100% Personalised</h3>
              <p className="text-gray-600">
                Every song is unique, written specifically for your recipient with their name, memories, and your message woven throughout.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Ready in Minutes</h3>
              <p className="text-gray-600">
                No waiting weeks for a human songwriter. Your AI-generated song is ready almost instantly.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">💷</div>
              <h3 className="text-lg font-semibold mb-2">10x Cheaper</h3>
              <p className="text-gray-600">
                Professional human songs cost £100+. Our AI delivers comparable quality for just £7.99.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="text-lg font-semibold mb-2">Perfect Gift</h3>
              <p className="text-gray-600">
                Stand out from generic cards and flowers with a truly unique, personal gift they&apos;ll treasure forever.
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
                <span className="text-green-500">✓</span> 60-120 second personalised song
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
              href="/auth/login"
              className="block w-full py-4 text-center font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all hover:scale-[1.02]"
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
          <p className="text-sm">© 2025 SongSwipe. AI-generated personalised songs.</p>
          <p className="text-xs mt-2">
            Powered by{' '}
            <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              ElevenLabs
            </a>{' '}
            AI Technology
          </p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave-1 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(-10px); }
        }
        @keyframes wave-2 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(25px) translateY(10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-wave-1 {
          animation: wave-1 8s ease-in-out infinite;
        }
        .animate-wave-2 {
          animation: wave-2 10s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}} />
    </div>
  )
}
