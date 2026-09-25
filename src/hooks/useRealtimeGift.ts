import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export interface GiftNotification {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  item_name: string;
  status?: string | null;
  message?: string | null;
  created_at: string;
  sender?: {
    username: string;
    full_name: string;
  };
}

interface UseRealtimeGiftOptions {
  enableToast?: boolean;
  enableSound?: boolean;
  channelPrefix?: string;
}

let instanceCounter = 0;

const fetchSenderName = async (
  senderId: string
): Promise<{ username: string; full_name: string } | undefined> => {
  // Try profiles first (might be a view joining auth + users)
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('id', senderId)
    .single();

  if (profile?.full_name || profile?.username) return profile;

  // Fallback to users table
  const { data: user } = await supabase
    .from('users')
    .select('username, full_name, email')
    .eq('id', senderId)
    .single();

  if (user) {
    return {
      username: user.username || user.email?.split('@')[0] || '',
      full_name: user.full_name || user.username || user.email?.split('@')[0] || '',
    };
  }

  return undefined;
};

export const useRealtimeGift = (
  onGiftReceived?: (gift: GiftNotification) => void,
  options?: UseRealtimeGiftOptions
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [latestGift, setLatestGift] = useState<GiftNotification | null>(null);
  const processedGiftIdsRef = useRef<Set<string>>(new Set());
  const enableToast = options?.enableToast ?? true;
  const enableSound = options?.enableSound ?? true;
  const channelPrefix = options?.channelPrefix ?? 'gifts';

  const instanceIdRef = useRef<number | null>(null);
  if (instanceIdRef.current === null) {
    instanceIdRef.current = ++instanceCounter;
  }

  const callbackRef = useRef(onGiftReceived);
  useEffect(() => {
    callbackRef.current = onGiftReceived;
  }, [onGiftReceived]);

  const handleGiftReceived = useCallback(async (gift: GiftNotification) => {
    if (!gift) return;
    if (gift?.id && processedGiftIdsRef.current.has(gift.id)) {
      return;
    }
    if (gift?.status && gift.status !== 'completed') {
      return;
    }
    if (gift?.id) {
      processedGiftIdsRef.current.add(gift.id);
    }

    const tag = `[useRealtimeGift#${instanceIdRef.current}]`;
    console.log(`${tag} Processing gift:`, gift.id, gift.item_name);

    let senderData: { username: string; full_name: string } | undefined;
    if (gift.from_user_id) {
      senderData = await fetchSenderName(gift.from_user_id);
    }

    const giftWithSender: GiftNotification = {
      ...gift,
      sender: senderData,
    };

    setLatestGift(giftWithSender);
    queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });

    if (enableToast) {
      const senderName = senderData?.full_name || senderData?.username || 'Someone';
      const itemName = gift.item_name || 'Gift';
      toast.success(
        `🎁 Gift received from ${senderName}: ${itemName} +$${gift.amount}`,
        {
          duration: 5000,
          icon: '🎉',
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 'bold',
            padding: '16px',
            borderRadius: '12px',
          },
        }
      );
    }

    if (callbackRef.current) {
      callbackRef.current(giftWithSender);
    }

    if (enableSound) {
      try {
        const audio = new Audio('/gift-received.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
    }
  }, [enableToast, enableSound, queryClient]);

  useEffect(() => {
    if (!user?.id) return;

    const uniqueSuffix = instanceIdRef.current;
    const giftChannelName = `${channelPrefix}-${uniqueSuffix}:${user.id}`;

    console.log(`[useRealtimeGift#${uniqueSuffix}] Setting up channel: ${giftChannelName}`);

    const giftChannel = supabase
      .channel(giftChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gifts',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log(`[useRealtimeGift#${uniqueSuffix}] Gift INSERT:`, payload);
          await handleGiftReceived(payload.new as GiftNotification);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gifts',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log(`[useRealtimeGift#${uniqueSuffix}] Gift UPDATE:`, payload);
          await handleGiftReceived(payload.new as GiftNotification);
        }
      )
      .subscribe((status) => {
        console.log(`[useRealtimeGift#${uniqueSuffix}] Sub status: ${status}`);
      });

    return () => {
      supabase.removeChannel(giftChannel);
    };
  }, [user?.id, channelPrefix, handleGiftReceived]);

  return { latestGift };
};
