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

const stripeRequest = async (method: "GET" | "POST", path: string, params?: URLSearchParams) => {
  if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
  const url = method === "GET" && params ? `${STRIPE_API}${path}?${params.toString()}` : `${STRIPE_API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2022-11-15",
    },
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

const resolveConnectAccountId = (row: any): string | null => {
  if (row?.stripe_connect_account_id) return String(row.stripe_connect_account_id);
  if (row?.stripe_account_id && String(row.stripe_account_id).startsWith("acct_")) return String(row.stripe_account_id);
  return null;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (req.method !== "POST") return text("Method Not Allowed", 405);

    const user = await requireAuth(req);

    const sb = getSupabase();
    const { data: profile } = await sb
      .from("users")
      .select("stripe_connect_account_id, stripe_account_id")
      .eq("id", user.id)
      .single();

    let connectId = resolveConnectAccountId(profile);

    if (!connectId) {
      console.log("[createConnectAccount] creating account", { userId: user.id, email: user.email });

      // Create Stripe Connect Express account
      const params = new URLSearchParams();
      params.set("type", "express");
      params.set("email", user.email || "");
      params.set("capabilities[transfers][requested]", "true");

      const account = await stripeRequest("POST", "/accounts", params);
      connectId = account.id;

      console.log("[createConnectAccount] account created", { accountId: connectId });

      // Store connect account id in dedicated column (avoid overwriting customer id)
      await sb.from("users").update({ stripe_connect_account_id: connectId }).eq("id", user.id);
    } else {
      console.log("[createConnectAccount] existing account found", { accountId: connectId });
    }

    // Create account link for onboarding
    const linkParams = new URLSearchParams();
    linkParams.set("account", connectId);
    linkParams.set("refresh_url", `${Deno.env.get("DOMAIN") || "http://localhost:5173"}/onboarding/refresh`);
    linkParams.set("return_url", `${Deno.env.get("DOMAIN") || "http://localhost:5173"}/onboarding/success`);
    linkParams.set("type", "account_onboarding");

    const link = await stripeRequest("POST", "/account_links", linkParams);

    console.log("[createConnectAccount] onboarding link created", { url: link.url });

    return json({ url: link.url }, 200);
  } catch (err: any) {
    const stripeMessage = err?.stripe?.message || err?.message || "";
    if (typeof stripeMessage === "string" && stripeMessage.includes("signed up for Connect")) {
      return json({ error: "stripe_connect_not_enabled", stripe: err?.stripe }, 400);
    }

    console.error("[createConnectAccount] error", {
      message: err?.message,
      stack: err?.stack,
      stripe: err?.stripe,
    });
    return json({ error: err?.message || "Internal Server Error", stripe: err?.stripe }, 500);
  }
});
