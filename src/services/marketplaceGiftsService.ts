import { supabase } from "@/config/supabase";

export type MarketplaceGift = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  stripe_price_id: string | null;
  icon_key: string | null;
  image_url: string | null;
};

export const marketplaceGiftsService = {
  listActive: async (): Promise<MarketplaceGift[]> => {
    const { data, error } = await supabase
      .from("marketplace_gifts")
      .select("id,name,amount,currency,stripe_price_id,icon_key,image_url,is_active,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("amount", { ascending: true });

    if (error) throw error;
    return (data || []).filter((row: any) => Number(row.amount) <= 300).map((row: any) => ({
      id: String(row.id),
      name: String(row.name),
      amount: Number(row.amount),
      currency: String(row.currency || "usd"),
      stripe_price_id: row.stripe_price_id ? String(row.stripe_price_id) : null,
      icon_key: row.icon_key ? String(row.icon_key) : null,
      image_url: row.image_url ? String(row.image_url) : null,
    }));
  },
};


