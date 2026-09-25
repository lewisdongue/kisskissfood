// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Sends a gift using dual wallet system (USD wallet OR Yuyu Coins).
 * 
 * Flow:
 * 1) User A has sufficient balance in USD wallet OR Yuyu Coins
 * 2) Frontend calls this function with { toUserId, amount, itemName }
 * 3) Priority: Try USD wallet first, then Yuyu coins (100 coins = $1)
 * 4) Transfer funds (50% platform, 50% receiver) in an ATOMIC transaction
 * 5) Record the gift in the gifts table for real-time notifications
 * 
 * ✅ NEW: Dual wallet support with automatic fallback
 */

type SendGiftPayload = {
  toUserId: string;
  amount: number;
  itemName?: string;
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

/**
 * ✅ NEW: Dual wallet atomic gift transfer
 * Priority: USD wallet first, then Yuyu coins (100 coins = $1 USD)
 * This ensures all operations succeed or fail together
 */
const transferGiftWithDualWallet = async (
  fromUserId: string, 
  toUserId: string, 
  amount: number,
  itemName: string
) => {
  const sb = getSupabase();

  console.log('[transferGiftWithDualWallet] Starting dual wallet transaction', {
    fromUserId,
    toUserId,
    amount,
    itemName
  });

  // ✅ Use new dual wallet RPC function
  const { data, error } = await sb.rpc('send_gift_with_dual_wallet', {
    p_sender_id: fromUserId,
    p_receiver_id: toUserId,
    p_gift_amount_usd: amount,
    p_item_name: itemName
  });

  if (error) {
    console.error('[transferGiftWithDualWallet] Transaction failed:', error);
    throw error;
  }

  console.log('[transferGiftWithDualWallet] Transaction successful:', data);

  return {
    paymentMethod: data?.payment_method || 'unknown',
    senderBalance: data?.sender_new_balance,
    amount: data?.amount,
    giftId: data?.gift_id,
    success: data?.success
  };
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return text("Method Not Allowed", 405);

    const user = await requireAuth(req);
    const body = (await req.json()) as SendGiftPayload;

    const toUserId = String(body?.toUserId || "");
    const amount = Number(body?.amount);
    const itemName = (body?.itemName || "Gift").toString();

    // Validation
    if (!toUserId || toUserId.trim() === "") {
      return json({ error: "invalid_payload", message: "toUserId is required" }, 400);
    }
    
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return json({ error: "invalid_payload", message: "amount must be a positive number" }, 400);
    }

    // Verify recipient exists
    const sb = getSupabase();
    const { data: recipient, error: recipientError } = await sb
      .from("users")
      .select("id")
      .eq("id", toUserId)
      .single();

    if (recipientError || !recipient) {
      return json({ error: "invalid_recipient", message: "Recipient user not found" }, 400);
    }

    console.log("[sendGift] Processing gift transfer", {
      fromUserId: user.id,
      toUserId,
      amount,
      itemName,
    });

    // ✅ Execute atomic dual wallet transaction
    const result = await transferGiftWithDualWallet(user.id, toUserId, amount, itemName);

    console.log("[sendGift] Gift sent successfully via dual wallet", {
      paymentMethod: result.paymentMethod,
      senderBalance: result.senderBalance,
      giftId: result.giftId
    });

    return json({ 
      ok: true, 
      paymentMethod: result.paymentMethod,
      senderBalance: result.senderBalance,
      amount: result.amount,
      giftId: result.giftId,
      message: `Gift sent successfully via ${result.paymentMethod === 'yuyu_coins' ? 'Yuyu Coins' : 'USD Wallet'}`
    }, 200);

  } catch (err: any) {
    console.error("[sendGift] Error", {
      message: err?.message,
      stack: err?.stack,
      code: err?.code,
      details: err?.details
    });

    // Check for specific PostgreSQL error codes
    if (err.message?.includes("insufficient_funds") || err.code === 'P0001') {
      return json({ 
        error: "insufficient_funds",
        message: "You don't have enough balance to send this gift"
      }, 402);
    }

    if (err.message?.includes("user_not_found")) {
      return json({ 
        error: "user_not_found",
        message: "User not found"
      }, 404);
    }

    return json({ 
      error: err.message || "Internal Server Error",
      message: "Failed to send gift. Please try again."
    }, 500);
  }
});
