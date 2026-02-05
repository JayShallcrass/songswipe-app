// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      customizations: {
        Row: {
          id: string
          user_id: string
          recipient_name: string
          your_name: string
          occasion: string
          song_length: number
          mood: string[]
          genre: string
          special_memories: string | null
          things_to_avoid: string | null
          prompt: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipient_name: string
          your_name: string
          occasion: string
          song_length: number
          mood: string[]
          genre: string
          special_memories?: string | null
          things_to_avoid?: string | null
          prompt: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipient_name?: string
          your_name?: string
          occasion?: string
          song_length?: number
          mood?: string[]
          genre?: string
          special_memories?: string | null
          things_to_avoid?: string | null
          prompt?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          customization_id: string
          stripe_session_id: string | null
          status: 'pending' | 'paid' | 'generating' | 'completed' | 'failed'
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customization_id: string
          stripe_session_id?: string | null
          status?: 'pending' | 'paid' | 'generating' | 'completed' | 'failed'
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customization_id?: string
          stripe_session_id?: string | null
          status?: 'pending' | 'paid' | 'generating' | 'completed' | 'failed'
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          order_id: string
          user_id: string
          audio_url: string
          duration_ms: number
          created_at: string
          downloads: number
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          audio_url: string
          duration_ms: number
          created_at?: string
          downloads?: number
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          audio_url?: string
          duration_ms?: number
          created_at?: string
          downloads?: number
        }
      }
    }
  }
}
