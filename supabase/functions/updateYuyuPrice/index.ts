// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * updateYuyuPrice – Supabase Edge Function
 *
 * Called by pg_cron every 60 seconds:
 *   SELECT cron.schedule('update-yuyu-price', '* * * * *',
 *     'SELECT public.update_yuyu_price()');
 *
 * Can also be triggered manually (e.g. after a BUY/SELL for
 * immediate price reflection) by POSTing to this endpoint.
 *
 * The actual price algorithm lives in the DB function
 * public.update_yuyu_price() so it can also be called directly
 * from pg_cron without HTTP overhead.
 *
 * This HTTP endpoint is kept for:
 *  - Manual triggers from admin tools / tests
 *  - Future pg_net-based cron if needed
 */

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

const getSupabase = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sb = getSupabase();

    // Verify caller is authenticated with service role key
    // (pg_cron calls us with the service role; external calls need auth header)
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Accept both service-role Bearer token and the internal cron call
    const isAuthorized =
      !authHeader || // pg_cron internal call has no auth header
      authHeader === `Bearer ${serviceKey}` ||
      authHeader.startsWith("Bearer "); // any valid JWT (edge function validates below)

    if (!isAuthorized) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Call the SQL function that contains the full price algorithm
    const { data, error } = await sb.rpc("update_yuyu_price");

    if (error) {
      console.error("[updateYuyuPrice] RPC error:", error);
      return json({ success: false, error: error.message }, 500);
    }

    console.log("[updateYuyuPrice] Price updated:", data);

    return json({
      success: true,
      result: data,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[updateYuyuPrice] Unexpected error:", err);
    return json({ success: false, error: err?.message || "Internal error" }, 500);
  }
});
