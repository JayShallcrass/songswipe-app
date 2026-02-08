'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export interface PersonalizationData {
  recipientName: string
  yourName: string
  specialMemories: string
  thingsToAvoid: string
}

interface PersonalizationFormProps {
  onSubmit: (data: PersonalizationData) => void
  onBack: () => void
  isLoading: boolean
  selections: Record<string, string>
}

export function PersonalizationForm({
  onSubmit,
  onBack,
  isLoading,
  selections,
}: PersonalizationFormProps) {
  const [recipientName, setRecipientName] = useState('')
  const [yourName, setYourName] = useState('')
  const [specialMemories, setSpecialMemories] = useState('')
  const [thingsToAvoid, setThingsToAvoid] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required'
    }

    if (!yourName.trim()) {
      newErrors.yourName = 'Your name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    onSubmit({
      recipientName,
      yourName,
      specialMemories,
      thingsToAvoid,
    })
  }

  const formatLabel = (value: string): string => {
    // Handle hyphenated values like 'just-because' -> 'Just Because'
    return value
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm p-8"
    >
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Tell us about them</h1>
      <p className="text-gray-600 mb-8">Add personal details to make your song special</p>

      {/* Song summary section */}
      <div className="bg-purple-50 rounded-xl p-4 mb-8">
        <h3 className="font-semibold text-purple-800 mb-2">Your Song Summary</h3>
        <div className="text-sm text-purple-700 space-y-1">
          {selections.occasion && (
            <p>
              <strong>Occasion:</strong> {formatLabel(selections.occasion)}
            </p>
          )}
          {selections.mood && (
            <p>
              <strong>Mood:</strong> {formatLabel(selections.mood)}
            </p>
          )}
          {selections.genre && (
            <p>
              <strong>Genre:</strong> {formatLabel(selections.genre)}
            </p>
          )}
          {selections.voice && (
            <p>
              <strong>Voice:</strong> {formatLabel(selections.voice)}
            </p>
          )}
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient's Name *
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., Sarah"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            disabled={isLoading}
          />
          {errors.recipientName && (
            <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="e.g., John"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            disabled={isLoading}
          />
          {errors.yourName && (
            <p className="text-red-500 text-sm mt-1">{errors.yourName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Memories (Optional)
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[120px] resize-none"
            placeholder="Share special memories, inside jokes, or details you'd like woven into the lyrics..."
            value={specialMemories}
            onChange={(e) => setSpecialMemories(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Things to Avoid (Optional)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Anything you'd like us to avoid mentioning?"
            value={thingsToAvoid}
            onChange={(e) => setThingsToAvoid(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-4 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Selections
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </div>
    </motion.div>
  )
}
