'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import AudioPreview from '@/components/AudioPreview'
import Footer from '@/components/Footer'
import HeroBackground from '@/components/illustrations/HeroBackground'
import HeroPhoneMockups from '@/components/illustrations/landing/HeroIllustration'
import PhoneMockup from '@/components/illustrations/landing/PhoneMockup'
import { SwipeScreenshot, FormScreenshot, PlayerScreenshot } from '@/components/illustrations/landing/ScreenshotIllustrations'
import { StepPersonalise, StepGenerate, StepShare } from '@/components/illustrations/StepIcons'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT relative overflow-hidden">
      {/* Full-page animated background */}
      <HeroBackground />

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 md:pb-24 px-4">

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-white leading-tight">
                Songs Made Just<br />for Them
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl font-body">
                AI-powered personalised songs for birthdays, Valentine&apos;s, anniversaries,
                and every moment worth celebrating. A gift they&apos;ll never forget.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-6">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-full hover:from-brand-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Create a Song
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-zinc-300 border border-surface-300 rounded-full hover:bg-surface-100 hover:text-white transition-all"
                >
                  View Pricing
                </Link>
              </div>
              <p className="text-sm text-zinc-500">Starting at &pound;7.99 &middot; 60-120 second songs &middot; Instant download</p>
            </div>

            {/* Phone mockups */}
            <div className="flex-shrink-0 hidden sm:block">
              <HeroPhoneMockups />
            </div>
          </div>
        </div>
      </section>

      {/* Audio Previews */}
      <AudioPreview />

      {/* How It Works */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            className="text-3xl font-heading font-bold text-center mb-14 text-white"
          >
            How It Works
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-10"
          >
            {[
              {
                icon: <StepPersonalise />,
                title: 'Tell Us About Them',
                description: 'Share their name, the occasion, mood, and any special memories you want included.',
                screenshot: <FormScreenshot />,
              },
              {
                icon: <StepGenerate />,
                title: 'AI Generates Your Song',
                description: 'Our AI creates a unique, professional-quality song in just a few minutes.',
                screenshot: <SwipeScreenshot />,
              },
              {
                icon: <StepShare />,
                title: 'Download & Share',
                description: 'Get your personalised MP3 and make their day unforgettable.',
                screenshot: <PlayerScreenshot />,
              },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center group">
                {/* Phone mockup showing the step */}
                <div className="flex justify-center mb-6">
                  <PhoneMockup size="sm">
                    {step.screenshot}
                  </PhoneMockup>
                </div>
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-50 border border-surface-200 p-3 group-hover:border-brand-500/30 transition-all">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={stagger}
        className="relative py-20 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp}>
            <h2 className="text-3xl font-heading font-bold text-center mb-4 text-white">
              Loved by Gift-Givers
            </h2>
            <p className="text-zinc-500 text-center mb-12">
              Join hundreds of people creating unforgettable gifts
            </p>
          </motion.div>

          {/* App Store style rating */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-10">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-white font-semibold text-lg">4.9</span>
            <span className="text-zinc-500 text-sm">from early users</span>
          </motion.div>

          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "My mum cried happy tears when she heard her birthday song. Absolutely worth every penny.",
                name: "Emily R.",
                occasion: "Birthday",
              },
              {
                quote: "Way better than a card. My wife plays it every morning. Best Valentine's gift I've ever given.",
                name: "Marcus T.",
                occasion: "Valentine's Day",
              },
              {
                quote: "Used it for our 10th anniversary. The personalised lyrics were spot-on. Genuinely impressive.",
                name: "Sophie K.",
                occasion: "Anniversary",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-surface-50 border border-surface-200 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{testimonial.name}</p>
                    <p className="text-zinc-500 text-xs">{testimonial.occasion}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={stagger}
        className="relative py-20 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-3xl font-heading font-bold text-center mb-14 text-white">Why SongSwipe?</motion.h2>
          <motion.div variants={stagger} className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "100% Personalised",
                description: "Every song is unique, written specifically for your recipient with their name, memories, and your message woven throughout.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
                title: "Ready in Minutes",
                description: "No waiting weeks for a human songwriter. Your AI-generated song is ready almost instantly.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                ),
                title: "10x Cheaper",
                description: "Professional human songs cost \u00a3100+. Our AI delivers comparable quality for just \u00a37.99.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                ),
                title: "Perfect Gift",
                description: "Stand out from generic cards and flowers with a truly unique, personal gift they'll treasure forever.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-surface-50 border border-surface-200 rounded-2xl p-6 hover:border-surface-300 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeUp}
        className="relative py-20 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-heading font-bold mb-4 text-white">Simple, Transparent Pricing</h2>
          <p className="text-zinc-500 mb-10">One price. Three song variants. No hidden fees.</p>
          <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-zinc-400 mb-2 text-sm font-medium uppercase tracking-wider">Single Song</div>
            <div className="text-5xl font-bold text-white mb-1">&pound;7.99</div>
            <p className="text-zinc-500 text-sm mb-6">one-time payment</p>
            <ul className="text-left text-zinc-400 space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>60-120 second personalised song</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>3 unique variants to choose from</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>MP3 download included</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Shareable gift link</span>
              </li>
            </ul>
            <Link
              href="/auth/login"
              className="block w-full py-4 text-center font-semibold text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-full hover:from-brand-600 hover:to-purple-700 transition-all hover:scale-[1.02]"
            >
              Create Now
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeUp}
        className="relative py-20 px-4"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white">
            Make Their Day Unforgettable
          </h2>
          <p className="text-zinc-400 mb-8 text-lg">
            A personalised song says what words alone can&apos;t. Create yours in minutes.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-gradient-to-r from-brand-500 to-purple-600 rounded-full hover:from-brand-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Create a Song
          </Link>
        </div>
      </motion.section>

      <Footer />
    </div>
  )
}
