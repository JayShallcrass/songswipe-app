/**
 * SVG illustrations for the "How It Works" section.
 * Each icon is a detailed illustration (not just a heroicon).
 */

/** Step 1: Person speaking/describing with speech bubbles and music notes */
export function StepPersonalise() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
      {/* Background glow */}
      <circle cx="60" cy="60" r="50" fill="url(#step1-glow)" opacity="0.15" />

      {/* Person silhouette */}
      <circle cx="52" cy="38" r="12" fill="url(#step1-grad)" opacity="0.9" />
      <path
        d="M32 78 C32 62, 42 55, 52 55 C62 55, 72 62, 72 78"
        fill="url(#step1-grad)"
        opacity="0.7"
      />

      {/* Speech bubble */}
      <rect x="68" y="24" width="36" height="28" rx="8" fill="white" opacity="0.15" />
      <path d="M72 52 L68 58 L78 52" fill="white" opacity="0.15" />

      {/* Musical note in bubble */}
      <g transform="translate(74, 28)" opacity="0.9">
        <path d="M6 0v10a4 4 0 1 1-2-3.46V2h8v8a4 4 0 1 1-2-3.46V0H6z" fill="#e74c3c" transform="scale(1.2)" />
      </g>

      {/* Small floating notes */}
      <g transform="translate(86, 14)" opacity="0.5">
        <path d="M3 0v6a2.5 2.5 0 1 1-1.5-2.3V0H3z" fill="#8b5cf6" transform="scale(0.9)" />
      </g>
      <circle cx="96" cy="16" r="2" fill="#e74c3c" opacity="0.4" />

      <defs>
        <linearGradient id="step1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e74c3c" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <radialGradient id="step1-glow">
          <stop offset="0%" stopColor="#e74c3c" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/** Step 2: AI waveform with sparkles - brain/chip generating audio */
export function StepGenerate() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
      {/* Background glow */}
      <circle cx="60" cy="60" r="50" fill="url(#step2-glow)" opacity="0.15" />

      {/* Central AI chip/circle */}
      <circle cx="60" cy="55" r="20" stroke="url(#step2-grad)" strokeWidth="2" fill="none" opacity="0.6" />
      <circle cx="60" cy="55" r="10" fill="url(#step2-grad)" opacity="0.3" />

      {/* AI "brain" circuit lines */}
      <path d="M60 35 L60 25" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.5" />
      <path d="M60 75 L60 85" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.5" />
      <path d="M40 55 L30 55" stroke="#e74c3c" strokeWidth="1.5" opacity="0.5" />
      <path d="M80 55 L90 55" stroke="#e74c3c" strokeWidth="1.5" opacity="0.5" />

      {/* Dots at circuit endpoints */}
      <circle cx="60" cy="25" r="2.5" fill="#8b5cf6" opacity="0.7" />
      <circle cx="60" cy="85" r="2.5" fill="#8b5cf6" opacity="0.7" />
      <circle cx="30" cy="55" r="2.5" fill="#e74c3c" opacity="0.7" />
      <circle cx="90" cy="55" r="2.5" fill="#e74c3c" opacity="0.7" />

      {/* Audio waveform coming out */}
      <path
        d="M25 90 Q32 82, 38 90 T52 90 T66 90 T80 90 T95 90"
        stroke="url(#step2-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Sparkles */}
      <path d="M45 30 L47 26 L49 30 L47 34 Z" fill="#e74c3c" opacity="0.5" />
      <path d="M78 32 L80 28 L82 32 L80 36 Z" fill="#8b5cf6" opacity="0.5" />
      <path d="M90 70 L92 67 L94 70 L92 73 Z" fill="#e74c3c" opacity="0.4" />

      <defs>
        <linearGradient id="step2-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e74c3c" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <radialGradient id="step2-glow">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/** Step 3: Gift box with music and download arrow */
export function StepShare() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
      {/* Background glow */}
      <circle cx="60" cy="60" r="50" fill="url(#step3-glow)" opacity="0.15" />

      {/* Gift box - lid */}
      <rect x="30" y="42" width="52" height="12" rx="3" fill="url(#step3-grad)" opacity="0.8" />
      {/* Ribbon vertical */}
      <rect x="53" y="42" width="6" height="12" fill="white" opacity="0.2" />
      {/* Ribbon bow */}
      <path d="M56 42 C56 36, 48 34, 48 38 C48 42, 56 42, 56 42" fill="white" opacity="0.2" />
      <path d="M56 42 C56 36, 64 34, 64 38 C64 42, 56 42, 56 42" fill="white" opacity="0.2" />

      {/* Gift box - body */}
      <rect x="33" y="54" width="46" height="30" rx="3" fill="url(#step3-grad)" opacity="0.6" />
      {/* Ribbon on body */}
      <rect x="53" y="54" width="6" height="30" fill="white" opacity="0.15" />

      {/* Download arrow */}
      <path d="M86 30 L86 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path d="M80 26 L86 32 L92 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {/* Download base line */}
      <path d="M78 32 L94 32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

      {/* Musical notes floating from box */}
      <g transform="translate(20, 24)" opacity="0.6">
        <path d="M4 0v7a3 3 0 1 1-1.5-2.6V1.5h5V7a3 3 0 1 1-1.5-2.6V0H4z" fill="#e74c3c" transform="scale(0.9)" />
      </g>
      <g transform="translate(76, 20)" opacity="0.5">
        <path d="M2.5 0v5a2 2 0 1 1-1-1.7V0h1z" fill="#8b5cf6" transform="scale(0.9)" />
      </g>

      {/* Share arrow */}
      <path d="M28 80 L20 72 L28 64" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      <path d="M20 72 L32 72" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

      {/* Hearts/sparkles */}
      <circle cx="98" cy="48" r="2" fill="#e74c3c" opacity="0.4" />
      <circle cx="16" cy="55" r="1.5" fill="#8b5cf6" opacity="0.3" />

      <defs>
        <linearGradient id="step3-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e74c3c" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <radialGradient id="step3-glow">
          <stop offset="0%" stopColor="#e74c3c" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  )
}
