/**
 * COLLISION-PROOF MATCHMAKING CLIENT
 * ============================================================================
 * Thin wrapper around the `atomic_match_user` Postgres function
 * (see supabase/sql/atomic_matchmaking.sql).
 *
 * The RPC is transactional and uses FOR UPDATE SKIP LOCKED + an advisory lock,
 * so it either returns a partner nobody else can get, or nothing at all.
 * "Nothing at all" is a normal outcome under load, so we retry instantly with
 * jittered backoff — invisible to the user, no loop, no dead-end error state.
 */

import { supabase } from "../config/supabase";

export interface AtomicMatch {
  room_name: string;
  partner_id: string;
  is_rematch: boolean;
}

const BASE_RETRY_MS = 120;
const MAX_RETRY_MS = 600;

/** Small jitter avoids thundering-herd resonance when 10k clients retry together. */
function jitter(attempt: number): number {
  const base = Math.min(BASE_RETRY_MS * (attempt + 1), MAX_RETRY_MS);
  return base * (0.6 + Math.random() * 0.8);
}

/**
 * Remembers the previous partner so "Next" never bounces straight back to the
 * same person. The RPC falls back to that partner when the queue holds nobody
 * else, so this never causes an empty queue.
 */
const lastPartnerByUser = new Map<string, string>();

export function forgetLastPartner(userId: string): void {
  lastPartnerByUser.delete(userId);
}

/**
 * Attempts to claim a partner atomically.
 * Returns null when the caller has been enqueued and should keep waiting.
 */
export async function claimAtomicMatch(
  userId: string,
  language: string = "en",
  excludePartner?: string | null,
  country?: string | null,
  expand: boolean = true,
): Promise<AtomicMatch | null> {
  const exclude = excludePartner ?? lastPartnerByUser.get(userId) ?? null;

  const { data, error } = await supabase.rpc("atomic_match_user", {
    p_user_id: userId,
    p_language: language,
    p_exclude_partner: exclude,
    p_country: country ?? undefined,
    p_expand: expand,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.room_name || !row?.partner_id) return null;

  const partnerId = String(row.partner_id);
  lastPartnerByUser.set(userId, partnerId);

  return {
    room_name: String(row.room_name),
    partner_id: partnerId,
    is_rematch: Boolean(row.is_rematch),
  };
}

/**
 * Keeps the waiting row alive so an abrupt disconnect (closed tab, dead
 * network) removes the user from the pool within 45 s instead of poisoning it.
 */
export async function heartbeatWaitingUser(userId: string): Promise<void> {
  try {
    await supabase.rpc("heartbeat_waiting_user", { p_user_id: userId });
  } catch {
    /* best-effort */
  }
}


/**
 * Retries the atomic claim while the user is still searching.
 * `shouldContinue` lets the caller abort instantly on "Stop"/unmount.
 */
export async function retryableAtomicMatch(
  userId: string,
  language: string,
  shouldContinue: () => boolean,
  maxAttempts: number = 40,
): Promise<AtomicMatch | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (!shouldContinue()) return null;
    try {
      const match = await claimAtomicMatch(userId, language);
      if (match) return match;
    } catch (error: any) {
      // Serialization / deadlock / lock-not-available are expected under load.
      const code = error?.code ?? "";
      const retryable = ["40001", "40P01", "55P03", "23505"].includes(code);
      if (!retryable) throw error;
    }
    await new Promise((r) => setTimeout(r, jitter(attempt)));
  }
  return null;
}
