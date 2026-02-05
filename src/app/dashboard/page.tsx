import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      amount,
      created_at,
      customization:customizations(
        recipient_name,
        occasion,
        song_length
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch user's songs
  const { data: songs } = await supabase
    .from('songs')
    .select(`
      id,
      audio_url,
      duration_ms,
      downloads,
      created_at,
      order:orders(
        id,
        customization:customizations(
          recipient_name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-gray-900">
              {orders?.length || 0}
            </div>
            <div className="text-gray-500 text-sm">Total Orders</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-gray-900">
              {songs?.length || 0}
            </div>
            <div className="text-gray-500 text-sm">Songs Purchased</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-gray-900">
              £{((orders?.reduce((sum, o) => sum + (o.amount || 799), 0) || 0) / 100).toFixed(2)}
            </div>
            <div className="text-gray-500 text-sm">Total Spent</div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
          </div>
          
          {orders && orders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-6 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      Song for {order.customization?.recipient_name || 'Someone Special'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {order.customization?.occasion} • {order.customization?.song_length}s song
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'paid' || order.status === 'generating' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                    <span className="font-semibold text-gray-900">
                      £{(order.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Create your first personalized song!</p>
              <Link
                href="/customize"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
              >
                Create a Song
              </Link>
            </div>
          )}
        </div>

        {/* Songs Section */}
        {songs && songs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Your Songs</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {songs.map((song) => (
                <div key={song.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🎵</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {song.order?.customization?.recipient_name || 'My Song'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(song.duration_ms / 1000)} seconds • {song.downloads} downloads
                      </div>
                    </div>
                  </div>
                  <audio
                    controls
                    className="h-10"
                    src={song.audio_url}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
