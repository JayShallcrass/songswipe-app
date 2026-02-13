'use client'

import { useEffect, useState } from 'react'

interface Variant {
  variant_number: number
  generation_status: string
}

interface Customization {
  id: string
  recipient_name: string
  your_name: string
  occasion: string
  mood: string[]
  genre: string
  special_memories: string | null
  things_to_avoid: string | null
  pronunciation: string | null
  prompt: string
}

interface Order {
  id: string
  user_id: string
  userEmail: string
  stripe_session_id: string | null
  status: string
  amount: number
  order_type: string
  created_at: string
  customizations: Customization | null
  variants: Variant[]
}

interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    paid: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    generating: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status] || 'bg-surface-100 text-zinc-400 border-surface-300'}`}>
      {status}
    </span>
  )
}

export default function AdminOrders() {
  const [data, setData] = useState<OrdersResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/orders?page=${page}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Orders</h1>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-50 rounded-lg" />
          ))}
        </div>
      ) : !data?.orders.length ? (
        <p className="text-zinc-400">No orders found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Recipient</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Occasion</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Genre</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="border-b border-surface-200/50 hover:bg-surface-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-zinc-300">
                        {new Date(order.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 px-4 text-zinc-300 max-w-[200px] truncate">
                        {order.userEmail}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {order.customizations?.recipient_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-zinc-300 capitalize">
                        {order.customizations?.occasion?.replace('-', ' ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-zinc-300 capitalize">
                        {order.customizations?.genre || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-300">
                        {order.amount > 0 ? `£${(order.amount / 100).toFixed(2)}` : 'Prepaid'}
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-surface-50">
                        <td colSpan={7} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">Prompt</h4>
                              <pre className="text-xs text-zinc-400 whitespace-pre-wrap bg-surface-100 rounded-lg p-3 max-h-60 overflow-auto">
                                {order.customizations?.prompt || 'No prompt'}
                              </pre>
                            </div>
                            <div className="space-y-3">
                              {order.customizations?.special_memories && (
                                <div>
                                  <h4 className="text-sm font-semibold text-white mb-1">Special Memories</h4>
                                  <p className="text-xs text-zinc-400">{order.customizations.special_memories}</p>
                                </div>
                              )}
                              {order.customizations?.things_to_avoid && (
                                <div>
                                  <h4 className="text-sm font-semibold text-white mb-1">Things to Avoid</h4>
                                  <p className="text-xs text-zinc-400">{order.customizations.things_to_avoid}</p>
                                </div>
                              )}
                              {order.customizations?.pronunciation && (
                                <div>
                                  <h4 className="text-sm font-semibold text-white mb-1">Pronunciation</h4>
                                  <p className="text-xs text-zinc-400">{order.customizations.pronunciation}</p>
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-1">Variants</h4>
                                <div className="flex gap-2">
                                  {order.variants.length > 0 ? (
                                    order.variants.map((v) => (
                                      <StatusBadge key={v.variant_number} status={v.generation_status} />
                                    ))
                                  ) : (
                                    <span className="text-xs text-zinc-500">No variants</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-1">Order Details</h4>
                                <p className="text-xs text-zinc-400">
                                  ID: {order.id}<br />
                                  Type: {order.order_type}<br />
                                  {order.stripe_session_id && <>Stripe: {order.stripe_session_id}</>}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-zinc-500">
                Page {data.page} of {data.totalPages} ({data.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm bg-surface-50 border border-surface-200 rounded-lg text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.totalPages}
                  className="px-3 py-1.5 text-sm bg-surface-50 border border-surface-200 rounded-lg text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
