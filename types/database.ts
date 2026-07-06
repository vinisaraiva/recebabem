/**
 * Tipos gerados automaticamente pelo Supabase CLI.
 * NÃO editar manualmente — regenerar com:
 * npx supabase gen types typescript --project-id xsgluofechxlcxcvapfu > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_date: string
          created_at: string
          hotel_id: string
          id: string
          minutes_spent: number
          missions_completed: number
          points_earned: number
          profile_id: string
        }
        Insert: {
          activity_date?: string
          created_at?: string
          hotel_id: string
          id?: string
          minutes_spent?: number
          missions_completed?: number
          points_earned?: number
          profile_id: string
        }
        Update: {
          activity_date?: string
          created_at?: string
          hotel_id?: string
          id?: string
          minutes_spent?: number
          missions_completed?: number
          points_earned?: number
          profile_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          hotel_id: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          hotel_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          hotel_id?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          active: boolean
          condition_type: string
          condition_value: number
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          condition_type: string
          condition_value: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_url: string | null
          hotel_id: string
          id: string
          issued_at: string
          issued_by: string | null
          notes: string | null
          profile_id: string
          requested_at: string | null
          status: string
          track_id: string
          verification_code: string
        }
        Insert: {
          certificate_url?: string | null
          hotel_id: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
          profile_id: string
          requested_at?: string | null
          status?: string
          track_id: string
          verification_code?: string
        }
        Update: {
          certificate_url?: string | null
          hotel_id?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          notes?: string | null
          profile_id?: string
          requested_at?: string | null
          status?: string
          track_id?: string
          verification_code?: string
        }
        Relationships: []
      }
      employee_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          profile_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: []
      }
      employee_tracks: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          completed_at: string | null
          id: string
          profile_id: string
          track_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          id?: string
          profile_id: string
          track_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          completed_at?: string | null
          id?: string
          profile_id?: string
          track_id?: string
        }
        Relationships: []
      }
      hotel_settings: {
        Row: {
          active_sectors: string[] | null
          created_at: string
          custom_data: Json | null
          hotel_id: string
          id: string
          logo_url: string | null
          notification_hour: number | null
          notification_minute: number | null
          notifications_enabled: boolean
          primary_color: string | null
          ranking_visible: boolean | null
          streak_reminder_days: number | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          active_sectors?: string[] | null
          created_at?: string
          custom_data?: Json | null
          hotel_id: string
          id?: string
          logo_url?: string | null
          notification_hour?: number | null
          notification_minute?: number | null
          notifications_enabled?: boolean
          primary_color?: string | null
          ranking_visible?: boolean | null
          streak_reminder_days?: number | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          active_sectors?: string[] | null
          created_at?: string
          custom_data?: Json | null
          hotel_id?: string
          id?: string
          logo_url?: string | null
          notification_hour?: number | null
          notification_minute?: number | null
          notifications_enabled?: boolean
          primary_color?: string | null
          ranking_visible?: boolean | null
          streak_reminder_days?: number | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      hotel_tracks: {
        Row: {
          active: boolean
          assigned_at: string
          hotel_id: string
          id: string
          track_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          hotel_id: string
          id?: string
          track_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          hotel_id?: string
          id?: string
          track_id?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          active: boolean
          city: string
          created_at: string
          email: string | null
          id: string
          max_employees: number | null
          name: string
          phone: string | null
          plan: string
          plan_expires_at: string | null
          slug: string
          state: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          max_employees?: number | null
          name: string
          phone?: string | null
          plan?: string
          plan_expires_at?: string | null
          slug: string
          state?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          max_employees?: number | null
          name?: string
          phone?: string | null
          plan?: string
          plan_expires_at?: string | null
          slug?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          hotel_id: string
          id: string
          invited_by: string | null
          name: string | null
          role: string
          sector: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          hotel_id: string
          id?: string
          invited_by?: string | null
          name?: string | null
          role?: string
          sector?: string | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          hotel_id?: string
          id?: string
          invited_by?: string | null
          name?: string | null
          role?: string
          sector?: string | null
          token?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          due_date: string
          hotel_id: string
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          status: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date: string
          hotel_id: string
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string
          hotel_id?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      mission_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string
          profile_id: string
          score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id: string
          profile_id: string
          score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          profile_id?: string
          score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          active: boolean
          audio_en_url: string | null
          audio_es_url: string | null
          audio_pt_url: string | null
          content: Json
          created_at: string
          id: string
          module_id: string
          name: string
          order_index: number
          points_reward: number
          type: string
        }
        Insert: {
          active?: boolean
          audio_en_url?: string | null
          audio_es_url?: string | null
          audio_pt_url?: string | null
          content?: Json
          created_at?: string
          id?: string
          module_id: string
          name: string
          order_index?: number
          points_reward?: number
          type: string
        }
        Update: {
          active?: boolean
          audio_en_url?: string | null
          audio_es_url?: string | null
          audio_pt_url?: string | null
          content?: Json
          created_at?: string
          id?: string
          module_id?: string
          name?: string
          order_index?: number
          points_reward?: number
          type?: string
        }
        Relationships: []
      }
      module_progress: {
        Row: {
          completed_at: string | null
          completion_pct: number
          id: string
          module_id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completion_pct?: number
          id?: string
          module_id: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completion_pct?: number
          id?: string
          module_id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          slug: string
          track_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          slug: string
          track_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          slug?: string
          track_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          hotel_id: string | null
          id: string
          profile_id: string
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          hotel_id?: string | null
          id?: string
          profile_id: string
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          hotel_id?: string | null
          id?: string
          profile_id?: string
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          features: Json
          id: string
          max_employees: number | null
          max_tracks: number | null
          name: string
          price_annual: number | null
          price_monthly: number
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          features?: Json
          id?: string
          max_employees?: number | null
          max_tracks?: number | null
          name: string
          price_annual?: number | null
          price_monthly: number
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          features?: Json
          id?: string
          max_employees?: number | null
          max_tracks?: number | null
          name?: string
          price_annual?: number | null
          price_monthly?: number
          slug?: string
        }
        Relationships: []
      }
      points_ledger: {
        Row: {
          amount: number
          created_at: string
          hotel_id: string
          id: string
          mission_id: string | null
          profile_id: string
          reason: string
        }
        Insert: {
          amount: number
          created_at?: string
          hotel_id: string
          id?: string
          mission_id?: string | null
          profile_id: string
          reason: string
        }
        Update: {
          amount?: number
          created_at?: string
          hotel_id?: string
          id?: string
          mission_id?: string | null
          profile_id?: string
          reason?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          created_by: string | null
          created_via: string
          hotel_id: string | null
          id: string
          name: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          role: string
          sector: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          created_via?: string
          hotel_id?: string | null
          id: string
          name: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          role?: string
          sector?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          created_via?: string
          hotel_id?: string | null
          id?: string
          name?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          role?: string
          sector?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          active: boolean
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          profile_id: string
          user_agent: string | null
        }
        Insert: {
          active?: boolean
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          profile_id: string
          user_agent?: string | null
        }
        Update: {
          active?: boolean
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          profile_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          profile_id: string
          updated_at: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          profile_id: string
          updated_at?: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          discount_pct: number | null
          hotel_id: string
          id: string
          next_billing_date: string | null
          notes: string | null
          plan_id: string
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          discount_pct?: number | null
          hotel_id: string
          id?: string
          next_billing_date?: string | null
          notes?: string | null
          plan_id: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          discount_pct?: number | null
          hotel_id?: string
          id?: string
          next_billing_date?: string | null
          notes?: string | null
          plan_id?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      track_progress: {
        Row: {
          completed_at: string | null
          completion_pct: number
          id: string
          profile_id: string
          started_at: string
          track_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completion_pct?: number
          id?: string
          profile_id: string
          started_at?: string
          track_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completion_pct?: number
          id?: string
          profile_id?: string
          started_at?: string
          track_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          active: boolean
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          level: string
          name: string
          order_index: number
          sector: string | null
          slug: string
        }
        Insert: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          level?: string
          name: string
          order_index?: number
          sector?: string | null
          slug: string
        }
        Update: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          level?: string
          name?: string
          order_index?: number
          sector?: string | null
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_billing_overview: { Row: Record<string, unknown>; Relationships: [] }
      admin_hotels_overview:  { Row: Record<string, unknown>; Relationships: [] }
      admin_invoice_history:  { Row: Record<string, unknown>; Relationships: [] }
      admin_onboarding_status:{ Row: Record<string, unknown>; Relationships: [] }
      admin_saas_metrics:     { Row: Record<string, unknown>; Relationships: [] }
      certificate_queue:      { Row: Record<string, unknown>; Relationships: [] }
      hotel_certificate_confirmations: { Row: Record<string, unknown>; Relationships: [] }
      hotel_rankings:         { Row: Record<string, unknown>; Relationships: [] }
      inactive_employees:     { Row: Record<string, unknown>; Relationships: [] }
      my_certificate_status:  { Row: Record<string, unknown>; Relationships: [] }
    }
    Functions: {
      admin_create_hotel:    { Args: Record<string, unknown>; Returns: string }
      admin_create_profile:  { Args: Record<string, unknown>; Returns: unknown }
      get_my_hotel_id:       { Args: Record<never, never>;   Returns: string }
      get_my_role:           { Args: Record<never, never>;   Returns: string }
      is_manager_or_above:   { Args: Record<never, never>;   Returns: boolean }
      request_my_certificate:{ Args: Record<string, unknown>; Returns: unknown }
      validate_invitation:   { Args: Record<string, unknown>; Returns: unknown[] }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

// Helpers para acessar tipos de tabelas sem repetição
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Atalhos para as tabelas mais usadas
export type Profile     = Tables<'profiles'>
export type Hotel       = Tables<'hotels'>
export type Track       = Tables<'tracks'>
export type Module      = Tables<'modules'>
export type Mission     = Tables<'missions'>
export type Certificate = Tables<'certificates'>
export type Notification= Tables<'notifications'>
export type Streak      = Tables<'streaks'>
export type Badge       = Tables<'badges'>
export type Invoice     = Tables<'invoices'>
export type Subscription= Tables<'subscriptions'>
export type Plan        = Tables<'plans'>

// Tipos de role e sector como union literal (mais seguro que string)
export type UserRole   = 'employee' | 'manager' | 'hotel_admin' | 'super_admin'
export type UserSector = 'recepcao' | 'governanca' | 'ab' | 'turismo' | 'manutencao' | 'geral'
export type MissionType =
  | 'listen_repeat'
  | 'quiz'
  | 'simulation'
  | 'match_pairs'
  | 'fill_blank'
  | 'word_order'
export type CertificateStatus  = 'pending' | 'issued' | 'revoked'
export type SubscriptionStatus = 'trial' | 'active' | 'overdue' | 'suspended' | 'cancelled'
export type InvoiceStatus      = 'pending' | 'paid' | 'overdue' | 'cancelled'
