// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * createYuyuInvestmentCheckout
 *
 * Creates a Stripe Checkout Session for buying YUYU Coins at the
 * current market price.  On payment success, stripeWebhook will call
 * process_yuyu_investment_stripe() to credit YUYU to the user.
 *
 * Body: { usdAmount: number, successUrl?: string, cancelUrl?: string }
 * Returns: { url: string, sessionId: string, priceAtCheckout: number }
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

const requireAuth = async (req: Request) => {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("Missing auth");
  const token = auth.slice("Bearer ".length);
  const sb = getSupabase();
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) throw new Error("Invalid token");
  return user;
};

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
  if (!res.ok) {
    console.error("[createDodoCheckoutSession] Dodo API error", { status: res.status, body: data });
    const err = new Error(String(data?.message || data?.error?.message || data?.error || "dodo_request_failed"));
    (err as any).dodo = data;
    throw err;
  }

  if (!data?.checkout_url && !data?.session_id) {
    console.error("[createDodoCheckoutSession] Dodo returned no checkout_url/session_id", data);
    throw new Error("Dodo did not return a checkout URL");
  }

  return data;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const user = await requireAuth(req);
    const body = await req.json();

    const usdAmount = Number(body?.usdAmount);
    const baseUrl =
      Deno.env.get("DODO_YUYU_INVESTMENT_RETURN_URL") ||
      Deno.env.get("DODO_PAYMENTS_RETURN_URL") ||
      Deno.env.get("DOMAIN") ||
      "http://localhost:5173";
    const successUrl =
      (body?.successUrl && String(body.successUrl).startsWith("http"))
        ? String(body.successUrl)
        : `${String(baseUrl).replace(/\/$/, "")}/?yuyu_buy=success`;
    const cancelUrl =
      (body?.cancelUrl && String(body.cancelUrl).startsWith("http"))
        ? String(body.cancelUrl)
        : `${String(baseUrl).replace(/\/$/, "")}/?yuyu_buy=cancel`;

    if (!usdAmount || usdAmount < 1) {
      return json({ error: "Minimum investment is $1.00" }, 400);
    }

    if (usdAmount > 300) {
      return json({ error: "Maximum investment per transaction is $300" }, 400);
    }

    const sb = getSupabase();

    // Fetch current market price (lock it in for this checkout session)
    const { data: priceRow, error: priceErr } = await sb
      .from("yuyu_price")
      .select("current_price")
      .limit(1)
      .single();

    if (priceErr || !priceRow) {
      console.error("[createYuyuInvestmentCheckout] Could not fetch price:", priceErr);
      return json({ error: "Could not fetch current YUYU price" }, 500);
    }

    const priceAtCheckout = Number(priceRow.current_price) || 0.01;

    // Estimate YUYU (after 3% fee) – purely informational in metadata
    const netUsd = usdAmount * 0.97;
    const estimatedYuyu = Math.floor(netUsd / priceAtCheckout);

    const priceCents = Math.round(usdAmount * 100);
    if (priceCents < 100) {
      return json({ error: "Minimum investment is $1.00" }, 400);
    }

    console.log("[createYuyuInvestmentCheckout]", {
      userId: user.id,
      usdAmount,
      priceAtCheckout,
      estimatedYuyu,
    });

    const productId =
      Deno.env.get("DODO_PRODUCT_YUYU_INVESTMENT_PWYW") ||
      Deno.env.get("DODO_PRODUCT_YUYU_INVESTMENT");
    if (!productId) {
      return json({ error: "dodo_yuyu_investment_product_not_configured" }, 500);
    }

    const apiBase = getDodoApiBaseUrl();
    console.log("[createYuyuInvestmentCheckout] Calling Dodo", {
      apiBase,
      productIdPrefix: productId.slice(0, 12) + "...",
      priceCents,
      successUrl: successUrl.slice(0, 50) + "...",
    });

    const session = await createDodoCheckoutSession({
      product_cart: [{ product_id: productId, quantity: 1, amount: priceCents }],
      return_url: successUrl || cancelUrl,
      customer: {
        email: user.email || undefined,
      },
      metadata: toMetadataRecord({
        type: "yuyu_investment",
        userId: user.id,
        usdAmount,
        priceAtPurchase: priceAtCheckout,
        estimatedYuyu,
      }),
    });

    const checkoutUrl = session?.checkout_url ?? session?.url;
    if (!checkoutUrl) {
      console.error("[createYuyuInvestmentCheckout] Dodo session missing checkout_url", session);
      return json({ error: "Dodo did not return a checkout URL" }, 500);
    }

    console.log("[createYuyuInvestmentCheckout] Session created:", session.session_id);

    return json({
      url: checkoutUrl,
      checkout_url: checkoutUrl,
      sessionId: session.session_id,
      priceAtCheckout,
      estimatedYuyu,
    });
  } catch (err: any) {
    const dodoData = (err as any).dodo;
    console.error("[createYuyuInvestmentCheckout] Error:", err?.message, "dodo:", dodoData);

    const dodoMsg = dodoData?.message || dodoData?.error?.message || dodoData?.error;
    const userMsg = dodoMsg
      ? `Dodo: ${typeof dodoMsg === "string" ? dodoMsg : JSON.stringify(dodoMsg)}`
      : err?.message || "Internal Server Error";

    return json({ error: userMsg, dodo: dodoData }, 500);
  }
});
