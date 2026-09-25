import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, CircleAlert, Clock3, Sparkles } from "lucide-react";
import { useCreateSubscription } from "@/hooks/useSubscription";
import { MobilePaymentModal } from "@/components/MobilePaymentModal";
import { isMobile } from "@/utils/deviceDetection";
import { supabase } from "@/config/supabase";
import { ReferralUnlockModal } from "@/components/ReferralUnlockModal";

const FOUNDING_MEMBERS_MAX = 50_000;
const formatCount = (value: number) => value.toLocaleString("en-US");
const REFERRAL_CTA_CLASS = "premium-referral-cta relative mt-3 h-auto min-h-16 w-full min-w-0 overflow-hidden whitespace-normal break-words rounded-xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 px-3 py-4 text-center text-base font-extrabold leading-snug text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all duration-300 hover:scale-[1.02] hover:text-amber-200 hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] sm:text-sm lg:px-4 lg:text-base";

type PremiumRewardStatus = { premium_expires_at?: string | null };

function formatRemaining(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  return `${days}d ${hours}h ${minutes}m ${seconds % 60}s`;
}

interface PremiumButtonProps {
  size?: 'default' | 'compact';
  /** When true, the plan dialog is open on mount (e.g. on /plan page). */
  defaultOpen?: boolean;
  /** When false, the trigger button is hidden (use with defaultOpen for plan page). */
  renderTrigger?: boolean;
  /** Called when a triggerless dialog is dismissed, so its host page never stays empty. */
  onDialogClose?: () => void;
}

export const PremiumButton = ({ size = 'default', defaultOpen = false, renderTrigger = true, onDialogClose }: PremiumButtonProps) => {
  const [open, setOpen] = useState(!!defaultOpen);
  const [showMobilePayment, setShowMobilePayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [foundingMembersCount, setFoundingMembersCount] = useState<number | null>(null);
  const [referralTarget, setReferralTarget] = useState<5 | 10 | 50 | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [earnedPremiumExpiresAt, setEarnedPremiumExpiresAt] = useState<string | null>(null);
  const [remainingPremiumMs, setRemainingPremiumMs] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<{
    type: string;
    amount: number;
    name: string;
  } | null>(null);
  const { t } = useTranslation();

  const openReferralChallenge = async (target: 5 | 10 | 50) => {
    const { data } = await supabase.auth.getUser();
    setCurrentUserId(data.user?.id ?? null);
    setOpen(false);
    setReferralTarget(target);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && !renderTrigger) onDialogClose?.();
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const [{ data, error }, { data: authData }] = await Promise.all([
        supabase.rpc("get_founding_members_count"),
        supabase.auth.getUser(),
      ]);
      if (cancelled) return;
      if (!error && typeof data === "number") setFoundingMembersCount(data);
      else setFoundingMembersCount(null);
      const nextUserId = authData.user?.id ?? null;
      setCurrentUserId(nextUserId);
      if (!nextUserId) {
        setEarnedPremiumExpiresAt(null);
        setRemainingPremiumMs(0);
        return;
      }
      const { data: rewardData } = await supabase.rpc("get_referral_unlock_status");
      if (cancelled) return;
      const expiry = (rewardData as PremiumRewardStatus | null)?.premium_expires_at ?? null;
      setEarnedPremiumExpiresAt(expiry);
      setRemainingPremiumMs(expiry ? Math.max(0, new Date(expiry).getTime() - Date.now()) : 0);
    })();
    return () => { cancelled = true; };
  }, [open]);

  // Keep the remaining Founder's Club spots in sync while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(async () => {
      const { data, error } = await supabase.rpc("get_founding_members_count");
      if (!error && typeof data === "number") setFoundingMembersCount(data);
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !earnedPremiumExpiresAt) return;
    const expiry = new Date(earnedPremiumExpiresAt).getTime();
    const updateRemaining = () => setRemainingPremiumMs(Math.max(0, expiry - Date.now()));
    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [earnedPremiumExpiresAt, open]);
  
  const createSubscription = useCreateSubscription({ skipAutoRedirect: true });

  const handleSubscription = async (plan: string) => {
    console.log('[PremiumButton] ===== START handleSubscription =====', { plan });
    setCheckoutError(null);
    const planAmount = plan === "student" ? 4.99 : plan === "lifetime" ? 299 : 21.99;
    const planName =
      plan === "student"
        ? "Student Plan"
        : plan === "lifetime"
          ? "Founder's Club (Lifetime)"
          : "Regular Plan";
    
    console.log('[PremiumButton] Plan config:', { plan, planAmount, planName });
    
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/`;
    const cancelUrl = `${baseUrl}/`;
    
    console.log('[PremiumButton] URLs:', { baseUrl, successUrl, cancelUrl });
    
    const isMobileDevice = isMobile();
    console.log('[PremiumButton] Device check:', { isMobileDevice, userAgent: navigator.userAgent });
    
    if (isMobileDevice) {
      console.log('[PremiumButton] MOBILE FLOW - showing payment modal');
      setSelectedPlan({
        type: plan,
        amount: planAmount,
        name: planName,
      });
      setShowMobilePayment(true);
      setOpen(false);
    } else {
      console.log('[PremiumButton] DESKTOP FLOW - calling createSubscription mutation');
      toast.loading("Starting checkout...", { id: "subscription-checkout" });
      
      console.log('[PremiumButton] About to call mutate with:', { plan, successUrl, cancelUrl });
      
      createSubscription.mutate(
        { 
          plan, 
          successUrl, 
          cancelUrl 
        },
        {
          onSuccess: (data) => {
            console.log('[PremiumButton] ✅ Mutation SUCCESS - data received:', data);
            if (data?.url) {
              toast.dismiss("subscription-checkout");
              console.log('[PremiumButton] Redirecting to Stripe checkout:', data.url);
              window.location.href = data.url;
            } else {
              toast.dismiss("subscription-checkout");
              console.error('[PremiumButton] ❌ No URL in success response:', data);
              const message = "Stripe checkout URL not returned.";
              setCheckoutError(message);
              toast.error(message);
            }
          },
          onError: (error) => {
            console.error('[PremiumButton] ❌ Mutation ERROR:', error);
            toast.dismiss("subscription-checkout");
            const message = error instanceof Error ? error.message : "Failed to start checkout";
            setCheckoutError(message);
            toast.error(message);
            console.error('[PremiumButton] Full error object:', error);
          }
        }
      );
      console.log('[PremiumButton] Mutation call dispatched (async)');
    }
    console.log('[PremiumButton] ===== END handleSubscription =====');
  };

  const handleMobileSubscriptionProceed = async (): Promise<{ url: string; id: string } | void> => {
    if (!selectedPlan) {
      console.error('[PremiumButton] No selected plan');
      return;
    }
    
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/`;
    const cancelUrl = `${baseUrl}/`;

    console.log('[PremiumButton] Creating subscription:', {
      plan: selectedPlan.type,
      successUrl,
      cancelUrl,
    });

    try {
      toast.loading("Starting checkout...", { id: "subscription-checkout" });
      const result = await createSubscription.mutateAsync({
        plan: selectedPlan.type,
        successUrl,
        cancelUrl,
      });

      console.log('[PremiumButton] Subscription result:', result);

      if (!result) {
        throw new Error('No result returned from subscription service');
      }

      toast.dismiss("subscription-checkout");
      return result as { url: string; id: string };
    } catch (error) {
      toast.dismiss("subscription-checkout");
      const message = error instanceof Error ? error.message : "Failed to start checkout";
      setCheckoutError(message);
      toast.error(message);
      console.error('[PremiumButton] Subscription error:', error);
      throw error;
    }
  };

  if (showMobilePayment && selectedPlan) {
    return (
      <MobilePaymentModal
        title={`Subscribe to ${selectedPlan.name}`}
        description="Get unlimited access to premium features"
        amount={selectedPlan.amount}
        type="subscription"
        onClose={() => {
          setShowMobilePayment(false);
          setSelectedPlan(null);
          setOpen(false);
        }}
        onProceed={handleMobileSubscriptionProceed}
        isPending={createSubscription.isPending}
      />
    );
  }

  const buttonClass = size === 'compact'
    ? "h-11 min-w-[82px] px-2 bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-950/40 hover:shadow-lg transition-all flex items-center justify-center text-[10px] font-bold whitespace-nowrap rounded-xl"
    : "h-12 sm:h-14 px-5 sm:px-7 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/40 hover:shadow-xl transition-all flex items-center gap-2 text-sm sm:text-base font-bold whitespace-nowrap rounded-full";

  return (
    <>
      {renderTrigger && (
        <Button
          onClick={() => setOpen(true)}
          className={buttonClass}
        >
          {t("premium.button")}
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="h-auto w-[95vw] max-w-[calc(100vw-1rem)] sm:max-w-5xl max-h-[90dvh] overflow-x-hidden overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl sm:p-8"
        >
          {earnedPremiumExpiresAt && (
            <div className="order-first mb-4 min-w-0" aria-live="polite">
              <div className={`transition-colors duration-500 ${remainingPremiumMs > 0 ? "rounded-xl border border-emerald-400/60 bg-emerald-500/15 p-4 shadow-[0_0_24px_color-mix(in_oklab,var(--color-emerald-400)_22%,transparent)] sm:p-5" : "rounded-xl border-2 border-red-500/70 bg-red-500/15 p-4 shadow-[0_0_28px_color-mix(in_oklab,var(--color-red-500)_28%,transparent)] sm:p-5"}`}>
                {remainingPremiumMs > 0 ? (
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300"><Sparkles className="h-6 w-6" aria-hidden /></div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-emerald-400 text-emerald-950">ACTIVE REWARD</Badge>
                        <span className="flex items-center gap-1 text-sm font-bold text-emerald-200"><Check className="h-4 w-4" /> All Pro features unlocked</span>
                      </div>
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-xl font-black text-emerald-100 sm:text-2xl"><Clock3 className="h-5 w-5 shrink-0" aria-hidden /><span className="tabular-nums">{formatRemaining(remainingPremiumMs)}</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3"><CircleAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-300" aria-hidden /><p className="min-w-0 break-words text-sm font-extrabold leading-6 text-red-100 sm:text-base">Your free premium time has expired. Continue inviting friends to unlock more free days!</p></div>
                    <Button onClick={() => void openReferralChallenge(5)} className="h-12 shrink-0 bg-red-500 px-5 font-extrabold text-white hover:bg-red-400">Invite friends</Button>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogHeader className="mb-6 min-w-0 space-y-2 pr-10 sm:pr-0">
            <DialogTitle className="break-words text-center text-lg font-bold text-white sm:text-2xl">
              {t("premium.title")}
            </DialogTitle>
            <DialogDescription className="break-words text-center text-sm text-zinc-400">
              {t("premium.description")}
            </DialogDescription>
          </DialogHeader>

          {checkoutError && (
            <div className="w-full rounded-xl border border-red-300/70 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm mb-4">
              {checkoutError}
            </div>
          )}

          <div className="mt-4 flex w-full min-w-0 flex-col gap-4 sm:grid sm:grid-cols-3 sm:gap-6">
            <div className="flex min-w-0 flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-5 transition-all hover:shadow-lg sm:p-6">
              <div className="flex-1">
                <h3 className="mb-2 break-words text-lg font-bold text-white sm:text-2xl">
                  Student
                </h3>
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$4.99</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">/month</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Perfect for students on a budget
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Instant skip - no waiting time</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Gender-based filtering</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Region-based filtering</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Interest matching filters</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>5x priority matching</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Boosted profile visibility</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Unlimited calls</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => handleSubscription("student")}
                disabled={createSubscription.isPending}
                className="w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-semibold rounded-xl py-3 transition-all"
              >
                {createSubscription.isPending ? t("premium.loading") : "Upgrade to Student"}
              </Button>
              <Button variant="outline" onClick={() => void openReferralChallenge(5)} className={REFERRAL_CTA_CLASS}>
                Or invite 5 verified friends — free
              </Button>
            </div>

            <div className="relative flex min-w-0 flex-col rounded-2xl border-2 border-blue-600 bg-zinc-900 p-5 transition-all hover:shadow-xl sm:p-6">
              <Badge className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-2 py-1">
                POPULAR
              </Badge>
              <div className="flex-1">
                <h3 className="mb-2 break-words text-lg font-bold text-white sm:text-2xl">
                  Regular
                </h3>
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$21.99</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">/month</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Unlock the full experience
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Instant skip - no waiting time</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Gender-based filtering</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Region-based filtering</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Interest matching filters</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Unlimited calls & messages</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Verified profile badges</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Priority matching</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => handleSubscription("regular")}
                disabled={createSubscription.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 transition-all shadow-lg"
              >
                {createSubscription.isPending ? t("premium.loading") : "Upgrade to Regular"}
              </Button>
              <Button variant="outline" onClick={() => void openReferralChallenge(10)} className={REFERRAL_CTA_CLASS}>
                Or invite 10 verified friends — free
              </Button>
            </div>

            <div className="relative flex min-w-0 flex-col rounded-2xl border-2 border-yellow-600 bg-zinc-900 p-5 transition-all hover:shadow-xl sm:p-6">
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                <Crown className="w-3 h-3" />
                LIMITED
              </div>
              <div className="flex-1">
                <h3 className="mb-2 flex min-w-0 items-center gap-2 break-words text-lg font-bold text-white sm:text-2xl">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  Founder's Club
                </h3>
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$299</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">/lifetime</span>
                </div>
                <div className="mb-4 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 px-3 py-2 text-center">
                  <p className="text-xs font-bold text-yellow-900 dark:text-yellow-100">
                    {foundingMembersCount !== null
                      ? `${formatCount(Math.max(0, FOUNDING_MEMBERS_MAX - foundingMembersCount))} spots left of ${formatCount(FOUNDING_MEMBERS_MAX)}`
                      : `Limited to ${formatCount(FOUNDING_MEMBERS_MAX)} members`}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Save 90% for life + exclusive perks
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Get a $5K monthly ad spot for just $1K</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>1M+ impressions every month</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>All Regular features included</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Lifetime access to all features</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>"FOUNDING MEMBER" animated badge</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Inner Circle WhatsApp/Telegram</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Quarterly meetings + 1-on-1 with Founder</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (foundingMembersCount !== null && foundingMembersCount >= FOUNDING_MEMBERS_MAX) {
                    toast.error(t("premium.plan.lifetime.soldOut"));
                    return;
                  }
                  handleSubscription("lifetime");
                }}
                disabled={createSubscription.isPending || (foundingMembersCount !== null && foundingMembersCount >= FOUNDING_MEMBERS_MAX)}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold rounded-xl py-3 transition-all shadow-lg disabled:opacity-60"
              >
                {createSubscription.isPending
                  ? t("premium.loading")
                  : foundingMembersCount !== null && foundingMembersCount >= FOUNDING_MEMBERS_MAX
                    ? "SOLD OUT"
                    : "Become a Founder"}
              </Button>
              <Button variant="outline" onClick={() => void openReferralChallenge(50)} className={REFERRAL_CTA_CLASS}>
                Or invite 50 verified friends — free
              </Button>
            </div>
          </div>

          <DialogClose asChild>
            <Button className="w-full mt-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl py-3">
              {t("premium.cancel")}
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <ReferralUnlockModal
        open={referralTarget !== null}
        onOpenChange={(next) => { if (!next) setReferralTarget(null); }}
        userId={currentUserId}
        initialTarget={referralTarget ?? 5}
        onUpgrade={() => { setReferralTarget(null); setOpen(true); }}
        onSignIn={() => window.location.assign("/auth")}
      />
    </>
  );
};
