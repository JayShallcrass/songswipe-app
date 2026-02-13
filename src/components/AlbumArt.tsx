'use client'

import { ReactNode } from 'react'
import {
  CakeIcon,
  HeartIcon,
  SparklesIcon,
  GiftIcon,
  AcademicCapIcon,
  MusicalNoteIcon,
  StarIcon,
} from '@heroicons/react/24/solid'

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

const occasionIconMap: Record<string, ReactNode> = {
  birthday: <CakeIcon className="w-full h-full text-white" />,
  valentines: <HeartIcon className="w-full h-full text-white" />,
  anniversary: <SparklesIcon className="w-full h-full text-white" />,
  wedding: <GiftIcon className="w-full h-full text-white" />,
  graduation: <AcademicCapIcon className="w-full h-full text-white" />,
  christmas: <StarIcon className="w-full h-full text-white" />,
  'mothers-day': <HeartIcon className="w-full h-full text-white" />,
  'fathers-day': <StarIcon className="w-full h-full text-white" />,
  'just-because': <MusicalNoteIcon className="w-full h-full text-white" />,
}

const sizeClasses = {
  sm: 'w-12 h-12 text-xs',
  md: 'w-24 h-24 text-sm',
  lg: 'w-48 h-48 text-base',
}

const iconSizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-9 h-9',
  lg: 'w-14 h-14',
}

export default function AlbumArt({ recipientName, occasion, genre, size = 'md' }: AlbumArtProps) {
  const normalised = occasion.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')
  const gradient = occasionGradients[normalised] || 'from-brand-500 to-amber-500'
  const icon = occasionIconMap[normalised] || <MusicalNoteIcon className="w-full h-full text-white" />

  return (
    <div
      className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative overflow-hidden`}
    >
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 text-center px-2">
        <div className={iconSizeClasses[size]}>
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
