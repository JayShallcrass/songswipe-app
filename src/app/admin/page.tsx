'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalRevenue: number
  ordersToday: number
  ordersWeek: number
  ordersMonth: number
  songsGenerated: number
  songsFailed: number
  activeUsers: number
  unresolvedFailedJobs: number
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
      <p className="text-sm text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        setStats(await res.json())
      }
    } catch {
      // silently retry on next interval
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-surface-100 rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-50 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <p className="text-zinc-400">Failed to load stats.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`£${stats.totalRevenue.toFixed(2)}`}
        />
        <StatCard
          label="Orders Today"
          value={stats.ordersToday}
          sub={`${stats.ordersWeek} this week / ${stats.ordersMonth} this month`}
        />
        <StatCard
          label="Songs Generated"
          value={stats.songsGenerated}
          sub={`${stats.songsFailed} failed`}
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
        />
        <StatCard
          label="Orders This Week"
          value={stats.ordersWeek}
        />
        <StatCard
          label="Orders This Month"
          value={stats.ordersMonth}
        />
        <StatCard
          label="Failed Songs"
          value={stats.songsFailed}
        />
        <StatCard
          label="Unresolved Failed Jobs"
          value={stats.unresolvedFailedJobs}
          sub={stats.unresolvedFailedJobs > 0 ? 'Needs attention' : 'All clear'}
        />
      </div>
    </div>
  )
}
