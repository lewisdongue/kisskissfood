import api from '../lib/api';
import { supabase } from '../config/supabase';
import type { YuyuCoinsPackage, CreateCoinsPurchasePayload, CoinsBalance } from '../types';

export const coinsService = {
  /**
   * Get available coin packages directly from database
   */
  getPackages: async (): Promise<YuyuCoinsPackage[]> => {
    console.log('[coinsService] Fetching packages from database...');
    
    try {
      const { data, error } = await supabase
        .from('yuyu_coins_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('[coinsService] Error fetching packages:', error);
        throw error;
      }

      console.log('[coinsService] Packages fetched:', data);
      // Platform cap: nothing on Caakus may cost more than $300
      return ((data || []) as YuyuCoinsPackage[]).filter(
        (pkg) => Number(pkg.price_usd) <= 300
      );
    } catch (error) {
      console.error('[coinsService] getPackages error:', error);
      return [];
    }
  },

  /**
   * Get user's coin balance (yuyu_score) and USD balance
   */
  getBalance: async (): Promise<CoinsBalance> => {
    console.log('[coinsService] Fetching user balance...');
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      // Signed out: a real zero, not a transient failure
      return { yuyu_score: 0, balance: 0 };
    }

    // Transient failures must THROW so react-query retries and keeps the
    // previously displayed value instead of flashing 0 (Yuyu disappearing bug)
    const { data, error } = await supabase
      .from('users')
      .select('yuyu_score, balance')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[coinsService] Error fetching balance:', error);
      throw error;
    }

    return {
      yuyu_score: Number(data?.yuyu_score ?? 0),
      balance: Number(data?.balance ?? 0),
    };
  },

  /**
   * Create Stripe checkout session for coin purchase
   */
  createCoinsPurchase: async (payload: CreateCoinsPurchasePayload) => {
    console.log('[coinsService] createCoinsPurchase called with:', payload);
    try {
      const data = await api.post('createCoinsPurchase', payload);
      console.log('[coinsService] createCoinsPurchase response:', data);
      return data as { url: string; id: string };
    } catch (error) {
      console.error('[coinsService] createCoinsPurchase error:', error);
      throw error;
    }
  },

  /**
   * Purchase coins using wallet balance (no Stripe)
   */
  purchaseWithWallet: async (packageId: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    coins_added?: number;
    new_coin_balance?: number;
    new_usd_balance?: number;
  }> => {
    console.log('[coinsService] purchaseWithWallet called for package:', packageId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.rpc('purchase_coins_with_wallet', {
        p_user_id: user.id,
        p_package_id: packageId
      });

      if (error) {
        console.error('[coinsService] purchaseWithWallet error:', error);
        throw error;
      }

      console.log('[coinsService] purchaseWithWallet response:', data);
      return data;
    } catch (error: any) {
      console.error('[coinsService] purchaseWithWallet error:', error);
      throw error;
    }
  },

  /**
   * Convert Yuyu to wallet balance (8% fee)
   */
  convertCoinsToWallet: async (yuyuCoins: number): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    coins_converted?: number;
    gross_usd?: number;
    conversion_fee?: number;
    fee_percentage?: number;
    net_usd_received?: number;
    new_coin_balance?: number;
    new_usd_balance?: number;
  }> => {
    console.log('[coinsService] convertCoinsToWallet called for:', yuyuCoins, 'coins');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.rpc('convert_coins_to_wallet', {
        p_user_id: user.id,
        p_yuyu_coins: yuyuCoins
      });

      if (error) {
        console.error('[coinsService] convertCoinsToWallet error:', error);
        throw error;
      }

      console.log('[coinsService] convertCoinsToWallet response:', data);
      return data;
    } catch (error: any) {
      console.error('[coinsService] convertCoinsToWallet error:', error);
      throw error;
    }
  },

  /**
   * Get user's purchase history
   */
  getPurchaseHistory: async (): Promise<any[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('[coinsService] No authenticated user for purchase history');
        return [];
      }

      const { data, error } = await supabase
        .from('yuyu_coin_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[coinsService] Error fetching purchase history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[coinsService] getPurchaseHistory error:', error);
      return [];
    }
  },

  /**
   * Get user's conversion (sell) history – from yuyu_coin_conversions table
   */
  getConversionHistory: async (): Promise<Array<{
    id: string;
    yuyu_coins: number;
    gross_usd: number;
    fee_usd: number;
    net_usd: number;
    created_at: string;
  }>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn('[coinsService] No authenticated user for conversion history');
        return [];
      }

      const { data, error } = await supabase
        .from('yuyu_coin_conversions')
        .select('id, yuyu_coins, gross_usd, fee_usd, net_usd, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[coinsService] Error fetching conversion history:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        yuyu_coins: row.yuyu_coins,
        gross_usd: Number(row.gross_usd),
        fee_usd: Number(row.fee_usd),
        net_usd: Number(row.net_usd),
        created_at: row.created_at,
      }));
    } catch (error) {
      console.error('[coinsService] getConversionHistory error:', error);
      return [];
    }
  },
};
