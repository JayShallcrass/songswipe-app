'use client'

import { format } from 'date-fns'

interface OrderRowProps {
  orderId: string
  status: string
  amount: number
  orderType: string
  date: string
  recipientName: string | null
  occasion: string | null
}

export default function OrderRow({
  orderId,
  status,
  amount,
  orderType,
  date,
  recipientName,
  occasion,
}: OrderRowProps) {
  // Format order type
  const formatOrderType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Status badge styling
  const getStatusStyle = () => {
    if (status === 'completed') return 'bg-green-500/10 text-green-400'
    if (status === 'paid' || status === 'generating') return 'bg-blue-500/10 text-blue-400'
    if (status === 'failed') return 'bg-red-500/10 text-red-400'
    return 'bg-surface-200 text-zinc-400'
  }

  // Order type badge styling
  const getOrderTypeStyle = () => {
    if (orderType === 'base') return 'bg-brand-500/10 text-brand-400'
    if (orderType === 'upsell') return 'bg-amber-500/10 text-amber-400'
    if (orderType === 'bundle') return 'bg-blue-500/10 text-blue-400'
    return 'bg-surface-200 text-zinc-400'
  }

  return (
    <div className="p-4 flex items-center justify-between border-b border-surface-200 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">
            {format(new Date(date), 'MMM d, yyyy')}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderTypeStyle()}`}>
            {formatOrderType(orderType)}
          </span>
        </div>
        <div className="text-sm text-zinc-400">
          {recipientName || 'N/A'} {occasion && `• ${occasion}`}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle()}`}>
          {status}
        </span>
        <span className="font-semibold text-white min-w-[60px] text-right">
          £{(amount / 100).toFixed(2)}
        </span>
      </div>
    </div>
  )
}
