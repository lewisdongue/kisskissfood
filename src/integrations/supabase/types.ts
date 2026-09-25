export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      gifts: {
        Row: {
          created_at: string
          gift_type: string
          id: string
          receiver_id: string
          room_name: string | null
          sender_id: string
          value: number
        }
        Insert: {
          created_at?: string
          gift_type?: string
          id?: string
          receiver_id: string
          room_name?: string | null
          sender_id: string
          value?: number
        }
        Update: {
          created_at?: string
          gift_type?: string
          id?: string
          receiver_id?: string
          room_name?: string | null
          sender_id?: string
          value?: number
        }
        Relationships: []
      }
      match_history: {
        Row: {
          created_at: string
          duration_seconds: number
          ended_at: string | null
          id: string
          partner_id: string
          room_name: string
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          partner_id: string
          room_name: string
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          partner_id?: string
          room_name?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_rate_limit: {
        Row: {
          attempts: number
          blocked_until: string | null
          user_id: string
          window_start: string
        }
        Insert: {
          attempts?: number
          blocked_until?: string | null
          user_id: string
          window_start?: string
        }
        Update: {
          attempts?: number
          blocked_until?: string | null
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      moderation_events: {
        Row: {
          banned_until: string | null
          created_at: string
          id: string
          reason: string
          room_name: string | null
          source: string
          user_id: string
        }
        Insert: {
          banned_until?: string | null
          created_at?: string
          id?: string
          reason: string
          room_name?: string | null
          source?: string
          user_id: string
        }
        Update: {
          banned_until?: string | null
          created_at?: string
          id?: string
          reason?: string
          room_name?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          daily_reminders: boolean
          max_notifications_per_day: number
          push_enabled: boolean
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_reminders?: boolean
          max_notifications_per_day?: number
          push_enabled?: boolean
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_reminders?: boolean
          max_notifications_per_day?: number
          push_enabled?: boolean
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          attempts: number
          created_at: string
          data: Json
          error_message: string | null
          id: string
          last_attempt_at: string | null
          local_day: string
          message: string
          processed_at: string | null
          scheduled_for: string
          slot_key: string
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          data?: Json
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          local_day: string
          message: string
          processed_at?: string | null
          scheduled_for: string
          slot_key: string
          status?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          data?: Json
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          local_day?: string
          message?: string
          processed_at?: string | null
          scheduled_for?: string
          slot_key?: string
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          delivery_method: string | null
          delivery_status: string | null
          id: string
          message: string
          read: boolean
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          delivery_method?: string | null
          delivery_status?: string | null
          id?: string
          message: string
          read?: boolean
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          delivery_method?: string | null
          delivery_status?: string | null
          id?: string
          message?: string
          read?: boolean
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      online_users: {
        Row: {
          language: string
          last_seen: string
          user_id: string
        }
        Insert: {
          language?: string
          last_seen?: string
          user_id: string
        }
        Update: {
          language?: string
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_campaigns: {
        Row: {
          completed_cycles: number
          start_referral_count: number
          started_at: string
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_cycles?: number
          start_referral_count?: number
          started_at?: string
          target: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_cycles?: number
          start_referral_count?: number
          started_at?: string
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_awarded: boolean
          created_at: string
          credited_at: string | null
          id: string
          referred_user_id: string
          referrer_id: string
          verified_at: string | null
        }
        Insert: {
          bonus_awarded?: boolean
          created_at?: string
          credited_at?: string | null
          id?: string
          referred_user_id: string
          referrer_id: string
          verified_at?: string | null
        }
        Update: {
          bonus_awarded?: boolean
          created_at?: string
          credited_at?: string | null
          id?: string
          referred_user_id?: string
          referrer_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_preferences: {
        Row: {
          block_friend_requests: boolean
          created_at: string
          invisible_mode: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          block_friend_requests?: boolean
          created_at?: string
          invisible_mode?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          block_friend_requests?: boolean
          created_at?: string
          invisible_mode?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      telegram_ad_rewards: {
        Row: {
          amount: number
          claimed_at: string | null
          expires_at: string
          id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          claimed_at?: string | null
          expires_at?: string
          id?: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          claimed_at?: string | null
          expires_at?: string
          id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_ad_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          balance: number
          country: string
          created_at: string
          email: string
          fcm_token: string | null
          hide_picture: boolean
          id: string
          is_premium: boolean
          language: string
          last_active_at: string | null
          last_streak_date: string | null
          level: number
          name: string
          profile_picture: string | null
          referral_code: string
          referral_premium_expires_at: string | null
          referred_by: string | null
          streak_count: number
          streak_recovery_used_at: string | null
          timezone: string
          total_xp: number
          updated_at: string
          welcome_bonus_granted: boolean
          yuyu_id: string
          yuyu_score: number
        }
        Insert: {
          balance?: number
          country?: string
          created_at?: string
          email: string
          fcm_token?: string | null
          hide_picture?: boolean
          id: string
          is_premium?: boolean
          language?: string
          last_active_at?: string | null
          last_streak_date?: string | null
          level?: number
          name?: string
          profile_picture?: string | null
          referral_code?: string
          referral_premium_expires_at?: string | null
          referred_by?: string | null
          streak_count?: number
          streak_recovery_used_at?: string | null
          timezone?: string
          total_xp?: number
          updated_at?: string
          welcome_bonus_granted?: boolean
          yuyu_id: string
          yuyu_score?: number
        }
        Update: {
          balance?: number
          country?: string
          created_at?: string
          email?: string
          fcm_token?: string | null
          hide_picture?: boolean
          id?: string
          is_premium?: boolean
          language?: string
          last_active_at?: string | null
          last_streak_date?: string | null
          level?: number
          name?: string
          profile_picture?: string | null
          referral_code?: string
          referral_premium_expires_at?: string | null
          referred_by?: string | null
          streak_count?: number
          streak_recovery_used_at?: string | null
          timezone?: string
          total_xp?: number
          updated_at?: string
          welcome_bonus_granted?: boolean
          yuyu_id?: string
          yuyu_score?: number
        }
        Relationships: []
      }
      viral_clip_rewards: {
        Row: {
          amount: number
          claimed_at: string | null
          id: string
          room_name: string
          started_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          claimed_at?: string | null
          id?: string
          room_name: string
          started_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          claimed_at?: string | null
          id?: string
          room_name?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "viral_clip_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      waiting_users: {
        Row: {
          country: string | null
          created_at: string
          id: string
          language: string | null
          last_seen: string
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          language?: string | null
          last_seen?: string
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          language?: string | null
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      yuyu_coins_packages: {
        Row: {
          bonus_percentage: number
          created_at: string
          description: string | null
          icon_key: string | null
          id: string
          is_active: boolean
          is_popular: boolean
          name: string
          price_usd: number
          sort_order: number
          stripe_price_id: string | null
          updated_at: string
          yuyu_coins: number
        }
        Insert: {
          bonus_percentage?: number
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name: string
          price_usd: number
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
          yuyu_coins: number
        }
        Update: {
          bonus_percentage?: number
          created_at?: string
          description?: string | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name?: string
          price_usd?: number
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
          yuyu_coins?: number
        }
        Relationships: []
      }
      yuyu_leaderboard: {
        Row: {
          country: string
          name: string
          profile_picture: string | null
          rank: number
          user_id: string
          yuyu_score: number
        }
        Insert: {
          country: string
          name: string
          profile_picture?: string | null
          rank: number
          user_id: string
          yuyu_score?: number
        }
        Update: {
          country?: string
          name?: string
          profile_picture?: string | null
          rank?: number
          user_id?: string
          yuyu_score?: number
        }
        Relationships: []
      }
      yuyu_ledger: {
        Row: {
          amount: number
          created_at: string
          id: string
          receiver_uuid: string
          sender_uuid: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          receiver_uuid: string
          sender_uuid: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          receiver_uuid?: string
          sender_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "yuyu_ledger_receiver_uuid_fkey"
            columns: ["receiver_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yuyu_ledger_sender_uuid_fkey"
            columns: ["sender_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      yuyu_price: {
        Row: {
          created_at: string
          current_price: number
          id: string
          market_phase: string
          momentum_direction: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_price?: number
          id?: string
          market_phase?: string
          momentum_direction?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_price?: number
          id?: string
          market_phase?: string
          momentum_direction?: string
          updated_at?: string
        }
        Relationships: []
      }
      yuyu_price_history: {
        Row: {
          active_users: number
          buy_volume: number
          daily_calls: number
          daily_gifts: number
          id: string
          market_phase: string
          price: number
          recorded_at: string
          sell_volume: number
        }
        Insert: {
          active_users?: number
          buy_volume?: number
          daily_calls?: number
          daily_gifts?: number
          id?: string
          market_phase?: string
          price: number
          recorded_at?: string
          sell_volume?: number
        }
        Update: {
          active_users?: number
          buy_volume?: number
          daily_calls?: number
          daily_gifts?: number
          id?: string
          market_phase?: string
          price?: number
          recorded_at?: string
          sell_volume?: number
        }
        Relationships: []
      }
      yuyu_transactions: {
        Row: {
          amount: number
          amount_usd: number
          created_at: string
          id: string
          price: number
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          amount_usd?: number
          created_at?: string
          id?: string
          price?: number
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          amount_usd?: number
          created_at?: string
          id?: string
          price?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atomic_match_user: {
        Args: {
          p_country?: string
          p_exclude_partner?: string
          p_expand?: boolean
          p_language?: string
          p_user_id: string
        }
        Returns: {
          is_rematch: boolean
          partner_id: string
          room_name: string
        }[]
      }
      begin_telegram_ad_reward: { Args: never; Returns: Json }
      begin_viral_clip_reward: {
        Args: { p_room_name: string }
        Returns: string
      }
      buy_yuyu_at_market_price: {
        Args: { p_usd_amount: number; p_user_id: string }
        Returns: Json
      }
      claim_telegram_ad_reward: { Args: { p_reward_id: string }; Returns: Json }
      claim_viral_clip_reward: { Args: { p_reward_id: string }; Returns: Json }
      cleanup_waiting_user: { Args: { p_user_id: string }; Returns: undefined }
      credit_welcome_bonus_yuyu: { Args: { p_user_id: string }; Returns: Json }
      deliver_due_notifications: { Args: never; Returns: number }
      end_match_for_user: {
        Args: {
          p_duration_seconds?: number
          p_partner_id?: string
          p_user_id: string
        }
        Returns: number
      }
      enqueue_all_daily_notifications: { Args: never; Returns: number }
      enqueue_daily_notifications: {
        Args: { p_timezone?: string; p_user_id: string }
        Returns: number
      }
      generate_yuyu_id: { Args: never; Returns: string }
      get_referral_unlock_status: { Args: never; Returns: Json }
      get_yuyu_live_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      heartbeat_waiting_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      match_throttled: { Args: { p_user_id: string }; Returns: boolean }
      purge_ephemeral_data: { Args: never; Returns: Json }
      register_verified_referral: { Args: { p_ref: string }; Returns: Json }
      sell_yuyu_at_market_price: {
        Args: { p_user_id: string; p_yuyu_amount: number }
        Returns: Json
      }
      start_referral_campaign: { Args: { p_target: number }; Returns: Json }
      transfer_yuyu: {
        Args: { amount: number; recipient_yuyu_id: string; sender_id: string }
        Returns: boolean
      }
      update_daily_streak: {
        Args: never
        Returns: {
          last_active_at: string
          last_streak_date: string
          level: number
          level_progress: number
          streak_count: number
          streak_recovery_used_at: string
          total_xp: number
        }[]
      }
      update_yuyu_price: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
