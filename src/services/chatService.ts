import type { Message } from "@/types";
import { supabase } from "@/config/supabase";

const MESSAGES_TABLE = "messages";

let messagesCache: Message[] = [];
let listeners: ((msg: Message) => void)[] = [];
let messagesChannel: ReturnType<typeof supabase.channel> | null = null;
let presenceChannel: ReturnType<typeof supabase.channel> | null = null;
let presenceListeners: ((count: number, members: Record<string, unknown>) => void)[] = [];
let presenceMembers: Record<string, unknown> = {};
let presenceCount = 0;

export const fetchMessages = async (
  cursor?: string,
  limit = 20
): Promise<Message[]> => {
  // Return newest-first so UI can show newest messages at the top
  let query = supabase
    .from(MESSAGES_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  // When cursor is provided we want older messages than the cursor
  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw error;

  if (!data) throw new Error("No data returned from fetchMessages");

  // defensive: if server returns more than requested, surface as error
  if (Array.isArray(data) && data.length > limit) {
    throw new Error("Unexpected number of messages returned");
  }

  if (data) {
    // Merge into cache while keeping newest-first ordering.
    if (!cursor) {
      // initial load: replace cache with fetched newest-first batch
      messagesCache = data as Message[];
    } else {
      // older messages fetched: append to end (they are also returned newest-first)
      const filtered = (data as Message[]).filter(
        (msg) => !messagesCache.some((m) => m.id === msg.id)
      );
      messagesCache = [...messagesCache, ...filtered];
    }
  }

  return data ?? [];
};

export const postTextMessage = async (text: string) => {
  const { data, error } = await supabase
    .from(MESSAGES_TABLE)
    .insert({ type: "TEXT", text })
    .select()
    .single();
  if (error) throw error;

  if (data) {
    // newest-first cache: add to the front
    messagesCache = [data as Message, ...messagesCache];
    listeners.forEach((cb) => cb(data as Message));
  }

  return data!;
};
 
export const subscribeToMessages = (onNewMessage: (msg: Message) => void) => {
  listeners.push(onNewMessage);

  if (!messagesChannel) {
    // create and subscribe once
    messagesChannel = supabase.channel("messages_channel");
    const channel = messagesChannel;
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: MESSAGES_TABLE },
        (payload: unknown) => {
          // support different payload shapes depending on realtime version
          const p = payload as unknown as Record<string, unknown>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anyP = p as any;
          const raw = (anyP.new ?? anyP.record ?? anyP.record?.new) as unknown;
          if (!raw) return;
          const msg = raw as Message;

          if (!messagesCache.some((m) => m.id === msg.id)) {
            // newest-first ordering: prepend
            messagesCache = [msg, ...messagesCache];
            listeners.forEach((cb) => cb(msg));
          }
        }
      )
      .subscribe();
  }

  return () => {
    listeners = listeners.filter((cb) => cb !== onNewMessage);
    // if no listeners remain, optionally clean up the channel to free resources
    if (listeners.length === 0 && messagesChannel) {
      try {
        const supa = supabase as unknown as { removeChannel?: (c: unknown) => void };
        supa.removeChannel?.(messagesChannel);
      } catch {
        // ignore
      }
      messagesChannel = null;
    }
  };
};

export const initRealtimeMessages = () => {
  if (!messagesChannel) {
    messagesChannel = supabase.channel("messages_channel");
    const channel = messagesChannel;
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: MESSAGES_TABLE },
        (payload: unknown) => {
          const p = payload as unknown as Record<string, unknown>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anyP = p as any;
          const raw = (anyP.new ?? anyP.record ?? anyP.record?.new) as unknown;
          if (!raw) return;
          const msg = raw as Message;
          if (!messagesCache.some((m) => m.id === msg.id)) {
            messagesCache = [msg, ...messagesCache];
            listeners.forEach((cb) => cb(msg));
          }
        }
      )
      .subscribe();
  }
};

// --- Presence (active users) using realtime presence on a dedicated channel ---
const PRESENCE_CHANNEL = "presence:anonymous_chat";

const getOrCreateGuestId = () => {
  try {
    const key = "anon_chat_guest_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `guest_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    // localStorage may be unavailable; fallback to random id
    return `guest_${Math.random().toString(36).slice(2, 10)}`;
  }
};

export const joinChatPresence = async () => {
  const id = getOrCreateGuestId();
  if (!presenceChannel) {
    presenceChannel = supabase.channel(PRESENCE_CHANNEL);

    // presence sync and diffs
    const channel = presenceChannel;
    if (!channel) return;

    channel.on("presence", { event: "sync" }, () => {
      const ps = (channel as unknown as { presenceState?: () => Record<string, unknown> }).presenceState?.();
      if (ps) {
        presenceMembers = ps;
        presenceCount = Object.keys(presenceMembers).length;
        presenceListeners.forEach((cb) => cb(presenceCount, presenceMembers));
      }
    });

    // join/leave events may be emitted too
    channel.on("presence", { event: "join" }, (payload: unknown) => {
      const p = payload as unknown as Record<string, unknown>;
      const key = typeof p?.["key"] === "string" ? (p["key"] as string) : undefined;
      const presence = p["presence"] as unknown;
      if (key) {
        presenceMembers = { ...presenceMembers, [key]: presence };
        presenceCount = Object.keys(presenceMembers).length;
        presenceListeners.forEach((cb) => cb(presenceCount, presenceMembers));
      }
    });

    channel.on("presence", { event: "leave" }, (payload: unknown) => {
      const p = payload as unknown as Record<string, unknown>;
      const key = typeof p?.["key"] === "string" ? (p["key"] as string) : undefined;
      if (key && key in presenceMembers) {
        delete (presenceMembers as Record<string, unknown>)[key];
        presenceCount = Object.keys(presenceMembers).length;
        presenceListeners.forEach((cb) => cb(presenceCount, presenceMembers));
      }
    });

    await channel.subscribe();
  }

  // Track this connection as a presence member if API available
  if (presenceChannel) {
    const maybe = presenceChannel as unknown as { track?: (m: Record<string, unknown>) => Promise<void> | void };
    if (maybe.track) {
      try {
        await maybe.track({ user_id: id, user_info: { guest: true } });
      } catch {
        // ignore
      }
    }
  }
};

export const leaveChatPresence = async () => {
  if (presenceChannel) {
    const maybe = presenceChannel as unknown as { untrack?: () => Promise<void> | void };
    if (maybe.untrack) {
      try {
        await maybe.untrack();
      } catch {
        // ignore
      }
    }
    try {
      const supa = supabase as unknown as { removeChannel?: (c: unknown) => void };
      supa.removeChannel?.(presenceChannel);
    } catch {
      // ignore
    }
    presenceChannel = null;
    presenceMembers = {};
    presenceCount = 0;
    presenceListeners.forEach((cb) => cb(presenceCount, presenceMembers));
  }
};

export const subscribeToPresence = (cb: (count: number, members: Record<string, unknown>) => void) => {
  presenceListeners.push(cb);
  // immediately notify current state
  cb(presenceCount, presenceMembers);

  return () => {
    presenceListeners = presenceListeners.filter((c) => c !== cb);
  };
};

export const getCachedMessages = () => [...messagesCache];
