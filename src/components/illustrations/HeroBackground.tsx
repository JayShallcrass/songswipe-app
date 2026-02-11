'use client'

/**
 * Animated hero background with sound waves, musical notes, and warm accent lighting.
 * Pure SVG + CSS - no raster images needed.
 */
export default function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Radial glow - coral/purple center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[700px]">
        <div className="absolute inset-0 bg-gradient-radial from-brand-500/12 via-purple-600/8 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Secondary glow - offset */}
      <div className="absolute top-[30%] left-[60%] w-[500px] h-[400px]">
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Sound waves SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Flowing sound wave lines */}
        <path
          d="M0 400 Q 180 300, 360 400 T 720 400 T 1080 400 T 1440 400"
          stroke="url(#wave-gradient)"
          strokeWidth="2"
          className="animate-wave-1"
        />
        <path
          d="M0 420 Q 200 340, 400 420 T 800 420 T 1200 420 T 1440 420"
          stroke="url(#wave-gradient)"
          strokeWidth="1.5"
          className="animate-wave-2"
        />
        <path
          d="M0 380 Q 160 310, 320 380 T 640 380 T 960 380 T 1280 380 T 1440 380"
          stroke="url(#wave-gradient)"
          strokeWidth="1"
          className="animate-wave-3"
        />

        {/* Equaliser bars - left cluster */}
        {[200, 220, 240, 260, 280].map((x, i) => (
          <rect
            key={`eq-l-${i}`}
            x={x}
            y={500 - [40, 70, 55, 80, 35][i]}
            width="8"
            height={[40, 70, 55, 80, 35][i]}
            rx="4"
            fill="url(#bar-gradient)"
            className="animate-eq-bar"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}

        {/* Equaliser bars - right cluster */}
        {[1140, 1160, 1180, 1200, 1220].map((x, i) => (
          <rect
            key={`eq-r-${i}`}
            x={x}
            y={500 - [35, 60, 45, 75, 50][i]}
            width="8"
            height={[35, 60, 45, 75, 50][i]}
            rx="4"
            fill="url(#bar-gradient)"
            className="animate-eq-bar"
            style={{ animationDelay: `${i * 0.12 + 0.5}s` }}
          />
        ))}

        {/* Floating musical notes */}
        <g className="animate-float-1" fill="url(#note-gradient)">
          <text x="120" y="250" fontSize="28" fontFamily="serif" opacity="0.6">&#9835;</text>
        </g>
        <g className="animate-float-2" fill="url(#note-gradient)">
          <text x="1280" y="200" fontSize="32" fontFamily="serif" opacity="0.5">&#9834;</text>
        </g>
        <g className="animate-float-3" fill="url(#note-gradient)">
          <text x="680" y="150" fontSize="24" fontFamily="serif" opacity="0.4">&#9833;</text>
        </g>
        <g className="animate-float-1" fill="url(#note-gradient)">
          <text x="900" y="620" fontSize="28" fontFamily="serif" opacity="0.3">&#9835;</text>
        </g>
        <g className="animate-float-2" fill="url(#note-gradient)">
          <text x="400" y="600" fontSize="20" fontFamily="serif" opacity="0.35">&#9834;</text>
        </g>

        {/* Circular waveform rings */}
        <circle cx="720" cy="400" r="120" stroke="url(#wave-gradient)" strokeWidth="0.5" fill="none" opacity="0.3" className="animate-ring-pulse" />
        <circle cx="720" cy="400" r="200" stroke="url(#wave-gradient)" strokeWidth="0.3" fill="none" opacity="0.2" className="animate-ring-pulse" style={{ animationDelay: '1s' }} />
        <circle cx="720" cy="400" r="280" stroke="url(#wave-gradient)" strokeWidth="0.2" fill="none" opacity="0.1" className="animate-ring-pulse" style={{ animationDelay: '2s' }} />

        {/* Gradients */}
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#e74c3c" />
          </linearGradient>
          <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="note-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      <style jsx>{`
        @keyframes wave1 {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-30px); }
        }
        @keyframes wave2 {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(20px); }
        }
        @keyframes wave3 {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-15px); }
        }
        @keyframes eqBar {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes floatUpAlt {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes floatUpSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.05; }
        }
        .animate-wave-1 { animation: wave1 8s ease-in-out infinite; }
        .animate-wave-2 { animation: wave2 6s ease-in-out infinite; }
        .animate-wave-3 { animation: wave3 10s ease-in-out infinite; }
        .animate-eq-bar { animation: eqBar 1.2s ease-in-out infinite; transform-origin: bottom; }
        .animate-float-1 { animation: floatUp 6s ease-in-out infinite; }
        .animate-float-2 { animation: floatUpAlt 8s ease-in-out infinite; }
        .animate-float-3 { animation: floatUpSlow 10s ease-in-out infinite; }
        .animate-ring-pulse { animation: ringPulse 4s ease-in-out infinite; transform-origin: center; }
      `}</style>
    </div>
  )
}
