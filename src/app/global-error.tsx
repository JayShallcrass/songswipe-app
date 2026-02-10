'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif', margin: 0 }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f3ff, #fff, #fdf2f8)',
          padding: '1rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>😵</div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Don&apos;t worry, your songs are safe. This is just a temporary hiccup.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #ec4899, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
