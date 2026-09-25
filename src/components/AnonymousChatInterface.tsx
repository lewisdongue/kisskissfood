import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import {
  fetchMessages,
  getCachedMessages,
  initRealtimeMessages,
  postTextMessage,
  subscribeToMessages,
  joinChatPresence,
  leaveChatPresence,
  subscribeToPresence,
} from "../services/chatService";
import type { Message } from "@/types";
import { useTranslation } from "react-i18next";

interface Props {
  closeFeature: () => void;
}

// Constants
const MESSAGE_BATCH_SIZE = 20;
const SCROLL_THRESHOLD = 200;
const DUPLICATE_PREVENTION_TIMEOUT = 2000;
const OPTIMISTIC_MATCH_TIMEOUT = 10000;
const RECENT_MESSAGE_TIMEOUT = 30000;

export const AnonymousChatInterface: React.FC<Props> = ({ closeFeature }) => {
  const { t } = useTranslation();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState<number>(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const oldestCursorRef = useRef<string | undefined>(undefined);
  const sendingMessageRef = useRef<string | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Memoized scroll function
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  // Memoized error handler
  const handleError = useCallback((err: unknown, context: string) => {
    console.log("Context ", context);

    const message = err instanceof Error ? err.message : String(err);
    setError(message);
  }, []);

  // Memoized message processing
  const processIncomingMessage = useCallback(
    (msg: Message, prevMessages: Message[]) => {
      // Check for duplicates
      if (prevMessages.some((m) => m.id === msg.id)) return prevMessages;

      // Skip if this is the message we just sent (prevent duplicates)
      if (
        sendingMessageRef.current &&
        msg.text &&
        msg.text.trim() === sendingMessageRef.current.trim()
      ) {
        return prevMessages;
      }

      const now = Date.now();
      const msgTime = new Date(msg.created_at).getTime();
      const isRecent = now - msgTime < RECENT_MESSAGE_TIMEOUT;

      if (isRecent) {
        // Find and replace optimistic message
        const optimisticIndex = prevMessages.findIndex((m) => {
          if (!m.id.startsWith("temp-") || !m.text || !msg.text) return false;

          const textMatches = m.text.trim() === msg.text.trim();
          const timeDiff = Math.abs(new Date(m.created_at).getTime() - msgTime);
          const timeMatches = timeDiff < OPTIMISTIC_MATCH_TIMEOUT;

          return textMatches && timeMatches;
        });

        if (optimisticIndex !== -1) {
          const newMessages = [...prevMessages];
          newMessages[optimisticIndex] = msg;
          return newMessages;
        }
      }

      return [msg, ...prevMessages];
    },
    []
  );

  // Memoized scroll handler
  const handleScroll = useCallback(async () => {
    if (!containerRef.current || loading) return;

    const el = containerRef.current;
    const distanceFromBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight);

    if (distanceFromBottom > SCROLL_THRESHOLD) return;

    setLoading(true);
    try {
      const older = await fetchMessages(
        oldestCursorRef.current,
        MESSAGE_BATCH_SIZE
      );
      if (older.length > 0) {
        oldestCursorRef.current = older[older.length - 1].created_at;
        setMessages((prev) => [...prev, ...older.reverse()]);
      }
    } catch (err) {
      handleError(err, t("chat.loadOlderMessages"));
    } finally {
      setLoading(false);
    }
  }, [loading, handleError, t]);

  // Memoized send handler
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const messageText = input.trim();
    setInput("");
    sendingMessageRef.current = messageText;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      type: "TEXT",
      text: messageText,
      created_at: new Date().toISOString(),
      is_published: true,
    };

    setMessages((prev) => [optimisticMessage, ...prev]);
    scrollToTop();

    try {
      await postTextMessage(messageText);
    } catch (err) {
      handleError(err, t("chat.sendMessage"));
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id)
      );
    } finally {
      setTimeout(() => {
        sendingMessageRef.current = null;
      }, DUPLICATE_PREVENTION_TIMEOUT);
    }
  }, [input, scrollToTop, handleError, t]);

  // Memoized input handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSend();
      }
    },
    [handleSend]
  );

  // Memoized message renderer
  const renderMessage = useCallback(
    (msg: Message) => (
      <div key={msg.id} className="my-2 flex justify-start">
        <div className="max-w-[70%] px-4 py-2 rounded-xl break-words bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none">
          <p className="mt-1">{msg.text}</p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {msg.created_at
              ? new Date(msg.created_at).toLocaleString()
              : t("chat.unknownTime")}
          </div>
        </div>
      </div>
    ),
    [t]
  );

  // Memoized empty state
  const emptyState = useMemo(
    () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-lg font-medium mb-2">{t("chat.noMessages")}</p>
          <p className="text-sm">{t("chat.startConversation")}</p>
        </div>
      </div>
    ),
    [t]
  );

  // Initial load effect
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);

      try {
        const cached = getCachedMessages();
        if (cached.length > 0) {
          setMessages(cached);
          oldestCursorRef.current = cached[cached.length - 1]?.created_at;
        } else {
          const initial = await fetchMessages(undefined, MESSAGE_BATCH_SIZE);
          setMessages(initial);
          if (initial.length > 0) {
            oldestCursorRef.current = initial[initial.length - 1].created_at;
          }
        }
        scrollToTop();
      } catch (err) {
        handleError(err, t("chat.loadInitialMessages"));
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [scrollToTop, handleError, t]);

  // Real-time subscription effect
  useEffect(() => {
    initRealtimeMessages();
    joinChatPresence().catch((e) => console.warn("join presence failed", e));

    const unsubscribe = subscribeToMessages((msg) => {
      setMessages((prev) => processIncomingMessage(msg, prev));

      // Debounced scroll to top
      if (containerRef.current && containerRef.current.scrollTop <= 50) {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(scrollToTop, 0);
      }
    });

    return () => {
      unsubscribe();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [processIncomingMessage, scrollToTop]);

  // Presence subscription effect
  useEffect(() => {
    const unsub = subscribeToPresence((count) => setActiveCount(count));
    return () => {
      unsub();
      leaveChatPresence().catch(() => {});
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-4 pt-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("chat.title")}
        </h2>
        <Button variant="ghost" onClick={closeFeature}>
          {t("chat.close")}
        </Button>
      </div>

      {/* Input Area */}
      <div className="flex gap-2 items-center px-4">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("chat.inputPlaceholder")}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={handleSend}
          className="px-4 py-2"
          style={{ cursor: "pointer" }}
        >
          {t("chat.send")}
        </Button>
      </div>

      {/* Status Area */}
      <div className="mt-3 mb-2 text-sm text-gray-600 dark:text-gray-300 flex justify-between items-center px-4">
        <div>
          {t("chat.activeUsers")}: <strong>{activeCount}</strong>
        </div>
        {error && <div className="text-red-500">{error}</div>}
      </div>

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto mb-4 px-4 flex flex-col bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-lg p-2"
        onScroll={handleScroll}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 ? emptyState : messages.map(renderMessage)}
      </div>
    </div>
  );
};
