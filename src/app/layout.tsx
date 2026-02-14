import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import Header from '@/components/Header'
import PromoBanner from '@/components/PromoBanner'
import CookieConsent from '@/components/CookieConsent'
import { Providers } from '@/lib/providers'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://songswipe.io'),
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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased font-body">
        <Providers>
          <PromoBanner />
          <Header />
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
