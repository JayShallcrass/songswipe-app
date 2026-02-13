/**
 * Static decorative SVG elements for landing page sections.
 * Pure SVG paths only - no blur filters, no heavy CSS effects.
 */

/** Gentle flowing wave lines. Used behind "How It Works". */
export function DecorWavesA() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <path d="M0 300 Q180 220, 360 300 T720 300 T1080 300 T1440 300" stroke="url(#dwa-g)" strokeWidth="2" />
      <path d="M0 320 Q200 250, 400 320 T800 320 T1200 320 T1440 320" stroke="url(#dwa-g)" strokeWidth="1.5" />
      <path d="M0 280 Q160 230, 320 280 T640 280 T960 280 T1280 280 T1440 280" stroke="url(#dwa-g)" strokeWidth="1" />
      <defs>
        <linearGradient id="dwa-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e74c3c" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#e74c3c" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** Concentric rings. Used behind social proof. */
export function DecorRings() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <circle cx="1100" cy="300" r="80" stroke="#8b5cf6" strokeWidth="0.8" />
      <circle cx="1100" cy="300" r="140" stroke="#8b5cf6" strokeWidth="0.5" />
      <circle cx="1100" cy="300" r="200" stroke="#8b5cf6" strokeWidth="0.3" />
      <circle cx="300" cy="300" r="100" stroke="#e74c3c" strokeWidth="0.6" />
      <circle cx="300" cy="300" r="170" stroke="#e74c3c" strokeWidth="0.3" />
    </svg>
  )
}

/** Diagonal flowing curves. Used behind features. */
export function DecorCurves() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <path d="M-100 500 Q300 200, 700 350 Q1100 500, 1540 200" stroke="url(#dc-g)" strokeWidth="2" />
      <path d="M-100 520 Q350 230, 750 370 Q1150 520, 1540 230" stroke="url(#dc-g)" strokeWidth="1" />
      <defs>
        <linearGradient id="dc-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#e74c3c" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** Sweeping arcs. Used behind pricing. */
export function DecorPricing() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <path d="M0 500 Q360 100, 720 300 Q1080 500, 1440 100" stroke="url(#dp-g)" strokeWidth="1.5" />
      <path d="M0 520 Q380 130, 740 320 Q1100 520, 1440 130" stroke="url(#dp-g)" strokeWidth="0.8" />
      <defs>
        <linearGradient id="dp-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e74c3c" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#e74c3c" />
        </linearGradient>
      </defs>
    </svg>
  )
}
