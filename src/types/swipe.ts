// Swipe flow types for SongSwipe builder

import { ReactNode } from 'react'

export type SwipeStage = 'occasion' | 'mood' | 'genre' | 'voice'

export interface SwipeCardData {
  id: string
  title: string
  icon: ReactNode
  description: string
  gradient: string
  sampleUrl?: string
  illustration?: ReactNode
}

export interface SwipeFlowState {
  currentStage: SwipeStage
  selections: Partial<Record<SwipeStage, string>>
}

export interface StageConfig {
  stage: SwipeStage
  title: string
  subtitle: string
  cards: SwipeCardData[]
  selectionMode: 'single'
}
