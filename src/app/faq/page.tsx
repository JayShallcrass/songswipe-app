'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSection {
  title: string
  items: FAQItem[]
}

const faqSections: FAQSection[] = [
  {
    title: 'How It Works',
    items: [
      {
        question: 'What is SongSwipe?',
        answer: 'SongSwipe is an AI-powered platform that creates personalised songs for special occasions. You tell us about the person, the occasion, and any special memories, and our AI generates a unique, professional-quality song just for them.',
      },
      {
        question: 'How does it work?',
        answer: 'It\'s simple: swipe through style options to pick the mood, genre, and voice for your song. Add personal details like their name and special memories. Our AI then generates 3 unique song variants for you to choose from. The whole process takes just a few minutes.',
      },
      {
        question: 'How long does it take to generate a song?',
        answer: 'Song generation typically takes 2 to 3 minutes. You\'ll see a progress screen while your song is being created, and you\'ll be notified as soon as it\'s ready.',
      },
      {
        question: 'Can I hear a sample before buying?',
        answer: 'We don\'t offer pre-purchase samples because every song is uniquely generated based on your personal details. However, you get 3 different variants to choose from, so you\'re very likely to find one you love.',
      },
    ],
  },
  {
    title: 'Pricing & Payment',
    items: [
      {
        question: 'How much does a song cost?',
        answer: 'A single personalised song costs just \u00a37.99. We also offer bundles of 3 and 5 songs at a discount if you have multiple occasions coming up.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) through Stripe, our secure payment processor. All prices are in GBP.',
      },
      {
        question: 'Can I buy songs in bulk?',
        answer: 'Yes! We offer bundles of 3 and 5 songs at a discounted rate. Prepaid songs can be used for any occasion and don\'t expire.',
      },
      {
        question: 'What\'s your refund policy?',
        answer: 'If all song variants fail to generate due to a technical error, you\'ll get a full refund. Because songs are AI-generated digital content delivered immediately, we can\'t offer refunds based on subjective quality preferences. See our Terms of Service for full details.',
      },
    ],
  },
  {
    title: 'Songs & Sharing',
    items: [
      {
        question: 'What occasions can I create songs for?',
        answer: 'Birthdays, Valentine\'s Day, anniversaries, weddings, graduations, Mother\'s Day, Father\'s Day, Christmas, or just because. If there\'s someone you want to celebrate, there\'s a song for that.',
      },
      {
        question: 'How do I share my song?',
        answer: 'Once you\'ve chosen your favourite variant, you\'ll get a unique share link that you can send to anyone. The link works on any device, no account needed. You can also share directly via WhatsApp, Facebook, Twitter, or email.',
      },
      {
        question: 'Can I download the song?',
        answer: 'Yes! Every song is available as an MP3 download that you can keep forever, play on any device, or include with a physical gift.',
      },
      {
        question: 'Who owns the song?',
        answer: 'You receive a personal, non-commercial licence to listen to, download, and share your song. SongSwipe retains the underlying IP. Songs cannot be resold or commercially distributed. See our Terms of Service for full details.',
      },
    ],
  },
  {
    title: 'Privacy & Safety',
    items: [
      {
        question: 'What data do you collect?',
        answer: 'We collect your name, email, and the personalisation details you provide for your songs. Payment is processed by Stripe, so we never see or store your card details. Read our full Privacy Policy for complete details.',
      },
      {
        question: 'Is my data safe?',
        answer: 'Yes. We\'re fully UK GDPR compliant. Your data is encrypted, we use industry-standard security practices, and we never sell your personal information to third parties.',
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes. Contact us at support@songswipe.io and we\'ll delete your account and personal data. Payment records are retained for 6 years as required by HMRC.',
      },
    ],
  },
]

function AccordionItem({ item }: { item: FAQItem }) {
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

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-3 text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-zinc-500">Everything you need to know about SongSwipe</p>
        </div>

        <div className="space-y-8">
          {faqSections.map((section) => (
            <div key={section.title} className="bg-surface-50 border border-surface-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                {section.title}
              </h2>
              <div>
                {section.items.map((item) => (
                  <AccordionItem key={item.question} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-zinc-500 mb-4">Still have questions?</p>
          <a
            href="mailto:support@songswipe.io"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-full font-semibold hover:from-brand-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Contact Us
          </a>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-brand-500 hover:text-brand-400 text-sm font-medium transition-colors">
            Back to SongSwipe
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
