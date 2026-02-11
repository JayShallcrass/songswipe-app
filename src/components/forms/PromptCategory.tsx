'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PromptCategory as PromptCategoryData } from '@/lib/promptCategories'

interface PromptCategoryProps {
  category: PromptCategoryData
  activePrompts: Set<string>
  promptAnswers: Record<string, string>
  onTogglePrompt: (question: string) => void
  onAnswerChange: (question: string, value: string) => void
  disabled?: boolean
}

export function PromptCategory({
  category,
  activePrompts,
  promptAnswers,
  onTogglePrompt,
  onAnswerChange,
  disabled = false,
}: PromptCategoryProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeCount = category.questions.filter((q) => activePrompts.has(q)).length

  return (
    <div className="border border-surface-300 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-100/50 hover:bg-surface-100 transition-colors"
      >
        <div className="text-left">
          <span className="font-medium text-sm text-white">{category.title}</span>
          <span className="text-xs text-zinc-500 ml-2">{category.subtitle}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeCount > 0 && (
            <span className="text-xs font-medium bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
          <span
            className={`text-zinc-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </button>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-3 sm:px-4 py-3">
          {/* Toggle chips */}
          <div className="flex flex-wrap gap-2 mb-2">
            {category.questions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => onTogglePrompt(question)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  activePrompts.has(question)
                    ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                    : 'bg-surface-100 border-surface-300 text-zinc-300 hover:bg-surface-100 hover:border-brand-500/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {question}
              </button>
            ))}
          </div>

          {/* Animated inputs for active prompts */}
          <AnimatePresence>
            {category.questions
              .filter((q) => activePrompts.has(q))
              .map((question) => (
                <motion.div
                  key={question}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-brand-400 mb-1">
                      {question}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="Type your answer..."
                      value={promptAnswers[question] || ''}
                      onChange={(e) => onAnswerChange(question, e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
