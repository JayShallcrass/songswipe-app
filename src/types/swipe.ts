// Swipe flow types for SongSwipe builder

export type SwipeStage = 'occasion' | 'mood' | 'genre' | 'voice'

export interface SwipeCardData {
  id: string
  title: string
  icon: string
  description: string
  gradient: string
}

export interface SwipeSelection {
  stage: SwipeStage
  cardId: string
  direction: 'left' | 'right'
}

export interface SwipeFlowState {
  currentStage: SwipeStage
  currentCardIndex: number
  selections: Partial<Record<SwipeStage, string>>
  history: SwipeSelection[]
}

export interface StageConfig {
  stage: SwipeStage
  title: string
  subtitle: string
  cards: SwipeCardData[]
  selectionMode: 'single'
}
