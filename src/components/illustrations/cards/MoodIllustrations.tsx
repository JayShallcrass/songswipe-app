import { ReactNode } from 'react'

/** Romantic: candle glow, rose silhouettes, bokeh lights, flowing curtain curves */
export function RomanticIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Candle glow - radial gradient */}
      <defs>
        <radialGradient id="rom-glow">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="180" r="100" fill="url(#rom-glow)" className="animate-pulse-soft" />

      {/* Candle */}
      <g opacity="0.12" transform="translate(188, 200)">
        <rect x="0" y="20" width="24" height="60" rx="3" fill="white" opacity="0.7" />
        <ellipse cx="12" cy="20" rx="4" ry="12" fill="white" opacity="0.9" />
        <line x1="12" y1="20" x2="12" y2="8" stroke="white" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Rose silhouettes */}
      <g opacity="0.07" transform="translate(60, 300)">
        <circle cx="0" cy="0" r="12" fill="white" />
        <circle cx="8" cy="-8" r="10" fill="white" opacity="0.7" />
        <circle cx="-6" cy="-10" r="9" fill="white" opacity="0.6" />
        <line x1="0" y1="12" x2="0" y2="50" stroke="white" strokeWidth="2" />
        <ellipse cx="-10" cy="30" rx="5" ry="12" fill="white" opacity="0.5" transform="rotate(30 -10 30)" />
      </g>
      <g opacity="0.06" transform="translate(330, 340)">
        <circle cx="0" cy="0" r="10" fill="white" />
        <circle cx="7" cy="-6" r="8" fill="white" opacity="0.7" />
        <circle cx="-5" cy="-8" r="7" fill="white" opacity="0.6" />
        <line x1="0" y1="10" x2="0" y2="45" stroke="white" strokeWidth="1.5" />
      </g>

      {/* Soft bokeh lights */}
      {[
        { x: 80, y: 120, r: 20 }, { x: 320, y: 100, r: 15 }, { x: 50, y: 400, r: 25 },
        { x: 350, y: 420, r: 18 }, { x: 150, y: 80, r: 12 }, { x: 280, y: 300, r: 22 },
      ].map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="white" opacity="0.04" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}

      {/* Flowing curtain curves */}
      <path d="M0 0 Q30 80, 20 200 Q10 320, 30 500" stroke="white" strokeWidth="1" fill="none" opacity="0.06" />
      <path d="M400 0 Q370 80, 380 200 Q390 320, 370 500" stroke="white" strokeWidth="1" fill="none" opacity="0.06" />
      <path d="M15 0 Q45 100, 35 250 Q25 380, 45 500" stroke="white" strokeWidth="0.5" fill="none" opacity="0.04" />
    </svg>
  )
}

/** Happy: sun rays, bouncing bubbles, rainbow arc, sparkle bursts */
export function HappyIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Sun rays from top-right corner */}
      <g opacity="0.08">
        {[0, 20, 40, 60, 80, 100, 120].map((angle, i) => (
          <line key={i} x1="380" y1="20" x2={380 + Math.cos((angle - 90) * Math.PI / 180) * 300} y2={20 + Math.sin((angle - 90) * Math.PI / 180) * 300} stroke="white" strokeWidth="1.5" />
        ))}
      </g>
      <circle cx="380" cy="20" r="40" fill="white" opacity="0.06" />

      {/* Bouncing bubbles */}
      {[
        { x: 60, y: 150, r: 18 }, { x: 140, y: 100, r: 14 }, { x: 100, y: 300, r: 20 },
        { x: 300, y: 250, r: 16 }, { x: 340, y: 150, r: 12 }, { x: 250, y: 380, r: 22 },
        { x: 70, y: 420, r: 15 }, { x: 350, y: 400, r: 10 },
      ].map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} stroke="white" strokeWidth="1" fill="none" opacity="0.08" className="animate-float-slow" style={{ animationDelay: `${i * 0.3}s` }} />
          <ellipse cx={b.x - b.r * 0.3} cy={b.y - b.r * 0.3} rx={b.r * 0.2} ry={b.r * 0.15} fill="white" opacity="0.06" transform={`rotate(-30 ${b.x - b.r * 0.3} ${b.y - b.r * 0.3})`} />
        </g>
      ))}

      {/* Rainbow arc */}
      <path d="M40 350 Q200 150, 360 350" stroke="white" strokeWidth="3" fill="none" opacity="0.06" />
      <path d="M50 350 Q200 170, 350 350" stroke="white" strokeWidth="2" fill="none" opacity="0.05" />
      <path d="M60 350 Q200 190, 340 350" stroke="white" strokeWidth="1.5" fill="none" opacity="0.04" />

      {/* Sparkle bursts */}
      {[{ x: 200, y: 200 }, { x: 100, y: 250 }, { x: 320, y: 300 }].map((sp, i) => (
        <g key={i} transform={`translate(${sp.x}, ${sp.y})`} opacity="0.1" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.8}s` }}>
          <path d="M0 -8 L1.5 -2 L8 0 L1.5 2 L0 8 L-1.5 2 L-8 0 L-1.5 -2 Z" fill="white" />
        </g>
      ))}
    </svg>
  )
}

/** Funny: comic speech bubbles, zigzag pow shapes, squiggly lines, wonky stars, exclamation marks */
export function FunnyIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Comic speech bubbles */}
      <g opacity="0.08">
        <rect x="50" y="60" width="80" height="50" rx="16" fill="white" />
        <path d="M80 110 L70 130 L95 110" fill="white" />
      </g>
      <g opacity="0.06">
        <rect x="280" y="100" width="70" height="45" rx="14" fill="white" />
        <path d="M320 145 L330 162 L310 145" fill="white" />
      </g>

      {/* Zigzag "pow" starburst */}
      <g opacity="0.09" transform="translate(200, 180)">
        <polygon points="0,-35 10,-15 30,-20 18,-5 35,10 15,10 10,30 0,15 -10,30 -15,10 -35,10 -18,-5 -30,-20 -10,-15" fill="white" />
      </g>

      {/* Squiggly lines */}
      <path d="M30 250 Q50 235, 70 250 Q90 265, 110 250 Q130 235, 150 250" stroke="white" strokeWidth="2" fill="none" opacity="0.07" strokeLinecap="round" />
      <path d="M250 350 Q270 335, 290 350 Q310 365, 330 350 Q350 335, 370 350" stroke="white" strokeWidth="2" fill="none" opacity="0.06" strokeLinecap="round" />

      {/* Wonky stars (deliberately imperfect) */}
      <g opacity="0.08" transform="translate(80, 350) rotate(10)">
        <path d="M0 -10 L3 -3 L10 -2 L5 3 L6 10 L0 6 L-6 10 L-5 3 L-10 -2 L-3 -3 Z" fill="white" />
      </g>
      <g opacity="0.07" transform="translate(320, 250) rotate(-8)">
        <path d="M0 -8 L2.5 -2.5 L8 -1.5 L4 2.5 L5 8 L0 5 L-5 8 L-4 2.5 L-8 -1.5 L-2.5 -2.5 Z" fill="white" />
      </g>

      {/* Bouncy exclamation marks */}
      <g opacity="0.08" transform="translate(160, 80)" className="animate-float-slow">
        <rect x="-2.5" y="0" width="5" height="20" rx="2.5" fill="white" />
        <circle cx="0" cy="26" r="3" fill="white" />
      </g>
      <g opacity="0.06" transform="translate(300, 60)" className="animate-float-delayed">
        <rect x="-2" y="0" width="4" height="16" rx="2" fill="white" />
        <circle cx="0" cy="22" r="2.5" fill="white" />
      </g>
      <g opacity="0.07" transform="translate(60, 430)" className="animate-float-slow" style={{ animationDelay: '1s' }}>
        <rect x="-2" y="0" width="4" height="16" rx="2" fill="white" />
        <circle cx="0" cy="22" r="2.5" fill="white" />
      </g>

      {/* "Ha!" text outline */}
      <g opacity="0.05" transform="translate(90, 75)">
        <text x="0" y="0" fill="white" fontSize="16" fontWeight="bold" fontFamily="system-ui">Ha!</text>
      </g>
    </svg>
  )
}

/** Nostalgic: vintage film strip border, photo frame corners, sepia overlay, clock, vignette */
export function NostalgicIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="nost-vignette">
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Vignette overlay */}
      <rect x="0" y="0" width="400" height="500" fill="url(#nost-vignette)" />

      {/* Film strip border - left */}
      <g opacity="0.08">
        <rect x="10" y="0" width="30" height="500" fill="white" opacity="0.04" />
        {Array.from({ length: 18 }, (_, i) => (
          <rect key={`fl-${i}`} x="15" y={i * 28 + 5} width="8" height="12" rx="2" fill="white" opacity="0.6" />
        ))}
      </g>
      {/* Film strip border - right */}
      <g opacity="0.08">
        <rect x="360" y="0" width="30" height="500" fill="white" opacity="0.04" />
        {Array.from({ length: 18 }, (_, i) => (
          <rect key={`fr-${i}`} x="377" y={i * 28 + 5} width="8" height="12" rx="2" fill="white" opacity="0.6" />
        ))}
      </g>

      {/* Photo frame corners */}
      <g opacity="0.1">
        <path d="M80 120 L80 100 L100 100" stroke="white" strokeWidth="2" fill="none" />
        <path d="M320 120 L320 100 L300 100" stroke="white" strokeWidth="2" fill="none" />
        <path d="M80 350 L80 370 L100 370" stroke="white" strokeWidth="2" fill="none" />
        <path d="M320 350 L320 370 L300 370" stroke="white" strokeWidth="2" fill="none" />
      </g>

      {/* Clock hands */}
      <g opacity="0.08" transform="translate(200, 240)">
        <circle cx="0" cy="0" r="40" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="0" cy="0" r="3" fill="white" opacity="0.6" />
        <line x1="0" y1="0" x2="0" y2="-28" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="18" y2="-10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        {/* Hour markers */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
          <line key={i} x1={Math.cos((deg - 90) * Math.PI / 180) * 35} y1={Math.sin((deg - 90) * Math.PI / 180) * 35} x2={Math.cos((deg - 90) * Math.PI / 180) * 40} y2={Math.sin((deg - 90) * Math.PI / 180) * 40} stroke="white" strokeWidth="1" />
        ))}
      </g>

      {/* Sepia-toned horizontal lines */}
      {[100, 130, 370, 400].map((y, i) => (
        <line key={i} x1="60" y1={y} x2="340" y2={y} stroke="white" strokeWidth="0.5" opacity="0.04" />
      ))}
    </svg>
  )
}

/** Epic: mountain peaks, spotlight rays, storm cloud swirls, lightning bolts */
export function EpicIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Dramatic spotlight rays from top center */}
      <g opacity="0.07">
        {[-30, -15, 0, 15, 30].map((angle, i) => (
          <line key={i} x1="200" y1="0" x2={200 + Math.tan(angle * Math.PI / 180) * 500} y2="500" stroke="white" strokeWidth="2" />
        ))}
      </g>

      {/* Mountain peak silhouettes */}
      <g opacity="0.1">
        <polygon points="0,500 120,280 240,500" fill="white" opacity="0.5" />
        <polygon points="100,500 220,240 340,500" fill="white" opacity="0.7" />
        <polygon points="200,500 300,300 400,500" fill="white" opacity="0.4" />
      </g>

      {/* Storm cloud swirls */}
      <g opacity="0.08">
        <circle cx="100" cy="80" r="30" fill="white" />
        <circle cx="130" cy="70" r="35" fill="white" />
        <circle cx="165" cy="80" r="28" fill="white" />
        <circle cx="80" cy="90" r="25" fill="white" />
        <rect x="70" y="85" width="110" height="25" fill="white" />
      </g>
      <g opacity="0.06">
        <circle cx="280" cy="100" r="25" fill="white" />
        <circle cx="305" cy="92" r="30" fill="white" />
        <circle cx="335" cy="100" r="22" fill="white" />
        <rect x="268" y="98" width="85" height="20" fill="white" />
      </g>

      {/* Lightning bolt accents */}
      <g opacity="0.12" className="animate-pulse-soft">
        <path d="M160 110 L145 160 L160 155 L140 200" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g opacity="0.08" className="animate-pulse-soft" style={{ animationDelay: '1.5s' }}>
        <path d="M310 115 L300 150 L310 148 L295 180" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Sparkle flashes */}
      {[{ x: 200, y: 150 }, { x: 80, y: 200 }, { x: 330, y: 180 }].map((s, i) => (
        <g key={i} transform={`translate(${s.x}, ${s.y})`} opacity="0.08" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.6}s` }}>
          <path d="M0 -6 L1 -1 L6 0 L1 1 L0 6 L-1 1 L-6 0 L-1 -1 Z" fill="white" />
        </g>
      ))}
    </svg>
  )
}
