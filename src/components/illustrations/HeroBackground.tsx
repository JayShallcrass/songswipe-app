'use client'

/**
 * Animated background with sound waves, musical notes, and warm accent lighting.
 * Covers the full landing page. Uses CSS transforms (GPU-accelerated) only.
 */
export default function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Radial glow - coral/purple, upper area */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px]">
        <div className="absolute inset-0 bg-gradient-radial from-brand-500/12 via-purple-600/8 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Secondary glow - mid page */}
      <div className="absolute top-[45%] left-[30%] w-[600px] h-[500px]">
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/6 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Tertiary glow - lower page */}
      <div className="absolute top-[75%] left-[65%] w-[500px] h-[400px]">
        <div className="absolute inset-0 bg-gradient-radial from-brand-500/5 via-purple-600/3 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Sound waves SVG - upper section */}
      <svg
        className="absolute top-0 left-0 w-full opacity-15"
        style={{ height: '50%' }}
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Flowing sound wave lines */}
        <path
          d="M0 400 Q 180 300, 360 400 T 720 400 T 1080 400 T 1440 400"
          stroke="url(#bg-wave-grad)"
          strokeWidth="2"
          className="animate-hero-wave-1"
        />
        <path
          d="M0 420 Q 200 340, 400 420 T 800 420 T 1200 420 T 1440 420"
          stroke="url(#bg-wave-grad)"
          strokeWidth="1.5"
          className="animate-hero-wave-2"
        />
        <path
          d="M0 380 Q 160 310, 320 380 T 640 380 T 960 380 T 1280 380 T 1440 380"
          stroke="url(#bg-wave-grad)"
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
              fill="url(#bg-bar-grad)"
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
              fill="url(#bg-bar-grad)"
              className="animate-hero-eq origin-bottom"
              style={{ animationDelay: `${i * 0.12 + 0.5}s` }}
            />
          )
        })}

        {/* Floating musical notes */}
        <g className="animate-hero-float" fill="url(#bg-note-grad)" opacity="0.7" transform="translate(110, 225)">
          <path d="M8 0v16a6 6 0 1 1-3-5.2V3h10v13a6 6 0 1 1-3-5.2V0H8z" />
        </g>
        <g className="animate-hero-float-alt" fill="url(#bg-note-grad)" opacity="0.6" transform="translate(1270, 172)">
          <path d="M4 0v12a4.5 4.5 0 1 1-2-3.7V0h2z" />
        </g>
        <g className="animate-hero-float-slow" fill="url(#bg-note-grad)" opacity="0.5" transform="translate(672, 128)">
          <path d="M4 0v10a4 4 0 1 1-2-3.5V0h2z" />
        </g>
        <g className="animate-hero-float" fill="url(#bg-note-grad)" opacity="0.4" transform="translate(890, 595)">
          <path d="M8 0v16a6 6 0 1 1-3-5.2V3h10v13a6 6 0 1 1-3-5.2V0H8z" />
        </g>
        <g className="animate-hero-float-alt" fill="url(#bg-note-grad)" opacity="0.45" transform="translate(393, 582)">
          <path d="M3 0v8a3 3 0 1 1-1.5-2.6V0H3z" />
        </g>

        {/* Circular waveform rings */}
        <circle cx="720" cy="400" r="120" stroke="url(#bg-wave-grad)" strokeWidth="0.8" fill="none" opacity="0.4" className="animate-hero-ring origin-center" />
        <circle cx="720" cy="400" r="200" stroke="url(#bg-wave-grad)" strokeWidth="0.5" fill="none" opacity="0.3" className="animate-hero-ring origin-center" style={{ animationDelay: '1s' }} />
        <circle cx="720" cy="400" r="280" stroke="url(#bg-wave-grad)" strokeWidth="0.3" fill="none" opacity="0.2" className="animate-hero-ring origin-center" style={{ animationDelay: '2s' }} />

        {/* Gradients */}
        <defs>
          <linearGradient id="bg-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#e74c3c" />
          </linearGradient>
          <linearGradient id="bg-bar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="bg-note-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Lower wave lines (simpler, no animation) for mid/lower page warmth */}
      <svg
        className="absolute top-[50%] left-0 w-full opacity-8"
        style={{ height: '30%' }}
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path d="M0 200 Q 180 140, 360 200 T 720 200 T 1080 200 T 1440 200" stroke="url(#bg-wave-grad2)" strokeWidth="1.5" />
        <path d="M0 220 Q 200 170, 400 220 T 800 220 T 1200 220 T 1440 220" stroke="url(#bg-wave-grad2)" strokeWidth="1" />
        <defs>
          <linearGradient id="bg-wave-grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#e74c3c" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
