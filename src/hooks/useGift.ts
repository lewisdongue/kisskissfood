import { useMutation } from '@tanstack/react-query';
import { giftService } from '../services/giftService';
import type { SendGiftPayload } from '../types';
import { isMobile } from '../utils/deviceDetection';

export const useSendGift = () => {
  return useMutation<unknown, Error, SendGiftPayload>({
    mutationFn: giftService.sendGift,
  });
};

export const useCreateGiftCheckout = () => {
  return useMutation<
    { url: string; id: string },
    Error,
    { toUserId: string; marketplaceGiftId?: string; amount?: number; itemName?: string; successUrl?: string; cancelUrl?: string }
  >({
    mutationFn: giftService.createGiftCheckout,
    onSuccess: (data) => {
      if (data?.url) {
        if (!isMobile()) {
          // Desktop: Open in new tab to keep call alive
          window.open(data.url, '_blank', 'noopener,noreferrer');
        }
        // Mobile: MobilePaymentModal will handle it (returns URL without redirect)
      }
    },
  });
};