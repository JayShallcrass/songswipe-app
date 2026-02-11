'use client'

import { SwipeStage } from '@/types/swipe'
import { STAGE_ORDER } from '@/lib/swipe-data'

interface SwipeProgressProps {
  currentStage: SwipeStage
  selections: Partial<Record<SwipeStage, string>>
  isPersonalising?: boolean
  onStageClick?: (stage: SwipeStage) => void
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

export function SwipeProgress({ currentStage, selections, isPersonalising, onStageClick }: SwipeProgressProps) {
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

  const handleClick = (step: VisualStep) => {
    if (step === 'personalise') return
    const status = getStepStatus(step)
    if (status === 'upcoming') return
    if (status === 'current') return
    // Only completed stages are clickable
    onStageClick?.(step as SwipeStage)
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2">
      <div className="flex items-center justify-between">
        {VISUAL_STEPS.map((step, index) => {
          const status = getStepStatus(step)
          const isLast = index === VISUAL_STEPS.length - 1
          const isClickable = status === 'completed' && step !== 'personalise'

          return (
            <div key={step} className="flex-1 flex items-center">
              {/* Step dot */}
              <div
                className={`relative flex flex-col items-center flex-shrink-0 ${
                  isClickable ? 'cursor-pointer group' : ''
                }`}
                onClick={() => handleClick(step)}
              >
                <div
                  className={`
                    w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      status === 'completed'
                        ? 'bg-brand-500 group-hover:scale-110'
                        : status === 'current'
                        ? 'bg-surface-50 border-[3px] border-brand-500 ring-2 ring-brand-500/30'
                        : 'bg-surface-300'
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

                {/* Step label - always visible */}
                <span
                  className={`
                    mt-1 text-[10px] sm:text-xs font-medium transition-colors leading-tight
                    ${
                      status === 'completed'
                        ? 'text-brand-400 group-hover:text-brand-300'
                        : status === 'current'
                        ? 'text-brand-400'
                        : 'text-zinc-500'
                    }
                  `}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-1.5 sm:mx-2 relative">
                  <div className="absolute inset-0 bg-surface-300 rounded-full" />
                  <div
                    className={`
                      absolute inset-0 rounded-full transition-all duration-500
                      ${
                        status === 'completed'
                          ? 'bg-brand-500'
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
