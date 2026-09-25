import api from '../lib/api';
import type { CreateSubscriptionPayload, Subscription } from '../types';

export const subscriptionService = {
  createSubscription: async (payload: CreateSubscriptionPayload) => {
    console.log('[subscriptionService] Creating subscription with payload:', payload);
    try {
      // api.post already returns the JSON data directly, no need to destructure
      const data = await api.post('createSubscription', payload);
      console.log('[subscriptionService] Subscription created successfully:', data);
      return data;
    } catch (error) {
      console.error('[subscriptionService] Error creating subscription:', error);
      throw error;
    }
  },
  getMySubscriptions: async (): Promise<Subscription[]> => {
    // api.get already returns the JSON data directly, no need to destructure
    const data = await api.get('getMySubscriptions');
    return data;
  },
};
