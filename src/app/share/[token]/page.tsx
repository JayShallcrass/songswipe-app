import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { generateShareUrl } from '@/lib/share/generateShareUrl'
import { GiftReveal } from '@/components/share/GiftReveal'
import { ShareButtons } from '@/components/share/ShareButtons'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface PageProps {
  params: { token: string }
}

// Helper to format occasion for display
function formatOccasion(occasion: string): string {
  return occasion
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Data fetching helper (used by both page and metadata)
async function fetchShareData(token: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('song_variants')
    .select(`
      id,
      storage_path,
      duration_ms,
      share_token,
      orders(
        id,
        occasion_date,
        created_at,
        customizations(
          recipient_name,
          your_name,
          occasion,
          genre,
          mood
        )
      )
    `)
    .eq('share_token', token)
    .eq('selected', true)
    .eq('generation_status', 'complete')
    .single()

  if (error || !data) {
    return null
  }

  // Unwrap nested response
  const order = Array.isArray(data.orders) ? data.orders[0] : data.orders
  const customisationData = order?.customizations
  const customisation = Array.isArray(customisationData) ? customisationData[0] : customisationData

  if (!order || !customisation) {
    return null
  }

  return {
    id: data.id,
    storagePath: data.storage_path,
    durationMs: data.duration_ms,
    shareToken: data.share_token,
    recipientName: customisation.recipient_name,
    senderName: customisation.your_name,
    occasion: customisation.occasion,
    genre: customisation.genre,
    mood: customisation.mood,
    occasionDate: order.occasion_date,
    orderCreatedAt: order.created_at,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = params

  // Validate UUID format
  if (!UUID_REGEX.test(token)) {
    return {
      title: 'Personalised Song Gift | SongSwipe',
      description: 'A special personalised song created with SongSwipe',
    }
  }

  const data = await fetchShareData(token)

  if (!data) {
    return {
      title: 'Personalised Song Gift | SongSwipe',
      description: 'A special personalised song created with SongSwipe',
    }
  }

  const formattedOccasion = formatOccasion(data.occasion)

  return {
    title: `${formattedOccasion} Song for ${data.recipientName} | SongSwipe`,
    description: `${data.senderName} created a personalised ${formattedOccasion} song for ${data.recipientName}. Listen now!`,
    openGraph: {
      title: `${formattedOccasion} Song for ${data.recipientName}`,
      description: `From ${data.senderName} with love`,
      type: 'music.song',
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function SharePage({ params }: PageProps) {
  const { token } = params

  // Validate UUID format
  if (!UUID_REGEX.test(token)) {
    notFound()
  }

  const data = await fetchShareData(token)

  if (!data) {
    notFound()
  }

  const shareUrl = generateShareUrl(token)
  const personalMessage = `${data.senderName} created this special ${formatOccasion(data.occasion)} song just for you!`
  const formattedOccasion = formatOccasion(data.occasion)

  return (
    <>
      {/* Gift Reveal Animation */}
      <GiftReveal
        recipientName={data.recipientName}
        message={personalMessage}
        shareToken={token}
        occasion={formattedOccasion}
      />

      {/* Share Buttons Section */}
      <div className="bg-gradient-to-b from-gray-900 via-amber-900/20 to-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <ShareButtons
            url={shareUrl}
            title={`${formattedOccasion} Song for ${data.recipientName}`}
            recipientName={data.recipientName}
            occasion={formattedOccasion}
          />
        </div>
      </div>
    </>
  )
}
