import { ReactNode } from 'react'

/** Valentine's Day: floating hearts, rose petals, bokeh circles, ribbon curves */
export function ValentinesIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="val-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      {/* Large heart outlines */}
      <path d="M200 180 C200 140, 150 100, 120 130 C90 160, 100 200, 200 260 C300 200, 310 160, 280 130 C250 100, 200 140, 200 180Z" stroke="white" strokeWidth="2" fill="none" opacity="0.15" className="animate-pulse-soft" />
      <path d="M200 200 C200 170, 165 140, 145 160 C125 180, 130 210, 200 255 C270 210, 275 180, 255 160 C235 140, 200 170, 200 200Z" stroke="white" strokeWidth="1.5" fill="white" opacity="0.06" />

      {/* Small floating hearts */}
      <path d="M80 90 C80 80, 70 72, 65 78 C60 84, 63 90, 80 105 C97 90, 100 84, 95 78 C90 72, 80 80, 80 90Z" fill="white" opacity="0.12" className="animate-float-slow" />
      <path d="M320 120 C320 112, 312 106, 308 110 C304 114, 306 118, 320 130 C334 118, 336 114, 332 110 C328 106, 320 112, 320 120Z" fill="white" opacity="0.1" className="animate-float-delayed" />
      <path d="M60 350 C60 344, 55 340, 52 343 C49 346, 50 349, 60 358 C70 349, 71 346, 68 343 C65 340, 60 344, 60 350Z" fill="white" opacity="0.08" className="animate-float-slow" />
      <path d="M340 380 C340 374, 335 370, 332 373 C329 376, 330 379, 340 388 C350 379, 351 376, 348 373 C345 370, 340 374, 340 380Z" fill="white" opacity="0.1" className="animate-float-delayed" />

      {/* Rose petals drifting */}
      <ellipse cx="100" cy="200" rx="18" ry="10" transform="rotate(-30 100 200)" fill="white" opacity="0.07" className="animate-drift" />
      <ellipse cx="300" cy="300" rx="14" ry="8" transform="rotate(25 300 300)" fill="white" opacity="0.06" className="animate-drift" style={{ animationDelay: '1s' }} />
      <ellipse cx="180" cy="420" rx="16" ry="9" transform="rotate(-15 180 420)" fill="white" opacity="0.05" className="animate-drift" style={{ animationDelay: '2s' }} />

      {/* Bokeh circles */}
      <circle cx="60" cy="150" r="25" fill="white" opacity="0.04" />
      <circle cx="350" cy="200" r="30" fill="white" opacity="0.03" />
      <circle cx="150" cy="380" r="20" fill="white" opacity="0.05" className="animate-pulse-soft" />
      <circle cx="280" cy="450" r="35" fill="white" opacity="0.03" />
      <circle cx="320" cy="60" r="18" fill="white" opacity="0.04" className="animate-pulse-soft" style={{ animationDelay: '1.5s' }} />

      {/* Ribbon curves */}
      <path d="M0 320 Q100 280, 200 320 T400 300" stroke="white" strokeWidth="1.5" fill="none" opacity="0.08" />
      <path d="M0 350 Q120 310, 220 350 T400 340" stroke="white" strokeWidth="1" fill="none" opacity="0.06" />
    </svg>
  )
}

/** Birthday: confetti, balloons, starburst sparkles, streamer curves */
export function BirthdayIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Confetti triangles and circles */}
      <polygon points="60,50 70,30 80,50" fill="white" opacity="0.12" className="animate-drift" />
      <polygon points="320,70 335,50 340,75" fill="white" opacity="0.1" className="animate-drift" style={{ animationDelay: '0.5s' }} />
      <polygon points="150,40 160,20 170,45" fill="white" opacity="0.08" className="animate-drift" style={{ animationDelay: '1s' }} />
      <polygon points="250,60 258,42 268,62" fill="white" opacity="0.1" className="animate-drift" style={{ animationDelay: '1.5s' }} />
      <circle cx="100" cy="60" r="5" fill="white" opacity="0.1" className="animate-drift" />
      <circle cx="280" cy="45" r="4" fill="white" opacity="0.08" className="animate-drift" style={{ animationDelay: '0.7s' }} />
      <rect x="200" y="35" width="8" height="8" rx="1" fill="white" opacity="0.09" transform="rotate(30 204 39)" className="animate-drift" />
      <rect x="370" y="90" width="6" height="6" rx="1" fill="white" opacity="0.07" transform="rotate(-20 373 93)" className="animate-drift" style={{ animationDelay: '1.2s' }} />

      {/* Balloon silhouettes with strings */}
      <ellipse cx="70" cy="200" rx="28" ry="35" fill="white" opacity="0.08" className="animate-float-slow" />
      <path d="M70 235 Q72 260, 68 290" stroke="white" strokeWidth="1" fill="none" opacity="0.06" />
      <ellipse cx="340" cy="180" rx="25" ry="32" fill="white" opacity="0.07" className="animate-float-delayed" />
      <path d="M340 212 Q342 240, 338 270" stroke="white" strokeWidth="1" fill="none" opacity="0.05" />
      <ellipse cx="160" cy="160" rx="22" ry="28" fill="white" opacity="0.06" className="animate-float-slow" style={{ animationDelay: '1s' }} />
      <path d="M160 188 Q162 210, 158 240" stroke="white" strokeWidth="1" fill="none" opacity="0.04" />

      {/* Starburst sparkles */}
      <g opacity="0.12" className="animate-pulse-soft">
        <line x1="200" y1="100" x2="200" y2="86" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="200" y1="100" x2="200" y2="114" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="193" y1="100" x2="207" y2="100" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="195" y1="93" x2="205" y2="107" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="205" y1="93" x2="195" y2="107" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity="0.08" transform="translate(310, 320)" className="animate-pulse-soft" style={{ animationDelay: '1s' }}>
        <line x1="0" y1="-8" x2="0" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-8" y1="0" x2="8" y2="0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-5" y1="-5" x2="5" y2="5" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="5" y1="-5" x2="-5" y2="5" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Streamer curves */}
      <path d="M30 100 Q80 60, 130 100 Q180 140, 230 100" stroke="white" strokeWidth="1.5" fill="none" opacity="0.07" />
      <path d="M200 80 Q250 50, 300 80 Q350 110, 400 80" stroke="white" strokeWidth="1" fill="none" opacity="0.06" />
      <path d="M0 400 Q60 370, 120 400 Q180 430, 240 400" stroke="white" strokeWidth="1" fill="none" opacity="0.05" />
    </svg>
  )
}

/** Anniversary: interlocking rings, champagne glasses, flourishes, sparkle stars */
export function AnniversaryIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Interlocking rings */}
      <circle cx="175" cy="200" r="50" stroke="white" strokeWidth="2" fill="none" opacity="0.12" />
      <circle cx="225" cy="200" r="50" stroke="white" strokeWidth="2" fill="none" opacity="0.12" />
      {/* Overlap highlight */}
      <ellipse cx="200" cy="200" rx="15" ry="45" fill="white" opacity="0.04" />

      {/* Champagne glass silhouettes */}
      <g opacity="0.08" transform="translate(60, 300)">
        <path d="M15 0 L5 35 L0 35 L0 38 L30 38 L30 35 L25 35 L15 0Z" fill="white" />
        <ellipse cx="15" cy="0" rx="12" ry="5" fill="white" opacity="0.6" />
      </g>
      <g opacity="0.07" transform="translate(300, 310)">
        <path d="M15 0 L5 35 L0 35 L0 38 L30 38 L30 35 L25 35 L15 0Z" fill="white" />
        <ellipse cx="15" cy="0" rx="12" ry="5" fill="white" opacity="0.6" />
      </g>

      {/* Bubbles from champagne */}
      <circle cx="75" cy="290" r="3" fill="white" opacity="0.08" className="animate-float-slow" />
      <circle cx="80" cy="275" r="2" fill="white" opacity="0.06" className="animate-float-slow" style={{ animationDelay: '0.5s' }} />
      <circle cx="315" cy="300" r="2.5" fill="white" opacity="0.07" className="animate-float-delayed" />
      <circle cx="320" cy="285" r="2" fill="white" opacity="0.05" className="animate-float-delayed" style={{ animationDelay: '0.8s' }} />

      {/* Ornamental flourish curves */}
      <path d="M50 130 Q100 100, 140 130 Q160 145, 140 160 Q100 180, 50 160" stroke="white" strokeWidth="1" fill="none" opacity="0.07" />
      <path d="M350 130 Q300 100, 260 130 Q240 145, 260 160 Q300 180, 350 160" stroke="white" strokeWidth="1" fill="none" opacity="0.07" />

      {/* Sparkle stars */}
      {[{ x: 200, y: 100, s: 1.2 }, { x: 100, y: 180, s: 0.8 }, { x: 310, y: 160, s: 0.9 }, { x: 150, y: 400, s: 0.7 }, { x: 280, y: 420, s: 1 }].map((st, i) => (
        <g key={i} transform={`translate(${st.x}, ${st.y}) scale(${st.s})`} opacity="0.1" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.6}s` }}>
          <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="white" />
        </g>
      ))}
    </svg>
  )
}

/** Wedding: floral arch, bells, dove silhouettes, petal scatter, leaf sprigs */
export function WeddingIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Floral arch frame */}
      <path d="M60 400 Q60 100, 200 60 Q340 100, 340 400" stroke="white" strokeWidth="2" fill="none" opacity="0.1" />
      <path d="M80 400 Q80 120, 200 85 Q320 120, 320 400" stroke="white" strokeWidth="1" fill="none" opacity="0.06" />

      {/* Decorative leaf sprigs along arch */}
      {[
        { x: 85, y: 200, r: -30 }, { x: 75, y: 280, r: -20 }, { x: 100, y: 150, r: -45 },
        { x: 315, y: 200, r: 30 }, { x: 325, y: 280, r: 20 }, { x: 300, y: 150, r: 45 },
      ].map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.r})`} opacity="0.08">
          <ellipse cx="0" cy="0" rx="5" ry="14" fill="white" />
          <ellipse cx="8" cy="-4" rx="4" ry="10" fill="white" opacity="0.8" />
        </g>
      ))}

      {/* Bell outlines */}
      <g opacity="0.09" transform="translate(170, 70)">
        <path d="M15 0 C15 0, 5 5, 5 18 L0 22 L30 22 L25 18 C25 5, 15 0, 15 0Z" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="15" cy="24" r="3" fill="white" opacity="0.5" />
      </g>
      <g opacity="0.07" transform="translate(210, 65)">
        <path d="M12 0 C12 0, 4 4, 4 15 L0 18 L24 18 L20 15 C20 4, 12 0, 12 0Z" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="20" r="2.5" fill="white" opacity="0.5" />
      </g>

      {/* Dove silhouettes */}
      <g opacity="0.08" transform="translate(120, 120)" className="animate-float-slow">
        <path d="M0 12 Q5 5, 15 2 Q25 0, 30 5 Q28 2, 22 3 Q18 5, 20 10 Q15 7, 10 10 Q5 12, 0 12Z" fill="white" />
      </g>
      <g opacity="0.06" transform="translate(250, 110) scale(-1, 1)" className="animate-float-delayed">
        <path d="M0 12 Q5 5, 15 2 Q25 0, 30 5 Q28 2, 22 3 Q18 5, 20 10 Q15 7, 10 10 Q5 12, 0 12Z" fill="white" />
      </g>

      {/* Petal scatter */}
      {[
        { x: 50, y: 350, r: 20 }, { x: 150, y: 430, r: -15 }, { x: 250, y: 440, r: 30 },
        { x: 350, y: 360, r: -25 }, { x: 200, y: 460, r: 10 },
      ].map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx="8" ry="4" transform={`rotate(${p.r} ${p.x} ${p.y})`} fill="white" opacity="0.06" className="animate-drift" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
    </svg>
  )
}

/** Graduation: mortarboard, diploma, upward arrow, achievement stars, confetti */
export function GraduationIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Mortarboard cap */}
      <g opacity="0.12" transform="translate(140, 100)">
        {/* Cap board */}
        <polygon points="60,0 120,25 60,50 0,25" fill="white" />
        {/* Cap base */}
        <ellipse cx="60" cy="40" rx="40" ry="12" fill="white" opacity="0.6" />
        {/* Tassel */}
        <line x1="60" y1="25" x2="100" y2="25" stroke="white" strokeWidth="1.5" opacity="0.8" />
        <line x1="100" y1="25" x2="100" y2="55" stroke="white" strokeWidth="1.5" opacity="0.6" />
        <circle cx="100" cy="58" r="4" fill="white" opacity="0.5" />
      </g>

      {/* Diploma scroll */}
      <g opacity="0.09" transform="translate(130, 280)">
        <rect x="20" y="0" width="100" height="60" rx="4" fill="white" opacity="0.7" />
        <ellipse cx="20" cy="30" rx="8" ry="30" fill="white" />
        <ellipse cx="120" cy="30" rx="8" ry="30" fill="white" />
        {/* Ribbon on diploma */}
        <path d="M65 60 L55 80 M75 60 L85 80" stroke="white" strokeWidth="1.5" opacity="0.5" />
      </g>

      {/* Upward trajectory arrow */}
      <g opacity="0.08">
        <path d="M80 400 Q150 300, 200 250 Q250 200, 320 120" stroke="white" strokeWidth="2" strokeDasharray="6 4" fill="none" />
        <polygon points="320,110 330,130 310,125" fill="white" opacity="0.8" />
      </g>

      {/* Achievement stars */}
      {[{ x: 60, y: 180, s: 1 }, { x: 340, y: 200, s: 0.8 }, { x: 300, y: 100, s: 1.1 }, { x: 100, y: 380, s: 0.7 }, { x: 320, y: 400, s: 0.9 }].map((st, i) => (
        <g key={i} transform={`translate(${st.x}, ${st.y}) scale(${st.s})`} opacity="0.1" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.5}s` }}>
          <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="white" />
        </g>
      ))}

      {/* Structured confetti */}
      <rect x="50" y="50" width="6" height="6" rx="1" fill="white" opacity="0.08" transform="rotate(15 53 53)" />
      <rect x="350" y="70" width="5" height="5" rx="1" fill="white" opacity="0.07" transform="rotate(-20 352.5 72.5)" />
      <polygon points="250,50 256,38 262,50" fill="white" opacity="0.06" />
      <polygon points="100,60 105,48 112,58" fill="white" opacity="0.07" />
      <circle cx="300" cy="55" r="3" fill="white" opacity="0.06" />
    </svg>
  )
}

/** Just Because: whimsical doodles - stars, hearts, squiggles, musical notes, brush curves */
export function JustBecauseIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Scattered stars */}
      {[{ x: 80, y: 100 }, { x: 320, y: 80 }, { x: 60, y: 350 }, { x: 340, y: 380 }, { x: 200, y: 60 }].map((s, i) => (
        <g key={`star-${i}`} transform={`translate(${s.x}, ${s.y})`} opacity="0.1" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.7}s` }}>
          <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="white" />
        </g>
      ))}

      {/* Small hearts */}
      <path d="M100 200 C100 194, 94 190, 91 194 C88 198, 90 201, 100 210 C110 201, 112 198, 109 194 C106 190, 100 194, 100 200Z" fill="white" opacity="0.08" className="animate-float-slow" />
      <path d="M310 250 C310 246, 306 243, 304 246 C302 249, 303 251, 310 257 C317 251, 318 249, 316 246 C314 243, 310 246, 310 250Z" fill="white" opacity="0.07" className="animate-float-delayed" />

      {/* Squiggly lines */}
      <path d="M40 150 Q55 140, 70 150 Q85 160, 100 150 Q115 140, 130 150" stroke="white" strokeWidth="1.5" fill="none" opacity="0.08" strokeLinecap="round" />
      <path d="M280 420 Q295 410, 310 420 Q325 430, 340 420 Q355 410, 370 420" stroke="white" strokeWidth="1.5" fill="none" opacity="0.07" strokeLinecap="round" />

      {/* Musical notes */}
      <g opacity="0.09" transform="translate(150, 120)" className="animate-float-slow">
        <path d="M4 0v10a4 4 0 1 1-2-3.46V0h2z" fill="white" />
      </g>
      <g opacity="0.07" transform="translate(270, 150)" className="animate-float-delayed">
        <path d="M6 0v12a5 5 0 1 1-2.5-4.33V2h7V12a5 5 0 1 1-2.5-4.33V0H6z" fill="white" />
      </g>
      <g opacity="0.06" transform="translate(80, 400)" className="animate-float-slow" style={{ animationDelay: '1.5s' }}>
        <path d="M3 0v8a3.5 3.5 0 1 1-1.5-2.87V0h1.5z" fill="white" />
      </g>

      {/* Playful brush-stroke curves */}
      <path d="M20 250 Q100 220, 160 260 Q220 300, 180 340" stroke="white" strokeWidth="2" fill="none" opacity="0.06" strokeLinecap="round" />
      <path d="M380 200 Q320 170, 280 210 Q240 250, 270 290" stroke="white" strokeWidth="2" fill="none" opacity="0.05" strokeLinecap="round" />

      {/* Exclamation mark doodle */}
      <g opacity="0.07" transform="translate(200, 420)">
        <rect x="-2" y="-15" width="4" height="18" rx="2" fill="white" />
        <circle cx="0" cy="8" r="2.5" fill="white" />
      </g>

      {/* Spiral */}
      <path d="M350 320 Q355 310, 345 305 Q335 310, 340 320 Q350 330, 360 320 Q365 305, 345 295" stroke="white" strokeWidth="1" fill="none" opacity="0.06" strokeLinecap="round" />
    </svg>
  )
}
