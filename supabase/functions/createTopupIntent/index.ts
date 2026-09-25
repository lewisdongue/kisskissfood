import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DODO_TEST_API_BASE_URL = "https://test.dodopayments.com";
const DODO_LIVE_API_BASE_URL = "https://live.dodopayments.com";

const getDodoApiBaseUrl = () => {
  const explicitBaseUrl = Deno.env.get("DODO_PAYMENTS_API_BASE_URL");
  if (explicitBaseUrl) return explicitBaseUrl.replace(/\/$/, "");

  const mode = (
    Deno.env.get("DODO_PAYMENTS_ENV") ||
    Deno.env.get("DODO_PAYMENTS_MODE") ||
    "live_mode"
  ).toLowerCase();

  return mode.includes("test") ? DODO_TEST_API_BASE_URL : DODO_LIVE_API_BASE_URL;
};

const toMetadataRecord = (input?: Record<string, unknown> | null) => {
  const output: Record<string, string> = {};
  if (!input) return output;

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    output[key] = String(value);
  }

  return output;
};

const createDodoCheckoutSession = async (payload: unknown) => {
  const apiKey = Deno.env.get("DODO_PAYMENTS_API_KEY");
  if (!apiKey) throw new Error("dodo_api_key_not_configured");

  const res = await fetch(`${getDodoApiBaseUrl()}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(String(data?.message || data?.error?.message || data?.error || "dodo_request_failed"));
  return data;
};

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
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*", // or "http://localhost:5173"
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const user = await requireAuth(req);
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0)
      return new Response(JSON.stringify({ error: "invalid_amount" }), { status: 400 });

    // Platform cap: nothing on Caakus may cost more than $300
    if (amount > 300)
      return new Response(JSON.stringify({ error: "amount_too_large", hint: "Maximum $300" }), { status: 400 });

    const cents = Math.round(amount * 100);
    const topupProductId =
      Deno.env.get("DODO_PRODUCT_TOPUP_PWYW") ||
      Deno.env.get("DODO_PRODUCT_TOPUP");
    if (!topupProductId) {
      return new Response(JSON.stringify({ error: "dodo_topup_product_not_configured" }), { status: 500 });
    }

    const returnUrl =
      Deno.env.get("DODO_PAYMENTS_RETURN_URL") ||
      Deno.env.get("DODO_RETURN_URL") ||
      Deno.env.get("DOMAIN") ||
      "http://localhost:5173";

    const session = await createDodoCheckoutSession({
      product_cart: [{ product_id: topupProductId, quantity: 1, amount: cents }],
      return_url: returnUrl,
      customer: { email: user.email || undefined },
      metadata: toMetadataRecord({
        userId: user.id,
        type: "topup",
        amountUsd: amount,
      }),
    });

    return new Response(JSON.stringify({ url: session.checkout_url, id: session.session_id }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
  }
});
