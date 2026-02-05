'use client'

import { useState, useEffect } from 'react'
import { customizationSchema, type Customization } from '@/lib/elevenlabs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

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

export default function CustomizePage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<Customization>>({
    mood: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Initialize Supabase client on mount
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      setSupabase(createBrowserClient(url, key))
    }
  }, [])

  const updateField = (field: keyof Customization, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/customize')
        return
      }

      const response = await fetch('/api/customize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create customization')
      }

      const { customizationId, checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* App Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SongSwipe
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
              My Songs
            </Link>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="text-gray-500 hover:text-gray-700 text-sm">
                Sign Out
              </button>
            </form>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Step 1: Names */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Who's this song for?</h1>
            <p className="text-gray-600 mb-8">Tell us about the special person</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient's Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Sarah"
                  value={formData.recipientName || ''}
                  onChange={(e) => updateField('recipientName', e.target.value)}
                />
                {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., John"
                  value={formData.yourName || ''}
                  onChange={(e) => updateField('yourName', e.target.value)}
                />
                {errors.yourName && <p className="text-red-500 text-sm mt-1">{errors.yourName}</p>}
              </div>

              <button 
                onClick={handleNext}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Occasion & Length */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">What's the occasion?</h1>
            <p className="text-gray-600 mb-8">Help us set the right mood</p>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Occasion *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Song Length *</label>
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
                <button onClick={handleNext} className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all">
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Mood & Genre */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Set the style</h1>
            <p className="text-gray-600 mb-8">Choose the mood and genre for your song</p>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Moods *</label>
                <div className="flex flex-wrap gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => toggleMood(mood.value)}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        formData.mood?.includes(mood.value as never) 
                          ? 'border-purple-500 bg-purple-100 text-purple-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
                {errors.mood && <p className="text-red-500 text-sm mt-1">{errors.mood}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Genre *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Memories (Optional)</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[100px] resize-none"
                  placeholder="e.g., Our first date at that coffee shop..."
                  value={formData.specialMemories || ''}
                  onChange={(e) => updateField('specialMemories', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Things to Avoid (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Any mention of ex-partners..."
                  value={formData.thingsToAvoid || ''}
                  onChange={(e) => updateField('thingsToAvoid', e.target.value)}
                />
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Your Song Summary</h3>
                <div className="text-sm text-purple-700 space-y-1">
                  <p><strong>For:</strong> {formData.recipientName} from {formData.yourName}</p>
                  <p><strong>Occasion:</strong> {occasions.find(o => o.value === formData.occasion)?.label}</p>
                  <p><strong>Style:</strong> {formData.mood?.join(', ')} {formData.genre}</p>
                  <p className="text-lg font-bold mt-2">Price: £7.99</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 py-4 text-gray-600">
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  {isLoading ? 'Processing...' : 'Continue to Payment - £7.99'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
