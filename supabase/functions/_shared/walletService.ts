import { getSupabase } from "./supabaseService.ts";

export const getBalance = async (userId: string) => {
  const sb = getSupabase();
  const { data, error } = await sb.from("users").select("balance").eq("id", userId).single();
  if (error) throw error;
  return data?.balance ?? 0;
};

export const addBalance = async (userId: string, amount: number, type?: string) => {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("increment_balance", { user_id: userId, amount });
  if (error) throw error;
  return data;
};

export const subtractBalance = async (userId: string, amount: number, type?: string, note?: string) => {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("decrement_balance", { user_id: userId, amount });
  if (error) throw error;
  return data;
};

export const transferGift = async (fromUser: string, toUser: string, amount: number) => {
  if (amount <= 0) throw new Error("amount must be positive");
  const platformShare = Math.round(amount * 0.5 * 100) / 100;
  const receiverShare = Math.round((amount - platformShare) * 100) / 100;

  await subtractBalance(fromUser, amount);
  await addBalance(toUser, receiverShare);
  // optionally credit platform: await addBalance("platform", platformShare);

  return { platformShare, receiverShare };
};
