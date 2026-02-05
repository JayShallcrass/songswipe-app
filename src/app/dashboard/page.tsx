'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

interface Order {
  id: string
  status: string
  created_at: string
  recipient_name: string
  occasion: string
  song_length: number
  audio_url?: string
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<unknown>(null)

  useEffect(() => {
    // Check auth and fetch orders
    const checkAuth = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SongSwipe
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{(user as { email?: string })?.email}</span>
                <button 
                  onClick={handleSignOut}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/" className="text-sm text-purple-600">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Songs</h1>
          <Link href="/" className="btn-primary">
            + Create New Song
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="card text-center py-16">
            <span className="text-6xl mb-4 block">🎵</span>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No songs yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first personalized song for someone special!
            </p>
            <Link href="/" className="btn-primary">
              Get Started
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Song for {order.recipient_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.occasion} • {order.song_length}s • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'generating'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                    {order.status === 'completed' && order.audio_url && (
                      <a
                        href={order.audio_url}
                        download={`songswipe-${order.recipient_name}.mp3`}
                        className="btn-primary py-2 px-4 text-sm"
                      >
                        ⬇ Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
