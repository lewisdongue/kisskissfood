import { getSupabase } from "./supabaseService.ts";
import { addBalance } from "./walletService.ts";

// ⚠️ SECURITY CRITICAL: DISABLED - FREE USD EXPLOIT
// This function was giving users FREE real USD ($2-5/day) that could be withdrawn to bank accounts
// Date Disabled: 2026-02-02
// Reason: Economic security vulnerability - users could get $60-150/month FREE real money
// ==================================================================================
// DO NOT RE-ENABLE WITHOUT PROPER ECONOMIC MODEL AND SECURITY REVIEW
// ==================================================================================

export const addActivityReward = async (user: any, minutesActive: number) => {
  // ❌ FUNCTION DISABLED FOR SECURITY
  console.warn('[SECURITY] addActivityReward called but is DISABLED for security reasons');
  return 0;
  
  /* ⚠️ ORIGINAL CODE - DISABLED DUE TO FREE USD EXPLOIT
  const rate = 0.005;
  const maxDaily = user.is_premium ? 5 : 2;
  const reward = minutesActive * rate;

  const sb = getSupabase();
  const today = new Date().toISOString().split("T")[0];

  const { data: record } = await sb.from("user_rewards")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  let total = record?.total_earned ?? 0;
  if (total >= maxDaily) return 0;

  const addAmount = Math.min(reward, maxDaily - total);
  await addBalance(user.id, addAmount, "daily_activity");

  if (record) {
    await sb.from("user_rewards")
      .update({ total_earned: total + addAmount })
      .eq("user_id", user.id)
      .eq("date", today);
  } else {
    await sb.from("user_rewards")
      .insert({ user_id: user.id, date: today, total_earned: addAmount });
  }

  return addAmount;
  */
};
