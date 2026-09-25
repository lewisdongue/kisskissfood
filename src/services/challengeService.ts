import { supabase } from '../config/supabase';

export type CreateChallengePayload = {
  opponentId: string;
  amount: number;
  challengeText: string;
  presetKey?: string | null;
  isCustom?: boolean;
  roomName?: string | null;
};

const requireUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  console.log('🔐 [ChallengeService] Auth check:', {
    hasUser: !!data?.user,
    userId: data?.user?.id,
    error: error?.message
  });
  
  if (error || !data?.user?.id) {
    console.error('❌ [ChallengeService] User not authenticated:', error);
    throw new Error('User not authenticated');
  }
  
  return data.user.id;
};

export const challengeService = {
  createChallenge: async (payload: CreateChallengePayload) => {
    const userId = await requireUserId();
    const { data, error } = await supabase.rpc('create_challenge', {
      p_proposer_id: userId,
      p_opponent_id: payload.opponentId,
      p_amount: payload.amount,
      p_challenge_text: payload.challengeText,
      p_preset_key: payload.presetKey ?? null,
      p_is_custom: payload.isCustom ?? false,
      p_room_name: payload.roomName ?? null,
    });
    if (error) throw error;
    return data;
  },
  
  acceptChallenge: async (challengeId: string) => {
    console.log('🎯 [ChallengeService] acceptChallenge called:', challengeId);
    const userId = await requireUserId();
    console.log('🔵 [ChallengeService] Calling RPC accept_challenge:', { challengeId, userId });
    
    const { data, error } = await supabase.rpc('accept_challenge', {
      p_challenge_id: challengeId,
      p_opponent_id: userId,
    });
    
    if (error) {
      console.error('❌ [ChallengeService] RPC error:', error);
      throw error;
    }
    
    console.log('✅ [ChallengeService] RPC success:', data);
    return data;
  },
  
  // NEW: Opponent marks challenge as complete
  markChallengeComplete: async (challengeId: string) => {
    console.log('✅ [ChallengeService] markChallengeComplete called:', challengeId);
    const userId = await requireUserId();
    
    const { data, error } = await supabase.rpc('mark_challenge_complete', {
      p_challenge_id: challengeId,
      p_opponent_id: userId,
    });
    
    if (error) {
      console.error('❌ [ChallengeService] Mark complete error:', error);
      throw error;
    }
    
    console.log('✅ [ChallengeService] Marked as complete, awaiting confirmation:', data);
    return data;
  },
  
  // NEW: Proposer confirms or rejects completion
  confirmChallenge: async (challengeId: string, outcome: 'confirmed' | 'rejected') => {
    console.log('🎯 [ChallengeService] confirmChallenge called:', { challengeId, outcome });
    const userId = await requireUserId();
    
    const { data, error } = await supabase.rpc('resolve_challenge', {
      p_challenge_id: challengeId,
      p_actor_id: userId,
      p_outcome: outcome,
    });
    
    if (error) {
      console.error('❌ [ChallengeService] Confirm error:', error);
      throw error;
    }
    
    console.log('✅ [ChallengeService] Challenge confirmed:', data);
    return data;
  },
  
  // DEPRECATED - kept for backwards compatibility
  completeChallenge: async (challengeId: string, outcome: 'completed' | 'failed') => {
    const userId = await requireUserId();
    const mappedOutcome = outcome === 'completed' ? 'confirmed' : 'rejected';
    const { data, error } = await supabase.rpc('resolve_challenge', {
      p_challenge_id: challengeId,
      p_actor_id: userId,
      p_outcome: mappedOutcome,
    });
    if (error) throw error;
    return data;
  },
  
  cancelChallenge: async (challengeId: string) => {
    const userId = await requireUserId();
    const { data, error } = await supabase.rpc('cancel_challenge', {
      p_challenge_id: challengeId,
      p_actor_id: userId,
    });
    if (error) throw error;
    return data;
  },
  
  disputeChallenge: async (challengeId: string) => {
    const userId = await requireUserId();
    const { data, error } = await supabase.rpc('dispute_challenge', {
      p_challenge_id: challengeId,
      p_actor_id: userId,
    });
    if (error) throw error;
    return data;
  },
  
  handleDisconnect: async (challengeId: string, disconnectedUserId: string) => {
    console.log('🔌 [ChallengeService] handleDisconnect called:', { challengeId, disconnectedUserId });
    
    const { data, error } = await supabase.rpc('handle_challenge_disconnect', {
      p_challenge_id: challengeId,
      p_disconnected_user_id: disconnectedUserId,
    });
    
    if (error) {
      console.error('❌ [ChallengeService] Disconnect handling error:', error);
      throw error;
    }
    
    console.log('✅ [ChallengeService] Disconnect handled:', data);
    return data;
  },
  
  canAffordChallenge: async (userId: string, amount: number) => {
    console.log('💰 [ChallengeService] canAffordChallenge called:', { userId, amount });
    
    const { data, error } = await supabase.rpc('can_afford_challenge', {
      p_user_id: userId,
      p_amount: amount,
    });
    
    if (error) {
      console.error('❌ [ChallengeService] Can afford check error:', error);
      throw error;
    }
    
    console.log('✅ [ChallengeService] Can afford result:', data);
    return data;
  },
};
