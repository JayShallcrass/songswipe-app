import { ReactNode } from 'react'

interface PhoneMockupProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  rotation?: number
  className?: string
}

/**
 * CSS/SVG phone frame (iPhone-style rounded rect with notch).
 * Renders children inside the "screen" area.
 */
export default function PhoneMockup({ children, size = 'md', rotation = 0, className = '' }: PhoneMockupProps) {
  const sizes = {
    sm: { w: 160, h: 320, notchW: 50, notchH: 14, r: 24, bezel: 6 },
    md: { w: 200, h: 400, notchW: 60, notchH: 16, r: 30, bezel: 8 },
    lg: { w: 260, h: 520, notchW: 76, notchH: 20, r: 38, bezel: 10 },
  }

  const s = sizes[size]

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        width: s.w,
        height: s.h,
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
      }}
    >
      {/* Phone frame */}
      <svg
        viewBox={`0 0 ${s.w} ${s.h}`}
        fill="none"
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 2 }}
      >
        {/* Outer body */}
        <rect x="0" y="0" width={s.w} height={s.h} rx={s.r} fill="#1a1a1e" stroke="#333" strokeWidth="2" />
        {/* Screen cutout (transparent) */}
        <rect x={s.bezel} y={s.bezel} width={s.w - s.bezel * 2} height={s.h - s.bezel * 2} rx={s.r - 4} fill="black" />
        {/* Dynamic Island / notch */}
        <rect
          x={(s.w - s.notchW) / 2}
          y={s.bezel + 6}
          width={s.notchW}
          height={s.notchH}
          rx={s.notchH / 2}
          fill="#1a1a1e"
        />
        {/* Glass reflection highlight */}
        <rect
          x={s.bezel + 4}
          y={s.bezel + 4}
          width={(s.w - s.bezel * 2) * 0.4}
          height={s.h * 0.15}
          rx={s.r - 6}
          fill="white"
          opacity="0.03"
        />
      </svg>

      {/* Screen content area */}
      <div
        className="absolute overflow-hidden bg-surface-DEFAULT"
        style={{
          left: s.bezel,
          top: s.bezel,
          width: s.w - s.bezel * 2,
          height: s.h - s.bezel * 2,
          borderRadius: s.r - 4,
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  )
}
