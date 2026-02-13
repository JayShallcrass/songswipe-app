'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  WhatsappShareButton,
  WhatsappIcon,
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  XIcon,
} from 'react-share'
import { CopyLinkButton } from '@/components/share/CopyLinkButton'
import { useDownloadSong } from '@/lib/hooks/useDownloadSong'
import { generateShareUrl } from '@/lib/share/generateShareUrl'
import { BundleOfferCard } from '@/components/upsells/BundleOfferCard'
import { CheckCircleIcon, EnvelopeIcon, CalendarDaysIcon } from '@heroicons/react/24/solid'

interface ShareData {
  variantId: string
  shareToken: string | null
  recipientName: string
  senderName: string
  occasion: string
  occasionDate: string | null
}

interface PostSelectionShareProps {
  data: ShareData
}

type EmailStatus = 'idle' | 'sending' | 'sent' | 'scheduled' | 'error'

function formatOccasion(occ: string) {
  return occ
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function PostSelectionShare({ data }: PostSelectionShareProps) {
  const { variantId, shareToken, recipientName, senderName, occasion, occasionDate } = data
  const downloadMutation = useDownloadSong()

  // Email form state
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState(occasionDate || '')
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')
  const [emailError, setEmailError] = useState('')

  const shareUrl = shareToken ? generateShareUrl(shareToken) : null
  const occasionText = formatOccasion(occasion)
  const shareText = `Check out this personalised ${occasionText.toLowerCase()} song for ${recipientName}!`

  // Minimum date for scheduling (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minScheduleDate = tomorrow.toISOString().split('T')[0]

  const handleSendEmail = async () => {
    if (!recipientEmail || !shareUrl) return

    setEmailStatus('sending')
    setEmailError('')

    try {
      const body: Record<string, string> = {
        recipientEmail,
        recipientName,
        senderName,
        occasion,
        shareUrl,
      }

      if (personalMessage.trim()) {
        body.personalMessage = personalMessage.trim()
      }

      if (scheduleEnabled && scheduleDate) {
        // Schedule for 9am on the selected date
        const scheduled = new Date(`${scheduleDate}T09:00:00`)
        body.scheduledAt = scheduled.toISOString()
      }

      const response = await fetch('/api/email/send-gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to send email')
      }

      const result = await response.json()
      setEmailStatus(result.scheduled ? 'scheduled' : 'sent')
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to send email')
      setEmailStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-surface-DEFAULT flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Success header */}
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-4"><CheckCircleIcon className="w-16 h-16 text-green-500" /></div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Your song is ready!
          </h1>
          <p className="text-lg text-zinc-400">
            A personalised {occasionText.toLowerCase()} song for {recipientName}
          </p>
        </div>

        {/* Share options */}
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-8 space-y-6">
          <h2 className="text-xl font-semibold text-white text-center">
            Share the gift
          </h2>

          {/* Share link */}
          {shareUrl && (
            <div className="bg-surface-100 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-2 font-medium">Gift link</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface-50 rounded-lg border border-surface-200 p-3 overflow-hidden">
                  <p className="text-zinc-300 text-sm truncate font-mono">{shareUrl}</p>
                </div>
                <CopyLinkButton url={shareUrl} />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {recipientName} will see a gift reveal experience when they open this link
              </p>
            </div>
          )}

          {/* Social share buttons */}
          {shareUrl && (
            <div className="flex gap-4 items-center justify-center">
              <WhatsappShareButton url={shareUrl} title={shareText}>
                <WhatsappIcon size={48} round />
              </WhatsappShareButton>

              <FacebookShareButton url={shareUrl} hashtag="#SongSwipe">
                <FacebookIcon size={48} round />
              </FacebookShareButton>

              <TwitterShareButton url={shareUrl} title={shareText}>
                <XIcon size={48} round />
              </TwitterShareButton>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-surface-200" />

          {/* Email gift */}
          {!showEmailForm && emailStatus === 'idle' && (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full py-4 px-6 bg-gradient-to-r from-brand-500 to-purple-600 text-white font-semibold rounded-xl hover:from-brand-600 hover:to-purple-700 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email the gift to {recipientName}
            </button>
          )}

          {/* Email form */}
          {showEmailForm && emailStatus === 'idle' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email this gift
              </h3>

              {/* Recipient email */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  {recipientName}&apos;s email address
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="them@example.com"
                  className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              {/* Personal message */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Add a personal message <span className="text-zinc-500">(optional)</span>
                </label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Hope you love this!"
                  rows={2}
                  maxLength={300}
                  className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Schedule toggle */}
              <div className="bg-surface-100 rounded-xl p-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={(e) => setScheduleEnabled(e.target.checked)}
                    className="w-5 h-5 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-medium text-white">Schedule for later</span>
                    <p className="text-xs text-zinc-500">
                      Perfect if the occasion is coming up. Email arrives at 9am on the day you choose.
                    </p>
                  </div>
                </label>

                {scheduleEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Send date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={minScheduleDate}
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                    {occasionDate && (
                      <p className="text-xs text-brand-400 mt-1">
                        The occasion date is {new Date(occasionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Send buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendEmail}
                  disabled={!recipientEmail || (scheduleEnabled && !scheduleDate)}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-brand-500 to-purple-600 text-white font-semibold rounded-lg hover:from-brand-600 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {scheduleEnabled ? 'Schedule Email' : 'Send Now'}
                </button>
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="px-4 py-3 text-zinc-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Email sending state */}
          {emailStatus === 'sending' && (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-zinc-400">{scheduleEnabled ? 'Scheduling...' : 'Sending...'}</p>
            </div>
          )}

          {/* Email sent confirmation */}
          {emailStatus === 'sent' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2"><EnvelopeIcon className="w-8 h-8 text-green-400" /></div>
              <p className="text-green-400 font-semibold">Email sent!</p>
              <p className="text-green-400/80 text-sm mt-1">
                {recipientName} will receive the gift at {recipientEmail}
              </p>
            </div>
          )}

          {/* Email scheduled confirmation */}
          {emailStatus === 'scheduled' && (
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2"><CalendarDaysIcon className="w-8 h-8 text-brand-400" /></div>
              <p className="text-brand-400 font-semibold">Email scheduled!</p>
              <p className="text-brand-400/80 text-sm mt-1">
                {recipientName} will receive the gift on{' '}
                {new Date(scheduleDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at 9am
              </p>
            </div>
          )}

          {/* Email error */}
          {emailStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm mb-2">{emailError}</p>
              <button
                onClick={() => setEmailStatus('idle')}
                className="text-red-400 font-medium text-sm underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Download */}
        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6">
          <button
            onClick={() => downloadMutation.mutate(variantId)}
            disabled={downloadMutation.isPending}
            className="w-full py-4 px-6 border-2 border-surface-300 text-white font-semibold rounded-xl hover:bg-surface-100 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloadMutation.isPending ? 'Downloading...' : 'Download MP3'}
          </button>
        </div>

        {/* Bundle offer - make more songs */}
        <BundleOfferCard />

        {/* Dashboard link */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-zinc-500 hover:text-white font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
