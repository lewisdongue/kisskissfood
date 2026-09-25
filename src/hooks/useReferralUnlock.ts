import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";

export function useReferralUnlock(userId?: string | null) {
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setExpiresAt(null); return; }
    let active = true;
    const refresh = async () => {
      const { data } = await supabase.from("users").select("referral_premium_expires_at").eq("id", userId).maybeSingle();
      if (active) setExpiresAt((data as { referral_premium_expires_at?: string | null } | null)?.referral_premium_expires_at ?? null);
    };
    void refresh();
    const channel = supabase.channel(`referral-premium-${userId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${userId}` }, refresh)
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [userId]);

  return Boolean(expiresAt && new Date(expiresAt).getTime() > Date.now());
}