import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Coins } from "lucide-react";

// Hook to detect mobile viewport
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};
import {
  ShoppingBag,
  Headphones,
  Lightbulb,
  Watch,
  Smartphone,
  Gamepad2,
  Gem,
  Rocket,
  Crown,
  Star,
  Heart,
  Gift,
  Car,
  Waves,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateGiftCheckout, useSendGift } from "@/hooks/useGift";
import { useWalletBalance } from "@/hooks/useWallet";
import { useQueryClient } from "@tanstack/react-query";
import { InsufficientFundsModal } from "./InsufficientFundsModal";
import { CoinsPurchaseModal } from "./CoinsPurchaseModal";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
// @ts-ignore
import confetti from "canvas-confetti";
import { useMarketplaceGifts } from "@/hooks/useMarketplaceGifts";
import { useCoinsBalance } from "@/hooks/useCoins";
import { getGiftImagePath } from "@/utils/giftImageMapping";

interface MarketplaceSectionProps {
  toUserId: string;
  onGiftSent?: (itemName: string, amount: number) => void;
  /** Only the Shop button + gift dialog — for embedding in challenge modal (no balance row). */
  embedMode?: boolean;
}

export const MarketplaceSection = ({ toUserId, onGiftSent, embedMode }: MarketplaceSectionProps) => {
  const [open, setOpen] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [showCoinsPurchase, setShowCoinsPurchase] = useState(false);
  const [selectedGift, setSelectedGift] = useState<{ marketplaceGiftId?: string; amount: number; itemName: string } | null>(null);
  const [confirmGift, setConfirmGift] = useState<{ id?: string; amount: number; itemName: string } | null>(null);
  
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: createGiftCheckout, isPending: isCheckoutPending } = useCreateGiftCheckout();
  const { mutate: sendGiftFromWallet, isPending: isWalletPending } = useSendGift();
  const { data: walletData, refetch: refetchBalance, isLoading: isBalanceLoading } = useWalletBalance();
  const { data: coinsData, isLoading: isCoinsLoading } = useCoinsBalance();
  const { data: marketplaceGifts, isLoading: isGiftsLoading } = useMarketplaceGifts();
  const isMobile = useIsMobile();

  const isPending = isCheckoutPending || isWalletPending;
  const userBalance = walletData?.balance ?? 0;
  const userCoins = coinsData?.yuyu_score ?? 0;
  const coinsNeededFor1Dollar = 100; // 100 coins = $1
  
  // Enhanced debugging
  console.log('[MarketplaceSection] State:', {
    userBalance,
    userCoins,
    walletData,
    coinsData,
    isBalanceLoading,
    isCoinsLoading,
    marketplaceGiftsCount: marketplaceGifts?.length || 0,
    isGiftsLoading,
    user: user?.id
  });
  
  // Debug: Track confirmGift state changes
  useEffect(() => {
    if (confirmGift) {
      console.log('[MarketplaceSection] confirmGift set:', confirmGift);
    }
  }, [confirmGift]);

  const iconForKey = useMemo(() => {
    const map: Record<string, ReactNode> = {
      star: <Star size={28} />,
      heart: <Heart size={28} />,
      gift: <Gift size={28} />,
      headphones: <Headphones size={28} />,
      lightbulb: <Lightbulb size={28} />,
      watch: <Watch size={28} />,
      smartphone: <Smartphone size={28} />,
      gamepad2: <Gamepad2 size={28} />,
      shoppingbag: <ShoppingBag size={28} />,
      gem: <Gem size={28} />,
      crown: <Crown size={28} />,
      rocket: <Rocket size={28} />,
      car: <Car size={28} />,
      siren: <Waves size={28} />,
      diamond: <Gem size={28} />,
      oracle: <Sparkles size={28} />,
      cosmic: <Rocket size={28} />,
      legend: <Crown size={28} />,
    };
    return (key?: string | null) => map[String(key || "").toLowerCase()] || <Gift size={28} />;
  }, []);

  const displayGifts = useMemo(() => {
    const all = marketplaceGifts || [];
    const premiumNames = new Set([
      "the siren's call",
      "infinite diamond",
      "the oracle",
      "cosmic sovereignty",
      "eternal legend",
    ]);
    const premium = all.filter((item) =>
      premiumNames.has(String((item as any).name || "").toLowerCase())
    );
    const regular = all.filter(
      (item) => !premiumNames.has(String((item as any).name || "").toLowerCase())
    );

    // Interleave premium gifts every 2 regular items to keep them visible
    const mixed: any[] = [];
    let p = 0;
    let r = 0;
    while (r < regular.length || p < premium.length) {
      for (let i = 0; i < 2 && r < regular.length; i += 1) {
        mixed.push(regular[r++]);
      }
      if (p < premium.length) {
        mixed.push(premium[p++]);
      }
      if (regular.length === 0 && p < premium.length) {
        mixed.push(premium[p++]);
      }
    }

    return mixed;
  }, [marketplaceGifts]);

  const triggerGiftAnimation = (itemName: string) => {
    // Confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB'];

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.3, 0.7), y: randomInRange(0.4, 0.6) },
        colors: colors,
        shapes: ['circle', 'square'],
        scalar: randomInRange(0.8, 1.2),
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Success toast with icon
    toast.success(t('marketplace.giftSentSuccess', { name: itemName }), {
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 'bold',
      },
    });
  };

  const handleSendGift = async (gift: { id?: string; amount: number; itemName: string }) => {
    const amount = gift.amount;
    const itemName = gift.itemName;
    const coinsNeeded = Math.ceil(amount * coinsNeededFor1Dollar);

    // Validation: User must be logged in
    if (!user) {
      toast.error(t('marketplace.loginRequired'));
      return;
    }

    // Validation: Recipient must be valid
    if (!toUserId || toUserId.trim() === "") {
      toast.error(t('marketplace.recipientError'));
      console.error("Gift send failed: toUserId is empty", { toUserId });
      return;
    }

    // ✅ NEW: Check dual wallet (USD wallet + Yuyu)
    const hasUSD = userBalance >= amount;
    const hasCoins = userCoins >= coinsNeeded;
    
    console.log('[MarketplaceSection] Dual wallet check:', {
      amount,
      hasUSD,
      userBalance,
      hasCoins,
      userCoins,
      coinsNeeded
    });

    if (hasUSD || hasCoins) {
      // USER HAS SUFFICIENT FUNDS - Backend will auto-select payment method
      // Priority: USD wallet first, then coins

        // ✅ OPTIMISTIC UPDATE: Immediately update UI before backend responds
        const previousBalance = userBalance;
        console.log('[MarketplaceSection] Starting gift send', {
          previousBalance,
          amount,
          optimisticBalance: userBalance - amount
        });
        
        queryClient.setQueryData(['wallet', 'balance'], { balance: userBalance - amount });
        
        sendGiftFromWallet(
          { toUserId, amount, itemName },
          {
            onSuccess: (data: any) => {
              console.log("[MarketplaceSection] Gift sent successfully", data);
              console.log('[MarketplaceSection] Payment method:', data?.paymentMethod);
              
              const paymentMethod = data?.paymentMethod || 'usd_wallet';
              const methodLabel = paymentMethod === 'yuyu_coins' ? t('marketplace.yuyuCoins') : t('marketplace.usdWallet');
              
              triggerGiftAnimation(itemName);
              toast.success(t('marketplace.giftSentVia', { method: methodLabel }), { duration: 3000 });
              
              // ✅ Refetch both balances
              queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
              queryClient.invalidateQueries({ queryKey: ['coins', 'balance'] });
              
              // Callback to parent component for additional animations
              if (onGiftSent) {
                onGiftSent(itemName, amount);
              }
            },
            onError: (error: any) => {
              console.error("[MarketplaceSection] Failed to send gift:", error);
              console.log('[MarketplaceSection] Rolling back balances');
              
              // ❌ ROLLBACK: Refetch to restore accurate balances
              queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
              queryClient.invalidateQueries({ queryKey: ['coins', 'balance'] });
              
              if (error?.message === "insufficient_funds" || error?.response?.data?.error === "insufficient_funds") {
                // Insufficient funds in both wallets
                toast.error(t('marketplace.insufficientFundsError'));
                setSelectedGift({ amount, itemName });
                setShowInsufficientFunds(true);
              } else {
                toast.error(t('marketplace.giftSendFailed', { error: error?.message || "Unknown error" }));
              }
            },
          }
        );
    } else {
      // ❌ INSUFFICIENT FUNDS in both wallets
      console.log('[MarketplaceSection] Insufficient funds in both wallets');
      toast.error(t('marketplace.insufficientFundsBuy'));
      setSelectedGift({ marketplaceGiftId: gift.id, amount, itemName });
      setShowInsufficientFunds(true);
    }
  };

  const handleTopUpAndSend = async () => {
    // User wants to buy with real money via Stripe
    if (!selectedGift) return;

    const { marketplaceGiftId, amount, itemName } = selectedGift;

    return new Promise<{ url: string; id: string }>((resolve, reject) => {
      createGiftCheckout(
        {
          toUserId,
          marketplaceGiftId,
          // keep legacy fields as fallback until all gifts have stripe_price_id filled
          amount,
          itemName,
          successUrl: `${window.location.origin}${window.location.pathname}?gift=success`,
          cancelUrl: `${window.location.origin}${window.location.pathname}?gift=cancel`,
        },
        {
          onSuccess: (data) => {
            // Mobile: return data for modal to handle
            // Desktop: redirect happens in hook
            setShowInsufficientFunds(false);
            resolve(data);
          },
          onError: (error: any) => {
            console.error("Failed to start Stripe gift checkout:", error);
            toast.error(t('marketplace.checkoutFailed'));
            reject(error);
          },
        }
      );
    });
  };

  return (
    <div className={embedMode ? "inline-flex items-center" : "flex flex-col items-start gap-2"}>
      {/* Dual Balance Display - ABOVE the button */}
      {!embedMode && user && (
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm hidden sm:block text-white/70">
            {isBalanceLoading ? (
              <>{t('marketplace.usdLoading')}</>
            ) : (
              <>{t('marketplace.usdBalance', { amount: userBalance.toFixed(2) })}</>
            )}
          </div>
          <div className="bg-yellow-500/20 border border-yellow-400/30 px-3 py-1.5 rounded-lg backdrop-blur-sm hidden sm:flex items-center gap-1 text-yellow-300">
            {isCoinsLoading ? (
              <>{t('marketplace.coinsBalance')}</>
            ) : (
              <>
                <Coins size={14} />
                {userCoins.toLocaleString()}
              </>
            )}
          </div>
          <button
            onClick={() => setShowCoinsPurchase(true)}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hidden sm:flex items-center gap-1"
          >
            <Coins size={14} />
            {t('marketplace.buyCoins')}
          </button>
        </div>
      )}

      {/* Marketplace Button - Optimized for both inline and video overlay positioning */}
      <Button
        onClick={() => setOpen(!open)}
        disabled={!toUserId || toUserId.trim() === ""}
        className="relative px-3 sm:px-4 py-2 rounded-xl text-white font-bold text-xs sm:text-sm 
          bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 
          hover:from-pink-600 hover:via-rose-600 hover:to-orange-500 
          shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all duration-300 
          transform hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] 
          overflow-hidden group border border-white/10 
          min-h-[2.5rem] sm:min-h-[3rem]
          text-center flex items-center justify-center gap-1.5
          backdrop-blur-sm bg-opacity-95"
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
          translate-x-[-100%] group-hover:translate-x-[100%] 
          transition-transform duration-[1200ms] ease-in-out"
        ></div>

        <span className="relative z-10 flex items-center gap-1.5">
          <Gift size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden xs:inline">{t('marketplace.title')}</span>
          <span className="xs:hidden">{t('marketplace.shop')}</span>
        </span>
      </Button>

      {(!toUserId || toUserId.trim() === "") && !embedMode && (
        <p className="text-xs text-red-400 animate-pulse hidden sm:block">
          {t('marketplace.connecting')}
        </p>
      )}

      {/* Marketplace Grid - Uses Portal for proper z-index stacking on all screens */}
      {open && (() => {
        const marketplaceContent = (
          <>
            {/* Backdrop overlay - for both mobile and desktop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
              onClick={() => setOpen(false)}
            />
            
            {/* Marketplace Panel */}
            <div
              className={`
                ${isMobile 
                  ? 'fixed inset-x-0 bottom-0 z-[9999] bg-gradient-to-br from-gray-900/95 via-purple-900/90 to-gray-900/95 rounded-t-3xl animate-slide-up-bottom' 
                  : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-gradient-to-br from-gray-900/95 via-purple-900/90 to-gray-900/95 rounded-3xl w-[90vw] max-w-2xl animate-fade-in'
                }
                backdrop-blur-xl border border-white/20 
                shadow-2xl transition-all duration-500 ease-in-out`}
            >
              {/* Header with close button - for both mobile and desktop */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Gift size={isMobile ? 20 : 24} className="text-pink-400" />
                  <span className={`text-white font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>{t('marketplace.sendGift')}</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
              
              {/* Dual Balance indicator */}
              <div className="px-4 py-3 bg-gradient-to-r from-gray-800/60 to-gray-900/60 border-b border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-white/60 text-xs">{t('marketplace.usdWallet')}</span>
                    <div className="text-green-400 font-bold text-lg">${userBalance.toFixed(2)}</div>
                  </div>
                  <div className="flex-1">
                    <span className="text-white/60 text-xs">{t('marketplace.yuyuCoins')}</span>
                    <div className="text-yellow-400 font-bold text-lg flex items-center gap-1">
                      <Coins size={18} />
                      {userCoins.toLocaleString()}
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCoinsPurchase(true);
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    <Coins size={16} className="mr-1" />
                    {t('marketplace.buyCoins')}
                  </Button>
                </div>
              </div>
              
              {/* Gift Grid */}
              <div className={`p-4 overflow-y-auto grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-3 max-h-[55vh]' : 'grid-cols-4 max-h-[65vh]'}`}>
                {isGiftsLoading ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <div className="text-white/70 text-sm">{t('marketplace.loadingGifts')}</div>
                  </div>
                ) : !displayGifts || displayGifts.length === 0 ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <div className="text-white/70 text-sm">{t('marketplace.noGifts')}</div>
                  </div>
                ) : (
                  displayGifts.map((item, index) => {
                  const amount = Number((item as any).amount);
                  const isPremium = amount >= 1000;
                  const isElite = amount >= 10000;
                  const giftName = (item as any).name;
                  const iconKey = (item as any).icon_key;
                  
                  // ✅ NEW: Dual wallet affordability check
                  const canAffordUSD = userBalance >= amount;
                  const coinsNeeded = Math.ceil(amount * coinsNeededFor1Dollar);
                  const canAffordCoins = userCoins >= coinsNeeded;
                  const canAfford = canAffordUSD || canAffordCoins;
                  
                  // Priority: Local image → Database URL → Icon
                  const localImagePath = getGiftImagePath(giftName);
                  const dbImageUrl = (item as any).image_url;
                  const imageToDisplay = localImagePath || dbImageUrl;
                  
                  return (
                  <div
                    key={item.id || index}
                    className={`flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl 
                      bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-orange-400/20 
                      border ${canAfford ? 'border-green-400/30' : 'border-white/10'} 
                      text-white shadow-md hover:shadow-lg 
                      hover:scale-[1.03] transition-all duration-300 relative overflow-hidden
                      ${isMobile ? 'min-h-[110px]' : 'min-h-[140px]'}`}
                  >
                    {(isPremium || isElite) && (
                      <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                        isElite ? "bg-purple-500/80 text-white" : "bg-amber-400/80 text-black"
                      }`}>
                        {isElite ? t('marketplace.elite') : t('marketplace.vip')}
                      </div>
                    )}
                    
                    {/* Display Image: Local first, then DB URL, finally icon */}
                    {imageToDisplay ? (
                      <img 
                        src={imageToDisplay} 
                        alt={giftName}
                        className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} object-contain mb-1.5`}
                        onError={(e) => {
                          console.warn('[MarketplaceSection] Image failed to load:', imageToDisplay);
                          e.currentTarget.style.display = 'none';
                          const sibling = e.currentTarget.nextElementSibling;
                          if (sibling) {
                            (sibling as HTMLElement).style.display = 'block';
                          }
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback icon (hidden if image exists) */}
                    <div className={`text-white ${imageToDisplay ? 'hidden' : 'block'} mb-1.5`}>
                      {iconForKey(iconKey)}
                    </div>
                    
                    <div className={`${isMobile ? 'text-[9px]' : 'text-sm'} font-semibold text-center leading-tight px-0.5 line-clamp-2 text-white`}>
                      {(item as any).name}
                    </div>
                    <div className={`${isMobile ? 'text-[10px]' : 'text-sm'} mt-0.5 font-bold ${canAfford ? 'text-green-400' : 'text-white/80'}`}>
                      ${amount.toFixed(2)}
                    </div>
                    <Button
                      onClick={() => {
                        console.log('[MarketplaceSection] Send button clicked', {
                          gift: (item as any).name,
                          amount,
                          toUserId,
                          userBalance
                        });
                        
                        setConfirmGift({
                          id: (item as any).id,
                          amount,
                          itemName: String((item as any).name),
                        });
                      }}
                      disabled={isPending}
                      className={`mt-1.5 ${isMobile ? 'px-2 py-0.5 h-6 text-[9px]' : 'px-4 py-1.5 h-auto text-sm'} rounded-full 
                        bg-gradient-to-r from-green-500 to-emerald-500 
                        hover:from-green-600 hover:to-emerald-600 text-white 
                        font-semibold shadow-md hover:shadow-lg transition-all`}
                    >
                      {isPending ? t('marketplace.pending') : t('marketplace.send')}
                    </Button>
                    {canAfford && (
                      <div className={`${isMobile ? 'text-[7px]' : 'text-xs'} text-green-300 mt-0.5`}>
                        {canAffordUSD ? t('marketplace.usd') : t('marketplace.coinsOption')}
                      </div>
                    )}
                  </div>
                  );
                })
                )}
              </div>
            </div>
          </>
        );
        
        // Use portal for both mobile and desktop to escape any overflow:hidden parents
        return createPortal(marketplaceContent, document.body);
      })()}

      {/* Insufficient Funds Modal */}
      {showInsufficientFunds && selectedGift && (
        <InsufficientFundsModal
          itemName={selectedGift.itemName}
          amount={selectedGift.amount}
          currentBalance={userBalance}
          onClose={() => {
            setShowInsufficientFunds(false);
            setSelectedGift(null);
          }}
          onTopUpAndSend={handleTopUpAndSend}
          isPending={isCheckoutPending}
        />
      )}

      {/* Coins Purchase Modal */}
      <CoinsPurchaseModal
        open={showCoinsPurchase}
        onClose={() => setShowCoinsPurchase(false)}
      />

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmGift} onOpenChange={(open) => {
        console.log('[MarketplaceSection] Dialog state change:', { open, confirmGift });
        if (!open) setConfirmGift(null);
      }}>
        <DialogContent className="w-[90%] max-w-[340px] sm:max-w-md rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 dark:from-gray-900 dark:via-green-950/40 dark:to-emerald-950/30 backdrop-blur-xl border-2 border-green-400/30 dark:border-green-600/30 shadow-2xl">
          <DialogHeader className="space-y-3 pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <Gift size={32} className="text-white" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white text-center">
              {t('marketplace.confirmGiftTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-700 dark:text-gray-300 text-center leading-relaxed px-2">
              {t('marketplace.aboutToSend')}{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                {confirmGift?.itemName}
              </span>
              {" "}{t('marketplace.forPrice')}{" "}
              <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                ${confirmGift?.amount.toFixed(2)}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 px-2">
            <Button
              className="w-full sm:flex-1 h-12 sm:h-11 text-base sm:text-sm font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              onClick={() => {
                if (!confirmGift) return;
                handleSendGift({
                  id: confirmGift.id,
                  amount: confirmGift.amount,
                  itemName: confirmGift.itemName,
                });
                setConfirmGift(null);
              }}
            >
              <Gift size={18} className="mr-2" />
              {t('marketplace.sendGiftNow')}
            </Button>
            <Button
              variant="outline"
              className="w-full sm:flex-1 h-12 sm:h-11 text-base sm:text-sm font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              onClick={() => setConfirmGift(null)}
            >
              {t('marketplace.cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
