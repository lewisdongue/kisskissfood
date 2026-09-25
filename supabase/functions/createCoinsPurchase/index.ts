// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Creates a Stripe Checkout Session for purchasing Yuyu Coins
 *
 * Flow:
 * 1) User selects a coin package from the frontend
 * 2) Frontend calls this function with { packageId }
 * 3) We lookup the package details from database
 * 4) Create a Checkout Session (mode=payment) with metadata
 * 5) Stripe webhook credits coins when payment succeeds
 * 
 * Conversion rate: 1 USD = 100 Yuyu Coins
 */

type CreateCoinsPurchasePayload = {
  packageId: string;
  successUrl?: string;
  cancelUrl?: string;
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
    Deno.env.get(kind === "success" ? "DODO_COINS_RETURN_URL" : "DODO_COINS_RETURN_URL") ||
    Deno.env.get(kind === "success" ? "DODO_PAYMENTS_RETURN_URL" : "DODO_PAYMENTS_RETURN_URL") ||
    Deno.env.get(kind === "success" ? "STRIPE_COINS_SUCCESS_URL" : "STRIPE_COINS_CANCEL_URL") ||
    Deno.env.get(kind === "success" ? "STRIPE_SUCCESS_URL" : "STRIPE_CANCEL_URL") ||
    (Deno.env.get("DOMAIN") ? `${Deno.env.get("DOMAIN")}/coins?purchase=${kind}` : "");

  try {
    return new URL(candidate).toString();
  } catch {
    return `http://localhost:5173/coins?purchase=${kind}`;
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return text("Method Not Allowed", 405);

    const user = await requireAuth(req);
    const body = (await req.json()) as CreateCoinsPurchasePayload;

    const packageId = String(body?.packageId || "");

    if (!packageId) {
      return json({ error: "missing_package_id" }, 400);
    }

    const sb = getSupabase();

    // ✅ Lookup coin package from database (prevents client-side amount tampering)
    const { data: packageRow, error: packageErr } = await sb
      .from("yuyu_coins_packages")
      .select("id, name, price_usd, yuyu_coins, stripe_price_id, is_active, description")
      .eq("id", packageId)
      .maybeSingle();

    if (packageErr) {
      console.error("[createCoinsPurchase] Package lookup failed", packageErr);
      return json({ error: "package_lookup_failed", details: packageErr.message }, 500);
    }

    if (!packageRow || packageRow.is_active === false) {
      return json({ error: "invalid_package", message: "Package not found or inactive" }, 400);
    }

    const packageName = String(packageRow.name || "Yuyu Coins");
    const priceUsd = Number(packageRow.price_usd);
    const yuyuCoins = Number(packageRow.yuyu_coins);
    const stripePriceId = packageRow.stripe_price_id ? String(packageRow.stripe_price_id) : null;
    const description = String(packageRow.description || `${yuyuCoins} Yuyu Coins`);

    if (!priceUsd || priceUsd <= 0 || !yuyuCoins || yuyuCoins <= 0) {
      return json({ error: "invalid_package_data" }, 400);
    }

    // Platform cap: nothing on Caakus may cost more than $300
    if (priceUsd > 300) {
      return json({ error: "package_exceeds_cap", hint: "Maximum $300" }, 400);
    }

    // Convert to cents
    const priceCents = Math.round(priceUsd * 100);

    if (priceCents < 50) {
      return json({ error: "amount_too_small", hint: "Minimum $0.50" }, 400);
    }

    const successUrl = resolveRedirectUrl("success", body?.successUrl);
    const cancelUrl = resolveRedirectUrl("cancel", body?.cancelUrl);

    console.log("[createCoinsPurchase] Creating session", {
      userId: user.id,
      userEmail: user.email,
      packageId,
      packageName,
      priceUsd,
      priceCents,
      yuyuCoins,
      stripePriceId: stripePriceId || null,
    });

    const fallbackProductId =
      Deno.env.get("DODO_PRODUCT_COINS_PWYW") ||
      Deno.env.get("DODO_PRODUCT_COINS");
    const productId = stripePriceId || fallbackProductId;
    if (!productId) {
      return json({ error: "dodo_coins_product_not_configured" }, 500);
    }

    // Always pass `amount` in cents — Dodo requires it for PWYW products.
    // For fixed-price products the field is silently ignored by Dodo.
    const session = await createDodoCheckoutSession({
      product_cart: [{
        product_id: productId,
        quantity: 1,
        amount: priceCents,
      }],
      return_url: successUrl || cancelUrl,
      customer: {
        email: user.email || undefined,
      },
      metadata: toMetadataRecord({
        type: "coin_purchase",
        userId: user.id,
        packageId,
        packageName,
        priceUsd,
        yuyuCoins,
        stripePriceId: stripePriceId || null,
        description,
      }),
    });

    console.log("[createCoinsPurchase] Session created", {
      sessionId: session.session_id,
      url: session.checkout_url,
    });

    return json({ url: session.checkout_url, id: session.session_id }, 200);
  } catch (err: any) {
    console.error("[createCoinsPurchase] Error", {
      message: err?.message,
      stack: err?.stack,
      dodo: err?.dodo,
    });
    return json({ error: err?.message || "Internal Server Error", dodo: err?.dodo }, 500);
  }
});
