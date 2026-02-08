'use client'

import { useEffect, useCallback } from 'react'

interface UseSwipeKeyboardProps {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onUndo: () => void
  canUndo: boolean
  disabled?: boolean
}

export function useSwipeKeyboard({
  onSwipeLeft,
  onSwipeRight,
  onUndo,
  canUndo,
  disabled = false,
}: UseSwipeKeyboardProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle keyboard if disabled
      if (disabled) return

      // Don't hijack keyboard if user is typing in a form element
      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement
      ) {
        return
      }

      // Handle keyboard shortcuts
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          onSwipeLeft()
          break

        case 'ArrowRight':
          e.preventDefault()
          onSwipeRight()
          break

        case 'Enter':
          e.preventDefault()
          onSwipeRight()
          break

        case 'Escape':
          if (canUndo) {
            e.preventDefault()
            onUndo()
          }
          break
      }
    },
    [onSwipeLeft, onSwipeRight, onUndo, canUndo, disabled]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
