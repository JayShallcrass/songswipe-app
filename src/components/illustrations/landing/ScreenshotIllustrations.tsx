/**
 * Simplified SVG representations of app screens.
 * Used inside PhoneMockup for landing page product imagery.
 */

/** Swipe card interface - shows a gradient card with progress dots */
export function SwipeScreenshot() {
  return (
    <div className="w-full h-full bg-surface-DEFAULT flex flex-col items-center justify-center p-3">
      {/* Stage title */}
      <div className="w-3/4 h-2 bg-white/10 rounded-full mb-1" />
      <div className="w-1/2 h-1.5 bg-white/5 rounded-full mb-3" />

      {/* Card preview */}
      <div className="w-full aspect-[4/5] rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Illustration hint */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20">
          <path d="M50 35 C50 25, 40 18, 35 24 C30 30, 32 35, 50 50 C68 35, 70 30, 65 24 C60 18, 50 25, 50 35Z" fill="white" />
          <circle cx="25" cy="55" r="8" fill="white" opacity="0.3" />
          <circle cx="75" cy="45" r="10" fill="white" opacity="0.2" />
        </svg>
        {/* Icon placeholder */}
        <div className="relative z-10 w-6 h-6 rounded-full bg-white/20 mb-2" />
        {/* Text lines */}
        <div className="relative z-10 w-2/3 h-2 bg-white/40 rounded-full mb-1" />
        <div className="relative z-10 w-1/2 h-1.5 bg-white/25 rounded-full" />
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mt-3">
        <div className="w-2 h-2 rounded-full bg-brand-500" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-white/20" />
      </div>
    </div>
  )
}

/** Personalisation form - form fields sketch */
export function FormScreenshot() {
  return (
    <div className="w-full h-full bg-surface-DEFAULT flex flex-col p-3 gap-2.5">
      {/* Header */}
      <div className="w-2/3 h-2 bg-white/10 rounded-full" />
      <div className="w-1/2 h-1.5 bg-white/5 rounded-full mb-1" />

      {/* Form fields */}
      {['Their Name', 'Your Message', 'Special Memories'].map((_, i) => (
        <div key={i} className="w-full">
          <div className="w-1/3 h-1 bg-white/8 rounded-full mb-1" />
          <div className={`w-full ${i === 1 ? 'h-10' : 'h-5'} bg-surface-50 border border-surface-200 rounded-lg`} />
        </div>
      ))}

      {/* Submit button */}
      <div className="w-full h-6 bg-gradient-to-r from-brand-500 to-purple-600 rounded-full mt-auto" />
    </div>
  )
}

/** Song player with waveform */
export function PlayerScreenshot() {
  return (
    <div className="w-full h-full bg-surface-DEFAULT flex flex-col items-center justify-center p-3">
      {/* Album art */}
      <div className="w-4/5 aspect-square rounded-xl bg-gradient-to-br from-purple-600 to-brand-500 mb-3 flex items-center justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-15">
          <circle cx="50" cy="50" r="35" stroke="white" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="0.5" fill="none" />
          <circle cx="50" cy="50" r="8" fill="white" opacity="0.3" />
        </svg>
        {/* Play icon */}
        <div className="relative z-10 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5" />
        </div>
      </div>

      {/* Song title */}
      <div className="w-3/4 h-2 bg-white/15 rounded-full mb-1" />
      <div className="w-1/2 h-1.5 bg-white/8 rounded-full mb-3" />

      {/* Waveform */}
      <div className="w-full flex items-end justify-center gap-[2px] h-6">
        {[3, 8, 5, 12, 7, 15, 10, 6, 13, 8, 4, 11, 7, 14, 9, 5, 10, 6, 8, 3].map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full ${i < 8 ? 'bg-brand-500' : 'bg-white/15'}`}
            style={{ height: h }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/10 rounded-full mt-2">
        <div className="w-2/5 h-full bg-brand-500 rounded-full" />
      </div>
    </div>
  )
}
