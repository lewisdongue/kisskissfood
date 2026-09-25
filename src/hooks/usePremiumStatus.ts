// Live premium status: paid subscription OR referral-earned premium.
// Flips back to "free" the exact second the referral window expires.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/config/supabase";

export type PremiumStatus = {
  userId: string | null;
  loading: boolean;
  isPremium: boolean;
  paidPremium: boolean;
  referralExpiresAt: string | null;
  referralCode: string | null;
  refresh: () => void;
};

export function usePremiumStatus(): PremiumStatus {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paidPremium, setPaidPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState<string | null>(null);
  const [referralExpiresAt, setReferralExpiresAt] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUserId(data.user?.id ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUserId(session?.user?.id ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setPaidPremium(false);
      setSubscriptionStatus(null);
      setSubscriptionEndsAt(null);
      setReferralExpiresAt(null);
      setReferralCode(null);
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("users")
        .select("is_premium, subscription_status, subscription_ends_at, referral_premium_expires_at, referral_code")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      const row = data as
        | {
            is_premium?: boolean;
            subscription_status?: string | null;
            subscription_ends_at?: string | null;
            referral_premium_expires_at?: string | null;
            referral_code?: string | null;
          }
        | null;
      setPaidPremium(Boolean(row?.is_premium));
      setSubscriptionStatus(row?.subscription_status ?? null);
      setSubscriptionEndsAt(row?.subscription_ends_at ?? null);
      setReferralExpiresAt(row?.referral_premium_expires_at ?? null);
      setReferralCode(row?.referral_code ?? null);
      setLoading(false);
    };
    void load();

    // Unique topic per hook instance: reusing one topic across components
    // triggers "cannot add postgres_changes callbacks after subscribe()".
    const topic = `premium-status-${userId}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(topic)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${userId}` },
        () => void load(),
      )
      .subscribe();

    const poll = window.setInterval(() => void load(), 60_000);

    return () => {
      active = false;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };

  }, [userId, nonce]);

  // Re-evaluate exactly when either earned or paid Premium lapses.
  useEffect(() => {
    const expiries = [referralExpiresAt, subscriptionEndsAt]
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value).getTime())
      .filter((value) => value > Date.now());
    if (expiries.length === 0) return;
    const remaining = Math.min(...expiries) - Date.now();
    const timer = window.setTimeout(() => setNow(Date.now()), remaining + 250);
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [referralExpiresAt, subscriptionEndsAt]);

  const referralActive = Boolean(referralExpiresAt && new Date(referralExpiresAt).getTime() > now);
  const paidExpiryValid = !subscriptionEndsAt || new Date(subscriptionEndsAt).getTime() > now;
  const paidStatusValid = !subscriptionStatus || subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const paidActive = paidPremium && paidStatusValid && paidExpiryValid;

  return {
    userId,
    loading,
    isPremium: paidActive || referralActive,
    paidPremium: paidActive,
    referralExpiresAt,
    referralCode,
    refresh,
  };
}
