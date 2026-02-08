// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type GenerationStatus = 'pending' | 'generating' | 'complete' | 'failed'

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
          occasion_date: string | null
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
          occasion_date?: string | null
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
          occasion_date?: string | null
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
      song_variants: {
        Row: {
          id: string
          order_id: string
          user_id: string
          variant_number: number
          storage_path: string
          duration_ms: number | null
          generation_status: GenerationStatus
          share_token: string
          selected: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          variant_number: number
          storage_path: string
          duration_ms?: number | null
          generation_status?: GenerationStatus
          share_token?: string
          selected?: boolean
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          variant_number?: number
          storage_path?: string
          duration_ms?: number | null
          generation_status?: GenerationStatus
          share_token?: string
          selected?: boolean
          created_at?: string
          completed_at?: string | null
        }
      }
      failed_jobs: {
        Row: {
          id: string
          job_type: string
          event_data: Json
          error_message: string
          error_stack: string | null
          retry_count: number
          failed_at: string
          resolved_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          job_type: string
          event_data: Json
          error_message: string
          error_stack?: string | null
          retry_count: number
          failed_at?: string
          resolved_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          job_type?: string
          event_data?: Json
          error_message?: string
          error_stack?: string | null
          retry_count?: number
          failed_at?: string
          resolved_at?: string | null
          notes?: string | null
        }
      }
    }
  }
}
