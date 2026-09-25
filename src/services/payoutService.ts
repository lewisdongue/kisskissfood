import api from '../lib/api';

export const payoutService = {
  onboard: async () => {
    // Maps to Supabase Edge Function: createConnectAccount
    const data = await api.post('createConnectAccount');
    return data;
  },

  getPayoutAccount: async () => {
    // Maps to Supabase Edge Function: getPayoutAccount
    const data = await api.get('getPayoutAccount');
    return data;
  },

  requestStandardPayout: async (amount: number) => {
    // Maps to Supabase Edge Function: standardPayout
    const data = await api.post('standardPayout', { amount });
    return data;
  },

  requestInstantPayout: async (amount: number) => {
    // Maps to Supabase Edge Function: instantPayout
    const data = await api.post('instantPayout', { amount });
    return data;
  },
};
