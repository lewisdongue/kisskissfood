import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './useAuth';
import type { Challenge, ChallengeEvent } from '../types';
import { challengeService } from '../services/challengeService';
import toast from 'react-hot-toast';

const MAX_HISTORY = 12;

const isPairMatch = (row: Challenge, userId: string, peerId: string, roomName?: string | null) => {
  const matchPair =
    (row.proposer_id === userId && row.opponent_id === peerId) ||
    (row.proposer_id === peerId && row.opponent_id === userId);
  if (!matchPair) return false;
  if (!roomName) return true;
  return String(row.room_name || "") === String(roomName || "");
};

export const useCallChallenges = (peerId?: string | null, roomName?: string | null) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [events, setEvents] = useState<ChallengeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<any>(null);
  const challengeIdsRef = useRef<Set<string>>(new Set());

  const activeChallenge = useMemo(() => {
    if (!challenges.length) return null;
    const priority: Record<string, number> = {
      pending_confirmation: 4,
      accepted: 3,
      pending: 2,
      disputed: 1,
    };
    const candidates = challenges.filter((c) =>
      c.status === 'pending_confirmation' ||
      c.status === 'accepted' ||
      c.status === 'pending' ||
      c.status === 'disputed'
    );
    if (!candidates.length) return null;
    return candidates
      .sort((a, b) => {
        const pa = priority[a.status] || 0;
        const pb = priority[b.status] || 0;
        if (pa !== pb) return pb - pa;
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      })[0];
  }, [challenges]);

  const incomingPending = useMemo(() => {
    if (!userId || !peerId) return null;
    const pending = challenges
      .filter((c) => c.status === 'pending' && c.opponent_id === userId)
      .sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      });
    return pending[0] || null;
  }, [challenges, userId, peerId]);

  const allPendingChallenges = useMemo(() => {
    if (!userId) return [];
    return challenges.filter((c) => c.status === 'pending' && c.opponent_id === userId);
  }, [challenges, userId]);

  const fetchInitial = useCallback(async () => {
    if (!userId || !peerId) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('challenges')
        .select('*')
        .or(`and(proposer_id.eq.${userId},opponent_id.eq.${peerId}),and(proposer_id.eq.${peerId},opponent_id.eq.${userId})`);

      if (roomName) {
        query = query.eq('room_name', roomName);
      }

      const { data: challengeRows } = await query
        .order('created_at', { ascending: false })
        .limit(25);

      const resolvedChallenges = (challengeRows || []) as Challenge[];
      setChallenges(resolvedChallenges);
      challengeIdsRef.current = new Set(resolvedChallenges.map((row) => row.id));

      const activeIds = resolvedChallenges.map((row) => row.id);
      if (activeIds.length > 0) {
        const { data: eventRows } = await supabase
          .from('challenge_events')
          .select('*')
          .in('challenge_id', activeIds)
          .order('created_at', { ascending: false })
          .limit(MAX_HISTORY);
        setEvents((eventRows || []) as ChallengeEvent[]);
      } else {
        setEvents([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, peerId, roomName]);

  useEffect(() => {
    if (!userId || !peerId) {
      setChallenges([]);
      setEvents([]);
      return;
    }

    fetchInitial();

    const channelName = `challenges-${userId}-${peerId}`;

    const existingChannel = supabase.getChannels().find((ch) => ch.topic === `realtime:${channelName}`);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: userId },
        },
      })
      .on(
        'postgres_changes',
        roomName
          ? { event: '*' as const, schema: 'public', table: 'challenges', filter: `room_name=eq.${roomName}` }
          : { event: '*' as const, schema: 'public', table: 'challenges' },
        (payload: any) => {
          const row = payload?.new as Challenge | undefined;
          if (!row || !isPairMatch(row, userId, peerId, roomName)) return;
          
          setChallenges((prev) => {
            const existing = prev.find((c) => c.id === row.id);
            if (!existing) {
              if (row.status === 'pending' && row.opponent_id === userId) {
                toast.success(
                  `⚡ New ${row.stake_yuyu} coin fun challenge!`,
                  { duration: 4000, icon: '🎯' }
                );
              }
              return [row, ...prev].slice(0, 5);
            }
            return prev.map((c) => (c.id === row.id ? row : c));
          });
          challengeIdsRef.current.add(row.id);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'challenge_events' },
        (payload: any) => {
          const row = payload?.new as ChallengeEvent | undefined;
          if (!row) return;
          if (!challengeIdsRef.current.has(row.challenge_id)) return;
          setEvents((prev) => [row, ...prev].slice(0, MAX_HISTORY));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, peerId, roomName, fetchInitial]);

  const createChallenge = async (payload: { amount: number; challengeText: string; presetKey?: string | null; isCustom?: boolean }) => {
    if (!peerId) throw new Error('peer_missing');
    return challengeService.createChallenge({
      opponentId: peerId,
      amount: payload.amount,
      challengeText: payload.challengeText,
      presetKey: payload.presetKey ?? null,
      isCustom: payload.isCustom ?? false,
      roomName: roomName ?? null,
    });
  };

  const acceptChallenge = async (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: 'accepted', accepted_at: new Date().toISOString() } : c))
    );
    try {
      return await challengeService.acceptChallenge(challengeId);
    } catch (error) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, status: 'pending', accepted_at: null } : c))
      );
      throw error;
    }
  };

  const markChallengeComplete = async (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: 'pending_confirmation' } : c))
    );
    try {
      return await challengeService.markChallengeComplete(challengeId);
    } catch (error) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, status: 'accepted' } : c))
      );
      throw error;
    }
  };

  const confirmChallenge = async (challengeId: string, outcome: 'confirmed' | 'rejected') => {
    const newStatus = outcome === 'confirmed' ? 'completed' : 'rejected';
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: newStatus } : c))
    );
    try {
      return await challengeService.confirmChallenge(challengeId, outcome);
    } catch (error) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, status: 'pending_confirmation' } : c))
      );
      throw error;
    }
  };

  const completeChallenge = async (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: 'completed' } : c))
    );
    try {
      return await challengeService.completeChallenge(challengeId, 'completed');
    } catch (error) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, status: 'accepted' } : c))
      );
      throw error;
    }
  };

  const failChallenge = async (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: 'failed' } : c))
    );
    try {
      return await challengeService.completeChallenge(challengeId, 'failed');
    } catch (error) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, status: 'accepted' } : c))
      );
      throw error;
    }
  };

  const cancelChallenge = async (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: 'cancelled' } : c))
    );
    try {
      return await challengeService.cancelChallenge(challengeId);
    } catch (error) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, status: 'pending' } : c))
      );
      throw error;
    }
  };

  const disputeChallenge = async (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: 'disputed' } : c))
    );
    try {
      return await challengeService.disputeChallenge(challengeId);
    } catch (error) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, status: 'accepted' } : c))
      );
      throw error;
    }
  };

  return {
    challenges,
    activeChallenge,
    incomingPending,
    allPendingChallenges,
    events,
    isLoading,
    createChallenge,
    acceptChallenge,
    markChallengeComplete,
    confirmChallenge,
    completeChallenge,
    failChallenge,
    cancelChallenge,
    disputeChallenge,
    handleDisconnect: (challengeId: string, disconnectedUserId: string) =>
      challengeService.handleDisconnect(challengeId, disconnectedUserId),
    canAffordChallenge: (userId: string, amount: number) =>
      challengeService.canAffordChallenge(userId, amount),
    refetch: fetchInitial,
  };
};
