'use client'

import PhoneMockup from './PhoneMockup'
import { SwipeScreenshot, FormScreenshot, PlayerScreenshot } from './ScreenshotIllustrations'

/**
 * Hero phone mockups showing the swipe flow.
 * Renders 3 overlapping, angled phone mockups.
 */
export default function HeroPhoneMockups() {
  return (
    <div className="relative w-full flex justify-center items-center py-8 pointer-events-none select-none" aria-hidden="true">
      {/* Left phone - form */}
      <div className="hidden md:block absolute -left-4 lg:left-8 top-8 opacity-60">
        <PhoneMockup size="sm" rotation={-8}>
          <FormScreenshot />
        </PhoneMockup>
      </div>

      {/* Center phone - swipe cards (hero) */}
      <div className="relative z-10">
        <PhoneMockup size="md" rotation={0}>
          <SwipeScreenshot />
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
