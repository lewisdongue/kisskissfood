import { useEffect, useRef, useState } from "react";
import { supabase } from "@/config/supabase";
import { awardXpForPresence } from "@/services/progressionService";
import { useAuth } from "@/hooks/useAuth";

/**
 * Global level/XP presence ticker: awards 1 XP every minute while the user is
 * on any page of Caakus (tab visible). Uses Supabase auth for userId so it
 * stays in sync when user logs in from any component. Level increases on every page.
 */
export function GlobalLevelProgress() {
  const { updateUserData } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updateUserDataRef = useRef(updateUserData);
  updateUserDataRef.current = updateUserData;

  useEffect(() => {
    const setUserFromSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const id = session?.user?.id ?? null;
      setUserId(id);
    };

    setUserFromSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setUserFromSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const INTERVAL_MS = 60 * 1000; // 1 minute

    const tick = async () => {
      if (typeof document === "undefined" || document.visibilityState !== "visible") return;
      const result = await awardXpForPresence(userId);
      if (result?.new_total_xp != null) {
        const updates: { total_xp: number; level?: number; level_progress?: number } = { total_xp: result.new_total_xp };
        if (result.new_level != null) updates.level = result.new_level;
        if (result.new_level_progress != null) updates.level_progress = result.new_level_progress;
        updateUserDataRef.current(updates);
      }
    };

    // First XP after 1 minute, then every minute
    const timeoutId = setTimeout(() => {
      tick();
      intervalRef.current = setInterval(tick, INTERVAL_MS);
    }, INTERVAL_MS);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId]);

  return null;
}
