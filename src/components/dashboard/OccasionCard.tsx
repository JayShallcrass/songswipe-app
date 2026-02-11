'use client'

interface OccasionCardProps {
  recipientName: string
  occasion: string
  date: string
  daysUntil: number
}

export default function OccasionCard({ recipientName, occasion, date, daysUntil }: OccasionCardProps) {
  // Format occasion: remove hyphens, capitalize first letter of each word
  const formatOccasion = (occ: string) => {
    return occ
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Badge styling based on days until
  const getBadgeStyle = () => {
    if (daysUntil >= 30) {
      return 'bg-green-500/10 text-green-400'
    } else if (daysUntil >= 7) {
      return 'bg-yellow-500/10 text-yellow-400'
    } else {
      return 'bg-red-500/10 text-red-400'
    }
  }

  // Badge text
  const getBadgeText = () => {
    if (daysUntil === 0) return 'Today'
    if (daysUntil === 1) return 'Tomorrow'
    return `${daysUntil} days away`
  }

  return (
    <div className="bg-surface-50 rounded-xl border border-surface-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{recipientName}</h3>
          <p className="text-zinc-400 text-sm mt-1">{formatOccasion(occasion)}</p>
          <p className="text-zinc-500 text-sm mt-1">{date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeStyle()}`}>
          {getBadgeText()}
        </span>
      </div>
    </div>
  )
}
