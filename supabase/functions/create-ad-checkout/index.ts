import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

/** Allowed origins for success/cancel redirect URLs (Stripe checkout). */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://caakus.com",
  "https://www.caakus.com",
];

function getAllowedOrigin(requestOrigin: string | null): string {
  if (requestOrigin) {
    const normalized = requestOrigin.replace(/\/$/, "");
    if (ALLOWED_ORIGINS.includes(normalized)) return normalized;
  }
  return (
    Deno.env.get("DODO_AD_RETURN_URL")?.replace(/\/$/, "") ||
    Deno.env.get("DODO_PAYMENTS_RETURN_URL")?.replace(/\/$/, "") ||
    Deno.env.get("DOMAIN")?.replace(/\/$/, "") ||
    "https://caakus.com"
  );
}

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
    console.error("[createDodoCheckoutSession] Dodo API error", { status: res.status, body: data });
    const err = new Error(String(data?.message || data?.error?.message || data?.error || "dodo_request_failed"));
    (err as any).dodo = data;
    (err as any).httpStatus = res.status;
    throw err;
  }

  if (!data?.checkout_url && !data?.session_id) {
    console.error("[createDodoCheckoutSession] Dodo returned no checkout_url/session_id", data);
    throw new Error("Dodo did not return a checkout URL");
  }

  return data;
};

/**
 * Calculate advertising spot price with monthly discount.
 * Standard: $200/day, $5,000 per 30-day block.
 * Founding members: $50/day, $1,000 per 30-day block.
 */
function calculatePrice(days: number, isFoundingMember: boolean): number {
  if (isFoundingMember) {
    if (days < 30) return days * 50;
    const fullMonths = Math.floor(days / 30);
    const remainingDays = days % 30;
    return fullMonths * 1000 + remainingDays * 50;
  }
  if (days < 30) return days * 200;
  const fullMonths = Math.floor(days / 30);
  const remainingDays = days % 30;
  return fullMonths * 5000 + remainingDays * 200;
}

/**
 * Create a Dodo checkout session for purchasing an advertising spot.
 * Pricing: $200/day or $5,000/month. Webhook sets payment_status to 'paid' on success.
 */
const jsonResponse = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...corsHeaders, "Access-Control-Max-Age": "86400" } });
  }

  // Allow GET for health check / debugging (e.g. open URL in browser)
  if (req.method === "GET") {
    return jsonResponse({ ok: true, function: "create-ad-checkout", message: "POST with JSON body and Authorization: Bearer <session>" }, 200);
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    console.log("[create-ad-checkout] Request received");
    const user = await requireAuth(req);
    console.log("[create-ad-checkout] Auth OK, user id:", user?.id);
    const sb = getSupabase();

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    const {
      spotId,
      businessName,
      businessUrl,
      businessDescription,
      logoUrl,
      durationDays,
      totalPrice,
      isFoundingMember: clientFounding,
    } = body;
    console.log("[create-ad-checkout] Body:", { spotId, businessName: businessName?.slice(0, 30), durationDays, totalPrice, clientFounding });

    if (!spotId || !businessName || !businessUrl || !durationDays || totalPrice == null) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    const { data: userRow } = await sb.from("users").select("subscription_type").eq("id", user.id).maybeSingle();
    const isFoundingMember = userRow?.subscription_type === "lifetime";

    if (spotId < 1 || spotId > 50) {
      return jsonResponse({ error: "Invalid spot ID. Must be between 1 and 50." }, 400);
    }

    if (durationDays < 1 || durationDays > 365) {
      return jsonResponse({ error: "Duration must be between 1 and 365 days." }, 400);
    }

    const { data: existingSpot } = await sb
      .from("advertising_spots")
      .select("id")
      .eq("spot_id", spotId)
      .eq("payment_status", "paid")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingSpot) {
      return jsonResponse({ error: "This spot is currently occupied. Please choose another spot." }, 409);
    }

    const verifiedPrice = calculatePrice(Number(durationDays), isFoundingMember);
    if (Math.abs(verifiedPrice - Number(totalPrice)) > 1) {
      return jsonResponse({ error: "Price mismatch. Please refresh and try again." }, 400);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const { data: rpcData, error: insertError } = await sb.rpc("create_advertising_spot_reservation", {
      p_spot_id: spotId,
      p_business_name: businessName,
      p_business_url: businessUrl,
      p_business_description: businessDescription && String(businessDescription).trim() ? String(businessDescription).trim() : null,
      p_logo_url: logoUrl || null,
      p_duration_days: durationDays,
      p_total_price: verifiedPrice,
      p_expires_at: expiresAt.toISOString(),
      p_buyer_user_id: user.id,
      p_buyer_email: user.email || null,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return jsonResponse({ error: "Failed to create spot reservation." }, 500);
    }

    const adSpotId = Array.isArray(rpcData) && rpcData[0]?.id ? rpcData[0].id : rpcData?.id;
    if (!adSpotId) {
      console.error("RPC did not return ad spot id:", rpcData);
      return jsonResponse({ error: "Failed to create spot reservation." }, 500);
    }

    const adSpot = { id: adSpotId };

    const origin = getAllowedOrigin(req.headers.get("origin"));
    const successUrl = `${origin}/?ad_success=true&spot=${spotId}`;
    const cancelUrl = `${origin}/?ad_cancelled=true`;
    console.log("[create-ad-checkout] Creating Dodo session, redirect origin:", origin);

    const unitAmountCents = Math.round(verifiedPrice * 100);
    const productId =
      Deno.env.get("DODO_PRODUCT_AD_SPOT_PWYW") ||
      Deno.env.get("DODO_PRODUCT_AD_SPOT");
    if (!productId) {
      return jsonResponse({ error: "dodo_ad_product_not_configured" }, 500);
    }

    const session = await createDodoCheckoutSession({
      product_cart: [{ product_id: productId, quantity: 1, amount: unitAmountCents }],
      return_url: successUrl || cancelUrl,
      customer: {
        email: user.email || undefined,
      },
      metadata: toMetadataRecord({
        type: "advertising_spot",
        ad_spot_id: adSpot.id,
        spot_id: spotId,
        duration_days: durationDays,
        business_name: businessName,
        business_url: businessUrl,
        business_description: businessDescription || "",
        logo_url: logoUrl || "",
        user_id: user.id,
      }),
    });

    const checkoutUrl = session?.checkout_url ?? session?.url;
    console.log("[create-ad-checkout] Dodo session created:", {
      id: session.session_id,
      url: checkoutUrl ? "present" : "MISSING",
    });
    if (!checkoutUrl) {
      console.error("[create-ad-checkout] Dodo did not return a checkout URL. Session:", JSON.stringify(session));
      return jsonResponse({ error: "Dodo did not return a checkout URL. Please try again." }, 500);
    }

    await sb
      .from("advertising_spots")
      .update({ stripe_session_id: session.session_id })
      .eq("id", adSpot.id);

    console.log("[create-ad-checkout] Returning redirect URL to client");
    return jsonResponse({ url: checkoutUrl, sessionId: session.session_id }, 200);
  } catch (error: unknown) {
    console.error("Error creating ad checkout:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const isAuthError = message === "Missing auth" || message === "Invalid token";
    const status = isAuthError ? 401 : 500;
    const friendlyMessage = isAuthError
      ? "Please sign in to purchase an advertising spot."
      : message;
    return jsonResponse({ error: friendlyMessage }, status);
  }
});
