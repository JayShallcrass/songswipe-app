import type { Metadata } from 'next'
import Header from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'SongSwipe - Create Your Personalized Song',
  description: 'AI-powered personalized song gift platform. Create unique songs for Valentine\'s, birthdays, anniversaries and more.',
  openGraph: {
    title: 'SongSwipe - Create Your Song',
    description: 'AI-powered personalized song gift platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        {children}
      </body>
    </html>
  )
}
