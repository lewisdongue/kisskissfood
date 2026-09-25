import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { useBrowserPreferences } from "../hooks/useBrowserPreferences";
import type { LanguageCode } from "../types";
import NotificationService from "../services/notificationService";
import { Analytics } from "@vercel/analytics/react";
import { setUserOnline, setUserOffline } from "../services/supabaseService";
import { supabase } from "../config/supabase";
import {
  Globe2,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  LineChart,
  Coins,
  Lock,
  Sparkles,
  Target,
  Crown,
  Flame,
  Play,
  X,
  Hotel,
  Youtube,
  Laptop,
  GraduationCap,
  Smartphone,
  MessageCircle,
  Heart,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import i18n from "../i18n";
import MicrophoneButton from "@/components/MicrophoneButton";
import { useNavigate } from "@/lib/router-compat";
import { PWAInstallGuide } from "@/components/PWAInstallGuide";
import { shouldShowVerifiedBadge, VerifiedAvatarWrapper } from "@/components/VerifiedBadge";
import {
  getAchievements,
  getUserAchievementIds,
  getLevelInfo,
  type Achievement,
} from "../services/progressionService";
import { getYuyuLiveStats, YUYU_TOTAL_SUPPLY } from "../services/yuyucoinPriceService";
import { prefetchLeaderboard } from "../hooks/useLeaderboardCache";
import { playCue } from "@/utils/uiSound";


const AuthModal = lazy(() => import("../components/AuthModal").then(m => ({ default: m.AuthModal })));
const AnonymousChatInterface = lazy(() => import("@/components/AnonymousChatInterface").then(m => ({ default: m.AnonymousChatInterface })));
const GlobalConnectionInterface = lazy(() => import("@/components/GlobalConnectionInterface").then(m => ({ default: m.GlobalConnectionInterface })));
const AnonymousVoiceInterface = lazy(() => import("@/components/AnonymousVoiceInterface").then(m => ({ default: m.AnonymousVoiceInterface })));
const MessengerFAB = lazy(() => import("@/components/MessengerFAB").then(m => ({ default: m.MessengerFAB })));
const InvestYuyucoinModal = lazy(() => import("@/components/InvestYuyucoinModal").then(m => ({ default: m.InvestYuyucoinModal })));
const CausticsBackground = lazy(() => import("@/components/CausticsBackground").then(m => ({ default: m.CausticsBackground })));
// Defer realtime-connected components €” they each open a Supabase subscription on mount
const LevelProgressBar = lazy(() => import("@/components/LevelProgressBar").then(m => ({ default: m.LevelProgressBar })));
const LevelBadge = lazy(() => import("@/components/LevelBadge").then(m => ({ default: m.LevelBadge })));

const founderImage = new URL("@/assets/founder.jpeg", import.meta.url).href;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ISOLATED LIVE COUNTER €” renders in its own subtree to prevent full Home
// re-renders every 3 seconds just from the counter ticking
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const LivePeopleCounter = memo(function LivePeopleCounter({ t }: { t: (k: string) => string }) {
  // Deterministic initial value so SSR HTML matches the first client render.
  const [count, setCount] = useState(47500);

  useEffect(() => {
    setCount(Math.floor(45000 + Math.random() * 5000));
  }, []);



  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const r = Math.random();
        let delta = 0;
        if (r < 0.70) delta = Math.floor(50 + Math.random() * 250);
        else if (r < 0.90) delta = Math.floor(-20 + Math.random() * 40);
        else delta = -Math.floor(50 + Math.random() * 150);
        const next = prev + delta;
        if (next > 80000) return 80000 - Math.floor(Math.random() * 500);
        if (next < 30000) return 30000 + Math.floor(Math.random() * 500);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-purple-500/25 backdrop-blur-md border-2 border-fuchsia-400/40 shadow-[0_0_24px_rgba(147,51,234,0.35),0_0_16px_rgba(236,72,153,0.2)]">
      <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 animate-ping opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(236,72,153,0.7)]" />
      </span>
      <span className="text-sm sm:text-base font-semibold text-white">
        <span className="font-black text-purple-200 tabular-nums">{count.toLocaleString()}</span>
        <span className="text-white/90 font-medium ml-1.5">{t('home.onlineNow')}</span>
      </span>
    </div>
  );
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ADVERTISING SPOT INTERFACE & TYPES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
interface AdvertisingSpot {
  id: number;
  isOccupied: boolean;
  businessName?: string;
  businessUrl?: string;
  businessDescription?: string;
  logoUrl?: string;
  expiresAt?: string;
  purchasedAt?: string;
  durationDays?: number;
  x: number;
  y: number;
  vx: number;       // horizontal velocity (px per tick)
  vy: number;
  lane: number;      // row lane (0-9) for highway-style layout
  speed: number;     // base speed multiplier
  size: number;      // sphere diameter scale (0.8 - 1.2)
  angle: number;
  radius: number;
}

interface PurchaseFormData {
  businessName: string;
  businessUrl: string;
  businessDescription: string;
  logoFile: File | null;
  durationDays: number;
}

// Single design for all 50 spots: same card layout and blue accent. compact = smaller for train so more spots visible per row.
const SpotCard = memo(function SpotCard({
  spot,
  displayIndex,
  onSpotClick,
  t,
  compact = false,
}: {
  spot: AdvertisingSpot;
  displayIndex: number;
  onSpotClick: (spot: AdvertisingSpot) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
  compact?: boolean;
}) {
  const daysLeft = spot.expiresAt
    ? Math.max(0, Math.ceil((new Date(spot.expiresAt).getTime() - Date.now()) / 86400000))
    : 0;

  const height = compact
    ? "h-[196px] sm:h-[216px] md:h-[232px]"
    : "h-[260px] sm:h-[300px] md:h-[330px]";
  const logoSize = compact ? "w-14 h-14 sm:w-16 sm:h-16" : "w-20 h-20 sm:w-24 sm:h-24";

  if (!spot.isOccupied) {
    return (
      <div
        onClick={() => onSpotClick(spot)}
        className={`group holo-panel-empty holo-corners cursor-pointer overflow-hidden rounded-2xl ${height}`}
      >
        <div className="relative flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
            <Building2 className="h-5 w-5 text-white/25" />
          </div>
          <span className="hud-label">{t("home.freeSpot")}</span>
          <span className="text-[11px] font-medium text-cyan-300/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {t("home.clickToClaim")}
          </span>
          <span className="absolute left-3 top-3 font-mono text-[10px] tracking-widest text-white/25">
            {String(displayIndex).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSpotClick(spot)}
      className={`group holo-panel holo-corners cursor-pointer overflow-hidden rounded-2xl ${height}`}
    >
      {/* scan sheen */}
      <span className="pointer-events-none absolute inset-0 -translate-y-full bg-gradient-to-b from-transparent via-violet-400/10 to-transparent transition-transform duration-[1200ms] group-hover:translate-y-full" />

      <div className="relative flex h-full flex-col items-center justify-center gap-3 p-4 sm:p-5">
        <div className="relative shrink-0">
          <span className="absolute -inset-3 rounded-full bg-violet-500/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
          {spot.logoUrl ? (
            <div className={`relative ${logoSize} overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]`}>
              <img
                src={spot.logoUrl}
                alt={spot.businessName || ""}
                className="h-full w-full object-contain p-2"
                loading="lazy"
              />
            </div>
          ) : (
            <div className={`relative ${logoSize} flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]`}>
              <Building2 className="h-7 w-7 text-violet-300/70" />
            </div>
          )}
        </div>

        <div className="min-w-0 w-full px-1 text-center">
          <h4 className="line-clamp-2 text-[clamp(0.75rem,1.9vw,1.05rem)] font-bold leading-tight tracking-tight text-white">
            {spot.businessName}
          </h4>
          {spot.businessDescription ? (
            <p
              className="mt-1 line-clamp-2 text-[clamp(0.6rem,1.3vw,0.78rem)] leading-snug text-white/45"
              title={spot.businessDescription}
            >
              {spot.businessDescription}
            </p>
          ) : null}
        </div>

        {spot.expiresAt && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_2px_rgba(124,92,255,0.6)]" />
            <span className="font-mono text-[10px] tracking-wider text-white/60">{daysLeft}D</span>
          </div>
        )}

        <span className="absolute left-3 top-3 font-mono text-[10px] tracking-widest text-white/35">
          {String(displayIndex).padStart(2, "0")}
        </span>
        <span className="absolute right-3 top-3 flex h-6 w-6 translate-x-1 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/15 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowRight className="h-3 w-3 text-violet-200" />
        </span>
      </div>
    </div>
  );
});

// Build 50 default spots (no DB). Used so all 50 are in the DOM from first render and move.
function buildDefaultSpots50(): AdvertisingSpot[] {
  const COLS = 10;
  const ROWS = 5;
  const spots: AdvertisingSpot[] = [];
  for (let i = 0; i < 50; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const startX = ((col + 0.5) / COLS) * 100;
    const startY = ((row + 0.5) / ROWS) * 100;
    spots.push({
      id: i + 1,
      isOccupied: false,
      x: startX,
      y: startY,
      vx: 0.035,
      vy: 0,
      lane: row,
      speed: 0.035,
      size: 1,
      angle: 0,
      radius: 0,
    });
  }
  return spots;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN HOME COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const defaultAdvertisingSpots = useMemo(() => buildDefaultSpots50(), []);

  const { user, login, signup, updateUserData, logout } = useAuth();
  const authedUser = user && !('isGuest' in user) ? user : null;
  const { browserLanguage } = useBrowserPreferences();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(browserLanguage);
  const [micDenied, setMicDenied] = useState(false);
  const [homeAchievements, setHomeAchievements] = useState<Achievement[]>([]);
  const [homeAchievementIds, setHomeAchievementIds] = useState<string[]>([]);
  const [showAdvertising, setShowAdvertising] = useState(false); 

  // Prefetch leaderboard data in background for instant display when navigating
  useEffect(() => {
    prefetchLeaderboard();
  }, []);

  // Advertising spots state: always 50 so all spots are displayed and move (Supabase or fallback)
  const [advertisingSpots, setAdvertisingSpots] = useState<AdvertisingSpot[]>(defaultAdvertisingSpots);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormData>({
    businessName: "",
    businessUrl: "",
    businessDescription: "",
    logoFile: null,
    durationDays: 30
  });

  // livePeopleCount is now in the isolated <LivePeopleCounter> component €” no re-renders here
  const [yuyuTotalValueUsd, setYuyuTotalValueUsd] = useState<number | null>(null);


   
  useEffect(() => {
    const fetchYuyuValue = async () => {
      try {
        const stats = await getYuyuLiveStats();

        const outstandingSupply = Math.max(0, YUYU_TOTAL_SUPPLY - (stats.total_burned ?? 0));
        const marketCapUsd = outstandingSupply * stats.current_price;
        setYuyuTotalValueUsd((prev) => (prev === marketCapUsd ? prev : marketCapUsd));
      } catch (error) {
        console.error("Error fetching YUYU value:", error);
        setYuyuTotalValueUsd(null);
      }
    };

    // Update every 30 seconds €” price doesn't change that fast and 10s was wasteful
    const liveInterval = setInterval(fetchYuyuValue, 30000);
    fetchYuyuValue();

    // 2. No realtime here on purpose: yuyu_price is a global table, so a
    // postgres_changes subscription fans every price tick out to every single
    // visitor on the landing page. The price only moves once a minute, so the
    // 30s poll above is strictly cheaper and visually identical.
    return () => {
      clearInterval(liveInterval);
    };
  }, []);

  const formatYuyuTotalValue = (usd: number): string => {
    if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`;
    if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`;
    if (usd >= 1e3) return `$${(usd / 1e3).toFixed(1)}K`;
    return `$${usd.toFixed(2)}`;
  };

  // Endowment: show welcome bonus toast and trigger YUYU counter pulse after first-time signup
  useEffect(() => {
    if (!authedUser) return;
    try {
      if (sessionStorage.getItem('caakus_show_welcome_bonus') === '1') {
        sessionStorage.removeItem('caakus_show_welcome_bonus');
        toast.success(t('welcomeBonus.toast'), { duration: 6000, icon: '' });
        window.dispatchEvent(new CustomEvent('caakus-welcome-bonus-shown'));
      }
    } catch {
      // ignore
    }
  }, [authedUser, t]);

  // CRITICAL FIX: Only use total_xp, not yuyu_score (old data might be inconsistent)
  const xpTotal = authedUser?.total_xp ?? 0;
  const fallbackLevelInfo = getLevelInfo(xpTotal);
  // Always prefer database level over calculated level
  const level = authedUser?.level ?? fallbackLevelInfo.level;
  
  const streakCount = authedUser?.streak_count ?? 0;
  const streakLabel = streakCount > 0 ? `${streakCount} streak!` : "Start your streak!";
  const earnedBadges = homeAchievements.filter((achievement) =>
    homeAchievementIds.includes(achievement.id)
  );

  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const closeFeature = () => setActiveFeature(null);

  // Defer below-the-fold sections until they scroll into view
  // AudioCall is on its own /call page €” leaderboard is inline toggle only
  const [adsVisible, setAdsVisible] = useState(false);
  const adsSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const makeObserver = (
      ref: React.RefObject<HTMLDivElement | null>,
      setter: (v: boolean) => void,
      rootMargin = "600px"
    ) => {
      const el = ref.current;
      if (!el) {
        const t = setTimeout(() => setter(true), 2000);
        return { disconnect: () => clearTimeout(t) };
      }
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true);
            obs.disconnect();
          }
        },
        { rootMargin }
      );
      obs.observe(el);
      const fallback = setTimeout(() => setter(true), 3000);
      return {
        disconnect: () => {
          obs.disconnect();
          clearTimeout(fallback);
        },
      };
    };

    const o3 = makeObserver(adsSentinelRef, setAdsVisible, "600px");

    return () => {
      o3?.disconnect();
    };
  }, []);

  // Scroll to top once on mount.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((permissionStatus) => {
          if (permissionStatus.state === "denied") {
            setMicDenied(true);
          } else if (permissionStatus.state === "prompt") {
            setMicDenied(true);
          } else {
            setMicDenied(false);
          }
          permissionStatus.onchange = () => {
            setMicDenied(permissionStatus.state !== "granted");
          };
        })
        .catch(() => {
          setMicDenied(true);
        });
    } else {
      setMicDenied(true);
    }
  }, []);

  // Auth modal is action-triggered only: no time-delay prompt for guests.
  useEffect(() => {
    if (authedUser) {
      setUserOnline(authedUser.id, authedUser.language);
      if (!localStorage.getItem("audioChat_language")) {
        setSelectedLanguage(authedUser.language as LanguageCode);
        i18n.changeLanguage(authedUser.language);
      }
      NotificationService.requestPermission().then((token) => {
        if (token) {
          NotificationService.saveFCMToken(authedUser.id, token);
        }
      });
      NotificationService.setupMessageListener(() => {
        // no-op in production (avoid console noise)
      });
      const unsubscribeNotifications = NotificationService.subscribeToNotifications(
        authedUser.id,
        () => {
          // handled by NotificationService (browser notification)
        }
      );
      return () => {
        if (unsubscribeNotifications) {
          unsubscribeNotifications();
        }
        setUserOffline(authedUser.id);
      };
    }
    if (!localStorage.getItem("audioChat_language")) {
      setSelectedLanguage(browserLanguage);
      i18n.changeLanguage(browserLanguage);
    }
    return;
  }, [authedUser, browserLanguage]);

  useEffect(() => {
    let cancelled = false;
    if (!authedUser) {
      setHomeAchievements([]);
      setHomeAchievementIds([]);
      return;
    }

    const loadBadges = async () => {
      const [allAchievements, unlockedIds] = await Promise.all([
        getAchievements(),
        getUserAchievementIds(authedUser.id),
      ]);
      if (cancelled) return;
      setHomeAchievements(allAchievements);
      setHomeAchievementIds(unlockedIds);
    };

    loadBadges();

    return () => {
      cancelled = true;
    };
  }, [authedUser?.id]);

  // 50 spots in 5 rows Ã— 10 columns (8€“10 per row). Responsive height and %-based spot size.
  const TOTAL_SPOTS = 50;
  const ROWS = 5;
  const COLS_PER_ROW = 10;

  useEffect(() => {
    const buildSpot = (i: number, dbSpot?: Record<string, unknown>): AdvertisingSpot => {
      const col = i % COLS_PER_ROW;
      const row = Math.floor(i / COLS_PER_ROW);
      const startX = ((col + 0.5) / COLS_PER_ROW) * 100;
      const startY = ((row + 0.5) / ROWS) * 100;
      const baseSpeed = 0.035;
      const direction = 1;

      return {
        id: i + 1,
        isOccupied: !!dbSpot,
        businessName: dbSpot?.business_name as string | undefined,
        businessUrl: dbSpot?.business_url as string | undefined,
        businessDescription: dbSpot?.business_description as string | undefined,
        logoUrl: (() => {
          const url = dbSpot?.logo_url as string | undefined;
          if (!url) return undefined;
          if (url.includes('/storage/v1/object/') && !url.includes('/object/public/')) {
            return url.replace('/storage/v1/object/', '/storage/v1/object/public/');
          }
          return url;
        })(),
        expiresAt: dbSpot?.expires_at as string | undefined,
        purchasedAt: dbSpot?.purchased_at as string | undefined,
        durationDays: dbSpot?.duration_days as number | undefined,
        x: startX,
        y: startY,
        vx: direction * baseSpeed,
        vy: 0,
        lane: row,
        speed: baseSpeed,
        size: 1,
        angle: 0,
        radius: 0,
      };
    };

    const loadSpots = async () => {
      try {
        const { data: activeSpots } = await supabase
          .from('advertising_spots')
          .select('*')
          .gt('expires_at', new Date().toISOString());

        const spotsById = new Map<number, Record<string, unknown>>();
        activeSpots?.forEach((spot: Record<string, unknown>) => {
          const spotId = Number(spot.spot_id);
          if (!Number.isNaN(spotId)) {
            spotsById.set(spotId, spot);
          }
        });

        const spots: AdvertisingSpot[] = [];
        for (let i = 0; i < TOTAL_SPOTS; i++) {
          const dbSpot = spotsById.get(i + 1);
          spots.push(buildSpot(i, dbSpot || undefined));
        }
        setAdvertisingSpots(spots);
      } catch {
        const spots: AdvertisingSpot[] = [];
        for (let i = 0; i < TOTAL_SPOTS; i++) {
          spots.push(buildSpot(i));
        }
        setAdvertisingSpots(spots);
      }
    };
    loadSpots();
  }, []);

  // Auto-expire spots that have passed their expiry date
  useEffect(() => {
    const checkExpiry = setInterval(() => {
      setAdvertisingSpots(prev => prev.map(spot => {
        if (spot.isOccupied && spot.expiresAt) {
          const now = new Date();
          const expiry = new Date(spot.expiresAt);
          if (now >= expiry) {
            return { ...spot, isOccupied: false, businessName: undefined, businessUrl: undefined, logoUrl: undefined, expiresAt: undefined, durationDays: undefined };
          }
        }
        return spot;
      }));
    }, 60000); // Check every minute
    return () => clearInterval(checkExpiry);
  }, []);

  // Normalize business URL so it opens as absolute (e.g. www.caakus.com -> https://www.caakus.com)
  const toAbsoluteBusinessUrl = useCallback((raw: string): string => {
    const url = raw.trim();
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url.replace(/^\/+/, '')}`;
  }, []);

  // Handle spot click - open business website in new tab or show purchase modal
  const handleSpotClick = useCallback((spot: AdvertisingSpot) => {
    if (spot.isOccupied && spot.businessUrl) {
      window.open(toAbsoluteBusinessUrl(spot.businessUrl), '_blank', 'noopener,noreferrer');
    } else if (!spot.isOccupied) {
      setSelectedSpot(spot.id);
      setShowPurchaseModal(true);
    }
  }, [toAbsoluteBusinessUrl]);

  const occupiedSpotsCount = useMemo(
    () => advertisingSpots.reduce((count, spot) => (spot.isOccupied ? count + 1 : count), 0),
    [advertisingSpots]
  );

  const visibleAdvertisingSpots = useMemo(() => {
    const total = 50;
    if (Array.isArray(advertisingSpots) && advertisingSpots.length >= total) {
      return advertisingSpots.slice(0, total);
    }
    return Array.from({ length: total }, (_, i) =>
      advertisingSpots?.[i] ?? defaultAdvertisingSpots[i] ?? defaultAdvertisingSpots[0]
    );
  }, [advertisingSpots, defaultAdvertisingSpots]);

  const advertisingRows = useMemo(
    () => ({
      row1: visibleAdvertisingSpots.slice(0, 17),
      row2: visibleAdvertisingSpots.slice(17, 34),
      row3: visibleAdvertisingSpots.slice(34, 50),
    }),
    [visibleAdvertisingSpots]
  );

  // Advertising spot pricing: standard $200/day & $5,000/month; founding members $50/day & $1,000/month
  const isFoundingMember = authedUser?.subscription_type === 'lifetime';
  const calculatePrice = (days: number, isFounding: boolean = isFoundingMember): number => {
    if (isFounding) {
      if (days < 30) return days * 50; // Founding: $50/day
      const fullMonths = Math.floor(days / 30);
      const remainingDays = days % 30;
      return fullMonths * 1000 + remainingDays * 50; // Founding: $1,000/month
    }
    if (days < 30) return days * 200; // Standard: $200/day
    const fullMonths = Math.floor(days / 30);
    const remainingDays = days % 30;
    return fullMonths * 5000 + remainingDays * 200; // Standard: $5,000/month
  };
  const dailyRate = isFoundingMember ? 50 : 200;
  const monthlyRate = isFoundingMember ? 1000 : 5000;

  // Handle purchase submission - Stripe checkout + Supabase storage
  const handlePurchaseSubmit = async () => {
    if (!purchaseForm.businessName || !purchaseForm.businessUrl || !purchaseForm.logoFile) {
      toast.error(t('home.fillRequiredFields'));
      return;
    }

    const totalPrice = calculatePrice(purchaseForm.durationDays);
    
    try {
      // 1. Upload logo to Supabase Storage
      const fileExt = purchaseForm.logoFile.name.split('.').pop();
      const fileName = `spot-${selectedSpot}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('advertising-logos')
        .upload(fileName, purchaseForm.logoFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('advertising-logos')
        .getPublicUrl(fileName);

      let logoUrl = urlData.publicUrl;
      // Ensure correct public bucket URL format (some Supabase versions omit /public/)
      if (logoUrl.includes('/storage/v1/object/') && !logoUrl.includes('/object/public/')) {
        logoUrl = logoUrl.replace('/storage/v1/object/', '/storage/v1/object/public/');
      }

      // 2. Create Stripe checkout session via edge function
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-ad-checkout', {
        body: {
          spotId: selectedSpot,
          businessName: purchaseForm.businessName,
          businessUrl: purchaseForm.businessUrl,
          businessDescription: purchaseForm.businessDescription.trim() || undefined,
          logoUrl,
          durationDays: purchaseForm.durationDays,
          totalPrice,
          isFoundingMember: !!isFoundingMember,
        }
      });

      if (checkoutError) {
        const err = checkoutError as { message?: string; context?: { body?: { error?: string } }; error?: string };
        const serverBody = checkoutData?.error && typeof checkoutData.error === "string" ? checkoutData.error : null;
        const fromContext = err?.context?.body?.error;
        const msg =
          serverBody ||
          fromContext ||
          err?.message ||
          "Could not reach checkout. Sign in and try again, or check that the function is deployed.";
        console.error("[Ad checkout] Invoke error:", checkoutError, "data:", checkoutData);
        toast.error(msg);
        return;
      }

      // Error in response body (e.g. function returned 400/500 with { error: "..." })
      const errMsg = checkoutData?.error;
      if (errMsg) {
        const text = typeof errMsg === "string" ? errMsg : t('home.checkoutFailed');
        toast.error(text);
        return;
      }

      // 3. Redirect to Stripe checkout
      const checkoutUrl = checkoutData?.url;
      if (checkoutUrl) {
        toast.success(t('home.redirectingStripe'));
        window.location.href = checkoutUrl;
        setShowPurchaseModal(false);
        setPurchaseForm({ businessName: "", businessUrl: "", businessDescription: "", logoFile: null, durationDays: 30 });
        return;
      }

      toast.error(t('home.noCheckoutLink'));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('home.paymentFailed');
      console.error("Purchase error:", error);
      toast.error(msg);
    }
  };


  const handleSignup = async (
    email: string,
    password: string,
    name: string,
    country: string,
    language: string
  ) => {
    try {
      const newUser = await signup(email, password, name, country, language);
      if (newUser) {
        setShowAuthModal(false);
        setSelectedLanguage(language as LanguageCode);
        toast.success(t("home.accountCreated"));
      } else {
        toast.error(t("home.accountCreateFailed"));
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(t("home.signupError"));
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        setShowAuthModal(false);
        handleLanguageChange(loggedInUser.language as LanguageCode);
        toast.success(t("home.welcomeBackUser", { name: loggedInUser.name }));
      } else {
        toast.error(t("home.loginError"));
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t("home.signinError"));
    }
  };

  const handleLanguageChange = (language: LanguageCode) => {
    setSelectedLanguage(language);
    window.localStorage.setItem("audioChat_language", language);
    i18n.changeLanguage(language);
    if (authedUser) {
      updateUserData({ language });
      setUserOnline(authedUser.id, language);
    }
  };

  return (
    <>
      <Suspense fallback={null}><CausticsBackground /></Suspense>
      
      <div className="min-h-screen w-full overflow-x-hidden relative z-10">

      <Navbar
        user={user}
        logout={logout}
        selectedLanguage={selectedLanguage}
        handleLanguageChange={handleLanguageChange}
        setShowAuthModal={setShowAuthModal}
      />

      {/* PWA Installation Guide - Below Header */}
      <div className="relative z-50">
        <PWAInstallGuide />
      </div>

      <main className="flex-1 flex flex-col items-center justify-start w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 relative z-10 animate-fade-in-up">
        {micDenied && <MicrophoneButton />}

        {/* HERO SECTION — OLED canvas, hairline glass, accent reserved for the CTA */}
        <div className="relative w-full max-w-6xl mb-6 sm:mb-8 px-0 rise-in">
          {/* Single, distant accent halo — barely there */}
          <div
            className="absolute -inset-10 rounded-[3rem] pointer-events-none opacity-40"
            style={{ background: 'radial-gradient(50% 45% at 50% 40%, rgba(124,92,255,0.18), transparent 70%)' }}
            aria-hidden
          />

          {/* Main hero card — 1px hairline glass on absolute black */}
          <div className="oled-glass relative overflow-hidden rounded-2xl sm:rounded-[1.75rem] p-4 sm:p-6 md:p-10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {/* Live online count + YUYU total value */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <LivePeopleCounter t={t} />
         
            </div>


            {/* Brand + Hero Title */}
            <div className="relative text-center mb-4 sm:mb-6 min-w-0 px-1">
              <div className="mb-3 sm:mb-4 relative">
                {/* Strong glow behind wordmark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-36 min-[400px]:w-44 sm:w-80 h-14 min-[400px]:h-20 sm:h-28 bg-gradient-to-r from-violet-400/25 via-purple-400/30 to-indigo-400/25 rounded-full blur-3xl" />
                </div>
                
                <div className="relative flex items-center justify-center gap-1 min-[400px]:gap-2 sm:gap-4">
                  <div className="hidden min-[350px]:flex flex-col items-end gap-0.5 opacity-70">
                    <div className="w-4 min-[400px]:w-8 sm:w-14 h-[1.5px] bg-gradient-to-r from-transparent to-violet-400" />
                    <div className="w-2 min-[400px]:w-5 sm:w-9 h-[1.5px] bg-gradient-to-r from-transparent to-purple-400" />
                    <div className="w-1 min-[400px]:w-3 sm:w-5 h-[1.5px] bg-gradient-to-r from-transparent to-indigo-400" />
                  </div>
                  
                  <h1 className="font-black text-white tracking-tight leading-none text-[clamp(1.75rem,9vw,2.25rem)] min-[400px]:text-[clamp(2rem,10vw,2.5rem)] sm:text-5xl md:text-7xl lg:text-8xl drop-shadow-[0_0_30px_rgba(147,51,234,0.4),0_0_15px_rgba(236,72,153,0.25)] [text-shadow:0_2px_4px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.2)]">
                    CAAKUS
                  </h1>
                  
                  <div className="hidden min-[350px]:flex flex-col items-start gap-0.5 opacity-70">
                    <div className="w-4 min-[400px]:w-8 sm:w-14 h-[1.5px] bg-gradient-to-l from-transparent to-indigo-400" />
                    <div className="w-2 min-[400px]:w-5 sm:w-9 h-[1.5px] bg-gradient-to-l from-transparent to-purple-400" />
                    <div className="w-1 min-[400px]:w-3 sm:w-5 h-[1.5px] bg-gradient-to-l from-transparent to-violet-400" />
                  </div>
                </div>
                
                <div className="mt-1.5 sm:mt-2 h-[3px] sm:h-[4px] w-20 min-[400px]:w-24 sm:w-32 mx-auto bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.6),0_0_30px_rgba(236,72,153,0.3)]" />
              </div>
              
              {/* Big animated Start button €” scrolls to video call and starts immediately */}

              {authedUser && (
                <div className="mx-auto max-w-3xl mb-1 sm:mb-6 px-1 sm:px-2">
                  {/* Unified User Stats Card - ~3x smaller on mobile */}
                  <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl border border-white/15 rounded-md sm:rounded-3xl p-1.5 sm:p-5 md:p-6 shadow-xl sm:shadow-2xl">
                    {/* Top Row: User Info + Stats - Single Row, tighter on mobile */}
                    <div className="flex items-center gap-1 sm:gap-4 mb-0.5 sm:mb-4">
                      {/* User Avatar & Name - ~3x smaller on mobile */}
                      <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0">
                        <VerifiedAvatarWrapper
                          isVerified={shouldShowVerifiedBadge(authedUser)}
                          subscriptionType={authedUser.subscription_type}
                          size="lg"
                        >
                          <Avatar className="relative w-5 h-5 sm:w-14 sm:h-14 ring-1 sm:ring-2 ring-white/20 shadow-lg flex-shrink-0">
                            <AvatarImage src={authedUser.profile_picture || ""} alt={authedUser.name} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-[10px] sm:text-lg">
                              {authedUser.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </VerifiedAvatarWrapper>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-bold text-[10px] sm:text-xl truncate">
                            {authedUser.name}
                          </h3>
                          {shouldShowVerifiedBadge(authedUser) && (() => {
                              const plan = authedUser?.subscription_type?.toLowerCase() ?? '';
                              const isFounder = plan === 'lifetime';
                              const isStudent = plan === 'student';
                              const isPro = plan === 'regular' || plan === 'premium';
                              const badgeClass = isFounder
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-none'
                                : isStudent
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-none'
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none';
                              const label = isFounder ? t('common.planFounder', { defaultValue: 'Founder' }) : isStudent ? t('common.planStudent', { defaultValue: 'Student' }) : t('common.planProfessional', { defaultValue: 'Professional' });
                              return (
                                <Badge className={`${badgeClass} text-[5px] sm:text-[9px] px-0.5 sm:px-2 py-0 sm:py-0.5 font-bold mt-0.5 inline-block leading-tight hidden sm:inline-block`}>
                                  {label}
                                </Badge>
                              );
                            })()}
                        </div>
                      </div>

                      {/* Quick Stats: Level & Streak - Smaller pills on mobile */}
                      <div className="flex items-center gap-0.5 sm:gap-4 flex-shrink-0">
                        <div className="flex items-center gap-0.5 sm:gap-2 bg-indigo-500/15 border border-indigo-400/30 rounded sm:rounded-xl px-1 sm:px-3 py-0.5 sm:py-2">
                          <Suspense fallback={<div className="w-4 h-4 rounded-full bg-indigo-500/30" />}>
                            <LevelBadge level={level} size="xs" />
                          </Suspense>
                          <p className="text-[8px] sm:text-lg font-black text-white leading-none">{level}</p>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-2 bg-orange-500/15 border border-orange-400/30 rounded sm:rounded-xl px-1 sm:px-3 py-0.5 sm:py-2">
                          <div className="w-3.5 h-3.5 sm:w-8 sm:h-8 rounded sm:rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                            <Flame className="w-2 h-2 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <p className="text-[8px] sm:text-lg font-black text-white leading-none">{streakCount}</p>
                        </div>
                      </div>
                    </div>

                    {/* Achievements Row - Hidden on mobile to save space */}
                    {(earnedBadges.length > 0 || authedUser?.subscription_type === "lifetime") && (
                      <div className="hidden sm:flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-white/10">
                        {earnedBadges.slice(0, 5).map((badge) => (
                          <Badge
                            key={badge.id}
                            className="bg-white/8 text-white border border-white/15 text-[10px] px-2 py-1 hover:bg-white/15 transition-colors leading-tight"
                          >
                            <span className="mr-1 text-xs">{badge.icon}</span>
                            <span>{badge.name}</span>
                          </Badge>
                        ))}
                        {earnedBadges.length > 5 && (
                          <Badge className="bg-white/5 text-white/60 border border-white/10 text-[10px] px-2 py-1 leading-tight">
                            +{earnedBadges.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Progress Bar Section €” compact level system */}
                    <div className="px-0 pt-0.5">
                      <Suspense fallback={null}>
                        <LevelProgressBar
                          userId={authedUser.id}
                          initialXp={xpTotal}
                          initialLevel={level}
                          onLevelUp={(newLevel) => {
                            updateUserData({ level: newLevel });
                          }}
                          onXpUpdate={(newXp) => {
                            updateUserData({ total_xp: newXp });
                          }}
                          compact
                        />
                      </Suspense>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Start Video Call — large hero, clear sequence (mobile column → desktop row) */}
            {activeFeature === null && (
              <div id="video-call-section" className="w-full flex flex-col gap-4 sm:gap-5">
                <div className="relative group w-full">
                  <div
                    className="cta-aura absolute -inset-6 rounded-[2.5rem] pointer-events-none"
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={() => { playCue('engage'); navigate('/call'); }}
                    className="cta-magnetic relative w-full min-h-[272px] min-[400px]:min-h-[288px] sm:min-h-[240px] md:min-h-[260px] lg:min-h-[280px]
                      flex flex-col items-stretch justify-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8
                      px-6 py-9 sm:px-10 sm:py-11 md:px-14 md:py-12
                      rounded-2xl sm:rounded-[1.75rem]
                      overflow-hidden text-left"
                    aria-label={t('home.startVideoCall')}
                  >
                    <span className="cta-sheen absolute inset-y-0 -inset-x-1/2 w-1/3 pointer-events-none" aria-hidden />
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8 md:gap-10 sm:flex-1 sm:min-w-0 w-full">
                      <div className="relative shrink-0 order-first sm:order-none">
                        <div className="relative w-[5.25rem] h-[5.25rem] sm:w-[5.5rem] sm:h-[5.5rem] md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto sm:mx-0">
                          <svg
                            className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                        </div>
                        <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 flex h-4 w-4 sm:h-5 sm:w-5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-green-400 border-2 border-white/50" />
                        </span>
                      </div>
                      <div className="min-w-0 w-full text-center sm:text-left space-y-1.5 sm:space-y-2 order-2 sm:order-none flex-1">
                        <p className="text-white font-black text-[1.625rem] min-[400px]:text-3xl leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-md text-balance">
                          {t('home.startVideoCall')}
                        </p>
                        <p className="text-white/55 font-medium text-sm sm:text-base md:text-lg leading-snug tracking-tight text-balance">
                          Meet amazing people instantly
                        </p>
                      </div>

                    </div>
                    <div className="flex flex-col items-center gap-2 sm:contents w-full shrink-0 order-3">
                      <div className="sm:hidden w-full max-w-[240px] mx-auto rounded-full bg-white/18 border border-white/30 py-3 px-5 flex items-center justify-center gap-2 shadow-inner">
                        <span className="text-sm font-bold text-white tracking-wide">{t('home.tapToBegin')}</span>
                        <ArrowRight className="w-5 h-5 text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="hidden sm:flex w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-white/20 border-2 border-white/35 items-center justify-center group-hover:bg-white/30 transition-colors shadow-lg shrink-0">
                        <ArrowRight className="w-8 h-8 md:w-10 md:h-10 lg:w-11 lg:h-11 text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {/* Invest + Leaderboard */}
                  <div className="relative group w-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                  <button
                    type="button"
                    onClick={() => setShowInvestModal(true)}
                    className="relative w-full h-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 backdrop-blur-xl border border-amber-300/50 shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 overflow-hidden"
                    aria-label="Invest in Yuyu"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="relative w-10 h-10 rounded-lg bg-amber-600/30 border border-amber-400/50 flex items-center justify-center">
                          <Coins className="w-5 h-5 text-slate-900" />
                        </div>
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-slate-900 font-black text-base leading-tight tracking-tight">
                          Invest in Yuyu
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600/30 border border-amber-400/50 flex items-center justify-center group-hover:bg-amber-600/50 transition-colors">
                      <ArrowRight className="w-4 h-4 text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
                <div className="relative group w-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                  <button
                    type="button"
                    onClick={() => navigate('/leaderboard')}
                    className="relative w-full h-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-slate-900/95 via-amber-950/40 to-slate-900/95 backdrop-blur-xl border border-yellow-500/25 shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 overflow-hidden"
                    aria-label="View Top Earners Leaderboard"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-yellow-400/[0.08] to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 flex items-center justify-center">
                          <svg className="w-5 h-5 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 21h8M12 17v4M17 3H7L5 8c0 3.866 3.134 7 7 7s7-3.134 7-7l-2-5z" />
                            <path d="M5 8H3a2 2 0 000 4h2M19 8h2a2 2 0 010 4h-2" />
                          </svg>
                        </div>
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 border border-slate-900 flex items-center justify-center shadow">
                          <Crown className="w-2 h-2 text-slate-900" />
                        </span>
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-white font-black text-base leading-tight tracking-tight">
                          Top Earners
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
                      <ArrowRight className="w-4 h-4 text-yellow-300 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <Suspense fallback={null}>
        {activeFeature === "anonymous" && <AnonymousChatInterface closeFeature={closeFeature} />}
        {activeFeature === "global" && (
          <GlobalConnectionInterface closeFeature={closeFeature} />
        )}
        {activeFeature === "voice" && <AnonymousVoiceInterface closeFeature={closeFeature} />}
        </Suspense>

      </main>

      {/* Messenger FAB €” only for authenticated users */}
      <Suspense fallback={null}>
      {authedUser && <MessengerFAB position="bottom-left" />}
      </Suspense>

  {/* Advertising District — discreet pill (90% smaller than the former hero) */}
  {!showAdvertising && (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 flex justify-center">
      <button
        type="button"
        onClick={() => setShowAdvertising(true)}
        className="group inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-500/20 hover:border-amber-300/50 transition-colors"
        aria-label={t('home.advertisingDistrictDiscover')}
      >
        <Building2 className="w-3.5 h-3.5 text-amber-300" strokeWidth={2} />
        <span className="truncate max-w-[60vw]">{t('home.advertisingDistrictDiscover')}</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-200 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )}

{/* Wrap section with condition */}
        
        
{showAdvertising && (<>
  <section className="district-stage relative overflow-hidden" id="advertising">
    {/* Sentinel: defer heavy carousel until near viewport */}
    <div ref={adsSentinelRef} />

    {/* ── Immersive atmosphere ── */}
    <div className="district-horizon" aria-hidden />
    <div className="district-scanlines" aria-hidden />
    <div className="district-sweep" aria-hidden />
    <div
      className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[140px]"
      aria-hidden
    />

    {/* ── HUD BAR ── */}
    <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pt-8 sm:pt-10">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-violet-400 shadow-[0_0_12px_3px_rgba(124,92,255,0.7)]" />
        <span className="hud-label truncate">{t('home.advertisingDistrict')}</span>
        <span className="hidden h-px w-16 bg-gradient-to-r from-violet-400/50 to-transparent sm:block" />
      </div>
      <button
        type="button"
        onClick={() => setShowAdvertising(false)}
        className="group flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 backdrop-blur-xl transition-colors hover:border-white/25 hover:text-white"
      >
        <X className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" />
        <span className="hidden sm:inline">Close</span>
      </button>
    </div>

    {/* ── CINEMATIC TITLE ── */}
    <div className="relative z-20 mx-auto max-w-4xl px-4 pt-10 text-center sm:pt-14">
      <h2 className="chromatic-title text-[clamp(2.25rem,8vw,5.5rem)] font-black uppercase leading-[0.92]">
        {t('home.advertisingTitle')}
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/45 sm:text-base">
        {t('home.advertisingSpotDesc')}
      </p>

      {/* Live telemetry strip */}
      <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
        {[
          { v: String(occupiedSpotsCount).padStart(2, '0'), l: t('home.platformsAdvertising') },
          { v: '50', l: t('home.totalSpots') },
          { v: `$${dailyRate.toLocaleString()}`, l: t('home.perDay') },
        ].map((s) => (
          <div key={s.l} className="bg-black/60 px-2 py-4 sm:py-5">
            <div className="font-mono text-xl font-black tracking-tight text-white sm:text-3xl">{s.v}</div>
            <div className="hud-label mt-1.5 line-clamp-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[11px] font-medium text-white/35">
        {isFoundingMember
          ? t('home.foundingMemberRate')
          : `$${monthlyRate.toLocaleString()} ${t('home.perMonth')} — ${t('home.savePercent')}`}
      </div>
    </div>

    {/* ── CATEGORY TICKER ── */}
    <div className="relative z-20 mt-10 overflow-hidden border-y border-white/[0.07] bg-black/50 py-3 backdrop-blur-xl">
      <div className="ticker-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center">
            {[
              { icon: Laptop, label: t('home.categoryLabels.saas') },
              { icon: Youtube, label: t('home.categoryLabels.youtubers') },
              { icon: MessageCircle, label: t('home.categoryLabels.tiktokers') },
              { icon: Hotel, label: t('home.categoryLabels.hotels') },
              { icon: GraduationCap, label: t('home.categoryLabels.education') },
              { icon: Smartphone, label: t('home.categoryLabels.apps') },
              { icon: Heart, label: t('home.categoryLabels.health') },
              { icon: Play, label: t('home.categoryLabels.gaming') },
              { icon: Globe2, label: t('home.categoryLabels.ecommerce') },
              { icon: Sparkles, label: t('home.categoryLabels.more') },
            ].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <span key={`${dup}-${i}`} className="flex items-center gap-2 px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  <Icon className="h-3.5 w-3.5 text-violet-300/60" />
                  {cat.label}
                  <span className="ml-5 h-1 w-1 rounded-full bg-white/15" />
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>

    {/* ══ LIVE NETWORK — 3 flowing lanes of holographic spots ══ */}
    <div className="relative z-10 w-full overflow-hidden py-12 sm:py-16">
      {adsVisible && [
        { row: advertisingRows.row1, key: "row1", startIndex: 0, animateClass: "animate-snake-row1" },
        { row: advertisingRows.row2, key: "row2", startIndex: 17, animateClass: "animate-snake-row2" },
        { row: advertisingRows.row3, key: "row3", startIndex: 34, animateClass: "animate-snake-row3" },
      ].map(({ row, key, startIndex, animateClass }) => (
        <div className="carousel-viewport relative mb-4 sm:mb-6" key={key}>
          <div className={`carousel-strip ${animateClass}`}>
            {row.map((spot, idx) => (
              <div key={`${key}-${spot.id}-${idx}`} className="carousel-card">
                <SpotCard spot={spot} displayIndex={startIndex + idx + 1} onSpotClick={handleSpotClick} t={t} compact />
              </div>
            ))}
            {row.map((spot, idx) => (
              <div key={`${key}-dup-${spot.id}-${idx}`} className="carousel-card">
                <SpotCard spot={spot} displayIndex={startIndex + idx + 1} onSpotClick={handleSpotClick} t={t} compact />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Edge fades for depth */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent sm:w-28" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent sm:w-28" aria-hidden />
    </div>

    {/* ── CTA & BENEFITS ── */}
    <div className="relative z-20 mx-auto max-w-5xl px-4 pb-20">
      <div className="flex justify-center">
        <div className="relative">
          <div className="cta-aura absolute -inset-6 rounded-full" aria-hidden />
          <button
            onClick={() => {
              const freeSpot = advertisingSpots.find(s => !s.isOccupied);
              if (freeSpot) {
                setSelectedSpot(freeSpot.id);
                setShowPurchaseModal(true);
              } else {
                toast.error(t('home.allSpotsTaken'));
              }
            }}
            className="cta-magnetic relative inline-flex items-center gap-3 rounded-2xl px-9 py-5 text-base font-black uppercase tracking-[0.12em]"
          >
            <Sparkles className="h-5 w-5" />
            {t('home.claimSpot')}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] sm:grid-cols-3">
        {[
          { icon: <TrendingUp className="h-5 w-5" />, title: t('home.impressions') },
          { icon: <Target className="h-5 w-5" />, title: t('home.countries') },
          { icon: <LineChart className="h-5 w-5" />, title: t('home.analyticsDashboard') },
        ].map((benefit, i) => (
          <div key={i} className="group relative bg-black/70 p-7 backdrop-blur-xl transition-colors duration-500 hover:bg-black/40">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-violet-300 transition-colors duration-300 group-hover:border-violet-400/50">
              {benefit.icon}
            </div>
            <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-white">{benefit.title}</h4>
          </div>
        ))}
      </div>
    </div>
  </section>
</>)} {/* end showAdvertising */}

    

        {/* â”€â”€ PURCHASE MODAL â”€â”€ */}
        {showPurchaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPurchaseModal(false)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            {/* Modal */}
            <div
              className="relative w-full max-w-lg bg-[#0c1225] rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/60 max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-[#0c1225]/95 backdrop-blur-xl px-6 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{t('home.purchaseModal.claimSpotTitle', { id: selectedSpot })}</h3>
                  <p className="text-xs text-white/80 mt-0.5">{t('home.purchaseModal.fillDetails')}</p>
                </div>
                <button onClick={() => setShowPurchaseModal(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                  <X className="w-5 h-5 text-white/80" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">

                {/* Business Name */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">{t('home.purchaseModal.businessName')}</label>
                  <input
                    type="text"
                    value={purchaseForm.businessName}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, businessName: e.target.value })}
                    placeholder={t('home.purchaseModal.businessNamePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">{t('home.purchaseModal.websiteUrl')}</label>
                  <input
                    type="url"
                    value={purchaseForm.businessUrl}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, businessUrl: e.target.value })}
                    placeholder={t('home.purchaseModal.websitePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <p className="text-[10px] text-white/60 mt-1">{t('home.purchaseModal.redirectNote')}</p>
                </div>

                {/* Business Description - shown on spot card */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">{t('home.purchaseModal.businessDescription')}</label>
                  <textarea
                    value={purchaseForm.businessDescription}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, businessDescription: e.target.value })}
                    placeholder={t('home.purchaseModal.businessDescriptionPlaceholder')}
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                  />
                  <p className="text-[10px] text-white/60 mt-1">{t('home.purchaseModal.businessDescriptionHint')}</p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">{t('home.purchaseModal.logoImage')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, logoFile: e.target.files?.[0] || null })}
                    className="w-full text-sm text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/[0.06] file:text-white/70 file:text-xs file:font-semibold hover:file:bg-white/[0.10] transition-colors cursor-pointer"
                  />
                </div>

                {/* Duration Selector */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">{t('home.purchaseModal.duration')}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { days: 1, label: t('home.duration1Day') },
                      { days: 5, label: t('home.duration5Days') },
                      { days: 7, label: t('home.duration1Week') },
                      { days: 15, label: t('home.duration15Days') },
                      { days: 30, label: t('home.duration1Month'), tag: t('home.durationPopular') },
                      { days: 57, label: t('home.duration57Days') },
                      { days: 90, label: t('home.duration3Months'), tag: t('home.durationBestValue') },
                      { days: 180, label: t('home.duration6Months') },
                      { days: 365, label: t('home.duration1Year'), tag: t('home.durationMaxSave') },
                    ].map((opt) => (
                      <button
                        key={opt.days}
                        onClick={() => setPurchaseForm({ ...purchaseForm, durationDays: opt.days })}
                        className={`relative py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                          purchaseForm.durationDays === opt.days
                            ? 'bg-blue-600 text-white ring-1 ring-blue-400/50'
                            : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] border border-white/[0.05]'
                        }`}
                      >
                        {opt.tag && (
                          <span className="absolute -top-1.5 right-1 px-1 py-px text-[7px] font-bold bg-yellow-500 text-black rounded">
                            {opt.tag}
                          </span>
                        )}
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] text-white/70">{t('home.purchaseModal.custom')}</span>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={purchaseForm.durationDays}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, durationDays: Math.max(1, Math.min(365, parseInt(e.target.value) || 1)) })}
                      className="w-20 px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white text-xs text-center font-bold focus:outline-none focus:border-blue-500/50"
                    />
                    <span className="text-[11px] text-white/30">{t('home.purchaseModal.days')}</span>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                  <div className="px-5 py-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">{t('home.purchaseModal.durationLabel')}</span>
                      <span className="text-white font-semibold">{purchaseForm.durationDays} {t('home.purchaseModal.days')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">{t('home.purchaseModal.rate')}</span>
                      <span className="text-white font-semibold">${dailyRate.toLocaleString()} / {t('home.purchaseModal.days')}</span>
                    </div>
                    {purchaseForm.durationDays >= 30 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400/60">{t('home.purchaseModal.monthlyDiscount')}</span>
                        <span className="text-green-400 font-semibold">
                          -${((purchaseForm.durationDays * dailyRate) - calculatePrice(purchaseForm.durationDays)).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{t('home.purchaseModal.total')}</span>
                    <div className="text-right">
                      {purchaseForm.durationDays >= 30 && (
                        <span className="text-xs text-white/25 line-through mr-2">${(purchaseForm.durationDays * dailyRate).toLocaleString()}</span>
                      )}
                      <span className="text-2xl font-black text-white">${calculatePrice(purchaseForm.durationDays).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="px-5 py-2 bg-white/[0.01] border-t border-white/[0.04] text-center">
                    <span className="text-[10px] text-white/20">
                      {t('home.purchaseModal.activeUntil', { date: new Date(Date.now() + purchaseForm.durationDays * 86400000).toLocaleDateString(i18n.language || 'en', { month: 'short', day: 'numeric', year: 'numeric' }) })}
                    </span>
                  </div>
                </div>

                {/* Stripe badge */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <CreditCard className="w-4 h-4 text-white/60" />
                  <span className="text-[11px] text-white/70">{t('home.purchaseModal.secureCheckout')}</span>
                </div>

                {/* Submit */}
                <button
                  onClick={handlePurchaseSubmit}
                  disabled={!purchaseForm.businessName || !purchaseForm.businessUrl || !purchaseForm.logoFile}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-yellow-500/15 hover:shadow-xl hover:shadow-yellow-500/25 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {t('home.purchaseModal.payViaStripe', { price: calculatePrice(purchaseForm.durationDays).toLocaleString() })}
                </button>

              </div>
            </div>
          </div>
        )}


      
      <Suspense fallback={null}>
      {showAuthModal && (
        <AuthModal
          canClose={true}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      )}

      <InvestYuyucoinModal open={showInvestModal} onClose={() => setShowInvestModal(false)} />
      </Suspense>

      <Analytics />
    </div>
  </>
  );
}

