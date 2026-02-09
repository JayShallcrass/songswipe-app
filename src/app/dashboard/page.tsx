'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSongHistory } from '@/lib/hooks/useSongHistory'
import { useOrderHistory } from '@/lib/hooks/useOrderHistory'
import { useOccasions } from '@/lib/hooks/useOccasions'
import SongCard from '@/components/dashboard/SongCard'
import OrderRow from '@/components/dashboard/OrderRow'
import OccasionCard from '@/components/dashboard/OccasionCard'
import EmptyState from '@/components/dashboard/EmptyState'
import Pagination from '@/components/dashboard/Pagination'

type TabType = 'songs' | 'orders' | 'occasions'

export default function DashboardPage() {
  const router = useRouter()
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

  // Redirect first-time users (no songs AND no orders) straight to creation flow
  useEffect(() => {
    if (!isLoadingSongs && !isLoadingOrders && songData && orderData) {
      if (songData.total === 0 && orderData.total === 0) {
        router.push('/customize')
      }
    }
  }, [isLoadingSongs, isLoadingOrders, songData, orderData, router])

  // Calculate stats
  const totalSongs = songData?.total || 0
  const totalOrders = orderData?.total || 0
  const totalSpent = orderData?.orders.reduce((sum, order) => sum + order.amount, 0) || 0

  // Sign out handler
  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/auth/login')
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
          <button
            onClick={handleSignOut}
            className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base whitespace-nowrap"
          >
            Sign Out
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-gray-900">{totalSongs}</div>
            <div className="text-gray-500 text-sm">Total Songs</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-gray-900">{totalOrders}</div>
            <div className="text-gray-500 text-sm">Total Orders</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-gray-900">
              £{(totalSpent / 100).toFixed(2)}
            </div>
            <div className="text-gray-500 text-sm">Total Spent</div>
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
                        <SongCard key={song.id} song={song} />
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
                    description="Create your first personalized song!"
                    action={
                      <Link
                        href="/customize"
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
      </div>
    </div>
  )
}
