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
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'paid' || status === 'generating') return 'bg-blue-100 text-blue-700'
    if (status === 'failed') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  // Order type badge styling
  const getOrderTypeStyle = () => {
    if (orderType === 'base') return 'bg-purple-100 text-purple-700'
    if (orderType === 'upsell') return 'bg-pink-100 text-pink-700'
    if (orderType === 'bundle') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-4 flex items-center justify-between border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {format(new Date(date), 'MMM d, yyyy')}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderTypeStyle()}`}>
            {formatOrderType(orderType)}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          {recipientName || 'N/A'} {occasion && `• ${occasion}`}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle()}`}>
          {status}
        </span>
        <span className="font-semibold text-gray-900 min-w-[60px] text-right">
          £{(amount / 100).toFixed(2)}
        </span>
      </div>
    </div>
  )
}
