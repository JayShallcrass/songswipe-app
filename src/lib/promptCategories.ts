export interface PromptCategory {
  id: string
  title: string
  subtitle: string
  questions: string[]
}

export const universalPromptCategories: PromptCategory[] = [
  {
    id: 'personality',
    title: 'Personality & Traits',
    subtitle: 'What makes them unique?',
    questions: [
      'What\'s their most infectious quality?',
      'How would their friends describe them?',
      'What\'s their signature phrase or saying?',
      'What makes them laugh the hardest?',
      'What\'s their hidden talent?',
    ],
  },
  {
    id: 'experiences',
    title: 'Shared Experiences',
    subtitle: 'Your journey together',
    questions: [
      'What\'s your favourite adventure together?',
      'What\'s a tradition only you two share?',
      'What\'s a moment you\'ll never forget?',
      'What\'s the craziest thing you\'ve done together?',
      'What song always reminds you of them?',
    ],
  },
  {
    id: 'quirks',
    title: 'Fun Facts & Quirks',
    subtitle: 'The little things',
    questions: [
      'Any nicknames or pet names?',
      'What\'s their guilty pleasure?',
      'What\'s an inside joke between you?',
      'What\'s their go-to karaoke song?',
      'What\'s their comfort food?',
    ],
  },
  {
    id: 'appreciate',
    title: 'What You Appreciate',
    subtitle: 'Why they matter',
    questions: [
      'What do you admire most about them?',
      'How have they changed your life?',
      'What would you thank them for?',
      'What do you love most about them?',
      'What makes them irreplaceable?',
    ],
  },
  {
    id: 'milestones',
    title: 'Milestones & Achievements',
    subtitle: 'Their wins',
    questions: [
      'What\'s their proudest moment?',
      'What challenge did they overcome?',
      'What\'s a goal they\'ve achieved?',
      'What are they working toward?',
      'What makes them an inspiration?',
    ],
  },
]
