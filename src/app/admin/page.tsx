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

interface RevenueDay {
  date: string
  revenue: number
}

interface RevenueChart {
  days: RevenueDay[]
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
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

function RevenueBarChart({ data }: { data: RevenueDay[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-xl p-5">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Revenue (Last 30 Days)</h3>
      <div className="flex items-end gap-[3px] h-32">
        {data.map((day) => {
          const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
          const date = new Date(day.date)
          const isToday = day.date === new Date().toISOString().split('T')[0]

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 bg-surface-100 border border-surface-300 rounded-lg px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="font-semibold">{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                <div className="text-zinc-400">{day.revenue > 0 ? `£${day.revenue.toFixed(2)}` : 'No revenue'}</div>
              </div>
              <div
                className={`w-full rounded-t transition-all ${
                  isToday
                    ? 'bg-gradient-to-t from-brand-500 to-amber-500'
                    : day.revenue > 0
                      ? 'bg-brand-500/60 group-hover:bg-brand-500/80'
                      : 'bg-surface-300/30'
                }`}
                style={{ height: `${Math.max(height, 2)}%` }}
              />
            </div>
          )
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-zinc-600">30d ago</span>
        <span className="text-[10px] text-zinc-600">Today</span>
      </div>
    </div>
  )
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [chart, setChart] = useState<RevenueChart | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [statsRes, chartRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/stats/revenue-chart'),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (chartRes.ok) setChart(await chartRes.json())
    } catch {
      // silently retry on next interval
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
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
        <div className="h-48 bg-surface-50 rounded-xl" />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-zinc-400">Failed to load stats.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Overview</h1>

      {/* Revenue summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          value={`£${stats.totalRevenue.toFixed(2)}`}
        />
        <StatCard
          label="Revenue Today"
          value={`£${(chart?.revenueToday ?? 0).toFixed(2)}`}
        />
        <StatCard
          label="Revenue This Week"
          value={`£${(chart?.revenueWeek ?? 0).toFixed(2)}`}
        />
        <StatCard
          label="Revenue This Month"
          value={`£${(chart?.revenueMonth ?? 0).toFixed(2)}`}
        />
      </div>

      {/* Revenue chart */}
      {chart && <div className="mb-6"><RevenueBarChart data={chart.days} /></div>}

      {/* Operational stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          label="Unresolved Failed Jobs"
          value={stats.unresolvedFailedJobs}
          sub={stats.unresolvedFailedJobs > 0 ? 'Needs attention' : 'All clear'}
        />
      </div>
    </div>
  )
}
