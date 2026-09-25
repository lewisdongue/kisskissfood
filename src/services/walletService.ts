import api from '../lib/api';
import type { WalletBalance, TopUpPayload, ConfirmTopUpPayload, WithdrawPayload } from '../types';

export const walletService = {
  getBalance: async (): Promise<WalletBalance> => {
    const data = await api.get('getMyBalance');
    return data;
  },
  topUp: async (payload: TopUpPayload) => {
    // Use hosted checkout creation; balance is credited by webhook only.
    const data = await api.post('createTopupIntent', payload);
    return data;
  },
  confirmTopUp: async (_payload: ConfirmTopUpPayload) => {
    throw new Error('confirm_topup_disabled_use_payment_webhook');
  },
  withdraw: async (payload: WithdrawPayload) => {
    const data = await api.post('withdraw', payload);
    return data;
  },
};
