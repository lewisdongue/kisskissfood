// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CreateChallengePayload = {
  opponentId: string;
  amount: number;
  challengeText: string;
  presetKey?: string | null;
  isCustom?: boolean;
  roomName?: string | null;
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
    const body = (await req.json()) as CreateChallengePayload;

    const opponentId = String(body?.opponentId || "");
    const amount = Number(body?.amount);
    const challengeText = String(body?.challengeText || "").trim();
    const presetKey = body?.presetKey ? String(body.presetKey) : null;
    const isCustom = Boolean(body?.isCustom);
    const roomName = body?.roomName ? String(body.roomName) : null;

    if (!opponentId) {
      return json({ error: "invalid_payload", message: "opponentId is required" }, 400);
    }
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return json({ error: "invalid_payload", message: "amount must be positive" }, 400);
    }
    if (!challengeText) {
      return json({ error: "invalid_payload", message: "challengeText is required" }, 400);
    }

    const sb = getSupabase();
    const { data, error } = await sb.rpc("create_challenge", {
      p_proposer_id: user.id,
      p_opponent_id: opponentId,
      p_amount: amount,
      p_challenge_text: challengeText,
      p_preset_key: presetKey,
      p_is_custom: isCustom,
      p_room_name: roomName,
    });

    if (error) {
      if (error.message?.includes("insufficient_funds")) {
        return json({ error: "insufficient_funds", message: "Not enough Yuyu balance" }, 402);
      }
      return json({ error: error.message || "challenge_create_failed" }, 400);
    }

    return json({ ok: true, ...data }, 200);
  } catch (err: any) {
    return json({ error: err?.message || "Internal Server Error" }, 500);
  }
});
