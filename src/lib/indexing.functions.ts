import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ───────────────────────────────────────────────────────────────────────────
// GOOGLE INDEXING CONTROL PANEL — admin server layer.
// Reads/writes the production `indexing_config` / `indexing_runs` tables as
// the signed-in admin (RLS enforced via has_role).
// ───────────────────────────────────────────────────────────────────────────

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Unable to verify administrator access");
  if (!data) throw new Error("Forbidden: administrator access required");
}

export type IndexingRun = {
  id: string;
  source: string;
  lang: string | null;
  start_offset: number | null;
  url_count: number | null;
  submitted: number | null;
  succeeded: number | null;
  failed: number | null;
  status: string;
  error: string | null;
  created_at: string;
  completed_at: string | null;
};

export type IndexingStatus = {
  enabled: boolean;
  lang: string;
  nextOffset: number;
  dailyLimit: number;
  totalPerLang: number;
  updatedAt: string;
  submittedTotal: number;
  runs: IndexingRun[];
};

const CONFIG_COLUMNS = "enabled, lang, next_offset, daily_limit, updated_at";
const RUN_COLUMNS =
  "id, source, lang, start_offset, url_count, submitted, succeeded, failed, status, error, created_at, completed_at";

export const getIndexingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<IndexingStatus> => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);

    const { data: cfg, error: cfgErr } = await ctx.supabase
      .from("indexing_config")
      .select(CONFIG_COLUMNS)
      .maybeSingle();
    if (cfgErr) throw new Error(cfgErr.message);

    const { data: runs } = await ctx.supabase
      .from("indexing_runs")
      .select(RUN_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(25);

    const { data: totals } = await ctx.supabase
      .from("indexing_runs")
      .select("succeeded")
      .eq("status", "done")
      .limit(5000);

    const submittedTotal = (totals ?? []).reduce(
      (sum: number, r: { succeeded: number | null }) => sum + (r.succeeded ?? 0),
      0,
    );

    const { PERMUTATIONS_PER_LANG } = await import("@/lib/pseo");

    return {
      enabled: Boolean(cfg?.enabled),
      lang: cfg?.lang ?? "en",
      nextOffset: cfg?.next_offset ?? 0,
      dailyLimit: cfg?.daily_limit ?? 200,
      totalPerLang: PERMUTATIONS_PER_LANG,
      updatedAt: cfg?.updated_at ?? new Date().toISOString(),
      submittedTotal,
      runs: (runs ?? []) as IndexingRun[],
    };
  });

export const setIndexingConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { enabled?: boolean; lang?: string; dailyLimit?: number; nextOffset?: number }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof data.enabled === "boolean") patch["enabled"] = data.enabled;
    if (typeof data.lang === "string" && data.lang) patch["lang"] = data.lang;
    if (typeof data.dailyLimit === "number") {
      patch["daily_limit"] = Math.min(200, Math.max(1, Math.round(data.dailyLimit)));
    }
    if (typeof data.nextOffset === "number") {
      patch["next_offset"] = Math.max(0, Math.round(data.nextOffset));
    }

    const { error } = await ctx.supabase.from("indexing_config").update(patch).eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Submit the next slice to Google right now and advance only after full success. */
export const runIndexingNow = createServerFn({ method: "POST" })
  .inputValidator((input: { count?: number } | undefined) => input ?? {})
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);

    const { data: cfg, error: cfgErr } = await ctx.supabase
      .from("indexing_config")
      .select(CONFIG_COLUMNS)
      .maybeSingle();
    if (cfgErr) throw new Error(cfgErr.message);

    const lang = cfg?.lang ?? "en";
    const offset = cfg?.next_offset ?? 0;
    const count = Math.min(200, Math.max(1, Math.round(data.count ?? cfg?.daily_limit ?? 200)));

    const { buildAutoUrls, submitUrlsToGoogle } = await import("@/lib/indexingSubmit.server");
    const { PERMUTATIONS_PER_LANG } = await import("@/lib/pseo");

    const urls = buildAutoUrls(lang, offset, count);

    const { data: run } = await ctx.supabase
      .from("indexing_runs")
      .insert({
        source: "manual",
        lang,
        start_offset: offset,
        url_count: urls.length,
        status: "pending",
      })
      .select("id")
      .maybeSingle();

    try {
      const result = await submitUrlsToGoogle(urls);
      if (run?.id) {
        await ctx.supabase
          .from("indexing_runs")
          .update({
            status: result.failed === 0 ? "done" : "error",
            submitted: result.submitted,
            succeeded: result.succeeded,
            failed: result.failed,
            error: result.failed ? (result.results.find((r) => r.error)?.error ?? null) : null,
            completed_at: new Date().toISOString(),
          })
          .eq("id", run.id);
      }

      const next =
        result.failed === 0
          ? offset + urls.length >= PERMUTATIONS_PER_LANG
            ? 0
            : offset + urls.length
          : offset;

      if (result.failed === 0) {
        await ctx.supabase
          .from("indexing_config")
          .update({ next_offset: next, updated_at: new Date().toISOString() })
          .eq("id", true);
      }

      return {
        submitted: result.submitted,
        succeeded: result.succeeded,
        failed: result.failed,
        nextOffset: next,
      };
    } catch (err) {
      if (run?.id) {
        await ctx.supabase
          .from("indexing_runs")
          .update({
            status: "error",
            error: (err as Error).message.slice(0, 500),
            completed_at: new Date().toISOString(),
          })
          .eq("id", run.id);
      }
      throw err;
    }
  });
