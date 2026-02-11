'use client'

import { useState } from 'react'
import Link from 'next/link'

interface HelpItem {
  question: string
  answer: string
}

const helpItems: HelpItem[] = [
  {
    question: 'Where\'s my song?',
    answer: 'Check your dashboard under the "My Songs" tab. If you just placed an order, generation takes 2 to 3 minutes. Refresh the page if needed. If your song still hasn\'t appeared after 5 minutes, check the "Orders" tab for the status of your order.',
  },
  {
    question: 'Can I regenerate my song?',
    answer: 'The 3 variants you receive are final for that order. If you\'d like a different take, you can create a new song with different style choices or personalisation details.',
  },
  {
    question: 'How do I share my song?',
    answer: 'Select your favourite variant from the generation page, then use the share link or share buttons to send it via WhatsApp, email, Facebook, or any other method. The recipient doesn\'t need a SongSwipe account to listen.',
  },
  {
    question: 'What\'s a variant?',
    answer: 'When you order a song, our AI creates 3 unique versions (variants) of your song. Each has the same personalisation but a slightly different musical interpretation. Listen to all 3 and pick the one you love most.',
  },
  {
    question: 'My song didn\'t generate or something went wrong',
    answer: 'Sorry about that! If your song failed to generate, you should receive an automatic refund. If not, or if something else went wrong, please contact us at support@songswipe.io with your order details and we\'ll sort it out.',
  },
  {
    question: 'How do I use my prepaid songs?',
    answer: 'Prepaid songs from bundles are applied automatically at checkout. When you create a new song, the system will use your prepaid balance instead of charging your card. You can see your remaining balance on the dashboard.',
  },
  {
    question: 'Can I change my song after selecting a variant?',
    answer: 'Once you\'ve selected your favourite variant, the choice is final. Your selected song is the one that appears on your share link and download. Choose carefully when picking between your 3 variants!',
  },
  {
    question: 'How do I delete my account?',
    answer: 'Contact us at support@songswipe.io and we\'ll process your account deletion. We\'re working on a self-service option for the future.',
  },
]

function HelpAccordionItem({ item }: { item: HelpItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-surface-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 text-left hover:text-brand-400 transition-colors"
      >
        <span className="font-medium text-white pr-4">{item.question}</span>
        <span
          className={`text-zinc-500 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-zinc-400 leading-relaxed px-1">{item.answer}</p>
      </div>
    </div>
  )
}

export default function DashboardHelpPage() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-brand-500 hover:text-brand-400 text-sm font-medium inline-flex items-center gap-1 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-heading font-bold mt-4 text-gradient">
            Help & Support
          </h1>
          <p className="text-zinc-500 mt-2">Quick answers to common questions</p>
        </div>

        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6">
          {helpItems.map((item) => (
            <HelpAccordionItem key={item.question} item={item} />
          ))}
        </div>

        <div className="mt-8 bg-surface-50 border border-surface-200 rounded-2xl p-6 text-center">
          <p className="text-white font-medium mb-2">Need more help?</p>
          <p className="text-zinc-500 text-sm mb-4">
            Check out our{' '}
            <Link href="/faq" className="text-brand-500 hover:text-brand-400 underline transition-colors">
              full FAQ
            </Link>{' '}
            or get in touch.
          </p>
          <a
            href="mailto:support@songswipe.io"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-md"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  )
}
