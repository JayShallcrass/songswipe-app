import { SwipeCardData, SwipeStage, StageConfig } from '@/types/swipe'

// Occasion cards (aligned with elevenlabs.ts schema values)
export const occasionCards: SwipeCardData[] = [
  {
    id: 'valentines',
    title: 'Valentine\'s Day',
    icon: '💕',
    description: 'Express your love with a romantic melody',
    gradient: 'from-pink-500 to-rose-500',
    sampleUrl: '/samples/swipe/occasion-valentines.mp3',
  },
  {
    id: 'birthday',
    title: 'Birthday',
    icon: '🎂',
    description: 'Celebrate their special day with a song',
    gradient: 'from-amber-500 to-orange-500',
    sampleUrl: '/samples/swipe/occasion-birthday.mp3',
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    icon: '💍',
    description: 'Mark your milestone with music',
    gradient: 'from-purple-500 to-violet-500',
    sampleUrl: '/samples/swipe/occasion-anniversary.mp3',
  },
  {
    id: 'wedding',
    title: 'Wedding',
    icon: '👰',
    description: 'The perfect musical wedding gift',
    gradient: 'from-emerald-500 to-teal-500',
    sampleUrl: '/samples/swipe/occasion-wedding.mp3',
  },
  {
    id: 'graduation',
    title: 'Graduation',
    icon: '🎓',
    description: 'Celebrate their achievement in song',
    gradient: 'from-blue-500 to-indigo-500',
    sampleUrl: '/samples/swipe/occasion-graduation.mp3',
  },
  {
    id: 'just-because',
    title: 'Just Because',
    icon: '✨',
    description: 'No occasion needed, just love',
    gradient: 'from-fuchsia-500 to-pink-500',
    sampleUrl: '/samples/swipe/occasion-just-because.mp3',
  },
]

// Mood cards (aligned with elevenlabs.ts schema values)
export const moodCards: SwipeCardData[] = [
  {
    id: 'romantic',
    title: 'Romantic',
    icon: '❤️',
    description: 'Tender and heartfelt',
    gradient: 'from-rose-500 to-pink-600',
    sampleUrl: '/samples/swipe/mood-romantic.mp3',
  },
  {
    id: 'happy',
    title: 'Happy',
    icon: '😊',
    description: 'Upbeat and joyful',
    gradient: 'from-yellow-400 to-amber-500',
    sampleUrl: '/samples/swipe/mood-happy.mp3',
  },
  {
    id: 'funny',
    title: 'Funny',
    icon: '😄',
    description: 'Playful and lighthearted',
    gradient: 'from-lime-500 to-green-500',
    sampleUrl: '/samples/swipe/mood-funny.mp3',
  },
  {
    id: 'nostalgic',
    title: 'Nostalgic',
    icon: '🌅',
    description: 'Warm and reflective',
    gradient: 'from-amber-600 to-orange-600',
    sampleUrl: '/samples/swipe/mood-nostalgic.mp3',
  },
  {
    id: 'epic',
    title: 'Epic',
    icon: '🚀',
    description: 'Grand and powerful',
    gradient: 'from-indigo-600 to-purple-700',
    sampleUrl: '/samples/swipe/mood-epic.mp3',
  },
]

// Genre cards (aligned with elevenlabs.ts schema values)
export const genreCards: SwipeCardData[] = [
  {
    id: 'pop',
    title: 'Pop',
    icon: '🎵',
    description: 'Modern and catchy',
    gradient: 'from-pink-500 to-purple-500',
    sampleUrl: '/samples/swipe/genre-pop.mp3',
  },
  {
    id: 'acoustic',
    title: 'Acoustic',
    icon: '🎸',
    description: 'Warm and organic',
    gradient: 'from-amber-500 to-yellow-600',
    sampleUrl: '/samples/swipe/genre-acoustic.mp3',
  },
  {
    id: 'electronic',
    title: 'Electronic',
    icon: '🎹',
    description: 'Synth-driven and dynamic',
    gradient: 'from-cyan-500 to-blue-600',
    sampleUrl: '/samples/swipe/genre-electronic.mp3',
  },
  {
    id: 'orchestral',
    title: 'Orchestral',
    icon: '🎻',
    description: 'Rich and cinematic',
    gradient: 'from-red-600 to-rose-700',
    sampleUrl: '/samples/swipe/genre-orchestral.mp3',
  },
  {
    id: 'jazz',
    title: 'Jazz',
    icon: '🎷',
    description: 'Smooth and sophisticated',
    gradient: 'from-indigo-500 to-blue-700',
    sampleUrl: '/samples/swipe/genre-jazz.mp3',
  },
]

// Voice style cards (new data not in existing codebase)
export const voiceCards: SwipeCardData[] = [
  {
    id: 'warm-male',
    title: 'Warm Male',
    icon: '🎤',
    description: 'Rich baritone, smooth delivery',
    gradient: 'from-blue-600 to-indigo-600',
    sampleUrl: '/samples/swipe/voice-warm-male.mp3',
  },
  {
    id: 'bright-female',
    title: 'Bright Female',
    icon: '🎤',
    description: 'Clear soprano, energetic feel',
    gradient: 'from-pink-500 to-rose-600',
    sampleUrl: '/samples/swipe/voice-bright-female.mp3',
  },
  {
    id: 'soulful',
    title: 'Soulful',
    icon: '🎤',
    description: 'Deep, emotional R&B style',
    gradient: 'from-purple-600 to-violet-700',
    sampleUrl: '/samples/swipe/voice-soulful.mp3',
  },
  {
    id: 'energetic',
    title: 'Energetic',
    icon: '🎤',
    description: 'Powerful, upbeat vocal style',
    gradient: 'from-orange-500 to-red-500',
    sampleUrl: '/samples/swipe/voice-energetic.mp3',
  },
  {
    id: 'gentle',
    title: 'Gentle',
    icon: '🎤',
    description: 'Soft, intimate whisper-style',
    gradient: 'from-teal-500 to-emerald-600',
    sampleUrl: '/samples/swipe/voice-gentle.mp3',
  },
]

// Stage order for flow progression
export const STAGE_ORDER: SwipeStage[] = ['occasion', 'mood', 'genre', 'voice']

// Stage configuration
export const STAGE_CONFIG: StageConfig[] = [
  {
    stage: 'occasion',
    title: 'What\'s the occasion?',
    subtitle: 'Browse and pick your favourite',
    cards: occasionCards,
    selectionMode: 'single',
  },
  {
    stage: 'mood',
    title: 'Set the mood',
    subtitle: 'What vibe should your song have?',
    cards: moodCards,
    selectionMode: 'single',
  },
  {
    stage: 'genre',
    title: 'Pick a genre',
    subtitle: 'What style of music?',
    cards: genreCards,
    selectionMode: 'single',
  },
  {
    stage: 'voice',
    title: 'Choose a voice',
    subtitle: 'Who should sing your song?',
    cards: voiceCards,
    selectionMode: 'single',
  },
]
