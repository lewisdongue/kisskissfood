// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CompleteChallengePayload = {
  challengeId: string;
  outcome: "completed" | "failed";
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: corsHeaders });

const getSupabase = () => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false } });
};

const requireAuth = async (req: Request) => {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("Missing auth");
  const token = auth.slice("Bearer ".length);
  const sb = getSupabase();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) throw new Error("Invalid token");
  return user;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return text("Method Not Allowed", 405);

    const user = await requireAuth(req);
    const body = (await req.json()) as CompleteChallengePayload;
    const challengeId = String(body?.challengeId || "");
    const outcome = body?.outcome;

    if (!challengeId) {
      return json({ error: "invalid_payload", message: "challengeId is required" }, 400);
    }
    if (outcome !== "completed" && outcome !== "failed") {
      return json({ error: "invalid_payload", message: "outcome must be completed or failed" }, 400);
    }

    const sb = getSupabase();
    const { data, error } = await sb.rpc("resolve_challenge", {
      p_challenge_id: challengeId,
      p_actor_id: user.id,
      p_outcome: outcome,
    });

    if (error) {
      return json({ error: error.message || "challenge_complete_failed" }, 400);
    }

    return json({ ok: true, ...data }, 200);
  } catch (err: any) {
    return json({ error: err?.message || "Internal Server Error" }, 500);
  }
});
