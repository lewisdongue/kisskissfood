import api from '../lib/api';
import type { SendGiftPayload } from '../types';

export const giftService = {
  sendGift: async ({ toUserId, amount, itemName }: SendGiftPayload) => {
    console.log('[giftService] sendGift called with:', { toUserId, amount, itemName });
    try {
      const data = await api.post('sendGift', { toUserId, amount, itemName });
      console.log('[giftService] sendGift response:', data);
      return data;
    } catch (error) {
      console.error('[giftService] sendGift error:', error);
      throw error;
    }
  },
  createGiftCheckout: async (payload: { toUserId: string; marketplaceGiftId?: string; amount?: number; itemName?: string; successUrl?: string; cancelUrl?: string }) => {
    console.log('[giftService] createGiftCheckout called with:', payload);
    try {
      const data = await api.post('createGiftCheckout', payload);
      console.log('[giftService] createGiftCheckout response:', data);
      return data as { url: string; id: string };
    } catch (error) {
      console.error('[giftService] createGiftCheckout error:', error);
      throw error;
    }
  },
};
