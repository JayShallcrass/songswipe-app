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
      return 'bg-green-100 text-green-700'
    } else if (daysUntil >= 7) {
      return 'bg-yellow-100 text-yellow-700'
    } else {
      return 'bg-red-100 text-red-700'
    }
  }

  // Badge text
  const getBadgeText = () => {
    if (daysUntil === 0) return 'Today'
    if (daysUntil === 1) return 'Tomorrow'
    return `${daysUntil} days away`
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{recipientName}</h3>
          <p className="text-gray-600 text-sm mt-1">{formatOccasion(occasion)}</p>
          <p className="text-gray-500 text-sm mt-1">{date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeStyle()}`}>
          {getBadgeText()}
        </span>
      </div>
    </div>
  )
}
