'use client'

import { useState } from 'react'
import { customizationSchema, type Customization } from '@/lib/elevenlabs'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const occasions = [
  { value: 'valentines', label: "Valentine's Day", icon: '💕' },
  { value: 'birthday', label: 'Birthday', icon: '🎂' },
  { value: 'anniversary', label: 'Anniversary', icon: '💍' },
  { value: 'wedding', label: 'Wedding', icon: '👰' },
  { value: 'graduation', label: 'Graduation', icon: '🎓' },
  { value: 'just-because', label: 'Just Because', icon: '✨' },
]

const moods = [
  { value: 'romantic', label: 'Romantic' },
  { value: 'happy', label: 'Happy' },
  { value: 'funny', label: 'Funny' },
  { value: 'nostalgic', label: 'Nostalgic' },
  { value: 'epic', label: 'Epic' },
]

const genres = [
  { value: 'pop', label: 'Pop', icon: '🎵' },
  { value: 'acoustic', label: 'Acoustic', icon: '🎸' },
  { value: 'electronic', label: 'Electronic', icon: '🎹' },
  { value: 'orchestral', label: 'Orchestral', icon: '🎻' },
  { value: 'jazz', label: 'Jazz', icon: '🎷' },
]

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<Customization>>({
    mood: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const updateField = (field: keyof Customization, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const toggleMood = (mood: string) => {
    const currentMoods = formData.mood || []
    if (currentMoods.includes(mood as never)) {
      updateField('mood', currentMoods.filter(m => m !== mood))
    } else {
      updateField('mood', [...currentMoods, mood as never])
    }
  }

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.recipientName?.trim()) newErrors.recipientName = 'Recipient name is required'
      if (!formData.yourName?.trim()) newErrors.yourName = 'Your name is required'
    }

    if (currentStep === 2) {
      if (!formData.occasion) newErrors.occasion = 'Please select an occasion'
      if (!formData.songLength) newErrors.songLength = 'Please select a song length'
    }

    if (currentStep === 3) {
      if (!formData.mood?.length) newErrors.mood = 'Select at least one mood'
      if (!formData.genre) newErrors.genre = 'Please select a genre'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsLoading(true)
    try {
      // Check authentication - require user to be signed in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/')
        return
      }

      // Create customization record and redirect to payment
      const response = await fetch('/api/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create customization')
      }

      const { customizationId, checkoutUrl } = await response.json()
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Step 1: Names */}
        {step === 1 && (
          <div className="card animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Who's this song for?</h1>
            <p className="text-gray-600 mb-8">Tell us about the special person</p>

            <div className="space-y-6">
              <div>
                <label className="label">Recipient's Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Sarah"
                  value={formData.recipientName || ''}
                  onChange={(e) => updateField('recipientName', e.target.value)}
                />
                {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>}
              </div>

              <div>
                <label className="label">Your Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., John"
                  value={formData.yourName || ''}
                  onChange={(e) => updateField('yourName', e.target.value)}
                />
                {errors.yourName && <p className="text-red-500 text-sm mt-1">{errors.yourName}</p>}
              </div>

              <button 
                onClick={handleNext}
                className="btn-primary w-full mt-4"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Occasion & Length */}
        {step === 2 && (
          <div className="card animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">What's the occasion?</h1>
            <p className="text-gray-600 mb-8">Help us set the right mood</p>

            <div className="space-y-8">
              {/* Occasion Selection */}
              <div>
                <label className="label">Select Occasion *</label>
                <div className="grid grid-cols-2 gap-3">
                  {occasions.map((occasion) => (
                    <button
                      key={occasion.value}
                      onClick={() => updateField('occasion', occasion.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.occasion === occasion.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{occasion.icon}</span>
                      <span className="font-medium">{occasion.label}</span>
                    </button>
                  ))}
                </div>
                {errors.occasion && <p className="text-red-500 text-sm mt-1">{errors.occasion}</p>}
              </div>

              {/* Song Length */}
              <div>
                <label className="label">Song Length *</label>
                <div className="flex gap-3">
                  {['60', '90', '120'].map((length) => (
                    <button
                      key={length}
                      onClick={() => updateField('songLength', length)}
                      className={`flex-1 py-4 rounded-xl border-2 font-medium transition-all ${
                        formData.songLength === length
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {length}s
                    </button>
                  ))}
                </div>
                {errors.songLength && <p className="text-red-500 text-sm mt-1">{errors.songLength}</p>}
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 py-4 text-gray-600">
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  className="flex-1 btn-primary"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Mood & Genre */}
        {step === 3 && (
          <div className="card animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Set the style</h1>
            <p className="text-gray-600 mb-8">Choose the mood and genre for your song</p>

            <div className="space-y-8">
              {/* Mood Selection */}
              <div>
                <label className="label">Select Moods *</label>
                <div className="flex flex-wrap gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => toggleMood(mood.value)}
                      className={`checkbox-chip ${
                        formData.mood?.includes(mood.value as never) ? 'selected' : ''
                      }`}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
                {errors.mood && <p className="text-red-500 text-sm mt-1">{errors.mood}</p>}
              </div>

              {/* Genre Selection */}
              <div>
                <label className="label">Select Genre *</label>
                <div className="grid grid-cols-5 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre.value}
                      onClick={() => updateField('genre', genre.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.genre === genre.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{genre.icon}</span>
                      <span className="text-sm font-medium">{genre.label}</span>
                    </button>
                  ))}
                </div>
                {errors.genre && <p className="text-red-500 text-sm mt-1">{errors.genre}</p>}
              </div>

              {/* Optional Fields */}
              <div>
                <label className="label">Special Memories (Optional)</label>
                <textarea
                  className="input min-h-[100px] resize-none"
                  placeholder="e.g., Our first date at that coffee shop, the time we got lost in Tokyo..."
                  value={formData.specialMemories || ''}
                  onChange={(e) => updateField('specialMemories', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Things to Avoid (Optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Any mention of ex-partners, certain phrases..."
                  value={formData.thingsToAvoid || ''}
                  onChange={(e) => updateField('thingsToAvoid', e.target.value)}
                />
              </div>

              {/* Summary */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Your Song Summary</h3>
                <div className="text-sm text-purple-700 space-y-1">
                  <p><strong>For:</strong> {formData.recipientName} from {formData.yourName}</p>
                  <p><strong>Occasion:</strong> {occasions.find(o => o.value === formData.occasion)?.label}</p>
                  <p><strong>Style:</strong> {formData.mood?.join(', ')} {formData.genre}</p>
                  <p><strong>Price:</strong> £7.99</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 py-4 text-gray-600">
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 btn-primary"
                >
                  {isLoading ? 'Processing...' : 'Continue to Payment - £7.99'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
