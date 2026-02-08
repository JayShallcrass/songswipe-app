'use client'

interface SongDetailsProps {
  recipientName: string
  occasion: string
  senderName: string
  genre: string
  mood: string[]
  createdAt: string
  occasionDate: string | null
}

// Convert kebab-case to Title Case (e.g., "just-because" -> "Just Because")
function formatLabel(value: string): string {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function SongDetails({
  recipientName,
  occasion,
  senderName,
  genre,
  mood,
  createdAt,
  occasionDate,
}: SongDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const details = [
    { label: 'Occasion', value: formatLabel(occasion) },
    { label: 'From', value: senderName },
    { label: 'Genre', value: formatLabel(genre) },
    { label: 'Mood', value: mood.map(formatLabel).join(', ') },
    { label: 'Created', value: formatDate(createdAt) },
  ]

  if (occasionDate) {
    details.push({ label: 'Occasion Date', value: formatDate(occasionDate) })
  }

  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Song for {recipientName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map((detail) => (
          <div key={detail.label}>
            <div className="text-sm text-gray-400 uppercase mb-1">{detail.label}</div>
            <div className="text-lg text-white">{detail.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
