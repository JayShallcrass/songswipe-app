import { ReactNode } from 'react'

interface PhoneMockupProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  rotation?: number
  className?: string
}

/**
 * iPhone-style phone frame. Children render inside the screen area.
 * The SVG frame sits behind the content so nothing covers it.
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
      {/* Phone body background (behind everything) */}
      <div
        className="absolute inset-0 rounded-[--phone-r] bg-[#1a1a1e] border border-[#333]"
        style={{ '--phone-r': `${s.r}px` } as React.CSSProperties}
      />

      {/* Screen content area (middle layer) */}
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

      {/* Dynamic Island (top layer, small element) */}
      <div
        className="absolute bg-[#1a1a1e]"
        style={{
          left: (s.w - s.notchW) / 2,
          top: s.bezel + 6,
          width: s.notchW,
          height: s.notchH,
          borderRadius: s.notchH / 2,
          zIndex: 2,
        }}
      />
    </div>
  )
}
