import { z } from 'zod'

// Form schema for song customization
export const customizationSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required').max(100),
  yourName: z.string().min(1, 'Your name is required').max(100),
  occasion: z.enum([
    'valentines',
    'birthday',
    'anniversary',
    'wedding',
    'graduation',
    'just-because',
  ]),
  songLength: z.enum(['60', '90', '120']),
  mood: z.array(
    z.enum(['romantic', 'happy', 'funny', 'nostalgic', 'epic'])
  ).min(1, 'Select at least one mood'),
  genre: z.enum(['pop', 'acoustic', 'electronic', 'orchestral', 'jazz']),
  specialMemories: z.string().max(500).optional(),
  thingsToAvoid: z.string().max(300).optional(),
})

export type Customization = z.infer<typeof customizationSchema>

// Build Eleven Labs prompt from customization
export function buildPrompt(customization: Customization): string {
  const { recipientName, yourName, occasion, songLength, mood, genre, specialMemories, thingsToAvoid } = customization

  const occasionMap: Record<string, string> = {
    valentines: "Valentine's Day",
    birthday: 'Birthday',
    anniversary: 'Anniversary',
    wedding: 'Wedding',
    graduation: 'Graduation',
    'just-because': 'Just Because',
  }

  const prompt = `A ${mood.join(' and ')} ${genre} song about ${recipientName} for ${occasionMap[occasion]}.
  
Written by ${yourName} as a gift for ${recipientName}.

${specialMemories ? `Include references to: ${specialMemories}` : ''}

${thingsToAvoid ? `Avoid: ${thingsToAvoid}` : ''}

Duration: approximately ${songLength} seconds.

Make it personal, heartfelt, and appropriate for the occasion. Include the recipient's name in the lyrics.`

  return prompt
}

// Generate song via Eleven Labs API
export async function generateSong(customization: Customization) {
  const prompt = buildPrompt(customization)
  
  // Eleven Labs Music API endpoint
  const response = await fetch('https://api.elevenlabs.io/v1/music/compose', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVEN_LABS_API_KEY!,
    },
    body: JSON.stringify({
      prompt,
      music_length_ms: parseInt(customization.songLength) * 1000,
      force_instrumental: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Eleven Labs API error: ${error}`)
  }

  // Return audio data
  const audioBuffer = await response.arrayBuffer()
  return Buffer.from(audioBuffer)
}

// Occasion-specific follow-up questions
export const occasionQuestions: Record<string, string[]> = {
  valentines: ['How did you two meet?', 'What\'s your favorite shared memory?'],
  birthday: ['What year were they born?', 'Any funny quirks to include?'],
  anniversary: ['How many years together?', 'What\'s your defining moment?'],
  wedding: ['What was your first date like?', 'Any vows or themes to include?'],
  graduation: ['What are they graduating in?', 'What\'s next for them?'],
  'just-because': ['Why are you sending this?', 'What do they mean to you?'],
}
