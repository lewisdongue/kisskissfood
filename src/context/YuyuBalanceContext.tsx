import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCoinsBalance } from '@/hooks/useCoins';

type BalanceSnapshot = { yuyu_score: number; balance: number };

type YuyuBalanceContextValue = {
  /** Yuyu points, never undefined — falls back to the last known value. */
  yuyu: number;
  /** USD wallet balance. */
  usd: number;
  isLoading: boolean;
  refresh: () => void;
  /**
   * Optimistic transaction helper: mutate the globally shared balance instantly
   * and get a rollback function to call if the backend rejects the operation.
   */
  applyOptimisticDelta: (delta: number) => () => void;
};

const BALANCE_KEY = ['coins', 'balance'] as const;

const YuyuBalanceContext = createContext<YuyuBalanceContextValue | null>(null);

export const YuyuBalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useCoinsBalance();

  const applyOptimisticDelta = useCallback(
    (delta: number) => {
      const previous = queryClient.getQueryData<BalanceSnapshot>(BALANCE_KEY);
      if (previous) {
        queryClient.setQueryData<BalanceSnapshot>(BALANCE_KEY, {
          ...previous,
          yuyu_score: Math.max(0, previous.yuyu_score + delta),
        });
      }
      return () => {
        if (previous) queryClient.setQueryData(BALANCE_KEY, previous);
        else queryClient.invalidateQueries({ queryKey: BALANCE_KEY });
      };
    },
    [queryClient],
  );

  const value = useMemo<YuyuBalanceContextValue>(
    () => ({
      yuyu: data?.yuyu_score ?? 0,
      usd: data?.balance ?? 0,
      isLoading,
      refresh: () => queryClient.invalidateQueries({ queryKey: BALANCE_KEY }),
      applyOptimisticDelta,
    }),
    [data, isLoading, queryClient, applyOptimisticDelta],
  );

  return <YuyuBalanceContext.Provider value={value}>{children}</YuyuBalanceContext.Provider>;
};

/**
 * Global Yuyu balance. Safe to call outside the provider (returns a no-op
 * snapshot) so isolated components and tests never crash.
 */
export function useYuyuBalance(): YuyuBalanceContextValue {
  return (
    useContext(YuyuBalanceContext) ?? {
      yuyu: 0,
      usd: 0,
      isLoading: false,
      refresh: () => {},
      applyOptimisticDelta: () => () => {},
    }
  );
}
