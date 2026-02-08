import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'
import { generateShareUrl } from '@/lib/share/generateShareUrl'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface PageProps {
  params: Promise<{ token: string }>
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
  const customizationData = order?.customizations
  const customization = Array.isArray(customizationData) ? customizationData[0] : customizationData

  if (!order || !customization) {
    return null
  }

  return {
    id: data.id,
    storagePath: data.storage_path,
    durationMs: data.duration_ms,
    shareToken: data.share_token,
    recipientName: customization.recipient_name,
    senderName: customization.your_name,
    occasion: customization.occasion,
    genre: customization.genre,
    mood: customization.mood,
    occasionDate: order.occasion_date,
    orderCreatedAt: order.created_at,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params

  // Validate UUID format
  if (!UUID_REGEX.test(token)) {
    return {
      title: 'Personalized Song Gift | SongSwipe',
      description: 'A special personalized song created with SongSwipe',
    }
  }

  const data = await fetchShareData(token)

  if (!data) {
    return {
      title: 'Personalized Song Gift | SongSwipe',
      description: 'A special personalized song created with SongSwipe',
    }
  }

  const formattedOccasion = formatOccasion(data.occasion)

  return {
    title: `${formattedOccasion} Song for ${data.recipientName} | SongSwipe`,
    description: `${data.senderName} created a personalized ${formattedOccasion} song for ${data.recipientName}. Listen now!`,
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
  const { token } = await params

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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SongSwipe
            </h1>
          </div>

          {/* Recipient Name */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              For {data.recipientName}
            </h2>
          </div>

          {/* Personal Message */}
          <p className="text-lg md:text-xl text-white/90">
            {personalMessage}
          </p>

          {/* Occasion Info */}
          <div className="text-white/70">
            <p className="text-base">
              {formattedOccasion} • {data.genre}
            </p>
          </div>

          {/* Gift Reveal Component Placeholder (Plan 02) */}
          <div id="gift-reveal-slot" className="py-8">
            {/* GiftReveal client component will be added in Plan 02 */}
            <div className="text-white/50 text-sm">
              [ Gift reveal component goes here - Plan 02 ]
            </div>
          </div>

          {/* Share Buttons Placeholder (Plan 02) */}
          <div id="share-buttons-slot" className="py-4">
            {/* ShareButtons client component will be added in Plan 02 */}
            <div className="text-white/50 text-sm">
              [ Share buttons component goes here - Plan 02 ]
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
