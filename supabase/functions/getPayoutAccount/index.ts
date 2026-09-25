// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Stripe REST API helper
const STRIPE_API = "https://api.stripe.com/v1";
const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

const stripeRequest = async (method: "GET" | "POST", path: string, params?: URLSearchParams, stripeAccount?: string) => {
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
  const url = method === "GET" && params ? `${STRIPE_API}${path}?${params.toString()}` : `${STRIPE_API}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${stripeKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
    "Stripe-Version": "2022-11-15",
  };
  if (stripeAccount) headers["Stripe-Account"] = stripeAccount;

  const res = await fetch(url, {
    method,
    headers,
    body: method === "POST" ? (params ? params.toString() : "") : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.error?.type || "stripe_error";
    const err = new Error(msg);
    (err as any).stripe = data?.error || data;
    (err as any).httpStatus = res.status;
    throw err;
  }
  return data;
};

/**
 * Returns Stripe Connect account status for the authenticated user.
 * Used by the withdrawal UI to know if onboarding is complete.
 */

const resolveConnectAccountId = (row: any): string | null => {
  if (row?.stripe_connect_account_id) return String(row.stripe_connect_account_id);
  // legacy fallback: some deployments stored acct_... in stripe_account_id
  if (row?.stripe_account_id && String(row.stripe_account_id).startsWith("acct_")) return String(row.stripe_account_id);
  return null;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "GET") return text("Method Not Allowed", 405);

    const user = await requireAuth(req);
    const sb = getSupabase();

    const { data: profile } = await sb
      .from("users")
      .select("stripe_connect_account_id, stripe_account_id")
      .eq("id", user.id)
      .single();

    const connectId = resolveConnectAccountId(profile);
    if (!connectId) return json({ connected: false }, 200);

    console.log("[getPayoutAccount] retrieving account", { accountId: connectId });

    const acct = await stripeRequest("GET", `/accounts/${connectId}`);

    const requirements = acct?.requirements || {};
    const currentlyDue = Array.isArray(requirements?.currently_due) ? requirements.currently_due : [];
    const disabledReason = acct?.disabled_reason || requirements?.disabled_reason || null;
    const needsOnboarding =
      !acct?.details_submitted ||
      !acct?.payouts_enabled ||
      currentlyDue.length > 0 ||
      !!disabledReason;

    let onboardingUrl: string | null = null;
    if (needsOnboarding) {
      const linkParams = new URLSearchParams();
      linkParams.set("account", connectId);
      linkParams.set("refresh_url", `${Deno.env.get("DOMAIN") || "http://localhost:5173"}/onboarding/refresh`);
      linkParams.set("return_url", `${Deno.env.get("DOMAIN") || "http://localhost:5173"}/onboarding/success`);
      linkParams.set("type", "account_onboarding");
      const link = await stripeRequest("POST", "/account_links", linkParams);
      onboardingUrl = link?.url || null;
    }

    return json({
      connected: true,
      id: acct.id,
      details_submitted: acct.details_submitted,
      charges_enabled: acct.charges_enabled,
      payouts_enabled: acct.payouts_enabled,
      onboarding_url: onboardingUrl,
      requirements: {
        currently_due: currentlyDue,
        disabled_reason: disabledReason,
      },
    }, 200);
  } catch (err: any) {
    console.error("[getPayoutAccount] error", {
      message: err?.message,
      stripe: err?.stripe,
    });
    return json({ error: err?.message || "Internal Server Error", stripe: err?.stripe }, 500);
  }
});
