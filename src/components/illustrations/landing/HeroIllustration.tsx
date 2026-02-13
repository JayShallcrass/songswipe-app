'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneMockup from './PhoneMockup'
import { FormScreenshot, PlayerScreenshot } from './ScreenshotIllustrations'

import { ValentinesIllustration, BirthdayIllustration } from '@/components/illustrations/cards/OccasionIllustrations'
import { EpicIllustration } from '@/components/illustrations/cards/MoodIllustrations'
import { PopIllustration, JazzIllustration } from '@/components/illustrations/cards/GenreIllustrations'
import { BrightFemaleIllustration } from '@/components/illustrations/cards/VoiceIllustrations'

const showcaseCards = [
  { title: "Valentine's Day", description: 'Express your love', gradient: 'from-pink-500 to-rose-500', illustration: <ValentinesIllustration /> },
  { title: 'Pop', description: 'Modern and catchy', gradient: 'from-pink-500 to-purple-500', illustration: <PopIllustration /> },
  { title: 'Epic', description: 'Grand and powerful', gradient: 'from-indigo-600 to-purple-700', illustration: <EpicIllustration /> },
  { title: 'Birthday', description: 'Celebrate their day', gradient: 'from-amber-500 to-orange-500', illustration: <BirthdayIllustration /> },
  { title: 'Jazz', description: 'Smooth and sophisticated', gradient: 'from-indigo-500 to-blue-700', illustration: <JazzIllustration /> },
  { title: 'Bright Female', description: 'Clear soprano, energetic', gradient: 'from-pink-500 to-rose-600', illustration: <BrightFemaleIllustration /> },
]

export default function HeroPhoneMockups() {
  const [activeIndex, setActiveIndex] = useState(0)

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % showcaseCards.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(advance, 3000)
    return () => clearInterval(timer)
  }, [advance])

  const card = showcaseCards[activeIndex]

  return (
    <div className="relative flex justify-center items-center py-4 select-none">
      {/* Left phone - form */}
      <div className="hidden lg:block absolute -left-12 xl:left-0 top-12 opacity-50">
        <PhoneMockup size="sm" rotation={-6}>
          <FormScreenshot />
        </PhoneMockup>
      </div>

      {/* Center phone - rotating swipe cards */}
      <div className="relative z-10 cursor-pointer" onClick={advance}>
        <PhoneMockup size="md">
          <div className="w-full h-full bg-surface-DEFAULT flex flex-col items-center justify-center p-4">
            {/* Stage title */}
            <p className="text-xs font-semibold text-white/60 mb-0.5 tracking-wide">PICK YOUR VIBE</p>
            <p className="text-[10px] text-white/30 mb-3">Tap to browse</p>

            {/* Animated card */}
            <div className="w-full flex-1 relative overflow-hidden rounded-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ x: 120, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -120, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-xl flex flex-col items-center justify-center overflow-hidden`}
                >
                  <div className="absolute inset-0 pointer-events-none">
                    {card.illustration}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-transparent" />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <p className="text-white font-bold text-lg mb-1">{card.title}</p>
                    <p className="text-white/70 text-xs">{card.description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mt-3 mb-1">
              {showcaseCards.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-brand-500 scale-125' : 'bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </PhoneMockup>
      </div>

      {/* Right phone - player */}
      <div className="hidden lg:block absolute -right-12 xl:right-0 top-12 opacity-50">
        <PhoneMockup size="sm" rotation={6}>
          <PlayerScreenshot />
        </PhoneMockup>
      </div>
    </div>
  )
}
