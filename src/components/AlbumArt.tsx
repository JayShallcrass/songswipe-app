'use client'

interface AlbumArtProps {
  recipientName: string
  occasion: string
  genre?: string
  size?: 'sm' | 'md' | 'lg'
}

const occasionGradients: Record<string, string> = {
  birthday: 'from-orange-500 to-pink-600',
  valentines: 'from-rose-500 to-red-600',
  anniversary: 'from-amber-500 to-orange-600',
  wedding: 'from-purple-500 to-pink-500',
  graduation: 'from-blue-500 to-indigo-600',
  christmas: 'from-green-600 to-red-600',
  'mothers-day': 'from-pink-400 to-rose-500',
  'fathers-day': 'from-sky-500 to-blue-600',
  'just-because': 'from-violet-500 to-purple-600',
}

const occasionIcons: Record<string, string> = {
  birthday: '🎂',
  valentines: '💕',
  anniversary: '💍',
  wedding: '💒',
  graduation: '🎓',
  christmas: '🎄',
  'mothers-day': '🌸',
  'fathers-day': '⭐',
  'just-because': '🎵',
}

const sizeClasses = {
  sm: 'w-12 h-12 text-xs',
  md: 'w-24 h-24 text-sm',
  lg: 'w-48 h-48 text-base',
}

export default function AlbumArt({ recipientName, occasion, genre, size = 'md' }: AlbumArtProps) {
  const normalised = occasion.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')
  const gradient = occasionGradients[normalised] || 'from-brand-500 to-purple-600'
  const icon = occasionIcons[normalised] || '🎵'

  return (
    <div
      className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative overflow-hidden`}
    >
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 text-center px-2">
        <div className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-3xl' : 'text-5xl'}>
          {icon}
        </div>
        {size !== 'sm' && (
          <>
            <p className="text-white font-heading font-bold mt-1 truncate max-w-full leading-tight">
              {recipientName}
            </p>
            {size === 'lg' && genre && (
              <p className="text-white/70 text-xs mt-1">{genre}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
