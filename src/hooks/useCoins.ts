import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { coinsService } from '../services/coinsService';
import toast from 'react-hot-toast';
import type { YuyuCoinsPackage, CreateCoinsPurchasePayload } from '../types';
import { supabase } from '../config/supabase';
import { isMobile, isIOS } from '../utils/deviceDetection';

/**
 * Hook to fetch available coin packages
 */
export const useCoinsPackages = () => {
  return useQuery<YuyuCoinsPackage[]>({
    queryKey: ['coins', 'packages'],
    queryFn: coinsService.getPackages,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Last-known balance mirror. The Yuyu counter must never flash to zero or
 * vanish while a refetch is in flight or a page is remounted.
 */
const BALANCE_CACHE_KEY = 'caakus_last_balance';

let cacheOwnerId: string | null = null;

function readCachedBalance(): { yuyu_score: number; balance: number } | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(BALANCE_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.yuyu_score !== 'number') return undefined;
    // Never show another account's balance after a user switch.
    if (cacheOwnerId && parsed?.uid && parsed.uid !== cacheOwnerId) return undefined;
    return { yuyu_score: parsed.yuyu_score, balance: Number(parsed.balance) || 0 };
  } catch {
    return undefined;
  }
}

function writeCachedBalance(value: { yuyu_score: number; balance: number }): void {
  if (typeof window === 'undefined' || !cacheOwnerId) return;
  try {
    window.localStorage.setItem(BALANCE_CACHE_KEY, JSON.stringify({ ...value, uid: cacheOwnerId }));
  } catch {
    /* storage full or blocked — display still works */
  }
}

function clearCachedBalance(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(BALANCE_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Hook to fetch user's dual balance (coins + USD)
 */
export const useCoinsBalance = () => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    let isActive = true;

    const setupRealtime = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) {
        cacheOwnerId = null;
        clearCachedBalance();
        return;
      }
      if (!isActive) return;
      if (cacheOwnerId && cacheOwnerId !== userId) clearCachedBalance();
      cacheOwnerId = userId;

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Unique suffix: reusing an already-subscribed channel throws
      // "cannot add postgres_changes callbacks after subscribe()"
      const channel = supabase.channel(
        `coins-balance-${userId}-${Math.random().toString(36).slice(2)}`,
        { config: { broadcast: { self: true } } }
      );

      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        (payload: any) => {
          const row = payload?.new;
          if (!row) return;
          queryClient.setQueryData(['coins', 'balance'], {
            yuyu_score: row.yuyu_score || 0,
            balance: row.balance || 0,
          });
        }
      );

      channel.subscribe();
      channelRef.current = channel;
    };

    setupRealtime();

    return () => {
      isActive = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ['coins', 'balance'],
    queryFn: coinsService.getBalance,
    // Realtime (filtered to id=eq.userId) pushes every balance change instantly,
    // so this poll is only a safety net — 30s instead of 10s.
    refetchInterval: 30000,

    refetchOnWindowFocus: true,
    // Never blank out the displayed balance while refetching / on transient errors
    placeholderData: (previousData) => previousData ?? readCachedBalance(),
    // Survive a full remount/navigation: show the last known value instantly
    // instead of flashing an empty/zero balance while the request is in flight.
    initialData: readCachedBalance,
    initialDataUpdatedAt: 0,
    staleTime: 5000,
    gcTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  // Persist every confirmed balance so the next mount never starts from nothing.
  useEffect(() => {
    if (query.data) writeCachedBalance(query.data);
  }, [query.data]);

  return query;
};

/**
 * Hook to create coin purchase checkout
 */
export const useCreateCoinsPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCoinsPurchasePayload) => coinsService.createCoinsPurchase(payload),
    onSuccess: (data) => {
      console.log('[useCreateCoinsPurchase] Checkout session created:', data);
      const checkoutUrl = data?.url ?? (data as { checkout_url?: string })?.checkout_url;
      if (!checkoutUrl) return;

      const mobile = isMobile();
      const ios = isIOS();

      // Save state so we can refetch balance when user returns from Stripe
      sessionStorage.setItem('caakus_coins_checkout_pending', JSON.stringify({
        timestamp: Date.now(),
        returnUrl: window.location.href,
      }));

      let newWindow: Window | null = null;

      if (mobile) {
        // MOBILE: Open in new tab/window so the app stays open (e.g. during a call).
        if (ios) {
          newWindow = window.open(
            checkoutUrl,
            '_blank',
            'location=yes,height=600,width=400,scrollbars=yes,status=yes'
          );
        } else {
          newWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        // WEB (DESKTOP): Open in new tab so the current tab stays on the app.
        newWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      }

      if (!newWindow) {
        // New tab/popup blocked: auto-redirect current tab so user still reaches checkout.
        toast.loading(mobile ? 'Opening checkout…' : 'Redirecting to checkout…', { duration: 1500 });
        window.location.href = checkoutUrl;
      } else {
        toast.success(
          mobile
            ? 'Checkout opened. Complete payment there, then return here.'
            : 'Checkout opened in a new tab. Your call continues here!',
          { duration: 3000 }
        );
      }
    },
    onError: (error: any) => {
      console.error('[useCreateCoinsPurchase] Error:', error);
      toast.error(error?.message || 'Failed to create checkout session');
    },
  });
};

/**
 * Hook to purchase coins with wallet balance
 */
export const usePurchaseWithWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) => coinsService.purchaseWithWallet(packageId),
    onSuccess: (data) => {
      console.log('[usePurchaseWithWallet] Purchase successful:', data);
      
      if (data.success) {
        toast.success(`Successfully purchased ${data.coins_added?.toLocaleString()} Yuyu!`, {
          duration: 4000,
          icon: '🎉',
        });
        
        // Invalidate and refetch balances
        queryClient.invalidateQueries({ queryKey: ['coins', 'balance'] });
        queryClient.invalidateQueries({ queryKey: ['coins', 'history'] });
      } else {
        toast.error(data.message || 'Purchase failed');
      }
    },
    onError: (error: any) => {
      console.error('[usePurchaseWithWallet] Error:', error);
      toast.error(error?.message || 'Failed to purchase coins');
    },
  });
};

/**
 * Hook to convert coins to wallet balance
 */
export const useConvertCoinsToWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (yuyuCoins: number) => coinsService.convertCoinsToWallet(yuyuCoins),
    onSuccess: (data) => {
      console.log('[useConvertCoinsToWallet] Conversion successful:', data);
      
      if (data.success) {
        toast.success(
          `Successfully converted ${data.coins_converted?.toLocaleString()} coins to $${data.net_usd_received?.toFixed(2)}!\n(8% fee: $${data.conversion_fee?.toFixed(2)})`,
          {
            duration: 5000,
            icon: '💰',
          }
        );
        
        // Invalidate and refetch balances
        queryClient.invalidateQueries({ queryKey: ['coins', 'balance'] });
        queryClient.invalidateQueries({ queryKey: ['coins', 'history'] });
      } else {
        toast.error(data.message || 'Conversion failed');
      }
    },
    onError: (error: any) => {
      console.error('[useConvertCoinsToWallet] Error:', error);
      toast.error(error?.message || 'Failed to convert coins');
    },
  });
};

/**
 * Hook to fetch user's purchase history
 */
export const useCoinsPurchaseHistory = () => {
  return useQuery({
    queryKey: ['coins', 'history'],
    queryFn: coinsService.getPurchaseHistory,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
