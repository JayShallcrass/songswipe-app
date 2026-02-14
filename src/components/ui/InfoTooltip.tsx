'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setIsOpen(false), [])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node)
      ) return
      close()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, close])

  // Flip popover below if too close to top of viewport
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setFlipped(rect.top < 100)
  }, [isOpen])

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-zinc-600 text-zinc-500 hover:text-zinc-300 hover:border-zinc-400 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500"
        aria-label="More info"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="600" fontFamily="system-ui">i</text>
        </svg>
      </button>
      {isOpen && (
        <div
          ref={popoverRef}
          role="tooltip"
          className={`absolute left-1/2 -translate-x-1/2 z-50 bg-surface-100 border border-surface-300 text-zinc-300 text-xs rounded-lg shadow-lg p-3 max-w-[250px] w-max pointer-events-none ${
            flipped ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
          }`}
        >
          {text}
        </div>
      )}
    </span>
  )
}
