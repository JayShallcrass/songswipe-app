/**
 * Style direction hints for unusual mood+genre+tempo combinations.
 * When a user picks a combo that might confuse the AI, this provides
 * a clear stylistic direction so the output stays coherent.
 */

interface StyleHintRule {
  moods: string[]
  genre: string
  tempo: string
  hint: string
}

const STYLE_HINTS: StyleHintRule[] = [
  {
    moods: ['nostalgic', 'electronic'],
    genre: 'electronic',
    tempo: 'high-energy',
    hint: 'Think synthwave or retrowave with driving beats and vintage synth textures. Blend 80s nostalgia with modern electronic energy.',
  },
  {
    moods: ['romantic'],
    genre: 'electronic',
    tempo: 'high-energy',
    hint: 'Think euphoric dance-pop or progressive house with soaring melodic hooks and heartfelt vocal delivery.',
  },
  {
    moods: ['funny'],
    genre: 'orchestral',
    tempo: 'high-energy',
    hint: 'Think comedic film score or theatrical musical number with dramatic orchestral swells played for laughs.',
  },
  {
    moods: ['nostalgic'],
    genre: 'electronic',
    tempo: 'slow',
    hint: 'Think ambient electronica or downtempo chillwave with warm analog synth pads and dreamy, wistful textures.',
  },
  {
    moods: ['epic'],
    genre: 'acoustic',
    tempo: 'slow',
    hint: 'Think intimate acoustic ballad that builds to an emotionally powerful crescendo, like a stripped-back anthem.',
  },
  {
    moods: ['funny'],
    genre: 'jazz',
    tempo: 'high-energy',
    hint: 'Think swing-era big band comedy with playful horn stabs, scat vocals, and witty uptempo jazz.',
  },
  {
    moods: ['epic', 'funny'],
    genre: 'pop',
    tempo: 'upbeat',
    hint: 'Think tongue-in-cheek pop anthem that is over-the-top and dramatic but self-aware and humorous.',
  },
]

/**
 * Find a style hint for the given mood+genre+tempo combination.
 * Returns null if the combo is straightforward and needs no extra direction.
 */
export function findStyleHint(
  moods: string[],
  genre: string,
  tempo: string
): string | null {
  for (const rule of STYLE_HINTS) {
    const genreMatch = rule.genre === genre
    const tempoMatch = rule.tempo === tempo
    const moodMatch = rule.moods.every((m) => moods.includes(m))

    if (genreMatch && tempoMatch && moodMatch) {
      return rule.hint
    }
  }
  return null
}
