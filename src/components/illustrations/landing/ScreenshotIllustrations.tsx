'use client'

import { ValentinesIllustration } from '@/components/illustrations/cards/OccasionIllustrations'
import { EpicIllustration } from '@/components/illustrations/cards/MoodIllustrations'

/**
 * Realistic app screen representations for use inside PhoneMockup.
 */

/** Swipe card interface - shows a real gradient card with illustration */
export function SwipeScreenshot() {
  return (
    <div className="w-full h-full bg-surface-DEFAULT flex flex-col items-center justify-center p-3">
      {/* Stage title */}
      <p className="text-[8px] font-semibold text-white/50 mb-0.5 tracking-wide uppercase">What&apos;s the occasion?</p>
      <p className="text-[7px] text-white/25 mb-2">Browse and pick your favourite</p>

      {/* Card preview - real gradient + illustration */}
      <div className="w-full flex-1 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Real illustration */}
        <div className="absolute inset-0 pointer-events-none">
          <ValentinesIllustration />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-transparent" />

        {/* Card content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <svg className="w-5 h-5 text-white mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <p className="text-white font-bold text-[10px]">Valentine&apos;s Day</p>
          <p className="text-white/70 text-[7px]">Express your love</p>
        </div>

        {/* Audio button */}
        <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[4px] border-l-white border-y-[3px] border-y-transparent ml-0.5" />
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
      </div>
    </div>
  )
}

/** Personalisation form - realistic form layout */
export function FormScreenshot() {
  return (
    <div className="w-full h-full bg-surface-DEFAULT flex flex-col p-3 gap-1.5">
      {/* Header */}
      <p className="text-[8px] font-semibold text-white/50 tracking-wide uppercase">Personalise Your Song</p>
      <p className="text-[6px] text-white/25 mb-1">Tell us about them</p>

      {/* Form fields */}
      <div className="w-full">
        <p className="text-[6px] text-white/30 mb-0.5">Their Name</p>
        <div className="w-full h-4 bg-surface-50 border border-surface-200 rounded-md flex items-center px-1.5">
          <p className="text-[6px] text-white/40">Sarah</p>
        </div>
      </div>
      <div className="w-full">
        <p className="text-[6px] text-white/30 mb-0.5">Your Relationship</p>
        <div className="w-full h-4 bg-surface-50 border border-surface-200 rounded-md flex items-center px-1.5">
          <p className="text-[6px] text-white/40">Partner</p>
        </div>
      </div>
      <div className="w-full">
        <p className="text-[6px] text-white/30 mb-0.5">Special Memories</p>
        <div className="w-full h-8 bg-surface-50 border border-surface-200 rounded-md flex items-start p-1.5">
          <p className="text-[6px] text-white/30 leading-tight">Our first trip to Paris, the cafe on Rue...</p>
        </div>
      </div>
      <div className="w-full">
        <p className="text-[6px] text-white/30 mb-0.5">Your Message</p>
        <div className="w-full h-6 bg-surface-50 border border-surface-200 rounded-md flex items-start p-1.5">
          <p className="text-[6px] text-white/30 leading-tight">You make every day better...</p>
        </div>
      </div>

      {/* Submit button */}
      <div className="w-full h-5 bg-gradient-to-r from-brand-500 to-purple-600 rounded-full mt-auto flex items-center justify-center">
        <p className="text-[7px] font-semibold text-white">Generate Song</p>
      </div>
    </div>
  )
}

/** Song player with waveform - realistic player */
export function PlayerScreenshot() {
  return (
    <div className="w-full h-full bg-surface-DEFAULT flex flex-col items-center justify-center p-3">
      {/* Album art with real illustration */}
      <div className="w-4/5 aspect-square rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 mb-2 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <EpicIllustration />
        </div>
        <div className="absolute inset-0 bg-black/10" />
        {/* Play icon */}
        <div className="relative z-10 w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
          <div className="w-0 h-0 border-l-[7px] border-l-white border-y-[5px] border-y-transparent ml-0.5" />
        </div>
      </div>

      {/* Song title */}
      <p className="text-[9px] font-semibold text-white/80 mb-0.5">A Song for Sarah</p>
      <p className="text-[7px] text-white/35 mb-2">Epic / Orchestral</p>

      {/* Waveform */}
      <div className="w-full flex items-end justify-center gap-[1.5px] h-5">
        {[3, 7, 5, 11, 6, 14, 9, 5, 12, 7, 4, 10, 6, 13, 8, 5, 9, 6, 7, 3, 8, 5, 11, 4].map((h, i) => (
          <div
            key={i}
            className={`w-[2.5px] rounded-full ${i < 10 ? 'bg-brand-500' : 'bg-white/15'}`}
            style={{ height: h }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-[3px] bg-white/10 rounded-full mt-1.5">
        <div className="w-[42%] h-full bg-brand-500 rounded-full" />
      </div>

      {/* Time */}
      <div className="w-full flex justify-between mt-0.5">
        <p className="text-[6px] text-white/25">0:48</p>
        <p className="text-[6px] text-white/25">1:52</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-1">
        <svg className="w-3 h-3 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V7.19c0-1.44-1.555-2.343-2.805-1.628L12 9.53v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" /></svg>
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
          <svg className="w-3 h-3 text-surface-DEFAULT" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
        </div>
        <svg className="w-3 h-3 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v9.624c0 1.44 1.555 2.343 2.805 1.628L12 15.97v2.341c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 8.56C13.555 7.846 12 8.75 12 10.19v2.34L5.055 8.56z" /></svg>
      </div>
    </div>
  )
}
