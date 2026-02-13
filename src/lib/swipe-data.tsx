import { SwipeCardData, SwipeStage, StageConfig } from '@/types/swipe'
import {
  HeartIcon,
  CakeIcon,
  SparklesIcon,
  GiftIcon,
  AcademicCapIcon,
  StarIcon,
  SunIcon,
  FaceSmileIcon,
  ClockIcon,
  RocketLaunchIcon,
  MusicalNoteIcon,
  BoltIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/solid'

// Illustrations
import { ValentinesIllustration, BirthdayIllustration, AnniversaryIllustration, WeddingIllustration, GraduationIllustration, JustBecauseIllustration } from '@/components/illustrations/cards/OccasionIllustrations'
import { RomanticIllustration, HappyIllustration, FunnyIllustration, NostalgicIllustration, EpicIllustration } from '@/components/illustrations/cards/MoodIllustrations'
import { PopIllustration, AcousticIllustration, ElectronicIllustration, OrchestralIllustration, JazzIllustration } from '@/components/illustrations/cards/GenreIllustrations'
import { WarmMaleIllustration, BrightFemaleIllustration, SoulfulIllustration, EnergeticIllustration, GentleIllustration } from '@/components/illustrations/cards/VoiceIllustrations'

// Occasion cards (aligned with elevenlabs.ts schema values)
export const occasionCards: SwipeCardData[] = [
  {
    id: 'valentines',
    title: 'Valentine\'s Day',
    icon: <HeartIcon className="w-full h-full text-white" />,
    description: 'Express your love with a romantic melody',
    gradient: 'from-pink-500 to-rose-500',
    sampleUrl: '/samples/swipe/occasion-valentines.mp3',
    illustration: <ValentinesIllustration />,
  },
  {
    id: 'birthday',
    title: 'Birthday',
    icon: <CakeIcon className="w-full h-full text-white" />,
    description: 'Celebrate their special day with a song',
    gradient: 'from-amber-500 to-orange-500',
    sampleUrl: '/samples/swipe/occasion-birthday.mp3',
    illustration: <BirthdayIllustration />,
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    icon: <SparklesIcon className="w-full h-full text-white" />,
    description: 'Mark your milestone with music',
    gradient: 'from-purple-500 to-violet-500',
    sampleUrl: '/samples/swipe/occasion-anniversary.mp3',
    illustration: <AnniversaryIllustration />,
  },
  {
    id: 'wedding',
    title: 'Wedding',
    icon: <GiftIcon className="w-full h-full text-white" />,
    description: 'The perfect musical wedding gift',
    gradient: 'from-emerald-500 to-teal-500',
    sampleUrl: '/samples/swipe/occasion-wedding.mp3',
    illustration: <WeddingIllustration />,
  },
  {
    id: 'graduation',
    title: 'Graduation',
    icon: <AcademicCapIcon className="w-full h-full text-white" />,
    description: 'Celebrate their achievement in song',
    gradient: 'from-blue-500 to-indigo-500',
    sampleUrl: '/samples/swipe/occasion-graduation.mp3',
    illustration: <GraduationIllustration />,
  },
  {
    id: 'just-because',
    title: 'Just Because',
    icon: <StarIcon className="w-full h-full text-white" />,
    description: 'No occasion needed, just love',
    gradient: 'from-fuchsia-500 to-pink-500',
    sampleUrl: '/samples/swipe/occasion-just-because.mp3',
    illustration: <JustBecauseIllustration />,
  },
]

// Mood cards (aligned with elevenlabs.ts schema values)
export const moodCards: SwipeCardData[] = [
  {
    id: 'romantic',
    title: 'Romantic',
    icon: <HeartIcon className="w-full h-full text-white" />,
    description: 'Tender and heartfelt',
    gradient: 'from-rose-500 to-pink-600',
    sampleUrl: '/samples/swipe/mood-romantic.mp3',
    illustration: <RomanticIllustration />,
  },
  {
    id: 'happy',
    title: 'Happy',
    icon: <SunIcon className="w-full h-full text-white" />,
    description: 'Upbeat and joyful',
    gradient: 'from-yellow-400 to-amber-500',
    sampleUrl: '/samples/swipe/mood-happy.mp3',
    illustration: <HappyIllustration />,
  },
  {
    id: 'funny',
    title: 'Funny',
    icon: <FaceSmileIcon className="w-full h-full text-white" />,
    description: 'Playful and lighthearted',
    gradient: 'from-lime-500 to-green-500',
    sampleUrl: '/samples/swipe/mood-funny.mp3',
    illustration: <FunnyIllustration />,
  },
  {
    id: 'nostalgic',
    title: 'Nostalgic',
    icon: <ClockIcon className="w-full h-full text-white" />,
    description: 'Warm and reflective',
    gradient: 'from-amber-600 to-orange-600',
    sampleUrl: '/samples/swipe/mood-nostalgic.mp3',
    illustration: <NostalgicIllustration />,
  },
  {
    id: 'epic',
    title: 'Epic',
    icon: <RocketLaunchIcon className="w-full h-full text-white" />,
    description: 'Grand and powerful',
    gradient: 'from-indigo-600 to-purple-700',
    sampleUrl: '/samples/swipe/mood-epic.mp3',
    illustration: <EpicIllustration />,
  },
]

// Genre cards (aligned with elevenlabs.ts schema values)
export const genreCards: SwipeCardData[] = [
  {
    id: 'pop',
    title: 'Pop',
    icon: <MusicalNoteIcon className="w-full h-full text-white" />,
    description: 'Modern and catchy',
    gradient: 'from-pink-500 to-purple-500',
    sampleUrl: '/samples/swipe/genre-pop.mp3',
    illustration: <PopIllustration />,
  },
  {
    id: 'acoustic',
    title: 'Acoustic',
    icon: <MusicalNoteIcon className="w-full h-full text-white" />,
    description: 'Warm and organic',
    gradient: 'from-amber-500 to-yellow-600',
    sampleUrl: '/samples/swipe/genre-acoustic.mp3',
    illustration: <AcousticIllustration />,
  },
  {
    id: 'electronic',
    title: 'Electronic',
    icon: <BoltIcon className="w-full h-full text-white" />,
    description: 'Synth-driven and dynamic',
    gradient: 'from-cyan-500 to-blue-600',
    sampleUrl: '/samples/swipe/genre-electronic.mp3',
    illustration: <ElectronicIllustration />,
  },
  {
    id: 'orchestral',
    title: 'Orchestral',
    icon: <SparklesIcon className="w-full h-full text-white" />,
    description: 'Rich and cinematic',
    gradient: 'from-red-600 to-rose-700',
    sampleUrl: '/samples/swipe/genre-orchestral.mp3',
    illustration: <OrchestralIllustration />,
  },
  {
    id: 'jazz',
    title: 'Jazz',
    icon: <MusicalNoteIcon className="w-full h-full text-white" />,
    description: 'Smooth and sophisticated',
    gradient: 'from-indigo-500 to-blue-700',
    sampleUrl: '/samples/swipe/genre-jazz.mp3',
    illustration: <JazzIllustration />,
  },
]

// Voice style cards (now visually distinct with different icons)
export const voiceCards: SwipeCardData[] = [
  {
    id: 'warm-male',
    title: 'Warm Male',
    icon: <MicrophoneIcon className="w-full h-full text-white" />,
    description: 'Rich baritone, smooth delivery',
    gradient: 'from-blue-600 to-indigo-600',
    sampleUrl: '/samples/swipe/voice-warm-male.mp3',
    illustration: <WarmMaleIllustration />,
  },
  {
    id: 'bright-female',
    title: 'Bright Female',
    icon: <SpeakerWaveIcon className="w-full h-full text-white" />,
    description: 'Clear soprano, energetic feel',
    gradient: 'from-pink-500 to-rose-600',
    sampleUrl: '/samples/swipe/voice-bright-female.mp3',
    illustration: <BrightFemaleIllustration />,
  },
  {
    id: 'soulful',
    title: 'Soulful',
    icon: <HeartIcon className="w-full h-full text-white" />,
    description: 'Deep, emotional R&B style',
    gradient: 'from-purple-600 to-violet-700',
    sampleUrl: '/samples/swipe/voice-soulful.mp3',
    illustration: <SoulfulIllustration />,
  },
  {
    id: 'energetic',
    title: 'Energetic',
    icon: <BoltIcon className="w-full h-full text-white" />,
    description: 'Powerful, upbeat vocal style',
    gradient: 'from-orange-500 to-red-500',
    sampleUrl: '/samples/swipe/voice-energetic.mp3',
    illustration: <EnergeticIllustration />,
  },
  {
    id: 'gentle',
    title: 'Gentle',
    icon: <SparklesIcon className="w-full h-full text-white" />,
    description: 'Soft, intimate whisper-style',
    gradient: 'from-teal-500 to-emerald-600',
    sampleUrl: '/samples/swipe/voice-gentle.mp3',
    illustration: <GentleIllustration />,
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
