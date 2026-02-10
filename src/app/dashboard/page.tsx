'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { useSongHistory } from '@/lib/hooks/useSongHistory'
import { useOrderHistory } from '@/lib/hooks/useOrderHistory'
import { useOccasions } from '@/lib/hooks/useOccasions'
import { useDashboardStats } from '@/lib/hooks/useDashboardStats'
import { useSongBalance } from '@/lib/hooks/useSongBalance'
import SongCard from '@/components/dashboard/SongCard'
import OrderRow from '@/components/dashboard/OrderRow'
import OccasionCard from '@/components/dashboard/OccasionCard'
import EmptyState from '@/components/dashboard/EmptyState'
import Pagination from '@/components/dashboard/Pagination'

type TabType = 'songs' | 'orders' | 'occasions'

export default function DashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('songs')
  const [songPage, setSongPage] = useState(1)
  const [orderPage, setOrderPage] = useState(1)
  const [userEmail, setUserEmail] = useState<string>('')

  // Auth check
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.push('/auth/login')
      } else {
        setUserEmail(user.email || '')
      }
    })
  }, [router])

  // Data fetching
  const { data: songData, isLoading: isLoadingSongs } = useSongHistory(songPage)
  const { data: orderData, isLoading: isLoadingOrders } = useOrderHistory(orderPage)
  const { data: occasions, isLoading: isLoadingOccasions } = useOccasions()
  const { data: stats } = useDashboardStats()
  const { data: balance } = useSongBalance()

  // Redirect first-time users (no songs AND no orders) straight to creation flow
  useEffect(() => {
    if (!isLoadingSongs && !isLoadingOrders && songData && orderData) {
      if (songData.total === 0 && orderData.total === 0) {
        router.push('/customise')
      }
    }
  }, [isLoadingSongs, isLoadingOrders, songData, orderData, router])

  // Sign out handler
  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Invalidate song list after deletion
  const handleSongDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['songs', 'history'] })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base truncate">{userEmail}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {balance && balance.songsRemaining > 0 && (
              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                {balance.songsRemaining} prepaid {balance.songsRemaining === 1 ? 'song' : 'songs'}
              </span>
            )}
            <Link
              href="/customise"
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold text-sm sm:text-base whitespace-nowrap hover:from-pink-600 hover:to-purple-700 transition-all shadow-sm"
            >
              Create a Song
            </Link>
            <button
              onClick={handleSignOut}
              className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base whitespace-nowrap"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
            <div className="text-2xl mb-1">🎵</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.totalSongs ?? 0}</div>
            <div className="text-gray-500 text-xs sm:text-sm">Songs Created</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
            <div className="text-2xl mb-1">🎤</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.peopleSerenaded ?? 0}</div>
            <div className="text-gray-500 text-xs sm:text-sm">People Serenaded</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-center">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.upcomingOccasions ?? 0}</div>
            <div className="text-gray-500 text-xs sm:text-sm">Upcoming Occasions</div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="bg-white rounded-t-xl shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('songs')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-all relative ${
                activeTab === 'songs'
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Songs
              {activeTab === 'songs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-all relative ${
                activeTab === 'orders'
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders
              {activeTab === 'orders' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('occasions')}
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-all relative ${
                activeTab === 'occasions'
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Occasions
              {activeTab === 'occasions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-6">
            {/* My Songs Tab */}
            {activeTab === 'songs' && (
              <div>
                {isLoadingSongs ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-gray-200 animate-pulse rounded-xl h-24 w-full"
                      />
                    ))}
                  </div>
                ) : songData && songData.songs.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {songData.songs.map((song) => (
                        <SongCard key={song.id} song={song} onDelete={handleSongDeleted} />
                      ))}
                    </div>
                    <Pagination
                      page={songPage}
                      pageCount={songData.pageCount}
                      onPageChange={setSongPage}
                    />
                  </>
                ) : (
                  <EmptyState
                    icon="🎵"
                    title="No songs yet"
                    description="Create your first personalised song!"
                    action={
                      <Link
                        href="/customise"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
                      >
                        Create a Song
                      </Link>
                    }
                  />
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {isLoadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-gray-200 animate-pulse rounded-xl h-24 w-full"
                      />
                    ))}
                  </div>
                ) : orderData && orderData.orders.length > 0 ? (
                  <>
                    <div className="bg-white rounded-lg border border-gray-100">
                      {orderData.orders.map((order) => (
                        <OrderRow
                          key={order.id}
                          orderId={order.id}
                          status={order.status}
                          amount={order.amount}
                          orderType={order.orderType}
                          date={order.createdAt}
                          recipientName={order.recipientName}
                          occasion={order.occasion}
                        />
                      ))}
                    </div>
                    <Pagination
                      page={orderPage}
                      pageCount={orderData.pageCount}
                      onPageChange={setOrderPage}
                    />
                  </>
                ) : (
                  <EmptyState
                    icon="📦"
                    title="No orders yet"
                    description="Your purchase history will appear here."
                    action={
                      <Link
                        href="/pricing"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
                      >
                        View Pricing
                      </Link>
                    }
                  />
                )}
              </div>
            )}

            {/* Occasions Tab */}
            {activeTab === 'occasions' && (
              <div>
                {isLoadingOccasions ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-gray-200 animate-pulse rounded-xl h-24 w-full"
                      />
                    ))}
                  </div>
                ) : occasions && occasions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {occasions.map((occasion) => (
                      <OccasionCard
                        key={occasion.id}
                        recipientName={occasion.recipientName}
                        occasion={occasion.occasion}
                        date={occasion.formattedDate}
                        daysUntil={occasion.daysUntil}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="📅"
                    title="No upcoming occasions"
                    description="Create songs for special dates to track them here."
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/dashboard/help"
            className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
          >
            Need help? View FAQ &rarr;
          </Link>
        </div>

      </div>
    </div>
  )
}
