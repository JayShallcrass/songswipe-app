'use client'

import { useState, useEffect, useCallback } from 'react'
import { SwipeFlowState, SwipeStage, SwipeSelection } from '@/types/swipe'
import { STAGE_ORDER, STAGE_CONFIG } from '@/lib/swipe-data'

const STORAGE_KEY = 'songswipe_builder_state'

const initialState: SwipeFlowState = {
  currentStage: 'occasion',
  currentCardIndex: 0,
  selections: {},
  history: [],
}

export function useSwipeState() {
  const [state, setState] = useState<SwipeFlowState>(initialState)
  const [isHydrated, setIsHydrated] = useState(false)
  const [didLoop, setDidLoop] = useState(false)

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

  // Auto-clear the loop indicator after a delay
  useEffect(() => {
    if (didLoop) {
      const timer = setTimeout(() => setDidLoop(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [didLoop])

  const handleSwipe = useCallback((cardId: string, direction: 'left' | 'right') => {
    setState(prevState => {
      const newHistory: SwipeSelection[] = [
        ...prevState.history,
        { stage: prevState.currentStage, cardId, direction },
      ]

      // Right swipe = select this card and advance to next stage
      if (direction === 'right') {
        const newSelections = {
          ...prevState.selections,
          [prevState.currentStage]: cardId,
        }

        const currentStageIndex = STAGE_ORDER.indexOf(prevState.currentStage)
        const isLastStage = currentStageIndex === STAGE_ORDER.length - 1

        if (isLastStage) {
          // Completed all stages
          return {
            ...prevState,
            selections: newSelections,
            history: newHistory,
          }
        }

        // Advance to next stage
        const nextStage = STAGE_ORDER[currentStageIndex + 1]
        return {
          ...prevState,
          currentStage: nextStage,
          currentCardIndex: 0,
          selections: newSelections,
          history: newHistory,
        }
      }

      // Left swipe = skip this card, show next card in same stage (loop if at end)
      const currentStageConfig = STAGE_CONFIG.find(s => s.stage === prevState.currentStage)
      if (!currentStageConfig) return prevState

      const totalCardsInStage = currentStageConfig.cards.length
      const nextCardIndex = (prevState.currentCardIndex + 1) % totalCardsInStage

      // If we wrapped back to 0, signal the loop
      if (nextCardIndex === 0) {
        setDidLoop(true)
      }

      return {
        ...prevState,
        currentCardIndex: nextCardIndex,
        history: newHistory,
      }
    })
  }, [])

  const undo = useCallback(() => {
    setState(prevState => {
      if (prevState.history.length === 0) return prevState

      const newHistory = [...prevState.history]
      const lastAction = newHistory.pop()!

      // If last action was a right swipe (selection), revert to that stage and clear selection
      if (lastAction.direction === 'right') {
        const newSelections = { ...prevState.selections }
        delete newSelections[lastAction.stage]

        const stageConfig = STAGE_CONFIG.find(s => s.stage === lastAction.stage)
        const cardIndex = stageConfig?.cards.findIndex(c => c.id === lastAction.cardId) ?? 0

        return {
          ...prevState,
          currentStage: lastAction.stage,
          currentCardIndex: cardIndex,
          selections: newSelections,
          history: newHistory,
        }
      }

      // If last action was a left swipe (skip), go back to that card in that stage
      if (lastAction.direction === 'left') {
        const stageConfig = STAGE_CONFIG.find(s => s.stage === lastAction.stage)
        const cardIndex = stageConfig?.cards.findIndex(c => c.id === lastAction.cardId) ?? 0

        return {
          ...prevState,
          currentStage: lastAction.stage,
          currentCardIndex: cardIndex,
          history: newHistory,
        }
      }

      return prevState
    })
  }, [])

  const reset = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error)
    }
    setState(initialState)
    setDidLoop(false)
  }, [])

  const canUndo = state.history.length > 0

  const isSwipeComplete = STAGE_ORDER.every(stage => state.selections[stage] !== undefined)

  const progress = (Object.keys(state.selections).length / STAGE_ORDER.length) * 100

  const currentStageConfig = STAGE_CONFIG.find(s => s.stage === state.currentStage)

  return {
    state,
    handleSwipe,
    undo,
    reset,
    canUndo,
    isSwipeComplete,
    progress,
    currentStageConfig,
    didLoop,
  }
}
