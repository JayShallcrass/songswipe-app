#!/usr/bin/env node
/**
 * Generate short audio preview samples for every swipe card.
 * Produces 21 clips (6 occasion + 5 mood + 5 genre + 5 voice)
 * and saves them to public/samples/swipe/.
 *
 * Reads ELEVEN_LABS_API_KEY from .env.local
 *
 * Usage: node scripts/generate-swipe-samples.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public', 'samples', 'swipe')

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

// All 21 swipe cards with generation prompts
const SAMPLES = [
  // Occasion cards (6)
  {
    filename: 'occasion-valentines.mp3',
    prompt: "A short 10-second Valentine's Day song snippet. Romantic, tender, with soft piano and warm vocals.",
  },
  {
    filename: 'occasion-birthday.mp3',
    prompt: 'A short 10-second birthday celebration song snippet. Cheerful, upbeat pop with bright energy and fun melody.',
  },
  {
    filename: 'occasion-anniversary.mp3',
    prompt: 'A short 10-second anniversary love song snippet. Warm, nostalgic, with gentle strings and heartfelt vocals.',
  },
  {
    filename: 'occasion-wedding.mp3',
    prompt: 'A short 10-second wedding song snippet. Elegant, joyful, with sweeping orchestral arrangement and romantic vocals.',
  },
  {
    filename: 'occasion-graduation.mp3',
    prompt: 'A short 10-second graduation celebration song snippet. Triumphant, uplifting, with bold brass and proud energy.',
  },
  {
    filename: 'occasion-just-because.mp3',
    prompt: 'A short 10-second feel-good song snippet. Light, carefree, with acoustic guitar and a warm, sunny vibe.',
  },

  // Mood cards (5)
  {
    filename: 'mood-romantic.mp3',
    prompt: 'A 10-second song snippet with a romantic vibe. Tender piano, soft strings, intimate and heartfelt. Pop style.',
  },
  {
    filename: 'mood-happy.mp3',
    prompt: 'A 10-second song snippet with a happy, joyful vibe. Bright chords, claps, upbeat and infectious energy. Pop style.',
  },
  {
    filename: 'mood-funny.mp3',
    prompt: 'A 10-second song snippet with a funny, playful vibe. Quirky melody, bouncy rhythm, lighthearted and cheeky. Pop style.',
  },
  {
    filename: 'mood-nostalgic.mp3',
    prompt: 'A 10-second song snippet with a nostalgic, reflective vibe. Warm tones, gentle rhythm, bittersweet and wistful. Pop style.',
  },
  {
    filename: 'mood-epic.mp3',
    prompt: 'A 10-second song snippet with an epic, powerful vibe. Cinematic build, dramatic drums, soaring melody. Pop style.',
  },

  // Genre cards (5)
  {
    filename: 'genre-pop.mp3',
    prompt: 'A 10-second modern pop instrumental snippet. Catchy synth hook, clean beat, bright and polished production.',
  },
  {
    filename: 'genre-acoustic.mp3',
    prompt: 'A 10-second acoustic instrumental snippet. Fingerpicked guitar, warm and organic, intimate coffee-shop feel.',
  },
  {
    filename: 'genre-electronic.mp3',
    prompt: 'A 10-second electronic instrumental snippet. Pulsing synths, driving beat, dynamic and futuristic.',
  },
  {
    filename: 'genre-orchestral.mp3',
    prompt: 'A 10-second orchestral instrumental snippet. Rich strings, cinematic brass, sweeping and majestic.',
  },
  {
    filename: 'genre-jazz.mp3',
    prompt: 'A 10-second jazz instrumental snippet. Smooth saxophone, walking bass, laid-back and sophisticated.',
  },

  // Voice cards (5)
  {
    filename: 'voice-warm-male.mp3',
    prompt: 'A 10-second vocal sample by a warm male baritone singer. Rich, smooth delivery. Pop ballad style.',
  },
  {
    filename: 'voice-bright-female.mp3',
    prompt: 'A 10-second vocal sample by a bright female soprano singer. Clear, energetic, sparkling tone. Pop style.',
  },
  {
    filename: 'voice-soulful.mp3',
    prompt: 'A 10-second vocal sample by a deep, soulful R&B singer. Emotional, rich vibrato. Soul and R&B style.',
  },
  {
    filename: 'voice-energetic.mp3',
    prompt: 'A 10-second vocal sample by a powerful, energetic singer. Bold, upbeat, strong projection. Pop-rock style.',
  },
  {
    filename: 'voice-gentle.mp3',
    prompt: 'A 10-second vocal sample by a soft, gentle singer. Intimate whisper-style, delicate and calming. Acoustic pop style.',
  },
]

const DELAY_MS = 2000

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

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
      music_length_ms: 10000,
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

  console.log(`Generating ${SAMPLES.length} swipe card preview samples via ElevenLabs...\n`)

  let success = 0
  let failed = 0

  for (const sample of SAMPLES) {
    // Skip if file already exists
    const outPath = resolve(OUT_DIR, sample.filename)
    if (existsSync(outPath)) {
      console.log(`  Skipping (already exists): ${sample.filename}`)
      success++
      continue
    }

    try {
      await generateSample(apiKey, sample)
      success++
    } catch (err) {
      console.error(`  FAILED: ${err.message}`)
      failed++
    }

    // Rate limit: wait between API calls
    await sleep(DELAY_MS)
  }

  console.log(`\nDone! ${success} succeeded, ${failed} failed.`)
  console.log(`Samples saved to public/samples/swipe/`)
}

main().catch(console.error)
