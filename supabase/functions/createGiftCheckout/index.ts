// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Creates a Stripe Checkout Session (one-time payment) for sending a "gift".
 *
 * Flow:
 * 1) User A clicks gift in Marketplace
 * 2) Frontend calls this function with { toUserId, amount, itemName, successUrl, cancelUrl }
 * 3) We create a Checkout Session (mode=payment) and attach metadata on the PaymentIntent
 * 4) Stripe webhook credits User B balance (receiverShare) when payment succeeds
 */

type CreateGiftCheckoutPayload = {
  toUserId: string;
  amount?: number; // in USD (legacy fallback; prefer marketplaceGiftId)
  itemName?: string;
  marketplaceGiftId?: string;
  successUrl?: string;
  cancelUrl?: string;
};

const PLATFORM_SHARE_RATIO = 0.5; // 50% platform, 50% receiver (example: $50 -> $25/$25)

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
    console.error("[createDodoCheckoutSession] Dodo API error", {
      status: res.status,
      body: data,
    });
    const err = new Error(String(data?.message || data?.error?.message || data?.error || "dodo_request_failed"));
    (err as any).dodo = data;
    throw err;
  }

  return data;
};

const resolveRedirectUrl = (kind: "success" | "cancel", override?: string | null) => {
  const candidate =
    (override && String(override)) ||
    Deno.env.get(kind === "success" ? "DODO_GIFT_RETURN_URL" : "DODO_GIFT_RETURN_URL") ||
    Deno.env.get(kind === "success" ? "DODO_PAYMENTS_RETURN_URL" : "DODO_PAYMENTS_RETURN_URL") ||
    Deno.env.get(kind === "success" ? "STRIPE_GIFT_SUCCESS_URL" : "STRIPE_GIFT_CANCEL_URL") ||
    Deno.env.get(kind === "success" ? "STRIPE_SUCCESS_URL" : "STRIPE_CANCEL_URL") ||
    (Deno.env.get("DOMAIN") ? `${Deno.env.get("DOMAIN")}/` : "");

  try {
    return new URL(candidate).toString();
  } catch {
    return "http://localhost:5173/";
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return text("Method Not Allowed", 405);

    const user = await requireAuth(req);
    const body = (await req.json()) as CreateGiftCheckoutPayload;

    const toUserId = String(body?.toUserId || "");
    const marketplaceGiftId = body?.marketplaceGiftId ? String(body.marketplaceGiftId) : "";

    const sb = getSupabase();

    // Prefer DB-backed gift definition (prevents client-side amount tampering)
    let amount: number | null = null;
    let itemName = (body?.itemName || "Gift").toString();
    let currency = "usd";
    let stripePriceId: string | null = null;

    if (marketplaceGiftId) {
      const { data: giftRow, error: giftErr } = await sb
        .from("marketplace_gifts")
        .select("id, name, amount, currency, stripe_price_id, is_active")
        .eq("id", marketplaceGiftId)
        .maybeSingle();

      if (giftErr) {
        console.error("[createGiftCheckout] marketplace_gifts lookup failed", giftErr);
        return json({ error: "gift_lookup_failed" }, 500);
      }

      if (!giftRow || giftRow.is_active === false) {
        return json({ error: "invalid_gift" }, 400);
      }

      itemName = String(giftRow.name || itemName);
      amount = Number(giftRow.amount);
      currency = String(giftRow.currency || "usd").toLowerCase();
      stripePriceId = giftRow.stripe_price_id ? String(giftRow.stripe_price_id) : null;
    } else {
      // Legacy payload (amount + itemName)
      amount = Number(body?.amount);
      itemName = (body?.itemName || "Gift").toString();
    }

    if (!toUserId) return json({ error: "missing_to_user" }, 400);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return json({ error: "invalid_amount" }, 400);
    }
    // Platform cap: nothing on Caakus may cost more than $300
    if (amount > 300) {
      return json({ error: "amount_too_large", hint: "Maximum $300" }, 400);
    }

    // Normalize to cents to avoid floating errors
    const totalCents = Math.round(amount * 100);
    if (totalCents < 50) {
      return json({ error: "amount_too_small", hint: "Minimum $0.50" }, 400);
    }

    const platformCents = Math.round(totalCents * PLATFORM_SHARE_RATIO);
    const receiverCents = totalCents - platformCents;

    const successUrl = resolveRedirectUrl("success", body?.successUrl);
    const cancelUrl = resolveRedirectUrl("cancel", body?.cancelUrl);

    console.log("[createGiftCheckout] creating session", {
      fromUserId: user.id,
      userEmail: user.email,
      toUserId,
      amount,
      totalCents,
      platformCents,
      receiverCents,
      itemName,
      marketplaceGiftId: marketplaceGiftId || null,
      stripePriceId: stripePriceId || null,
    });

    const fallbackProductId =
      Deno.env.get("DODO_PRODUCT_GIFT_PWYW") ||
      Deno.env.get("DODO_PRODUCT_GIFT");
    const productId = stripePriceId || fallbackProductId;
    if (!productId) {
      return json({ error: "dodo_gift_product_not_configured" }, 500);
    }

    // Always pass `amount` in cents — Dodo requires it for PWYW products.
    // For fixed-price products the field is silently ignored by Dodo.
    const session = await createDodoCheckoutSession({
      product_cart: [{
        product_id: productId,
        quantity: 1,
        amount: totalCents,
      }],
      return_url: successUrl || cancelUrl,
      customer: {
        email: user.email || undefined,
      },
      metadata: toMetadataRecord({
        type: "gift",
        fromUserId: user.id,
        toUserId,
        itemName,
        marketplaceGiftId: marketplaceGiftId || null,
        stripePriceId: stripePriceId || null,
        totalCents,
        platformCents,
        receiverCents,
        currency,
      }),
    });

    console.log("[createGiftCheckout] session created", {
      sessionId: session.session_id,
      url: session.checkout_url,
    });

    return json({ url: session.checkout_url, id: session.session_id }, 200);
  } catch (err: any) {
    console.error("[createGiftCheckout] error", {
      message: err?.message,
      stack: err?.stack,
      dodo: err?.dodo,
    });
    return json({ error: err?.message || "Internal Server Error", dodo: err?.dodo }, 500);
  }
});
