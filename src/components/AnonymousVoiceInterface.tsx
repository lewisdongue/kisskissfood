import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/types";
import { useTranslation } from "react-i18next";
import { LottieAnimation } from "@/components/LottieAnimation";
import talkingCharacterAnimation from "@/assets/Talking-Character.json";
import womanCharAnimation from "@/assets/woman-char.json";
import talkingGreenManAnimation from "@/assets/talking-green-man.json";
import {
  fetchVoiceMessages,
  fetchForYouVoiceMessages,
  getCachedVoiceMessages,
  postVoiceMessage,
  subscribeToVoiceMessages,
  incrementPlayCount,
  toggleVoiceLike,
  getUserLikedMessages,
  incrementCommentCount,
  incrementShareCount,
  fetchComments,
  addComment,
  subscribeToComments,
  incrementCommentLikes,
  logActivity,
  logVoiceFeedExposures,
  fetchRecentActivities,
  subscribeToActivities,
  fetchDailyStats,
  fetchAnalyticsSummary,
  logVoiceShare,
  logVoiceShareClick,
  trackShareConversion,
  deleteVoiceMessage,
  type VoiceComment,
  type VoiceActivity,
  type DailyStats,
  type DeleteResult,
} from "../services/voiceService";

// ============================================================================
// TYPES
// ============================================================================

interface Props {
  closeFeature: () => void;
  sharedMessageId?: string;
}

type LanguageCode = "en" | "fr" | "es" | "de" | "pt" | "it" | "ru" | "zh" | "ja" | "ko" | "ar";
type FilterTab = "for-you" | "my-language" | "trending" | "top-rated" | "latest";
type DurationFilter = "all" | "1-3" | "3-5" | "5+";

interface ExtendedMessage extends Message {
  play_count?: number;
  like_count?: number;
  comment_count?: number;
  language?: string;
  duration?: number;
  rating?: number;
  is_trending?: boolean;
  is_editor_pick?: boolean;
  transcription?: string;
  category?: string;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  qualityScore: number;
  noiseLevel: number;
}

type NotificationType = "success" | "error" | "info" | "warning";
interface UINotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
}

type Preferences = {
  autoPlay: boolean;
  showCharacter: boolean;
  enableNotifications: boolean;
  autoTranscribe: boolean;
  saveHistory: boolean;
  dataUsage: "wifi" | "always" | "never";
  audioQuality: "low" | "medium" | "high";
  theme: "dark" | "light" | "auto";
  fontSize: "small" | "medium" | "large";
  playbackSpeed: number;
};

// ============================================================================
// CONSTANTS + UTILS
// ============================================================================

const SUPPORTED_LANGUAGES: Record<LanguageCode, { name: string; flag: string; nativeName: string }> = {
  en: { name: "English", flag: "🇬🇧", nativeName: "English" },
  fr: { name: "French", flag: "🇫🇷", nativeName: "Français" },
  es: { name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  de: { name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  pt: { name: "Portuguese", flag: "🇵🇹", nativeName: "Português" },
  it: { name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
  ru: { name: "Russian", flag: "🇷🇺", nativeName: "Русский" },
  zh: { name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
  ja: { name: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
  ko: { name: "Korean", flag: "🇰🇷", nativeName: "한국어" },
  ar: { name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
};

const CATEGORIES = ["💼 Business", "🎮 Gaming", "💔 Dating", "🌍 Travel", "🎓 Education", "🎨 Art"] as const;

const detectBrowserLanguage = (): LanguageCode => {
  const browserLang = navigator.language.split("-")[0].toLowerCase();
  return (SUPPORTED_LANGUAGES[browserLang as LanguageCode] ? browserLang : "en") as LanguageCode;
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatPlayCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toExtendedMessage(msg: Message, userLanguage: LanguageCode): ExtendedMessage {
  // Use ONLY real data from database - NEVER fake or default language
  return {
    ...msg,
    audio_url: msg.audio_url ?? msg.signed_url,
    play_count: msg.play_count ?? 0,
    like_count: msg.like_count ?? 0,
    comment_count: msg.comment_count ?? 0,
    language: msg.language ?? undefined, // CRITICAL: Don't default to userLanguage - use what's stored in DB
    duration: msg.duration ?? 0,
    rating: msg.rating ?? 0,
    is_trending: msg.is_trending ?? false,
    is_editor_pick: msg.is_editor_pick ?? false,
    category: msg.category ?? undefined, // Don't assign random category - let database handle it
    transcription: msg.transcription ?? msg.text ?? undefined, // Don't show fake transcription
  };
}

const BASE_STYLES = `
  @keyframes twinkle { 0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.2)} }
  @keyframes float { 0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-18px) rotate(2deg)} }
  @keyframes shimmer-fast { 0%{transform:translateX(-100%)}100%{transform:translateX(100%)} }
  @keyframes pulse-gentle { 0%,100%{opacity:.8}50%{opacity:1} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(30%)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
  @keyframes ripple { 0%{box-shadow:0 0 0 0 rgba(249,115,22,.6)} 100%{box-shadow:0 0 0 30px rgba(249,115,22,0)} }
  @keyframes particle-float { 0%{transform:translate(0,0) rotate(0); opacity:0} 10%{opacity:1} 100%{transform:translate(var(--tx,100px), var(--ty,-100px)) rotate(360deg); opacity:0} }
  @keyframes confetti-fall { 0%{transform:translateY(-100vh) rotate(0deg); opacity:1} 100%{transform:translateY(100vh) rotate(720deg); opacity:0} }
  .animate-twinkle{animation:twinkle 3s ease-in-out infinite}
  .animate-float{animation:float 18s ease-in-out infinite}
  .animate-shimmer-fast{animation:shimmer-fast 1.5s infinite}
  .animate-pulse-gentle{animation:pulse-gentle 3s ease-in-out infinite}
  .animate-spin-slow{animation:spin-slow 20s linear infinite}
  .animate-ripple{animation:ripple 1.5s ease-out infinite}
  .scrollbar-hide{scrollbar-width:none}
  .scrollbar-hide::-webkit-scrollbar{display:none}
`;

// ============================================================================
// SMALL UI PIECES
// ============================================================================

interface ModalShellProps {
  title: string;
  accentClassName: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

const ModalShell: React.FC<ModalShellProps> = ({ title, accentClassName, onClose, children, maxWidthClassName }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto">
      <div
        className={`relative w-full ${maxWidthClassName ?? "sm:max-w-3xl"} my-auto`}
        style={{ animation: "slideUp 0.4s ease-out" }}
      >
        <div className={`absolute -inset-4 sm:-inset-6 ${accentClassName} rounded-3xl blur-3xl opacity-40 animate-pulse-gentle`} />
        <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-4 border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative h-2 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast" />
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODALS (ported from backup feature set, TS-safe)
// ============================================================================

interface ShareModalProps {
  message: ExtendedMessage;
  onClose: () => void;
  onNotify: (type: NotificationType, title: string, message: string) => void;
  onConfetti: () => void;
  onShare: (messageId: string) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ message, onClose, onNotify, onConfetti, onShare }) => {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  // Use current domain in development, production domain in production
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isDevelopment ? window.location.origin : 'https://caakus.com';
  const shareUrl = `${baseUrl}/voice/${message.id}`;
  const shareText = `🎙️ Listen to this voice message on Caakus!\n\n${message.transcription?.slice(0, 100) || "Check out this voice message"}...\n\n`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShareCount((p) => p + 1);
      onShare(message.id);
      onConfetti();
      onNotify("success", "Copied", "Link copied to clipboard.");
      
      // Track share analytics
      void logVoiceShare(message.id, 'copy_link', shareUrl, window.location.href);
      
      window.setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
      onNotify("error", "Copy failed", "Could not copy link.");
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: "🎙️ Caakus Voice Story", text: shareText, url: shareUrl });
      setShareCount((p) => p + 1);
      onShare(message.id);
      onConfetti();
      
      // Track share analytics
      void logVoiceShare(message.id, 'native_share', shareUrl, window.location.href);
    } catch (e) {
      // AbortError is normal if user cancels
      if (e instanceof Error && e.name === "AbortError") return;
      console.error(e);
      onNotify("error", "Share failed", "Could not share.");
    }
  };

  const handleSocialShare = (platform: "twitter" | "facebook" | "whatsapp" | "telegram" | "linkedin" | "reddit") => {
    setShareCount((p) => p + 1);
    onShare(message.id);
    onConfetti();
    
    // Track share analytics
    void logVoiceShare(message.id, platform, shareUrl, window.location.href);

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    let url = "";

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=Caakus,VoiceStories,Podcast`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodedText}${encodedUrl}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "reddit":
        url = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
        break;
    }

    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <ModalShell
      title="Share This Story"
      accentClassName="bg-gradient-to-r from-orange-600/30 via-red-600/30 to-pink-600/30"
      onClose={onClose}
      maxWidthClassName="sm:max-w-lg"
    >
      <div className="space-y-5">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-sm text-gray-300 line-clamp-3">{message.transcription || "Voice message"}</p>
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
            <span>🔥 {formatPlayCount(message.play_count || 0)}</span>
            <span>•</span>
            <span>⭐ {message.rating?.toFixed(1) || "5.0"}</span>
            <span>•</span>
            <span>🎧 {formatDuration(message.duration || 0)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl font-mono text-xs text-gray-300 overflow-x-auto">
            {shareUrl}
          </div>
          <Button onClick={handleCopyLink} variant={copied ? "secondary" : "default"}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {typeof navigator !== "undefined" && "share" in navigator ? (
          <Button onClick={handleNativeShare} className="w-full">
            Share via…
          </Button>
        ) : null}

        <div>
          <div className="text-sm font-semibold text-white mb-3">Share on Social</div>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleSocialShare("twitter")} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="text-2xl mb-1">𝕏</div>
              <div className="text-xs text-gray-200">Twitter</div>
            </button>
            <button onClick={() => handleSocialShare("facebook")} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="text-2xl mb-1">📘</div>
              <div className="text-xs text-gray-200">Facebook</div>
            </button>
            <button onClick={() => handleSocialShare("whatsapp")} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="text-2xl mb-1">💬</div>
              <div className="text-xs text-gray-200">WhatsApp</div>
            </button>
            <button onClick={() => handleSocialShare("telegram")} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="text-2xl mb-1">✈️</div>
              <div className="text-xs text-gray-200">Telegram</div>
            </button>
            <button onClick={() => handleSocialShare("linkedin")} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="text-2xl mb-1">💼</div>
              <div className="text-xs text-gray-200">LinkedIn</div>
            </button>
            <button onClick={() => handleSocialShare("reddit")} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="text-2xl mb-1">🤖</div>
              <div className="text-xs text-gray-200">Reddit</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400">
          Shared <span className="text-white font-semibold">{shareCount}</span> time{shareCount === 1 ? "" : "s"} this session
        </div>
      </div>
    </ModalShell>
  );
};

interface CommentModalProps {
  message: ExtendedMessage;
  onClose: () => void;
  onAddComment: (messageId: string) => void;
}

interface Comment {
  id: string;
  username: string;
  text: string;
  created_at: string;
  likes: number;
}

const CommentModal: React.FC<CommentModalProps> = ({ message, onClose, onAddComment }) => {
  // Load real comments from database
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Load comments on mount
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const voiceComments = await fetchComments(message.id);
        // Transform VoiceComment to Comment format
        const transformedComments = voiceComments.map((vc) => ({
          id: vc.id,
          username: vc.author_pseudonym,
          text: vc.content,
          created_at: vc.created_at,
          likes: vc.likes_count,
        }));
        setComments(transformedComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadComments();

    // Subscribe to new comments in real-time from other users
    const unsubscribe = subscribeToComments(message.id, (newVoiceComment) => {
      const newCommentObj: Comment = {
        id: newVoiceComment.id,
        username: newVoiceComment.author_pseudonym,
        text: newVoiceComment.content,
        created_at: newVoiceComment.created_at,
        likes: newVoiceComment.likes_count,
      };
      // Only add if it doesn't already exist (avoid duplicates from optimistic update)
      setComments((prev) => {
        const exists = prev.some(c => c.id === newCommentObj.id);
        return exists ? prev : [newCommentObj, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [message.id]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    const commentText = newComment.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    // OPTIMISTIC UPDATE: Add comment to UI immediately for instant feedback (like live chat)
    const optimisticComment: Comment = {
      id: tempId,
      username: "You",
      text: commentText,
      created_at: new Date().toISOString(),
      likes: 0,
    };
    
    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment("");
    setSubmitting(true);
    
    try {
      const result = await addComment(message.id, commentText);
      
      if (result) {
        // Replace optimistic comment with real one from database
        setComments((prev) => prev.map(c => 
          c.id === tempId ? { ...c, id: result, username: "Anonymous" } : c
        ));
        onAddComment(message.id);
      } else {
        // If failed, remove optimistic comment
        setComments((prev) => prev.filter(c => c.id !== tempId));
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Remove optimistic comment on error
      setComments((prev) => prev.filter(c => c.id !== tempId));
    } finally {
      setSubmitting(false);
      // Focus back on input for easy follow-up comments
      commentInputRef.current?.focus();
    }
  };

  // Handle Enter key to submit (like chat)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !submitting) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <ModalShell
      title={`Comments (${comments.length})`}
      accentClassName="bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30"
      onClose={onClose}
      maxWidthClassName="sm:max-w-2xl"
    >
      <div className="space-y-4">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-gray-300 line-clamp-2">
          {message.transcription || "Voice story"}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No comments yet. Be the first!</div>
        ) : (
          <div className="space-y-3 max-h-[40vh] overflow-y-auto scrollbar-hide pr-1">
            {comments.map((c) => {
              const isYou = c.username === "You";
              const isTemporary = c.id.startsWith('temp_');
              return (
                <div 
                  key={c.id} 
                  className={`p-4 rounded-2xl transition-all duration-300 ${
                    isYou 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                      : 'bg-white/5 border border-white/10'
                  } ${isTemporary ? 'animate-pulse opacity-70' : ''}`}
                  style={isYou ? { animation: 'scaleIn 0.3s ease-out' } : {}}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-sm font-semibold ${isYou ? 'text-blue-300' : 'text-white'}`}>
                      {c.username}
                      {isYou && <span className="ml-2 text-xs text-blue-400">(Just now)</span>}
                    </div>
                    {!isTemporary && (
                      <button
                        onClick={() => {
                          void incrementCommentLikes(c.id);
                          setComments((prev) => prev.map((cc) => (cc.id === c.id ? { ...cc, likes: cc.likes + 1 } : cc)));
                        }}
                        className="text-xs text-gray-300 hover:text-pink-400 transition-colors"
                      >
                        ❤️ {c.likes}
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">{c.text}</div>
                  {isTemporary && (
                    <div className="text-xs text-gray-500 mt-1">Sending...</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={commentInputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write a comment… (Press Enter to send)"
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition-colors"
            disabled={submitting}
            autoFocus
          />
          <Button disabled={!newComment.trim() || submitting} onClick={handleSubmit}>
            {submitting ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

interface DeleteModalProps {
  message: ExtendedMessage;
  onCancel: () => void;
  onConfirm: () => void;
  onError: (error: string) => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ message, onCancel, onConfirm, onError }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    
    try {
      const result: DeleteResult = await deleteVoiceMessage(message.id);
      
      if (result.success) {
        // Success - wait a moment for visual feedback, then confirm
        await new Promise((r) => setTimeout(r, 600));
        onConfirm();
      } else {
        // Handle different error types
        let errorMessage = result.message || 'Failed to delete voice message';
        
        switch (result.error) {
          case 'NOT_OWNER':
            errorMessage = '🚫 You can only delete your own voice messages';
            break;
          case 'NOT_FOUND':
            errorMessage = '❌ Voice message not found';
            break;
          case 'PERMISSION_DENIED':
            errorMessage = '🔒 Please log in to delete messages';
            break;
          default:
            errorMessage = '⚠️ Failed to delete: ' + (result.message || 'Unknown error');
        }
        
        setError(errorMessage);
        onError(errorMessage);
        setDeleting(false);
      }
    } catch (err) {
      console.error('Delete error:', err);
      const errorMsg = '⚠️ An unexpected error occurred';
      setError(errorMsg);
      onError(errorMsg);
      setDeleting(false);
    }
  };

  return (
    <ModalShell
      title="Delete voice message?"
      accentClassName="bg-gradient-to-r from-red-600/30 via-orange-600/30 to-red-600/30"
      onClose={onCancel}
      maxWidthClassName="sm:max-w-md"
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-300">
          ⚠️ This action cannot be undone. The voice message and its audio file will be permanently deleted.
        </div>
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
            {error}
          </div>
        )}
        
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-xs text-gray-400 mb-2">Message preview:</div>
          <div className="text-sm text-gray-300 line-clamp-2">
            {message.transcription || "Voice message"}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>🎧 {message.play_count || 0} plays</span>
            <span>•</span>
            <span>❤️ {message.like_count || 0} likes</span>
            <span>•</span>
            <span>💬 {message.comment_count || 0} comments</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={onCancel} 
            disabled={deleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            {deleting ? "Deleting…" : "Delete Forever"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

interface SearchModalProps {
  onClose: () => void;
  messages: ExtendedMessage[];
  userLanguage: LanguageCode;
  playingId: string | null;
  currentTime: number;
  onPlayMessage: (m: ExtendedMessage) => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  onShare: (m: ExtendedMessage) => void;
  onComment: (id: string) => void;
  onBookmarkToggle: (m: ExtendedMessage) => void;
  isBookmarked: (id: string) => boolean;
  onDelete: (m: ExtendedMessage) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  onClose,
  messages,
  userLanguage,
  playingId,
  currentTime,
  onPlayMessage,
  onLike,
  onShare,
  onComment,
  onBookmarkToggle,
  isBookmarked,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExtendedMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    languages: [] as LanguageCode[],
    categories: [] as string[],
    minDuration: 0,
    maxDuration: 600,
    minRating: 0,
    sortBy: "relevance" as "relevance" | "recent" | "popular" | "rating",
  });

  const handleSearch = useCallback(async () => {
    // ALWAYS perform search - even with no query (to apply filters)
    setIsSearching(true);
    await new Promise((r) => setTimeout(r, 200));

    let results = messages.filter((msg) => {
      // Enhanced search: Check transcription, category, language name, and text
      const searchLower = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !searchQuery.trim() || 
        (msg.transcription ?? "").toLowerCase().includes(searchLower) ||
        (msg.category ?? "").toLowerCase().includes(searchLower) ||
        (msg.text ?? "").toLowerCase().includes(searchLower) ||
        (msg.language && SUPPORTED_LANGUAGES[msg.language as LanguageCode]?.nativeName.toLowerCase().includes(searchLower)) ||
        (msg.language && SUPPORTED_LANGUAGES[msg.language as LanguageCode]?.name.toLowerCase().includes(searchLower));
      
      // Language filter: strict matching (only if language is explicitly set)
      const matchesLanguage =
        searchFilters.languages.length === 0 || 
        (msg.language && searchFilters.languages.includes(msg.language as LanguageCode));
      
      // Category filter: strict matching (handle null/undefined properly)
      const matchesCategory =
        searchFilters.categories.length === 0 || 
        (msg.category && searchFilters.categories.includes(msg.category));
      
      // Duration filter
      const dur = msg.duration ?? 0;
      const matchesDuration = dur >= searchFilters.minDuration && dur <= searchFilters.maxDuration;
      
      // Rating filter
      const matchesRating = (msg.rating ?? 0) >= searchFilters.minRating;
      
      return matchesQuery && matchesLanguage && matchesCategory && matchesDuration && matchesRating;
    });

    // Sort results based on selected sorting
    switch (searchFilters.sortBy) {
      case "recent":
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "popular":
        results.sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0));
        break;
      case "rating":
        results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "relevance":
      default:
        // For relevance, prioritize messages that match the search query in transcription
        if (searchQuery.trim()) {
          results.sort((a, b) => {
            const aMatches = (a.transcription ?? "").toLowerCase().includes(searchQuery.toLowerCase());
            const bMatches = (b.transcription ?? "").toLowerCase().includes(searchQuery.toLowerCase());
            if (aMatches && !bMatches) return -1;
            if (!aMatches && bMatches) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        }
        break;
    }

    setSearchResults(results);
    setIsSearching(false);
  }, [messages, searchFilters, searchQuery]);

  // Trigger search on any change - debounced
  useEffect(() => {
    const debounce = window.setTimeout(() => {
      // Always run search - show all messages by default, then apply filters
      void handleSearch();
    }, 300);
    return () => window.clearTimeout(debounce);
  }, [handleSearch, searchFilters, searchQuery]);
  
  // Initial search when component mounts
  useEffect(() => {
    void handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLanguageFilter = (lang: LanguageCode) => {
    setSearchFilters((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang) ? prev.languages.filter((l) => l !== lang) : [...prev.languages, lang],
    }));
  };

  const toggleCategoryFilter = (category: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category) ? prev.categories.filter((c) => c !== category) : [...prev.categories, category],
    }));
  };

  return (
    <ModalShell
      title="Search Stories"
      accentClassName="bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-purple-600/30"
      onClose={onClose}
      maxWidthClassName="sm:max-w-4xl"
    >
      <div className="space-y-4">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by keywords, topics, or themes…"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-cyan-500/50"
        />

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <select
            value={searchFilters.sortBy}
            onChange={(e) => setSearchFilters((p) => ({ ...p, sortBy: e.target.value as typeof p.sortBy }))}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white"
          >
            <option value="relevance">Relevance</option>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>

          {Object.entries(SUPPORTED_LANGUAGES)
            .slice(0, 5)
            .map(([code, lang]) => (
              <button
                key={code}
                onClick={() => toggleLanguageFilter(code as LanguageCode)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  searchFilters.languages.includes(code as LanguageCode)
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                    : "bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                }`}
              >
                {lang.flag} {lang.nativeName}
              </button>
            ))}

          <button
            onClick={() => setShowAdvancedFilters((v) => !v)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              showAdvancedFilters ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-white/5 border border-white/10 text-gray-300 hover:text-white"
            }`}
          >
            Advanced
          </button>
        </div>

        {showAdvancedFilters ? (
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
            <div>
              <div className="text-sm font-semibold text-white mb-2">Languages</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() => toggleLanguageFilter(code as LanguageCode)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      searchFilters.languages.includes(code as LanguageCode)
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                        : "bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                    }`}
                  >
                    {lang.flag} {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-white mb-2">Categories</div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCategoryFilter(c)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      searchFilters.categories.includes(c)
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-white mb-2">
                Duration: {formatDuration(searchFilters.minDuration)} - {formatDuration(searchFilters.maxDuration)}
              </div>
              <input
                type="range"
                min={0}
                max={600}
                step={30}
                value={searchFilters.minDuration}
                onChange={(e) => setSearchFilters((p) => ({ ...p, minDuration: Number(e.target.value) }))}
                className="w-full accent-cyan-500"
              />
              <input
                type="range"
                min={0}
                max={600}
                step={30}
                value={searchFilters.maxDuration}
                onChange={(e) => setSearchFilters((p) => ({ ...p, maxDuration: Number(e.target.value) }))}
                className="w-full accent-purple-500 mt-2"
              />
            </div>

            <div>
              <div className="text-sm font-semibold text-white mb-2">Minimum Rating: {searchFilters.minRating.toFixed(1)} ⭐</div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={searchFilters.minRating}
                onChange={(e) => setSearchFilters((p) => ({ ...p, minRating: Number(e.target.value) }))}
                className="w-full accent-yellow-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() =>
                  setSearchFilters({
                    languages: [],
                    categories: [],
                    minDuration: 0,
                    maxDuration: 600,
                    minRating: 0,
                    sortBy: "relevance",
                  })
                }
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm font-semibold"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : null}

        <div className="text-sm text-gray-400">
          {isSearching ? (
            "Searching…"
          ) : (
            <>
              Found {searchResults.length} result(s)
              {searchFilters.languages.length > 0 && (
                <span className="ml-2">
                  • Languages: {searchFilters.languages.map(l => SUPPORTED_LANGUAGES[l].flag).join(" ")}
                </span>
              )}
              {searchFilters.categories.length > 0 && (
                <span className="ml-2">
                  • Categories: {searchFilters.categories.join(", ")}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="ml-2">
                  • Query: "{searchQuery.trim()}"
                </span>
              )}
            </>
          )}
        </div>

        <div className="space-y-4 max-h-[55vh] overflow-y-auto scrollbar-hide pr-1">
          {searchResults.length === 0 && !isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-lg font-semibold text-white mb-2">No results found</div>
              <div className="text-sm text-gray-400 mb-4">
                {searchQuery.trim() || searchFilters.languages.length > 0 || searchFilters.categories.length > 0
                  ? "Try adjusting your search or filters"
                  : "No voice stories available"}
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchFilters({
                    languages: [],
                    categories: [],
                    minDuration: 0,
                    maxDuration: 600,
                    minRating: 0,
                    sortBy: "relevance",
                  });
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            searchResults.map((m, i) => (
              <PodcastCard
                key={m.id}
                message={m}
                isPlaying={playingId === m.id}
                currentTime={currentTime}
                onPlay={() => onPlayMessage(m)}
                onLike={(e) => onLike(m.id, e)}
                onShare={() => onShare(m)}
                onComment={() => onComment(m.id)}
                onBookmarkToggle={() => onBookmarkToggle(m)}
                isBookmarked={isBookmarked(m.id)}
                onDelete={() => onDelete(m)}
                userLanguage={userLanguage}
                index={i}
                isLiked={false}
              />
            ))
          )}
        </div>
      </div>
    </ModalShell>
  );
};

interface BookmarksModalProps {
  onClose: () => void;
  bookmarkedMessages: ExtendedMessage[];
  onRemoveBookmark: (id: string) => void;
  userLanguage: LanguageCode;
  playingId: string | null;
  currentTime: number;
  onPlayMessage: (m: ExtendedMessage) => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  onShare: (m: ExtendedMessage) => void;
  onComment: (id: string) => void;
  onBookmarkToggle: (m: ExtendedMessage) => void;
  isBookmarked: (id: string) => boolean;
  onDelete: (m: ExtendedMessage) => void;
  onNotify: (type: NotificationType, title: string, message: string) => void;
}

const BookmarksModal: React.FC<BookmarksModalProps> = ({
  onClose,
  bookmarkedMessages,
  onRemoveBookmark,
  userLanguage,
  playingId,
  currentTime,
  onPlayMessage,
  onLike,
  onShare,
  onComment,
  onBookmarkToggle,
  isBookmarked,
  onDelete,
  onNotify,
}) => {
  const folders = useMemo(() => {
    const all = bookmarkedMessages.length;
    const byCategory = CATEGORIES.map((c) => ({
      id: c,
      name: c,
      count: bookmarkedMessages.filter((m) => m.category === c).length,
      icon: "📌",
    })).filter((f) => f.count > 0);
    return [{ id: "all", name: "All Bookmarks", count: all, icon: "🔖" }, ...byCategory] as const;
  }, [bookmarkedMessages]);

  const [selectedFolder, setSelectedFolder] = useState<(typeof folders)[number]["id"]>("all");

  useEffect(() => {
    // keep selection valid
    if (selectedFolder !== "all" && !folders.some((f) => f.id === selectedFolder)) {
      setSelectedFolder("all");
    }
  }, [folders, selectedFolder]);

  const filtered = useMemo(() => {
    if (selectedFolder === "all") return bookmarkedMessages;
    return bookmarkedMessages.filter((m) => m.category === selectedFolder);
  }, [bookmarkedMessages, selectedFolder]);

  return (
    <ModalShell
      title="Bookmarks"
      accentClassName="bg-gradient-to-r from-yellow-600/30 via-orange-600/30 to-red-600/30"
      onClose={onClose}
      maxWidthClassName="sm:max-w-4xl"
    >
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                selectedFolder === f.id ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500/50 text-white" : "bg-white/5 border-2 border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              {f.icon} {f.name} {f.count > 0 ? `(${f.count})` : ""}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <div className="text-5xl mb-3">📚</div>
            No bookmarks in this folder.
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
            {filtered.map((m, i) => (
              <div key={m.id} className="relative">
                <PodcastCard
                  message={m}
                  isPlaying={playingId === m.id}
                  currentTime={currentTime}
                  onPlay={() => onPlayMessage(m)}
                  onLike={(e) => onLike(m.id, e)}
                  onShare={() => onShare(m)}
                  onComment={() => onComment(m.id)}
                  onBookmarkToggle={() => onBookmarkToggle(m)}
                  isBookmarked={isBookmarked(m.id)}
                  onDelete={() => onDelete(m)}
                  userLanguage={userLanguage}
                  index={i}
                />
                <button
                  onClick={() => {
                    onRemoveBookmark(m.id);
                    onNotify("success", "Removed", "Bookmark removed successfully");
                  }}
                  className="absolute top-4 right-4 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-semibold text-red-200 hover:bg-red-500/30"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
};

interface PreferencesModalProps {
  onClose: () => void;
  preferences: Preferences;
  onUpdate: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ onClose, preferences, onUpdate }) => {
  const toggle = <K extends keyof Preferences>(key: K) => {
    const v = preferences[key];
    if (typeof v === "boolean") onUpdate(key, (!v) as Preferences[K]);
  };

  return (
    <ModalShell
      title="Preferences"
      accentClassName="bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30"
      onClose={onClose}
      maxWidthClassName="sm:max-w-3xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide pr-1">
        <div className="space-y-3">
          {([
            { key: "autoPlay", label: "Auto-play next story", desc: "Automatically play next story when current ends" },
            { key: "showCharacter", label: "Show speaking character", desc: "Display animated character during playback" },
            { key: "enableNotifications", label: "Enable notifications", desc: "Show in-app notifications" },
            { key: "autoTranscribe", label: "Auto-transcribe (UI)", desc: "Controls transcription UI only (mocked)" },
            { key: "saveHistory", label: "Save listening history", desc: "Remember what you listened to (local)" },
          ] as const).map((row) => (
            <div key={row.key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div>
                <div className="text-sm font-semibold text-white">{row.label}</div>
                <div className="text-xs text-gray-400">{row.desc}</div>
              </div>
              <button
                onClick={() => toggle(row.key)}
                className={`w-14 h-8 rounded-full transition-all ${preferences[row.key] ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-700"}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${preferences[row.key] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
          <div className="text-sm font-semibold text-white">Playback speed: {preferences.playbackSpeed.toFixed(2)}x</div>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.25}
            value={preferences.playbackSpeed}
            onChange={(e) => onUpdate("playbackSpeed", Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="text-sm font-semibold text-white">Theme</div>
            <div className="grid grid-cols-3 gap-2">
              {(["dark", "light", "auto"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => onUpdate("theme", v)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    preferences.theme === v ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="text-sm font-semibold text-white">Font Size</div>
            <div className="grid grid-cols-3 gap-2">
              {(["small", "medium", "large"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => onUpdate("fontSize", v)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    preferences.fontSize === v ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

interface AnalyticsDashboardProps {
  onClose: () => void;
  messages: ExtendedMessage[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose, messages }) => {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("7d");
  const [selectedMetric, setSelectedMetric] = useState<"plays" | "likes" | "shares" | "comments">("plays");
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load daily stats from database
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 365;
        const stats = await fetchDailyStats(days);
        setDailyStats(stats);
      } catch (error) {
        console.error('Failed to load daily stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    void loadStats();
  }, [timeRange]);

  const analyticsData = useMemo(() => {
    // Calculate real totals from messages
    const totalPlays = messages.reduce((s, m) => s + (m.play_count ?? 0), 0);
    const totalLikes = messages.reduce((s, m) => s + (m.like_count ?? 0), 0);
    const totalComments = messages.reduce((s, m) => s + (m.comment_count ?? 0), 0);
    
    // Calculate real shares from database (not hardcoded)
    const totalShares = messages.reduce((s, m) => s + (m.share_count ?? 0), 0);
    
    // Calculate real earnings based on actual metrics (not hardcoded)
    const totalEarnings = totalPlays + (totalLikes * 2) + (totalShares * 5) + (totalComments * 3);

    return {
      totalPlays,
      totalLikes,
      totalShares,
      totalComments,
      totalEarnings,
      topStories: messages.slice(0, 5),
      dailyStats,
    };
  }, [messages, dailyStats]);

  return (
    <ModalShell
      title="Analytics Dashboard"
      accentClassName="bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-cyan-600/30"
      onClose={onClose}
      maxWidthClassName="sm:max-w-6xl"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {(["24h", "7d", "30d", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                timeRange === range ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white" : "bg-white/5 border border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              {range === "24h" ? "Last 24h" : range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "All Time"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Total Plays", value: formatPlayCount(analyticsData.totalPlays), icon: "🔥" },
            { label: "Total Likes", value: formatPlayCount(analyticsData.totalLikes), icon: "❤️" },
            { label: "Total Shares", value: formatPlayCount(analyticsData.totalShares), icon: "🔗" },
            { label: "Total Comments", value: formatPlayCount(analyticsData.totalComments), icon: "💬" },
            { label: "Yuyu Earned", value: `${analyticsData.totalEarnings} Y`, icon: "💰" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-xs text-gray-400">{stat.label}</div>
              <div className="mt-1 text-2xl font-bold text-white flex items-center gap-2">
                <span>{stat.icon}</span>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Performance Trend</div>
            <div className="flex gap-2">
              {(["plays", "likes", "shares", "comments"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMetric(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedMetric === m ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white" : "bg-white/5 text-gray-300 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {analyticsData.dailyStats.length > 0 ? (
            <div className="h-44 flex items-end gap-3">
              {analyticsData.dailyStats.map((s) => {
                const value = Number(s[selectedMetric]);
                const maxValue = Math.max(...analyticsData.dailyStats.map((x) => Number(x[selectedMetric])));
                const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                return (
                  <div key={s.date} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-white/10 rounded-xl overflow-hidden">
                      <div className="w-full bg-gradient-to-t from-purple-600 via-blue-600 to-cyan-600" style={{ height: `${height}%`, minHeight: 8 }} />
                    </div>
                    <div className="text-xs text-gray-400">{s.date}</div>
                  </div>
                );
              })}
            </div>
          ) : loadingStats ? (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
              Loading analytics...
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
              No analytics data available yet
            </div>
          )}
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
          <div className="text-sm font-semibold text-white mb-4">Top Performing Stories</div>
          {analyticsData.topStories.length > 0 ? (
            <div className="space-y-2">
              {analyticsData.topStories.map((s) => (
                <div key={s.id} className="p-3 bg-black/30 border border-white/10 rounded-xl">
                  <div className="text-sm text-white line-clamp-1">{s.transcription || `Voice message ${s.id.slice(0, 8)}`}</div>
                  <div className="mt-1 text-xs text-gray-400 flex items-center gap-3">
                    <span>🔥 {formatPlayCount(s.play_count || 0)}</span>
                    <span>❤️ {formatPlayCount(s.like_count || 0)}</span>
                    <span>💬 {formatPlayCount(s.comment_count || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm py-8">
              No stories yet
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

interface PodcastCardProps {
  message: ExtendedMessage;
  isPlaying: boolean;
  currentTime: number;
  userLanguage: LanguageCode;
  onPlay: () => void;
  onLike: (e: React.MouseEvent) => void;
  onShare: () => void;
  onComment: () => void;
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
  onDelete?: () => void;
  index: number;
  isHighlighted?: boolean;
  isLiked?: boolean; // NEW: Pass liked state from parent
}

const PodcastCard: React.FC<PodcastCardProps> = ({
  message,
  isPlaying,
  currentTime,
  userLanguage,
  onPlay,
  onLike,
  onShare,
  onComment,
  onBookmarkToggle,
  isBookmarked,
  onDelete,
  index,
  isHighlighted = false,
  isLiked = false, // NEW: Receive liked state
}) => {
  const [localLiked, setLocalLiked] = useState(isLiked); // Use prop as initial value
  const [localPlayCount, setLocalPlayCount] = useState(message.play_count ?? 0);
  const [localLikeCount, setLocalLikeCount] = useState(message.like_count ?? 0);
  const [showWaveform, setShowWaveform] = useState(false);

  const languageInfo = message.language ? SUPPORTED_LANGUAGES[message.language as LanguageCode] : undefined;
  const isDifferentLanguage = Boolean(message.language && message.language !== userLanguage);
  const isMyLanguage = Boolean(message.language && message.language === userLanguage);
  const waveformBars = useMemo(() => [...Array(40)].map(() => Math.random() * 100), [message.id]);

  // Update liked state when prop changes (after page refresh)
  useEffect(() => {
    setLocalLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLocalPlayCount(message.play_count ?? 0);
  }, [message.play_count]);
  
  useEffect(() => {
    setLocalLikeCount(message.like_count ?? 0);
  }, [message.like_count]);

  const handleLikeClick = (e: React.MouseEvent) => {
    // Toggle liked state immediately for instant feedback
    setLocalLiked((prev) => !prev);
    // Update local count optimistically
    setLocalLikeCount((p) => localLiked ? Math.max(0, p - 1) : p + 1);
    onLike(e);
  };

  return (
    <div id={`message-${message.id}`} className="group relative" style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.06}s both` }}>
      {isHighlighted && (
        <div className="absolute -inset-6 bg-gradient-to-r from-yellow-500/40 via-orange-500/40 to-pink-500/40 rounded-3xl blur-3xl animate-pulse" />
      )}
      <div className="absolute -inset-4 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 md:p-6 transition-all duration-500 hover:scale-[1.01] ${
        isHighlighted 
          ? "border-4 border-yellow-500/70 shadow-2xl shadow-yellow-500/30" 
          : "border-2 border-white/20 hover:border-orange-500/50"
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {languageInfo ? (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                isMyLanguage 
                  ? "bg-green-500/20 border-2 border-green-500/50 shadow-lg shadow-green-500/20" 
                  : isDifferentLanguage 
                  ? "bg-purple-500/20 border border-purple-500/30" 
                  : "bg-orange-500/20 border border-orange-500/30"
              }`}>
                <span className="text-lg">{languageInfo.flag}</span>
                <span className="text-xs font-semibold text-white">{languageInfo.nativeName}</span>
                {isMyLanguage && <span className="text-xs text-green-300 ml-1">✓ Your language</span>}
                {isDifferentLanguage && <span className="text-xs text-purple-300 ml-1">Auto-translated</span>}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-500/20 border border-gray-500/30">
                <span className="text-lg">🌐</span>
                <span className="text-xs font-semibold text-gray-300">No language set</span>
              </div>
            )}

            {message.is_trending && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-semibold text-red-300">Trending</span>
              </div>
            )}

            {message.is_editor_pick && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-semibold text-yellow-300">Editor&apos;s Pick</span>
              </div>
            )}
          </div>

          {message.category && (
            <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <span className="text-xs font-medium text-gray-300">{message.category}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-orange-400">🔥</span>
            <span className="font-semibold text-white">{formatPlayCount(localPlayCount)}</span>
            <span className="text-gray-400">plays</span>
          </div>
          {typeof message.rating === "number" && (
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400">⭐</span>
              <span className="font-semibold text-white">{message.rating.toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-pink-400">🎧</span>
            <span className="font-medium text-gray-300">{formatDuration(message.duration ?? 0)}</span>
          </div>
        </div>

        <div className="relative mb-5">
          <div
            className="relative h-24 sm:h-32 bg-gradient-to-br from-black/40 to-black/20 rounded-2xl border border-white/10 overflow-hidden cursor-pointer group/waveform"
            onClick={onPlay}
            onMouseEnter={() => setShowWaveform(true)}
            onMouseLeave={() => setShowWaveform(false)}
          >
            <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
              {waveformBars.map((h, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? "bg-gradient-to-t from-orange-500 via-red-500 to-pink-500 animate-pulse"
                      : "bg-gradient-to-t from-orange-600/50 to-pink-600/50 group-hover/waveform:from-orange-500/80 group-hover/waveform:to-pink-500/80"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showWaveform || isPlaying ? "opacity-100" : "opacity-0"}`}>
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-orange-600 to-pink-600 rounded-full blur-2xl opacity-50" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  {isPlaying ? (
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-6 bg-white rounded-full animate-bounce" />
                      <div className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  ) : (
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {isPlaying && message.duration ? (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300" style={{ width: `${(currentTime / message.duration) * 100}%` }} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-white text-base sm:text-lg leading-relaxed line-clamp-2 mb-2">
            {message.transcription || "Voice message"}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>👤</span>
            <span>Anonymous</span>
            <span>•</span>
            <span>{new Date(message.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap justify-between gap-2 sm:gap-3">
          <button
            onClick={handleLikeClick}
            className={`group/btn relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 ${
              localLiked ? "bg-gradient-to-r from-pink-500/30 to-red-500/30 border-2 border-pink-500/50" : "bg-white/5 border-2 border-white/10 hover:border-pink-500/30 hover:bg-white/10"
            }`}
          >
            <span className="relative text-base sm:text-xl">{localLiked ? "❤️" : "🤍"}</span>
            <span className="relative text-xs sm:text-sm font-semibold text-white">{formatPlayCount(localLikeCount)}</span>
          </button>

          <button
            onClick={onComment}
            className="group/btn relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border-2 border-white/10 hover:border-blue-500/30 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all duration-300"
          >
            <span className="relative text-base sm:text-xl">💬</span>
            <span className="relative text-xs sm:text-sm font-semibold text-white">{message.comment_count ?? 0}</span>
          </button>

          <button
            onClick={onShare}
            className="group/btn relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border-2 border-orange-500/30 hover:border-orange-500/50 rounded-lg sm:rounded-xl transition-all duration-300"
          >
            <span className="relative text-base sm:text-xl">🔗</span>
            <span className="relative text-xs sm:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">Share</span>
          </button>

          <button
            onClick={onBookmarkToggle}
            className={`group/btn relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 ${
              isBookmarked
                ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50"
                : "bg-white/5 border-2 border-white/10 hover:border-yellow-500/30 hover:bg-white/10"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <span className="relative text-xl">{isBookmarked ? "🔖" : "📌"}</span>
            <span className="relative text-sm font-semibold text-white">{isBookmarked ? "Saved" : "Save"}</span>
          </button>

          {onDelete ? (
            <button
              onClick={onDelete}
              className="group/btn relative flex items-center gap-2 px-4 py-2.5 bg-white/5 border-2 border-white/10 hover:border-red-500/30 hover:bg-white/10 rounded-xl transition-all duration-300"
              title="Delete"
            >
              <span className="relative text-xl">🗑️</span>
              <span className="relative text-sm font-semibold text-white">Delete</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EFFECT OVERLAYS (from backup feature set)
// ============================================================================

interface ParticleExplosionProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const ParticleExplosion: React.FC<ParticleExplosionProps> = ({ x, y, onComplete }) => {
  const particles = useMemo(
    () =>
      [...Array(28)].map((_, i) => ({
        id: i,
        angle: (360 / 28) * i,
        distance: Math.random() * 90 + 40,
        size: Math.random() * 6 + 2,
        color: ["#f97316", "#ef4444", "#ec4899", "#f59e0b"][Math.floor(Math.random() * 4)],
        duration: Math.random() * 0.5 + 0.6,
      })),
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1000);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[150]" style={{ left: x, top: y }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={
            {
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              left: 0,
              top: 0,
              // CSS vars
              ["--tx" as unknown as string]: `${Math.cos((p.angle * Math.PI) / 180) * p.distance}px`,
              ["--ty" as unknown as string]: `${Math.sin((p.angle * Math.PI) / 180) * p.distance}px`,
              animation: `particle-float ${p.duration}s ease-out forwards`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

interface ConfettiCannonProps {
  active: boolean;
  onComplete: () => void;
}

const ConfettiCannon: React.FC<ConfettiCannonProps> = ({ active, onComplete }) => {
  const confetti = useMemo(
    () =>
      [...Array(50)].map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 0.5,
        duration: Math.random() * 2 + 2,
        rotation: Math.random() * 360,
        color: ["#f97316", "#ef4444", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"][Math.floor(Math.random() * 6)],
        size: Math.random() * 8 + 4,
      })),
    []
  );

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(onComplete, 4000);
    return () => window.clearTimeout(t);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute"
          style={{
            left: c.left,
            top: "-10px",
            width: `${c.size}px`,
            height: `${c.size}px`,
            background: c.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
            animation: `confetti-fall ${c.duration}s ease-in ${c.delay}s forwards`,
            transform: `rotate(${c.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

const HolographicLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="relative">
        <div className="absolute inset-0 -m-20">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border-2 border-purple-500/30 animate-spin-slow" style={{ animationDirection: "reverse" }} />
          <div className="absolute inset-8 rounded-full border-2 border-pink-500/30 animate-spin-slow" />
        </div>
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 animate-pulse-gentle" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 rounded-full animate-pulse-gentle" />
          </div>
        </div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse-gentle">
            Loading Experience...
          </p>
        </div>
      </div>
    </div>
  );
};

interface SuccessAnimationProps {
  message: string;
  onComplete: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ message, onComplete }) => {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2000);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl">
      <div className="relative" style={{ animation: "scaleIn 0.5s ease-out" }}>
        <div className="absolute -inset-20 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full blur-3xl opacity-50 animate-pulse-gentle" />
        <div className="relative w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-ripple">
          <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-lg font-bold text-green-400 animate-pulse-gentle">{message}</p>
        </div>
      </div>
    </div>
  );
};

const useMobileGestures = (onSwipeUp?: () => void, onSwipeDown?: () => void) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUp = distance > minSwipeDistance;
    const isDown = distance < -minSwipeDistance;
    if (isUp && onSwipeUp) onSwipeUp();
    if (isDown && onSwipeDown) onSwipeDown();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AnonymousVoiceInterface: React.FC<Props> = ({ closeFeature, sharedMessageId }) => {
  const { t } = useTranslation();

  // core
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ExtendedMessage[]>([]);
  const [forYouMessages, setForYouMessages] = useState<ExtendedMessage[]>([]);
  const [isForYouLoading, setIsForYouLoading] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(sharedMessageId ?? null);
  const [likedMessageIds, setLikedMessageIds] = useState<Set<string>>(new Set()); // Track which messages user has liked

  const [userLanguage, setUserLanguage] = useState<LanguageCode>(detectBrowserLanguage());
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("for-you");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // playback
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCharacter, setShowCharacter] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<object | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // recording
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
    qualityScore: 100,
    noiseLevel: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [recordingPreview, setRecordingPreview] = useState<Blob | null>(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [recordingCategory, setRecordingCategory] = useState<string>("Personal"); // Default category for recording
  const [showCategorySelector, setShowCategorySelector] = useState(false); // Toggle category selector

  const totalFeedCount = activeTab === "for-you" ? forYouMessages.length : messages.length;
  
  // Smart category selection: When user opens recording UI, auto-select current category filter
  useEffect(() => {
    if (showRecordingUI) {
      // If user is viewing a specific category, auto-select it for recording
      if (selectedCategory !== "all") {
        setRecordingCategory(selectedCategory);
        setShowCategorySelector(false); // Hide selector, show auto-selected
      } else {
        setShowCategorySelector(true); // Show selector in "All" view
      }
    }
  }, [showRecordingUI, selectedCategory]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pausedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasShownTimeLimitNotification = useRef<boolean>(false);

  // overlays & modals
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showLiveActivity, setShowLiveActivity] = useState(false); // ✅ FIXED: Don't show by default (users find it annoying/fake)
  const [showSearch, setShowSearch] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // enhanced effects (backup parity)
  const [showParticles, setShowParticles] = useState(false);
  const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [shareModalMessage, setShareModalMessage] = useState<ExtendedMessage | null>(null);
  const [commentModalMessage, setCommentModalMessage] = useState<ExtendedMessage | null>(null);
  const [deleteModalMessage, setDeleteModalMessage] = useState<ExtendedMessage | null>(null);

  // notifications
  const [notifications, setNotifications] = useState<UINotification[]>([]);

  const showNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const notif: UINotification = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      type,
      title,
      message,
      createdAt: Date.now(),
    };
    setNotifications((prev) => [notif, ...prev].slice(0, 6));
    window.setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id)), 5000);
  }, []);

  // preferences + bookmarks
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const defaults: Preferences = {
      autoPlay: false,
      showCharacter: true,
      enableNotifications: true,
      autoTranscribe: true,
      saveHistory: true,
      dataUsage: "wifi",
      audioQuality: "high",
      theme: "dark",
      fontSize: "medium",
      playbackSpeed: 1.0,
    };

    const parsed = safeJsonParse<Partial<Preferences>>(localStorage.getItem("caakus_preferences")) ?? {};
    return { ...defaults, ...parsed };
  });

  useEffect(() => {
    localStorage.setItem("caakus_preferences", JSON.stringify(preferences));
  }, [preferences]);

  const [bookmarkedMessages, setBookmarkedMessages] = useState<ExtendedMessage[]>(() => {
    return safeJsonParse<ExtendedMessage[]>(localStorage.getItem("caakus_bookmarks")) ?? [];
  });

  useEffect(() => {
    localStorage.setItem("caakus_bookmarks", JSON.stringify(bookmarkedMessages));
  }, [bookmarkedMessages]);

  const isBookmarked = useCallback(
    (id: string) => bookmarkedMessages.some((m) => m.id === id),
    [bookmarkedMessages]
  );

  const toggleBookmark = useCallback(
    (msg: ExtendedMessage) => {
      const exists = bookmarkedMessages.some((m) => m.id === msg.id);
      setBookmarkedMessages((prev) => {
        const next = exists ? prev.filter((m) => m.id !== msg.id) : [msg, ...prev];
        return next;
      });
      showNotification("success", exists ? "Removed" : "Saved", exists ? "Bookmark removed." : "Bookmark saved.");
    },
    [bookmarkedMessages, showNotification]
  );

  // characters
  const characterAnimations = useMemo(
    () => [talkingCharacterAnimation, womanCharAnimation, talkingGreenManAnimation] as const,
    []
  );

  // inject base styles once
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-caakus-avi-styles", "true");
    styleEl.textContent = BASE_STYLES;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // language bootstrap
  useEffect(() => {
    const saved = localStorage.getItem("caakus_user_language");
    if (saved && SUPPORTED_LANGUAGES[saved as LanguageCode]) {
      setUserLanguage(saved as LanguageCode);
    } else {
      setShowLanguageSelector(true);
    }
  }, []);

  const handleLanguageSelect = (lang: LanguageCode) => {
    setUserLanguage(lang);
    localStorage.setItem("caakus_user_language", lang);
    setShowLanguageSelector(false);
  };

  // background visuals
  const stars = useMemo(
    () =>
      [...Array(120)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      })),
    []
  );

  const orbs = useMemo(
    () =>
      [...Array(7)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 280 + 140,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
      })),
    []
  );

  const particles = useMemo(
    () =>
      [...Array(50)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5,
      })),
    []
  );

  // data loading + realtime
  useEffect(() => {
    const cached = getCachedVoiceMessages();
    if (cached.length > 0) {
      setMessages(cached.map((m) => toExtendedMessage(m, userLanguage)));
      // Load liked messages even when using cache
      void getUserLikedMessages().then((likedIds) => setLikedMessageIds(new Set(likedIds)));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const initial = await fetchVoiceMessages();
        if (!cancelled) setMessages(initial.map((m) => toExtendedMessage(m, userLanguage)));
        
        // Load user's liked messages
        const likedIds = await getUserLikedMessages();
        if (!cancelled) setLikedMessageIds(new Set(likedIds));
      } catch (e) {
        console.error(e);
        if (!cancelled) showNotification("error", "Load failed", "Could not load voice stories.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showNotification, userLanguage]);

  useEffect(() => {
    const unsubscribe = subscribeToVoiceMessages((msg) => {
      setMessages((prev) => [toExtendedMessage(msg, userLanguage), ...prev]);
    });
    return unsubscribe;
  }, [userLanguage]);

  useEffect(() => {
    if (activeTab !== "for-you") return;
    let cancelled = false;
    const loadForYou = async () => {
      setIsForYouLoading(true);
      try {
        const personalized = await fetchForYouVoiceMessages(40, 0);
        if (cancelled) return;
        const transformed = personalized.map((m) => toExtendedMessage(m, userLanguage));
        setForYouMessages(transformed);
        void logVoiceFeedExposures(transformed.slice(0, 10).map((m) => m.id));
      } catch (error) {
        console.error(error);
        if (!cancelled) showNotification("error", "Load failed", "Could not load your personalized feed.");
      } finally {
        if (!cancelled) setIsForYouLoading(false);
      }
    };

    loadForYou();
    return () => {
      cancelled = true;
    };
  }, [activeTab, userLanguage, showNotification]);

  // Handle shared message - fetch if not in list and auto-play
  useEffect(() => {
    if (!sharedMessageId || messages.length === 0) return;
    
    let hasHandled = false;
    
    const loadSharedMessage = async () => {
      if (hasHandled) return;
      hasHandled = true;
      
      // Track share click analytics
      const referrer = document.referrer;
      void logVoiceShareClick(
        sharedMessageId,
        window.location.href,
        referrer || undefined
      );
      
      try {
        // Check if message already loaded
        const existingMsg = messages.find(m => m.id === sharedMessageId);
        if (existingMsg) {
          // Scroll to and auto-play the message
          setTimeout(() => {
            const element = document.getElementById(`message-${sharedMessageId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            // Auto-play the existing message
            if (existingMsg.audio_url) {
              handlePlayMessage(existingMsg);
              // Track that the user played the shared message
              void trackShareConversion('play');
            }
          }, 500);
        } else {
          // Fetch the specific message
          const { fetchVoiceMessageById } = await import('../services/voiceService');
          const sharedMsg = await fetchVoiceMessageById(sharedMessageId);
          if (sharedMsg) {
            const extended = toExtendedMessage(sharedMsg, userLanguage);
            setMessages(prev => [extended, ...prev]);
            
            // Auto-play after a short delay
            setTimeout(() => {
              const element = document.getElementById(`message-${sharedMessageId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              if (extended.audio_url) {
                handlePlayMessage(extended);
                // Track that the user played the shared message
                void trackShareConversion('play');
              }
            }, 800);
          } else {
            showNotification("error", "Not found", "The shared voice story could not be found.");
          }
        }
      } catch (error) {
        console.error("Failed to load shared message:", error);
        showNotification("error", "Load failed", "Failed to load the shared voice story.");
      }
    };

    loadSharedMessage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedMessageId, messages.length, userLanguage]);

  // filtering
  useEffect(() => {
    const baseMessages = activeTab === "for-you" ? forYouMessages : messages;
    let filtered = [...baseMessages];

    // Apply tab-based filters FIRST (these are mutually exclusive)
    switch (activeTab) {
      case "for-you":
        // Already ranked by the personalization algorithm
        break;
      case "my-language": {
        // INTELLIGENT LANGUAGE SORTING: Show user's language FIRST, then others
        // Separate messages by language match
        const myLanguage = filtered.filter((m) => {
          const msgLang = m.language as LanguageCode | undefined;
          return msgLang && msgLang === userLanguage; // Only match if language is explicitly set and matches
        });
        const otherLanguages = filtered.filter((m) => {
          const msgLang = m.language as LanguageCode | undefined;
          return !msgLang || msgLang !== userLanguage; // Everything else (no language or different language)
        });
        
        // Sort each group by recency (newest first)
        myLanguage.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        otherLanguages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Combine: My language first, then others
        filtered = [...myLanguage, ...otherLanguages];
        break;
      }
      case "trending":
        filtered = filtered.filter((m) => m.is_trending).sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0));
        break;
      case "top-rated":
        filtered = filtered.filter((m) => (m.rating ?? 0) >= 4.0).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "latest":
        filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    // Apply duration filter (if not "all")
    if (durationFilter !== "all") {
      filtered = filtered.filter((m) => {
        const dur = m.duration ?? 0;
        if (durationFilter === "1-3") return dur >= 60 && dur < 180;
        if (durationFilter === "3-5") return dur >= 180 && dur < 300;
        return dur >= 300;
      });
    }

    // Apply category filter (if not "all") - STRICT FILTER
    if (selectedCategory !== "all") filtered = filtered.filter((m) => m.category === selectedCategory);
    setFilteredMessages(filtered);
  }, [messages, forYouMessages, activeTab, userLanguage, durationFilter, selectedCategory]);

  // playback handlers
  const stopPlayback = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setPlayingId(null);
    setCurrentTime(0);
    setShowCharacter(false);
    setSelectedCharacter(null);
  }, []);

  const handlePlayMessage = useCallback(
    async (msg: ExtendedMessage) => {
      if (!msg.audio_url) {
        showNotification("warning", "No audio", "This story has no playable audio URL.");
        return;
      }

      try {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        }

        const audio = new Audio(msg.audio_url);
        currentAudioRef.current = audio;
        setPlayingId(msg.id);
        setShowCharacter(true);
        setSelectedCharacter(randomPick(characterAnimations) as unknown as object);

        // Increment play count in database
        void incrementPlayCount(msg.id);
        
        // Log activity for activity feed
        void logActivity(msg.id, 'play');
        
        // Update local state to reflect the increment
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, play_count: (m.play_count ?? 0) + 1 } : m)));

        audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
        audio.onended = () => stopPlayback();
        audio.onerror = () => stopPlayback();
        await audio.play();
      } catch (e) {
        console.error(e);
        stopPlayback();
        showNotification("error", "Playback failed", "Unable to play this story.");
      }
    },
    [characterAnimations, showNotification, stopPlayback]
  );

  const handleLikeMessage = useCallback(async (id: string) => {
    try {
      // Toggle like in database (returns true if liked, false if unliked)
      const isNowLiked = await toggleVoiceLike(id);
      
      // Update liked messages set
      setLikedMessageIds((prev) => {
        const newSet = new Set(prev);
        if (isNowLiked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
      
      // Update local message like count
      setMessages((prev) => prev.map((m) => {
        if (m.id === id) {
          const currentCount = m.like_count ?? 0;
          return { ...m, like_count: isNowLiked ? currentCount + 1 : Math.max(0, currentCount - 1) };
        }
        return m;
      }));
      
      // Log activity only when liking (not unliking)
      if (isNowLiked) {
        void logActivity(id, 'like');
        void trackShareConversion('like');
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      showNotification("error", "Failed", "Could not update like.");
    }
  }, [showNotification]);

  const handleShareMessage = useCallback((msg: ExtendedMessage) => setShareModalMessage(msg), []);

  const handleLikeWithAnimation = useCallback(
    (id: string, e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setParticlePosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setShowParticles(true);
      handleLikeMessage(id);
    },
    [handleLikeMessage]
  );

  const handleShareWithAnimation = useCallback(
    (msg: ExtendedMessage) => {
      handleShareMessage(msg);
      setShowConfetti(true);
    },
    [handleShareMessage]
  );

  const showSuccessAnimation = useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  }, []);

  const handleCommentMessage = useCallback(
    (id: string) => {
      const msg = messages.find((m) => m.id === id);
      if (msg) setCommentModalMessage(msg);
    },
    [messages]
  );

  const confirmDeleteMessage = useCallback(() => {
    if (!deleteModalMessage) return;
    // Remove from local state after successful deletion
    setMessages((prev) => prev.filter((m) => m.id !== deleteModalMessage.id));
    setDeleteModalMessage(null);
    showNotification("success", "Deleted", "Voice message deleted successfully.");
  }, [deleteModalMessage, showNotification]);

  const handleDeleteError = useCallback((error: string) => {
    // Error notification is shown by the modal, we just log it here
    console.error('[Delete Error]', error);
  }, []);

  // recording helpers
  const cleanupRecordingResources = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const analyzeAudio = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const audioLevel = Math.min(100, (avg / 255) * 100);
      const noiseLevel = Math.max(0, Math.min(100, (dataArray[0] / 255) * 100));
      const qualityScore = Math.max(0, Math.min(100, 100 - noiseLevel * 0.5));

      setRecordingState((prev) => ({
        ...prev,
        audioLevel,
        noiseLevel: Math.round(noiseLevel),
        qualityScore: Math.round(qualityScore),
      }));

      if (qualityScore < 60 || noiseLevel > 40) setShowQualityWarning(true);
      animationRef.current = requestAnimationFrame(loop);
    };
    loop();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        showNotification("error", "Unsupported", "Recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const AudioCtxClass =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) throw new Error("AudioContext unavailable");

      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      pausedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // IMPORTANT: Clear the timer when recorder stops
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        const all = [...pausedChunksRef.current, ...audioChunksRef.current];
        const blob = new Blob(all, { type: "audio/webm" });
        setRecordingPreview(blob);
        setRecordingState((prev) => ({ ...prev, isRecording: false, isPaused: false }));
      };

      setRecordingPreview(null);
      setUploadError(null);
      setRecordingState({ isRecording: true, isPaused: false, duration: 0, audioLevel: 0, qualityScore: 100, noiseLevel: 0 });
      
      // Reset the notification flag when starting a new recording
      hasShownTimeLimitNotification.current = false;

      timerRef.current = window.setInterval(() => {
        setRecordingState((prev) => {
          const next = prev.duration + 1;
          // Maximum 60 seconds (1 minute) - AUTO STOP
          if (next >= 60) {
            // Stop the recording (will trigger recorder.onstop which clears the timer)
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            
            // Show notification ONLY ONCE using a flag
            if (!hasShownTimeLimitNotification.current) {
              hasShownTimeLimitNotification.current = true;
              showNotification("info", "Time limit reached", "Maximum recording duration is 60 seconds (1 minute).");
            }
            
            // Set duration to exactly 60 and stop incrementing
            return { ...prev, duration: 60, isRecording: false };
          }
          return { ...prev, duration: next };
        });
      }, 1000);

      recorder.start(100);
      analyzeAudio();
    } catch (e) {
      console.error(e);
      cleanupRecordingResources();
      showNotification("error", "Mic error", "Could not access microphone. Check permissions.");
    }
  }, [analyzeAudio, cleanupRecordingResources, showNotification]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState((prev) => ({ ...prev, isPaused: true }));
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState((prev) => ({ ...prev, isPaused: false }));
      timerRef.current = window.setInterval(() => {
        setRecordingState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      analyzeAudio();
    }
  }, [analyzeAudio]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    cleanupRecordingResources();
  }, [cleanupRecordingResources]);

  const stopRecordingAndReset = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // ignore
    }
    cleanupRecordingResources();
    audioChunksRef.current = [];
    pausedChunksRef.current = [];
    setRecordingPreview(null);
    setShowRecordingUI(false);
    setRecordingState({ isRecording: false, isPaused: false, duration: 0, audioLevel: 0, qualityScore: 100, noiseLevel: 0 });
    // Reset the notification flag
    hasShownTimeLimitNotification.current = false;
  }, [cleanupRecordingResources]);

  const playPreview = useCallback(() => {
    if (!recordingPreview) {
      showNotification("error", "No recording", "Please record audio first.");
      return;
    }
    
    // Stop any currently playing preview
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      setIsPlayingPreview(false);
    }
    
    const url = URL.createObjectURL(recordingPreview);
    const audio = new Audio(url);
    previewAudioRef.current = audio;
    
    // Show playing state
    setIsPlayingPreview(true);
    showNotification("info", "Playing preview", "🎧 Playing your recorded audio...");
    
    // Handle playback events
    audio.onplay = () => {
      console.log("Preview playback started");
    };
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
      setIsPlayingPreview(false);
      previewAudioRef.current = null;
      showNotification("success", "Preview finished", "✓ Playback complete!");
    };
    
    audio.onerror = (e) => {
      console.error("Preview playback error:", e);
      URL.revokeObjectURL(url);
      setIsPlayingPreview(false);
      previewAudioRef.current = null;
      showNotification("error", "Playback error", "Could not play the preview. Please try again.");
    };
    
    // Start playback
    audio.play().catch((error) => {
      console.error("Failed to play preview:", error);
      URL.revokeObjectURL(url);
      setIsPlayingPreview(false);
      previewAudioRef.current = null;
      showNotification("error", "Playback failed", "Could not play the audio. Please try again.");
    });
  }, [recordingPreview, showNotification]);
  
  // Stop preview when leaving preview screen
  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      setIsPlayingPreview(false);
    }
  }, []);

  const handleUploadRecording = useCallback(async () => {
    // STRICT VALIDATION: Only accept 30-60 seconds
    if (!recordingPreview) {
      showNotification("error", "No recording", "Please record audio first.");
      return;
    }
    
    if (recordingState.duration < 30) {
      setUploadError("Audio must be between 30-60 seconds");
      showNotification("error", "Audio too short", "Audio must be between 30-60 seconds. Current: " + recordingState.duration + "s");
      return;
    }
    
    if (recordingState.duration > 60) {
      setUploadError("Audio must be between 30-60 seconds");
      showNotification("error", "Audio too long", "Audio must be between 30-60 seconds. Current: " + recordingState.duration + "s");
      return;
    }
    
    try {
      setUploading(true);
      setIsLoading(true);
      setUploadError(null);
      const file = new File([recordingPreview], `voice_${Date.now()}.webm`, { type: "audio/webm" });
      
      // Pass the recorded duration, user's language, and selected category to the database
      await postVoiceMessage(file, recordingState.duration, userLanguage, recordingCategory);
      
      showNotification("success", "Uploaded", "Your story is live!");
      showSuccessAnimation("Uploaded!");
      setRecordingPreview(null);
      setShowRecordingUI(false);
      setRecordingState({ isRecording: false, isPaused: false, duration: 0, audioLevel: 0, qualityScore: 100, noiseLevel: 0 });
      setRecordingCategory("Personal"); // Reset category to default
      cleanupRecordingResources();
    } catch (e) {
      console.error(e);
      setUploadError(e instanceof Error ? e.message : "Upload failed");
      showNotification("error", "Upload failed", "Please try again.");
    } finally {
      setUploading(false);
      setIsLoading(false);
    }
  }, [cleanupRecordingResources, recordingPreview, recordingState.duration, userLanguage, recordingCategory, showNotification, showSuccessAnimation]);

  // keep character preference enforced
  useEffect(() => {
    if (!preferences.showCharacter) {
      setShowCharacter(false);
      setSelectedCharacter(null);
    }
  }, [preferences.showCharacter]);

  // overlay components
  const NotificationContainer = () => (
    <div className="fixed top-24 right-6 z-[120] space-y-3 w-80 max-w-[calc(100vw-3rem)]">
      {notifications.map((notif, index) => (
        <div key={notif.id} className="relative" style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.06}s both` }}>
          <div
            className={`absolute -inset-2 rounded-2xl blur-xl opacity-50 ${
              notif.type === "success"
                ? "bg-green-600/30"
                : notif.type === "error"
                ? "bg-red-600/30"
                : notif.type === "warning"
                ? "bg-yellow-600/30"
                : "bg-blue-600/30"
            }`}
          />
          <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-xl">{notif.type === "success" ? "✅" : notif.type === "error" ? "❌" : notif.type === "warning" ? "⚠️" : "ℹ️"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white mb-1">{notif.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{notif.message}</p>
              </div>
              <button onClick={() => setNotifications((p) => p.filter((n) => n.id !== notif.id))} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const LiveActivityFeed: React.FC<{ show: boolean }> = ({ show }) => {
    // Load real activity feed from database
    const [activities, setActivities] = useState<VoiceActivity[]>([]);

    useEffect(() => {
      if (!show) return;
      
      // Load initial activities
      const loadActivities = async () => {
        try {
          const recentActivities = await fetchRecentActivities(10);
          setActivities(recentActivities);
        } catch (error) {
          console.error('Failed to load activities:', error);
        }
      };

      void loadActivities();

      // Subscribe to real-time activity updates from Supabase
      const unsubscribe = subscribeToActivities((newActivity) => {
        setActivities((prev) => [newActivity, ...prev].slice(0, 10));
      });

      return () => {
        unsubscribe();
      };
    }, [show]);

    if (!show) return null;
    return (
      <div className="fixed bottom-24 right-6 z-30 w-80 max-w-[calc(100vw-3rem)]">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 rounded-2xl blur-2xl animate-pulse-gentle" />
          <div className="relative bg-black/80 backdrop-blur-xl border border-green-500/30 rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-400">Live Activity</span>
                <button onClick={() => setShowLiveActivity(false)} className="ml-auto text-gray-500 hover:text-white">
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {activities.length === 0 ? (
                  <div className="text-xs text-gray-400">Waiting for activity…</div>
                ) : (
                  activities.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <span className="text-sm">{a.activity_type === "play" ? "▶️" : a.activity_type === "like" ? "❤️" : a.activity_type === "share" ? "🔗" : "💬"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{a.user_pseudonym}</p>
                        <p className="text-[10px] text-gray-500">{Math.floor((Date.now() - new Date(a.created_at).getTime()) / 1000)}s ago</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // ✅ DISABLED: Swipe gestures were annoying users (accidentally opening recording)
  // Users can use the floating button instead
  // const gestures = useMobileGestures(
  //   () => setShowRecordingUI(true),
  //   () => setShowRecordingUI(false)
  // );

  return (
    <div className="relative w-full h-screen max-w-full bg-black overflow-hidden">
      {/* Removed {...gestures} - users found swipe-to-record annoying */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map((star, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`star-${i}`}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        {orbs.map((orb, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`orb-${i}`}
            className="absolute rounded-full blur-3xl opacity-20 animate-float"
            style={{
              left: orb.left,
              top: orb.top,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background:
                i % 3 === 0
                  ? "radial-gradient(circle, rgba(249,115,22,0.6) 0%, transparent 70%)"
                  : i % 3 === 1
                  ? "radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(236,72,153,0.6) 0%, transparent 70%)",
              animationDuration: `${orb.duration}s`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}

        {particles.map((particle, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`particle-${i}`}
            className="absolute rounded-full bg-orange-500 opacity-40 animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full overflow-y-auto">
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            {/* Top Row: Title and Close Button */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-full blur-lg opacity-50 animate-pulse-gentle" />
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">🎙️</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 truncate">
                    {String(t("Voice Stories", { defaultValue: "Voice Stories" }))}
                  </h1>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">{String(t("Share your journey", { defaultValue: "Share your journey" }))}</p>
                </div>
              </div>

              {/* Close Button - Always Visible */}
              <button 
                onClick={closeFeature} 
                className="p-2 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-red-500/20 transition-colors flex-shrink-0 text-base sm:text-lg" 
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Action Buttons Row - Scrollable on Mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
              <button
                onClick={() => setShowLanguageSelector(true)}
                className="group relative px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl transition-all duration-300 flex-shrink-0"
                title="Change Language"
              >
                <div className="relative flex items-center gap-1 sm:gap-2">
                  <span className="text-base sm:text-lg">{SUPPORTED_LANGUAGES[userLanguage].flag}</span>
                  <span className="hidden md:inline text-xs sm:text-sm text-white font-medium whitespace-nowrap">{SUPPORTED_LANGUAGES[userLanguage].nativeName}</span>
                  <span className="inline md:hidden text-[10px] sm:text-xs text-white font-medium">Lang</span>
                </div>
              </button>

              <button 
                onClick={() => setShowAnalytics(true)} 
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-purple-500/20 transition-colors flex-shrink-0 flex items-center gap-1" 
                title="Analytics"
              >
                <span className="text-sm sm:text-base">📊</span>
                <span className="text-[10px] sm:text-xs text-white font-medium md:hidden">Stats</span>
              </button>
              
              <button 
                onClick={() => setShowSearch(true)} 
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-cyan-500/20 transition-colors flex-shrink-0 flex items-center gap-1" 
                title="Search"
              >
                <span className="text-sm sm:text-base">🔍</span>
                <span className="text-[10px] sm:text-xs text-white font-medium md:hidden">Search</span>
              </button>
              
              <button 
                onClick={() => setShowBookmarks(true)} 
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-yellow-500/20 transition-colors flex-shrink-0 flex items-center gap-1" 
                title="Bookmarks"
              >
                <span className="text-sm sm:text-base">🔖</span>
                <span className="text-[10px] sm:text-xs text-white font-medium md:hidden">Saved</span>
              </button>
              
              <button 
                onClick={() => setShowPreferences(true)} 
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl hover:bg-pink-500/20 transition-colors flex-shrink-0 flex items-center gap-1" 
                title="Preferences"
              >
                <span className="text-sm sm:text-base">⚙️</span>
                <span className="text-[10px] sm:text-xs text-white font-medium md:hidden">Settings</span>
              </button>
            </div>

            {/* Filter Tabs - Scrollable on Mobile */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
              {(
                [
                  { key: "for-you", icon: "✨", label: "For You" },
                  { key: "my-language", icon: "🌍", label: "Language" },
                  { key: "trending", icon: "🔥", label: "Trending" },
                  { key: "top-rated", icon: "⭐", label: "Top Rated" },
                  { key: "latest", icon: "🆕", label: "Latest" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold whitespace-nowrap transition-all duration-300 text-xs sm:text-sm flex-shrink-0 ${
                    activeTab === tab.key ? "bg-gradient-to-r from-orange-500/30 to-pink-500/30 border-2 border-orange-500/50 text-white" : "bg-white/5 border-2 border-white/10 text-gray-300 hover:text-white"
                  }`}
                >
                  <span className="mr-1 sm:mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row flex-wrap gap-1.5 sm:gap-2">
              <div className="flex gap-0.5 sm:gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl p-0.5 sm:p-1 w-fit">
                {(["all", "1-3", "3-5", "5+"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDurationFilter(d)}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-300 ${
                      durationFilter === d ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {d === "all" ? "All" : d === "1-3" ? "1-3min" : d === "3-5" ? "3-5min" : "5min+"}
                  </button>
                ))}
              </div>

              <div className="flex gap-0.5 sm:gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl p-0.5 sm:p-1 overflow-x-auto scrollbar-hide w-full sm:w-auto max-w-full">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${selectedCategory === "all" ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" : "text-gray-300 hover:text-white hover:bg-white/5"}`}
                >
                  All
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${selectedCategory === c ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" : "text-gray-300 hover:text-white hover:bg-white/5"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Language selector */}
        {showLanguageSelector && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="relative w-full max-w-2xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-3xl blur-2xl opacity-30 animate-pulse-gentle" />
              <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-3xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-2">🌍</div>
                  <h2 className="text-2xl font-bold text-white">Choose Your Language</h2>
                  <p className="text-sm text-gray-400">Select your preferred language.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => handleLanguageSelect(code as LanguageCode)}
                      className="p-4 bg-white/5 border border-white/10 hover:border-orange-500/40 rounded-xl transition-colors text-left"
                    >
                      <div className="text-3xl">{lang.flag}</div>
                      <div className="text-sm font-semibold text-white">{lang.nativeName}</div>
                      <div className="text-xs text-gray-400">{lang.name}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <Button onClick={() => setShowLanguageSelector(false)} className="w-full">
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Filter Count Display */}
          {filteredMessages.length > 0 && (
            <div className="mb-4 px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="text-sm font-bold text-white">
                      Showing {filteredMessages.length} {filteredMessages.length === 1 ? 'story' : 'stories'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {activeTab === "for-you" && "Personalized for you"}
                      {activeTab === "my-language" && (
                        <>
                          {SUPPORTED_LANGUAGES[userLanguage].nativeName} first, then others
                          {(() => {
                            const myLangCount = filteredMessages.filter(m => {
                              const msgLang = m.language as LanguageCode | undefined;
                              return msgLang && msgLang === userLanguage;
                            }).length;
                            const othersCount = filteredMessages.length - myLangCount;
                            return ` (${myLangCount} ${SUPPORTED_LANGUAGES[userLanguage].nativeName}${othersCount > 0 ? `, ${othersCount} others` : ''})`;
                          })()}
                        </>
                      )}
                      {activeTab === "trending" && "Trending content"}
                      {activeTab === "top-rated" && "Top rated (4+ stars)"}
                      {activeTab === "latest" && "Latest uploads"}
                      {selectedCategory !== "all" && ` • ${selectedCategory}`}
                      {durationFilter !== "all" && ` • ${
                        durationFilter === "1-3" ? "1-3 min" :
                        durationFilter === "3-5" ? "3-5 min" :
                        "5+ min"
                      }`}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {totalFeedCount} total
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4 sm:space-y-6">
            {isForYouLoading && activeTab === "for-you" ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="text-lg font-semibold text-white mb-2">Building your For You feed</h3>
                <p className="text-gray-400">Learning from your recent activity...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎙️</div>
                <h3 className="text-xl font-semibold text-white mb-2">No stories yet</h3>
                <p className="text-gray-400 mb-6">Be the first to share your story!</p>
                <Button onClick={() => setShowRecordingUI(true)}>Start Recording</Button>
              </div>
            ) : (
              filteredMessages.map((msg, index) => (
                <PodcastCard
                  key={msg.id}
                  message={msg}
                  isPlaying={playingId === msg.id}
                  currentTime={currentTime}
                  onPlay={() => void handlePlayMessage(msg)}
                  onLike={(e) => handleLikeWithAnimation(msg.id, e)}
                  onShare={() => handleShareWithAnimation(msg)}
                  onComment={() => handleCommentMessage(msg.id)}
                  onBookmarkToggle={() => toggleBookmark(msg)}
                  isBookmarked={isBookmarked(msg.id)}
                  isLiked={likedMessageIds.has(msg.id)}
                  onDelete={() => setDeleteModalMessage(msg)}
                  userLanguage={userLanguage}
                  index={index}
                  isHighlighted={highlightedMessageId === msg.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Floating record button */}
        {!showRecordingUI && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
            <button onClick={() => setShowRecordingUI(true)} className="group relative">
              <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-full blur-xl sm:blur-2xl opacity-60 animate-pulse-gentle" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl sm:text-2xl text-white">🎙️</span>
              </div>
            </button>
          </div>
        )}

        {/* Character overlay */}
        {preferences.showCharacter && showCharacter && selectedCharacter && (
          <div className="fixed inset-0 z-[90] pointer-events-none flex items-start justify-end p-6">
            <div className="relative pointer-events-auto">
              <button
                onClick={stopPlayback}
                className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-red-500/90 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110"
              >
                <span className="text-white text-lg font-bold">×</span>
              </button>
              <div className="relative w-56 h-56 sm:w-72 sm:h-72">
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse-gentle" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <LottieAnimation
                    animationData={selectedCharacter}
                    loop={true}
                    autoplay={true}
                    className="w-full h-full drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overlays */}
        {/* ✅ Live Activity DISABLED by default - Users feedback: looks fake/spammy */}
        {/* Can be re-enabled later with better UI/UX */}
        <LiveActivityFeed show={showLiveActivity} />
        <NotificationContainer />

        {/* Fun effects (backup parity) */}
        {showParticles && (
          <ParticleExplosion
            x={particlePosition.x}
            y={particlePosition.y}
            onComplete={() => setShowParticles(false)}
          />
        )}
        <ConfettiCannon active={showConfetti} onComplete={() => setShowConfetti(false)} />
        {showSuccess && <SuccessAnimation message={successMessage} onComplete={() => setShowSuccess(false)} />}
        {isLoading && <HolographicLoader />}

        {/* Search (advanced) */}
        {showSearch && (
          <SearchModal
            onClose={() => setShowSearch(false)}
            messages={messages}
            userLanguage={userLanguage}
            playingId={playingId}
            currentTime={currentTime}
            onPlayMessage={(m) => void handlePlayMessage(m)}
            onLike={handleLikeWithAnimation}
            onShare={handleShareWithAnimation}
            onComment={handleCommentMessage}
            onBookmarkToggle={toggleBookmark}
            isBookmarked={isBookmarked}
            onDelete={(m) => setDeleteModalMessage(m)}
          />
        )}

        {/* Bookmarks (folders) */}
        {showBookmarks && (
          <BookmarksModal
            onClose={() => setShowBookmarks(false)}
            bookmarkedMessages={bookmarkedMessages}
            onRemoveBookmark={(id) =>
              setBookmarkedMessages((prev) => prev.filter((m) => m.id !== id))
            }
            userLanguage={userLanguage}
            playingId={playingId}
            currentTime={currentTime}
            onPlayMessage={(m) => void handlePlayMessage(m)}
            onLike={handleLikeWithAnimation}
            onShare={handleShareWithAnimation}
            onComment={handleCommentMessage}
            onBookmarkToggle={toggleBookmark}
            isBookmarked={isBookmarked}
            onDelete={(m) => setDeleteModalMessage(m)}
            onNotify={showNotification}
          />
        )}

        {/* Preferences (expanded) */}
        {showPreferences && (
          <PreferencesModal
            onClose={() => setShowPreferences(false)}
            preferences={preferences}
            onUpdate={(key, value) => {
              setPreferences((p) => ({ ...p, [key]: value }));
              showNotification("success", "Saved", "Preference updated successfully");
            }}
          />
        )}

        {/* Analytics (dashboard) */}
        {showAnalytics && <AnalyticsDashboard onClose={() => setShowAnalytics(false)} messages={messages} />}

        {/* Share / Comment / Delete */}
        {shareModalMessage && (
          <ShareModal
            message={shareModalMessage}
            onClose={() => setShareModalMessage(null)}
            onNotify={showNotification}
            onConfetti={() => setShowConfetti(true)}
            onShare={(messageId) => {
              // Increment share count in database
              void incrementShareCount(messageId);
              
              // Log activity for activity feed
              void logActivity(messageId, 'share');
              
              // Track share conversion if this came from a shared link
              void trackShareConversion('share');
              
              // Update local state
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId ? { ...m, share_count: (m.share_count ?? 0) + 1 } : m
                )
              );
            }}
          />
        )}

        {commentModalMessage && (
          <CommentModal
            message={commentModalMessage}
            onClose={() => setCommentModalMessage(null)}
            onAddComment={(messageId) => {
              // Increment comment count in database
              void incrementCommentCount(messageId);
              
              // Log activity for activity feed
              void logActivity(messageId, 'comment');
              
              // Update local state
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId ? { ...m, comment_count: (m.comment_count ?? 0) + 1 } : m
                )
              );
              showNotification("success", "Comment added", "Your comment has been posted.");
            }}
          />
        )}

        {deleteModalMessage && (
          <DeleteModal
            message={deleteModalMessage}
            onCancel={() => setDeleteModalMessage(null)}
            onConfirm={confirmDeleteMessage}
            onError={handleDeleteError}
          />
        )}

        {/* Recording */}
        {showRecordingUI && (
          <ModalShell
            title={recordingPreview ? "Preview Recording" : recordingState.isRecording ? "Recording Studio" : "Share Your Story"}
            accentClassName="bg-gradient-to-r from-orange-600/30 via-red-600/30 to-pink-600/30"
            onClose={() => {
              stopPreview(); // Stop any playing preview
              if (recordingState.isRecording) {
                stopRecordingAndReset();
              } else {
                setShowRecordingUI(false);
              }
            }}
            maxWidthClassName="sm:max-w-2xl"
          >
            <div className="space-y-6">
              {recordingPreview && !recordingState.isRecording ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Duration</span>
                    <span className={`font-semibold ${
                      recordingState.duration < 30 ? 'text-red-400' : 
                      recordingState.duration > 60 ? 'text-red-400' : 
                      'text-green-400'
                    }`}>
                      {formatDuration(recordingState.duration)}
                      {recordingState.duration < 30 && ' (too short)'}
                      {recordingState.duration > 60 && ' (too long)'}
                    </span>
                  </div>
                  
                  {/* Audio Player Preview */}
                  <div className={`p-4 rounded-2xl transition-all duration-300 ${
                    isPlayingPreview 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50' 
                      : 'bg-white/5 border-2 border-white/10'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{isPlayingPreview ? '🎧' : '🎙️'}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {isPlayingPreview ? 'Playing Preview...' : 'Your Recording'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {isPlayingPreview ? 'Audio is playing' : 'Click Play to listen'}
                          </div>
                        </div>
                      </div>
                      {isPlayingPreview && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-4 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                          <div className="w-1 h-6 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                          <div className="w-1 h-4 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={isPlayingPreview ? stopPreview : playPreview}
                      variant={isPlayingPreview ? "secondary" : "default"}
                      className="w-full"
                    >
                      {isPlayingPreview ? '⏹️ Stop Preview' : '▶️ Play Preview'}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        stopPreview();
                        setRecordingPreview(null);
                        setRecordingState((prev) => ({ ...prev, duration: 0 }));
                        setUploadError(null);
                      }}
                      className="flex-1"
                    >
                      🗑️ Delete & Re-record
                    </Button>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="text-sm font-semibold text-white mb-2">Recording Requirements</div>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={recordingState.duration >= 30 ? 'text-green-400' : 'text-red-400'}>
                          {recordingState.duration >= 30 ? '✓' : '✗'}
                        </span>
                        <span>Minimum: 30 seconds (0:30)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={recordingState.duration <= 60 ? 'text-green-400' : 'text-red-400'}>
                          {recordingState.duration <= 60 ? '✓' : '✗'}
                        </span>
                        <span>Maximum: 60 seconds (1:00)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={recordingState.qualityScore >= 60 ? 'text-green-400' : 'text-yellow-400'}>
                          {recordingState.qualityScore >= 60 ? '✓' : '⚠'}
                        </span>
                        <span>Quality: {recordingState.qualityScore}% • Noise: {recordingState.noiseLevel}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Selector - Smart Selection */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-white">Category</div>
                      {!showCategorySelector && selectedCategory !== "all" && (
                        <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-xs text-green-400 font-semibold">
                          ✓ Auto-selected
                        </div>
                      )}
                    </div>
                    
                    {/* Show selector or auto-selected category */}
                    {showCategorySelector ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setRecordingCategory(cat)}
                              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                recordingCategory === cat
                                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-2 border-orange-400'
                                  : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400">
                          💡 Tip: Browse a category first to auto-select it
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{recordingCategory.split(' ')[0]}</span>
                            <div>
                              <div className="text-sm font-bold text-white">{recordingCategory}</div>
                              <div className="text-xs text-gray-400">Auto-selected from your filter</div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowCategorySelector(true)}
                          className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition-colors font-semibold"
                        >
                          📝 Change Category
                        </button>
                        
                        {/* Show all categories when changing */}
                        {showCategorySelector && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setRecordingCategory(cat);
                                  setShowCategorySelector(false);
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                  recordingCategory === cat
                                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-2 border-orange-400'
                                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                      <span>📱</span>
                      <span>Language: {SUPPORTED_LANGUAGES[userLanguage].nativeName}</span>
                    </div>
                  </div>

                  {uploadError ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                      <div className="text-sm font-semibold text-red-400 mb-1">⚠️ Error</div>
                      <div className="text-xs text-red-300">{uploadError}</div>
                    </div>
                  ) : null}
                  
                  <Button 
                    disabled={uploading || recordingState.duration < 30 || recordingState.duration > 60} 
                    onClick={() => void handleUploadRecording()}
                    className="w-full"
                  >
                    {uploading ? "Uploading..." : 
                     recordingState.duration < 30 ? "Recording too short (min 30s)" :
                     recordingState.duration > 60 ? "Recording too long (max 60s)" :
                     "Upload & Share"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-5xl font-bold text-transparent bg-clip-text tabular-nums ${
                      recordingState.duration < 30 ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400' :
                      recordingState.duration >= 55 ? 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400' :
                      'bg-gradient-to-r from-orange-400 via-red-400 to-pink-400'
                    }`}>
                      {formatDuration(recordingState.duration)}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {recordingState.isPaused ? "Paused" : recordingState.isRecording ? "Recording…" : "Ready"}
                    </div>
                    <div className="text-xs mt-1">
                      {recordingState.duration < 30 ? (
                        <span className="text-yellow-400">Need {30 - recordingState.duration}s more (minimum 30s)</span>
                      ) : recordingState.duration >= 55 ? (
                        <span className="text-orange-400">⚠️ {60 - recordingState.duration}s until auto-stop (max 60s)</span>
                      ) : (
                        <span className="text-green-400">✓ Ready to stop (30-60 seconds)</span>
                      )}
                    </div>
                  </div>

                  {/* Duration Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0:00</span>
                      <span className="text-white font-semibold">Required: 0:30 - 1:00</span>
                      <span>1:00</span>
                    </div>
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                          recordingState.duration < 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          recordingState.duration > 60 ? 'bg-red-500' :
                          'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (recordingState.duration / 60) * 100)}%` }}
                      />
                      {/* 30 second marker */}
                      <div className="absolute top-0 left-[50%] w-0.5 h-full bg-white/50" />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={recordingState.duration >= 30 ? 'text-green-400' : 'text-gray-500'}>
                        ✓ Min: 0:30
                      </span>
                      <span className={recordingState.duration <= 60 ? 'text-green-400' : 'text-red-400'}>
                        ✓ Max: 1:00
                      </span>
                    </div>
                  </div>

                  {showQualityWarning ? (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-sm text-yellow-200">
                      Audio quality warning. Try a quieter environment.
                    </div>
                  ) : null}

                  {!recordingState.isRecording ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs text-blue-200">
                        ℹ️ <strong>Recording Requirements:</strong><br/>
                        • Minimum duration: 30 seconds<br/>
                        • Maximum duration: 60 seconds (1 minute)<br/>
                        • Recording will auto-stop at 60 seconds
                      </div>
                      <Button onClick={() => void startRecording()} className="w-full">Start Recording</Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={recordingState.isPaused ? resumeRecording : pauseRecording}>
                        {recordingState.isPaused ? "Resume" : "Pause"}
                      </Button>
                      <Button 
                        onClick={stopRecording} 
                        disabled={recordingState.duration < 30}
                        title={recordingState.duration < 30 ? "Record at least 30 seconds" : "Stop and preview recording"}
                      >
                        {recordingState.duration < 30 ? `Stop (${30 - recordingState.duration}s more)` : "Stop & Preview"}
                      </Button>
                      <Button variant="secondary" onClick={stopRecordingAndReset}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalShell>
        )}
      </div>
    </div>
  );
};

export default AnonymousVoiceInterface;


