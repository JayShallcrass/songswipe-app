import { ReactNode } from 'react'

/** Warm Male: deep waveform, microphone with stand, sound ripples, warm central glow */
export function WarmMaleIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="wm-glow">
          <stop offset="0%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Warm central glow */}
      <circle cx="200" cy="250" r="140" fill="url(#wm-glow)" className="animate-pulse-soft" />

      {/* Microphone with stand */}
      <g opacity="0.1" transform="translate(170, 150)">
        {/* Mic head */}
        <rect x="20" y="0" width="20" height="50" rx="10" fill="white" opacity="0.7" />
        <path d="M18 35 Q18 55, 30 60 Q42 55, 42 35" stroke="white" strokeWidth="1.5" fill="none" />
        {/* Stand */}
        <line x1="30" y1="60" x2="30" y2="140" stroke="white" strokeWidth="2" />
        {/* Base */}
        <line x1="10" y1="140" x2="50" y2="140" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Grid on mic head */}
        {[12, 20, 28, 36].map((y, i) => (
          <line key={i} x1="22" y1={y} x2="38" y2={y} stroke="white" strokeWidth="0.5" opacity="0.4" />
        ))}
      </g>

      {/* Deep waveform (low frequency sine) */}
      <g opacity="0.08">
        <path d="M0 350 Q50 310, 100 350 Q150 390, 200 350 Q250 310, 300 350 Q350 390, 400 350" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M0 360 Q50 330, 100 360 Q150 390, 200 360 Q250 330, 300 360 Q350 390, 400 360" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
      </g>

      {/* Sound ripples (concentric circles from mic) */}
      {[40, 65, 90, 115].map((r, i) => (
        <circle key={i} cx="200" cy="200" r={r} stroke="white" strokeWidth="1" fill="none" opacity={0.08 - i * 0.015} className="animate-pulse-soft" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </svg>
  )
}

/** Bright Female: high-frequency waveform, sparkling particles, flowing sound ribbons, light burst */
export function BrightFemaleIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Light burst effect from center */}
      <defs>
        <radialGradient id="bf-burst">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="40%" stopColor="white" stopOpacity="0.04" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="url(#bf-burst)" />

      {/* High-frequency sharp waveform */}
      <g opacity="0.1">
        <path d="M0 250 L15 230 L25 260 L35 225 L45 265 L55 220 L65 270 L75 225 L85 260 L95 230 L105 255 L115 235 L125 250 L135 230 L145 260 L155 225 L165 265 L175 220 L185 270 L195 230 L205 255 L215 225 L225 265 L235 230 L245 255 L255 225 L265 260 L275 230 L285 260 L295 225 L305 265 L315 230 L325 255 L335 235 L345 250 L355 230 L365 260 L375 235 L385 255 L400 250" stroke="white" strokeWidth="2" fill="none" />
      </g>

      {/* Sparkling particles */}
      {[
        { x: 80, y: 100 }, { x: 320, y: 90 }, { x: 60, y: 300 }, { x: 340, y: 280 },
        { x: 150, y: 70 }, { x: 250, y: 80 }, { x: 100, y: 380 }, { x: 300, y: 400 },
        { x: 200, y: 120 }, { x: 160, y: 420 }, { x: 280, y: 350 }, { x: 50, y: 200 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`} opacity={0.06 + (i % 3) * 0.02} className="animate-pulse-soft" style={{ animationDelay: `${i * 0.25}s` }}>
          <circle cx="0" cy="0" r="2" fill="white" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="white" strokeWidth="0.5" />
          <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="0.5" />
        </g>
      ))}

      {/* Flowing sound ribbons */}
      <path d="M0 160 Q100 130, 200 160 Q300 190, 400 150" stroke="white" strokeWidth="1.5" fill="none" opacity="0.06" />
      <path d="M0 180 Q120 150, 220 180 Q320 210, 400 170" stroke="white" strokeWidth="1" fill="none" opacity="0.05" />
      <path d="M0 340 Q100 310, 200 340 Q300 370, 400 330" stroke="white" strokeWidth="1.5" fill="none" opacity="0.06" />
    </svg>
  )
}

/** Soulful: heart-shaped waveform, vinyl record, layered aura circles, expressive curves */
export function SoulfulIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Heart-shaped waveform */}
      <g opacity="0.1" transform="translate(200, 200)">
        <path d="M0 30 C0 0, -30 -30, -55 -15 C-80 0, -80 40, 0 90 C80 40, 80 0, 55 -15 C30 -30, 0 0, 0 30Z" stroke="white" strokeWidth="2" fill="none" />
        {/* Inner waveform along heart */}
        <path d="M0 40 C0 15, -20 -15, -38 -5 C-55 5, -55 30, 0 65 C55 30, 55 5, 38 -5 C20 -15, 0 15, 0 40Z" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
      </g>

      {/* Vinyl record element */}
      <g opacity="0.07" className="animate-spin-slow" style={{ transformOrigin: '80px 400px' }}>
        <circle cx="80" cy="400" r="50" stroke="white" strokeWidth="1" fill="none" />
        <circle cx="80" cy="400" r="35" stroke="white" strokeWidth="0.5" fill="none" />
        <circle cx="80" cy="400" r="20" stroke="white" strokeWidth="0.5" fill="none" />
        <circle cx="80" cy="400" r="5" fill="white" opacity="0.4" />
      </g>

      {/* Layered emotional aura circles */}
      {[60, 90, 120, 150].map((r, i) => (
        <circle key={i} cx="200" cy="200" r={r} stroke="white" strokeWidth="0.8" fill="none" opacity={0.06 - i * 0.01} className="animate-pulse-soft" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}

      {/* Expressive curves */}
      <path d="M40 100 Q120 60, 200 100 Q280 140, 360 100" stroke="white" strokeWidth="1.5" fill="none" opacity="0.06" />
      <path d="M40 120 Q120 80, 200 120 Q280 160, 360 120" stroke="white" strokeWidth="1" fill="none" opacity="0.04" />

      {/* Floating music accents */}
      <g opacity="0.07" transform="translate(320, 130)" className="animate-float-slow">
        <path d="M4 0v10a4 4 0 1 1-2-3.46V0h2z" fill="white" />
      </g>
      <g opacity="0.05" transform="translate(60, 150)" className="animate-float-delayed">
        <path d="M3 0v8a3 3 0 1 1-1.5-2.6V0h1.5z" fill="white" />
      </g>
    </svg>
  )
}

/** Energetic: jagged explosive waveform, lightning bolts, radiating power lines, angular bursts */
export function EnergeticIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Radiating power lines from center */}
      <g opacity="0.06">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
          <line key={i} x1="200" y1="250" x2={200 + Math.cos(angle * Math.PI / 180) * 250} y2={250 + Math.sin(angle * Math.PI / 180) * 250} stroke="white" strokeWidth="1" />
        ))}
      </g>

      {/* Jagged explosive waveform */}
      <g opacity="0.12">
        <path d="M0 250 L20 220 L35 280 L50 200 L70 290 L85 190 L100 300 L120 185 L140 295 L160 210 L175 280 L200 195 L220 285 L240 200 L260 290 L280 195 L295 280 L320 210 L340 285 L360 205 L380 275 L400 250" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      </g>

      {/* Lightning energy bolts */}
      <g opacity="0.1" className="animate-pulse-soft">
        <path d="M100 80 L85 140 L105 135 L80 200" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g opacity="0.08" className="animate-pulse-soft" style={{ animationDelay: '0.8s' }}>
        <path d="M320 100 L305 155 L325 150 L300 210" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g opacity="0.06" className="animate-pulse-soft" style={{ animationDelay: '1.6s' }}>
        <path d="M200 350 L190 400 L205 395 L185 440" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Angular burst patterns */}
      <g opacity="0.08" transform="translate(200, 250)">
        <polygon points="0,-20 6,-6 20,0 6,6 0,20 -6,6 -20,0 -6,-6" fill="white" />
      </g>
      <g opacity="0.06" transform="translate(80, 350)">
        <polygon points="0,-14 4,-4 14,0 4,4 0,14 -4,4 -14,0 -4,-4" fill="white" />
      </g>
      <g opacity="0.06" transform="translate(330, 330)">
        <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="white" />
      </g>

      {/* Impact circles */}
      <circle cx="200" cy="250" r="30" stroke="white" strokeWidth="1.5" fill="none" opacity="0.06" />
      <circle cx="200" cy="250" r="55" stroke="white" strokeWidth="1" fill="none" opacity="0.04" />
    </svg>
  )
}

/** Gentle: soft sine wave, feather elements, water ripples, cloud wisps, delicate floral accents */
export function GentleIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Soft flowing sine wave */}
      <g opacity="0.08">
        <path d="M0 250 Q50 230, 100 250 Q150 270, 200 250 Q250 230, 300 250 Q350 270, 400 250" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M0 265 Q50 248, 100 265 Q150 282, 200 265 Q250 248, 300 265 Q350 282, 400 265" stroke="white" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round" />
      </g>

      {/* Feather elements */}
      <g opacity="0.08" transform="translate(100, 130) rotate(-15)">
        <path d="M0 0 Q5 -3, 8 0 Q15 10, 10 30 Q8 50, 0 70 Q-8 50, -10 30 Q-15 10, -8 0 Q-5 -3, 0 0Z" fill="white" opacity="0.5" />
        <line x1="0" y1="0" x2="0" y2="70" stroke="white" strokeWidth="0.5" opacity="0.4" />
        {/* Barbs */}
        {[15, 25, 35, 45, 55].map((y, i) => (
          <g key={i}>
            <line x1="0" y1={y} x2={-8 + (y / 70) * 4} y2={y - 5} stroke="white" strokeWidth="0.3" opacity="0.3" />
            <line x1="0" y1={y} x2={8 - (y / 70) * 4} y2={y - 5} stroke="white" strokeWidth="0.3" opacity="0.3" />
          </g>
        ))}
      </g>
      <g opacity="0.06" transform="translate(310, 160) rotate(20)">
        <path d="M0 0 Q4 -2, 6 0 Q12 8, 8 24 Q6 40, 0 55 Q-6 40, -8 24 Q-12 8, -6 0 Q-4 -2, 0 0Z" fill="white" opacity="0.5" />
        <line x1="0" y1="0" x2="0" y2="55" stroke="white" strokeWidth="0.5" opacity="0.4" />
      </g>

      {/* Peaceful water ripples */}
      {[30, 50, 70, 90].map((r, i) => (
        <ellipse key={i} cx="200" cy="380" rx={r * 1.5} ry={r * 0.5} stroke="white" strokeWidth="0.8" fill="none" opacity={0.06 - i * 0.01} />
      ))}

      {/* Cloud wisps */}
      <g opacity="0.05">
        <ellipse cx="80" cy="60" rx="40" ry="15" fill="white" />
        <ellipse cx="100" cy="55" rx="30" ry="12" fill="white" />
        <ellipse cx="65" cy="55" rx="25" ry="10" fill="white" />
      </g>
      <g opacity="0.04">
        <ellipse cx="320" cy="80" rx="35" ry="12" fill="white" />
        <ellipse cx="340" cy="75" rx="25" ry="10" fill="white" />
      </g>

      {/* Delicate floral accents */}
      {[
        { x: 60, y: 350 }, { x: 340, y: 320 }, { x: 50, y: 250 }, { x: 350, y: 420 },
      ].map((f, i) => (
        <g key={i} transform={`translate(${f.x}, ${f.y})`} opacity="0.06">
          {[0, 72, 144, 216, 288].map((angle, j) => (
            <ellipse key={j} cx={Math.cos(angle * Math.PI / 180) * 8} cy={Math.sin(angle * Math.PI / 180) * 8} rx="3" ry="6" fill="white" transform={`rotate(${angle} ${Math.cos(angle * Math.PI / 180) * 8} ${Math.sin(angle * Math.PI / 180) * 8})`} />
          ))}
          <circle cx="0" cy="0" r="2" fill="white" opacity="0.5" />
        </g>
      ))}
    </svg>
  )
}
