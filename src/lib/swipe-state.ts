'use client'

import { useState, useEffect, useCallback } from 'react'
import { SwipeFlowState, SwipeStage } from '@/types/swipe'
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/swipe-data'

const STORAGE_KEY = 'songswipe_builder_state'

const initialState: SwipeFlowState = {
  currentStage: 'occasion',
  selections: {},
}

export function useSwipeState() {
  const [state, setState] = useState<SwipeFlowState>(initialState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load state from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setState(parsed)
      }
    } catch (error) {
      console.error('Failed to load swipe state from sessionStorage:', error)
    }
    setIsHydrated(true)
  }, [])

  // Persist state to sessionStorage on every change
  useEffect(() => {
    if (isHydrated) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('Failed to save swipe state to sessionStorage:', error)
      }
    }
  }, [state, isHydrated])

  const handleSelect = useCallback((cardId: string) => {
    setState(prevState => {
      const newSelections = {
        ...prevState.selections,
        [prevState.currentStage]: cardId,
      }

      const currentStageIndex = STAGE_ORDER.indexOf(prevState.currentStage)
      const isLastStage = currentStageIndex === STAGE_ORDER.length - 1

      if (isLastStage) {
        return {
          ...prevState,
          selections: newSelections,
        }
      }

      const nextStage = STAGE_ORDER[currentStageIndex + 1]
      return {
        currentStage: nextStage,
        selections: newSelections,
      }
    })
  }, [])

  const goBack = useCallback(() => {
    setState(prevState => {
      const currentStageIndex = STAGE_ORDER.indexOf(prevState.currentStage)
      if (currentStageIndex <= 0) return prevState

      const prevStage = STAGE_ORDER[currentStageIndex - 1]
      return {
        ...prevState,
        currentStage: prevStage,
      }
    })
  }, [])

  const goToStage = useCallback((stage: SwipeStage) => {
    setState(prevState => {
      const targetIndex = STAGE_ORDER.indexOf(stage)
      const currentIndex = STAGE_ORDER.indexOf(prevState.currentStage)

      // Can go to any completed stage or current stage
      // A stage is "reachable" if it's <= the furthest stage we've reached
      // The furthest stage is determined by how many selections we have
      const completedCount = STAGE_ORDER.filter(s => prevState.selections[s] !== undefined).length
      // The furthest reachable index is the number of completed stages (next unselected)
      // or the current stage, whichever is greater
      const furthestReachable = Math.max(completedCount, currentIndex)

      if (targetIndex > furthestReachable) return prevState

      return {
        ...prevState,
        currentStage: stage,
      }
    })
  }, [])

  const reset = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error)
    }
    setState(initialState)
  }, [])

  const isSwipeComplete = STAGE_ORDER.every(stage => state.selections[stage] !== undefined)

  const progress = (Object.keys(state.selections).length / STAGE_ORDER.length) * 100

  const currentStageConfig = STAGE_CONFIG.find(s => s.stage === state.currentStage)

  return {
    state,
    handleSelect,
    goBack,
    goToStage,
    reset,
    isSwipeComplete,
    progress,
    currentStageConfig,
  }
}
