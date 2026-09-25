// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, webhook-id, webhook-signature, webhook-timestamp",
};

const getSupabase = () => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false } });
};

const encoder = new TextEncoder();

const fromBase64 = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const toBase64 = (input: Uint8Array) => {
  let binary = "";
  for (const byte of input) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const toHex = (input: Uint8Array) =>
  Array.from(input)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const toBase64Url = (input: Uint8Array) =>
  toBase64(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const timingSafeEqual = (a: string, b: string) => {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) return false;

  let mismatch = 0;
  for (let index = 0; index < aBytes.length; index += 1) {
    mismatch |= aBytes[index] ^ bBytes[index];
  }
  return mismatch === 0;
};

const extractSignatureCandidates = (signatureHeader: string) => {
  const rawParts = signatureHeader
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const values: string[] = [];
  for (const part of rawParts) {
    if (part.startsWith("v1,")) {
      values.push(part.slice(3).trim());
      continue;
    }
    if (part.startsWith("v1=")) {
      values.push(part.slice(3).trim());
      continue;
    }
    if (part.includes(",")) {
      const lastSegment = part.split(",").pop()?.trim();
      if (lastSegment) values.push(lastSegment);
      continue;
    }
    if (part.includes("=")) {
      values.push(part.slice(part.indexOf("=") + 1).trim());
      continue;
    }
    values.push(part);
  }

  return values.filter(Boolean);
};

const normalizeSecretCandidates = (secret: string) => {
  const trimmed = secret.trim().replace(/^v1,/, "");
  const withoutPrefix = trimmed.startsWith("whsec_") ? trimmed.slice("whsec_".length) : trimmed;
  const candidates: Uint8Array[] = [];

  try {
    candidates.push(fromBase64(withoutPrefix));
  } catch {
    // Ignore and try raw forms below.
  }

  candidates.push(encoder.encode(withoutPrefix));
  candidates.push(encoder.encode(trimmed));

  const unique = new Map<string, Uint8Array>();
  for (const candidate of candidates) {
    unique.set(toHex(candidate), candidate);
  }
  return Array.from(unique.values());
};

const verifyDodoWebhookSignature = async (rawBody: string, headers: Headers) => {
  const webhookId = headers.get("webhook-id");
  const webhookSignature = headers.get("webhook-signature");
  const webhookTimestamp = headers.get("webhook-timestamp");
  const secret = Deno.env.get("DODO_PAYMENTS_WEBHOOK_SECRET");

  if (!webhookId || !webhookSignature || !webhookTimestamp || !secret) {
    throw new Error("dodo_webhook_not_configured");
  }

  const toleranceSeconds = Number(Deno.env.get("DODO_WEBHOOK_TOLERANCE_SECONDS") || "300");
  const timestampSeconds = Number(webhookTimestamp);
  if (!Number.isFinite(timestampSeconds)) {
    throw new Error("dodo_webhook_invalid_timestamp");
  }

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (ageSeconds > toleranceSeconds) {
    throw new Error("dodo_webhook_timestamp_expired");
  }

  const candidates = extractSignatureCandidates(webhookSignature);
  const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  let isValid = false;
  for (const secretBytes of normalizeSecretCandidates(secret)) {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBytes = new Uint8Array(
      await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(signedPayload)),
    );

    const expectedBase64 = toBase64(signatureBytes);
    const expectedBase64Url = toBase64Url(signatureBytes);
    const expectedHex = toHex(signatureBytes);

    isValid = candidates.some(
      (candidate) =>
        timingSafeEqual(candidate, expectedBase64) ||
        timingSafeEqual(candidate, expectedBase64Url) ||
        timingSafeEqual(candidate, expectedHex),
    );

    if (isValid) break;
  }

  if (!isValid) {
    console.error("[paymentsWebhook] signature debug", {
      webhookId,
      webhookTimestamp,
      signatureHeaderSample: webhookSignature.slice(0, 24),
      candidateCount: candidates.length,
      secretPrefix: secret.slice(0, 8),
      bodyLength: rawBody.length,
    });
    throw new Error("dodo_webhook_invalid_signature");
  }

  return { webhookId, webhookTimestamp };
};

const addBalance = async (userId: string, amount: number) => {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("increment_balance", { user_id: userId, amount });
  if (error) throw error;
  return data;
};

const toIsoString = (value: unknown, fallback: string | null = null) => {
  if (!value) return fallback;
  if (typeof value === "number") {
    const asDate = new Date(value > 10_000_000_000 ? value : value * 1000);
    return Number.isNaN(asDate.getTime()) ? fallback : asDate.toISOString();
  }
  const asDate = new Date(String(value));
  return Number.isNaN(asDate.getTime()) ? fallback : asDate.toISOString();
};

const normalizeMetadata = (payload: any) =>
  payload?.metadata ||
  payload?.payment?.metadata ||
  payload?.checkout_session?.metadata ||
  payload?.subscription?.metadata ||
  (typeof payload?.data === "object" && payload.data?.metadata) ||
  {};

const getPaymentId = (payload: any) =>
  String(
    payload?.payment_id ||
    payload?.id ||
    payload?.payment?.payment_id ||
    payload?.payment?.id ||
    payload?.checkout_session_id ||
    payload?.session_id ||
    "",
  );

const getSubscriptionId = (payload: any) =>
  String(payload?.subscription_id || payload?.id || payload?.subscription?.subscription_id || "");

const getCustomerId = (payload: any) =>
  String(
    payload?.customer_id ||
    payload?.customer?.customer_id ||
    payload?.customer?.id ||
    payload?.payment?.customer_id ||
    "",
  );

const getProductId = (payload: any, metadata: Record<string, string>) =>
  String(
    payload?.product_id ||
    payload?.product_cart?.[0]?.product_id ||
    payload?.line_items?.[0]?.product_id ||
    payload?.subscription?.product_id ||
    metadata?.price_id ||
    metadata?.stripePriceId ||
    "",
  );

const getAmountReceived = (payload: any, metadata: Record<string, string>) => {
  const cents =
    Number(payload?.total_amount) ||
    Number(payload?.amount) ||
    Number(payload?.amount_received) ||
    Number(metadata?.totalCents) ||
    0;
  return cents > 0 ? cents / 100 : 0;
};

const getCurrency = (payload: any, metadata: Record<string, string>) =>
  String(payload?.currency || metadata?.currency || "usd").toLowerCase();

const mapPlanType = (productId: string | null, metadata: Record<string, string>) => {
  if (metadata?.plan === "student" || metadata?.plan === "regular" || metadata?.plan === "lifetime") {
    return metadata.plan;
  }

  const studentProduct = Deno.env.get("DODO_PRODUCT_STUDENT") || Deno.env.get("STRIPE_PRICE_STUDENT");
  const regularProduct = Deno.env.get("DODO_PRODUCT_REGULAR") || Deno.env.get("STRIPE_PRICE_REGULAR");
  const lifetimeProduct = Deno.env.get("DODO_PRODUCT_LIFETIME") || Deno.env.get("STRIPE_PRICE_LIFETIME");

  if (productId && studentProduct && productId === studentProduct) return "student";
  if (productId && lifetimeProduct && productId === lifetimeProduct) return "lifetime";
  if (productId && regularProduct && productId === regularProduct) return "regular";
  return "regular";
};

const mapSubscriptionStatus = (status: string | undefined) => {
  const normalized = String(status || "active").toLowerCase();
  if (normalized === "cancelled") return "canceled";
  if (normalized === "on_hold") return "past_due";
  if (normalized === "failed") return "incomplete";
  if (normalized === "expired") return "canceled";
  return normalized;
};

const hasWalletTransactionForReference = async (reference: string, type: string) => {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("wallet_transactions")
    .select("id")
    .eq("type", type)
    .eq("reference", reference)
    .limit(1);

  if (error) throw error;
  return (data || []).length > 0;
};

const recordWalletTransaction = async (payload: {
  userId: string;
  direction: "credit" | "debit";
  amount: number;
  currency?: string;
  type: string;
  reference: string;
  meta?: Record<string, unknown>;
}) => {
  const sb = getSupabase();
  const { error } = await sb.from("wallet_transactions").insert({
    user_id: payload.userId,
    direction: payload.direction,
    amount: payload.amount,
    currency: (payload.currency || "usd").toLowerCase(),
    type: payload.type,
    reference: payload.reference,
    meta: payload.meta || {},
  });
  if (error) throw error;
};

const handleTopupPayment = async (payment: any, metadata: Record<string, string>) => {
  const paymentId = getPaymentId(payment);
  const userId = metadata?.userId;
  const amount = Number(metadata?.amountUsd) || getAmountReceived(payment, metadata);
  const currency = getCurrency(payment, metadata);

  if (!paymentId || !userId || !amount) return;

  const alreadyProcessed = await hasWalletTransactionForReference(paymentId, "dodo_topup");
  if (alreadyProcessed) {
    console.log("[paymentsWebhook] topup already processed", { paymentId, userId });
    return;
  }

  await addBalance(userId, amount);
  await recordWalletTransaction({
    userId,
    direction: "credit",
    amount,
    currency,
    type: "dodo_topup",
    reference: paymentId,
    meta: {
      provider: "dodo",
      payment_id: paymentId,
    },
  });
};

const handleCoinPurchase = async (payment: any, metadata: Record<string, string>) => {
  const sb = getSupabase();
  const paymentId = getPaymentId(payment);
  const userId = metadata?.userId;
  const packageId = metadata?.packageId;
  const yuyuCoins = Number(metadata?.yuyuCoins);
  const priceUsd = Number(metadata?.priceUsd) || getAmountReceived(payment, metadata);
  const currency = getCurrency(payment, metadata).toUpperCase();

  if (!paymentId || !userId || !yuyuCoins) return;

  const { data: existing } = await sb
    .from("yuyu_coin_purchases")
    .select("id, status")
    .eq("stripe_payment_intent_id", paymentId)
    .maybeSingle();

  if (existing?.id && existing.status === "completed") return;

  const { error } = await sb.rpc("process_coin_purchase_atomic", {
    p_payment_intent_id: paymentId,
    p_user_id: userId,
    p_package_id: packageId || null,
    p_amount_usd: priceUsd,
    p_yuyu_coins: yuyuCoins,
    p_currency: currency,
    p_metadata: metadata,
  });

  if (error) {
    console.error("[paymentsWebhook] coin purchase processing failed", {
      paymentId,
      error,
    });
  }
};

const handleGiftPayment = async (payment: any, metadata: Record<string, string>) => {
  const sb = getSupabase();
  const paymentId = getPaymentId(payment);
  const fromUserId = metadata?.fromUserId;
  const toUserId = metadata?.toUserId;
  const itemName = metadata?.itemName;
  const platformCents = Number(metadata?.platformCents);
  const receiverCents = Number(metadata?.receiverCents);
  const amount = getAmountReceived(payment, metadata);
  const currency = getCurrency(payment, metadata).toUpperCase();

  if (!paymentId || !fromUserId || !toUserId || !amount) return;

  const { data: existing } = await sb
    .from("gifts")
    .select("id")
    .eq("stripe_payment_intent_id", paymentId)
    .maybeSingle();

  if (existing?.id) return;

  const { error } = await sb.rpc("process_stripe_gift_atomic", {
    p_payment_intent_id: paymentId,
    p_sender_id: fromUserId,
    p_receiver_id: toUserId,
    p_amount: amount,
    p_platform_share: platformCents / 100,
    p_receiver_share: receiverCents / 100,
    p_item_name: itemName,
    p_currency: currency,
    p_metadata: metadata,
  });

  if (error) {
    console.error("[paymentsWebhook] gift processing failed", {
      paymentId,
      error,
    });
  }
};

const handleYuyuInvestment = async (payment: any, metadata: Record<string, string>) => {
  const sb = getSupabase();
  const paymentId = getPaymentId(payment);
  const userId = metadata?.userId;
  const usdAmount = Number(metadata?.usdAmount) || getAmountReceived(payment, metadata);
  const priceAtPurchase = Number(metadata?.priceAtPurchase) || 0.01;

  if (!paymentId || !userId || !usdAmount) return;

  const { error } = await sb.rpc("process_yuyu_investment_stripe", {
    p_payment_intent_id: paymentId,
    p_user_id: userId,
    p_usd_amount: usdAmount,
    p_price_at_purchase: priceAtPurchase,
  });

  if (error) {
    console.error("[paymentsWebhook] yuyu investment processing failed", {
      paymentId,
      error,
    });
  }
};

const handleAdSpotCheckout = async (payment: any, metadata: Record<string, string>) => {
  const sb = getSupabase();
  const adSpotId = metadata?.ad_spot_id;
  const durationDays = Number(metadata?.duration_days || 0);
  const paymentId = getPaymentId(payment);

  if (!adSpotId || !paymentId) return;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  const { error } = await sb
    .from("advertising_spots")
    .update({
      payment_status: "paid",
      stripe_session_id: paymentId,
      stripe_payment_intent_id: paymentId,
      purchased_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", adSpotId);

  if (error) {
    console.error("[paymentsWebhook] advertising spot update failed", { adSpotId, error });
  }
};

const handleLifetimeSubscriptionCheckout = async (payment: any, metadata: Record<string, string>) => {
  const sb = getSupabase();
  const userId = metadata?.userId;
  const paymentId = getPaymentId(payment);
  const customerId = getCustomerId(payment);
  const priceId = metadata?.price_id || metadata?.stripePriceId || null;

  if (!userId || !paymentId) return;

  const FOUNDING_MEMBERS_MAX = 50;
  const { data: foundingCount, error: countErr } = await sb.rpc("get_founding_members_count");
  if (!countErr && typeof foundingCount === "number" && foundingCount >= FOUNDING_MEMBERS_MAX) {
    console.warn("[paymentsWebhook] founding members cap reached", { userId, paymentId });
    return;
  }

  const nowIso = new Date().toISOString();
  const { data: existingSub } = await sb
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", paymentId)
    .maybeSingle();

  const payload = {
    stripe_customer_id: customerId || null,
    stripe_price_id: priceId,
    plan_type: "lifetime",
    status: "active",
    current_period_start: nowIso,
    current_period_end: null,
    cancel_at_period_end: false,
    canceled_at: null,
    trial_start: null,
    trial_end: null,
    metadata: payment,
    updated_at: nowIso,
  };

  if (existingSub?.id) {
    await sb.from("subscriptions").update(payload).eq("id", existingSub.id);
  } else {
    await sb.from("subscriptions").insert({
      user_id: userId,
      stripe_subscription_id: paymentId,
      ...payload,
    });
  }

  await sb
    .from("users")
    .update({
      is_premium: true,
      subscription_status: "active",
      subscription_type: "lifetime",
      subscription_ends_at: null,
      stripe_customer_id: customerId || null,
    })
    .eq("id", userId);
};

const handleSyntheticPaymentIntentSucceeded = async (payment: any) => {
  const metadata = normalizeMetadata(payment);
  switch (metadata?.type) {
    case "topup":
      await handleTopupPayment(payment, metadata);
      break;
    case "coin_purchase":
      await handleCoinPurchase(payment, metadata);
      break;
    case "gift":
      await handleGiftPayment(payment, metadata);
      break;
    case "yuyu_investment":
      await handleYuyuInvestment(payment, metadata);
      break;
    default:
      break;
  }
};

const handleSyntheticCheckoutCompleted = async (payment: any) => {
  const metadata = normalizeMetadata(payment);
  switch (metadata?.type) {
    case "advertising_spot":
      await handleAdSpotCheckout(payment, metadata);
      break;
    case "subscription":
      if (metadata?.plan === "lifetime") {
        await handleLifetimeSubscriptionCheckout(payment, metadata);
      }
      break;
    default:
      break;
  }
};

const resolveUserIdForSubscription = async (
  subscription: any,
  customerId: string | null,
  metadata: Record<string, string>,
) => {
  if (metadata?.userId) return metadata.userId;

  const sb = getSupabase();
  if (customerId) {
    const { data } = await sb
      .from("users")
      .select("id")
      .or(`stripe_customer_id.eq.${customerId},stripe_account_id.eq.${customerId}`)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  const email =
    subscription?.customer?.email ||
    subscription?.customer_email ||
    subscription?.email ||
    metadata?.email ||
    null;

  if (!email) return null;

  const { data } = await sb
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  return data?.id || null;
};

const syncSubscriptionRecord = async (subscription: any, forcedStatus?: string) => {
  const sb = getSupabase();
  const metadata = normalizeMetadata(subscription);
  const subscriptionId = getSubscriptionId(subscription);
  const customerId = getCustomerId(subscription) || null;
  const productId = getProductId(subscription, metadata) || null;
  const status = forcedStatus || mapSubscriptionStatus(subscription?.status);
  const userId = await resolveUserIdForSubscription(subscription, customerId, metadata);

  if (!subscriptionId || !userId) {
    console.warn("[paymentsWebhook] subscription sync skipped", { subscriptionId, customerId, metadata });
    return;
  }

  const planType = mapPlanType(productId, metadata);
  const isPremium = status === "active" || status === "trialing";
  const currentPeriodStart =
    toIsoString(subscription?.current_period_start || subscription?.started_at, new Date().toISOString());
  const currentPeriodEnd =
    toIsoString(subscription?.current_period_end || subscription?.next_billing_date || subscription?.expires_at, null);
  const trialStart = toIsoString(subscription?.trial_start, null);
  const trialEnd = toIsoString(subscription?.trial_end, null);
  const canceledAt = toIsoString(subscription?.cancelled_at || subscription?.canceled_at, null);

  const { data: existingSub } = await sb
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  const subPayload = {
    stripe_customer_id: customerId,
    stripe_price_id: productId,
    plan_type: planType,
    status,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: Boolean(subscription?.cancel_at_period_end || subscription?.cancel_at_next_billing_date),
    canceled_at: canceledAt,
    trial_start: trialStart,
    trial_end: trialEnd,
    metadata: subscription,
    updated_at: new Date().toISOString(),
  };

  if (existingSub?.id) {
    await sb.from("subscriptions").update(subPayload).eq("id", existingSub.id);
  } else {
    await sb.from("subscriptions").insert({
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      ...subPayload,
    });
  }

  const userPayload: Record<string, unknown> = {
    is_premium: isPremium,
    subscription_status: status,
    subscription_type: planType,
    stripe_customer_id: customerId,
  };
  if (currentPeriodEnd) userPayload.subscription_ends_at = currentPeriodEnd;

  await sb.from("users").update(userPayload).eq("id", userId);
};

const handleInvoicePaymentFailed = async (payment: any) => {
  const metadata = normalizeMetadata(payment);
  const subscriptionId = getSubscriptionId(payment);
  const customerId = getCustomerId(payment) || null;
  const userId = await resolveUserIdForSubscription(payment, customerId, metadata);
  const sb = getSupabase();

  if (subscriptionId) {
    await sb
      .from("subscriptions")
      .update({
        status: "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);
  }

  if (userId) {
    await sb
      .from("users")
      .update({
        is_premium: false,
        subscription_status: "past_due",
      })
      .eq("id", userId);
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const rawBody = await req.text();

    try {
      await verifyDodoWebhookSignature(rawBody, req.headers);
    } catch (err: any) {
      console.error("[paymentsWebhook] signature verification failed", err?.message || err);
      return new Response(`Webhook Error: ${err?.message || "invalid_signature"}`, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const type = String(event?.type || "");
    const payload = event?.data || {};

    switch (type) {
      case "payment.succeeded":
        await handleSyntheticPaymentIntentSucceeded(payload);
        await handleSyntheticCheckoutCompleted(payload);
        break;
      case "payment.failed":
        await handleInvoicePaymentFailed(payload);
        break;
      case "subscription.updated":
      case "subscription.active":
      case "subscription.renewed":
      case "subscription.plan_changed":
      case "subscription.on_hold":
      case "subscription.failed":
      case "subscription.expired":
        await syncSubscriptionRecord(payload);
        break;
      case "subscription.cancelled":
        await syncSubscriptionRecord(payload, "canceled");
        break;
      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[paymentsWebhook] internal error", err?.message || err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
