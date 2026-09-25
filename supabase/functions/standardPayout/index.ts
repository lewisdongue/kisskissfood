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

const addBalance = async (userId: string, amount: number) => {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("increment_balance", { user_id: userId, amount });
  if (error) throw error;
  return data;
};

const subtractBalance = async (userId: string, amount: number) => {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("decrement_balance", { user_id: userId, amount });
  if (error) throw error;
  return data;
};

const recordWalletTransaction = async (
  userId: string,
  amount: number,
  payoutId: string,
  payoutType: "standard" | "instant",
  connectId: string
) => {
  const sb = getSupabase();
  const { error } = await sb.from("wallet_transactions").insert({
    user_id: userId,
    direction: "debit",
    amount,
    currency: "usd",
    type: `payout_${payoutType}`,
    reference: payoutId,
    meta: { connect_account_id: connectId },
  });
  if (error) {
    console.warn("[standardPayout] wallet_transactions insert failed", { error });
  }
};

const recordWithdrawal = async (
  userId: string,
  amount: number,
  payout: any,
  payoutType: "standard" | "instant",
  connectId: string
) => {
  const sb = getSupabase();
  const { error } = await sb.from("withdrawals").insert({
    user_id: userId,
    amount,
    currency: payout?.currency || "usd",
    payout_type: payoutType,
    status: payout?.status || "pending",
    stripe_payout_id: payout?.id || null,
    stripe_account_id: connectId,
    raw: payout || {},
  });
  if (error) {
    console.warn("[standardPayout] withdrawals insert failed", { error });
  }
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
 * Standard payout (Stripe Connect) to the user's connected account.
 * Deducts from in-app balance, then creates a Stripe payout.
 */

const resolveConnectAccountId = (row: any): string | null => {
  if (row?.stripe_connect_account_id) return String(row.stripe_connect_account_id);
  // legacy fallback
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
    const { amount } = await req.json();
    if (!amount || typeof amount !== "number" || amount <= 0) return json({ error: "invalid_amount" }, 400);

    const sb = getSupabase();
    const { data: u } = await sb
      .from("users")
      .select("stripe_connect_account_id, stripe_account_id")
      .eq("id", user.id)
      .single();

    const connectId = resolveConnectAccountId(u);
    if (!connectId) return json({ error: "missing_stripe_connect_account" }, 400);

    console.log("[standardPayout] processing", { userId: user.id, amount, connectId });

    // Debit in-app wallet first (so the app can't overdraft via multiple payout calls)
    const newBalance = await subtractBalance(user.id, amount);

    try {
      // Create payout on the connected account
      const params = new URLSearchParams();
      params.set("amount", String(Math.round(amount * 100)));
      params.set("currency", "usd");

      const payout = await stripeRequest("POST", "/payouts", params, connectId);

      console.log("[standardPayout] payout created", { payoutId: payout.id });

      await recordWalletTransaction(user.id, amount, payout.id, "standard", connectId);
      await recordWithdrawal(user.id, amount, payout, "standard", connectId);

      return json({ ok: true, payout, balance: newBalance }, 200);
    } catch (stripeErr: any) {
      console.error("[standardPayout] payout creation failed, refunding", {
        message: stripeErr?.message,
        stripe: stripeErr?.stripe,
      });
      try {
        await addBalance(user.id, amount);
      } catch (refundErr: any) {
        console.error("[standardPayout] refund failed", { message: refundErr?.message });
      }
      throw stripeErr;
    }
  } catch (err: any) {
    console.error("[standardPayout] error", {
      message: err?.message,
      stripe: err?.stripe,
    });
    return json({ error: err?.message || "Internal Server Error", stripe: err?.stripe }, 500);
  }
});
