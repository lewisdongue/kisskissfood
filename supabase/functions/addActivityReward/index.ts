// ⚠️ SECURITY CRITICAL: EDGE FUNCTION DISABLED - FREE USD EXPLOIT
// ==================================================================================
// This edge function was giving users FREE real USD ($2-5/day) in their wallet balance
// that could be withdrawn to bank accounts - creating a massive financial liability
// 
// Date Disabled: 2026-02-02
// Security Issue: Users could get $60-150/month FREE real money
// Economic Impact: Potential $730/year per account × unlimited accounts = bankruptcy risk
// 
// DO NOT RE-ENABLE WITHOUT:
// 1. Proper economic model review
// 2. Rate limiting and fraud detection
// 3. Business approval for giving away real money
// 4. Security audit
// ==================================================================================

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  // ❌ ENDPOINT DISABLED FOR SECURITY
  return new Response(
    JSON.stringify({ 
      error: "endpoint_disabled", 
      message: "This endpoint has been disabled for security reasons. Contact support if you believe this is an error.",
      code: "SECURITY_DISABLED"
    }), 
    { 
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    }
  );
  
  /* ⚠️ ORIGINAL CODE - DISABLED DUE TO FREE USD EXPLOIT
  try {
    const user = await requireAuth(req);
    const { minutesActive } = await req.json();

    if (!minutesActive || typeof minutesActive !== "number") return new Response(JSON.stringify({ error: "invalid_minutes" }), { status: 400 });

    const added = await addActivityReward(user, minutesActive);
    return new Response(JSON.stringify({ ok: true, added }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
  }
  */
});
