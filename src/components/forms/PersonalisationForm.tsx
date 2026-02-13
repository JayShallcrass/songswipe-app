'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { occasionQuestions } from '@/lib/elevenlabs'
import { universalPromptCategories } from '@/lib/promptCategories'
import { AccordionSection } from './AccordionSection'
import { PromptCategory } from './PromptCategory'

export interface PersonalisationData {
  recipientName: string
  pronunciation: string
  yourName: string
  specialMemories: string
  thingsToAvoid: string
  occasionDate: string
  songLength: string
  language: string
  tempo: string
  relationship: string
}

interface PersonalisationFormProps {
  onSubmit: (data: PersonalisationData) => void
  onBack: () => void
  isLoading: boolean
  selections: Record<string, string>
}

interface CacheData extends Omit<PersonalisationData, 'specialMemories'> {
  pronunciation: string
  promptAnswers: Record<string, string>
  freeformMemories: string
}

const CACHE_KEY = 'songswipe_personalisation'

export function clearPersonalisationCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // localStorage unavailable
  }
}

function loadCache(): Partial<CacheData> {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // localStorage unavailable
  }
  return {}
}

function saveCache(data: CacheData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable
  }
}

function buildSpecialMemories(promptAnswers: Record<string, string>, freeformMemories: string): string {
  const parts: string[] = []

  for (const [question, answer] of Object.entries(promptAnswers)) {
    const trimmed = answer.trim()
    if (trimmed) {
      parts.push(`${question} ${trimmed}`)
    }
  }

  const freeform = freeformMemories.trim()
  if (freeform) {
    parts.push(freeform)
  }

  return parts.join('\n\n')
}

export function PersonalisationForm({
  onSubmit,
  onBack,
  isLoading,
  selections,
}: PersonalisationFormProps) {
  const [recipientName, setRecipientName] = useState('')
  const [pronunciation, setPronunciation] = useState('')
  const [yourName, setYourName] = useState('')
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({})
  const [activePrompts, setActivePrompts] = useState<Set<string>>(new Set())
  const [freeformMemories, setFreeformMemories] = useState('')
  const [thingsToAvoid, setThingsToAvoid] = useState('')
  const [occasionDate, setOccasionDate] = useState('')
  const [songLength, setSongLength] = useState('90')
  const [language, setLanguage] = useState('en-GB')
  const [tempo, setTempo] = useState('mid-tempo')
  const [relationship, setRelationship] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Hydrate from localStorage on mount
  useEffect(() => {
    const cached = loadCache()
    if (cached.recipientName) setRecipientName(cached.recipientName)
    if (cached.pronunciation) setPronunciation(cached.pronunciation)
    if (cached.yourName) setYourName(cached.yourName)
    if (cached.promptAnswers) {
      setPromptAnswers(cached.promptAnswers)
      setActivePrompts(new Set(Object.keys(cached.promptAnswers)))
    }
    if (cached.freeformMemories) setFreeformMemories(cached.freeformMemories)
    if (cached.thingsToAvoid) setThingsToAvoid(cached.thingsToAvoid)
    if (cached.occasionDate) setOccasionDate(cached.occasionDate)
    if (cached.songLength) setSongLength(cached.songLength)
    if (cached.language) setLanguage(cached.language)
    if (cached.tempo) setTempo(cached.tempo)
    if (cached.relationship) setRelationship(cached.relationship)
  }, [])

  // Save to localStorage on every field change
  useEffect(() => {
    saveCache({
      recipientName,
      pronunciation,
      yourName,
      promptAnswers,
      freeformMemories,
      thingsToAvoid,
      occasionDate,
      songLength,
      language,
      tempo,
      relationship,
    })
  }, [recipientName, pronunciation, yourName, promptAnswers, freeformMemories, thingsToAvoid, occasionDate, songLength, language, tempo, relationship])

  // Get suggestion chips for the selected occasion
  const occasion = selections.occasion || ''
  const suggestions = occasionQuestions[occasion] || []

  const handleTogglePrompt = (question: string) => {
    setActivePrompts((prev) => {
      const next = new Set(prev)
      if (next.has(question)) {
        next.delete(question)
        // Clear the answer when deactivating
        setPromptAnswers((pa) => {
          const updated = { ...pa }
          delete updated[question]
          return updated
        })
      } else {
        next.add(question)
      }
      return next
    })
  }

  const handlePromptAnswerChange = (question: string, value: string) => {
    setPromptAnswers((prev) => ({ ...prev, [question]: value }))
  }

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
      pronunciation,
      yourName,
      specialMemories: buildSpecialMemories(promptAnswers, freeformMemories),
      thingsToAvoid,
      occasionDate,
      songLength,
      language,
      tempo,
      relationship,
    })
  }

  const formatLabel = (value: string): string => {
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
      className="bg-surface-50 border border-surface-200 rounded-2xl p-4 sm:p-6 md:p-8"
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-white">Tell us about them</h1>
      <p className="text-zinc-400 mb-4 sm:mb-8 text-sm sm:text-base">Add personal details to make your song special</p>

      {/* Song summary banner - always visible */}
      <div className="bg-brand-500/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="font-semibold text-brand-400 mb-2">Your Song Summary</h3>
        <div className="text-sm text-brand-300 space-y-1">
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

      {/* Required fields - always visible */}
      <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Recipient&apos;s Name *
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Pronounced as <span className="text-zinc-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="e.g., Ay-mee (for Amiee)"
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
            disabled={isLoading}
            maxLength={100}
          />
          <p className="text-xs text-zinc-500 mt-1">
            Help us get the name right in the song
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="e.g., John"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            disabled={isLoading}
          />
          {errors.yourName && (
            <p className="text-red-500 text-sm mt-1">{errors.yourName}</p>
          )}
        </div>
      </div>

      {/* Accordion sections */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-8">
        {/* Song Details - collapsed by default */}
        <AccordionSection title="Song Details">
          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Your relationship to {recipientName || 'them'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'partner', label: 'Partner' },
                { id: 'friend', label: 'Friend' },
                { id: 'family', label: 'Family' },
                { id: 'colleague', label: 'Colleague' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRelationship(opt.id)}
                  disabled={isLoading}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all border ${
                    relationship === opt.id
                      ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                      : 'bg-surface-100 border-surface-300 text-zinc-300 hover:border-brand-500/50 hover:bg-surface-100'
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Song Length */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Song length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '60', label: '1 min', desc: 'Short & sweet' },
                { id: '90', label: '1.5 min', desc: 'Just right' },
                { id: '120', label: '2 min', desc: 'Full song' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSongLength(opt.id)}
                  disabled={isLoading}
                  className={`py-3 px-3 rounded-lg text-center transition-all border ${
                    songLength === opt.id
                      ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                      : 'bg-surface-100 border-surface-300 text-zinc-300 hover:border-brand-500/50 hover:bg-surface-100'
                  } disabled:opacity-50`}
                >
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Language & accent
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <optgroup label="English">
                <option value="en-GB">English (British)</option>
                <option value="en-GB-SCT">English (Scottish)</option>
                <option value="en-GB-WLS">English (Welsh)</option>
                <option value="en-IE">English (Irish)</option>
                <option value="en-US">English (American)</option>
                <option value="en-US-S">English (Southern US)</option>
              </optgroup>
              <optgroup label="Other Languages">
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </optgroup>
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              This influences the vocal accent and any generated lyrics
            </p>
          </div>

          {/* Tempo */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Tempo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'slow', label: 'Slow & Gentle', bpm: '~70 BPM' },
                { id: 'mid-tempo', label: 'Mid-Tempo', bpm: '~100 BPM' },
                { id: 'upbeat', label: 'Upbeat', bpm: '~120 BPM' },
                { id: 'high-energy', label: 'High Energy', bpm: '~140 BPM' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTempo(opt.id)}
                  disabled={isLoading}
                  className={`py-2.5 px-3 rounded-lg text-center transition-all border ${
                    tempo === opt.id
                      ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                      : 'bg-surface-100 border-surface-300 text-zinc-300 hover:border-brand-500/50 hover:bg-surface-100'
                  } disabled:opacity-50`}
                >
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-zinc-500">{opt.bpm}</div>
                </button>
              ))}
            </div>
          </div>
        </AccordionSection>

        {/* Special Memories - expanded by default */}
        <AccordionSection title="Special Memories" defaultOpen>
          <p className="text-sm text-zinc-500">
            Tap a prompt to answer it, or write your own below
          </p>

          {/* Occasion-specific prompt chips */}
          {suggestions.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {suggestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => handleTogglePrompt(question)}
                    disabled={isLoading}
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

              {/* Animated inputs for active occasion prompts */}
              <AnimatePresence>
                {suggestions
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
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-brand-400 mb-1">
                          {question}
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          placeholder="Type your answer..."
                          value={promptAnswers[question] || ''}
                          onChange={(e) => handlePromptAnswerChange(question, e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}

          {/* Universal prompt categories */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Browse more prompts
            </p>
            {universalPromptCategories.map((category) => (
              <PromptCategory
                key={category.id}
                category={category}
                activePrompts={activePrompts}
                promptAnswers={promptAnswers}
                onTogglePrompt={handleTogglePrompt}
                onAnswerChange={handlePromptAnswerChange}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Freeform textarea - always visible */}
          <textarea
            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-h-[100px] resize-none"
            placeholder="Anything else? Share memories, inside jokes, or details you'd like woven into the lyrics..."
            value={freeformMemories}
            onChange={(e) => setFreeformMemories(e.target.value)}
            disabled={isLoading}
          />
        </AccordionSection>

        {/* Additional Options - collapsed by default */}
        <AccordionSection title="Additional Options">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Things to Avoid (Optional)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Anything you'd like us to avoid mentioning?"
              value={thingsToAvoid}
              onChange={(e) => setThingsToAvoid(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Occasion Date (Optional)
            </label>
            <p className="text-sm text-zinc-500 mb-2">We&apos;ll send you a reminder next year</p>
            <input
              type="date"
              className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              value={occasionDate}
              onChange={(e) => setOccasionDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </AccordionSection>
      </div>

      {/* Action buttons - always visible */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-3 sm:py-4 text-zinc-400 hover:text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Selections
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-brand-500 to-amber-500 text-white rounded-full font-semibold hover:from-brand-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </div>
    </motion.div>
  )
}
