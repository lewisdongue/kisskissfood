import { supabase } from '../config/supabase';

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 100;

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';

export interface LevelInfo {
  level: number;
  progress: number;
  totalXp: number;
  xpToNext: number;
  badgeTier?: BadgeTier;
  badgeName?: string;
}

// Get badge tier based on level and total Yuyu spent (XP)
export const getBadgeTierFromLevel = (level: number): BadgeTier => {
  if (level >= 101) return 'legendary'; // Legendary (beyond max)
  if (level >= 51) return 'gold';       // Gold Badge + VIP (51-100)
  if (level >= 11) return 'silver';     // Silver Badge + Priority (11-50)
  return 'bronze';                      // Bronze Badge (1-10)
};

// Get badge display name - Professional naming
export const getBadgeTierName = (tier: BadgeTier): string => {
  switch (tier) {
    case 'legendary': return 'Legendary';
    case 'gold': return 'VIP';
    case 'silver': return 'Professional';
    case 'bronze': return 'Rising Star';
    default: return 'Member';
  }
};

export interface StreakProgress {
  streak_count: number;
  last_streak_date: string | null;
  streak_recovery_used_at?: string | null;
  level?: number;
  level_progress?: number;
  total_xp?: number;
  last_active_at?: string | null;
}

export interface RecoveryResult {
  success: boolean;
  message: string;
  streak_count: number | null;
  last_streak_date: string | null;
  streak_recovery_used_at: string | null;
}

export interface StreakLeaderboardEntry {
  user_id: string;
  name: string;
  streak_count: number;
  level: number;
  profile_picture?: string | null;
  country?: string | null;
  hide_picture?: boolean | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  is_active: boolean;
}

export interface LevelUnlock {
  id: string;
  feature_key: string;
  title: string;
  description: string;
  level_required: number;
}

export const getLevelInfo = (totalXp: number): LevelInfo => {
  const safeXp = Math.max(0, totalXp || 0);
  const rawLevel = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const level = Math.min(MAX_LEVEL, Math.max(1, rawLevel));

  if (level >= MAX_LEVEL) {
    const tier = getBadgeTierFromLevel(level);
    return {
      level: MAX_LEVEL,
      progress: 100,
      totalXp: safeXp,
      xpToNext: 0,
      badgeTier: tier,
      badgeName: getBadgeTierName(tier),
    };
  }

  const xpIntoLevel = safeXp % XP_PER_LEVEL;
  const progress = Math.floor((xpIntoLevel / XP_PER_LEVEL) * 100);
  const xpToNext = XP_PER_LEVEL - xpIntoLevel;

  const tier = getBadgeTierFromLevel(level);

  return { 
    level, 
    progress, 
    totalXp: safeXp, 
    xpToNext,
    badgeTier: tier,
    badgeName: getBadgeTierName(tier),
  };
};

/** XP awarded per minute of presence on any Caakus page (backend rate-limits to once per 60s) */
export const XP_PER_MINUTE_PRESENCE = 1;

/**
 * Awards XP for being on the app (any page). Called by the global presence ticker every minute.
 * Backend allows at most one award per 60 seconds per user.
 */
export const awardXpForPresence = async (userId: string): Promise<{ new_total_xp?: number; new_level?: number; new_level_progress?: number; leveled_up?: boolean } | null> => {
  const { data, error } = await supabase.rpc('award_xp', {
    p_user_id: userId,
    p_xp_amount: XP_PER_MINUTE_PRESENCE,
  });
  if (error) {
    // Rate limit or auth errors are expected; avoid spamming console
    if (!error.message?.includes('once per') && !error.message?.includes('authenticated') && !error.message?.includes('Cannot award')) {
      console.error('award_xp (presence) failed:', error.message);
    }
    return null;
  }
  return (data && data[0]) ? data[0] : null;
};

export const updateDailyStreak = async (): Promise<StreakProgress | null> => {
  const { data, error } = await supabase.rpc('update_daily_streak');
  if (error) {
    console.error('update_daily_streak failed:', error);
    return null;
  }
  return (data && data[0]) || null;
};

export const recoverStreak = async (): Promise<RecoveryResult | null> => {
  const { data, error } = await supabase.rpc('recover_streak');
  if (error) {
    console.error('recover_streak failed:', error);
    return null;
  }
  return (data && data[0]) || null;
};

export const getStreakLeaderboard = async (limit = 10): Promise<StreakLeaderboardEntry[]> => {
  const { data, error } = await supabase.rpc('get_streak_leaderboard', { p_limit: limit });
  if (error) {
    console.error('get_streak_leaderboard failed:', error);
    return [];
  }
  return data || [];
};

export const getAchievements = async (): Promise<Achievement[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('id, name, description, icon, requirement_type, requirement_value, is_active')
    .eq('is_active', true)
    .order('requirement_type', { ascending: true })
    .order('requirement_value', { ascending: true });

  if (error) {
    console.error('getAchievements failed:', error);
    return [];
  }
  return data || [];
};

export const getUserAchievementIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  if (error) {
    console.error('getUserAchievementIds failed:', error);
    return [];
  }
  return (data || []).map((row) => row.achievement_id);
};

export const getLevelUnlocks = async (): Promise<LevelUnlock[]> => {
  const { data, error } = await supabase
    .from('level_unlocks')
    .select('id, feature_key, title, description, level_required')
    .order('level_required', { ascending: true });

  if (error) {
    console.error('getLevelUnlocks failed:', error);
    return [];
  }
  return data || [];
};

