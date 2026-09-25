import { supabase } from "@/config/supabase";
import { TABLES } from "@/config/supabase";

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  read_at: string | null;
  created_at: string;
}

export async function getDirectMessages(
  userId: string,
  otherUserId: string,
  limit = 50
): Promise<DirectMessage[]> {
  const [res1, res2] = await Promise.all([
    supabase
      .from(TABLES.DIRECT_MESSAGES)
      .select("id, sender_id, receiver_id, text, read_at, created_at")
      .eq("sender_id", userId)
      .eq("receiver_id", otherUserId)
      .order("created_at", { ascending: true }),
    supabase
      .from(TABLES.DIRECT_MESSAGES)
      .select("id, sender_id, receiver_id, text, read_at, created_at")
      .eq("sender_id", otherUserId)
      .eq("receiver_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  if (res1.error || res2.error) {
    console.error("[directMessageService] getDirectMessages", res1.error || res2.error);
    return [];
  }
  const merged: DirectMessage[] = [...(res1.data ?? []), ...(res2.data ?? [])];
  merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return merged.slice(-limit);
}

export async function sendDirectMessage(
  senderId: string,
  receiverId: string,
  text: string
): Promise<DirectMessage | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const { data, error } = await supabase
    .from(TABLES.DIRECT_MESSAGES)
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      text: trimmed,
    })
    .select()
    .single();

  if (error) {
    console.error("[directMessageService] sendDirectMessage", error);
    return null;
  }
  return data as DirectMessage;
}

export async function markMessagesAsRead(
  userId: string,
  senderId: string
): Promise<void> {
  await supabase
    .from(TABLES.DIRECT_MESSAGES)
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", userId)
    .eq("sender_id", senderId)
    .is("read_at", null);
}

export async function getUnreadDMCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from(TABLES.DIRECT_MESSAGES)
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("[directMessageService] getUnreadDMCount", error);
    return 0;
  }
  return count ?? 0;
}

export function subscribeToDirectMessages(
  userId: string,
  otherUserId: string,
  onMessage: (msg: DirectMessage) => void
): () => void {
  const channel = supabase
    .channel(`dm:${userId}:${otherUserId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: TABLES.DIRECT_MESSAGES,
        filter: `sender_id=eq.${otherUserId}`,
      },
      (payload) => {
        const row = (payload.new ?? (payload as { record?: DirectMessage }).record) as DirectMessage;
        if (row?.receiver_id === userId) onMessage(row);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToAnyIncomingDM(
  userId: string,
  onMessage: (msg: DirectMessage) => void
): () => void {
  const channel = supabase
    .channel(`dm:inbox:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: TABLES.DIRECT_MESSAGES,
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        const row = (payload.new ?? (payload as { record?: DirectMessage }).record) as DirectMessage;
        if (row) onMessage(row);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
