export interface PromptQuestion {
  text: string
  for?: string[]  // undefined = all relationships. When set, only show for these.
}

export interface PromptCategory {
  id: string
  title: string
  subtitle: string
  questions: PromptQuestion[]
}

export const universalPromptCategories: PromptCategory[] = [
  {
    id: 'personality',
    title: 'Personality & Traits',
    subtitle: 'What makes them unique?',
    questions: [
      { text: 'What\'s their most infectious quality?' },
      { text: 'How would their friends describe them?' },
      { text: 'What\'s their signature phrase or saying?' },
      { text: 'What makes them laugh the hardest?', for: ['partner', 'friend', 'family'] },
      { text: 'What\'s their hidden talent?' },
    ],
  },
  {
    id: 'experiences',
    title: 'Shared Experiences',
    subtitle: 'Your journey together',
    questions: [
      { text: 'What\'s your favourite adventure together?', for: ['partner', 'friend', 'family'] },
      { text: 'What\'s a tradition only you two share?', for: ['partner', 'friend', 'family'] },
      { text: 'What\'s a moment you\'ll never forget?' },
      { text: 'What\'s the craziest thing you\'ve done together?', for: ['partner', 'friend'] },
      { text: 'What song always reminds you of them?', for: ['partner', 'friend', 'family'] },
      { text: 'What made you fall for them?', for: ['partner'] },
      { text: 'What\'s your favourite date night?', for: ['partner'] },
      { text: 'How did your friendship start?', for: ['friend'] },
    ],
  },
  {
    id: 'quirks',
    title: 'Fun Facts & Quirks',
    subtitle: 'The little things',
    questions: [
      { text: 'Any nicknames or pet names?', for: ['partner', 'friend', 'family'] },
      { text: 'What\'s their guilty pleasure?', for: ['partner', 'friend', 'family'] },
      { text: 'What\'s an inside joke between you?', for: ['partner', 'friend'] },
      { text: 'What\'s their go-to karaoke song?', for: ['partner', 'friend', 'family'] },
      { text: 'What\'s their comfort food?', for: ['partner', 'friend', 'family'] },
    ],
  },
  {
    id: 'appreciate',
    title: 'What You Appreciate',
    subtitle: 'Why they matter',
    questions: [
      { text: 'What do you admire most about them?' },
      { text: 'How have they changed your life?', for: ['partner', 'friend', 'family'] },
      { text: 'What would you thank them for?' },
      { text: 'What do you love most about them?', for: ['partner', 'family'] },
      { text: 'What makes them irreplaceable?', for: ['partner', 'friend', 'family'] },
      { text: 'What did they teach you growing up?', for: ['family'] },
      { text: 'What family tradition means the most?', for: ['family'] },
    ],
  },
  {
    id: 'milestones',
    title: 'Milestones & Achievements',
    subtitle: 'Their wins',
    questions: [
      { text: 'What\'s their proudest moment?' },
      { text: 'What challenge did they overcome?' },
      { text: 'What\'s a goal they\'ve achieved?' },
      { text: 'What are they working toward?' },
      { text: 'What makes them an inspiration?' },
      { text: 'What\'s their superpower at work?', for: ['colleague'] },
      { text: 'What project together are you proudest of?', for: ['colleague'] },
    ],
  },
]
