import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase, TABLES } from "@/config/supabase";
import { confirmFriendRequest, declineFriendRequest } from "@/services/supabaseService";
import {
  getDirectMessages,
  sendDirectMessage,
  subscribeToDirectMessages,
  type DirectMessage,
} from "@/services/directMessageService";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MessageCircle, Send, ArrowLeft, User, Check, X } from "lucide-react";

interface FriendEntry {
  requestId: string;
  userId: string;
  name: string;
  status: "pending" | "accepted";
  isIncoming: boolean;
  fromUserId: string;
  toUserId: string;
}

interface FriendsListProps {
  closeFeature: () => void;
  onSendMessage?: (friend: FriendEntry) => void;
}

export const GlobalConnectionInterface: React.FC<FriendsListProps> = ({
  closeFeature,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showAllPending, setShowAllPending] = useState(false);
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatWith, setChatWith] = useState<FriendEntry | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchFriends = useCallback(async () => {
    if (!user || ("isGuest" in user && user.isGuest)) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: reqError } = await supabase
        .from(TABLES.FRIEND_REQUESTS)
        .select("id, from_user_id, to_user_id, status, from_user_confirmed, to_user_confirmed, created_at")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (reqError) throw reqError;

      const requests = data || [];
      const otherIds = Array.from(
        new Set(
          requests.map((req) => (req.from_user_id === user.id ? req.to_user_id : req.from_user_id))
        )
      );

      let usersById = new Map<string, { id: string; name: string | null }>();
      if (otherIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from(TABLES.USERS)
          .select("id, name")
          .in("id", otherIds);

        if (usersError) throw usersError;
        usersById = new Map(usersData?.map((u) => [u.id, u]) || []);
      }

      const mapped: FriendEntry[] = requests.map((req) => {
        const otherId = req.from_user_id === user.id ? req.to_user_id : req.from_user_id;
        const otherUser = usersById.get(otherId);
        return {
          requestId: req.id,
          userId: otherId,
          name: otherUser?.name || t("globalConnection.unknownUser"),
          status: req.status,
          isIncoming: req.to_user_id === user.id,
          fromUserId: req.from_user_id,
          toUserId: req.to_user_id,
        };
      });

      setFriends(mapped);
    } catch (err: unknown) {
      console.error("[GlobalConnectionInterface] fetch error", err);
      setError(t("globalConnection.failedLoadFriends"));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const pendingRequests = useMemo(() => friends.filter((f) => f.status === "pending"), [friends]);
  const currentFriends = useMemo(() => friends.filter((f) => f.status === "accepted"), [friends]);
  const displayedPending = showAllPending ? pendingRequests : pendingRequests.slice(0, 3);

  // Load messages when opening chat
  useEffect(() => {
    if (!chatWith || !user || "isGuest" in user) return;
    getDirectMessages(user.id, chatWith.userId).then(setMessages);
    const unsub = subscribeToDirectMessages(user.id, chatWith.userId, (msg) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });
    return unsub;
  }, [chatWith?.userId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!chatWith || !user || "isGuest" in user || !messageInput.trim()) return;
    setSending(true);
    const text = messageInput.trim();
    setMessageInput("");
    const sent = await sendDirectMessage(user.id, chatWith.userId, text);
    if (sent) {
      setMessages((prev) => [...prev, sent]);
    } else {
      toast.error("Failed to send message");
      setMessageInput(text);
    }
    setSending(false);
  }, [chatWith, user, messageInput]);

  if (!user || ("isGuest" in user && user.isGuest)) {
    return (
      <Card className="w-full max-w-2xl p-6 bg-slate-900/95 border border-slate-700 shadow-xl rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{t("globalConnection.title")}</h2>
          <Button variant="ghost" size="sm" onClick={closeFeature} className="text-slate-300 hover:text-white">
            {t("globalConnection.close")}
          </Button>
        </div>
        <p className="text-slate-400">{t("globalConnection.signInRequired")}</p>
      </Card>
    );
  }

  // Chat view with a friend
  if (chatWith) {
    return (
      <Card className="w-full max-w-2xl flex flex-col bg-slate-900/95 border border-slate-700 shadow-xl rounded-2xl overflow-hidden" style={{ minHeight: "420px" }}>
        <div className="flex items-center gap-3 p-4 border-b border-slate-700 bg-slate-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatWith(null)}
            className="text-slate-300 hover:text-white shrink-0"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            {t("globalConnection.backToConnections")}
          </Button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-indigo-300" />
            </div>
            <span className="font-semibold text-white truncate">{chatWith.name}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px] max-h-[320px]">
          {messages.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">{t("globalConnection.typeMessage")}</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_id === user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-slate-700 text-slate-100 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  <p className={`text-[10px] mt-0.5 ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                    {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-slate-700 bg-slate-800/30 flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            placeholder={t("globalConnection.typeMessage")}
            className="flex-1 rounded-xl bg-slate-700/80 border border-slate-600 text-white placeholder-slate-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={sending}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={sending || !messageInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // Main connections list
  return (
    <Card className="w-full max-w-2xl p-6 bg-slate-900/95 border border-slate-700 shadow-xl rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-400" />
          {t("globalConnection.title")}
        </h2>
        <Button variant="ghost" size="sm" onClick={closeFeature} className="text-slate-300 hover:text-white">
          {t("globalConnection.close")}
        </Button>
      </div>

      {/* Pending requests */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
          {t("globalConnection.pendingRequests")}
        </h3>
        {loading ? (
          <p className="text-slate-500 text-sm">{t("globalConnection.loadingRequests")}</p>
        ) : error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-slate-500 text-sm">{t("globalConnection.noPending")}</p>
        ) : (
          <>
            <div className="space-y-2">
              {displayedPending.map((friend) => (
                <div
                  key={friend.requestId}
                  className="flex flex-wrap items-center justify-between gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3"
                >
                  <span className="font-medium text-white">{friend.name}</span>
                  {friend.isIncoming ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-500 text-white"
                        onClick={async () => {
                          const ok = await confirmFriendRequest(friend.requestId, user.id, false);
                          if (!ok) {
                            toast.error(t("globalConnection.failedAccept"));
                            return;
                          }
                          toast.success(t("globalConnection.acceptSuccess"));
                          fetchFriends();
                        }}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        {t("globalConnection.accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-500 text-slate-300 hover:bg-slate-700"
                        onClick={async () => {
                          const ok = await declineFriendRequest(friend.requestId);
                          if (!ok) {
                            toast.error(t("globalConnection.failedDecline"));
                            return;
                          }
                          toast.success(t("globalConnection.declineSuccess"));
                          fetchFriends();
                        }}
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        {t("globalConnection.decline")}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-sm">{t("globalConnection.pending")}</span>
                  )}
                </div>
              ))}
            </div>
            {pendingRequests.length > 3 && (
              <Button
                variant="link"
                onClick={() => setShowAllPending(!showAllPending)}
                className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 p-0 h-auto"
              >
                {showAllPending ? t("globalConnection.showLess") : t("globalConnection.showMore", { count: pendingRequests.length - 3 })}
              </Button>
            )}
          </>
        )}
      </section>

      {/* Current friends */}
      <section>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
          {t("globalConnection.currentFriends")}
        </h3>
        {currentFriends.length === 0 ? (
          <p className="text-slate-500 text-sm">{t("globalConnection.noFriends")}</p>
        ) : (
          <div className="space-y-2">
            {currentFriends.map((friend) => (
              <div
                key={friend.requestId}
                className="flex items-center justify-between gap-3 bg-slate-800/60 border border-slate-600 rounded-xl px-4 py-3 hover:bg-slate-800/80 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-indigo-300" />
                  </div>
                  <span className="font-medium text-white truncate">{friend.name}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => setChatWith(friend)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 rounded-lg"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  {t("globalConnection.sendMessage")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </Card>
  );
};
