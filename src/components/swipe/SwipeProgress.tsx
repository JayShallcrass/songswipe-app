'use client'

import { SwipeStage } from '@/types/swipe'
import { STAGE_ORDER } from '@/lib/swipe-data'

interface SwipeProgressProps {
  currentStage: SwipeStage
  selections: Partial<Record<SwipeStage, string>>
  isPersonalising?: boolean
}

// Visual steps include the personalisation form as a final step
const VISUAL_STEPS = [...STAGE_ORDER, 'personalise'] as const
type VisualStep = (typeof VISUAL_STEPS)[number]

const STEP_LABELS: Record<VisualStep, string> = {
  occasion: 'Occasion',
  mood: 'Mood',
  genre: 'Genre',
  voice: 'Voice',
  personalise: 'Details',
}

export function SwipeProgress({ currentStage, selections, isPersonalising }: SwipeProgressProps) {
  const allSwipesComplete = STAGE_ORDER.every(stage => selections[stage] !== undefined)

  const getStepStatus = (step: VisualStep): 'completed' | 'current' | 'upcoming' => {
    if (step === 'personalise') {
      if (isPersonalising) return 'current'
      if (allSwipesComplete) return 'current'
      return 'upcoming'
    }
    if (selections[step]) return 'completed'
    if (step === currentStage) return 'current'
    return 'upcoming'
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2">
      <div className="flex items-center justify-between">
        {VISUAL_STEPS.map((step, index) => {
          const status = getStepStatus(step)
          const isLast = index === VISUAL_STEPS.length - 1

          return (
            <div key={step} className="flex-1 flex items-center">
              {/* Step dot */}
              <div className="relative flex flex-col items-center flex-shrink-0">
                <div
                  className={`
                    w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      status === 'completed'
                        ? 'bg-purple-600'
                        : status === 'current'
                        ? 'bg-white border-[3px] border-purple-600 shadow-sm'
                        : 'bg-gray-200'
                    }
                  `}
                >
                  {status === 'completed' && (
                    <svg
                      className="w-3 h-3 text-white"
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

                {/* Step label */}
                <span
                  className={`
                    mt-1 text-[10px] sm:text-xs font-medium transition-colors leading-tight
                    ${status === 'completed' || status === 'current' ? 'text-purple-600' : 'text-gray-400'}
                  `}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-1.5 sm:mx-2 relative">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <div
                    className={`
                      absolute inset-0 rounded-full transition-all duration-500
                      ${
                        status === 'completed'
                          ? 'bg-purple-600'
                          : 'bg-transparent'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
