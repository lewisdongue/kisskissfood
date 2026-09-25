import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { LeaderboardEntry } from '../types';
import { getYUYULeaderboard } from '../services/communityService';

interface LeaderboardCache {
  data: LeaderboardEntry[];
  lastFetched: number;
  loading: boolean;
  error: string | null;
}

const CACHE_TTL_MS = 30000; // 30 seconds

let cache: LeaderboardCache = {
  data: [],
  lastFetched: 0,
  loading: false,
  error: null,
};

let listeners: Set<() => void> = new Set();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => cache;

const fetchLeaderboard = async (force = false): Promise<LeaderboardEntry[]> => {
  const now = Date.now();
  
  // Return cached data if still fresh and not forcing
  if (!force && cache.data.length > 0 && now - cache.lastFetched < CACHE_TTL_MS) {
    return cache.data;
  }

  // Prevent concurrent fetches
  if (cache.loading) {
    return cache.data;
  }

  cache = { ...cache, loading: true };
  emitChange();

  try {
    const data = await Promise.race([
      getYUYULeaderboard(),
      new Promise<LeaderboardEntry[]>((_, reject) =>
        window.setTimeout(() => reject(new Error('Leaderboard request timed out')), 8000),
      ),
    ]);
    cache = {
      data,
      lastFetched: Date.now(),
      loading: false,
      error: null,
    };
    emitChange();
    return data;
  } catch (err) {
    cache = {
      ...cache,
      loading: false,
      error: err instanceof Error ? err.message : 'Failed to fetch leaderboard',
    };
    emitChange();
    return cache.data;
  }
};

/**
 * Prefetch leaderboard data in background (call from Home page)
 * Returns immediately, doesn't block rendering
 */
export const prefetchLeaderboard = (): void => {
  // Fire and forget - don't await
  fetchLeaderboard(false);
};

/**
 * Hook to use cached leaderboard data with automatic refresh
 */
export const useLeaderboardCache = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const [refreshKey, setRefreshKey] = useState(0);

  // Initial fetch if cache is empty
  useEffect(() => {
    if (state.data.length === 0 && !state.loading) {
      fetchLeaderboard(false);
    }
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard(true);
    }, CACHE_TTL_MS);
    return () => clearInterval(interval);
  }, []);

  const refresh = useCallback(() => {
    fetchLeaderboard(true);
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    leaderboard: state.data,
    loading: state.loading && state.data.length === 0, // Only show loading if no data yet
    isRefreshing: state.loading && state.data.length > 0, // Background refresh indicator
    error: state.error,
    lastUpdated: state.lastFetched ? new Date(state.lastFetched) : null,
    refresh,
    hasCachedData: state.data.length > 0,
  };
};

/**
 * Check if cache has fresh data
 */
export const hasFreshCache = (): boolean => {
  return cache.data.length > 0 && Date.now() - cache.lastFetched < CACHE_TTL_MS;
};
