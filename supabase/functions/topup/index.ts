import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Direct topups are disabled. Use hosted checkout + webhook to credit balance.

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

    await requireAuth(req);
    await req.json().catch(() => ({}));

    return json({ error: "topup_disabled_use_checkout_session" }, 403);
  } catch (err: any) {
    return json({ error: err.message || "Internal Server Error" }, 500);
  }
});
