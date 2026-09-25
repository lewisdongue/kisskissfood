import { useCallback, useEffect, useRef, useState } from "react";
import { Crown, Trophy, Sparkles } from "lucide-react";
import { supabase } from "../config/supabase";

type DonorEntry = {
  id: string;
  name: string;
  amount: number;
  gifts: number;
  avatarUrl?: string | null;
  topGiftName?: string | null;
  lastGiftAt?: string | null;
};

const getWeekStartIso = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // Monday start
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - diff);
  return start.toISOString();
};

const formatUsd = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const HallOfFame = () => {
  const [entries, setEntries] = useState<DonorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const refreshLeaderboard = useCallback(async () => {
    setLoading(true);
    console.log("[HallOfFame] Refreshing leaderboard");
    // Preferred: server-side aggregation (faster, consistent, secure)
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_weekly_top_donors",
      { p_limit: 10 }
    );
    console.log("[HallOfFame] RPC result", { rpcData, rpcError });

    if (!rpcError && Array.isArray(rpcData)) {
      const sorted = rpcData.map((row: any) => ({
        id: String(row.sender_id),
        name: row.name || "Anonymous",
        avatarUrl: row.avatar_url || null,
        amount: Number(row.total_amount || 0),
        gifts: Number(row.gift_count || 0),
        topGiftName: row.top_item_name || null,
        lastGiftAt: row.last_gift_at || null,
      }));

      if (isMountedRef.current) {
        setEntries(sorted);
        setLoading(false);
        setLastUpdatedAt(new Date().toLocaleTimeString());
      }
      return;
    }

    console.warn("[HallOfFame] RPC failed, falling back to client aggregation:", rpcError);

    const sinceIso = getWeekStartIso();

    const { data: gifts, error } = await supabase
      .from("gifts")
      .select("sender_id, value, created_at, gift_type")
      .gte("created_at", sinceIso);
    console.log("[HallOfFame] Fallback gifts result", { sinceIso, giftsCount: gifts?.length, error });

    if (error) {
      console.warn("[HallOfFame] Failed to load gifts:", error);
      if (isMountedRef.current) {
        setEntries([]);
        setLoading(false);
      }
      return;
    }

    const totals = new Map<
      string,
      {
        amount: number;
        gifts: number;
        topGiftAmount: number;
        topGiftName: string | null;
        lastGiftAt: string | null;
      }
    >();
    (gifts || []).forEach((row: any) => {
      if (!row?.sender_id) return;
      const prev =
        totals.get(row.sender_id) || {
          amount: 0,
          gifts: 0,
          topGiftAmount: 0,
          topGiftName: null,
          lastGiftAt: null,
        };
      const amount = Number(row.value || 0);
      const createdAt = row.created_at ? String(row.created_at) : null;
      const isNewTop = Number.isFinite(amount) && amount > prev.topGiftAmount;
      const isLatest =
        createdAt &&
        (!prev.lastGiftAt ||
          new Date(createdAt).getTime() > new Date(prev.lastGiftAt).getTime());
      totals.set(row.sender_id, {
        amount: prev.amount + (Number.isFinite(amount) ? amount : 0),
        gifts: prev.gifts + 1,
        topGiftAmount: isNewTop ? amount : prev.topGiftAmount,
        topGiftName: isNewTop ? row.gift_type || "Gift" : prev.topGiftName,
        lastGiftAt: isLatest ? createdAt : prev.lastGiftAt,
      });
    });

    const ids = Array.from(totals.keys());
    if (ids.length === 0) {
      if (isMountedRef.current) {
        setEntries([]);
        setLoading(false);
      }
      return;
    }

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, profile_picture")
      .in("id", ids);
    console.log("[HallOfFame] Users lookup result", { idsCount: ids.length, usersCount: users?.length, usersError });

    const profileMap = new Map(
      (users || []).map((user: any) => [
        user.id,
        {
          name: user.name || "Anonymous",
          avatarUrl: user.profile_picture || null,
        },
      ])
    );

    const sorted = ids
      .map((id) => {
        const totalsForId = totals.get(id)!;
        const profile = profileMap.get(id);
        return {
          id,
          name: profile?.name || "Anonymous",
          avatarUrl: profile?.avatarUrl || null,
          amount: totalsForId.amount,
          gifts: totalsForId.gifts,
          topGiftName: totalsForId.topGiftName,
          lastGiftAt: totalsForId.lastGiftAt,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    if (isMountedRef.current) {
      setEntries(sorted);
      setLoading(false);
      setLastUpdatedAt(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    refreshLeaderboard();
    return () => {
      isMountedRef.current = false;
    };
  }, [refreshLeaderboard]);

  // Non-critical leaderboard: 30s polling instead of a global unfiltered
  // `gifts` realtime stream (which broadcast every gift of every user).
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refreshLeaderboard();
    }, 30_000);
    refreshTimerRef.current = id;

    return () => {
      window.clearInterval(id);
      refreshTimerRef.current = null;
    };
  }, [refreshLeaderboard]);

  return (
    <section className="w-full max-w-6xl mt-10 mb-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-black/40 via-purple-900/30 to-blue-900/30 backdrop-blur-2xl p-6 md:p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18)_0%,_transparent_55%)]" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-bold text-white/80">
              <Trophy className="w-4 h-4 text-yellow-300" />
              Hall of Fame · Weekly Top Donors
            </div>
            <h3 className="mt-4 text-2xl md:text-3xl font-black text-white">
              Prestige Leaderboard
            </h3>
            <p className="mt-2 text-sm md:text-base text-white/70 max-w-xl">
              Celebrating the elite supporters driving our community. Rankings refresh in real time as gifts arrive.
            </p>
            {lastUpdatedAt && (
              <p className="mt-2 text-xs text-white/50">
                Last updated {lastUpdatedAt}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100 border border-emerald-300/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              Live updates
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-yellow-400/20 to-amber-500/30 px-4 py-3 text-sm font-semibold text-yellow-100 border border-yellow-300/30">
              Secure Stripe payments
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3">
          {loading && (
            <div className="text-sm text-white/70">Loading leaderboard...</div>
          )}

          {!loading && entries.length === 0 && (
            <div className="text-sm text-white/70">No gifts yet this week. Be the first to lead.</div>
          )}

          {!loading &&
            entries.map((entry, index) => {
              const rank = index + 1;
              const rankBadge =
                rank === 1
                  ? "bg-yellow-400/80 text-black"
                  : rank === 2
                  ? "bg-gray-300/80 text-gray-900"
                  : rank === 3
                  ? "bg-amber-600/80 text-white"
                  : "bg-white/10 text-white/80";

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${rankBadge}`}>
                      {rank}
                    </div>
                    <div className="h-9 w-9 rounded-full overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center text-xs font-bold text-white/80">
                      {entry.avatarUrl ? (
                        <img src={entry.avatarUrl} alt={entry.name} className="h-full w-full object-cover" />
                      ) : (
                        entry.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <span>{entry.name}</span>
                        {rank <= 3 && <Crown className="w-4 h-4 text-yellow-300" />}
                      </div>
                      <div className="text-xs text-white/60">
                        {entry.gifts} gifts this week
                        {entry.topGiftName ? ` · Top gift: ${entry.topGiftName}` : ""}
                      </div>
                      {entry.lastGiftAt && (
                        <div className="text-[11px] text-white/45">
                          Last gift: {new Date(entry.lastGiftAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <div className="text-lg font-black text-white">
                      {formatUsd(entry.amount)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

