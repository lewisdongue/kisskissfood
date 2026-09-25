import { useMutation, useQuery } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscriptionService';

export const useCreateSubscription = (options?: { skipAutoRedirect?: boolean }) => {
  return useMutation({
    mutationFn: subscriptionService.createSubscription,
    onSuccess: (data: { url: string; id: string }) => {
      console.log('[useCreateSubscription] Success:', data);
      // Callers can provide their own onSuccess to handle redirects
      // This provides flexibility for both mobile and desktop flows
      //add this for commit
    },
    onError: (error) => {
      console.error('[useCreateSubscription] Error:', error);
    },
  });
};

export const useMySubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: subscriptionService.getMySubscriptions,
  });
};
