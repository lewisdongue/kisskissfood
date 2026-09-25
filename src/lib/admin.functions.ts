import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ───────────────────────────────────────────────────────────────────────────
// SYSTEM MANAGEMENT PANEL — server layer.
// Every function verifies the caller holds the `admin` role before any
// platform-wide read. Privileged client is loaded inside the handler only.
// ───────────────────────────────────────────────────────────────────────────

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Unable to verify administrator access");
  if (!data) throw new Error("Forbidden: administrator access required");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

async function audit(db: any, context: Ctx, action: string, targetType: string, targetId: string | null, details: Record<string, unknown> = {}) {
  await db.from("admin_audit_log").insert({ admin_id: context.userId, action, target_type: targetType, target_id: targetId, details });
}

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

async function countRows(db: any, table: string, build?: (q: any) => any) {
  let q = db.from(table).select("*", { count: "exact", head: true });
  if (build) q = build(q);
  const { count } = await q;
  return count ?? 0;
}

export type AdminOverview = {
  totalUsers: number;
  newUsers7d: number;
  newUsers30d: number;
  activeUsers24h: number;
  onlineNow: number;
  premiumUsers: number;
  queueSize: number;
  retention7d: number;
  retention30d: number;
  calls24h: number;
  avgCallSeconds: number;
  moderationTotal: number;
  moderationOpen: number;
  revenue30d: number;
  revenueAllTime: number;
  giftRevenue30d: number;
  growth: { date: string; users: number }[];
  countries: { country: string; users: number; percentage: number }[];
  languages: { language: string; users: number; percentage: number }[];
  generatedAt: string;
};

export const isAdminUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context as unknown as Ctx).supabase.rpc("has_role", {
      _user_id: (context as unknown as Ctx).userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const db = await assertAdmin(context as unknown as Ctx);

    const d1 = daysAgo(1).toISOString();
    const d7 = daysAgo(7).toISOString();
    const d30 = daysAgo(30).toISOString();
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();

    const [
      totalUsers,
      newUsers7d,
      newUsers30d,
      activeUsers24h,
      active7d,
      active30d,
      onlineNow,
      premiumUsers,
      queueSize,
      calls24h,
      moderationTotal,
      moderationOpen,
    ] = await Promise.all([
      countRows(db, "users"),
      countRows(db, "users", (q: any) => q.gte("created_at", d7)),
      countRows(db, "users", (q: any) => q.gte("created_at", d30)),
      countRows(db, "users", (q: any) => q.gte("last_active_at", d1)),
      countRows(db, "users", (q: any) => q.gte("last_active_at", d7)),
      countRows(db, "users", (q: any) => q.gte("last_active_at", d30)),
      countRows(db, "online_users", (q: any) => q.gte("last_seen", fiveMinAgo)),
      countRows(db, "users", (q: any) => q.eq("is_premium", true)),
      countRows(db, "waiting_users"),
      countRows(db, "match_history", (q: any) => q.gte("created_at", d1)),
      countRows(db, "moderation_events"),
      countRows(db, "moderation_events", (q: any) => q.gte("created_at", d7)),
    ]);

    const { data: durations } = await db
      .from("match_history")
      .select("duration_seconds")
      .gte("created_at", d30)
      .limit(1000);
    const durationList: number[] = (durations ?? []).map((r: any) => r.duration_seconds ?? 0);
    const avgCallSeconds = durationList.length
      ? Math.round(durationList.reduce((a, b) => a + b, 0) / durationList.length)
      : 0;

    const { data: tx30 } = await db
      .from("yuyu_transactions")
      .select("amount_usd, type, created_at")
      .gte("created_at", d30)
      .limit(1000);
    const { data: txAll } = await db.from("yuyu_transactions").select("amount_usd").limit(1000);
    const { data: gifts30 } = await db.from("gifts").select("value").gte("created_at", d30).limit(1000);

    const revenue30d = (tx30 ?? []).reduce((sum: number, r: any) => sum + Number(r.amount_usd ?? 0), 0);
    const revenueAllTime = (txAll ?? []).reduce((sum: number, r: any) => sum + Number(r.amount_usd ?? 0), 0);
    const giftRevenue30d = (gifts30 ?? []).reduce((sum: number, r: any) => sum + Number(r.value ?? 0), 0);

    const { data: signups } = await db
      .from("users")
      .select("created_at, country, language")
      .gte("created_at", d30)
      .limit(1000);

    const buckets = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      buckets.set(daysAgo(i).toISOString().slice(0, 10), 0);
    }
    for (const row of signups ?? []) {
      const key = String(row.created_at).slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const growth = [...buckets.entries()].map(([date, users]) => ({ date, users }));

    const { data: allProfiles } = await db.from("users").select("country, language").limit(1000);
    const tally = (rows: any[], key: string) => {
      const map = new Map<string, number>();
      for (const row of rows) {
        const value = (row[key] || "Unknown") as string;
        map.set(value, (map.get(value) ?? 0) + 1);
      }
      const total = rows.length || 1;
      return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, users]) => ({ name, users, percentage: Math.round((users / total) * 1000) / 10 }));
    };
    const profiles = allProfiles ?? [];

    return {
      totalUsers,
      newUsers7d,
      newUsers30d,
      activeUsers24h,
      onlineNow,
      premiumUsers,
      queueSize,
      retention7d: totalUsers ? Math.round((active7d / totalUsers) * 1000) / 10 : 0,
      retention30d: totalUsers ? Math.round((active30d / totalUsers) * 1000) / 10 : 0,
      calls24h,
      avgCallSeconds,
      moderationTotal,
      moderationOpen,
      revenue30d: Math.round(revenue30d * 100) / 100,
      revenueAllTime: Math.round(revenueAllTime * 100) / 100,
      giftRevenue30d: Math.round(giftRevenue30d * 100) / 100,
      growth,
      countries: tally(profiles, "country").map((c) => ({ country: c.name, users: c.users, percentage: c.percentage })),
      languages: tally(profiles, "language").map((c) => ({ language: c.name, users: c.users, percentage: c.percentage })),
      generatedAt: new Date().toISOString(),
    };
  });

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  country: string;
  language: string;
  yuyu_score: number;
  balance: number;
  is_premium: boolean;
  level: number;
  streak_count: number;
  created_at: string;
  last_active_at: string | null;
};

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { page?: number; search?: string; filter?: string; sortBy?: string }) => input)
  .handler(async ({ data, context }): Promise<{ users: AdminUserRow[]; total: number }> => {
    const db = await assertAdmin(context as unknown as Ctx);
    const page = Math.max(1, data.page ?? 1);
    const limit = 20;

    let query = db
      .from("users")
      .select(
        "id, email, name, country, language, yuyu_score, balance, is_premium, level, streak_count, created_at, last_active_at",
        { count: "exact" },
      );

    if (data.search?.trim()) {
      const term = data.search.trim().replace(/[%,]/g, "");
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
    }

    if (data.filter === "premium") query = query.eq("is_premium", true);
    if (data.filter === "free") query = query.eq("is_premium", false);
    if (data.filter === "active24h") query = query.gte("last_active_at", daysAgo(1).toISOString());
    if (data.filter === "dormant") query = query.lt("last_active_at", daysAgo(30).toISOString());

    const sortColumn =
      data.sortBy === "yuyu" ? "yuyu_score"
      : data.sortBy === "balance" ? "balance"
      : data.sortBy === "joined" ? "created_at"
      : "last_active_at";

    const from = (page - 1) * limit;
    const { data: rows, count, error } = await query
      .order(sortColumn, { ascending: false, nullsFirst: false })
      .range(from, from + limit - 1);

    if (error) throw new Error(error.message);
    return { users: (rows ?? []) as AdminUserRow[], total: count ?? 0 };
  });

export const setUserPremium = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; premium: boolean }) => input)
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { error } = await db.from("users").update({ is_premium: data.premium }).eq("id", data.userId);
    if (error) throw new Error(error.message);
    await audit(db, context as unknown as Ctx, data.premium ? "Grant Premium" : "Remove Premium", "user", data.userId);
    return { ok: true };
  });

export type ModerationRow = {
  id: string;
  user_id: string;
  room_name: string | null;
  reason: string;
  source: string;
  banned_until: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
};

export const listModerationEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { page?: number; scope?: string; search?: string }) => input)
  .handler(async ({ data, context }): Promise<{ events: ModerationRow[]; total: number }> => {
    const db = await assertAdmin(context as unknown as Ctx);
    const page = Math.max(1, data.page ?? 1);
    const limit = 20;

    let query = db
      .from("moderation_events")
      .select("id, user_id, room_name, reason, source, banned_until, created_at", { count: "exact" });

    if (data.scope === "banned") query = query.not("banned_until", "is", null);
    if (data.scope === "open") query = query.is("banned_until", null);
    if (data.scope === "last7d") query = query.gte("created_at", daysAgo(7).toISOString());
    if (data.search?.trim()) query = query.ilike("reason", `%${data.search.trim().replace(/[%,]/g, "")}%`);

    const from = (page - 1) * limit;
    const { data: rows, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw new Error(error.message);

    const ids = [...new Set((rows ?? []).map((r: any) => r.user_id))];
    const { data: profiles } = ids.length
      ? await db.from("users").select("id, name, email").in("id", ids)
      : { data: [] };
    const byId = new Map<string, any>((profiles ?? []).map((p: any) => [p.id, p] as [string, any]));

    const events: ModerationRow[] = (rows ?? []).map((r: any) => ({
      ...r,
      user_name: byId.get(r.user_id)?.name ?? null,
      user_email: byId.get(r.user_id)?.email ?? null,
    }));

    return { events, total: count ?? 0 };
  });

export const moderateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { eventId: string; action: "ban24h" | "ban7d" | "clear" | "delete" }) => input)
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as unknown as Ctx);

    if (data.action === "delete") {
      const { error } = await db.from("moderation_events").delete().eq("id", data.eventId);
      if (error) throw new Error(error.message);
      await audit(db, context as unknown as Ctx, "Delete report", "moderation_event", data.eventId);
      return { ok: true };
    }

    const bannedUntil =
      data.action === "clear"
        ? null
        : new Date(Date.now() + (data.action === "ban7d" ? 7 : 1) * 86_400_000).toISOString();

    const { error } = await db
      .from("moderation_events")
      .update({ banned_until: bannedUntil })
      .eq("id", data.eventId);
    if (error) throw new Error(error.message);
    await audit(db, context as unknown as Ctx, data.action === "clear" ? "Lift Ban" : data.action === "ban7d" ? "Ban 7d" : "Ban 24h", "moderation_event", data.eventId);
    return { ok: true };
  });

export type CallInsights = {
  totalCalls: number;
  calls24h: number;
  calls7d: number;
  avgSeconds: number;
  longestSeconds: number;
  totalMinutes: number;
  liveRooms: number;
  queueSize: number;
  hourly: { hour: string; calls: number }[];
  durationBuckets: { label: string; calls: number; percentage: number }[];
};

export const getCallInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CallInsights> => {
    const db = await assertAdmin(context as unknown as Ctx);
    const d1 = daysAgo(1).toISOString();
    const d7 = daysAgo(7).toISOString();

    const [totalCalls, calls24h, calls7d, queueSize] = await Promise.all([
      countRows(db, "match_history"),
      countRows(db, "match_history", (q: any) => q.gte("created_at", d1)),
      countRows(db, "match_history", (q: any) => q.gte("created_at", d7)),
      countRows(db, "waiting_users"),
    ]);

    const liveRooms = await countRows(db, "match_history", (q: any) => q.is("ended_at", null));

    const { data: recent } = await db
      .from("match_history")
      .select("duration_seconds, created_at")
      .gte("created_at", d7)
      .order("created_at", { ascending: false })
      .limit(1000);

    const rows = recent ?? [];
    const seconds: number[] = rows.map((r: any) => Number(r.duration_seconds ?? 0));
    const avgSeconds = seconds.length ? Math.round(seconds.reduce((a, b) => a + b, 0) / seconds.length) : 0;
    const longestSeconds = seconds.length ? Math.max(...seconds) : 0;
    const totalMinutes = Math.round(seconds.reduce((a, b) => a + b, 0) / 60);

    const hourMap = new Map<string, number>();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(Date.now() - i * 3_600_000);
      hourMap.set(`${String(d.getUTCHours()).padStart(2, "0")}:00`, 0);
    }
    for (const row of rows) {
      const key = `${String(new Date(row.created_at).getUTCHours()).padStart(2, "0")}:00`;
      if (hourMap.has(key)) hourMap.set(key, (hourMap.get(key) ?? 0) + 1);
    }

    const bucketDefs: { label: string; test: (s: number) => boolean }[] = [
      { label: "< 30s", test: (s) => s < 30 },
      { label: "30s – 2m", test: (s) => s >= 30 && s < 120 },
      { label: "2m – 10m", test: (s) => s >= 120 && s < 600 },
      { label: "10m+", test: (s) => s >= 600 },
    ];
    const total = seconds.length || 1;

    return {
      totalCalls,
      calls24h,
      calls7d,
      avgSeconds,
      longestSeconds,
      totalMinutes,
      liveRooms,
      queueSize,
      hourly: [...hourMap.entries()].map(([hour, calls]) => ({ hour, calls })),
      durationBuckets: bucketDefs.map((b) => {
        const calls = seconds.filter(b.test).length;
        return { label: b.label, calls, percentage: Math.round((calls / total) * 1000) / 10 };
      }),
    };
  });

export type RevenueBreakdown = {
  totalUsd: number;
  usd30d: number;
  usd7d: number;
  buyUsd: number;
  sellUsd: number;
  giftValue30d: number;
  yuyuPrice: number;
  marketPhase: string;
  paidUsers: number;
  premiumUsers: number;
  daily: { date: string; usd: number }[];
  recent: { id: string; type: string; amount: number; amount_usd: number; created_at: string }[];
};

export const getRevenueBreakdown = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RevenueBreakdown> => {
    const db = await assertAdmin(context as unknown as Ctx);
    const d7 = daysAgo(7).toISOString();
    const d30 = daysAgo(30).toISOString();

    const { data: tx } = await db
      .from("yuyu_transactions")
      .select("id, user_id, type, amount, amount_usd, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    const rows = tx ?? [];

    const { data: gifts } = await db.from("gifts").select("value").gte("created_at", d30).limit(1000);
    const { data: price } = await db
      .from("yuyu_price")
      .select("current_price, market_phase")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const premiumUsers = await countRows(db, "users", (q: any) => q.eq("is_premium", true));

    const sum = (list: any[]) => Math.round(list.reduce((a, r) => a + Number(r.amount_usd ?? 0), 0) * 100) / 100;

    const buckets = new Map<string, number>();
    for (let i = 29; i >= 0; i--) buckets.set(daysAgo(i).toISOString().slice(0, 10), 0);
    for (const r of rows) {
      const key = String(r.created_at).slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(r.amount_usd ?? 0));
    }

    return {
      totalUsd: sum(rows),
      usd30d: sum(rows.filter((r: any) => r.created_at >= d30)),
      usd7d: sum(rows.filter((r: any) => r.created_at >= d7)),
      buyUsd: sum(rows.filter((r: any) => String(r.type).toLowerCase().includes("buy"))),
      sellUsd: sum(rows.filter((r: any) => String(r.type).toLowerCase().includes("sell"))),
      giftValue30d: Math.round((gifts ?? []).reduce((a: number, r: any) => a + Number(r.value ?? 0), 0) * 100) / 100,
      yuyuPrice: Number(price?.current_price ?? 0),
      marketPhase: String(price?.market_phase ?? "unknown"),
      paidUsers: new Set(rows.map((r: any) => r.user_id)).size,
      premiumUsers,
      daily: [...buckets.entries()].map(([date, usd]) => ({ date, usd: Math.round(usd * 100) / 100 })),
      recent: rows.slice(0, 15).map((r: any) => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount ?? 0),
        amount_usd: Number(r.amount_usd ?? 0),
        created_at: r.created_at,
      })),
    };
  });


// ─── Growth / Clips / Live calls / Economy / Audit ─────────────────────────
export type GrowthCenter = {
  referrals: { total: number; verified: number; credited: number; last7d: number; shareClicks: number; shareSignups: number;
    top: { id: string; name: string; code: string; count: number }[];
    fraud: { ip: string; clicks: number; signups: number }[] };
  clips: { created: number; claimed: number; yuyuPaid: number; last24h: number; plays: number; shares: number;
    recent: { id: string; user_id: string; name: string; room_name: string; amount: number; started_at: string; claimed_at: string | null }[] };
  live: { activeRooms: number; waiting: number; successRate: number; avgSeconds: number; calls24h: number;
    rooms: { id: string; room_name: string; user: string; partner: string; created_at: string }[] };
  economy: { supply: number; usdBalances: number; purchasedYuyu: number; purchasedUsd: number; referralRewards: number; clipRewards: number;
    failedPayments: number; refunded: number; price: number; purchases: { id: string; name: string; amount_usd: number; yuyu_coins: number; status: string; payment_method: string; created_at: string }[] };
  audit: { id: string; action: string; target_type: string; target_id: string | null; admin: string; created_at: string }[];
};

export const getGrowthCenter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GrowthCenter> => {
    const db = await assertAdmin(context as unknown as Ctx);
    const since24 = daysAgo(1).toISOString();
    const [refs, clicks, clips, live, waiting, calls24, supplyRows, purchases, priceRow, auditRows] = await Promise.all([
      db.from("referrals").select("id, referrer_id, created_at, verified_at, credited_at").limit(5000),
      db.from("voice_share_clicks").select("ip_address, did_signup, did_play, did_share").limit(10000),
      db.from("viral_clip_rewards").select("id, user_id, room_name, amount, started_at, claimed_at").order("started_at", { ascending: false }).limit(2000),
      db.from("match_history").select("id, room_name, user_id, partner_id, created_at").is("ended_at", null).gte("created_at", daysAgo(0.125).toISOString()).order("created_at", { ascending: false }).limit(100),
      countRows(db, "waiting_users"),
      db.from("match_history").select("duration_seconds").gte("created_at", since24).limit(10000),
      db.from("users").select("yuyu_score, balance").limit(100000),
      db.from("yuyu_coin_purchases").select("id, user_id, amount_usd, yuyu_coins, status, payment_method, created_at").order("created_at", { ascending: false }).limit(1000),
      db.from("yuyu_price").select("current_price").limit(1).maybeSingle(),
      db.from("admin_audit_log").select("id, action, target_type, target_id, admin_id, created_at").order("created_at", { ascending: false }).limit(100),
    ]);
    const r = refs.data ?? []; const c = clicks.data ?? []; const cl = clips.data ?? []; const lv = live.data ?? [];
    const p = purchases.data ?? []; const a = auditRows.data ?? []; const durs = (calls24.data ?? []).map((x: any) => x.duration_seconds ?? 0);
    const ids = [...new Set<string>([...r.map((x: any) => x.referrer_id), ...cl.slice(0, 50).map((x: any) => x.user_id), ...lv.flatMap((x: any) => [x.user_id, x.partner_id]), ...p.slice(0, 50).map((x: any) => x.user_id), ...a.map((x: any) => x.admin_id)])];
    const { data: profiles } = ids.length ? await db.from("users").select("id, name, email, referral_code").in("id", ids) : { data: [] };
    const byId = new Map<string, any>((profiles ?? []).map((x: any) => [x.id, x] as [string, any]));
    const nm = (id: string) => byId.get(id)?.name || byId.get(id)?.email || id.slice(0, 8);
    const refCount = new Map<string, number>();
    r.filter((x: any) => x.credited_at).forEach((x: any) => refCount.set(x.referrer_id, (refCount.get(x.referrer_id) ?? 0) + 1));
    const ipMap = new Map<string, { clicks: number; signups: number }>();
    c.forEach((x: any) => { if (!x.ip_address) return; const e = ipMap.get(x.ip_address) ?? { clicks: 0, signups: 0 }; e.clicks++; if (x.did_signup) e.signups++; ipMap.set(x.ip_address, e); });
    const completed = durs.filter((d: number) => d >= 10).length;
    const claimed = cl.filter((x: any) => x.claimed_at);
    return {
      referrals: {
        total: r.length, verified: r.filter((x: any) => x.verified_at).length, credited: r.filter((x: any) => x.credited_at).length,
        last7d: r.filter((x: any) => x.created_at >= daysAgo(7).toISOString()).length,
        shareClicks: c.length, shareSignups: c.filter((x: any) => x.did_signup).length,
        top: [...refCount.entries()].sort((x, y) => y[1] - x[1]).slice(0, 20).map(([id, count]) => ({ id, name: nm(id), code: byId.get(id)?.referral_code ?? "", count })),
        fraud: [...ipMap.entries()].filter(([, v]) => v.signups >= 2 || v.clicks >= 10).map(([ip, v]) => ({ ip, ...v })).sort((x, y) => y.signups - x.signups).slice(0, 20),
      },
      clips: {
        created: cl.length, claimed: claimed.length, yuyuPaid: claimed.reduce((s: number, x: any) => s + (x.amount ?? 0), 0),
        last24h: cl.filter((x: any) => x.started_at >= since24).length,
        plays: c.filter((x: any) => x.did_play).length, shares: c.filter((x: any) => x.did_share).length,
        recent: cl.slice(0, 50).map((x: any) => ({ ...x, name: nm(x.user_id) })),
      },
      live: {
        activeRooms: lv.length, waiting, calls24h: durs.length,
        successRate: durs.length ? Math.round((completed / durs.length) * 100) : 0,
        avgSeconds: durs.length ? Math.round(durs.reduce((s: number, d: number) => s + d, 0) / durs.length) : 0,
        rooms: lv.map((x: any) => ({ id: x.id, room_name: x.room_name, user: nm(x.user_id), partner: nm(x.partner_id), created_at: x.created_at })),
      },
      economy: {
        supply: (supplyRows.data ?? []).reduce((s: number, x: any) => s + Number(x.yuyu_score ?? 0), 0),
        usdBalances: (supplyRows.data ?? []).reduce((s: number, x: any) => s + Number(x.balance ?? 0), 0),
        purchasedYuyu: p.filter((x: any) => x.status === "completed").reduce((s: number, x: any) => s + (x.yuyu_coins ?? 0), 0),
        purchasedUsd: p.filter((x: any) => x.status === "completed").reduce((s: number, x: any) => s + Number(x.amount_usd ?? 0), 0),
        referralRewards: r.filter((x: any) => x.credited_at).length,
        clipRewards: claimed.reduce((s: number, x: any) => s + (x.amount ?? 0), 0),
        failedPayments: p.filter((x: any) => /fail|declin/i.test(x.status ?? "")).length,
        refunded: p.filter((x: any) => /refund|chargeback|dispute/i.test(x.status ?? "")).length,
        price: Number(priceRow.data?.current_price ?? 0),
        purchases: p.slice(0, 50).map((x: any) => ({ ...x, amount_usd: Number(x.amount_usd), name: nm(x.user_id) })),
      },
      audit: a.map((x: any) => ({ id: x.id, action: x.action, target_type: x.target_type, target_id: x.target_id, admin: nm(x.admin_id), created_at: x.created_at })),
    };
  });

export const killSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string }) => input)
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { data: row, error } = await db.from("match_history").update({ ended_at: new Date().toISOString() }).eq("id", data.matchId).is("ended_at", null).select("room_name").maybeSingle();
    if (error) throw new Error(error.message);
    await audit(db, context as unknown as Ctx, "Kill Session", "room", row?.room_name ?? data.matchId);
    return { ok: true };
  });

export const takeDownClip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { rewardId: string }) => input)
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { error } = await db.from("viral_clip_rewards").delete().eq("id", data.rewardId);
    if (error) throw new Error(error.message);
    await audit(db, context as unknown as Ctx, "Take Down clip", "viral_clip", data.rewardId);
    return { ok: true };
  });
