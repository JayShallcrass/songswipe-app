import { ReactNode } from 'react'

/** Pop: vinyl record circles, equalizer bars, spotlight beams, geometric disco facets */
export function PopIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Vinyl record concentric circles */}
      <g opacity="0.08" className="animate-spin-slow" style={{ transformOrigin: '200px 250px' }}>
        <circle cx="200" cy="250" r="100" stroke="white" strokeWidth="1" fill="none" />
        <circle cx="200" cy="250" r="80" stroke="white" strokeWidth="0.5" fill="none" />
        <circle cx="200" cy="250" r="60" stroke="white" strokeWidth="0.5" fill="none" />
        <circle cx="200" cy="250" r="40" stroke="white" strokeWidth="1" fill="none" />
        <circle cx="200" cy="250" r="15" fill="white" opacity="0.3" />
        <circle cx="200" cy="250" r="4" fill="white" opacity="0.5" />
      </g>

      {/* Equalizer bars - left */}
      <g opacity="0.1">
        {[40, 55, 70, 85, 100].map((x, i) => {
          const h = [30, 50, 40, 60, 35][i]
          return (
            <rect key={`eql-${i}`} x={x} y={420 - h} width="10" height={h} rx="3" fill="white" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.15}s` }} />
          )
        })}
      </g>
      {/* Equalizer bars - right */}
      <g opacity="0.08">
        {[300, 315, 330, 345, 360].map((x, i) => {
          const h = [35, 55, 45, 65, 30][i]
          return (
            <rect key={`eqr-${i}`} x={x} y={420 - h} width="10" height={h} rx="3" fill="white" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.15 + 0.4}s` }} />
          )
        })}
      </g>

      {/* Stage spotlight beams */}
      <g opacity="0.06">
        <polygon points="150,0 100,300 200,300" fill="white" />
        <polygon points="250,0 200,300 300,300" fill="white" />
      </g>

      {/* Geometric disco facets */}
      {[
        { x: 60, y: 100, r: 15 }, { x: 340, y: 80, r: 10 }, { x: 50, y: 380, r: 12 },
        { x: 350, y: 350, r: 14 }, { x: 200, y: 60, r: 8 },
      ].map((d, i) => (
        <polygon key={i} points={`${d.x},${d.y - d.r} ${d.x + d.r},${d.y} ${d.x},${d.y + d.r} ${d.x - d.r},${d.y}`} fill="white" opacity="0.06" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
    </svg>
  )
}

/** Acoustic: guitar body outline, wood-grain pattern, musical staff with notes, leaf accents, warm glow */
export function AcousticIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="aco-glow">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Warm central glow */}
      <circle cx="200" cy="250" r="150" fill="url(#aco-glow)" />

      {/* Guitar body outline */}
      <g opacity="0.1" transform="translate(130, 100)">
        <path d="M70 0 L70 60 Q100 100, 100 160 Q100 220, 70 260 Q40 300, 70 340 L70 340 Q100 300, 100 260 Q130 220, 130 160 Q130 100, 100 60 L100 0" stroke="white" strokeWidth="1.5" fill="none" />
        {/* Sound hole */}
        <circle cx="85" cy="200" r="25" stroke="white" strokeWidth="1" fill="none" opacity="0.7" />
        <circle cx="85" cy="200" r="20" stroke="white" strokeWidth="0.5" fill="none" opacity="0.4" />
        {/* Strings */}
        {[75, 80, 85, 90, 95].map((x, i) => (
          <line key={i} x1={x} y1="60" x2={x} y2="320" stroke="white" strokeWidth="0.5" opacity="0.3" />
        ))}
      </g>

      {/* Wood-grain pattern lines */}
      <g opacity="0.04">
        {[80, 120, 160, 200, 240, 280, 320, 360].map((y, i) => (
          <path key={i} d={`M50 ${y} Q150 ${y + (i % 2 ? 8 : -8)}, 250 ${y} Q350 ${y + (i % 2 ? -6 : 6)}, 400 ${y}`} stroke="white" strokeWidth="0.5" fill="none" />
        ))}
      </g>

      {/* Musical staff lines with notes */}
      <g opacity="0.07" transform="translate(0, 400)">
        {[0, 8, 16, 24, 32].map((y, i) => (
          <line key={i} x1="40" y1={y} x2="360" y2={y} stroke="white" strokeWidth="0.5" />
        ))}
        {/* Notes on staff */}
        <circle cx="100" cy="8" r="5" fill="white" opacity="0.8" />
        <line x1="105" y1="8" x2="105" y2="-15" stroke="white" strokeWidth="1" />
        <circle cx="180" cy="20" r="5" fill="white" opacity="0.8" />
        <line x1="185" y1="20" x2="185" y2="-3" stroke="white" strokeWidth="1" />
        <circle cx="260" cy="12" r="5" fill="white" opacity="0.8" />
        <line x1="265" y1="12" x2="265" y2="-10" stroke="white" strokeWidth="1" />
      </g>

      {/* Leaf accents */}
      {[
        { x: 50, y: 150, r: -20 }, { x: 350, y: 180, r: 25 },
        { x: 40, y: 350, r: -15 }, { x: 360, y: 320, r: 20 },
      ].map((l, i) => (
        <g key={i} transform={`translate(${l.x}, ${l.y}) rotate(${l.r})`} opacity="0.06">
          <ellipse cx="0" cy="0" rx="5" ry="15" fill="white" />
          <line x1="0" y1="-15" x2="0" y2="15" stroke="white" strokeWidth="0.5" opacity="0.5" />
        </g>
      ))}
    </svg>
  )
}

/** Electronic: circuit board traces, neon waveform lines, geometric grid, pulsing light trails */
export function ElectronicIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Geometric grid mesh */}
      <g opacity="0.04">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`gv-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="500" stroke="white" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`gh-${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="white" strokeWidth="0.5" />
        ))}
      </g>

      {/* Circuit board trace patterns */}
      <g opacity="0.1">
        <path d="M40 100 L100 100 L100 180 L160 180" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="160" cy="180" r="4" fill="white" opacity="0.6" />
        <path d="M240 80 L240 140 L320 140 L320 200" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="320" cy="200" r="4" fill="white" opacity="0.6" />
        <path d="M80 320 L160 320 L160 380 L240 380" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="240" cy="380" r="4" fill="white" opacity="0.6" />
        <path d="M300 300 L360 300 L360 380" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="360" cy="380" r="4" fill="white" opacity="0.6" />
      </g>

      {/* IC chip */}
      <g opacity="0.07" transform="translate(160, 230)">
        <rect x="0" y="0" width="80" height="50" rx="4" fill="white" opacity="0.4" />
        {[15, 30, 45, 60].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="0" x2={x} y2="-12" stroke="white" strokeWidth="1.5" />
            <line x1={x} y1="50" x2={x} y2="62" stroke="white" strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {/* Neon waveform lines */}
      <path d="M0 250 Q50 220, 80 250 L100 200 L120 280 L140 220 L160 260 Q200 250, 240 250 L260 210 L280 270 L300 230 L320 260 Q360 250, 400 250" stroke="white" strokeWidth="2" fill="none" opacity="0.1" className="animate-pulse-soft" />

      {/* Pulsing light trails */}
      {[
        { x: 80, y: 80, r: 6 }, { x: 320, y: 120, r: 5 },
        { x: 60, y: 400, r: 7 }, { x: 340, y: 420, r: 5 },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="white" opacity="0.08" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
    </svg>
  )
}

/** Orchestral: piano keys in perspective, flowing sheet music ribbons, ornate flourishes, violin scroll */
export function OrchestralIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Piano keys in perspective (bottom) */}
      <g opacity="0.08" transform="translate(40, 390)">
        {Array.from({ length: 16 }, (_, i) => (
          <g key={i}>
            <rect x={i * 20} y="0" width="19" height="80" fill="white" opacity="0.5" stroke="white" strokeWidth="0.5" />
            {/* Black keys */}
            {![0, 3, 7, 10, 14].includes(i % 7) && i < 15 && (
              <rect x={i * 20 + 12} y="0" width="14" height="50" fill="white" opacity="0.15" rx="2" />
            )}
          </g>
        ))}
      </g>

      {/* Flowing sheet music ribbons */}
      <path d="M0 150 Q100 120, 200 150 Q300 180, 400 140" stroke="white" strokeWidth="1" fill="none" opacity="0.06" />
      <path d="M0 160 Q100 130, 200 160 Q300 190, 400 150" stroke="white" strokeWidth="1" fill="none" opacity="0.05" />
      <path d="M0 170 Q100 140, 200 170 Q300 200, 400 160" stroke="white" strokeWidth="1" fill="none" opacity="0.04" />

      {/* Notes on ribbons */}
      <g opacity="0.08">
        <circle cx="120" cy="145" r="4" fill="white" />
        <line x1="124" y1="145" x2="124" y2="125" stroke="white" strokeWidth="1" />
        <circle cx="250" cy="165" r="4" fill="white" />
        <line x1="254" y1="165" x2="254" y2="145" stroke="white" strokeWidth="1" />
        <circle cx="340" cy="148" r="4" fill="white" />
        <line x1="344" y1="148" x2="344" y2="128" stroke="white" strokeWidth="1" />
      </g>

      {/* Ornate flourishes */}
      <g opacity="0.07">
        <path d="M50 250 Q80 230, 100 250 Q120 270, 100 290 Q80 300, 60 280 Q50 270, 70 260" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M350 250 Q320 230, 300 250 Q280 270, 300 290 Q320 300, 340 280 Q350 270, 330 260" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>

      {/* Violin scroll silhouette */}
      <g opacity="0.08" transform="translate(170, 50)">
        <path d="M30 0 Q10 10, 10 30 Q10 50, 30 60 Q50 70, 50 50 Q50 35, 35 30 Q25 35, 30 45" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="30" y1="60" x2="30" y2="120" stroke="white" strokeWidth="1.5" />
      </g>

      {/* Treble clef accent */}
      <g opacity="0.06" transform="translate(280, 60)">
        <path d="M10 40 Q0 30, 10 20 Q20 10, 15 0 Q10 10, 20 20 Q30 30, 20 40 Q10 50, 15 60" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/** Jazz: saxophone silhouette, smoky atmosphere wisps, swing-rhythm notes, vintage club aesthetic */
export function JazzIllustration(): ReactNode {
  return (
    <svg viewBox="0 0 400 500" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Saxophone silhouette */}
      <g opacity="0.1" transform="translate(240, 80)">
        <path d="M20 0 L20 30 Q20 50, 30 60 L40 80 Q50 100, 45 120 L40 150 Q35 180, 50 200 Q65 220, 60 250 Q55 270, 40 280 Q20 290, 10 280 Q0 270, 5 260" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Mouthpiece */}
        <ellipse cx="18" cy="5" rx="5" ry="8" stroke="white" strokeWidth="1" fill="none" opacity="0.7" />
        {/* Bell */}
        <ellipse cx="25" cy="275" rx="25" ry="15" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
        {/* Keys */}
        {[80, 110, 140, 170, 200].map((y, i) => (
          <circle key={i} cx={i % 2 ? 50 : 35} cy={y} r="4" stroke="white" strokeWidth="0.8" fill="none" opacity="0.5" />
        ))}
      </g>

      {/* Smoky atmosphere wisps */}
      <g opacity="0.06">
        <path d="M60 350 Q100 330, 120 340 Q140 350, 160 335 Q180 320, 210 340" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-drift" />
        <path d="M40 380 Q80 360, 110 370 Q140 380, 170 365 Q200 350, 230 370" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" className="animate-drift" style={{ animationDelay: '1s' }} />
        <path d="M50 410 Q90 395, 120 405 Q150 415, 180 400" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" className="animate-drift" style={{ animationDelay: '2s' }} />
      </g>

      {/* Swing-rhythm note patterns */}
      <g opacity="0.08" transform="translate(50, 120)" className="animate-float-slow">
        <circle cx="0" cy="15" r="5" fill="white" />
        <line x1="5" y1="15" x2="5" y2="-10" stroke="white" strokeWidth="1.5" />
        <path d="M5 -10 Q15 -5, 20 -10" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="20" cy="10" r="5" fill="white" />
        <line x1="25" y1="10" x2="25" y2="-10" stroke="white" strokeWidth="1.5" />
      </g>
      <g opacity="0.06" transform="translate(80, 250)" className="animate-float-delayed">
        <circle cx="0" cy="12" r="4" fill="white" />
        <line x1="4" y1="12" x2="4" y2="-5" stroke="white" strokeWidth="1" />
      </g>

      {/* Vintage club aesthetic - spotlight */}
      <g opacity="0.05">
        <polygon points="200,0 140,250 260,250" fill="white" />
      </g>

      {/* Star accents */}
      {[{ x: 100, y: 80 }, { x: 350, y: 150 }, { x: 60, y: 300 }].map((s, i) => (
        <g key={i} transform={`translate(${s.x}, ${s.y})`} opacity="0.07" className="animate-pulse-soft" style={{ animationDelay: `${i * 0.8}s` }}>
          <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="white" />
        </g>
      ))}
    </svg>
  )
}
