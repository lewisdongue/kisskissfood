import React, { startTransition, useEffect, useRef, useState, useCallback } from "react";
import { useTimer } from "../hooks/useTimer";
import { useViralShare } from "@/hooks/useViralShare";
import VipSharePrompt from "@/components/growth/VipSharePrompt";
import ShareToEarnBanner from "@/components/growth/ShareToEarnBanner";
import { CallControls } from "./CallControls";
import { CallTimerBadge } from "./call/CallTimerBadge";
import { CallCustomizationModal } from "./CallCustomizationModal";
import { useFeatureTrial } from "../hooks/useFeatureTrial";
import { useReferralUnlock } from "../hooks/useReferralUnlock";
import { IncomingFriendRequestModal } from "./IncomingFriendRequestModal";
import { ExchangedEmailsModal } from "./ExchangedEmailsModal";
import { PremiumFiltersModal } from "./PremiumFiltersModal";
import { PremiumConversionModal, type PremiumConversionContext } from "./PremiumConversionModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import globeAnimation from "@/assets/globe.json";
import LottieAnimation from "./LottieAnimation";
import { Button } from "./ui/button";
import { MarketplaceSection } from "./MarketplaceSection";
import { GiftFloatingAnimation } from "./GiftFloatingAnimation";
// import { ChallengeInterface } from "./ChallengeInterface";
import ViralClipEngine from "./ViralClipEngine";

import { useWalletBalance } from "../hooks/useWallet";
import { 
  Mic, 
  MicOff, 
  Copy, 
  Share2, 
  X, 
  Users, 
  Zap, 
  TrendingUp, 
  Heart, 
  Sparkles, 
  Gift, 
  Video,
  VideoOff,
  SwitchCamera,
  Star,
  Filter
} from "lucide-react";
// @ts-ignore
import confetti from "canvas-confetti";

// ============================================================================
// PILIER 1: SINGLE SUPABASE INSTANCE
// ============================================================================
import { supabase, TABLES, RPC_FUNCTIONS, cleanupWaitingUser } from "../config/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { UserGender } from "../types";

//import { createFriendRequest, confirmFriendRequest } from "../services/supabaseService";

import { createFriendRequest, confirmFriendRequest, declineFriendRequest, getReferralCount } from "../services/supabaseService";

// ============================================================================
// CAAKUS P2P WEBRTC ENGINE
// ============================================================================
import { CaakusWebRTCService } from "../services/webrtcService";
import { claimAtomicMatch, heartbeatWaitingUser } from "../services/matchmakingService";
import { preloadModerationModel, startNsfwWatch } from "../services/nsfwModeration";
import ReportButton from "./moderation/ReportButton";
import ModerationBanner from "./moderation/ModerationBanner";
import { haptic } from "../hooks/useWebRTC";
import { playCue } from "../utils/uiSound";
import { isGuestMode, getOrCreateGuestUserId } from "../utils/guestUser";
import { isTouchDevice } from "../utils/deviceDetection";
import { useMemo } from "react";

// ============================================================================
// AUDIO CUES - USER FEEDBACK SOUNDS
// ============================================================================
import { playMatchFoundSound, playConnectionSound } from "../utils/audioCues";

// ============================================================================
// UTILITIES - MULTILINGUAL REMATCH MESSAGES
// ============================================================================

const getRematchMessage = (): string => {
  const browserLang = navigator.language.toLowerCase();
  
  const messages: Record<string, string> = {
    'fr': 'Retrouvailles ! 🔄',
    'fr-fr': 'Retrouvailles ! 🔄',
    'fr-ca': 'Retrouvailles ! 🔄',
    'en': 'Reunion! 🔄',
    'en-us': 'Reunion! 🔄',
    'en-gb': 'Reunion! 🔄',
    'es': '¡Reencuentro! 🔄',
    'de': 'Wiedersehen! 🔄',
    'it': 'Riunione! 🔄',
    'pt': 'Reencontro! 🔄',
    'ru': 'Встреча снова! 🔄',
    'ja': '再会！🔄',
    'zh': '重逢！🔄',
    'ar': 'لقاء مجددا! 🔄',
    'hi': 'फिर से मिलना! 🔄',
  };
  
  if (messages[browserLang]) return messages[browserLang];
  
  const mainLang = browserLang.split('-')[0];
  return messages[mainLang] || 'Reunion! 🔄';
};

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

interface AppTranslations {
  title: string;
  subtitle: string;
  description: string;
  reward: string;
  perFriend: string;
  copyButton: string;
  shareButton: string;
  copied: string;
  shareText: string;
  motivation: string;
  stats: string;
}

interface PopupTranslations {
  title: string;
  subtitle: string;
  callToAction: string;
  step1: string;
  step2: string;
  step3: string;
  shareButton: string;
  laterButton: string;
  urgency: string;
}

const getAppTranslations = (): AppTranslations => {
  const browserLang = typeof navigator !== "undefined" ? navigator.language.toLowerCase().split("-")[0] : "en";

  const translations: Record<string, AppTranslations> = {
    fr: {
      title: "Partagez la Magie",
      subtitle: "Ne parlez plus jamais seul",
      description: "Invitez vos amis et transformez chaque conversation en aventure",
      reward: "+100 Yuyu",
      perFriend: "par ami inscrit",
      copyButton: "Copier le lien magique",
      shareButton: "Partager",
      copied: "Lien copié ! Prêt à conquérir le monde 🚀",
      shareText: "Rejoins-moi sur Caakus - la nouvelle façon de parler au monde entier 🌍✨",
      motivation: "Vos amis vont adorer ❤️",
      stats: "personnes invitées",
    },
    en: {
      title: "Share the Magic",
      subtitle: "Never talk alone again",
      description: "Invite your friends and turn every conversation into an adventure",
      reward: "+100 Yuyu",
      perFriend: "per friend",
      copyButton: "Copy magic link",
      shareButton: "Share",
      copied: "Link copied! Ready to conquer the world 🚀",
      shareText: "Join me on Caakus - the new way to talk to the world 🌍✨",
      motivation: "Your friends will love it ❤️",
      stats: "people invited",
    },
    es: {
      title: "Comparte la Magia",
      subtitle: "Nunca más hables solo",
      description: "Invita a tus amigos y convierte cada conversación en una aventura",
      reward: "+100 Yuyu",
      perFriend: "por amigo",
      copyButton: "Copiar enlace mágico",
      shareButton: "Compartir",
      copied: "¡Enlace copiado! Listo para conquistar el mundo 🚀",
      shareText: "Únete a mí en Caakus - la nueva forma de hablar con el mundo 🌍✨",
      motivation: "Tus amigos lo amarán ❤️",
      stats: "personas invitadas",
    },
    de: {
      title: "Teile die Magie",
      subtitle: "Nie wieder alleine sprechen",
      description: "Lade deine Freunde ein et verwandle jedes Gespräch in ein Abenteuer",
      reward: "+100 Yuyu",
      perFriend: "pro Freund",
      copyButton: "Magischen Link kopieren",
      shareButton: "Teilen",
      copied: "Link kopiert! Bereit, die Welt zu erobern 🚀",
      shareText: "Tritt mir auf Caakus bei - die neue Art, mit der Welt zu sprechen 🌍✨",
      motivation: "Deine Freunde werden es lieben ❤️",
      stats: "Personen eingeladen",
    },
    it: {
      title: "Condividi la Magia",
      subtitle: "Non parlare mai più da solo",
      description: "Invita i tuoi amici e trasforma ogni conversazione in un'avventura",
      reward: "+100 Yuyu",
      perFriend: "per amico",
      copyButton: "Copia link magico",
      shareButton: "Condividi",
      copied: "Link copiato! Pronto a conquistare il mondo 🚀",
      shareText: "Unisciti a me su Caakus - il nuovo modo di parlare con il mondo 🌍✨",
      motivation: "Ai tuoi amici piacerà ❤️",
      stats: "persone invitate",
    },
    pt: {
      title: "Compartilhe a Magia",
      subtitle: "Nunca mais fale sozinho",
      description: "Convide seus amigos e transforme cada conversa em uma aventura",
      reward: "+100 Yuyu",
      perFriend: "por amigo",
      copyButton: "Copiar link mágico",
      shareButton: "Compartilhar",
      copied: "Link copiado! Pronto para conquistar o mundo 🚀",
      shareText: "Junte-se a mim no Caakus - a nova forma de falar com o mundo 🌍✨",
      motivation: "Seus amigos vão adorar ❤️",
      stats: "pessoas convidadas",
    },
  };

  return translations[browserLang] || translations["en"];
};

const getViralMessages = () => getAppTranslations();

const getPopupMessages = (): PopupTranslations => {
  const browserLang = typeof navigator !== "undefined" ? navigator.language.toLowerCase().split("-")[0] : "en";

  const translations: Record<string, PopupTranslations> = {
    fr: {
      title: "🚀 Faisons Grandir Caakus Ensemble !",
      subtitle: "Vous adorez Caakus ? Vos amis aussi vont l'adorer !",
      callToAction: "Partagez avec au moins 8 personnes sur :",
      step1: "📱 WhatsApp, Instagram, TikTok...",
      step2: "🔥 Demandez à chacun de partager avec 8 autres",
      step3: "✨ Créons la plus grande communauté vocale au monde !",
      shareButton: "Partager maintenant",
      laterButton: "Plus tard",
      urgency: "Rejoignez le mouvement viral 🌍",
    },
    en: {
      title: "🚀 Let's Grow Caakus Together!",
      subtitle: "Love Caakus? Your friends will too!",
      callToAction: "Share with at least 8 people on:",
      step1: "📱 WhatsApp, Instagram, TikTok...",
      step2: "🔥 Ask each to share with 8 others",
      step3: "✨ Let's create the world's largest voice community!",
      shareButton: "Share now",
      laterButton: "Later",
      urgency: "Join the viral movement 🌍",
    },
    es: {
      title: "🚀 ¡Hagamos Crecer Caakus Juntos!",
      subtitle: "¿Te encanta Caakus? ¡A tus amigos también les encantará!",
      callToAction: "Comparte con al menos 8 personas en:",
      step1: "📱 WhatsApp, Instagram, TikTok...",
      step2: "🔥 Pide a cada uno que comparta con 8 más",
      step3: "✨ ¡Creemos la comunidad de voz más grande del mundo!",
      shareButton: "Compartir ahora",
      laterButton: "Más tarde",
      urgency: "Únete al movimiento viral 🌍",
    },
    de: {
      title: "🚀 Lass uns Caakus zusammen wachsen!",
      subtitle: "Liebst du Caakus? Deine Freunde werden es auch lieben!",
      callToAction: "Teile mit mindestens 8 Personen auf:",
      step1: "📱 WhatsApp, Instagram, TikTok...",
      step2: "🔥 Bitte jeden, mit 8 weiteren zu teilen",
      step3: "✨ Lass uns die größte Sprach-Community der Welt schaffen!",
      shareButton: "Jetzt teilen",
      laterButton: "Später",
      urgency: "Schließe dich der viralen Bewegung an 🌍",
    },
    it: {
      title: "🚀 Facciamo Crescere Caakus Insieme!",
      subtitle: "Ami Caakus? Anche i tuoi amici lo ameranno!",
      callToAction: "Condividi con almeno 8 persone su:",
      step1: "📱 WhatsApp, Instagram, TikTok...",
      step2: "🔥 Chiedi a ciascuno di condividere con altri 8",
      step3: "✨ Creiamo la più grande comunità vocale del mondo!",
      shareButton: "Condividi ora",
      laterButton: "Più tardi",
      urgency: "Unisciti al movimento virale 🌍",
    },
    pt: {
      title: "🚀 Vamos Fazer o Caakus Crescer Juntos!",
      subtitle: "Adora Caakus? Seus amigos também vão adorar!",
      callToAction: "Compartilhe com pelo menos 8 pessoas em:",
      step1: "📱 WhatsApp, Instagram, TikTok...",
      step2: "🔥 Peça a cada um para compartilhar com mais 8",
      step3: "✨ Vamos criar a maior comunidade de voz do mundo!",
      shareButton: "Compartilhar agora",
      laterButton: "Mais tarde",
      urgency: "Junte-se ao movimento viral 🌍",
    },
  };

  return translations[browserLang] || translations["en"];
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AudioCallProps {
  userId: string;
  onMinutePassed: () => void;
}

interface AudioCallPropsExtended extends AudioCallProps {
  language?: string;
  autoMatch?: boolean;
  userEmail?: string;
  canCustomizeCall?: boolean;
  userGender?: UserGender;
  userCountry?: string;
  userIsPremium?: boolean;
  userPreferredGender?: UserGender | null;
  userPreferredRegions?: string[] | null;
  /** When true, a guest "Start" shows a 2.5s search tease, then calls onAuthRequired. */
  requireAuth?: boolean;
  onAuthRequired?: () => void;
}

interface ExchangedEmailsData {
  myEmail: string;
  peerEmail: string;
}

interface MatchResult {
  room_name: string;
  partner_id: string | null;
  is_rematch: boolean;
  prefetched_next_room: string | null;
  distance_km: number | null;
  partner_rating: number | null;
}


type ConnectionState = "IDLE" | "SEARCHING" | "CONNECTING" | "RECONNECTING" | "CONNECTED" | "ERROR";

interface CallState {
  connectionState: ConnectionState;
  remotePeerId: string | null;
  roomName: string | null;
  isMuted: boolean;
  isCameraOn: boolean;
  isRematch: boolean;
  prefetchedNextRoom: string | null;
  distanceKm: number | null;
  partnerRating: number | null;
  userLatitude: number | null;
  userLongitude: number | null;
  errorMessage: string | null;
  partnerName: string | null;
  partnerIsGuest: boolean;
  partnerIsPremium: boolean; // Track partner's premium status for skip enforcement
}

// ============================================================================
// ============================================================================
// CAAKUS P2P WEBRTC ENGINE (Hetzner TURN + Supabase Realtime signaling)
// The legacy vendor SDK service has been replaced by our own transport.
// The public API is identical, so the call UI below is untouched.
// ============================================================================

const IS_MOBILE_PWA =
  typeof window !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "") &&
  (window.matchMedia?.("(display-mode: standalone)")?.matches || (navigator as any).standalone === true);



// ============================================================================
// MATCHING SERVICE - AVEC POLLING FIFO
// ============================================================================

class RevolutionaryMatchingService {
  private static instance: RevolutionaryMatchingService;

  private constructor() {}

  static getInstance(): RevolutionaryMatchingService {
    if (!RevolutionaryMatchingService.instance) {
      RevolutionaryMatchingService.instance = new RevolutionaryMatchingService();
    }
    return RevolutionaryMatchingService.instance;
  }

  async getMatch(
    userId: string,
    language: string = "en",
    latitude?: number,
    longitude?: number,
    matchTags?: string[],
    gender?: string,
    preferredGender?: string | null,
    preferredRegions?: string[] | null,
    country?: string,
    isPremium?: boolean
  ): Promise<MatchResult | null> {
    // One authoritative path only. The atomic RPC also lets the non-triggering
    // peer recover its recent open room, so no direct match_history read or
    // competing legacy matcher is needed.
    try {
      // Priorité : nouveaux profils > même langue > même pays > FIFO.
      // Le RPC élargit automatiquement si le pool local est vide.
      const atomic = await claimAtomicMatch(userId, language, undefined, country ?? null, true);
      if (atomic?.partner_id && atomic?.room_name) return atomic as MatchResult;
    } catch (error) {
      // Hard ban (8 unique reports) — surface it instead of retrying forever.
      if (String((error as any)?.message ?? "").includes("ACCOUNT_BANNED")) throw error;
      console.warn("Atomic matchmaking attempt failed:", error);
    }
    return null;
  }

  async leaveQueue(userId: string): Promise<void> {
    try {
      await cleanupWaitingUser(userId); // Keep param name as userId for the service method
    } catch (error) {
      console.error("Error leaving queue:", error);
    }
  }

  async getRealtimeStats(): Promise<{
    usersWaiting: number;
    usersInCall: number;
    totalMatchesToday: number;
  }> {
    try {
      const { data, error } = await supabase.rpc(RPC_FUNCTIONS.GET_REALTIME_STATS);

      if (error) throw error;

      return {
        usersWaiting: data?.[0]?.users_waiting || 0,
        usersInCall: data?.[0]?.users_in_call || 0,
        totalMatchesToday: data?.[0]?.total_matches_today || 0,
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return { usersWaiting: 0, usersInCall: 0, totalMatchesToday: 0 };
    }
  }

  async endMatch(userId: string, partnerId: string, durationSeconds: number): Promise<void> {
    try {
      // IMPORTANT:
      // If the DB only inserted a single row (or inserted two rows), we still want to close the open match
      // for BOTH directions to avoid "stale open match" being reused on next Start (looks like cache).
      const { error } = await supabase.rpc("end_match_for_user", {
        p_user_id: userId,
        p_partner_id: partnerId,
        p_duration_seconds: durationSeconds,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error ending match:", error);
    }
  }

  async closeOpenMatchesForUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc("end_match_for_user", {
        p_user_id: userId,
        p_partner_id: null,
        p_duration_seconds: 0,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error closing open matches:", error);
    }
  }
}

// ============================================================================
// VIRAL INVITE COMPONENT
// ============================================================================

const ViralInviteSection: React.FC<{ userId: string }> = ({ userId }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);
  const messages = getViralMessages();

  // Initial fetch + real-time subscription so "people invited" updates live
  useEffect(() => {
    if (!userId) return;

    const fetchInviteCount = async () => {
      try {
        const count = await getReferralCount(userId);
        setInviteCount(count);
      } catch (error) {
        console.error("❌ Error fetching invite count:", error);
      }
    };

    fetchInviteCount();

    const channel = supabase
      .channel(`referrals:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: TABLES.REFERRALS,
          filter: `referrer_id=eq.${userId}`,
        },
        () => {
          setInviteCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Generate real invitation link with user's referral ID (same format as YuyuScore)
  const inviteLink = userId ? `${window.location.origin}?ref=${userId}` : window.location.origin;

  const triggerConfettiExplosion = () => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#A78BFA", "#60A5FA", "#FBBF24", "#F87171", "#34D399"],
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#A78BFA", "#60A5FA", "#FBBF24", "#F87171", "#34D399"],
      });
    }, 250);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);

      triggerConfettiExplosion();

      setCopied(true);
      toast.success(messages.copied, {
        duration: 3000,
        icon: "🚀",
        style: {
          borderRadius: "12px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          fontWeight: "bold",
        },
      });

      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("❌ Copy failed:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Caakus - Talk to the World",
          text: messages.shareText,
          url: inviteLink,
        });

        toast.success("Shared successfully! 🎉");
      } catch (error) {
        console.error("❌ Share failed:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full max-w-[22rem] mx-auto px-2 py-2">
      <div
        className="relative overflow-hidden rounded-3xl transition-all duration-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle violet aura on hover */}
        <div
          className={`absolute -inset-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.25),transparent_70%)] blur-2xl transition-opacity duration-700 ${
            isHovered ? "opacity-100" : "opacity-50"
          }`}
        />

        {/* Glass body — OLED black */}
        <div className="relative rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/10 shadow-[0_24px_80px_-20px_rgba(139,92,246,0.35)]">
          {/* Hairline top glow */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />

          <div className="relative z-10 p-5 space-y-4">
            {/* Header */}
            <div className="text-center space-y-1.5">
              <div className="mx-auto w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-400/30 flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.35)]">
                <Gift className="w-5 h-5 text-violet-300" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                {messages.title}
              </h2>
              <p className="text-sm font-medium text-white/70">
                {messages.subtitle}
              </p>
              <p className="text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
                {messages.description}
              </p>
            </div>

            {/* Reward chip */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-violet-500/40 blur-lg opacity-60 group-hover:opacity-90 transition-opacity" />
                <div className="relative px-5 py-2.5 rounded-2xl bg-black border border-violet-400/40 flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-violet-300" fill="currentColor" />
                  <div className="text-left">
                    <p className="text-base font-extrabold text-white leading-tight">{messages.reward}</p>
                    <p className="text-[10px] font-medium text-violet-300/80 uppercase tracking-wider">{messages.perFriend}</p>
                  </div>
                  <Star className="w-4 h-4 text-violet-300" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Magic link */}
            <div className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-violet-300/80" />
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.14em]">
                  Your Magic Link
                </p>
              </div>
              <p className="text-xs font-mono text-white/70 truncate">
                {inviteLink}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                onClick={handleCopyLink}
                disabled={copied}
                className="flex-1 relative overflow-hidden h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm rounded-xl shadow-[0_10px_30px_-8px_rgba(139,92,246,0.7)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 border border-white/15"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-[1200ms]" />
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {copied ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{messages.copied.split("!")[0]}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{messages.copyButton}</span>
                    </>
                  )}
                </div>
              </Button>

              {typeof navigator !== 'undefined' && !!navigator.share && (
                <Button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none h-11 bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-sm rounded-xl border border-white/15 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-2 px-3">
                    <Share2 className="w-4 h-4 text-violet-300" />
                    <span>{messages.shareButton}</span>
                  </div>
                </Button>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.07]">
              <Badge className="px-2.5 py-1 bg-violet-500/10 text-violet-200 border border-violet-400/30 font-semibold text-xs">
                <Users className="w-3.5 h-3.5 mr-1" />
                {inviteCount} {messages.stats}
              </Badge>
              <p className="text-xs font-medium text-white/40">
                {messages.motivation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VIRAL GROWTH POP-UP
// ============================================================================

interface ViralGrowthPopupProps {
  onClose: () => void;
  userId?: string;
}

const ViralGrowthPopup: React.FC<ViralGrowthPopupProps> = ({ onClose, userId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const messages = getPopupMessages();
  
  // Generate real invitation link with user's referral ID (same format as YuyuScore)
  const inviteLink = userId ? `${window.location.origin}?ref=${userId}` : window.location.origin;

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#A78BFA", "#60A5FA", "#FBBF24", "#F87171", "#34D399"],
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleShare = () => {
    const shareText = `${messages.subtitle} Join me on Caakus: ${inviteLink}`;

    if (navigator.share) {
      navigator.share({
        title: "Caakus",
        text: shareText,
        url: inviteLink,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    handleClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`relative w-full max-w-2xl pointer-events-auto transition-all duration-500 transform ${
            isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 via-pink-500 to-orange-500 opacity-75 blur-xl animate-pulse" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 via-pink-500 to-orange-500 animate-gradient-x opacity-90" />

          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden m-[3px]">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors group"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white overflow-hidden">
              <div className="absolute top-4 left-4 animate-bounce">
                <Zap className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce delay-300">
                <Heart className="w-8 h-8 text-pink-300 drop-shadow-lg" fill="currentColor" />
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-3xl sm:text-4xl font-black drop-shadow-lg">{messages.title}</h2>
                <p className="text-xl font-semibold text-white/90">{messages.subtitle}</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {messages.callToAction}
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <p className="text-left font-semibold text-gray-700 dark:text-gray-300">
                      {messages.step1}
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <p className="text-left font-semibold text-gray-700 dark:text-gray-300">
                      {messages.step2}
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <p className="text-left font-semibold text-gray-700 dark:text-gray-300">
                      {messages.step3}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-lg">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-6 h-6 text-white animate-bounce" />
                  <p className="text-white font-black text-lg drop-shadow-md">{messages.urgency}</p>
                  <TrendingUp className="w-6 h-6 text-white animate-bounce" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleShare}
                  className="flex-1 h-14 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  {messages.shareButton}
                </Button>

                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 sm:flex-none h-14 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-300"
                >
                  {messages.laterButton}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </>
  );
};

// ============================================================================
// HOOK FOR VIRAL POP-UP TIMING — Max 1 time per day
// ============================================================================

const STORAGE_KEY = "caakus_viral_popup_daily";
const MAX_SHOWS_PER_DAY = 1;
const FIRST_SHOW_DELAY = 2 * 60 * 1000; // 2 min before first show

const getTodayKey = () => new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

const useViralPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    const today = getTodayKey();

    let data: { date: string; count: number; lastShownAt: number };
    try {
      data = stored ? JSON.parse(stored) : { date: today, count: 0, lastShownAt: 0 };
    } catch {
      data = { date: today, count: 0, lastShownAt: 0 };
    }

    // Reset count if new day
    if (data.date !== today) {
      data = { date: today, count: 0, lastShownAt: 0 };
    }

    if (data.count >= MAX_SHOWS_PER_DAY) return;

    if (data.count === 0) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, FIRST_SHOW_DELAY);
      return () => clearTimeout(timer);
    }
    return;
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    const today = getTodayKey();
    let data: { date: string; count: number; lastShownAt: number };
    try {
      data = stored ? JSON.parse(stored) : { date: today, count: 0, lastShownAt: 0 };
    } catch {
      data = { date: today, count: 0, lastShownAt: 0 };
    }
    if (data.date !== today) data = { date: today, count: 0, lastShownAt: 0 };
    data.count = Math.min(data.count + 1, MAX_SHOWS_PER_DAY);
    data.lastShownAt = now;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  return { showPopup, handleClosePopup };
};

// ============================================================================
// MAIN COMPONENT - AVEC FIX TRANSITION UI
// ============================================================================

export const AudioCall: React.FC<AudioCallPropsExtended> = ({
  userId,
  onMinutePassed,
  language = "en",
  autoMatch = false,
  userEmail,
  canCustomizeCall = false,
  userGender = 'prefer_not_to_say',
  userCountry,
  userIsPremium = false,
  userPreferredGender,
  userPreferredRegions,
  requireAuth = false,
  onAuthRequired,
}) => {
  const { t } = useTranslation();
  const callTimer = useTimer(onMinutePassed);
  const { start, stop, reset, getSeconds } = callTimer;

  const rtcService = useRef(CaakusWebRTCService.getInstance());
  const matchingService = useRef(RevolutionaryMatchingService.getInstance());

  // Lazy guest user ID - only created when call is started without login
  const effectiveUserId = useMemo(() => {
    if (userId && userId !== "guest") {
      // Authenticated user
      return userId;
    }
    // No authenticated user - create guest ID on-demand
    console.log('🎭 Creating guest user for call session');
    return getOrCreateGuestUserId();
  }, [userId]);
  
  // Check if current user is in guest mode
  const isGuestUser = !userEmail || userId === "guest" || effectiveUserId !== userId;
  const hasReferralPremium = useReferralUnlock(isGuestUser ? null : userId);
  const hasPremiumAccess = userIsPremium || hasReferralPremium;

  // One-time VIP share offer, counted from real completed sessions.
  const viralShare = useViralShare(isGuestUser ? null : userId);
  const recordMatchRef = useRef(viralShare.recordMatch);
  recordMatchRef.current = viralShare.recordMatch;
  
  // State for microphone permission
  const [micPermissionStatus, setMicPermissionStatus] = useState<'pending' | 'granted' | 'denied' | null>(null);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<'pending' | 'granted' | 'denied' | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isRearCamera, setIsRearCamera] = useState(false);
  const [switchingCamera, setSwitchingCamera] = useState(false);
  const [remoteVideoActive, setRemoteVideoActive] = useState(false);
  const remoteVideoWasActiveRef = useRef(false); // track if remote video was ever active this session
  const [networkQuality, setNetworkQuality] = useState<{ uplink: number; downlink: number } | null>(null);
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const criticalQualityStreakRef = useRef(0);
  const goodQualityStreakRef = useRef(0);
  const autoVideoDisabledRef = useRef(false);
  const autoVideoToggleInProgressRef = useRef(false);
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const moderationRef = useRef<{ stop: () => void } | null>(null);
  const moderationRemoteRef = useRef<{ stop: () => void } | null>(null);
  const [moderationWarning, setModerationWarning] = useState(false);
  const [moderationBlackout, setModerationBlackout] = useState(false);
  const [moderationNotice, setModerationNotice] = useState<string | null>(null);

  // ── REAL-TIME AI MODERATION (NSFWJS, 100% on-device, zero server cost) ──
  useEffect(() => {
    preloadModerationModel();
  }, []);

  const remoteVideoRef = useRef<HTMLDivElement | null>(null);

  const [callState, setCallState] = useState<CallState>({
    connectionState: "IDLE",
    remotePeerId: null,
    roomName: null,
    isMuted: false,
    isCameraOn: true,
    isRematch: false,
    prefetchedNextRoom: null,
    distanceKm: null,
    partnerRating: null,
    userLatitude: null,
    userLongitude: null,
    errorMessage: null,
    partnerName: null,
    partnerIsGuest: false,
    partnerIsPremium: false,
  });

  const filtersUnlockedRef = useRef<boolean>(false);
  const [showCustomization, setShowCustomization] = useState(false);
  // 15-minute free trial of Filters & Customize for guests and free accounts.
  const featureTrial = useFeatureTrial(hasPremiumAccess);
  const { trialActive, startTrial } = featureTrial;
  const filtersUnlocked = hasPremiumAccess || trialActive;
  filtersUnlockedRef.current = filtersUnlocked;
  const [matchTags, setMatchTags] = useState<string[]>([]);
  const [savingMatchTags, setSavingMatchTags] = useState(false);
  
  // Premium filters modal state
  const [showPremiumFilters, setShowPremiumFilters] = useState(false);
  const [savingPremiumFilters, setSavingPremiumFilters] = useState(false);
  // Frustration-driven premium conversion modal (free user tried Pro feature)
  const [showPremiumConversion, setShowPremiumConversion] = useState(false);
  const [premiumConversionContext, setPremiumConversionContext] = useState<PremiumConversionContext>("filter_gender");
  const skipTimestampsRef = useRef<number[]>([]);
  const SKIP_LIMIT_PER_MINUTE = 10;
  const SKIP_WINDOW_MS = 60_000;

  const [stats, setStats] = useState({
    usersWaiting: 0,
    usersInCall: 0,
    totalMatchesToday: 0,
  });

  const [friendRequests, setFriendRequests] = useState({
    incoming: false,
    peerEmail: null as string | null,
    exchangedEmails: null as ExchangedEmailsData | null,
  });
  const incomingFriendRequestIdRef = useRef<string | null>(null);
  const friendRequestChannelRef = useRef<RealtimeChannel | null>(null);

  // Gift animation state (sent)
  const [showGiftAnimation, setShowGiftAnimation] = useState(false);
  const [giftAnimationItem, setGiftAnimationItem] = useState<string>("");
  // Gift animation state (received)
  const [showReceivedGiftPopup, setShowReceivedGiftPopup] = useState(false);
  const [receivedGiftItem, setReceivedGiftItem] = useState<string>("");
  const [receivedGiftSender, setReceivedGiftSender] = useState<string>("");
  const [receivedGiftAmount, setReceivedGiftAmount] = useState<number>(0);
  const [receivedGiftMessage, setReceivedGiftMessage] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("caakus_call_tags");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMatchTags(parsed.filter((tag) => typeof tag === "string"));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    (window as any).__caakusCallScreenActive = true;
    return () => {
      (window as any).__caakusCallScreenActive = false;
    };
  }, []);

  // USD wallet (displayed in call section): when balance goes up → show gift received animation
  const { data: walletData } = useWalletBalance();
  const usdBalance = walletData?.balance ?? 0;
  const lastUsdBalanceRef = useRef<number | null>(null);
  const lastShownGiftIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (userId === "guest" || !userId) return;
    if (lastUsdBalanceRef.current === null) {
      lastUsdBalanceRef.current = usdBalance;
      return;
    }
    const prev = lastUsdBalanceRef.current;
    lastUsdBalanceRef.current = usdBalance;
    const delta = usdBalance - prev;
    if (delta < 0.01) return;

    const showGiftReceived = async () => {
      try {
        const { data: rows } = await supabase
          .from("gifts")
          .select("id, from_user_id, amount, item_name, message, created_at, status")
          .eq("to_user_id", userId)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1);
        const gift = rows?.[0] as { id: string; from_user_id: string; amount: number; item_name: string; message?: string | null; created_at: string } | undefined;
        if (!gift || (lastShownGiftIdRef.current && lastShownGiftIdRef.current === gift.id)) return;
        const createdAt = Date.parse(gift.created_at || "");
        if (!Number.isFinite(createdAt) || Date.now() - createdAt > 2 * 60 * 1000) return;

        lastShownGiftIdRef.current = gift.id;
        let senderName = "Someone";
        if (gift.from_user_id) {
          const { data: userRow } = await supabase.from("users").select("name").eq("id", gift.from_user_id).maybeSingle();
          if (userRow?.name) senderName = userRow.name;
        }

        setReceivedGiftItem(gift.item_name || "Gift");
        setReceivedGiftSender(senderName);
        setReceivedGiftAmount(Number(gift.amount) || 0);
        setReceivedGiftMessage(gift.message || "");
        setShowReceivedGiftPopup(true);
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#ff0080", "#ff8800", "#ffdd00", "#8800ff", "#0088ff"] });
      } catch (_) {}
    };
    showGiftReceived();
  }, [usdBalance, userId]);

  const isSearchingRef = useRef(false);
  const matchStartTimeRef = useRef<number>(0);
  const searchTimeoutRef = useRef<any>(null);
  const pollingIntervalRef = useRef<any>(null);
  const pollingInFlightRef = useRef(false);
  const pollingErrorCountRef = useRef<number>(0);
  // Silent-retry hook used when a search times out or errors (never shows an error toast).
  const retrySearchRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const matchHistoryChannelRef = useRef<RealtimeChannel | null>(null);
  // Realtime broadcast channel scoped to the active call room, used to signal "partner pressed next"
  const callSignalChannelRef = useRef<RealtimeChannel | null>(null);
  // Ghost-connection watchdog: if we're CONNECTING too long without being CONNECTED, go back to SEARCHING
  const connectingWatchdogRef = useRef<number | null>(null);
  // Stable ref to findAndConnect — lets the callSignal useEffect call it without a hoisting issue
  const findAndConnectRef = useRef<() => Promise<void>>(() => Promise.resolve());
  // Stable ref to cleanupSearch — same hoisting workaround
  const cleanupSearchRef = useRef<(reason: 'timeout' | 'error' | 'user-cancelled' | 'success') => Promise<void>>(() => Promise.resolve());
  const callStateRef = useRef<CallState>({
    connectionState: "IDLE",
    remotePeerId: null,
    roomName: null,
    isMuted: false,
    isCameraOn: true,
    isRematch: false,
    prefetchedNextRoom: null,
    distanceKm: null,
    partnerRating: null,
    userLatitude: null,
    userLongitude: null,
    errorMessage: null,
    partnerName: null,
    partnerIsGuest: false,
    partnerIsPremium: false,
  });
  const activeMatchRef = useRef<{ roomName: string; partnerId: string } | null>(null);
  // In React dev StrictMode, components can mount/unmount quickly; delay destructive cleanup
  // so we don't kill an in-flight join while the component immediately remounts.
  const delayedUnmountCleanupRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectInProgressRef = useRef(false);

  const isConnected = callState.connectionState === "CONNECTED";

  // PRECISION MODERATION — explicit genital exposure or blood only, at >= 99%
  // for more than one consecutive second. Anything else is ignored; audio is
  // never touched. On a confirmed violation: instant blackout + match ended.
  const endMatchForModeration = useCallback(() => {
    setModerationBlackout(true);
    setModerationNotice("Inappropriate content detected. Match ended.");
    moderationRef.current?.stop();
    moderationRef.current = null;
    moderationRemoteRef.current?.stop();
    moderationRemoteRef.current = null;
    void rtcService.current.leaveChannel();
    setCallState((prev) => ({ ...prev, connectionState: "IDLE", remotePeerId: null, roomName: null }));
    window.setTimeout(() => setModerationBlackout(false), 900);
    window.setTimeout(() => setModerationNotice(null), 5000);
  }, []);

  useEffect(() => {
    if (!isConnected) {
      moderationRef.current?.stop();
      moderationRef.current = null;
      moderationRemoteRef.current?.stop();
      moderationRemoteRef.current = null;
      return;
    }
    const localEl = localVideoRef.current?.querySelector<HTMLVideoElement>("video[data-caakus-rtc]");
    const remoteEl = remoteVideoRef.current?.querySelector<HTMLVideoElement>("video[data-caakus-rtc]");
    if (localEl) {
      moderationRef.current = startNsfwWatch(localEl, {
        userId: effectiveUserId,
        roomName: callState.roomName,
        subject: "local",
        onViolation: () => endMatchForModeration(),
      });
    }
    if (remoteEl) {
      moderationRemoteRef.current = startNsfwWatch(remoteEl, {
        userId: callState.remotePeerId || effectiveUserId,
        roomName: callState.roomName,
        subject: "remote",
        onViolation: () => endMatchForModeration(),
      });
    }
    return () => {
      moderationRef.current?.stop();
      moderationRef.current = null;
      moderationRemoteRef.current?.stop();
      moderationRemoteRef.current = null;
      setModerationWarning(false);
    };
  }, [isConnected, effectiveUserId, callState.roomName, callState.remotePeerId, endMatchForModeration]);

  const isSearching = callState.connectionState === "SEARCHING";
  const isReconnecting = callState.connectionState === "RECONNECTING";
  const isConnecting = callState.connectionState === "CONNECTING" || isReconnecting;
  const showInCallActionOverlays = isConnected && !!callState.remotePeerId;
  const isStartState = callState.connectionState === "IDLE" || callState.connectionState === "ERROR";
  const [mobileActionBusy, setMobileActionBusy] = useState(false);
  const networkReason = useMemo(() => {
    if (!networkQuality) return null;
    const worst = Math.max(networkQuality.uplink, networkQuality.downlink);
    if (worst >= 6) return "Very unstable";
    return null;
  }, [networkQuality]);
  const networkHint = useMemo(() => {
    if (!networkQuality) return null;
    const uplinkPoor = networkQuality.uplink >= 6;
    const downlinkPoor = networkQuality.downlink >= 6;
    if (uplinkPoor && downlinkPoor) return "Upload and download weak";
    if (uplinkPoor) return "Upload weak";
    if (downlinkPoor) return "Download weak";
    return null;
  }, [networkQuality]);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    rtcService.current.attachLocalVideo(localVideoRef.current);
    rtcService.current.attachRemoteVideo(remoteVideoRef.current);
  }, []);

  useEffect(() => {
    const handleQuality = (stats: any) => {
      const uplink = typeof stats?.uplinkNetworkQuality === "number" ? stats.uplinkNetworkQuality : 0;
      const downlink = typeof stats?.downlinkNetworkQuality === "number" ? stats.downlinkNetworkQuality : 0;
      setNetworkQuality({ uplink, downlink });
      void rtcService.current.applyNetworkQuality(uplink, downlink);

      const cs = callStateRef.current;
      if (cs.connectionState !== "CONNECTED") {
        criticalQualityStreakRef.current = 0;
        goodQualityStreakRef.current = 0;
        setShowNetworkWarning(false);
        return;
      }

      // The camera is NEVER cut automatically: the encoder simply lowers its
      // resolution/bitrate. The warning only appears after a prolonged
      // critical degradation (6 consecutive samples ≈ 12s), never on a micro
      // network fluctuation.
      const worst = Math.max(uplink, downlink);
      if (worst >= 6) {
        criticalQualityStreakRef.current += 1;
        goodQualityStreakRef.current = 0;
        if (criticalQualityStreakRef.current >= 6) setShowNetworkWarning(true);
      } else {
        criticalQualityStreakRef.current = 0;
        goodQualityStreakRef.current += 1;
        if (goodQualityStreakRef.current >= 1) setShowNetworkWarning(false);
      }
    };

    rtcService.current.setNetworkQualityHandler(handleQuality);
    return () => {
      rtcService.current.setNetworkQualityHandler(null);
    };
  }, []);

  useEffect(() => {
    rtcService.current.attachLocalVideo(localVideoRef.current);
  }, [isConnected, isSearching, isConnecting, callState.isCameraOn]);

  useEffect(() => {
    if (isConnected) {
      rtcService.current.attachRemoteVideo(remoteVideoRef.current);
    }
  }, [isConnected]);

  // Track whether remote video was ever active during this call (for buffering placeholder)
  useEffect(() => {
    if (remoteVideoActive) {
      remoteVideoWasActiveRef.current = true;
    }
  }, [remoteVideoActive]);
  // Reset when call ends
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      remoteVideoWasActiveRef.current = false;
    }
  }, [isConnected, isConnecting]);

  // ============================================================================
  // EPHEMERAL PROFILE PHOTO (NO PERMANENT STORAGE)
  // ============================================================================

  const photoChannelRef = useRef<RealtimeChannel | null>(null);
  const photoExpireTimerRef = useRef<number | null>(null);

  const [incomingPhotoRequestFrom, setIncomingPhotoRequestFrom] = useState<string | null>(null);
  const [ephemeralPhoto, setEphemeralPhoto] = useState<{
    fromUserId: string;
    dataUrl: string;
    expiresAt: number;
  } | null>(null);
  const [photoSecondsLeft, setPhotoSecondsLeft] = useState<number>(0);
  const photoTickRef = useRef<number | null>(null);

  const clearEphemeralPhoto = useCallback(() => {
    if (photoExpireTimerRef.current) {
      clearTimeout(photoExpireTimerRef.current);
      photoExpireTimerRef.current = null;
    }
    if (photoTickRef.current) {
      clearInterval(photoTickRef.current);
      photoTickRef.current = null;
    }
    setEphemeralPhoto(null);
    setPhotoSecondsLeft(0);
  }, []);

  const scheduleEphemeralPhotoExpiry = useCallback((expiresAt: number) => {
    if (photoExpireTimerRef.current) {
      clearTimeout(photoExpireTimerRef.current);
      photoExpireTimerRef.current = null;
    }
    const ms = Math.max(0, expiresAt - Date.now());
    photoExpireTimerRef.current = window.setTimeout(() => {
      clearEphemeralPhoto();
    }, ms);

    // Smooth countdown UI
    if (photoTickRef.current) {
      clearInterval(photoTickRef.current);
      photoTickRef.current = null;
    }
    const update = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setPhotoSecondsLeft(left);
      if (left <= 0 && photoTickRef.current) {
        clearInterval(photoTickRef.current);
        photoTickRef.current = null;
      }
    };
    update();
    photoTickRef.current = window.setInterval(update, 250);
  }, [clearEphemeralPhoto]);

  const fileToEphemeralDataUrl = useCallback(async (file: File): Promise<string> => {
    // Keep payload small so realtime broadcast is reliable.
    // We'll resize to max 720px and JPEG compress.
    const maxDim = 720;
    const quality = 0.72;

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Failed to load image"));
      i.src = URL.createObjectURL(file);
    });

    try {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      return dataUrl;
    } finally {
      try {
        URL.revokeObjectURL(img.src);
      } catch {}
    }
  }, []);

  // Realtime channel scoped to the room for ephemeral photo exchange
  useEffect(() => {
    if (!callState.roomName) return;

    // reset any prior channel
    if (photoChannelRef.current) {
      supabase.removeChannel(photoChannelRef.current);
      photoChannelRef.current = null;
    }

    const channel = supabase.channel(`ephemeral-photo:${callState.roomName}`, {
      config: { broadcast: { ack: false } },
    });

    channel.on("broadcast", { event: "photo_request" }, ({ payload }) => {
      const from = String(payload?.fromUserId || "");
      const to = String(payload?.toUserId || "");
      if (!from || !to) return;
      if (to !== effectiveUserId) return;

      setIncomingPhotoRequestFrom(from);
      toast("📷 Someone requested your profile photo", { duration: 4000 });
    });

    channel.on("broadcast", { event: "photo_share" }, ({ payload }) => {
      const from = String(payload?.fromUserId || "");
      const to = String(payload?.toUserId || "");
      const dataUrl = String(payload?.dataUrl || "");
      if (!from || !to || !dataUrl) return;
      if (to !== effectiveUserId) return;

      const expiresAt = Date.now() + 60_000;
      setEphemeralPhoto({ fromUserId: from, dataUrl, expiresAt });
      scheduleEphemeralPhotoExpiry(expiresAt);
      toast.success("📸 Photo received", { duration: 2500 });
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // ok
      }
    });

    photoChannelRef.current = channel;

    return () => {
      if (photoChannelRef.current) {
        supabase.removeChannel(photoChannelRef.current);
        photoChannelRef.current = null;
      }
    };
  }, [callState.roomName, effectiveUserId, scheduleEphemeralPhotoExpiry]);

  // ============================================================================
  // CALL SIGNAL CHANNEL - "partner pressed next" broadcast
  // ============================================================================

  // Subscribe to the call-signal channel for the current room.
  // When partner broadcasts "partner_pressed_next", we automatically start searching
  // so both users move forward simultaneously instead of one being stuck on IDLE.
  useEffect(() => {
    if (!callState.roomName) {
      if (callSignalChannelRef.current) {
        supabase.removeChannel(callSignalChannelRef.current);
        callSignalChannelRef.current = null;
      }
      return;
    }

    if (callSignalChannelRef.current) {
      supabase.removeChannel(callSignalChannelRef.current);
      callSignalChannelRef.current = null;
    }

    const channel = supabase.channel(`call-signal:${callState.roomName}`, {
      config: { broadcast: { ack: false } },
    });

    channel.on("broadcast", { event: "partner_pressed_next" }, ({ payload }) => {
      const fromId = String(payload?.fromUserId || "");
      if (!fromId || fromId === effectiveUserId) return; // ignore self-echo

      const cs = callStateRef.current;
      // Only react if we're still in a call (CONNECTED/CONNECTING/RECONNECTING)
      if (
        cs.connectionState !== "CONNECTED" &&
        cs.connectionState !== "CONNECTING" &&
        cs.connectionState !== "RECONNECTING"
      ) return;

      console.log("📡 Partner pressed Next — auto-searching for new match");

      // Immediately leave and search without waiting for user action
      const autoFindNext = async () => {
        try {
          const partnerId = cs.remotePeerId;
          // End the match in DB
          if (partnerId) {
            matchingService.current.endMatch(effectiveUserId, partnerId, 0).catch(() => {});
          }
          stop();
          reset();
          // Full cleanup so isSearchingRef is cleared before findAndConnect
          await cleanupSearchRef.current('user-cancelled');
          await rtcService.current.leaveChannel();
          if (isMountedRef.current) {
            await findAndConnectRef.current();
          }
        } catch (err) {
          console.error("Auto-next error:", err);
          if (isMountedRef.current) {
            await findAndConnectRef.current();
          }
        }
      };
      void autoFindNext();
    });

    channel.subscribe();
    callSignalChannelRef.current = channel;

    return () => {
      if (callSignalChannelRef.current) {
        supabase.removeChannel(callSignalChannelRef.current);
        callSignalChannelRef.current = null;
      }
    };
  }, [callState.roomName, effectiveUserId, stop, reset]);

  const requestProfilePhoto = useCallback(async () => {
    if (!callState.roomName || !callState.remotePeerId) return;
    if (!photoChannelRef.current) return;

    // Send request to the current peer only
    await photoChannelRef.current.send({
      type: "broadcast",
      event: "photo_request",
      payload: {
        fromUserId: effectiveUserId,
        toUserId: callState.remotePeerId,
        ts: Date.now(),
      },
    });
    toast("📷 Photo request sent", { duration: 2000 });
  }, [callState.roomName, callState.remotePeerId, effectiveUserId]);

  const declinePhotoRequest = useCallback(() => {
    setIncomingPhotoRequestFrom(null);
  }, []);

  const sharePhotoToRequester = useCallback(async (file: File) => {
    if (!incomingPhotoRequestFrom) return;
    if (!photoChannelRef.current) return;

    const dataUrl = await fileToEphemeralDataUrl(file);

    await photoChannelRef.current.send({
      type: "broadcast",
      event: "photo_share",
      payload: {
        fromUserId: effectiveUserId,
        toUserId: incomingPhotoRequestFrom,
        dataUrl,
        ts: Date.now(),
      },
    });

    setIncomingPhotoRequestFrom(null);
    toast.success("📤 Photo shared (expires in 1 min)", { duration: 2500 });
  }, [incomingPhotoRequestFrom, effectiveUserId, fileToEphemeralDataUrl]);

  // ============================================================================
  // GÉOLOCALISATION - OPTIMIZED FOR SPEED
  // ============================================================================

  const getUserGeolocation = useCallback(async (): Promise<{ lat: number; lon: number } | null> => {
    try {
      if (!navigator.geolocation) {
        return null;
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          () => {
            resolve(null);
          },
          {
            timeout: 2000, // ⚡ REDUCED: 2s instead of 5s for faster matching
            maximumAge: 600000, // 10 minutes cache
          }
        );
      });
    } catch (error) {
      console.error("Geolocation error:", error);
      return null;
    }
  }, []);

  // ============================================================================
  // CLEANUP HELPER - CENTRALIZED FOR RACE CONDITION PREVENTION
  // ============================================================================

  const cleanupSearch = useCallback(async (reason: 'timeout' | 'error' | 'user-cancelled' | 'success') => {
    console.log(`🧹 Cleanup search - Reason: ${reason}`);
    
    // Clear all intervals and timeouts
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingInFlightRef.current = false;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Clear connecting watchdog if running
    if (connectingWatchdogRef.current) {
      clearTimeout(connectingWatchdogRef.current);
      connectingWatchdogRef.current = null;
    }
    
    // Reset search flag atomically
    isSearchingRef.current = false;
    
    // Reset error counter
    pollingErrorCountRef.current = 0;

    // Stop realtime match listener
    if (matchHistoryChannelRef.current) {
      supabase.removeChannel(matchHistoryChannelRef.current);
      matchHistoryChannelRef.current = null;
    }

    // Clear any latched match so a new search can proceed cleanly
    activeMatchRef.current = null;
    
    // Remove from database queue (unless success - already matched)
    if (reason !== 'success' && isMountedRef.current) {
      try {
        await matchingService.current.leaveQueue(effectiveUserId);
      } catch (error) {
        console.error('Error leaving queue:', error);
      }
    }
  }, [effectiveUserId]);

  // ============================================================================
  // PRE-FETCHING
  // ============================================================================

  const preFetchNextMatch = useCallback(async () => {
    try {
      await supabase.rpc(RPC_FUNCTIONS.PREFETCH_NEXT_MATCH, {
        p_user_id: effectiveUserId,
        p_language: language,
      });
    } catch (error) {
      // Non-critical error, silently fail
    }
  }, [effectiveUserId, language]);

  const saveMatchTags = useCallback(
    async (tags: string[]) => {
      setSavingMatchTags(true);
      setMatchTags(tags);
      try {
        localStorage.setItem("caakus_call_tags", JSON.stringify(tags));
      } catch {
        // ignore storage errors
      }

      if (!isGuestUser && filtersUnlockedRef.current) {
        const { error } = await supabase
          .from(TABLES.USERS)
          .update({ match_tags: tags })
          .eq("id", effectiveUserId);
        if (error) {
          console.warn("Failed to save match tags:", error);
        }
      }

      setSavingMatchTags(false);
    },
    [canCustomizeCall, effectiveUserId, isGuestUser]
  );

  // ============================================================================
  // PREMIUM FILTERS SAVE HANDLER
  // ============================================================================
  const handlePremiumFiltersSave = useCallback(
    async (filters: { 
      gender?: any; 
      preferredGender?: any; 
      preferredRegions?: string[] | null 
    }) => {
      if (!filtersUnlockedRef.current) {
        toast.error("Premium filters are only available for premium users");
        return;
      }

      setSavingPremiumFilters(true);

      if (isGuestUser) {
        try {
          localStorage.setItem("caakus_call_filters", JSON.stringify(filters));
        } catch {
          /* ignore */
        }
        toast.success("Filters saved! They apply to your next match.");
        setShowPremiumFilters(false);
        setSavingPremiumFilters(false);
        return;
      }

      try {
        const { error } = await supabase
          .from(TABLES.USERS)
          .update({
            gender: filters.gender,
            preferred_gender: filters.preferredGender,
            preferred_regions: filters.preferredRegions,
          })
          .eq("id", effectiveUserId);

        if (error) {
          console.error("Error saving premium filters:", error);
          toast.error("Failed to save filters");
        } else {
          toast.success("Premium filters saved! They will apply to your next match.");
          setShowPremiumFilters(false);
          
        }
      } catch (err) {
        console.error("Exception saving premium filters:", err);
        toast.error("Failed to save filters");
      }

      setSavingPremiumFilters(false);
    },
    [effectiveUserId, isGuestUser, userIsPremium]
  );

  // ============================================================================
  // MICROPHONE PERMISSION - REMOVED DUPLICATE REQUEST
  // ⚡ OPTIMIZATION: WebRTC engine will handle mic permission directly
  // This eliminates duplicate permission popups and speeds up connection
  // ============================================================================

  // ============================================================================
  // PEER DISCONNECTION
  // ============================================================================

  const resetReconnectState = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    reconnectInProgressRef.current = false;
  }, []);

  const handlePeerDisconnected = useCallback(async () => {
    resetReconnectState();
    // Use the ref to avoid stale closure — the state may have already updated
    const partnerId = callStateRef.current.remotePeerId;
    if (partnerId) {
      await matchingService.current.endMatch(effectiveUserId, partnerId, getSeconds() || 0);
    }

    // Always leave the P2P channel on peer disconnect
    await rtcService.current.leaveChannel();
    setRemoteVideoActive(false);

    // Clear any residual polling/queue state (safe even if not searching)
    await cleanupSearch('user-cancelled');

    stop();

    setCallState((prev) => ({
      connectionState: "IDLE",
      remotePeerId: null,
      roomName: null,
      isMuted: false,
      isCameraOn: prev.isCameraOn,
      isRematch: false,
      prefetchedNextRoom: null,
      distanceKm: null,
      partnerRating: null,
      userLatitude: prev.userLatitude,
      userLongitude: prev.userLongitude,
      errorMessage: null,
      partnerName: null,
      partnerIsGuest: false,
      partnerIsPremium: false,
    }));

  }, [effectiveUserId, stop, t, cleanupSearch, resetReconnectState]);

  const attemptReconnect = useCallback(async (reason?: string) => {
    const cs = callStateRef.current;
    if (!cs.roomName || !cs.remotePeerId) return;
    if (cs.connectionState === "IDLE" || cs.connectionState === "SEARCHING") return;
    if (reconnectInProgressRef.current) return;

    if (reconnectAttemptsRef.current >= 5) {
      toast.error("Connection lost. Please try again.");
      handlePeerDisconnected();
      return;
    }

    reconnectInProgressRef.current = true;
    reconnectAttemptsRef.current += 1;
    setCallState((prev) => ({
      ...prev,
      connectionState: "RECONNECTING",
      errorMessage: null,
    }));

    const joined = await rtcService.current.joinChannel(
      cs.roomName,
      effectiveUserId,
      () => {
        // Peer merely present in the signaling room — not a real connection.
        // The UI stays in RECONNECTING until pc.connectionState === "connected".
      },

      () => {
        handlePeerDisconnected();
      },
      () => {
        if (!isMountedRef.current) return;
        resetReconnectState();
        setCallState((prev) => ({
          ...prev,
          connectionState: "CONNECTED",
        }));
      },
      (hasVideo) => {
        if (!isMountedRef.current) return;
        setRemoteVideoActive(hasVideo);
      },
      isGuestUser
    );

    reconnectInProgressRef.current = false;

    if (joined) {
      return;
    }

    const baseDelay = 1500;
    const maxDelay = 15000;
    const jitter = Math.floor(Math.random() * 400);
    const delayMs = Math.min(maxDelay, baseDelay * Math.pow(2, reconnectAttemptsRef.current - 1)) + jitter;
    reconnectTimerRef.current = window.setTimeout(() => {
      attemptReconnect(reason);
    }, delayMs);
  }, [effectiveUserId, handlePeerDisconnected, isGuestUser, resetReconnectState]);

  useEffect(() => {
    const handleConnectionState = (state: string, reason?: string) => {
      if (!isMountedRef.current) return;
      const cs = callStateRef.current;

      if (state === "RECONNECTING" && cs.connectionState === "CONNECTED") {
        setCallState((prev) => ({
          ...prev,
          connectionState: "RECONNECTING",
        }));
      }

      if (state === "DISCONNECTED") {
        const reasonText = String(reason || "");
        if (cs.connectionState === "CONNECTED" || cs.connectionState === "RECONNECTING") {
          if (!reasonText.toUpperCase().includes("LEAVE")) {
            attemptReconnect(reasonText);
          }
        }
      }

      if (state === "CONNECTED" && cs.connectionState === "RECONNECTING") {
        resetReconnectState();
        setCallState((prev) => ({
          ...prev,
          connectionState: "CONNECTED",
        }));
      }

      // Mobile PWA fallback:
      // Sometimes WebRTC reaches CONNECTED transport state, but peer events are delayed/missed,
      // leaving UI stuck on CONNECTING indefinitely. Promote to CONNECTED when transport is ready.
      if (state === "CONNECTED" && cs.connectionState === "CONNECTING" && cs.roomName && cs.remotePeerId) {
        setCallState((prev) => ({
          ...prev,
          connectionState: "CONNECTED",
        }));
      }
    };

    rtcService.current.setConnectionStateHandler(handleConnectionState);
    return () => {
      rtcService.current.setConnectionStateHandler(null);
    };
  }, [attemptReconnect, resetReconnectState]);

  // ============================================================================
  // ⚡ OPTIMIZED POLLING - RACE CONDITION FREE + REAL-TIME STATS
  // ============================================================================

  const pollForMatch = useCallback(async () => {
    let attempts = 0;
    // NOTE:
    // This is NOT a "cache" issue. If we stop polling too early, a user who started searching
    // will exit the queue before another user arrives, so they can't get matched later.
    // For a better UX (especially with autoMatch=true), we poll longer and let the user stop manually.
    //
    // CRITICAL: the server rate-limits atomic_match_user (see match_throttled).
    // Polling faster than the limit gets the user throttled AND their waiting row
    // expires (45s), making them invisible to everyone — the "2 minutes to match"
    // and "nobody matches" bug. POLL_MS must stay comfortably under the budget.
    const POLL_MS = 1200; // 50 claims/min max, under the server budget
    const maxAttempts = autoMatch
      ? Math.ceil((5 * 60 * 1000) / POLL_MS) // 5 minutes
      : Math.ceil((20 * 1000) / POLL_MS); // 20 seconds
    
    console.log('🔍 Starting polling for match...', {
      me: userId,
      lang: language,
      visibility: document.visibilityState,
    });

    pollingIntervalRef.current = setInterval(async () => {
      // setInterval does not wait for an async callback. Without this guard,
      // a slow/offline backend starts overlapping match requests every 500ms.
      if (pollingInFlightRef.current) return;
      pollingInFlightRef.current = true;

      // ⚡ RACE CONDITION FIX #1: Check if component unmounted
      if (!isMountedRef.current) {
        console.log('⚠️ Component unmounted, stopping poll');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        pollingInFlightRef.current = false;
        return;
      }

      attempts++;
      if (attempts <= 3 || attempts % 5 === 0) {
        console.log(`🔍 Poll attempt ${attempts}/${maxAttempts}`, {
          me: userId,
          visibility: document.visibilityState,
        });
      }

      // Keep the waiting row alive. Even if a claim is skipped or throttled,
      // the searcher must stay visible to everyone else in the queue.
      void heartbeatWaitingUser(effectiveUserId);

      // ⚡ UPDATE STATS every 4 attempts for real-time accuracy
      if (attempts % 4 === 0) {
        try {
          const freshStats = await matchingService.current.getRealtimeStats();
          if (isMountedRef.current) {
            setStats(freshStats);
          }
        } catch (statsError) {
          console.warn('Stats update failed:', statsError);
          // Non-critical, continue polling
        }
      }

      // ⚡ TIMEOUT SCENARIO - Full cleanup
      if (attempts >= maxAttempts) {
        console.log('❌ Polling timeout reached');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        pollingInFlightRef.current = false;
        
        // ⚡ RACE CONDITION FIX #2: Full cleanup on timeout
        await cleanupSearch('timeout');
        
        if (isMountedRef.current) {
          // Silent recovery: never surface a red "no match" error, just keep looking.
          setCallState((prev) => ({
            ...prev,
            connectionState: "SEARCHING",
            errorMessage: null,
          }));
          window.setTimeout(() => {
            if (isMountedRef.current) retrySearchRef.current?.();
          }, 400);
        }
        return;
      }

      try {
        const matchResult = await matchingService.current.getMatch(
          effectiveUserId,
          language,
          callStateRef.current.userLatitude || undefined,
          callStateRef.current.userLongitude || undefined,
          attempts > 2 ? undefined : (filtersUnlockedRef.current ? matchTags : undefined),
          userGender,
          attempts > 2 ? undefined : userPreferredGender,
          attempts > 2 ? undefined : userPreferredRegions,
          userCountry,
          hasPremiumAccess
        );

        if (attempts <= 3 || attempts % 5 === 0) {
          console.log("🧪 pollForMatch result:", {
            attempt: attempts,
            me: userId,
            room: matchResult?.room_name,
            partner: matchResult?.partner_id,
          });
        }

        // ⚡ RACE CONDITION FIX #3: Check mounted before proceeding
        if (!isMountedRef.current) {
          console.log('⚠️ Component unmounted during match check');
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          return;
        }

        if (matchResult?.partner_id) {
          console.log('✅ Match found during polling!', matchResult);
          await connectToMatch(matchResult, "poll");
        }
      } catch (error) {
        console.error("Polling error:", error);
          
        // ⚡ RACE CONDITION FIX #5: Error handling with retry limit
        pollingErrorCountRef.current++;
        
        if (pollingErrorCountRef.current >= 5) {
          console.error('❌ Too many polling errors, stopping');
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          
          await cleanupSearch('error');
          
          if (isMountedRef.current) {
            setCallState((prev) => ({
              ...prev,
              connectionState: "SEARCHING",
              errorMessage: null,
            }));
            pollingErrorCountRef.current = 0;
            window.setTimeout(() => {
              if (isMountedRef.current) retrySearchRef.current?.();
            }, 800);
          }
        }
        // Continue polling if error count is below threshold
      } finally {
        pollingInFlightRef.current = false;
      }
    }, POLL_MS);
  }, [userId, language, t, handlePeerDisconnected, preFetchNextMatch, cleanupSearch]);

  const connectToMatch = useCallback(
    async (matchResult: MatchResult, source: "instant" | "poll" | "realtime") => {
      if (!isMountedRef.current) return;

      // Defensive: a match must include both fields
      if (!matchResult.room_name || !matchResult.partner_id) {
        console.warn("⚠️ connectToMatch called with incomplete match:", {
          source,
          room: matchResult.room_name,
          partner: matchResult.partner_id,
        });
        return;
      }

      // Hard guard: only allow ONE match to be processed per search.
      // This prevents races between: realtime insert + instant RPC + in-flight polling tick.
      if (activeMatchRef.current) {
        console.log("🧯 Ignoring additional match (already connecting):", {
          existing: activeMatchRef.current,
          incoming: { room: matchResult.room_name, partner: matchResult.partner_id, source },
        });
        return;
      }

      const cs = callStateRef.current;
      if (cs.connectionState === "CONNECTED" || cs.connectionState === "CONNECTING") {
        return;
      }

      activeMatchRef.current = {
        roomName: matchResult.room_name,
        partnerId: matchResult.partner_id,
      };

      console.log("🔗 connectToMatch:", {
        source,
        room: matchResult.room_name,
        partner: matchResult.partner_id,
      });

      // Stop polling once we have a match (realtime/poll/instant)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Stop realtime listener once we commit to a match
      if (matchHistoryChannelRef.current) {
        supabase.removeChannel(matchHistoryChannelRef.current);
        matchHistoryChannelRef.current = null;
      }

      // Allow follow-up searches if something fails later
          isSearchingRef.current = false;
      pollingErrorCountRef.current = 0;

          // 🔊 Play match found sound
          playMatchFoundSound();

      const partnerProfilePromise = (async () => {
        try {
          console.log("🔍 Fetching partner profile for:", matchResult.partner_id);
          const { data: partnerProfile, error: profileError } = await supabase
            .from(TABLES.USERS)
            .select("name, email, id, is_premium")
            .eq("id", matchResult.partner_id)
            .maybeSingle();

          console.log("👤 Partner profile result:", {
            found: !!partnerProfile,
            error: profileError,
            name: partnerProfile?.name,
            email: partnerProfile?.email,
            isPremium: partnerProfile?.is_premium
          });

          if (partnerProfile) {
            return {
              partnerName: partnerProfile.name || partnerProfile.email?.split('@')[0] || "User",
              partnerIsGuest: false,
              partnerIsPremium: Boolean(partnerProfile.is_premium),
            };
          }

          console.log("🎭 Matched with guest user");
        } catch (err) {
          console.warn("Could not fetch partner profile:", err);
        }

        return {
          partnerName: null,
          partnerIsGuest: true,
          partnerIsPremium: false,
        };
      })();



          setCallState((prev) => ({
            ...prev,
            connectionState: "CONNECTING",
            remotePeerId: matchResult.partner_id,
            roomName: matchResult.room_name,
            isRematch: matchResult.is_rematch,
            prefetchedNextRoom: matchResult.prefetched_next_room,
            distanceKm: matchResult.distance_km,
            partnerRating: matchResult.partner_rating,
        partnerName: null,
        partnerIsGuest: false,
        partnerIsPremium: false,
          }));

      // Ghost-connection watchdog: if still CONNECTING after the timeout, the peer never appeared.
      // Use a shorter timeout on installed mobile PWA to recover faster.
      const connectWatchdogMs = IS_MOBILE_PWA ? 12000 : 20000;
      if (connectingWatchdogRef.current) {
        clearTimeout(connectingWatchdogRef.current);
        connectingWatchdogRef.current = null;
      }
      connectingWatchdogRef.current = window.setTimeout(async () => {
        connectingWatchdogRef.current = null;
        const cs = callStateRef.current;
        if (!isMountedRef.current) return;
        if (cs.connectionState !== "CONNECTING" && cs.connectionState !== "RECONNECTING") return;
        console.warn(`⚠️ Watchdog: still CONNECTING after ${Math.round(connectWatchdogMs / 1000)}s — returning to SEARCHING`);
        activeMatchRef.current = null;
        // Full cleanup so isSearchingRef is cleared before we re-enter findAndConnect
        await cleanupSearchRef.current('error');
        await rtcService.current.leaveChannel();
        if (isMountedRef.current) {
          await findAndConnectRef.current();
        }
      }, connectWatchdogMs);

      void partnerProfilePromise.then(({ partnerName, partnerIsGuest, partnerIsPremium }) => {
        if (!isMountedRef.current) return;
        setCallState((prev) => {
          if (prev.roomName !== matchResult.room_name || prev.remotePeerId !== matchResult.partner_id) {
            return prev;
          }
          return {
            ...prev,
            partnerName,
            partnerIsGuest,
            partnerIsPremium,
          };
        });
      });

          const joined = await rtcService.current.joinChannel(
            matchResult.room_name,
            effectiveUserId,
        () => {
              // A peer is merely PRESENT in the signaling room. This is NOT a
              // connection: presence can come from a stale/ghost peer or from a
              // user who is already matched elsewhere. Stay in CONNECTING so the
              // UI keeps showing "Searching…" until real P2P media flows.
            },
        () => {
              handlePeerDisconnected();
            },
            () => {
              if (!isMountedRef.current) return;
              // Real WebRTC peer connection is established (pc.connectionState === "connected").
              // This is the ONLY place the UI is allowed to become CONNECTED.
              if (connectingWatchdogRef.current) {
                clearTimeout(connectingWatchdogRef.current);
                connectingWatchdogRef.current = null;
              }
              resetReconnectState();
              haptic(50);
              playCue("match");
              setCallState((prev) => {
                if (prev.roomName !== matchResult.room_name || prev.remotePeerId !== matchResult.partner_id) return prev;
                if (prev.connectionState === "CONNECTED") return prev;
                return { ...prev, connectionState: "CONNECTED" };
              });

              const totalTime = performance.now() - matchStartTimeRef.current;
              console.log(`⚡ Connection established (${source}) in ${(totalTime / 1000).toFixed(2)}s`);

              if (matchResult.is_rematch) {
                toast.success(getRematchMessage(), { duration: 4000, icon: "🔄" });
              }
              // Fire-and-forget: never delays or blocks the conversation.
              recordMatchRef.current(matchResult.room_name);
              preFetchNextMatch();
            },
            (hasVideo) => {
              if (!isMountedRef.current) return;
              setRemoteVideoActive(hasVideo);
            },
        isGuestUser
          );

          if (!joined) {
        // Allow retry if join failed; also clear the cached token so we don't
        // retry with a potentially stale token for the same channel.
        activeMatchRef.current = null;
        await cleanupSearch("error");
            throw new Error("Failed to establish P2P connection");
          }

      // Safety net for event-race edge cases: promote ONLY when the real peer
      // connection is already established and the callback simply lagged.
      if (isMountedRef.current && rtcService.current.isPeerConnected()) {
        if (connectingWatchdogRef.current) {
          clearTimeout(connectingWatchdogRef.current);
          connectingWatchdogRef.current = null;
        }
        resetReconnectState();
        setCallState((prev) => {
          if (prev.connectionState === "CONNECTED") return prev;
          if (prev.roomName !== matchResult.room_name || prev.remotePeerId !== matchResult.partner_id) return prev;
          return {
            ...prev,
            connectionState: "CONNECTED",
          };
        });
        preFetchNextMatch();
      }

    },
    [cleanupSearch, effectiveUserId, handlePeerDisconnected, isGuestUser, preFetchNextMatch, t, resetReconnectState]
  );

  const startMatchHistoryRealtimeListener = useCallback(() => {
    // Realtime is best-effort; polling remains as fallback.
    // If RLS blocks this (e.g. guests), it will simply never deliver events.
    if (!effectiveUserId) return;

    // Ensure single channel
    if (matchHistoryChannelRef.current) {
      supabase.removeChannel(matchHistoryChannelRef.current);
      matchHistoryChannelRef.current = null;
    }

    // Purge any stale channel left over from a previous mount (StrictMode / HMR).
    // Reusing an already-subscribed topic makes supabase throw
    // "cannot add `postgres_changes` callbacks ... after `subscribe()`".
    supabase
      .getChannels()
      .filter((c) => c.topic.startsWith(`realtime:match-history:${effectiveUserId}`))
      .forEach((c) => supabase.removeChannel(c));

    // Use a single channel with two postgres_changes listeners:
    // 1) rows where I am the "user" (match created by me)
    // 2) rows where I am the "partner" (match created by the other user)
    // This fixes the bug where only one side of the match got the realtime event.
    const channel = supabase.channel(`match-history:${effectiveUserId}:${Date.now()}`);



    const handleMatchRow = ({ new: row }: any) => {
      const cs = callStateRef.current;
      if (!isMountedRef.current) return;
      if (cs.connectionState !== "SEARCHING") return;

      const roomName = row?.room_name || row?.room || row?.channel || null;
      // When I'm the partner, the other user's id is in user_id
      const partnerId = row?.user_id === effectiveUserId ? row?.partner_id : row?.user_id;
      if (!roomName || !partnerId) return;

      console.log("📡 Realtime match INSERT received:", { roomName, partnerId });

      void connectToMatch(
        {
          room_name: String(roomName),
          partner_id: String(partnerId),
          is_rematch: Boolean(row?.is_rematch ?? false),
          prefetched_next_room: null,
          distance_km: typeof row?.distance_km === "number" ? row.distance_km : null,
          partner_rating: typeof row?.partner_rating === "number" ? row.partner_rating : null,
        },
        "realtime"
      );
    };

    channel
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: TABLES.MATCH_HISTORY,
        filter: `user_id=eq.${effectiveUserId}`,
      }, handleMatchRow)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: TABLES.MATCH_HISTORY,
        filter: `partner_id=eq.${effectiveUserId}`,
      }, handleMatchRow);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("📡 Match realtime subscribed (both directions)");
      } else if (status === "CHANNEL_ERROR") {
        console.warn("⚠️ Match realtime channel error");
      }
    });

    matchHistoryChannelRef.current = channel;
  }, [connectToMatch, effectiveUserId]);

  // ============================================================================
  // ⚡ MAIN MATCHING FUNCTION - OPTIMIZED FOR <3 SECOND CONNECTION
  // ⚡ WITH PRE-REQUESTED MICROPHONE
  // ============================================================================

  const findAndConnect = useCallback(async () => {
    startTrial();
    if (isSearchingRef.current) {
      console.log('⚠️ Search already in progress, ignoring duplicate call');
      return;
    }

    // Commit the interaction state before any network, media or WebRTC work.
    // This keeps INP independent from backend and TURN latency.
    isSearchingRef.current = true;
    matchStartTimeRef.current = performance.now();
    pollingErrorCountRef.current = 0;
    setRemoteVideoActive(false);
    setCallState((prev) => ({
      ...prev,
      connectionState: "SEARCHING",
      errorMessage: null,
    }));

    // Hard ban gate (8 unique reports) — never even enter the queue.
    if (!isGuestUser && effectiveUserId) {
      try {
        const { data: banned } = await supabase.rpc("is_user_banned", { p_user: effectiveUserId });
        if (banned === true) {
          isSearchingRef.current = false;
          setModerationNotice("Account banned. Matching disabled.");
          setCallState((prev) => ({ ...prev, connectionState: "IDLE" }));
          return;
        }
      } catch {
        /* never block matching on a check failure */
      }
    }
    try {
      // IMPORTANT:
      // If the previous call ended due to peer disconnect, the WebRTC singleton might still be joined.
      // Hard refresh "fixes" it because it resets singleton state.
      // We proactively leave any lingering channel before starting a new search.
      const staleMatchCleanup = typeof matchingService.current.closeOpenMatchesForUser === "function"
        ? matchingService.current.closeOpenMatchesForUser(effectiveUserId)
        : Promise.resolve();
      await Promise.allSettled([rtcService.current.leaveChannel(), staleMatchCleanup]);

      console.log('🔍 Step 1: Starting matchmaking immediately...');

      // Start realtime listener ASAP so the "other user" can connect instantly (no polling delay).
      startMatchHistoryRealtimeListener();

      // Warm up Agora before a match is returned so join starts immediately once a room is assigned.
      void rtcService.current.initialize();

      // Kick off mic request in parallel (do not await here). This still requires user gesture, which we have.
      setMicPermissionStatus('pending');
      const micPromise = rtcService.current.ensureMicrophoneReady().then((micResult) => {
        if (!isMountedRef.current) return micResult;
        if (micResult.success) {
          setMicPermissionStatus('granted');
          // Best-effort UX: on mobile, advise headphones to prevent acoustic echo.
          return micResult;
        }
        // If user denied mic, we must stop matchmaking and surface error.
        setMicPermissionStatus('denied');
        void cleanupSearch('error');
          setCallState((prev) => ({
            ...prev,
            connectionState: "ERROR",
            errorMessage: micResult.error || t('audioCall.microphoneAccessFailed'),
          }));
          toast.error(micResult.error || t('audioCall.microphoneAccessFailed'));
        return micResult;
      });

      let cameraPromise: Promise<{ success: boolean; error?: string }> | null = null;
      if (callState.isCameraOn) {
        setCameraPermissionStatus('pending');
        cameraPromise = rtcService.current.setCameraEnabled(true).then((camResult) => {
          if (!isMountedRef.current) return camResult;
          if (camResult.success) {
            setCameraPermissionStatus('granted');
            return camResult;
          }
          setCameraPermissionStatus('denied');
          toast.error(camResult.error || t('audioCall.cameraAccessFailed'));
          setCallState((prev) => ({
            ...prev,
            isCameraOn: false,
          }));
          return camResult;
        });
      }

      // Background: update geolocation + stats (do not block matchmaking).
      void (async () => {
        try {
      const [coords, realtimeStats] = await Promise.all([
            callState.userLatitude === null || callState.userLongitude === null ? getUserGeolocation() : Promise.resolve(null),
            matchingService.current.getRealtimeStats(),
          ]);
          if (!isMountedRef.current) return;
          if (coords) {
          setCallState((prev) => ({
            ...prev,
            userLatitude: coords.lat,
            userLongitude: coords.lon,
          }));
      }
      setStats(realtimeStats);
        } catch {
          // ignore
      }
      })();

      // Use cached coords if we already have them (never block)
      const finalLatitude = callState.userLatitude || undefined;
      const finalLongitude = callState.userLongitude || undefined;


      // ⚡ FIRST MATCH ATTEMPT - Try instant match
      const matchResult = await matchingService.current.getMatch(
        effectiveUserId,
        language,
        finalLatitude,
        finalLongitude,
        filtersUnlockedRef.current ? matchTags : undefined,
        userGender,
        userPreferredGender,
        userPreferredRegions,
        userCountry,
        hasPremiumAccess
      );

      console.log("🧪 findAndConnect getMatch result:", {
        me: userId,
        room: matchResult?.room_name,
        partner: matchResult?.partner_id,
      });

      // ⚡ RACE CONDITION FIX #7: Check if component unmounted
      if (!isMountedRef.current) {
        console.log('⚠️ Component unmounted during match attempt');
        await cleanupSearch('user-cancelled');
        return;
      }

      if (matchResult?.partner_id) {
        // ⚡ INSTANT MATCH PATH - Connection in <1 second possible
        console.log('⚡ INSTANT MATCH found!', matchResult);
        // Ensure mic promise is at least started; joinChannel will await it internally if needed.
        void micPromise;
        void cameraPromise;
        await connectToMatch(matchResult, "instant");
      } else {
        // ⚡ NO INSTANT MATCH - Start polling (typically <3 seconds with active users)
        console.log('⏳ No instant match, starting polling...');
        pollForMatch();
      }

    } catch (error) {
      console.error("Find and connect error:", error);
      
      await cleanupSearch('error');
      
      if (isMountedRef.current) {
        setCallState((prev) => ({
          ...prev,
          connectionState: "IDLE",
          errorMessage: null,
        }));
      }
    }
  }, [
    userId,
    language,
    t,
    callState.userLatitude,
    callState.userLongitude,
    callState.isCameraOn,
    getUserGeolocation,
    handlePeerDisconnected,
    preFetchNextMatch,
    pollForMatch,
    cleanupSearch,
    startMatchHistoryRealtimeListener,
    connectToMatch,
  ]);

  // Keep the stable ref in sync so the callSignal useEffect can call findAndConnect
  // without a forward-declaration hoisting issue.
  findAndConnectRef.current = findAndConnect;
  cleanupSearchRef.current = cleanupSearch;
  retrySearchRef.current = () => {
    void findAndConnect();
  };

  // ── Guest auth gate: tease a real search for 2.5s, then require sign-up ──
  const [guestGating, setGuestGating] = useState(false);
  const guestGateTimerRef = useRef<number | null>(null);
  const gatedStart = useCallback(() => {
    // Instant tactile/audio acknowledgement on the exact press millisecond.
    playCue("tap");
    haptic(15);
    if (requireAuth && isGuestUser) {
      if (guestGating || guestGateTimerRef.current !== null) return;
      setGuestGating(true);
      guestGateTimerRef.current = window.setTimeout(() => {
        guestGateTimerRef.current = null;
        setGuestGating(false);
        onAuthRequired?.();
      }, 2500);
      return;
    }
    void findAndConnect();
  }, [requireAuth, isGuestUser, guestGating, findAndConnect, onAuthRequired]);

  useEffect(() => {
    return () => {
      if (guestGateTimerRef.current !== null) window.clearTimeout(guestGateTimerRef.current);
    };
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNext = useCallback(async () => {
    // Guard: only callable when actually connected
    const cs = callStateRef.current;
    if (cs.connectionState !== "CONNECTED") return;

    // ⚡ Zero-latency feedback: the satisfying click + haptic tick fire on the
    // exact millisecond of the press, before any async work happens.
    playCue("tap");
    haptic(20);
    // Optimistic UI: drop the remote frame instantly so the switch *feels*
    // immediate while the new P2P handshake completes in ~200ms.
    // Read the live value from the external timer store (no re-render cost)
    const currentSeconds = getSeconds();

    try {
      const iAmFree = !hasPremiumAccess && !isGuestUser;
      const partnerIsFree = !cs.partnerIsPremium && !cs.partnerIsGuest;

      // ── FREE USER RESTRICTIONS ──────────────────────────────────────────────
      // Rule 1: Both free → must wait 30 s
      // Rule 2: I'm free, partner is premium → I must also wait 30 s
      //         BUT if the partner is premium and presses Next first,
      //         the signal listener auto-skips me anyway (no restriction needed).
      // Rule 3: I'm premium → no time restriction
      if (iAmFree) {
        // Rate-limit: max 10 skips per minute
        const now = Date.now();
        const windowStart = now - SKIP_WINDOW_MS;
        skipTimestampsRef.current = skipTimestampsRef.current.filter((t) => t >= windowStart);
        if (skipTimestampsRef.current.length >= SKIP_LIMIT_PER_MINUTE) {
          toast.error("Slow down a little before skipping again.", { duration: 3000 });
          return;
        }

        // TEMPORARY: the 30-second skip wait and the Premium upgrade prompt are
        // disabled until the CCBill payment gateway is live. Next is instant.

        // Allowed to skip — record timestamp for rate-limiting
        skipTimestampsRef.current.push(now);
      }

      // Paint the new state only after synchronous guards pass, but before any
      // network or WebRTC teardown begins.
      setRemoteVideoActive(false);
      setCallState((prev) => ({ ...prev, connectionState: "SEARCHING", errorMessage: null }));

      // ── PROCEED WITH NEXT ───────────────────────────────────────────────────
      // 1. Broadcast the signal FIRST so partner starts searching before we leave
      if (callSignalChannelRef.current && cs.roomName) {
        callSignalChannelRef.current.send({
          type: "broadcast",
          event: "partner_pressed_next",
          payload: { fromUserId: effectiveUserId, ts: Date.now() },
        }).catch(() => {});
      }

      // 2. Close the old room before claiming another one. Running these in
      // parallel can make the atomic matcher return the room we just left.
      if (cs.remotePeerId) {
        await matchingService.current.endMatch(effectiveUserId, cs.remotePeerId, currentSeconds);
      }

      // 3. Stop & reset the call timer
      startTransition(() => {
        stop();
        reset();
      });


      // 4. Centralized cleanup (clears polling, realtime, activeMatchRef, isSearchingRef)
      await cleanupSearch('user-cancelled');

      // 5. Full leave + one authoritative atomic search. The legacy
      // prefetched-room path could join one room while the database returned
      // another, leaving both peers on black screens.
      await rtcService.current.leaveChannel();
      await findAndConnect();

    } catch (error) {
      console.error("Next error:", error);
      activeMatchRef.current = null;
      try { await rtcService.current.leaveChannel(); } catch {}
      await findAndConnect();
    }
  }, [getSeconds, callState.connectionState, effectiveUserId, isGuestUser, hasPremiumAccess, stop, reset, t, language, canCustomizeCall, matchTags, findAndConnect, preFetchNextMatch, handlePeerDisconnected, cleanupSearch]);

  const handleStopSearching = useCallback(async () => {
    console.log('🛑 User stopped searching');
    
    // ⚡ RACE CONDITION FIX #8: Use centralized cleanup
    await cleanupSearch('user-cancelled');
    resetReconnectState();

    if (isMountedRef.current) {
    await rtcService.current.leaveChannel();
    setRemoteVideoActive(false);

    setCallState((prev) => ({
      connectionState: "IDLE",
      remotePeerId: null,
      roomName: null,
      isMuted: false,
      isCameraOn: prev.isCameraOn,
      isRematch: false,
      prefetchedNextRoom: null,
      distanceKm: null,
      partnerRating: null,
      userLatitude: prev.userLatitude,
      userLongitude: prev.userLongitude,
      errorMessage: null,
      partnerName: null,
      partnerIsGuest: false,
      partnerIsPremium: false,
    }));

    stop();
    toast.success(t("audio.stopped_searching"));
    }
  }, [stop, t, cleanupSearch, resetReconnectState]);

  const handleMobilePrimaryAction = useCallback(async () => {
    if (mobileActionBusy) return;
    if (isStartState) {
      // gatedStart() already plays the press cue.
      // Guests must go through the same 2.5s tease + auth gate as the globe /
      // "Tap to Start" — never launch matchmaking directly.
      gatedStart();
      return;
    }
    // ⚡ Paint first: cue + haptic + optimistic remote-frame drop happen
    // synchronously, before any awaited WebRTC work.
    playCue("tap");
    haptic(15);
    setRemoteVideoActive(false);
    setMobileActionBusy(true);
    try {

      if (isConnected) {
        await handleNext();
        return;
      }

      // SEARCHING / CONNECTING / RECONNECTING:
      // "Next" should skip current attempt and immediately search again.
      await handleStopSearching();
      await findAndConnect();
    } finally {
      setMobileActionBusy(false);
    }
  }, [mobileActionBusy, isStartState, isConnected, findAndConnect, handleNext, handleStopSearching, gatedStart]);

  // When home page "Start" button is clicked, scroll brings user here and we start the call immediately
  useEffect(() => {
    const handler = () => {
      if (callState.connectionState === "IDLE" || callState.connectionState === "ERROR") {
        gatedStart();
      }
    };
    window.addEventListener("caakus-start-video-now", handler);
    return () => window.removeEventListener("caakus-start-video-now", handler);
  }, [callState.connectionState, gatedStart]);

  const handleToggleMute = useCallback(async () => {
    const newMutedState = !callState.isMuted;

    setCallState((prev) => ({
      ...prev,
      isMuted: newMutedState,
    }));

    await rtcService.current.toggleMute(newMutedState);
  }, [callState.isMuted]);

  const handleToggleCamera = useCallback(async () => {
    const newCameraState = !callState.isCameraOn;

    autoVideoDisabledRef.current = false;
    criticalQualityStreakRef.current = 0;
    goodQualityStreakRef.current = 0;

    setCallState((prev) => ({
      ...prev,
      isCameraOn: newCameraState,
    }));

    if (newCameraState) {
      setCameraPermissionStatus('pending');
    }

    const result = await rtcService.current.setCameraEnabled(newCameraState);

    if (!result.success) {
      setCameraPermissionStatus('denied');
      setCallState((prev) => ({
        ...prev,
        isCameraOn: false,
      }));
      toast.error(result.error || t('audioCall.cameraAccessFailed'));
      return;
    }

    if (newCameraState) {
      setCameraPermissionStatus('granted');
      rtcService.current.attachLocalVideo(localVideoRef.current);
    } else {
      setCameraPermissionStatus(null);
    }
  }, [callState.isCameraOn]);

  // Detect whether the device has a rear camera available.
  // IMPORTANT: re-run once camera permission is granted — before permission,
  // mobile browsers hide the real camera list, so the flip button never shows.
  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      try {
        const multi = await rtcService.current.hasMultipleCameras();
        if (cancelled) return;
        // On touch devices, enumerateDevices can be unreliable even after
        // permission: show the flip button anyway, switchCamera() fails safely.
        setHasMultipleCameras(multi || isTouchDevice());
      } catch {
        if (!cancelled) setHasMultipleCameras(isTouchDevice());
      }
    };
    detect();
    return () => {
      cancelled = true;
    };
  }, [cameraPermissionStatus, callState.isCameraOn]);

  const handleSwitchCamera = useCallback(async () => {
    if (switchingCamera) return;
    setSwitchingCamera(true);
    try {
      const result = await rtcService.current.switchCamera();
      if (!result.success) {
        toast.error(result.error || t('audioCall.cameraAccessFailed'));
        return;
      }
      setIsRearCamera(rtcService.current.getFacingMode() === 'environment');
      rtcService.current.attachLocalVideo(localVideoRef.current);
    } finally {
      setSwitchingCamera(false);
    }
  }, [switchingCamera, t]);

  const getMyEmail = useCallback(async (): Promise<string | null> => {
    if (userEmail) return userEmail;
    try {
      const { data } = await supabase.auth.getUser();
      return data.user?.email || null;
    } catch {
      return null;
    }
  }, [userEmail]);

  const getPeerEmail = useCallback(async (peerId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select("email")
        .eq("id", peerId)
        .maybeSingle();
      if (error) return null;
      return (data as any)?.email || null;
    } catch {
      return null;
    }
  }, []);

  const showExchangedEmails = useCallback(async (peerId: string) => {
    const my = await getMyEmail();
    const peer = await getPeerEmail(peerId);
    if (!my || !peer) {
      toast("Friend request accepted ✅", { duration: 2500 });
      return;
    }
    setFriendRequests((prev) => ({
      ...prev,
      exchangedEmails: { myEmail: my, peerEmail: peer },
    }));
  }, [getMyEmail, getPeerEmail]);

  const handleFriend = useCallback(async () => {
    if (!callState.remotePeerId) return;
    
    // Guest users cannot add friends
    if (isGuestUser) {
      toast.error("Please sign in to add friends. Create an account to save your connections!");
      return;
    }

    const request = await createFriendRequest(effectiveUserId, callState.remotePeerId, true);
    if (!request) {
      toast.error("Failed to send friend request");
      return;
    }

    if ((request as any).status === "accepted") {
      toast.success("You're already friends ✅");
      await showExchangedEmails(callState.remotePeerId);
      return;
    }

    toast.success(t("audio.friend_request_sent"));
  }, [callState.remotePeerId, effectiveUserId, t, showExchangedEmails, isGuestUser]);

  const handleAcceptFriend = useCallback(async () => {
    const requestId = incomingFriendRequestIdRef.current;
    const peerId = callState.remotePeerId;
    if (!requestId || !peerId) {
      setFriendRequests((prev) => ({ ...prev, incoming: false }));
      return;
    }

    const ok = await confirmFriendRequest(requestId, effectiveUserId, false);
    if (!ok) {
      toast.error("Failed to accept friend request");
      return;
    }

    setFriendRequests((prev) => ({
      ...prev,
      incoming: false,
    }));

    toast.success(t("audio.friend_request_accepted"));
    await showExchangedEmails(peerId);
  }, [callState.remotePeerId, effectiveUserId, t, showExchangedEmails]);

  const handleDeclineFriend = useCallback(async () => {
    const requestId = incomingFriendRequestIdRef.current;
    if (requestId) {
      await declineFriendRequest(requestId);
    }

    incomingFriendRequestIdRef.current = null;
    setFriendRequests((prev) => ({
      ...prev,
      incoming: false,
      peerEmail: null,
    }));
    toast(t("audio.friend_request_declined"));
  }, [t]);

  // ============================================================================
  // LIFECYCLE - RACE CONDITION FREE CLEANUP
  // ============================================================================

  useEffect(() => {
    // ⚡ RACE CONDITION FIX #9: Mark component as mounted
    isMountedRef.current = true;
    
    // Cancel any delayed cleanup from previous unmount
    if (delayedUnmountCleanupRef.current) {
      clearTimeout(delayedUnmountCleanupRef.current);
      delayedUnmountCleanupRef.current = null;
    }

    const handleBeforeUnload = () => {
      isMountedRef.current = false;
      cleanupWaitingUser(effectiveUserId);
      rtcService.current.destroy();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // ⚡ RACE CONDITION FIX #10: Mark as unmounted FIRST
      isMountedRef.current = false;
      
      // Clear all intervals/timeouts immediately
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      pollingInFlightRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (connectingWatchdogRef.current) {
        clearTimeout(connectingWatchdogRef.current);
        connectingWatchdogRef.current = null;
      }
      if (callSignalChannelRef.current) {
        supabase.removeChannel(callSignalChannelRef.current);
        callSignalChannelRef.current = null;
      }

      // Reset flags
      isSearchingRef.current = false;
      pollingErrorCountRef.current = 0;

      // Delay destructive cleanup for StrictMode (but mark unmounted prevents operations)
      delayedUnmountCleanupRef.current = window.setTimeout(() => {
        rtcService.current.destroy();
        cleanupWaitingUser(effectiveUserId);
        stop();
        delayedUnmountCleanupRef.current = null;
      }, 250);

      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [effectiveUserId, stop]);

  useEffect(() => {
    if (isConnected) {
      start();
    }
  }, [isConnected, start]);

  // 🔊 Play connection sound when call becomes active
  const prevConnectionStateRef = useRef<ConnectionState>("IDLE");
  useEffect(() => {
    // Only play sound when transitioning TO CONNECTED (not when already connected)
    if (
      callState.connectionState === "CONNECTED" &&
      prevConnectionStateRef.current !== "CONNECTED"
    ) {
      playConnectionSound();
    }
    prevConnectionStateRef.current = callState.connectionState;
  }, [callState.connectionState]);

  // ============================================================================
  // FRIEND REQUESTS - PERSISTENT RELATIONSHIP (SUPABASE)
  // ============================================================================

  useEffect(() => {
    if (!isConnected) return;
    if (!callState.remotePeerId) return;
    if (isGuestUser) return; // Guest users can't use friend requests

    // Cleanup prior channel
    if (friendRequestChannelRef.current) {
      supabase.removeChannel(friendRequestChannelRef.current);
      friendRequestChannelRef.current = null;
    }

    const peerId = callState.remotePeerId;
    const channel = supabase.channel(`friend-requests:${effectiveUserId}:${peerId}`);

    // Incoming request to me from current peer
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: TABLES.FRIEND_REQUESTS,
        filter: `to_user_id=eq.${effectiveUserId}`,
      },
      async (payload: any) => {
        const row = payload?.new;
        if (!row) return;
        if (row.from_user_id !== peerId) return;
        if (row.status !== "pending") return;

        incomingFriendRequestIdRef.current = row.id;
        const peerEmail = await getPeerEmail(peerId);
        setFriendRequests((prev) => ({
          ...prev,
          incoming: true,
          peerEmail: peerEmail,
        }));
      }
    );

    // If peer accepts a request I sent (status becomes accepted), show email exchange
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: TABLES.FRIEND_REQUESTS,
        filter: `from_user_id=eq.${effectiveUserId}`,
      },
      async (payload: any) => {
        const row = payload?.new;
        if (!row) return;
        if (row.to_user_id !== peerId) return;
        if (row.status !== "accepted") return;

        await showExchangedEmails(peerId);
      }
    );

    channel.subscribe();
    friendRequestChannelRef.current = channel;

    return () => {
      if (friendRequestChannelRef.current) {
        supabase.removeChannel(friendRequestChannelRef.current);
        friendRequestChannelRef.current = null;
      }
    };
  }, [isConnected, callState.remotePeerId, effectiveUserId, getPeerEmail, showExchangedEmails, isGuestUser]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full flex flex-col items-stretch gap-4 sm:gap-6">
      <Card className="w-full bg-black backdrop-blur-xl shadow-2xl border-0 sm:border sm:border-white/10 relative overflow-hidden rounded-none sm:rounded-3xl">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.07),transparent_60%)]" />

        <CardContent className="flex flex-col gap-3 sm:gap-6 p-0 sm:p-4 md:p-6 lg:p-8 relative z-10">

          {/* Mobile View: Buttons positioned above user's head in video area - MOVED TO VIDEO CONTAINER */}

          <div className="flex flex-col items-center w-full gap-4 sm:gap-6 md:gap-8">
            {isConnected && callState.isRematch && (
              <div className="mb-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  🔄 Rematch
                </Badge>
              </div>
            )}

            <div className="w-full">
              <div
                onClick={
                  callState.connectionState === "IDLE" || callState.connectionState === "ERROR"
                    ? gatedStart
                    : isSearching
                    ? handleStopSearching
                    : undefined
                }
                className={`relative w-full aspect-[9/16] sm:aspect-video min-h-[96vh] sm:min-h-[80vh] lg:min-h-[85vh] xl:min-h-[88vh] 2xl:min-h-[90vh] rounded-none sm:rounded-3xl overflow-hidden border-0 sm:border border-white/10 bg-black shadow-2xl transition-all duration-500 ${
                  !isConnected && !isConnecting ? "cursor-pointer hover:scale-[1.01]" : "cursor-default"
                }`}
              >
                <div className="absolute inset-x-0 top-0 z-40 grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-white/10 bg-black/90 px-2 backdrop-blur-xl sm:px-4">
                  <div className="flex min-w-0 justify-start">
                    {showInCallActionOverlays && callState.remotePeerId && (
                      <MarketplaceSection
                        toUserId={callState.remotePeerId}
                        embedMode
                        onGiftSent={(itemName) => {
                          setGiftAnimationItem(itemName);
                          setShowGiftAnimation(true);
                        }}
                      />
                    )}
                  </div>
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleMobilePrimaryAction();
                    }}
                    disabled={mobileActionBusy}
                    className="h-11 min-w-[7rem] shrink-0 rounded-full border border-red-300/40 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-5 text-sm font-extrabold tracking-wide text-white shadow-[0_10px_26px_rgba(220,38,38,0.45)] transition-all duration-300 hover:from-red-500 hover:via-rose-500 hover:to-red-600 active:scale-95 disabled:opacity-70 sm:h-12 sm:min-w-[10rem] sm:px-7 sm:text-base"
                  >
                    {mobileActionBusy ? "..." : isStartState ? "Start" : "Next"}
                  </Button>
                  <div className="flex min-w-0 justify-end">
                    {isConnected && (
                      <ViralClipEngine
                        active={showInCallActionOverlays}
                        roomName={callState.roomName}
                        userId={effectiveUserId}
                        username={(userEmail?.split("@")[0] || "caakus").slice(0, 20)}
                        localContainer={localVideoRef}
                        remoteContainer={remoteVideoRef}
                      />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_65%)]" />

                {moderationNotice && (
                  <ModerationBanner
                    message={moderationNotice}
                    className="absolute left-1/2 top-16 z-50 w-[min(18rem,86%)] -translate-x-1/2"
                  />
                )}

                {isConnected ? (
                  <>
                    {/* Split Screen Layout - Vertical on Mobile, Horizontal on Web */}
                    <div className="absolute inset-x-0 bottom-0 top-16 flex flex-col sm:flex-row">
                      {/* Remote User Video - Top on Mobile, Left on Web */}
                      <div className="relative w-full h-1/2 sm:w-1/2 sm:h-full bg-black/80 border-b-2 sm:border-b-0 sm:border-r-2 border-white/20">
                        <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full object-cover" />
                        {moderationBlackout && <div className="absolute inset-0 z-40 bg-black" />}
                        {/* Discreet report control — tucked in the corner, never over Match / Skip */}
                        <div className="absolute bottom-2 right-2 z-30">
                          <ReportButton
                            peerId={callState.remotePeerId}
                            roomName={callState.roomName}
                            onReported={() => {
                              setModerationNotice("Report sent. Match ended.");
                              void rtcService.current.leaveChannel();
                              setCallState((prev) => ({ ...prev, connectionState: "IDLE", remotePeerId: null, roomName: null }));
                              window.setTimeout(() => setModerationNotice(null), 5000);
                            }}
                          />
                        </div>
                        {!remoteVideoActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900">
                            {/* Blurry silhouette placeholder - looks like someone is there */}
                            <div className="relative flex flex-col items-center gap-3">
                              {/* Silhouette head */}
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-500/40 to-gray-600/30 blur-[2px] animate-pulse" />
                              {/* Silhouette body */}
                              <div className="w-24 h-12 sm:w-32 sm:h-16 rounded-t-full bg-gradient-to-br from-gray-500/30 to-gray-600/20 blur-[3px] animate-pulse" style={{ animationDelay: '0.3s' }} />
                            </div>
                          </div>
                        )}
                        {/* Partner Label - Live in Center */}
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-1.5 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            {t('common.live')}
                          </Badge>
                        </div>
                        {/* Partner Name - Top Left */}
                        {callState.partnerName && (
                          <div className="absolute top-3 left-3 z-10">
                            <Badge variant="secondary" className="bg-white/15 text-white border border-white/20 shadow-sm">
                              {callState.partnerName}
                            </Badge>
                          </div>
                        )}

                        {/* Challenge/Fun Button preserved for a future combined actions menu.
                        {showInCallActionOverlays && (
                          <div className="absolute bottom-4 right-3 z-20 hidden sm:block">
                            <ChallengeInterface peerId={callState.remotePeerId!} roomName={callState.roomName} />
                          </div>
                        )} */}
                      </div>

                      {/* Local User Video - Bottom on Mobile, Right on Web */}
                      <div className="relative w-full h-1/2 sm:w-1/2 sm:h-full bg-black/80">
                        {callState.isCameraOn ? (
                          <div ref={localVideoRef} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-sm bg-black/60">
                            {t('audioCall.cameraOff')}
                          </div>
                        )}
                        {moderationBlackout && <div className="absolute inset-0 z-40 bg-black" />}
                        
                        {/* Mobile brand bar */}
                        {showInCallActionOverlays && (
                          <div className="absolute top-3 left-0 right-0 z-20 sm:hidden flex items-center justify-center px-2 min-w-0">
                            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none shrink-0">
                              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-white/20 shadow-lg">
                                <img 
                                  src="/logo.webp" 
                                  alt={t('common.logoAlt')} 
                                  width={24}
                                  height={24}
                                  decoding="async"
                                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                                />
                                <span className="text-white font-bold text-xs sm:text-sm tracking-wide hidden min-[360px]:inline">caakus.com</span>
                              </div>
                            </div>
                            {/* Challenge button preserved in source; replaced by Create viral clip.
                            <div className="shrink-0 min-w-0 max-w-[45%] flex justify-end">
                              <ChallengeInterface peerId={callState.remotePeerId!} roomName={callState.roomName} />
                            </div> */}
                          </div>
                        )}
                        {/* Caakus Watermark Logo - Desktop (unchanged) */}
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block">
                          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 shadow-lg">
                            <img 
                              src="/logo.webp" 
                              alt={t('common.logoAlt')} 
                              width={28}
                              height={28}
                              decoding="async"
                              className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                            />
                            <span className="text-white font-bold text-sm sm:text-base tracking-wide">caakus.com</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Network Warning - Positioned at top right */}
                    {showNetworkWarning && (
                      <div className="absolute top-3 right-3 max-w-[70%] z-20">
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1.5 shadow-sm">
                          <Zap className="w-3.5 h-3.5" />
                          {t('audioCall.networkWeakBadge')}
                        </Badge>
                        {(networkReason || networkHint) && (
                          <div className="mt-1 text-[11px] text-amber-100/90 bg-black/40 px-2 py-1 rounded-md inline-block">
                            {networkReason ? `${networkReason}${networkHint ? " • " : ""}` : ""}
                            {networkHint || ""}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : isSearching || isConnecting ? (
                  <>
                    {/* Split Screen Layout - Vertical on Mobile, Horizontal on Web */}
                    <div className="absolute inset-0 flex flex-col sm:flex-row">
                      {/* Remote/Partner Side - Top on Mobile, Left on Web */}
                      <div className="relative w-full h-1/2 sm:w-1/2 sm:h-full bg-black/80 border-b-2 sm:border-b-0 sm:border-r-2 border-white/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center space-y-3">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border-4 border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
                            <div className="text-gray-200 text-sm sm:text-base font-semibold">
                              {/* No peer is really connected yet: always "Searching…" */}
                              {t('audioCall.searchingForMatch')}
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">

                          {callState.partnerName && (
                            <Badge variant="secondary" className="bg-white/15 text-white border border-white/20 shadow-sm">
                              {callState.partnerName}
                            </Badge>
                          )}
                        </div>

                        {/* Challenge button preserved in source; replaced by Create viral clip.
                        {callState.remotePeerId && (
                          <div className="absolute bottom-4 right-3 z-20 hidden sm:block">
                            <ChallengeInterface peerId={callState.remotePeerId} roomName={callState.roomName} />
                          </div>
                        )} */}
                      </div>

                      {/* Local User Side - Bottom on Mobile, Right on Web */}
                      <div className="relative w-full h-1/2 sm:w-1/2 sm:h-full bg-black/80">
                        {callState.isCameraOn ? (
                          <div ref={localVideoRef} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-sm bg-black/60">
                            {t('audioCall.cameraOffPreview')}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        
                        {/* Mobile brand bar */}
                        {callState.remotePeerId && (
                          <div className="absolute top-3 left-0 right-0 z-20 sm:hidden flex items-center justify-center px-2 min-w-0">
                            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none shrink-0">
                              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-white/20 shadow-lg">
                                <img 
                                  src="/logo.webp" 
                                  alt={t('common.logoAlt')} 
                                  width={24}
                                  height={24}
                                  decoding="async"
                                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                                />
                                <span className="text-white font-bold text-xs sm:text-sm tracking-wide hidden min-[360px]:inline">caakus.com</span>
                              </div>
                            </div>
                            {/* Challenge button preserved in source; replaced by Create viral clip.
                            <div className="shrink-0 min-w-0 max-w-[45%] flex justify-end">
                              <ChallengeInterface peerId={callState.remotePeerId} roomName={callState.roomName} />
                            </div> */}
                          </div>
                        )}
                        {/* Caakus Watermark Logo - Desktop */}
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block">
                          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 shadow-lg">
                            <img 
                              src="/logo.webp" 
                              alt={t('common.logoAlt')} 
                              width={28}
                              height={28}
                              decoding="async"
                              className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                            />
                            <span className="text-white font-bold text-sm sm:text-base tracking-wide">caakus.com</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Network Warning - Positioned at top right */}
                    {showNetworkWarning && (
                      <div className="absolute top-3 right-3 max-w-[70%] z-20">
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1.5 shadow-sm">
                          <Zap className="w-3.5 h-3.5" />
                          {t('audioCall.networkWeakBadge')}
                        </Badge>
                        {(networkReason || networkHint) && (
                          <div className="mt-1 text-[11px] text-amber-100/90 bg-black/40 px-2 py-1 rounded-md inline-block">
                            {networkReason ? `${networkReason}${networkHint ? " • " : ""}` : ""}
                            {networkHint || ""}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {guestGating && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-[2px]">
                        <span className="relative flex h-24 w-24 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500/30" />
                          <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-fuchsia-500/30 [animation-delay:300ms]" />
                          <span className="relative inline-flex h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 shadow-[0_0_30px_rgba(168,85,247,0.8)]" />
                        </span>
                        <p className="text-sm font-semibold text-white/90 animate-pulse">Searching for a peer…</p>
                      </div>
                    )}
                    {/* Globe 2x bigger on mobile and laptop */}
                    <div className="w-[min(384px,95vw)] h-[min(384px,95vw)] sm:w-[min(448px,90vw)] sm:h-[min(448px,90vw)] md:w-[min(576px,85vw)] md:h-[min(576px,85vw)] opacity-90">
                      <LottieAnimation animationData={globeAnimation} loop={true} autoplay={true} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-3 sm:space-y-4 px-4 w-full">
              <div className="flex items-center gap-2 justify-center">
                <Button
                  variant="ghost"
                  onClick={
                    callState.connectionState === "IDLE" || callState.connectionState === "ERROR"
                      ? gatedStart
                      : isSearching
                      ? handleStopSearching
                      : () => {}
                  }
                  disabled={isConnecting}
                  className="bg-transparent hover:bg-transparent text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight p-5 sm:p-6 md:p-7 z-99 cursor-pointer disabled:opacity-50 min-h-[52px] sm:min-h-[60px] md:min-h-[68px]"
                >
                  {isConnected ? (
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                      {t('audioCall.connected')}
                    </span>
                  ) : callState.connectionState === "RECONNECTING" ? (
                    <span className="inline-flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      {t('audioCall.reconnecting')}
                    </span>
                  ) : isConnecting || isSearching ? (
                    <span className="inline-flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      {t('audioCall.searchingForMatch')}
                    </span>

                  ) : callState.connectionState === "ERROR" ? (
                    <span className="inline-flex items-center gap-2">
                      <Users className="w-5 h-5 text-rose-500" />
                      {t('audioCall.tryAgain')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2.5 sm:gap-3">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-500" />
                      {t('audioCall.tapToStart')}
                    </span>
                  )}
                </Button>

                {isConnected && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('common.live')}
                  </Badge>
                )}
                {callState.connectionState === "CONNECTING" && (
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 shadow-sm">
                    <Zap className="w-3.5 h-3.5" />
                    {t('audioCall.connectingLabel')}
                  </Badge>
                )}
                {isReconnecting && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1.5 shadow-sm">
                    <Zap className="w-3.5 h-3.5" />
                    {t('audioCall.reconnecting').replace('...', '')}
                  </Badge>
                )}
              </div>

              {callState.errorMessage && (
                <Alert className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {callState.errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {!isSearching && (
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                  {cameraPermissionStatus === 'pending'
                    ? `📷 ${t('audioCall.allowCamera')}`
                    : micPermissionStatus === 'pending'
                    ? `🎤 ${t('audioCall.allowMic')}`
                    : isConnected
                    ? callState.partnerIsGuest
                      ? `🎭 ${t('audioCall.talkingWithGuest')}`
                      : callState.partnerName
                      ? `🎥 ${t('audioCall.connectedWith', { name: callState.partnerName })}`
                      : t('audioCall.enjoyChat')
                    : isConnecting
                    ? callState.partnerIsGuest
                      ? t('audioCall.connectingWithGuest')
                      : callState.partnerName
                      ? t('audioCall.connectingWithPartner', { name: callState.partnerName })
                      : t('audioCall.connectingToMatch')
                    : t('audioCall.tapToConnect')}
                </p>
              )}

              {isConnected && callState.distanceKm !== null && callState.distanceKm < 50 && (
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    📍 {callState.distanceKm < 0.5 ? t('audioCall.lessThan500mAway') : t('audioCall.kmAway', { km: callState.distanceKm.toFixed(1) })}
                  </Badge>
                </div>
              )}

              {isConnected && (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={handleToggleMute}
                    variant="ghost"
                    aria-label={t('audioCall.ariaMute')}
                    className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-99"
                  >
                    {callState.isMuted ? (
                      <MicOff className="w-6 h-6 text-red-600" />
                    ) : (
                      <Mic className="w-6 h-6 text-green-600" />
                    )}
                  </Button>
                  <Button
                    onClick={handleToggleCamera}
                    variant="ghost"
                    aria-label={t('audioCall.ariaCamera')}
                    className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-99"
                  >
                    {callState.isCameraOn ? (
                      <Video className="w-6 h-6 text-green-600" />
                    ) : (
                      <VideoOff className="w-6 h-6 text-red-600" />
                    )}
                  </Button>
                  {hasMultipleCameras && callState.isCameraOn && (
                    <Button
                      onClick={handleSwitchCamera}
                      variant="ghost"
                      disabled={switchingCamera}
                      aria-label={isRearCamera ? 'Switch to front camera' : 'Switch to rear camera'}
                      title={isRearCamera ? 'Front camera' : 'Rear camera'}
                      className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-99 disabled:opacity-60"
                    >
                      <SwitchCamera className={`w-6 h-6 ${isRearCamera ? 'text-blue-500' : 'text-gray-700 dark:text-gray-200'} ${switchingCamera ? 'animate-pulse' : ''}`} />
                    </Button>
                  )}
                </div>
              )}

              {isConnected && <CallTimerBadge timer={callTimer} />}

              {isSearching && (
                <Button
                  onClick={handleStopSearching}
                  className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white font-semibold hover:from-blue-800 hover:via-blue-900 hover:to-indigo-950 shadow-lg transition-all duration-300"
                >
                  {t('audioCall.stopSearching')}
                </Button>
              )}
            </div>
          </div>

          {/* Desktop View: Request Photo button */}
          {!isSearching && isConnected && (
            <div className="hidden sm:flex flex-row items-center justify-center gap-4 w-full mt-4">
              <Button
                onClick={requestProfilePhoto}
                disabled={!callState.remotePeerId || !callState.roomName}
                className="relative px-4 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all duration-500 transform hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] overflow-hidden group border border-white/10 text-center whitespace-normal leading-snug min-h-fit h-14"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1200ms] ease-in-out" />
                <span className="relative z-10">{t('audioCall.requestPhoto')}</span>
              </Button>
            </div>
          )}

          {/* Mobile View: Request Photo button */}
          {!isSearching && isConnected && (
            <div className="flex sm:hidden w-full mt-2 justify-center">
              <Button
                onClick={requestProfilePhoto}
                disabled={!callState.remotePeerId || !callState.roomName}
                className="relative px-3 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all duration-500 transform hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] overflow-hidden group border border-white/10 text-center whitespace-normal break-words max-w-[7.5rem] leading-snug min-h-fit h-14"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1200ms] ease-in-out" />
                <span className="relative z-10">{t('audioCall.requestPhoto')}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {viralShare.shouldPrompt && !isConnected && callState.connectionState === "IDLE" && (
        <div className="w-full px-3 sm:px-0">
          <VipSharePrompt onDismiss={viralShare.dismiss} onShared={viralShare.claimVip} />
        </div>
      )}

      {!isGuestUser && !hasPremiumAccess && callState.connectionState === "IDLE" && (
        <ShareToEarnBanner referralCode={null} userId={userId} />
      )}

      <CallControls
        timer={callTimer}
        onNext={handleNext}
        onFriend={handleFriend}
        isConnected={isConnected}
        showCustomization
        featureTrial={featureTrial}
        userIsPremium={hasPremiumAccess}
        isGuestUser={isGuestUser}
        onCustomize={() => {
          if (filtersUnlocked) {
            setShowCustomization(true);
          } else {
            setPremiumConversionContext("customize");
            setShowPremiumConversion(true);
          }
        }}
        selectedTags={matchTags}
        showPremiumFilters
        onPremiumFilters={() => {
          if (filtersUnlocked) {
            setShowPremiumFilters(true);
          } else {
            setPremiumConversionContext("filter_gender");
            setShowPremiumConversion(true);
          }
        }}
        hasActiveFilters={!!(userPreferredGender || (userPreferredRegions && userPreferredRegions.length > 0))}
        showViewFriends={!isGuestUser}
      />

      <CallCustomizationModal
        open={showCustomization}
        onOpenChange={setShowCustomization}
        selectedTags={matchTags}
        onSave={saveMatchTags}
        isSaving={savingMatchTags}
      />

      {/* Premium Filters Modal (premium users only) */}
      {filtersUnlocked && (
        <PremiumFiltersModal
          open={showPremiumFilters}
          onOpenChange={setShowPremiumFilters}
          currentGender={userGender}
          currentPreferredGender={userPreferredGender}
          currentPreferredRegions={userPreferredRegions}
          onSave={handlePremiumFiltersSave}
          isPending={savingPremiumFilters}
        />
      )}

      {/* Frustration-driven Premium Conversion Modal (free users trying Pro features) */}
      <PremiumConversionModal
        open={showPremiumConversion}
        onOpenChange={setShowPremiumConversion}
        context={premiumConversionContext}
        userId={isGuestUser ? null : userId}
        onSignIn={onAuthRequired}
      />

      {/* Ephemeral: incoming photo request */}
      {incomingPhotoRequestFrom && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={declinePhotoRequest} />
          <div className="relative w-full max-w-md rounded-3xl bg-white/95 dark:bg-gray-900/95 p-6 shadow-2xl border border-white/20 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">📷</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">{t('audioCall.shareProfilePhoto')}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {t('audioCall.sharePhotoDisclaimer')}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold cursor-pointer shadow-lg hover:opacity-95 transition">
                {t('audioCall.choosePhoto')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void sharePhotoToRequester(f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <Button variant="outline" onClick={declinePhotoRequest} className="rounded-2xl">
                {t('audioCall.notNow')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ephemeral: received photo pop-up */}
      {ephemeralPhoto && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[min(22rem,calc(100vw-3rem))]">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-indigo-400/60 shadow-md bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                  <img src={ephemeralPhoto.dataUrl} alt={t('audioCall.sharedProfileAvatar')} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 dark:text-white truncate">{t('audioCall.profilePhoto')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {t('audioCall.disappearsIn', { seconds: photoSecondsLeft })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={clearEphemeralPhoto} className="rounded-2xl">
                {t('audioCall.close')}
              </Button>
            </div>

            {/* Progress bar (60s) */}
            <div className="h-1 bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-[width] duration-200"
                style={{ width: `${Math.max(0, Math.min(100, (photoSecondsLeft / 60) * 100))}%` }}
              />
            </div>

            {/* Larger preview (still professional, but contained) */}
            <div className="px-4 pb-4 pt-4">
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black">
                <img src={ephemeralPhoto.dataUrl} alt={t('audioCall.sharedProfile')} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}

      {friendRequests.incoming && (
        <IncomingFriendRequestModal onAccept={handleAcceptFriend} onDecline={handleDeclineFriend} />
      )}

      {friendRequests.exchangedEmails && (
        <ExchangedEmailsModal
          myEmail={friendRequests.exchangedEmails.myEmail}
          peerEmail={friendRequests.exchangedEmails.peerEmail}
          onClose={() =>
            setFriendRequests((prev) => ({
              ...prev,
              exchangedEmails: null,
            }))
          }
        />
      )}

      {/* Gift Animation (when you send) */}
      {showGiftAnimation && (
        <GiftFloatingAnimation
          itemName={giftAnimationItem}
          onComplete={() => setShowGiftAnimation(false)}
        />
      )}

      {/* Gift Animation (when you receive during call) */}
      {showReceivedGiftPopup && (
        <GiftFloatingAnimation
          itemName={receivedGiftItem}
          variant="received"
          subtitle="Gift received! Congratulations!"
          detail={`${receivedGiftSender} · +$${receivedGiftAmount.toFixed(2)}${receivedGiftMessage ? ` · ${receivedGiftMessage}` : ""}`}
          onComplete={() => setShowReceivedGiftPopup(false)}
        />
      )}

    </div>
  );
};

export default AudioCall;
