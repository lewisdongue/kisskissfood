// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const FN_VERSION = "createSubscription-2026-03-08-01";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "x-fn-version": FN_VERSION },
  });

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { ...corsHeaders, "x-fn-version": FN_VERSION } });

const requireEnv = (keys: string[]) => keys.filter((key) => !Deno.env.get(key));

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
    const err = new Error(
      String(data?.message || data?.error?.message || data?.error || `dodo_request_failed_${res.status}`),
    );
    (err as any).dodo = data;
    (err as any).httpStatus = res.status;
    throw err;
  }

  return data;
};

const resolveRedirectUrl = (override?: string | null) => {
  const candidate =
    (override && String(override)) ||
    Deno.env.get("DODO_PAYMENTS_RETURN_URL") ||
    Deno.env.get("DODO_RETURN_URL") ||
    Deno.env.get("STRIPE_SUCCESS_URL") ||
    (Deno.env.get("DOMAIN") ? `${Deno.env.get("DOMAIN")}/` : "");

  try {
    return new URL(candidate).toString();
  } catch {
    return "https://example.com/payments-return-not-configured";
  }
};

const getSubscriptionProductId = (plan: "student" | "regular" | "lifetime") => {
  if (plan === "student") {
    return Deno.env.get("DODO_PRODUCT_STUDENT") || Deno.env.get("STRIPE_PRICE_STUDENT");
  }
  if (plan === "lifetime") {
    return Deno.env.get("DODO_PRODUCT_LIFETIME") || Deno.env.get("STRIPE_PRICE_LIFETIME");
  }
  return Deno.env.get("DODO_PRODUCT_REGULAR") || Deno.env.get("STRIPE_PRICE_REGULAR");
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestId = crypto.randomUUID();
    if (req.method !== "POST") return text("Method Not Allowed", 405);

    const missingEnv = requireEnv([
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "DODO_PAYMENTS_API_KEY",
      "DODO_PRODUCT_STUDENT",
      "DODO_PRODUCT_REGULAR",
    ]);
    if (missingEnv.length) {
      return json({ error: "missing_env", missing: missingEnv }, 500);
    }

    const user = await requireAuth(req);
    const { plan, successUrl, cancelUrl } = await req.json();

    if (!plan || (plan !== "student" && plan !== "regular" && plan !== "lifetime")) {
      return json({ error: "invalid_plan", received: plan }, 400);
    }

    const productId = getSubscriptionProductId(plan);
    if (!productId) {
      return json({ error: "dodo_product_not_configured", plan }, 500);
    }

    const returnUrl = resolveRedirectUrl(successUrl || cancelUrl);
    const metadata = toMetadataRecord({
      userId: user.id,
      type: "subscription",
      plan,
      price_id: productId,
      cancel_url: cancelUrl || "",
    });

    const session = await createDodoCheckoutSession({
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: returnUrl,
      customer: {
        email: user.email || undefined,
      },
      metadata,
      subscription_data: plan === "lifetime" ? undefined : {},
    });

    console.log("[createSubscription] Dodo session created", {
      requestId,
      userId: user.id,
      plan,
      sessionId: session.session_id,
    });

    return json(
      {
        url: session.checkout_url,
        id: session.session_id,
        requestId,
        version: FN_VERSION,
      },
      200,
    );
  } catch (err: any) {
    console.error("[createSubscription] error", {
      message: err?.message,
      stack: err?.stack,
      dodo: err?.dodo,
      httpStatus: err?.httpStatus,
    });

    return json(
      {
        error: err?.message || "Internal Server Error",
        dodo: err?.dodo,
        httpStatus: err?.httpStatus,
        version: FN_VERSION,
      },
      500,
    );
  }
});
