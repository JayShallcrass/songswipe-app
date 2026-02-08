'use client'

import {
  WhatsappShareButton,
  WhatsappIcon,
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  XIcon,
} from 'react-share'
import { CopyLinkButton } from './CopyLinkButton'

interface ShareButtonsProps {
  url: string
  title: string
  recipientName: string
  occasion: string
}

export function ShareButtons({ url, title, recipientName, occasion }: ShareButtonsProps) {
  const shareText = `Check out this personalized ${occasion} song for ${recipientName}!`

  return (
    <section className="text-center space-y-6">
      {/* Heading */}
      <h3 className="text-xl font-semibold text-white">Share this gift</h3>

      {/* Share Buttons Row */}
      <div className="flex gap-4 items-center justify-center">
        <WhatsappShareButton url={url} title={shareText}>
          <WhatsappIcon size={48} round />
        </WhatsappShareButton>

        <FacebookShareButton url={url} hashtag="#SongSwipe">
          <FacebookIcon size={48} round />
        </FacebookShareButton>

        <TwitterShareButton url={url} title={shareText}>
          <XIcon size={48} round />
        </TwitterShareButton>

        <CopyLinkButton url={url} />
      </div>

      {/* Helper Text */}
      <p className="text-sm text-gray-400">
        Share this special gift with friends and family
      </p>
    </section>
  )
}
