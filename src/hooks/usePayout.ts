import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payoutService } from '../services/payoutService';

export const useOnboardPayout = () => {
  return useMutation({
    mutationFn: payoutService.onboard,
  });
};

export const usePayoutAccount = () => {
  return useQuery({ 
    queryKey: ['payoutAccount'], 
    queryFn: payoutService.getPayoutAccount 
  });
};

export const useRequestStandardPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payoutService.requestStandardPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
  });
};

export const useRequestInstantPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payoutService.requestInstantPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
  });
};
