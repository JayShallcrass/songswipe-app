import { ReactNode } from 'react'

interface PhoneMockupProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  rotation?: number
  className?: string
}

/**
 * iPhone-style phone frame. Children render inside the screen area.
 */
export default function PhoneMockup({ children, size = 'md', rotation = 0, className = '' }: PhoneMockupProps) {
  const sizes = {
    sm: { w: 220, h: 440, r: 32, bezel: 8 },
    md: { w: 280, h: 560, r: 40, bezel: 10 },
    lg: { w: 340, h: 680, r: 48, bezel: 12 },
  }

  const s = sizes[size]

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        width: s.w,
        height: s.h,
        transform: `rotate(${rotation}deg)`,
        filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))',
      }}
    >
      {/* Phone body */}
      <div
        className="absolute inset-0 bg-[#1a1a1e] border-2 border-[#333]"
        style={{ borderRadius: s.r }}
      />

      {/* Screen content */}
      <div
        className="absolute overflow-hidden bg-surface-DEFAULT"
        style={{
          left: s.bezel,
          top: s.bezel,
          width: s.w - s.bezel * 2,
          height: s.h - s.bezel * 2,
          borderRadius: s.r - 6,
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  )
}
