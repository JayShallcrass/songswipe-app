'use client'

import { SwipeStage } from '@/types/swipe'
import { STAGE_ORDER } from '@/lib/swipe-data'

interface SwipeProgressProps {
  currentStage: SwipeStage
  selections: Partial<Record<SwipeStage, string>>
}

const STAGE_LABELS: Record<SwipeStage, string> = {
  occasion: 'Occasion',
  mood: 'Mood',
  genre: 'Genre',
  voice: 'Voice',
}

export function SwipeProgress({ currentStage, selections }: SwipeProgressProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage)

  const getStageStatus = (stage: SwipeStage): 'completed' | 'current' | 'upcoming' => {
    if (selections[stage]) return 'completed'
    if (stage === currentStage) return 'current'
    return 'upcoming'
  }

  const progressPercentage = (Object.keys(selections).length / STAGE_ORDER.length) * 100

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4">
      {/* Stage dots with connecting lines */}
      <div className="relative flex items-center justify-between mb-4">
        {STAGE_ORDER.map((stage, index) => {
          const status = getStageStatus(stage)
          const isLast = index === STAGE_ORDER.length - 1

          return (
            <div key={stage} className="flex-1 flex items-center">
              {/* Stage dot */}
              <div className="relative flex flex-col items-center flex-shrink-0">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      status === 'completed'
                        ? 'bg-purple-600 shadow-lg'
                        : status === 'current'
                        ? 'bg-white border-4 border-purple-600 animate-pulse shadow-lg'
                        : 'bg-gray-300'
                    }
                  `}
                >
                  {status === 'completed' && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* Stage label */}
                <span
                  className={`
                    mt-2 text-xs font-medium transition-colors
                    ${status === 'completed' || status === 'current' ? 'text-purple-600' : 'text-gray-400'}
                  `}
                >
                  {STAGE_LABELS[stage]}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 h-1 mx-2 relative">
                  <div className="absolute inset-0 bg-gray-300 rounded-full" />
                  <div
                    className={`
                      absolute inset-0 rounded-full transition-all duration-500
                      ${
                        STAGE_ORDER.indexOf(stage) < currentIndex
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : 'bg-gray-300'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Overall progress bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress text */}
      <div className="mt-2 text-center text-sm text-gray-500">
        {Object.keys(selections).length} of {STAGE_ORDER.length} stages complete
      </div>
    </div>
  )
}
