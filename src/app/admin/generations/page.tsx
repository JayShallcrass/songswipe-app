'use client'

import { useEffect, useState, useCallback } from 'react'

interface Variant {
  id: string
  order_id: string
  variant_number: number
  created_at: string
  completed_at?: string | null
}

interface GenerationsData {
  pendingCount: number
  pending: Variant[]
  generating: Variant[]
  recentlyFailed: Variant[]
}

function StatusDot({ color }: { color: string }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
  )
}

export default function AdminGenerations() {
  const [data, setData] = useState<GenerationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/generations')
      if (res.ok) setData(await res.json())
    } catch {
      // silently retry
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleRetry = async (variantId: string) => {
    setRetrying((prev) => new Set(prev).add(variantId))
    try {
      const res = await fetch(`/api/admin/generations/${variantId}/retry`, {
        method: 'POST',
      })
      if (res.ok) {
        // Refresh data
        await fetchData()
      }
    } finally {
      setRetrying((prev) => {
        const next = new Set(prev)
        next.delete(variantId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-surface-100 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-surface-50 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return <p className="text-zinc-400">Failed to load generation data.</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Generation Queue</h1>
        <p className="text-xs text-zinc-500">Auto-refreshes every 5s</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot color="bg-yellow-400" />
            <p className="text-sm text-zinc-400">Pending</p>
          </div>
          <p className="text-3xl font-bold text-white">{data.pendingCount}</p>
        </div>
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot color="bg-purple-400 animate-pulse" />
            <p className="text-sm text-zinc-400">Generating</p>
          </div>
          <p className="text-3xl font-bold text-white">{data.generating.length}</p>
        </div>
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot color="bg-red-400" />
            <p className="text-sm text-zinc-400">Failed (24h)</p>
          </div>
          <p className="text-3xl font-bold text-white">{data.recentlyFailed.length}</p>
        </div>
      </div>

      {/* Currently generating */}
      {data.generating.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Currently Generating</h2>
          <div className="space-y-2">
            {data.generating.map((v) => (
              <div key={v.id} className="bg-surface-50 border border-purple-500/30 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-sm text-white">Variant {v.variant_number}</span>
                  <span className="text-xs text-zinc-500 ml-3">Order: {v.order_id.slice(0, 8)}...</span>
                </div>
                <span className="text-xs text-purple-400 animate-pulse">Generating...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently failed */}
      {data.recentlyFailed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Recently Failed</h2>
          <div className="space-y-2">
            {data.recentlyFailed.map((v) => (
              <div key={v.id} className="bg-surface-50 border border-red-500/30 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-sm text-white">Variant {v.variant_number}</span>
                  <span className="text-xs text-zinc-500 ml-3">Order: {v.order_id.slice(0, 8)}...</span>
                  <span className="text-xs text-zinc-600 ml-3">
                    {new Date(v.created_at).toLocaleTimeString('en-GB')}
                  </span>
                </div>
                <button
                  onClick={() => handleRetry(v.id)}
                  disabled={retrying.has(v.id)}
                  className="px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 disabled:opacity-50"
                >
                  {retrying.has(v.id) ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending queue */}
      {data.pending.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-3">Pending Queue</h2>
          <div className="space-y-2">
            {data.pending.slice(0, 20).map((v) => (
              <div key={v.id} className="bg-surface-50 border border-surface-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-sm text-white">Variant {v.variant_number}</span>
                  <span className="text-xs text-zinc-500 ml-3">Order: {v.order_id.slice(0, 8)}...</span>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(v.created_at).toLocaleTimeString('en-GB')}
                </span>
              </div>
            ))}
            {data.pendingCount > 20 && (
              <p className="text-xs text-zinc-500 text-center py-2">
                + {data.pendingCount - 20} more in queue
              </p>
            )}
          </div>
        </div>
      )}

      {data.generating.length === 0 && data.recentlyFailed.length === 0 && data.pendingCount === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">Queue is empty. All generations complete.</p>
        </div>
      )}
    </div>
  )
}
