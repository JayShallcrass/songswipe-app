'use client'

/**
 * Animated hero background with sound waves, musical notes, and warm accent lighting.
 * Only used in the hero section. For page-wide decorative elements, see PageBackground.
 */
export default function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Radial glow - orange/amber center (SVG, no CSS blur) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="hero-glow-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-glow-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="720" cy="400" rx="500" ry="350" fill="url(#hero-glow-1)" />
        <ellipse cx="900" cy="280" rx="300" ry="220" fill="url(#hero-glow-2)" />
      </svg>

      {/* Sound waves SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Flowing sound wave lines */}
        <path
          d="M0 400 Q 180 300, 360 400 T 720 400 T 1080 400 T 1440 400"
          stroke="url(#hero-wave-grad)"
          strokeWidth="2"
          className="animate-hero-wave-1"
        />
        <path
          d="M0 420 Q 200 340, 400 420 T 800 420 T 1200 420 T 1440 420"
          stroke="url(#hero-wave-grad)"
          strokeWidth="1.5"
          className="animate-hero-wave-2"
        />
        <path
          d="M0 380 Q 160 310, 320 380 T 640 380 T 960 380 T 1280 380 T 1440 380"
          stroke="url(#hero-wave-grad)"
          strokeWidth="1"
          className="animate-hero-wave-3"
        />

        {/* Equaliser bars - left cluster */}
        {[200, 220, 240, 260, 280].map((x, i) => {
          const heights = [40, 70, 55, 80, 35]
          return (
            <rect
              key={`eq-l-${i}`}
              x={x}
              y={500 - heights[i]}
              width="8"
              height={heights[i]}
              rx="4"
              fill="url(#hero-bar-grad)"
              className="animate-hero-eq origin-bottom"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          )
        })}

        {/* Equaliser bars - right cluster */}
        {[1140, 1160, 1180, 1200, 1220].map((x, i) => {
          const heights = [35, 60, 45, 75, 50]
          return (
            <rect
              key={`eq-r-${i}`}
              x={x}
              y={500 - heights[i]}
              width="8"
              height={heights[i]}
              rx="4"
              fill="url(#hero-bar-grad)"
              className="animate-hero-eq origin-bottom"
              style={{ animationDelay: `${i * 0.12 + 0.5}s` }}
            />
          )
        })}

        {/* Floating musical notes */}
        <g className="animate-hero-float" fill="url(#hero-note-grad)" opacity="0.7" transform="translate(110, 225)">
          <path d="M8 0v16a6 6 0 1 1-3-5.2V3h10v13a6 6 0 1 1-3-5.2V0H8z" />
        </g>
        <g className="animate-hero-float-alt" fill="url(#hero-note-grad)" opacity="0.6" transform="translate(1270, 172)">
          <path d="M4 0v12a4.5 4.5 0 1 1-2-3.7V0h2z" />
        </g>
        <g className="animate-hero-float-slow" fill="url(#hero-note-grad)" opacity="0.5" transform="translate(672, 128)">
          <path d="M4 0v10a4 4 0 1 1-2-3.5V0h2z" />
        </g>
        <g className="animate-hero-float" fill="url(#hero-note-grad)" opacity="0.4" transform="translate(890, 595)">
          <path d="M8 0v16a6 6 0 1 1-3-5.2V3h10v13a6 6 0 1 1-3-5.2V0H8z" />
        </g>
        <g className="animate-hero-float-alt" fill="url(#hero-note-grad)" opacity="0.45" transform="translate(393, 582)">
          <path d="M3 0v8a3 3 0 1 1-1.5-2.6V0H3z" />
        </g>

        {/* Circular waveform rings */}
        <circle cx="720" cy="400" r="120" stroke="url(#hero-wave-grad)" strokeWidth="0.8" fill="none" opacity="0.4" className="animate-hero-ring origin-center" />
        <circle cx="720" cy="400" r="200" stroke="url(#hero-wave-grad)" strokeWidth="0.5" fill="none" opacity="0.3" className="animate-hero-ring origin-center" style={{ animationDelay: '1s' }} />
        <circle cx="720" cy="400" r="280" stroke="url(#hero-wave-grad)" strokeWidth="0.3" fill="none" opacity="0.2" className="animate-hero-ring origin-center" style={{ animationDelay: '2s' }} />

        {/* Gradients */}
        <defs>
          <linearGradient id="hero-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="hero-bar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="hero-note-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
