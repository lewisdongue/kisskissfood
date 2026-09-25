// ═══════════════════════════════════════════════════════════════════════════
// VIRAL SHARE + VIP STATUS
// Counts completed matching sessions in the production database, surfaces the
// one-time share offer after the 8th session, grants 24h of VIP the instant a
// share completes, and re-locks automatically when the window lapses.
// Never blocks matching: every write is fire-and-forget.
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/config/supabase";

export const SHARE_PROMPT_AT_MATCH = 8;

const LS_STATE = "caakus_share_state_v1";
const LS_VIP = "caakus_vip_until_v1";

type LocalState = { matches: number; done: boolean; dismissed: boolean };

function readLocal(): LocalState {
  if (typeof window === "undefined") return { matches: 0, done: false, dismissed: false };
  try {
    const raw = window.localStorage.getItem(LS_STATE);
    return raw ? { matches: 0, done: false, dismissed: false, ...JSON.parse(raw) } : { matches: 0, done: false, dismissed: false };
  } catch {
    return { matches: 0, done: false, dismissed: false };
  }
}

function writeLocal(patch: Partial<LocalState>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_STATE, JSON.stringify({ ...readLocal(), ...patch }));
  } catch {
    /* noop */
  }
}

export function useViralShare(userId: string | null | undefined) {
  const [matches, setMatches] = useState(0);
  const [shareDone, setShareDone] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [vipUntil, setVipUntil] = useState<number | null>(null);
  const [isVip, setIsVip] = useState(false);
  const countedRooms = useRef<Set<string>>(new Set());
  const shownRef = useRef(false);

  // ── Hydrate from cache first (instant), then reconcile with production ──
  useEffect(() => {
    if (!userId) return;
    const local = readLocal();
    setMatches(local.matches);
    setShareDone(local.done);
    setDismissed(local.dismissed);
    try {
      const cachedVip = Number(window.localStorage.getItem(LS_VIP) ?? 0);
      if (cachedVip > Date.now()) setVipUntil(cachedVip);
    } catch {
      /* noop */
    }

    let cancelled = false;
    (async () => {
      const [{ data: state }, { data: profile }] = await Promise.all([
        supabase.rpc("get_viral_growth_state", { p_user: userId }),
        supabase.from("users").select("vip_expires_at").eq("id", userId).maybeSingle(),
      ]);
      if (cancelled) return;
      const row = (Array.isArray(state) ? state[0] : state) as
        | { matches_completed: number; share_completed_at: string | null }
        | null;
      if (row) {
        setMatches(row.matches_completed ?? 0);
        setShareDone(!!row.share_completed_at);
        writeLocal({ matches: row.matches_completed ?? 0, done: !!row.share_completed_at });
      }
      const expires = (profile as { vip_expires_at?: string | null } | null)?.vip_expires_at;
      if (expires) applyVip(new Date(expires).getTime());
    })().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const applyVip = useCallback((until: number) => {
    setVipUntil(until);
    try {
      window.localStorage.setItem(LS_VIP, String(until));
    } catch {
      /* noop */
    }
  }, []);

  // ── Live lock / unlock exactly at T and at T+24h ────────────────────────
  useEffect(() => {
    if (!vipUntil) {
      setIsVip(false);
      return;
    }
    const tick = () => setIsVip(Date.now() < vipUntil);
    tick();
    const remaining = vipUntil - Date.now();
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setIsVip(false), remaining + 250);
    const interval = window.setInterval(tick, 30_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [vipUntil]);

  // ── Real-time: VIP unlocks the instant the row changes in production ────
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`vip-${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${userId}` },
        (payload) => {
          const next = (payload.new as { vip_expires_at?: string | null })?.vip_expires_at;
          if (next) applyVip(new Date(next).getTime());
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, applyVip]);

  /** Called once per completed session. Never awaited by the caller. */
  const recordMatch = useCallback(
    (roomKey: string) => {
      if (!userId || !roomKey || countedRooms.current.has(roomKey)) return;
      countedRooms.current.add(roomKey);
      setMatches((prev) => {
        const next = prev + 1;
        writeLocal({ matches: next });
        return next;
      });
      void supabase.rpc("record_match_completed", { p_user: userId }).then(({ data }) => {
        const row = (Array.isArray(data) ? data[0] : data) as { matches_completed: number } | null;
        if (row?.matches_completed) {
          setMatches(row.matches_completed);
          writeLocal({ matches: row.matches_completed });
        }
      });
    },
    [userId],
  );

  const shouldPrompt = !!userId && !shareDone && !dismissed && matches >= SHARE_PROMPT_AT_MATCH;

  useEffect(() => {
    if (!shouldPrompt || shownRef.current || !userId) return;
    shownRef.current = true;
    void supabase.rpc("mark_share_prompt_shown", { p_user: userId });
  }, [shouldPrompt, userId]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    writeLocal({ dismissed: true });
  }, []);

  /** Grants 24h VIP in production the moment the share completes. */
  const claimVip = useCallback(async () => {
    if (!userId) return null;
    setShareDone(true);
    writeLocal({ done: true });
    const { data } = await supabase.rpc("claim_share_vip", { p_user: userId });
    const until = typeof data === "string" ? new Date(data).getTime() : Date.now() + 86_400_000;
    applyVip(until);
    return until;
  }, [userId, applyVip]);

  return { matches, shouldPrompt, dismiss, claimVip, recordMatch, isVip, vipUntil };
}
