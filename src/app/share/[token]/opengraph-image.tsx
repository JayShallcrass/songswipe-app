import { ImageResponse } from 'next/og'
import { createServerSupabaseClient } from '@/lib/supabase'

export const alt = 'Personalised song gift from SongSwipe'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface OGImageProps {
  params: Promise<{ token: string }>
}

// Helper to format occasion for display
function formatOccasion(occasion: string): string {
  return occasion
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default async function Image({ params }: OGImageProps) {
  const { token } = await params
  const supabase = createServerSupabaseClient()

  // Fetch minimal data needed for OG image
  const { data, error } = await supabase
    .from('song_variants')
    .select(`
      orders(
        customizations(
          recipient_name,
          your_name,
          occasion
        )
      )
    `)
    .eq('share_token', token)
    .eq('selected', true)
    .eq('generation_status', 'complete')
    .single()

  // Unwrap nested response
  const order = data?.orders && (Array.isArray(data.orders) ? data.orders[0] : data.orders)
  const customisationData = order?.customizations
  const customisation = customisationData && (Array.isArray(customisationData) ? customisationData[0] : customisationData)

  // Fallback image if no data found
  if (error || !data || !customisation) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1F1128',
          }}
        >
          <svg width="96" height="96" viewBox="0 0 24 24" fill="white" style={{ marginBottom: 40 }}>
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
          <div style={{ fontSize: 48, color: 'white', fontWeight: 'bold' }}>
            A personalised song gift
          </div>
          <div style={{ fontSize: 36, color: 'white', opacity: 0.8, marginTop: 40 }}>
            SongSwipe
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  }

  const formattedOccasion = formatOccasion(customisation.occasion)

  // Personalised image
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1F1128 0%, #4C1D95 50%, #BE185D 100%)',
          position: 'relative',
        }}
      >
        <svg width="80" height="80" viewBox="0 0 24 24" fill="white" style={{ marginBottom: 30 }}>
          <path d="M20 12v10H4V12M2 7h20v5H2zm10-5c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 0c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3zM12 7v15" stroke="white" strokeWidth="1" fill="none" />
        </svg>
        <div
          style={{
            fontSize: 64,
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          For {customisation.recipient_name}
        </div>
        <div
          style={{
            fontSize: 40,
            color: 'white',
            opacity: 0.9,
            textAlign: 'center',
            marginBottom: 15,
          }}
        >
          {formattedOccasion} Song
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'white',
            opacity: 0.8,
            textAlign: 'center',
          }}
        >
          From {customisation.your_name}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 32,
            color: 'white',
            opacity: 0.7,
          }}
        >
          SongSwipe
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
