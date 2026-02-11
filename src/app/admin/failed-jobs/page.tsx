'use client'

import { useEffect, useState } from 'react'

interface FailedJob {
  id: string
  job_type: string
  event_data: Record<string, unknown>
  error_message: string
  error_stack: string | null
  retry_count: number
  failed_at: string
  resolved_at: string | null
  notes: string | null
}

export default function AdminFailedJobs() {
  const [jobs, setJobs] = useState<FailedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actioning, setActioning] = useState<Set<string>>(new Set())

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/admin/failed-jobs')
      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs)
      }
    } catch {
      // silently retry
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleAction = async (jobId: string, action: 'resolve' | 'retry') => {
    setActioning((prev) => new Set(prev).add(jobId))
    try {
      const res = await fetch(`/api/admin/failed-jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        // Remove from list
        setJobs((prev) => prev.filter((j) => j.id !== jobId))
      }
    } finally {
      setActioning((prev) => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Failed Jobs</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Unresolved failures across the system. Resolve or retry each job.
      </p>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-50 rounded-lg" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-surface-50 border border-surface-200 rounded-xl">
          <p className="text-green-400 font-medium mb-1">All clear</p>
          <p className="text-sm text-zinc-500">No unresolved failed jobs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-surface-50 border border-red-500/20 rounded-xl overflow-hidden"
            >
              <div
                onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                className="p-4 cursor-pointer hover:bg-surface-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/30 font-medium">
                      {job.job_type}
                    </span>
                    <span className="text-xs text-zinc-500">
                      Retries: {job.retry_count}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(job.failed_at).toLocaleString('en-GB')}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 truncate">
                  {job.error_message}
                </p>
              </div>

              {expandedId === job.id && (
                <div className="border-t border-surface-200 p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Error Message</h4>
                    <p className="text-xs text-red-400">{job.error_message}</p>
                  </div>

                  {job.error_stack && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">Stack Trace</h4>
                      <pre className="text-xs text-zinc-500 whitespace-pre-wrap bg-surface-100 rounded-lg p-3 max-h-40 overflow-auto">
                        {job.error_stack}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Event Data</h4>
                    <pre className="text-xs text-zinc-400 whitespace-pre-wrap bg-surface-100 rounded-lg p-3 max-h-40 overflow-auto">
                      {JSON.stringify(job.event_data, null, 2)}
                    </pre>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(job.id, 'retry')}
                      disabled={actioning.has(job.id)}
                      className="px-4 py-2 text-sm bg-brand-500/10 text-brand-400 border border-brand-500/30 rounded-lg hover:bg-brand-500/20 disabled:opacity-50"
                    >
                      {actioning.has(job.id) ? 'Processing...' : 'Retry'}
                    </button>
                    <button
                      onClick={() => handleAction(job.id, 'resolve')}
                      disabled={actioning.has(job.id)}
                      className="px-4 py-2 text-sm bg-surface-100 text-zinc-400 border border-surface-300 rounded-lg hover:text-white hover:bg-surface-200 disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
