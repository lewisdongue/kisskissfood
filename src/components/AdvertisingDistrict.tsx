/**
 * AdvertisingDistrict — Fully isolated component.
 *
 * All advertising state (spots, purchase modal, expiry checks) lives here so
 * it never causes Home to re-render when it updates.
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  Building2,
  CreditCard,
  GraduationCap,
  Heart,
  Hotel,
  Laptop,
  LineChart,
  Lock,
  MessageCircle,
  Play,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Youtube,
  Globe2,
} from "lucide-react";
import { supabase } from "@/config/supabase";
import i18n from "@/i18n";
import type { User } from "@/types/index";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  vx: number;
  vy: number;
  lane: number;
  speed: number;
  size: number;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildDefaultSpots50(): AdvertisingSpot[] {
  const COLS = 10;
  const ROWS = 5;
  const spots: AdvertisingSpot[] = [];
  for (let i = 0; i < 50; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    spots.push({
      id: i + 1,
      isOccupied: false,
      x: ((col + 0.5) / COLS) * 100,
      y: ((row + 0.5) / ROWS) * 100,
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

const toAbsoluteUrl = (raw: string): string => {
  const url = raw.trim();
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url.replace(/^\/+/, "")}`;
};

// ─── SpotCard ─────────────────────────────────────────────────────────────────

const SpotCard = memo(function SpotCard({
  spot,
  displayIndex,
  onSpotClick,
  t,
}: {
  spot: AdvertisingSpot;
  displayIndex: number;
  onSpotClick: (spot: AdvertisingSpot) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const daysLeft = spot.expiresAt
    ? Math.max(0, Math.ceil((new Date(spot.expiresAt).getTime() - Date.now()) / 86_400_000))
    : 0;

  return (
    <div
      onClick={() => onSpotClick(spot)}
      className={`group relative h-[200px] sm:h-[220px] md:h-[240px] rounded-2xl border transition-all duration-500 ${
        spot.isOccupied
          ? "bg-gradient-to-b from-white/[0.12] to-white/[0.04] backdrop-blur-xl border-white/[0.15] hover:border-blue-400/50 hover:scale-[1.02] cursor-pointer shadow-xl"
          : "bg-white/[0.03] border-white/[0.08] opacity-50 hover:opacity-70 hover:scale-[1.01] cursor-pointer"
      }`}
    >
      {spot.isOccupied && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
      )}
      <div className="relative h-full flex flex-col items-center justify-center p-3 sm:p-4">
        {spot.isOccupied ? (
          <>
            <div className="mb-1.5 sm:mb-2 relative flex-shrink-0">
              {spot.logoUrl ? (
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden ring-2 ring-white/10 group-hover:ring-blue-400/50 transition-all shadow-lg">
                  <img src={spot.logoUrl} alt={spot.businessName || ""} className="w-full h-full object-contain p-1.5 bg-white/5" loading="lazy" />
                </div>
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center ring-2 ring-white/10 shadow-lg">
                  <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400/70" />
                </div>
              )}
            </div>
            <div className="w-full px-1 text-center min-w-0 flex-1 flex flex-col justify-center">
              <h4 className="text-white font-bold leading-tight line-clamp-2 text-[clamp(0.65rem,1.8vw,0.875rem)]">{spot.businessName}</h4>
              {spot.businessDescription && (
                <p className="text-white/70 leading-snug line-clamp-2 mt-0.5 text-[clamp(0.5rem,1.2vw,0.75rem)]">{spot.businessDescription}</p>
              )}
            </div>
            {spot.expiresAt && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-blue-300">{daysLeft}d</span>
              </div>
            )}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 border border-white/20">
              <span className="text-[10px] font-black text-white/80">#{displayIndex}</span>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
              <div className="w-7 h-7 rounded-full bg-blue-500/30 flex items-center justify-center border border-blue-400/50">
                <ArrowRight className="w-3.5 h-3.5 text-blue-300" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/[0.02] border-2 border-dashed border-white/[0.12] flex items-center justify-center mb-2 group-hover:border-white/[0.25]">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-white/30" />
            </div>
            <span className="text-white/40 text-xs sm:text-sm font-bold">{t("home.freeSpot")}</span>
            <span className="text-white/30 text-[10px] sm:text-xs">{t("home.clickToClaim")}</span>
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/40 border border-white/10">
              <span className="text-[10px] font-black text-white/50">#{displayIndex}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

interface AdvertisingDistrictProps {
  user: User | null;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

export const AdvertisingDistrict = memo(function AdvertisingDistrict({ user, t }: AdvertisingDistrictProps) {
  const defaultSpots = useMemo(() => buildDefaultSpots50(), []);

  const [advertisingSpots, setAdvertisingSpots] = useState<AdvertisingSpot[]>(defaultSpots);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormData>({
    businessName: "",
    businessUrl: "",
    businessDescription: "",
    logoFile: null,
    durationDays: 30,
  });

  // Visibility deferral — only render the carousel once it's near the viewport
  const [adsVisible, setAdsVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    let cleanup: (() => void) | null = null;
    const fallback = setTimeout(() => setAdsVisible(true), 3000);

    if (el) {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setAdsVisible(true);
            obs.disconnect();
            clearTimeout(fallback);
          }
        },
        { rootMargin: "600px" }
      );
      obs.observe(el);
      cleanup = () => { obs.disconnect(); clearTimeout(fallback); };
    } else {
      cleanup = () => clearTimeout(fallback);
    }

    return () => cleanup?.();
  }, []);

  // Load spots from Supabase
  useEffect(() => {
    const buildSpot = (i: number, dbSpot?: Record<string, unknown>): AdvertisingSpot => {
      const COLS = 10;
      const ROWS = 5;
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return {
        id: i + 1,
        isOccupied: !!dbSpot,
        businessName: dbSpot?.business_name as string | undefined,
        businessUrl: dbSpot?.business_url as string | undefined,
        businessDescription: dbSpot?.business_description as string | undefined,
        logoUrl: (() => {
          const url = dbSpot?.logo_url as string | undefined;
          if (!url) return undefined;
          if (url.includes("/storage/v1/object/") && !url.includes("/object/public/"))
            return url.replace("/storage/v1/object/", "/storage/v1/object/public/");
          return url;
        })(),
        expiresAt: dbSpot?.expires_at as string | undefined,
        purchasedAt: dbSpot?.purchased_at as string | undefined,
        durationDays: dbSpot?.duration_days as number | undefined,
        x: ((col + 0.5) / COLS) * 100,
        y: ((row + 0.5) / ROWS) * 100,
        vx: 0.035,
        vy: 0,
        lane: row,
        speed: 0.035,
        size: 1,
        angle: 0,
        radius: 0,
      };
    };

    const loadSpots = async () => {
      try {
        const { data: activeSpots } = await supabase
          .from("advertising_spots")
          .select("*")
          .gt("expires_at", new Date().toISOString());

        const spotsById = new Map<number, Record<string, unknown>>();
        activeSpots?.forEach((spot: Record<string, unknown>) => {
          const id = Number(spot.spot_id);
          if (!Number.isNaN(id)) spotsById.set(id, spot);
        });

        setAdvertisingSpots(
          Array.from({ length: 50 }, (_, i) => buildSpot(i, spotsById.get(i + 1)))
        );
      } catch {
        // keep defaults
      }
    };

    loadSpots();
  }, []);

  // Auto-expire spots
  useEffect(() => {
    const id = setInterval(() => {
      setAdvertisingSpots((prev) =>
        prev.map((spot) => {
          if (spot.isOccupied && spot.expiresAt && new Date() >= new Date(spot.expiresAt)) {
            return { ...spot, isOccupied: false, businessName: undefined, businessUrl: undefined, logoUrl: undefined, expiresAt: undefined, durationDays: undefined };
          }
          return spot;
        })
      );
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const occupiedSpotsCount = useMemo(
    () => advertisingSpots.filter((s) => s.isOccupied).length,
    [advertisingSpots]
  );

  const visibleAdvertisingSpots = useMemo(() => {
    const total = 50;
    if (advertisingSpots.length >= total) return advertisingSpots.slice(0, total);
    return Array.from({ length: total }, (_, i) => advertisingSpots[i] ?? defaultSpots[i] ?? defaultSpots[0]);
  }, [advertisingSpots, defaultSpots]);

  const advertisingRows = useMemo(() => ({
    row1: visibleAdvertisingSpots.slice(0, 17),
    row2: visibleAdvertisingSpots.slice(17, 34),
    row3: visibleAdvertisingSpots.slice(34, 50),
  }), [visibleAdvertisingSpots]);

  const isFoundingMember = (user as { subscription_type?: string } | null)?.subscription_type === "lifetime";
  const dailyRate = isFoundingMember ? 50 : 200;
  const monthlyRate = isFoundingMember ? 1000 : 5000;

  const calculatePrice = useCallback((days: number): number => {
    const daily = isFoundingMember ? 50 : 200;
    const monthly = isFoundingMember ? 1000 : 5000;
    if (days < 30) return days * daily;
    const fullMonths = Math.floor(days / 30);
    const rem = days % 30;
    return fullMonths * monthly + rem * daily;
  }, [isFoundingMember]);

  const handleSpotClick = useCallback((spot: AdvertisingSpot) => {
    if (spot.isOccupied && spot.businessUrl) {
      window.open(toAbsoluteUrl(spot.businessUrl), "_blank", "noopener,noreferrer");
      return;
    }
    setSelectedSpot(spot.id);
    setShowPurchaseModal(true);
  }, []);

  const handlePurchaseSubmit = async () => {
    if (!purchaseForm.businessName || !purchaseForm.businessUrl || !purchaseForm.logoFile) {
      toast.error(t("home.fillRequiredFields"));
      return;
    }
    const totalPrice = calculatePrice(purchaseForm.durationDays);
    try {
      const fileExt = purchaseForm.logoFile.name.split(".").pop();
      const fileName = `spot-${selectedSpot}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("advertising-logos")
        .upload(fileName, purchaseForm.logoFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("advertising-logos").getPublicUrl(fileName);
      let logoUrl = urlData.publicUrl;
      if (logoUrl.includes("/storage/v1/object/") && !logoUrl.includes("/object/public/"))
        logoUrl = logoUrl.replace("/storage/v1/object/", "/storage/v1/object/public/");

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-ad-checkout", {
        body: {
          spotId: selectedSpot,
          businessName: purchaseForm.businessName,
          businessUrl: purchaseForm.businessUrl,
          businessDescription: purchaseForm.businessDescription.trim() || undefined,
          logoUrl,
          durationDays: purchaseForm.durationDays,
          totalPrice,
          isFoundingMember: !!isFoundingMember,
        },
      });

      if (checkoutError) {
        const err = checkoutError as { message?: string; context?: { body?: { error?: string } } };
        toast.error(err?.context?.body?.error ?? err?.message ?? t("home.checkoutFailed"));
        return;
      }
      if (checkoutData?.error) {
        toast.error(typeof checkoutData.error === "string" ? checkoutData.error : t("home.checkoutFailed"));
        return;
      }
      if (checkoutData?.url) {
        toast.success(t("home.redirectingStripe"));
        window.location.href = checkoutData.url;
        setShowPurchaseModal(false);
        setPurchaseForm({ businessName: "", businessUrl: "", businessDescription: "", logoFile: null, durationDays: 30 });
        return;
      }
      toast.error(t("home.noCheckoutLink"));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("home.paymentFailed"));
    }
  };

  const categoryBadges = useMemo(() => [
    { icon: Laptop, label: t("home.categoryLabels.saas"), color: "blue" },
    { icon: Youtube, label: t("home.categoryLabels.youtubers"), color: "red" },
    { icon: MessageCircle, label: t("home.categoryLabels.tiktokers"), color: "pink" },
    { icon: Hotel, label: t("home.categoryLabels.hotels"), color: "purple" },
    { icon: GraduationCap, label: t("home.categoryLabels.education"), color: "green" },
    { icon: Smartphone, label: t("home.categoryLabels.apps"), color: "cyan" },
    { icon: Heart, label: t("home.categoryLabels.health"), color: "emerald" },
    { icon: Play, label: t("home.categoryLabels.gaming"), color: "amber" },
    { icon: Globe2, label: t("home.categoryLabels.ecommerce"), color: "indigo" },
    { icon: Sparkles, label: t("home.categoryLabels.more"), color: "rose" },
  ], [t]);

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── ADVERTISING SECTION ── */}
      <section className="relative py-8 md:py-10" id="advertising">
        {/* Sentinel — triggers IntersectionObserver */}
        <div ref={sentinelRef} />

        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* ── Header card ── */}
        <div className="max-w-7xl mx-auto relative z-10 px-4">
          <div className="rounded-2xl md:rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-2xl p-6 sm:p-8 md:p-10 mb-8 md:mb-10 relative overflow-hidden">
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 blur-xl transition-opacity duration-700" />
            </div>

            <div className="relative z-10 text-center space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 backdrop-blur-sm">
                <Building2 className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-[13px] font-semibold text-yellow-300 tracking-wide uppercase">
                  {t("home.advertisingDistrict")}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.1]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 animate-gradient bg-[length:200%_auto]">
                  {t("home.advertisingTitle")}
                </span>
              </h2>

              <p className="text-base md:text-lg text-slate-100 max-w-2xl mx-auto leading-relaxed">
                {t("home.advertisingSpotDesc")}
              </p>

              {/* Category badges */}
              <div className="flex flex-wrap gap-2 justify-center pt-4 max-w-3xl mx-auto">
                {categoryBadges.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-${cat.color}-500/10 text-${cat.color}-300 border border-${cat.color}-500/20 hover:bg-${cat.color}-500/20 hover:scale-110 transition-all duration-300 cursor-pointer`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Pricing */}
            <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-white/[0.08]">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                <div className="flex items-baseline gap-1 group cursor-pointer">
                  <span className="text-3xl md:text-4xl font-black text-white group-hover:scale-110 transition-transform">
                    ${dailyRate.toLocaleString()}
                  </span>
                  <span className="text-base text-white/70 font-medium">{t("home.perDay")}</span>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <div className="flex items-baseline gap-1 group cursor-pointer">
                  <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                    ${monthlyRate.toLocaleString()}
                  </span>
                  <span className="text-base text-white/70 font-medium">{t("home.perMonth")}</span>
                  {!isFoundingMember && (
                    <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
                      {t("home.savePercent")}
                    </span>
                  )}
                </div>
              </div>
              {isFoundingMember && (
                <p className="text-sm text-amber-300/90 font-medium">{t("home.foundingMemberRate")}</p>
              )}
              {!isFoundingMember && (
                <p className="text-xs text-white/50 max-w-md text-center">{t("home.foundingMemberPricingNote")}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Carousel ── */}
        <div className="relative w-full py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#060a16] via-[#0b1225] to-[#060a16]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(to right, rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-white/[0.02] text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-[0.3em] uppercase whitespace-nowrap animate-pulse">
              ADVERTISING DISTRICT
            </span>
          </div>

          <div className="relative z-10 text-center mb-8 px-4">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-blue-500" />
              <span className="text-blue-400 text-xs sm:text-sm font-bold uppercase tracking-wider">Live Network</span>
              <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-blue-500" />
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t("home.connectedPlatforms")}
              </span>
            </h3>
            <p className="text-white/60 text-sm sm:text-base md:text-lg">
              {occupiedSpotsCount} {t("home.platformsAdvertising")} &bull; 50 {t("home.totalSpots")}
            </p>
          </div>

          {adsVisible && [
            { row: advertisingRows.row1, key: "row1", startIndex: 0, animateClass: "animate-snake-row1" },
            { row: advertisingRows.row2, key: "row2", startIndex: 17, animateClass: "animate-snake-row2" },
            { row: advertisingRows.row3, key: "row3", startIndex: 34, animateClass: "animate-snake-row3" },
          ].map(({ row, key, startIndex, animateClass }) => (
            <div className="carousel-viewport relative mb-6 sm:mb-8" key={key}>
              <div className={`carousel-strip ${animateClass}`}>
                {row.map((spot, idx) => (
                  <div key={`${key}-${spot.id}-${idx}`} className="carousel-card">
                    <SpotCard spot={spot} displayIndex={startIndex + idx + 1} onSpotClick={handleSpotClick} t={t} />
                  </div>
                ))}
                {row.map((spot, idx) => (
                  <div key={`${key}-dup-${spot.id}-${idx}`} className="carousel-card">
                    <SpotCard spot={spot} displayIndex={startIndex + idx + 1} onSpotClick={handleSpotClick} t={t} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Status HUD */}
          <div className="relative z-20 flex justify-center mt-10">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                </div>
                <span className="text-sm font-bold text-green-400">
                  {t("home.activeCount", { count: occupiedSpotsCount })}
                </span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-sm text-white/60">{t("home.totalCount")}</span>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs text-blue-400 font-medium">{t("home.liveLabel")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA + Benefits ── */}
        <div className="max-w-7xl mx-auto relative z-10 px-4">
          <div className="flex justify-center mt-12">
            <button
              onClick={() => {
                const freeSpot = advertisingSpots.find((s) => !s.isOccupied);
                if (freeSpot) {
                  setSelectedSpot(freeSpot.id);
                  setShowPurchaseModal(true);
                } else {
                  toast.error(t("home.allSpotsTaken"));
                }
              }}
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-black text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <Sparkles className="w-6 h-6 relative z-10 animate-pulse" />
              <span className="relative z-10">{t("home.claimSpot")}</span>
              <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          {/* Benefits grid */}
          <div className="grid sm:grid-cols-3 gap-6 mt-16 md:mt-20">
            {[
              { icon: <TrendingUp className="w-10 h-10 text-green-400" />, title: t("home.impressions"), desc: t("home.impressionsDesc"), gradient: "from-green-500/10 to-emerald-500/10", border: "border-green-500/20" },
              { icon: <Target className="w-10 h-10 text-blue-400" />, title: t("home.countries"), desc: t("home.countriesDesc"), gradient: "from-blue-500/10 to-cyan-500/10", border: "border-blue-500/20" },
              { icon: <LineChart className="w-10 h-10 text-purple-400" />, title: t("home.analyticsDashboard"), desc: t("home.analyticsDesc"), gradient: "from-purple-500/10 to-pink-500/10", border: "border-purple-500/20" },
            ].map((benefit, i) => (
              <div key={i} className={`group relative p-8 rounded-2xl bg-gradient-to-b ${benefit.gradient} backdrop-blur-xl border ${benefit.border} shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">{benefit.icon}</div>
                  <h4 className="text-lg font-black text-white mb-2">{benefit.title}</h4>
                  <p className="text-sm text-slate-100 leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PURCHASE MODAL ── */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPurchaseModal(false)} />
          <div className="relative w-full sm:max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-3xl sm:rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
            {/* Drag handle for mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-4 border-b border-white/[0.06] flex-shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">{t("home.purchaseModal.title")}</h3>
                {selectedSpot && (
                  <p className="text-xs text-white/40 mt-0.5">
                    {t("home.purchaseModal.spot")} #{selectedSpot}
                    {isFoundingMember && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                        Founding Member
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button onClick={() => setShowPurchaseModal(false)} className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-4 sm:py-5 space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                  {t("home.purchaseModal.businessName")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={purchaseForm.businessName}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, businessName: e.target.value })}
                  placeholder={t("home.purchaseModal.businessNamePlaceholder")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {/* Business URL */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                  {t("home.purchaseModal.businessUrl")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={purchaseForm.businessUrl}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, businessUrl: e.target.value })}
                  placeholder="https://yourbusiness.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                  {t("home.purchaseModal.description")}
                </label>
                <textarea
                  value={purchaseForm.businessDescription}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, businessDescription: e.target.value })}
                  placeholder={t("home.purchaseModal.descriptionPlaceholder")}
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all resize-none"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                  {t("home.purchaseModal.logo")} <span className="text-red-400">*</span>
                </label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.10] cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.18] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {purchaseForm.logoFile ? (
                      <p className="text-sm text-white font-medium truncate">{purchaseForm.logoFile.name}</p>
                    ) : (
                      <p className="text-sm text-white/35">{t("home.purchaseModal.logoPlaceholder")}</p>
                    )}
                    <p className="text-[10px] text-white/20 mt-0.5">PNG, JPG, SVG (max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, logoFile: e.target.files?.[0] ?? null })}
                  />
                </label>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">{t("home.purchaseModal.duration")}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { days: 1, label: t("home.duration1Day") },
                    { days: 5, label: t("home.duration5Days") },
                    { days: 7, label: t("home.duration1Week") },
                    { days: 15, label: t("home.duration15Days") },
                    { days: 30, label: t("home.duration1Month"), tag: t("home.durationPopular") },
                    { days: 57, label: t("home.duration57Days") },
                    { days: 90, label: t("home.duration3Months"), tag: t("home.durationBestValue") },
                    { days: 180, label: t("home.duration6Months") },
                    { days: 365, label: t("home.duration1Year"), tag: t("home.durationMaxSave") },
                  ].map((opt) => (
                    <button
                      key={opt.days}
                      onClick={() => setPurchaseForm({ ...purchaseForm, durationDays: opt.days })}
                      className={`relative py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                        purchaseForm.durationDays === opt.days
                          ? "bg-blue-600 text-white ring-1 ring-blue-400/50"
                          : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] border border-white/[0.05]"
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
                  <span className="text-[11px] text-white/70">{t("home.purchaseModal.custom")}</span>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={purchaseForm.durationDays}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, durationDays: Math.max(1, Math.min(365, parseInt(e.target.value) || 1)) })}
                    className="w-20 px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white text-xs text-center font-bold focus:outline-none focus:border-blue-500/50"
                  />
                  <span className="text-[11px] text-white/30">{t("home.purchaseModal.days")}</span>
                </div>
              </div>

              {/* Price Summary */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                <div className="px-5 py-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">{t("home.purchaseModal.durationLabel")}</span>
                    <span className="text-white font-semibold">{purchaseForm.durationDays} {t("home.purchaseModal.days")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">{t("home.purchaseModal.rate")}</span>
                    <span className="text-white font-semibold">${dailyRate.toLocaleString()} / {t("home.purchaseModal.days")}</span>
                  </div>
                  {purchaseForm.durationDays >= 30 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400/60">{t("home.purchaseModal.monthlyDiscount")}</span>
                      <span className="text-green-400 font-semibold">
                        -${((purchaseForm.durationDays * dailyRate) - calculatePrice(purchaseForm.durationDays)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{t("home.purchaseModal.total")}</span>
                  <div className="text-right">
                    {purchaseForm.durationDays >= 30 && (
                      <span className="text-xs text-white/25 line-through mr-2">
                        ${(purchaseForm.durationDays * dailyRate).toLocaleString()}
                      </span>
                    )}
                    <span className="text-2xl font-black text-white">${calculatePrice(purchaseForm.durationDays).toLocaleString()}</span>
                  </div>
                </div>
                <div className="px-5 py-2 bg-white/[0.01] border-t border-white/[0.04] text-center">
                  <span className="text-[10px] text-white/20">
                    {t("home.purchaseModal.activeUntil", {
                      date: new Date(Date.now() + purchaseForm.durationDays * 86_400_000).toLocaleDateString(
                        i18n.language || "en",
                        { month: "short", day: "numeric", year: "numeric" }
                      ),
                    })}
                  </span>
                </div>
              </div>

              {/* Stripe badge */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <CreditCard className="w-4 h-4 text-white/60" />
                <span className="text-[11px] text-white/70">{t("home.purchaseModal.secureCheckout")}</span>
              </div>

              {/* Submit */}
              <button
                onClick={handlePurchaseSubmit}
                disabled={!purchaseForm.businessName || !purchaseForm.businessUrl || !purchaseForm.logoFile}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-yellow-500/15 hover:shadow-xl hover:shadow-yellow-500/25 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {t("home.purchaseModal.payViaStripe", { price: calculatePrice(purchaseForm.durationDays).toLocaleString() })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
