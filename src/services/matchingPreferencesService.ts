import { supabase, TABLES } from '../config/supabase';
import type { UserGender } from '../types';

export interface UserMatchPreferences {
  gender?: UserGender;
  preferredGender?: UserGender | null;
  preferredRegions?: string[] | null;
  country?: string;
  isPremium: boolean;
}

/**
 * Fetch user's matching preferences for premium filtering
 */
export const getUserMatchPreferences = async (
  userId: string
): Promise<UserMatchPreferences> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('gender, preferred_gender, preferred_regions, country, is_premium')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[getUserMatchPreferences] Error:', error);
      return {
        gender: 'prefer_not_to_say',
        preferredGender: null,
        preferredRegions: null,
        country: undefined,
        isPremium: false,
      };
    }

    return {
      gender: (data?.gender as UserGender) || 'prefer_not_to_say',
      preferredGender: (data?.preferred_gender as UserGender | null) || null,
      preferredRegions: data?.preferred_regions || null,
      country: data?.country || undefined,
      isPremium: data?.is_premium || false,
    };
  } catch (error) {
    console.error('[getUserMatchPreferences] Exception:', error);
    return {
      gender: 'prefer_not_to_say',
      preferredGender: null,
      preferredRegions: null,
      country: undefined,
      isPremium: false,
    };
  }
};

/**
 * Update user's gender and matching preferences (premium feature)
 */
export const updateUserMatchPreferences = async (
  userId: string,
  preferences: Partial<UserMatchPreferences>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = {};

    if (preferences.gender) {
      updateData.gender = preferences.gender;
    }

    if (preferences.preferredGender !== undefined) {
      updateData.preferred_gender = preferences.preferredGender;
    }

    if (preferences.preferredRegions !== undefined) {
      updateData.preferred_regions = preferences.preferredRegions;
    }

    const { error } = await supabase
      .from(TABLES.USERS)
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('[updateUserMatchPreferences] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[updateUserMatchPreferences] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check if user can skip the current call (premium skip enforcement)
 */
export const canUserSkipCall = async (
  userId: string,
  callDurationSeconds: number
): Promise<{ canSkip: boolean; reason?: string; minimumDuration?: number }> => {
  try {
    const { data, error } = await supabase.rpc('can_user_skip_call', {
      p_user_id: userId,
      p_call_duration_seconds: callDurationSeconds,
    });

    if (error) {
      console.error('[canUserSkipCall] Error:', error);
      // Fail open - allow skip on error
      return { canSkip: true };
    }

    const result = data?.[0];
    return {
      canSkip: result?.can_skip ?? true,
      reason: result?.reason,
      minimumDuration: result?.minimum_duration,
    };
  } catch (error) {
    console.error('[canUserSkipCall] Exception:', error);
    // Fail open - allow skip on error
    return { canSkip: true };
  }
};
