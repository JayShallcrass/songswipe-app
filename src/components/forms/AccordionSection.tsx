'use client'

import { useState } from 'react'

interface AccordionSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function AccordionSection({ title, defaultOpen = false, children }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-surface-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 bg-surface-100 hover:bg-surface-100/80 transition-colors"
      >
        <span className="font-semibold text-sm sm:text-base text-white">{title}</span>
        <span
          className={`text-zinc-500 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-4 sm:px-5 py-4 space-y-4 sm:space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}
