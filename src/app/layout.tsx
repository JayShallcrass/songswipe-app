import type { Metadata } from 'next'
import Header from '@/components/Header'
import { Providers } from '@/lib/providers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SongSwipe - Personalised AI Songs | Unique Gift Ideas',
    template: '%s | SongSwipe',
  },
  description: 'Create unique, personalised songs for your loved ones with AI. Perfect for birthdays, Valentine\'s, anniversaries, and every special moment.',
  keywords: ['personalised song', 'AI music gift', 'birthday song', 'Valentine\'s gift', 'unique gift ideas', 'custom song', 'AI generated music'],
  openGraph: {
    title: 'SongSwipe - Personalised AI Songs',
    description: 'Create unique, personalised songs for your loved ones with AI.',
    type: 'website',
    siteName: 'SongSwipe',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SongSwipe - Personalised AI Songs',
    description: 'Create unique, personalised songs for your loved ones with AI.',
  },
  robots: {
    index: true,
    follow: true,
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
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
