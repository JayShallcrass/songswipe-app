'use client'

import { useEffect, useState } from 'react'

interface Prompt {
  id: string
  user_id: string
  userEmail: string
  recipient_name: string
  your_name: string
  occasion: string
  mood: string[]
  genre: string
  pronunciation: string | null
  prompt: string
  created_at: string
}

interface PromptsResponse {
  prompts: Prompt[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function Tag({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-surface-100 border border-surface-300 text-zinc-300 capitalize">
      {label.replace('-', ' ')}
    </span>
  )
}

export default function AdminPrompts() {
  const [data, setData] = useState<PromptsResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/prompts?page=${page}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Prompt Inspector</h1>
      <p className="text-sm text-zinc-500 mb-6">
        View all prompts sent to the AI. Spot conflicting combos and tune the prompt builder.
      </p>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-50 rounded-lg" />
          ))}
        </div>
      ) : !data?.prompts.length ? (
        <p className="text-zinc-400">No prompts found.</p>
      ) : (
        <>
          <div className="space-y-3">
            {data.prompts.map((p) => (
              <div
                key={p.id}
                className="bg-surface-50 border border-surface-200 rounded-xl overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  className="p-4 cursor-pointer hover:bg-surface-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">
                        {p.recipient_name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        by {p.your_name}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {new Date(p.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 max-w-[200px] truncate">
                      {p.userEmail}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.mood.map((m) => (
                      <Tag key={m} label={m} />
                    ))}
                    <Tag label={p.genre} />
                    <Tag label={p.occasion} />
                    {p.pronunciation && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-brand-500/10 border border-brand-500/30 text-brand-400">
                        pronunciation: {p.pronunciation}
                      </span>
                    )}
                  </div>
                </div>

                {expandedId === p.id && (
                  <div className="border-t border-surface-200 p-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Full Prompt</h4>
                    <pre className="text-xs text-zinc-400 whitespace-pre-wrap bg-surface-100 rounded-lg p-3 max-h-80 overflow-auto">
                      {p.prompt}
                    </pre>
                  </div>
                )}
              </div>
            ))}
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
