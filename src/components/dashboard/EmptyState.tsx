'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="p-12 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-zinc-500 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
