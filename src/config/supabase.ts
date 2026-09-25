import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as canonicalSupabase } from '@/integrations/supabase/client';

// ============================================================================
// SUPABASE CONFIGURATION - SINGLE SOURCE OF TRUTH
// ============================================================================

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_URL = rawUrl?.trim().replace(/\/+$/, '') ?? '';
export const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;


/**
 * CRITICAL: This is the ONLY Supabase client instance in the entire app
 * DO NOT create additional clients elsewhere to avoid "Multiple GoTrueClient instances" error
 */
// Legacy services cover tables that are not all represented in the generated
// schema yet. Keep their permissive surface while sharing the canonical auth client.
export const supabase = canonicalSupabase as unknown as SupabaseClient<any, any, any>;

// ============================================================================
// DATABASE TABLES - COMPLETE REFERENCE
// ============================================================================

export const TABLES = {
  // Core tables
  USERS: 'users',
  WAITING_USERS: 'waiting_users',
  MATCH_HISTORY: 'match_history',
  PREFETCH_MATCHES: 'prefetch_matches',
  PLATFORM_STATS: 'platform_stats',
  
  // Social features
  CALL_SESSIONS: 'call_sessions',
  FRIEND_REQUESTS: 'friend_requests',
  DIRECT_MESSAGES: 'direct_messages',
  NOTIFICATIONS: 'notifications',
  REFERRALS: 'referrals',
  ONLINE_USERS: 'online_users',
  
  // Gamification
  YUYU_LOGS: 'yuyu_logs',

  // Community Hub – feature suggestions & votes
  FEATURE_SUGGESTIONS: 'feature_suggestions',
  FEATURE_SUGGESTION_VOTES: 'feature_suggestion_votes',
} as const;

// ============================================================================
// RPC FUNCTIONS - TYPE-SAFE REFERENCES
// ============================================================================

export const RPC_FUNCTIONS = {
  GET_REVOLUTIONARY_MATCH: 'get_revolutionary_match',
  PREFETCH_NEXT_MATCH: 'prefetch_next_match',
  GET_REALTIME_STATS: 'get_realtime_stats',
  CALCULATE_DISTANCE_KM: 'calculate_distance_km',
  GET_USER_AVG_RATING: 'get_user_avg_rating',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current authenticated user ID
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Clean up waiting_users table for ghost users.
 * Uses the secure cleanup_waiting_user RPC so guest/anonymous users can leave
 * the queue without needing direct table delete privileges.
 */
export const cleanupWaitingUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('cleanup_waiting_user', { p_user_id: userId });
    if (error) throw error;
    console.log('🧹 Cleaned up waiting_users for:', userId);
  } catch (error) {
    // Queue cleanup is best-effort. Network loss must never create an
    // unhandled rejection or prevent the call UI from returning to idle.
    console.warn('⚠️ Waiting queue cleanup deferred:', error);
  }
};
