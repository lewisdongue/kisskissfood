import { useNavigate } from "@/lib/router-compat";
import { useEffect, useState } from "react";
import { SendYuyuModal } from "./SendYuyuModal";
import { BalanceDisplay } from "./BalanceDisplay";
import { YUYUButton } from "./YUYUButton";
import { useCoinsBalance } from "@/hooks/useCoins";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { shouldShowVerifiedBadge, VerifiedAvatarWrapper } from "@/components/VerifiedBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User, HelpCircle, Users, ArrowUpRight, Send } from "lucide-react";
import type { LanguageCode, User as UserType } from "../types";
import type { GuestUser } from "../utils/guestUser";
import { useTranslation } from "react-i18next";
import { PremiumButton } from "./PremiumButton";
import PremiumActivatedButton from "./PremiumActivatedButton";
import { formatMobileNumber } from "@/utils/helpers";

interface NavbarProps {
  user: UserType | GuestUser | null;
  logout: () => void;
  selectedLanguage: LanguageCode;
  handleLanguageChange: (lang: LanguageCode) => void;
  setShowAuthModal: (show: boolean) => void;
}

/* ═══════════════════════════════════════════════════════════════════
   FLOATING NOIR HEADER — a single hairline capsule suspended in black.
   Zero chrome, zero color. Identity, state, and one way in.
   ═══════════════════════════════════════════════════════════════════ */
export const Navbar: React.FC<NavbarProps> = ({
  user,
  logout,
  selectedLanguage,
  handleLanguageChange,
  setShowAuthModal,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const authedUser = user && !("isGuest" in user) ? user : null;
  const { data: liveCoinsBalance } = useCoinsBalance();
  const [showSendYuyu, setShowSendYuyu] = useState(false);
  const yuyuBalance = liveCoinsBalance?.yuyu_score ?? authedUser?.yuyu_score ?? 0;
  const formattedYuyuBalance = formatMobileNumber(yuyuBalance);

  const LANG_KEY = "audioChat_language";
  const storageLanugae =
    typeof window !== "undefined" ? window.localStorage.getItem(LANG_KEY) : null;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (stored && stored !== selectedLanguage) {
        handleLanguageChange(stored as LanguageCode);
      }
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const onLangChange = (lang: LanguageCode) => {
    try {
      window.localStorage.setItem(LANG_KEY, String(lang));
    } catch {
      // ignore
    }
    handleLanguageChange(lang);
  };

  const activeLanguage = (storageLanugae as LanguageCode) || selectedLanguage;

  return (
    <header className="sticky top-0 z-40 w-full safe-area-top">
      <div className="px-3 sm:px-5 pt-3 sm:pt-4">
        {/* Mobile: two fixed rows. Every primary account control remains visible. */}
        <nav className={`floating-nav mx-auto grid w-full gap-1.5 rounded-[20px] p-2 md:hidden ${authedUser ? "grid-rows-[48px_56px]" : "grid-rows-[48px]"}`}>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Caakus — home"
              className="group flex min-w-0 items-center gap-2 press-spring"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle,rgba(124,92,255,0.55),transparent_70%)] blur-md opacity-70" />
                <img src="/logo.webp" alt={t("common.logoAlt")} width={28} height={28} decoding="async" fetchPriority="high" className="relative h-7 w-7 object-contain" />
              </span>
              <span className="min-w-0 text-sm font-display font-semibold text-white/95">
                {t("navbar.brand")}
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-1.5">
              <LanguageSelector
                size="compact"
                selectedLanguage={activeLanguage}
                onChange={onLangChange}
                className="h-10 min-w-0 w-[72px] px-2"
              />

              {authedUser ? (
                <>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowSendYuyu(true)}
                    aria-label="Send Yuyu"
                    title="Send Yuyu"
                    className="h-10 w-10 shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                  >
                    <Send className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Account menu"
                        className="relative h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/[0.04] nav-ghost"
                      >
                        <VerifiedAvatarWrapper
                          isVerified={shouldShowVerifiedBadge(authedUser)}
                          subscriptionType={authedUser.subscription_type}
                          size="sm"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={authedUser.profile_picture || ""} alt={authedUser.name || "User"} />
                            <AvatarFallback className="bg-white/[0.06] text-xs font-semibold text-white/85">
                              {authedUser.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>
                        </VerifiedAvatarWrapper>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-64 rounded-2xl border-white/10 bg-[#07070a]/95 backdrop-blur-2xl"
                      align="end"
                      sideOffset={8}
                      collisionPadding={12}
                    >
                      <DropdownMenuLabel className="font-normal">
                        <p className="text-sm font-medium text-white/95">{authedUser.name || t("navbar.userFallback")}</p>
                        <p className="break-all text-[11px] text-white/45">{authedUser.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={() => navigate("/settings")}><User className="mr-2 h-4 w-4 text-white/50" /><span>Profile</span></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowSendYuyu(true)}><Send className="mr-2 h-4 w-4 text-emerald-300" /><span>Send Yuyu</span></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/connections")}><Users className="mr-2 h-4 w-4 text-white/50" /><span>{t("globalConnection.title")}</span></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/support")}><HelpCircle className="mr-2 h-4 w-4 text-white/50" /><span>{t("navbar.support")}</span></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}><Settings className="mr-2 h-4 w-4 text-white/50" /><span>{t("navbar.settings")}</span></DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={logout} className="text-white/70 focus:text-white"><LogOut className="mr-2 h-4 w-4" /><span>{t("navbar.logout")}</span></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="auth-guest-slot">
                  <span className="auth-account-placeholder h-10 w-10 rounded-full border border-white/10 bg-white/[0.04]" aria-hidden="true" />
                  <Button data-auth-guest="" onClick={() => setShowAuthModal(true)} className="h-10 rounded-full bg-violet-600 px-4 font-bold text-white hover:bg-violet-500">
                    {t("navbar.signIn")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {authedUser && (
            <div className="grid min-w-0 grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)_auto] items-center gap-1 rounded-xl border border-white/10 bg-black/70 p-1">
              <BalanceDisplay initialBalance={authedUser.balance} compact />
              <YUYUButton compact score={yuyuBalance} referralCode={authedUser.referral_code} />
              {!shouldShowVerifiedBadge(authedUser) ? (
                <PremiumButton size="compact" />
              ) : (
                <PremiumActivatedButton size="compact" subscriptionType={authedUser.subscription_type} />
              )}
            </div>
          )}
        </nav>

        {/* ═══════════════════════════════════════════════════════════════
           MAIN NAV — single solid black bar, all items share one baseline.
           Height is fixed so buttons, wallet and avatar align perfectly.
           ═══════════════════════════════════════════════════════════════ */}
        <nav className="floating-nav mx-auto hidden h-16 max-w-6xl items-center gap-2 rounded-[22px] px-3.5 md:flex">
          {/* Identity */}
          <button
            onClick={() => navigate("/")}
            aria-label="Caakus — home"
            className="group flex shrink-0 items-center gap-2.5 pl-1 pr-2 press-spring"
          >
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(124,92,255,0.55),transparent_70%)] blur-md opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
              <img
                src="/logo.webp"
                alt={t("common.logoAlt")}
                width={32}
                height={32}
                decoding="async"
                fetchPriority="high"
                className="relative h-8 w-8 object-contain"
              />
            </span>
            <span className="hidden sm:block text-[15px] font-display font-semibold tracking-[-0.04em] text-white/95">
              {t("navbar.brand")}
            </span>
          </button>

          {/* Desktop live state — financial controls stay separate from account actions. */}
          {authedUser && (
            <div className="ml-1 hidden md:flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 h-16 md:px-1.5 md:py-1 md:h-auto">
              <BalanceDisplay initialBalance={authedUser.balance} />
              <span className="h-5 w-px bg-white/10" />
              <YUYUButton
                score={liveCoinsBalance?.yuyu_score ?? authedUser.yuyu_score}
                displayScore={formattedYuyuBalance}
                referralCode={authedUser.referral_code}
              />
            </div>
          )}

          <div className="min-w-0 flex-1" />

          {/* Utilities — every child is forced to the same 48px (mobile) / 56px (desktop) line */}
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-2.5">
            <div className="hidden sm:block">
              <LanguageSelector selectedLanguage={activeLanguage} onChange={onLangChange} />
            </div>
            <div className="sm:hidden">
              <LanguageSelector
                size="compact"
                selectedLanguage={activeLanguage}
                onChange={onLangChange}
              />
            </div>

            {/* Premium — compact on laptop so it never pushes the account menu off screen.
                Below lg it lives in the mobile strip underneath. */}
            <div className="hidden lg:block">
              {authedUser && !shouldShowVerifiedBadge(authedUser) ? (
                <PremiumButton size="compact" />
              ) : authedUser && shouldShowVerifiedBadge(authedUser) ? (
                <PremiumActivatedButton
                  size="compact"
                  subscriptionType={authedUser.subscription_type}
                />
              ) : null}
            </div>


            {authedUser ? (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowSendYuyu(true)}
                  aria-label="Send Yuyu"
                  title="Send Yuyu"
                  className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-500/15 hover:text-emerald-200"
                >
                  <Send className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Account menu"
                      className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full border border-white/10 bg-white/[0.04] nav-ghost"
                    >
                      <VerifiedAvatarWrapper
                        isVerified={shouldShowVerifiedBadge(authedUser)}
                        subscriptionType={authedUser.subscription_type}
                        size="sm"
                      >
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                          <AvatarImage
                            src={authedUser.profile_picture || ""}
                            alt={authedUser.name || "User"}
                          />
                          <AvatarFallback className="bg-white/[0.06] text-[13px] font-semibold text-white/85">
                            {authedUser.name?.charAt(0).toUpperCase() || (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </VerifiedAvatarWrapper>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 rounded-2xl border-white/10 bg-[#07070a]/95 backdrop-blur-2xl"
                    align="end"
                    sideOffset={8}
                    collisionPadding={12}
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1.5">
                        <p className="truncate text-sm font-medium text-white/95">
                          {authedUser.name || t("navbar.userFallback")}
                        </p>
                        <p className="truncate text-[11px] text-white/45">{authedUser.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <User className="mr-2 h-4 w-4 text-white/50" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowSendYuyu(true)}>
                      <Send className="mr-2 h-4 w-4 text-emerald-300" />
                      <span>Send Yuyu</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/connections")}>
                      <Users className="mr-2 h-4 w-4 text-white/50" />
                      <span>{t("globalConnection.title")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/support")}>
                      <HelpCircle className="mr-2 h-4 w-4 text-white/50" />
                      <span>{t("navbar.support")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4 text-white/50" />
                      <span>{t("navbar.settings")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem onClick={logout} className="text-white/70 focus:text-white">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("navbar.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="auth-guest-slot">
                <span className="auth-account-placeholder h-12 w-12 rounded-full border border-white/10 bg-white/[0.04]" aria-hidden="true" />
                <Button
                  data-auth-guest=""
                  onClick={() => setShowAuthModal(true)}
                  className="group h-14 sm:h-16 rounded-full border-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-8 sm:px-12 text-lg sm:text-2xl font-extrabold tracking-tight text-white shadow-[0_0_28px_rgba(139,92,246,0.55)] hover:shadow-[0_0_44px_rgba(139,92,246,0.8)] hover:brightness-110 press-spring"
                >
                  {t("navbar.signIn")}
                  <ArrowUpRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 opacity-90 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </div>
            )}
          </div>
        </nav>

        {/* Wallet strip — touch-scroll keeps every financial control available on small screens. */}
        {authedUser && (
          <div className="mx-auto mt-2 hidden max-w-6xl rounded-[18px] border border-white/10 bg-black px-2.5 py-2 md:block lg:hidden">
            <div className="flex w-max min-w-full items-center justify-start gap-2 sm:justify-center">
              <div className="shrink-0">
                {!shouldShowVerifiedBadge(authedUser) ? (
                  <PremiumButton size="compact" />
                ) : (
                  <PremiumActivatedButton
                    size="compact"
                    subscriptionType={authedUser.subscription_type}
                  />
                )}
              </div>
            </div>
          </div>
        )}


        {authedUser && (
          <SendYuyuModal open={showSendYuyu} onOpenChange={setShowSendYuyu} balance={yuyuBalance} />
        )}
      </div>
    </header>
  );
};
