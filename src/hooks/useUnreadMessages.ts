import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase, TABLES } from "@/config/supabase";
import {
  getUnreadDMCount,
  subscribeToAnyIncomingDM,
} from "@/services/directMessageService";

interface UnreadState {
  unreadDMs: number;
  pendingFriendRequests: number;
  total: number;
}

export function useUnreadMessages(): UnreadState & { refresh: () => void } {
  const { user } = useAuth();
  const authedUser = user && !("isGuest" in user) ? user : null;

  const [unreadDMs, setUnreadDMs] = useState(0);
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);

  const fetchCounts = useCallback(async () => {
    if (!authedUser) {
      setUnreadDMs(0);
      setPendingFriendRequests(0);
      return;
    }

    const [dmCount, friendRes] = await Promise.all([
      getUnreadDMCount(authedUser.id),
      supabase
        .from(TABLES.FRIEND_REQUESTS)
        .select("id", { count: "exact", head: true })
        .eq("to_user_id", authedUser.id)
        .eq("status", "pending"),
    ]);

    setUnreadDMs(dmCount);
    setPendingFriendRequests(friendRes.count ?? 0);
  }, [authedUser?.id]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Real-time: listen for new incoming DMs
  useEffect(() => {
    if (!authedUser) return;
    const unsub = subscribeToAnyIncomingDM(authedUser.id, () => {
      setUnreadDMs((prev) => prev + 1);
    });
    return unsub;
  }, [authedUser?.id]);

  // Real-time: listen for new friend requests
  useEffect(() => {
    if (!authedUser) return;
    const channel = supabase
      .channel(`friend_requests:inbox:${authedUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: TABLES.FRIEND_REQUESTS,
          filter: `to_user_id=eq.${authedUser.id}`,
        },
        () => {
          setPendingFriendRequests((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: TABLES.FRIEND_REQUESTS,
          filter: `to_user_id=eq.${authedUser.id}`,
        },
        () => {
          // Refetch when a request status changes (e.g. accepted/declined elsewhere)
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authedUser?.id, fetchCounts]);

  return {
    unreadDMs,
    pendingFriendRequests,
    total: unreadDMs + pendingFriendRequests,
    refresh: fetchCounts,
  };
}
