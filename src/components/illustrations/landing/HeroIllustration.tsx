'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneMockup from './PhoneMockup'
import { FormScreenshot, PlayerScreenshot } from './ScreenshotIllustrations'

// Real card data for the rotating showcase
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

/**
 * Hero phone mockups with a live-rotating swipe card carousel in the center phone.
 */
export default function HeroPhoneMockups() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const advance = useCallback(() => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % showcaseCards.length)
  }, [])

  // Auto-rotate every 3s
  useEffect(() => {
    const timer = setInterval(advance, 3000)
    return () => clearInterval(timer)
  }, [advance])

  const handleTap = () => {
    advance()
  }

  const card = showcaseCards[activeIndex]

  return (
    <div className="relative w-full flex justify-center items-center py-8 select-none">
      {/* Left phone - form */}
      <div className="hidden md:block absolute -left-4 lg:left-8 top-8 opacity-60">
        <PhoneMockup size="sm" rotation={-8}>
          <FormScreenshot />
        </PhoneMockup>
      </div>

      {/* Center phone - rotating swipe cards */}
      <div className="relative z-10 cursor-pointer" onClick={handleTap}>
        <PhoneMockup size="md" rotation={0}>
          <div className="w-full h-full bg-surface-DEFAULT flex flex-col items-center justify-center p-3">
            {/* Stage title */}
            <p className="text-[9px] font-semibold text-white/60 mb-0.5 tracking-wide">PICK YOUR VIBE</p>
            <p className="text-[7px] text-white/30 mb-2">Tap to browse</p>

            {/* Animated card */}
            <div className="w-full flex-1 relative overflow-hidden rounded-xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  initial={{ x: direction * 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction * -100, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-xl flex flex-col items-center justify-center overflow-hidden`}
                >
                  {/* Illustration background */}
                  <div className="absolute inset-0 pointer-events-none">
                    {card.illustration}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-transparent" />

                  {/* Card content */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <p className="text-white font-bold text-sm mb-0.5">{card.title}</p>
                    <p className="text-white/70 text-[8px]">{card.description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5 mt-2.5 mb-1">
              {showcaseCards.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-brand-500 scale-125' : 'bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </PhoneMockup>
      </div>

      {/* Right phone - player */}
      <div className="hidden md:block absolute -right-4 lg:right-8 top-8 opacity-60">
        <PhoneMockup size="sm" rotation={8}>
          <PlayerScreenshot />
        </PhoneMockup>
      </div>
    </div>
  )
}
