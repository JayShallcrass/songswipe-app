import { findStyleHint } from '@/lib/styleHints'

// Maps for building rich prompts
export const OCCASION_LABELS: Record<string, string> = {
  valentines: "Valentine's Day",
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  wedding: 'Wedding',
  graduation: 'Graduation',
  'just-because': 'Just Because',
}

export const VOICE_STYLES: Record<string, string> = {
  'warm-male': 'warm male vocalist with a rich baritone',
  'bright-female': 'bright female vocalist with clear, energetic delivery',
  'soulful': 'soulful vocalist with deep, emotional R&B-style delivery',
  'energetic': 'powerful, energetic vocalist with dynamic range',
  'gentle': 'soft, gentle vocalist with an intimate whisper-style delivery',
}

export const LANGUAGE_PROMPTS: Record<string, string> = {
  'en-GB': 'standard British English accent',
  'en-GB-SCT': 'Scottish English accent',
  'en-GB-WLS': 'Welsh English accent',
  'en-IE': 'Irish English accent',
  'en-US': 'standard American English accent',
  'en-US-S': 'Southern American English accent',
  'es': 'Spanish language',
  'fr': 'French language',
  'de': 'German language',
  'it': 'Italian language',
  'pt': 'Portuguese language',
  'ja': 'Japanese language',
  'ko': 'Korean language',
}

export const TEMPO_PROMPTS: Record<string, string> = {
  'slow': 'slow and gentle, approximately 70 BPM',
  'mid-tempo': 'mid-tempo, approximately 100 BPM',
  'upbeat': 'upbeat, approximately 120 BPM',
  'high-energy': 'high energy, approximately 140 BPM',
}

export const RELATIONSHIP_CONTEXT: Record<string, string> = {
  partner: 'romantic partner',
  friend: 'close friend',
  family: 'family member',
  colleague: 'colleague or work friend',
}

/**
 * Sanitise user-supplied text for inclusion in generation prompts.
 * Strips control chars, excessive length, and obvious prompt injection attempts.
 */
function sanitiseInput(text: string, maxLength = 500): string {
  return text
    // Strip control characters
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    // Collapse excessive whitespace
    .replace(/\s{3,}/g, '  ')
    // Truncate
    .slice(0, maxLength)
    .trim()
}

export function buildRichPrompt(c: Record<string, any>): string {
  const occasion = OCCASION_LABELS[c.occasion] || c.occasion
  const voice = VOICE_STYLES[c.voice] || 'versatile vocalist'
  const lang = LANGUAGE_PROMPTS[c.language] || 'British English accent'
  const tempo = TEMPO_PROMPTS[c.tempo] || 'mid-tempo, approximately 100 BPM'
  const rel = c.relationship ? RELATIONSHIP_CONTEXT[c.relationship] : null

  const lines: string[] = []

  // Core description
  lines.push(`A ${c.mood.join(' and ')} ${c.genre} song for ${occasion}.`)

  // Style hint for unusual combos
  const styleHint = findStyleHint(c.mood, c.genre, c.tempo)
  if (styleHint) {
    lines.push(`Style direction: ${styleHint}`)
  }

  // Vocal and language direction
  lines.push(`Performed by a ${voice} singing in ${lang}.`)

  // Tempo
  lines.push(`Tempo: ${tempo}.`)

  // Personal context
  if (rel) {
    lines.push(`Written by ${c.yourName} for their ${rel}, ${c.recipientName}.`)
  } else {
    lines.push(`Written by ${c.yourName} as a gift for ${c.recipientName}.`)
  }

  if (c.pronunciation) {
    lines.push(`Include ${c.recipientName} (pronounced "${c.pronunciation}") naturally in the lyrics.`)
  } else {
    lines.push(`Include ${c.recipientName}'s name naturally in the lyrics.`)
  }

  // Song title
  if (c.songTitle) {
    lines.push(`The song should be titled "${sanitiseInput(c.songTitle, 100)}".`)
  }

  // Special memories / content direction
  if (c.specialMemories) {
    lines.push(`Weave in these personal details: ${sanitiseInput(c.specialMemories)}`)
  }

  // Things to avoid
  if (c.thingsToAvoid) {
    lines.push(`Avoid mentioning: ${sanitiseInput(c.thingsToAvoid, 200)}`)
  }

  // Duration
  lines.push(`Duration: approximately ${c.songLength} seconds.`)

  // Quality direction
  lines.push('Make it heartfelt, personal, and memorable. The lyrics should feel like they were written specifically for this person.')

  return lines.join('\n\n')
}
