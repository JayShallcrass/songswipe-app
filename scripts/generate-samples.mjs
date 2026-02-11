#!/usr/bin/env node
/**
 * Generate preview audio samples for the SongSwipe landing page.
 * Reads ELEVEN_LABS_API_KEY from .env.local
 *
 * Usage: node scripts/generate-samples.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public', 'samples')

// Read API key from .env.local
function getApiKey() {
  const envPath = resolve(ROOT, '.env.local')
  if (!existsSync(envPath)) {
    throw new Error('.env.local not found. Copy .env.example to .env.local and fill in your keys.')
  }
  const envContent = readFileSync(envPath, 'utf-8')
  const match = envContent.match(/^ELEVEN_LABS_API_KEY=(.+)$/m)
  if (!match || !match[1] || match[1].startsWith('sk_your')) {
    throw new Error('ELEVEN_LABS_API_KEY not set in .env.local')
  }
  return match[1].trim()
}

const SAMPLES = [
  {
    filename: 'birthday-preview.mp3',
    prompt: 'A cheerful upbeat pop birthday song for Sarah. Happy, celebratory, with bright guitar and catchy melody. Include the name Sarah in the lyrics. Fun and joyful energy.',
    lengthMs: 20000,
  },
  {
    filename: 'valentines-preview.mp3',
    prompt: 'A romantic acoustic love song for Valentine\'s Day. Warm vocals, gentle guitar, heartfelt and intimate. Tender and emotional, expressing deep love and gratitude.',
    lengthMs: 20000,
  },
  {
    filename: 'anniversary-preview.mp3',
    prompt: 'A soulful ballad celebrating a wedding anniversary. Rich vocals, piano and strings, nostalgic and emotional. Reflecting on years of love and shared memories.',
    lengthMs: 20000,
  },
  {
    filename: 'celebration-preview.mp3',
    prompt: 'An energetic celebration song. High energy, danceable beat, brass section, claps and cheers. Uplifting and triumphant, perfect for any special milestone.',
    lengthMs: 20000,
  },
]

async function generateSample(apiKey, sample) {
  console.log(`Generating: ${sample.filename}...`)

  const response = await fetch('https://api.elevenlabs.io/v1/music', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      prompt: sample.prompt,
      music_length_ms: sample.lengthMs,
      model_id: 'music_v1',
      force_instrumental: false,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`ElevenLabs API error for ${sample.filename}: ${errText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const outPath = resolve(OUT_DIR, sample.filename)
  writeFileSync(outPath, buffer)
  console.log(`  Saved: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`)
}

async function main() {
  const apiKey = getApiKey()

  // Ensure output directory exists
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true })
  }

  console.log('Generating 4 preview samples via ElevenLabs...\n')

  for (const sample of SAMPLES) {
    try {
      await generateSample(apiKey, sample)
    } catch (err) {
      console.error(`  FAILED: ${err.message}`)
    }
  }

  console.log('\nDone! Preview samples saved to public/samples/')
}

main().catch(console.error)
