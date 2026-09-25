import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletService } from '../services/walletService';

export const useWalletBalance = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletService.getBalance,
    // Auto-refetch on window focus (when user returns to tab)
    refetchOnWindowFocus: true,
    // Refetch every 30 seconds (backup mechanism)
    refetchInterval: 30000,
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
  });
};

export const useTopUpWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: walletService.topUp,
    onSuccess: () => {
      // Invalidate balance query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
  });
};

export const useConfirmTopUp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: walletService.confirmTopUp,
    onSuccess: () => {
      // Invalidate balance query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
  });
};

export const useWithdrawFromWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: walletService.withdraw,
    onSuccess: () => {
      // Invalidate balance query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
  });
};
