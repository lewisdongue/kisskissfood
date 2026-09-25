import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { supabase, TABLES } from "@/config/supabase";
import {
  getDirectMessages,
  sendDirectMessage,
  subscribeToDirectMessages,
  markMessagesAsRead,
  type DirectMessage,
} from "@/services/directMessageService";
import { confirmFriendRequest, declineFriendRequest } from "@/services/supabaseService";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  User,
  X,
  Check,
  Users,
  Bell,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FriendEntry {
  requestId: string;
  userId: string;
  name: string;
  status: "pending" | "accepted";
  isIncoming: boolean;
  fromUserId: string;
  toUserId: string;
}

interface MessengerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
  initialFriendId?: string | null;
  anchor?: "bottom-right" | "bottom-left";
}

// ─── Component ───────────────────────────────────────────────────────────────

type PanelView = "list" | "chat";

export const MessengerPanel: React.FC<MessengerPanelProps> = ({
  isOpen,
  onClose,
  onUnreadChange,
  initialFriendId,
  anchor = "bottom-right",
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authedUser = user && !("isGuest" in user) ? user : null;

  const [view, setView] = useState<PanelView>("list");
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [chatWith, setChatWith] = useState<FriendEntry | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadPerFriend, setUnreadPerFriend] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Fetch friends ──────────────────────────────────────────────────────────

  const fetchFriends = useCallback(async () => {
    if (!authedUser) return;
    setLoadingFriends(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.FRIEND_REQUESTS)
        .select(
          "id, from_user_id, to_user_id, status, created_at"
        )
        .or(`from_user_id.eq.${authedUser.id},to_user_id.eq.${authedUser.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const requests = data || [];
      const otherIds = Array.from(
        new Set(
          requests.map((r) =>
            r.from_user_id === authedUser.id ? r.to_user_id : r.from_user_id
          )
        )
      );

      let usersById = new Map<string, { id: string; name: string | null }>();
      if (otherIds.length > 0) {
        const { data: usersData } = await supabase
          .from(TABLES.USERS)
          .select("id, name")
          .in("id", otherIds);
        usersById = new Map(usersData?.map((u) => [u.id, u]) || []);
      }

      const mapped: FriendEntry[] = requests.map((req) => {
        const otherId =
          req.from_user_id === authedUser.id
            ? req.to_user_id
            : req.from_user_id;
        return {
          requestId: req.id,
          userId: otherId,
          name:
            usersById.get(otherId)?.name ||
            t("globalConnection.unknownUser"),
          status: req.status,
          isIncoming: req.to_user_id === authedUser.id,
          fromUserId: req.from_user_id,
          toUserId: req.to_user_id,
        };
      });

      setFriends(mapped);

      // Fetch unread counts per friend (accepted only)
      const acceptedFriendIds = mapped
        .filter((f) => f.status === "accepted")
        .map((f) => f.userId);

      if (acceptedFriendIds.length > 0) {
        const { data: unreadRows } = await supabase
          .from(TABLES.DIRECT_MESSAGES)
          .select("sender_id")
          .eq("receiver_id", authedUser.id)
          .is("read_at", null)
          .in("sender_id", acceptedFriendIds);

        if (unreadRows) {
          const counts: Record<string, number> = {};
          unreadRows.forEach((r) => {
            counts[r.sender_id] = (counts[r.sender_id] ?? 0) + 1;
          });
          setUnreadPerFriend(counts);
          const total = Object.values(counts).reduce((s, c) => s + c, 0);
          onUnreadChange?.(total);
        }
      }
    } catch (err) {
      console.error("[MessengerPanel] fetchFriends", err);
    } finally {
      setLoadingFriends(false);
    }
  }, [authedUser?.id, t, onUnreadChange]);

  useEffect(() => {
    if (isOpen && authedUser) fetchFriends();
  }, [isOpen, fetchFriends]);

  // ── Open chat for a friend ─────────────────────────────────────────────────

  const openChat = useCallback(
    async (friend: FriendEntry) => {
      setChatWith(friend);
      setView("chat");
      setMessages([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    []
  );

  // Handle initialFriendId prop
  useEffect(() => {
    if (initialFriendId && friends.length > 0) {
      const friend = friends.find(
        (f) => f.userId === initialFriendId && f.status === "accepted"
      );
      if (friend) openChat(friend);
    }
  }, [initialFriendId, friends, openChat]);

  // ── Load messages for chat ─────────────────────────────────────────────────

  useEffect(() => {
    if (!chatWith || !authedUser) return;

    getDirectMessages(authedUser.id, chatWith.userId).then((msgs) => {
      setMessages(msgs);
      // Mark as read
      markMessagesAsRead(authedUser.id, chatWith.userId).then(() => {
        setUnreadPerFriend((prev) => {
          const updated = { ...prev };
          delete updated[chatWith.userId];
          const total = Object.values(updated).reduce((s, c) => s + c, 0);
          onUnreadChange?.(total);
          return updated;
        });
      });
    });

    const unsub = subscribeToDirectMessages(
      authedUser.id,
      chatWith.userId,
      (msg) => {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
        // Auto-mark read since panel is open
        markMessagesAsRead(authedUser.id, chatWith.userId);
      }
    );

    return unsub;
  }, [chatWith?.userId, authedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if (!chatWith || !authedUser || !messageInput.trim()) return;
    setSending(true);
    const text = messageInput.trim();
    setMessageInput("");
    const sent = await sendDirectMessage(authedUser.id, chatWith.userId, text);
    if (sent) {
      setMessages((prev) => [...prev, sent]);
    } else {
      toast.error("Failed to send message");
      setMessageInput(text);
    }
    setSending(false);
  }, [chatWith, authedUser, messageInput]);

  // ── Close panel on outside click ───────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // ── Back to list ───────────────────────────────────────────────────────────

  const goBack = () => {
    setView("list");
    setChatWith(null);
    setMessages([]);
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const pendingRequests = useMemo(
    () => friends.filter((f) => f.status === "pending"),
    [friends]
  );
  const currentFriends = useMemo(
    () => friends.filter((f) => f.status === "accepted"),
    [friends]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={`fixed z-[9999] flex flex-col overflow-hidden shadow-2xl border border-white/10 rounded-2xl
        bottom-[4.5rem] sm:bottom-20
        w-[min(320px,calc(100vw-1.5rem))] sm:w-[370px]
        max-h-[min(460px,calc(100dvh-6rem))] sm:max-h-[560px]
        ${anchor === "bottom-right" ? "right-3 sm:right-4" : "left-3 sm:left-4"}`}
      style={{
        background:
          "linear-gradient(145deg, rgba(15,15,35,0.98) 0%, rgba(30,20,60,0.98) 100%)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 flex-shrink-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)",
        }}
      >
        {view === "chat" && chatWith ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={goBack}
              className="text-slate-400 hover:text-white transition-colors shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm truncate">
                {chatWith.name}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium">{t("globalConnection.online")}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                {t("globalConnection.title")}
              </p>
              <p className="text-[10px] text-slate-400">
                {currentFriends.length} {currentFriends.length === 1 ? "friend" : "friends"}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {view === "list" && (
              <button
              onClick={() => navigate("/connections")}
              className="text-slate-400 hover:text-indigo-400 transition-colors"
              title={t("globalConnection.openConnections")}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Chat View ── */}
      {view === "chat" && chatWith ? (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-10 gap-3">
                <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-slate-500 text-sm text-center">
                  {t("globalConnection.typeMessage")}
                </p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender_id === authedUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0 mb-0.5">
                      <User className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 shadow-md ${
                      isMe
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm"
                        : "bg-white/10 text-slate-100 rounded-bl-sm border border-white/10"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isMe ? "text-indigo-200/70 text-right" : "text-slate-500"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message section container — same layout as CaakusChatWidget so send button is not overwritten on mobile */}
          <div className="flex flex-shrink-0 items-center gap-1.5 border-t border-white/10 bg-white/5 px-2.5 py-2 sm:px-3 sm:py-3">
            <input
              ref={inputRef}
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder={t("globalConnection.typeMessage")}
              className="min-w-0 flex-1 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all sm:px-3.5 sm:py-2.5"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !messageInput.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg transition-all active:scale-95 sm:h-10 sm:w-10"
              aria-label={t("globalConnection.typeMessage")}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        /* ── List View ── */
        <div className="flex-1 overflow-y-auto min-h-0">
          {loadingFriends ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !authedUser ? (
            <div className="p-6 text-center">
              <p className="text-slate-400 text-sm">
                {t("globalConnection.signInRequired")}
              </p>
            </div>
          ) : (
            <>
              {/* Pending friend requests section */}
              {pendingRequests.length > 0 && (
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                      {t("globalConnection.pendingRequests")}
                    </p>
                    <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5 font-semibold">
                      {pendingRequests.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {pendingRequests.map((friend) => (
                      <div
                        key={friend.requestId}
                        className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2.5"
                      >
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">
                            {friend.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {friend.isIncoming
                              ? t("globalConnection.wantsToConnect")
                              : t("globalConnection.pending")}
                          </p>
                        </div>
                        {friend.isIncoming && (
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={async () => {
                                const ok = await confirmFriendRequest(
                                  friend.requestId,
                                  authedUser.id,
                                  false
                                );
                                if (ok) {
                                  toast.success(
                                    t("globalConnection.acceptSuccess")
                                  );
                                  fetchFriends();
                                } else {
                                  toast.error(
                                    t("globalConnection.failedAccept")
                                  );
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                const ok = await declineFriendRequest(
                                  friend.requestId
                                );
                                if (ok) {
                                  toast.success(
                                    t("globalConnection.declineSuccess")
                                  );
                                  fetchFriends();
                                } else {
                                  toast.error(
                                    t("globalConnection.failedDecline")
                                  );
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors border border-white/10"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends / conversations */}
              <div className="px-4 pt-3 pb-4">
                {currentFriends.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                        {t("globalConnection.currentFriends")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {currentFriends.map((friend) => {
                        const unread = unreadPerFriend[friend.userId] ?? 0;
                        return (
                          <button
                            key={friend.requestId}
                            onClick={() => openChat(friend)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 active:bg-white/12 transition-colors group text-left"
                          >
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center border border-white/10">
                                <User className="w-4.5 h-4.5 text-indigo-300" />
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm truncate group-hover:text-indigo-200 transition-colors">
                                {friend.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {unread > 0
                                  ? t(
                                      unread === 1
                                        ? "globalConnection.newMessage"
                                        : "globalConnection.newMessages",
                                      { count: unread }
                                    )
                                  : t("globalConnection.sendMessage")}
                              </p>
                            </div>
                            {unread > 0 && (
                              <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-lg">
                                {unread > 9 ? "9+" : unread}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {currentFriends.length === 0 && pendingRequests.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <Users className="w-7 h-7 text-indigo-400/60" />
                    </div>
                    <p className="text-slate-400 text-sm text-center">
                      {t("globalConnection.noFriends")}
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        navigate("/connections");
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                    >
                      {t("globalConnection.viewAllFriends")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
