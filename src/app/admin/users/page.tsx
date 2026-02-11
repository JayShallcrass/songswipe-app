'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  created_at: string
  totalOrders: number
  totalSongs: number
  bundleBalance: number
}

interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminUsers() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/users?page=${page}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Users</h1>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-50 rounded-lg" />
          ))}
        </div>
      ) : !data?.users.length ? (
        <p className="text-zinc-400">No users found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium">Orders</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium">Songs</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium">Bundle Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-surface-200/50 hover:bg-surface-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-white">{user.email}</td>
                    <td className="py-3 px-4 text-zinc-400">
                      {new Date(user.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-300">{user.totalOrders}</td>
                    <td className="py-3 px-4 text-right text-zinc-300">{user.totalSongs}</td>
                    <td className="py-3 px-4 text-right">
                      {user.bundleBalance > 0 ? (
                        <span className="text-brand-400">{user.bundleBalance}</span>
                      ) : (
                        <span className="text-zinc-500">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
