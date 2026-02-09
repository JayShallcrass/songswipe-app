// Email preferences types for anniversary reminders and unsubscribe management

export interface EmailPreferences {
  id: string
  userId: string
  globalUnsubscribe: boolean
  occasionUnsubscribes: string[] // Order IDs the user has opted out of
  unsubscribeToken: string
  createdAt: string
  updatedAt: string
}

export interface OccasionReminder {
  orderId: string
  userId: string
  occasionDate: string
  occasionType: string
  recipientName: string
  userEmail: string
}

export type UnsubscribeAction = 'global' | 'occasion'
