/**
 * Static decorative SVG elements for landing page sections.
 * No animations - just ambient visual warmth using brand colours.
 */

/** Gentle flowing wave lines with a radial glow. Used between "How It Works" and social proof. */
export function DecorWavesA() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]">
        <div className="absolute inset-0 bg-gradient-radial from-brand-500/8 via-purple-600/4 to-transparent rounded-full blur-3xl" />
      </div>
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none">
        <path d="M0 300 Q180 220, 360 300 T720 300 T1080 300 T1440 300" stroke="url(#dwa-g1)" strokeWidth="2" />
        <path d="M0 320 Q200 250, 400 320 T800 320 T1200 320 T1440 320" stroke="url(#dwa-g1)" strokeWidth="1.5" />
        <path d="M0 280 Q160 230, 320 280 T640 280 T960 280 T1280 280 T1440 280" stroke="url(#dwa-g1)" strokeWidth="1" />
        <defs>
          <linearGradient id="dwa-g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#e74c3c" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

/** Concentric rings and subtle glow. Used behind social proof / testimonials. */
export function DecorRings() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2 w-[600px] h-[600px]">
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/6 to-transparent rounded-full blur-3xl" />
      </div>
      <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none">
        <circle cx="1100" cy="300" r="80" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.3" />
        <circle cx="1100" cy="300" r="140" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.2" />
        <circle cx="1100" cy="300" r="200" stroke="#8b5cf6" strokeWidth="0.3" opacity="0.12" />
        <circle cx="300" cy="300" r="100" stroke="#e74c3c" strokeWidth="0.6" opacity="0.15" />
        <circle cx="300" cy="300" r="170" stroke="#e74c3c" strokeWidth="0.3" opacity="0.08" />
      </svg>
    </div>
  )
}

/** Diagonal flowing curves with coral accent. Used behind features / "Why SongSwipe" */
export function DecorCurves() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px]">
        <div className="absolute inset-0 bg-gradient-radial from-brand-500/6 to-transparent rounded-full blur-3xl" />
      </div>
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none">
        <path d="M-100 500 Q300 200, 700 350 Q1100 500, 1540 200" stroke="url(#dc-g1)" strokeWidth="2" />
        <path d="M-100 520 Q350 230, 750 370 Q1150 520, 1540 230" stroke="url(#dc-g1)" strokeWidth="1" />
        {/* Scattered note accents */}
        <g fill="#e74c3c" opacity="0.2">
          <path d="M200 180 L203 180 L203 190 A3.5 3.5 0 1 1 200 187 Z" />
          <path d="M1200 400 L1203 400 L1203 410 A3.5 3.5 0 1 1 1200 407 Z" />
        </g>
        <g fill="#8b5cf6" opacity="0.15">
          <path d="M800 150 L803 150 L803 160 A3.5 3.5 0 1 1 800 157 Z" />
        </g>
        <defs>
          <linearGradient id="dc-g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#e74c3c" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

/** Soft vertical wave lines with purple glow. Used behind pricing. */
export function DecorPricing() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/8 via-brand-500/4 to-transparent rounded-full blur-3xl" />
      </div>
      <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none">
        {/* Sweeping arcs */}
        <path d="M0 500 Q360 100, 720 300 Q1080 500, 1440 100" stroke="url(#dp-g1)" strokeWidth="1.5" />
        <path d="M0 520 Q380 130, 740 320 Q1100 520, 1440 130" stroke="url(#dp-g1)" strokeWidth="0.8" />
        {/* Sparkle dots */}
        <circle cx="400" cy="200" r="2" fill="#e74c3c" opacity="0.2" />
        <circle cx="1000" cy="350" r="2" fill="#8b5cf6" opacity="0.2" />
        <circle cx="720" cy="150" r="1.5" fill="#e74c3c" opacity="0.15" />
        <defs>
          <linearGradient id="dp-g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#e74c3c" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
