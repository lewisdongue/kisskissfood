import { useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Zap, Shield, Lock, Wallet } from "lucide-react";
import { useCoinsPackages, useCreateCoinsPurchase, useCoinsBalance, usePurchaseWithWallet } from "@/hooks/useCoins";
import toast from "react-hot-toast";

interface CoinsPurchaseModalProps {
  open: boolean;
  onClose: () => void;
}

// Professional Coin Stack SVG Icons
const CoinStackIcon = ({ size = "md", tier = "starter" }: { size?: "sm" | "md" | "lg"; tier: string }) => {
  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24"
  };

  const getTierConfig = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'starter':
        return { coins: 1, color1: "#FCD34D", color2: "#F59E0B", glow: "#FEF3C7" };
      case 'basic':
        return { coins: 2, color1: "#FCD34D", color2: "#F59E0B", glow: "#FEF3C7" };
      case 'popular':
        return { coins: 3, color1: "#FBBF24", color2: "#F59E0B", glow: "#FEF3C7" };
      case 'premium':
        return { coins: 4, color1: "#FBBF24", color2: "#D97706", glow: "#FDE68A" };
      case 'elite':
        return { coins: 5, color1: "#F59E0B", color2: "#D97706", glow: "#FDE68A" };
      case 'vip':
        return { coins: 6, color1: "#F59E0B", color2: "#B45309", glow: "#FCD34D" };
      case 'ultimate':
        return { coins: 7, color1: "#D97706", color2: "#B45309", glow: "#FBBF24" };
      case 'legendary':
        return { coins: 8, color1: "#B45309", color2: "#92400E", glow: "#F59E0B" };
      default:
        return { coins: 3, color1: "#FBBF24", color2: "#F59E0B", glow: "#FEF3C7" };
    }
  };

  const config = getTierConfig(tier);

  return (
    <div className={`${sizeMap[size]} relative`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
        {/* Glow effect */}
        <circle cx="60" cy="60" r="55" fill={config.glow} opacity="0.2" />
        
        {/* Coin Stack - renders multiple coins based on tier */}
        {Array.from({ length: Math.min(config.coins, 8) }).map((_, index) => {
          const yOffset = 70 - (index * 8);
          const scale = 1 - (index * 0.05);
          const opacity = 1 - (index * 0.05);
          
          return (
            <g key={index} opacity={opacity} transform={`translate(0, ${yOffset}) scale(${scale})`}>
              {/* Coin shadow */}
              <ellipse cx="60" cy="82" rx="28" ry="6" fill="#000000" opacity="0.15" />
              
              {/* Coin body */}
              <ellipse cx="60" cy="45" rx="28" ry="8" fill={config.color2} />
              <rect x="32" y="45" width="56" height="12" fill={`url(#gradient${index})`} />
              <ellipse cx="60" cy="57" rx="28" ry="8" fill={config.color1} />
              
              {/* Coin highlight */}
              <ellipse cx="60" cy="45" rx="28" ry="8" fill="url(#shine)" opacity="0.3" />
              
              {/* Y symbol on top coin */}
              {index === config.coins - 1 && (
                <text x="60" y="52" textAnchor="middle" fill="#92400E" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif">Y</text>
              )}
            </g>
          );
        })}
        
        {/* Sparkles for high tier packages */}
        {config.coins >= 6 && (
          <>
            <circle cx="20" cy="30" r="2" fill="#FBBF24" opacity="0.8">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="40" r="2" fill="#FBBF24" opacity="0.8">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="30" cy="80" r="1.5" fill="#FCD34D" opacity="0.8">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="90" cy="75" r="1.5" fill="#FCD34D" opacity="0.8">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
        
        {/* Gradients */}
        <defs>
          {Array.from({ length: 8 }).map((_, index) => (
            <linearGradient key={`gradient${index}`} id={`gradient${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={config.color1} />
              <stop offset="100%" stopColor={config.color2} />
            </linearGradient>
          ))}
          <radialGradient id="shine">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

// Simplified Coin Icon for balance display
const SimpleCoinIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" />
    <circle cx="12" cy="12" r="10" fill="url(#coinShine)" opacity="0.3" />
    <text x="12" y="16" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="bold" fontFamily="Arial">Y</text>
    <defs>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
      <radialGradient id="coinShine">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

export const CoinsPurchaseModal = ({ open, onClose }: CoinsPurchaseModalProps) => {
  const { t } = useTranslation();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null);
  const { data: packages, isLoading: isPackagesLoading } = useCoinsPackages();
  const { data: balance } = useCoinsBalance();
  const { mutate: createPurchase, isPending } = useCreateCoinsPurchase();
  const { mutate: purchaseWithWallet, isPending: isWalletPurchasing } = usePurchaseWithWallet();

  const iconForKey = useMemo(() => {
    return (name: string) => {
      const tierMap: Record<string, string> = {
        'starter pack': 'starter',
        'basic pack': 'basic',
        'popular pack': 'popular',
        'premium pack': 'premium',
        'elite pack': 'elite',
        'vip pack': 'vip',
        'ultimate pack': 'ultimate',
        'legendary pack': 'legendary'
      };
      return tierMap[name.toLowerCase()] || 'popular';
    };
  }, []);

  const handlePurchase = (packageId: string) => {
    const selectedPackage = packages?.find(pkg => pkg.id === packageId);
    
    if (!selectedPackage) {
      toast.error(t('coinsPurchase.packageNotFound'));
      return;
    }

    const walletBalance = balance?.balance || 0;
    const packagePrice = selectedPackage.price_usd;

    // Check if user has enough wallet balance
    if (walletBalance >= packagePrice) {
      // Show confirmation before using wallet balance
      if (window.confirm(
        t('coinsPurchase.walletConfirm', {
          price: packagePrice.toFixed(2),
          coins: selectedPackage.yuyu_coins.toLocaleString(),
          balance: walletBalance.toFixed(2),
          remaining: (walletBalance - packagePrice).toFixed(2)
        })
      )) {
        purchaseWithWallet(packageId);
      }
    } else {
      // Not enough wallet balance, use Stripe
      createPurchase({
        packageId,
        successUrl: `${window.location.origin}?coins_purchase=success`,
        cancelUrl: `${window.location.origin}?coins_purchase=cancel`,
      });
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent hideClose className="max-w-[95vw] sm:max-w-6xl lg:max-w-7xl max-h-[88dvh] p-0 overflow-y-auto overscroll-contain bg-white dark:bg-gray-950 border-0 shadow-2xl">
        {/* Close Button - always reachable, even while scrolling */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="fixed sm:absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] sm:top-4 sm:right-4 z-[9999] w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 ring-1 ring-black/10 dark:ring-white/10 backdrop-blur-md hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center transition-transform duration-200 active:scale-95 touch-manipulation shadow-lg"
        >
          <X size={20} className="text-gray-700 dark:text-gray-200" />
        </button>

        {/* Header Section - Mobile Optimized */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          <div className="relative z-10">
            {/* Title - Mobile Responsive */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <SimpleCoinIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {t('coinsPurchase.title')}
                </h2>
              </div>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg font-medium px-4">
                {t('coinsPurchase.subtitle')}
              </p>
              <div className="inline-flex items-center gap-2 mt-2 sm:mt-3 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                <Zap size={14} className="sm:w-4 sm:h-4 text-yellow-300" />
                <span className="text-white text-xs sm:text-sm font-semibold">{t('coinsPurchase.exchangeRate')}</span>
              </div>
            </div>

            {/* Current Balances - Mobile Optimized */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-white/20">
                <SimpleCoinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <div className="text-[9px] sm:text-[10px] text-white/70 font-medium uppercase tracking-wide">{t('coinsPurchase.coins')}</div>
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-white">
                    {balance?.yuyu_score?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-white/20">
                <div className="text-green-300 font-bold text-xs sm:text-sm">$</div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-white/70 font-medium uppercase tracking-wide">{t('coinsPurchase.usd')}</div>
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-white">
                    {balance?.balance?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Packages Grid - Fully Responsive */}
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto max-h-[calc(95vh-220px)] sm:max-h-[calc(95vh-250px)] bg-gray-50 dark:bg-gray-900">
          {isPackagesLoading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('coinsPurchase.loadingPackages')}</p>
            </div>
          ) : !packages || packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4">
                <SimpleCoinIcon className="w-8 h-8" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{t('coinsPurchase.noPackages')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {packages.map((pkg) => {
                const isPopular = pkg.is_popular;
                const isPremium = pkg.price_usd >= 100;
                const isElite = pkg.price_usd >= 1000;
                const hasBonus = (pkg.bonus_percentage || 0) > 0;
                const isHovered = hoveredPackage === pkg.id;
                const isSelected = selectedPackageId === pkg.id;
                const tierName = iconForKey(pkg.name);

                return (
                  <div
                    key={pkg.id}
                    onMouseEnter={() => setHoveredPackage(pkg.id)}
                    onMouseLeave={() => setHoveredPackage(null)}
                    className={`relative group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ${
                      isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl'
                    } ${isSelected ? 'ring-2 sm:ring-4 ring-indigo-500' : ''} cursor-pointer`}
                    onClick={() => setSelectedPackageId(pkg.id)}
                  >
                    {/* Popular Badge - Mobile Optimized */}
                    {isPopular && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                          <Zap size={10} className="sm:w-3 sm:h-3 animate-pulse" />
                          <span className="hidden sm:inline">{t('coinsPurchase.mostPopular')}</span>
                          <span className="sm:hidden">{t('coinsPurchase.popular')}</span>
                        </div>
                      </div>
                    )}

                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 rounded-xl sm:rounded-2xl ${
                      isElite
                        ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-700'
                        : isPremium
                        ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-700'
                        : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
                    } p-[2px]`}>
                      <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl" />
                    </div>

                    {/* Content - Mobile Optimized */}
                    <div className="relative z-10 p-3 sm:p-4 lg:p-6">
                      {/* Bonus Badge */}
                      {hasBonus && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold shadow-md">
                          +{pkg.bonus_percentage}%
                        </div>
                      )}

                      {/* Icon - Professional Coin Stack */}
                      <div className="flex justify-center mb-2 sm:mb-3 lg:mb-4">
                        <div className={`transition-all duration-300 ${
                          isHovered ? 'scale-110' : ''
                        }`}>
                          <CoinStackIcon size={isHovered ? "lg" : "md"} tier={tierName} />
                        </div>
                      </div>

                      {/* Package Name - Mobile Responsive */}
                      <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-gray-900 dark:text-white text-center mb-2 sm:mb-3 leading-tight">
                        {pkg.name}
                      </h3>

                      {/* Coins Amount - Modern Display */}
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-400/30 dark:border-yellow-600/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 mb-2 sm:mb-3 lg:mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                            <SimpleCoinIcon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            <span className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
                              {formatNumber(pkg.yuyu_coins)}
                            </span>
                          </div>
                          <div className="text-[8px] sm:text-[10px] lg:text-xs text-yellow-700 dark:text-yellow-500 font-medium">{t('coinsPurchase.yuyuCoins')}</div>
                        </div>
                      </div>

                      {/* Price - Mobile Responsive */}
                      <div className="text-center mb-2 sm:mb-3 lg:mb-4">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-0.5 sm:mb-1">
                          ${pkg.price_usd >= 1000 ? formatNumber(pkg.price_usd) : pkg.price_usd.toFixed(2)}
                        </div>
                        <div className="text-[8px] sm:text-[9px] lg:text-xs text-gray-500 dark:text-gray-400">
                          ${(pkg.price_usd / pkg.yuyu_coins * 100).toFixed(3)} {t('coinsPurchase.perHundred')}
                        </div>
                      </div>

                      {/* Buy Button - Mobile Optimized with Wallet/Stripe indicator */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(pkg.id);
                        }}
                        disabled={isPending || isWalletPurchasing}
                        className={`w-full h-9 sm:h-10 lg:h-12 text-[10px] sm:text-xs lg:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 ${
                          isElite
                            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800'
                            : isPremium
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800'
                            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800'
                        } text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
                      >
                        {isPending || isWalletPurchasing ? (
                          <span className="flex items-center gap-1 sm:gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="hidden sm:inline">{t('coinsPurchase.processing')}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            {(balance?.balance || 0) >= pkg.price_usd ? (
                              <>
                                <Wallet size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">{t('coinsPurchase.useWallet')}</span>
                                <span className="sm:hidden">{t('coinsPurchase.walletShort')}</span>
                              </>
                            ) : (
                              <>
                                <span>{t('coinsPurchase.buyNow')}</span>
                              </>
                            )}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Trust Badges - Mobile Responsive */}
        <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
              <Shield size={14} className="sm:w-4 sm:h-4 text-green-600" />
              <span className="font-medium">{t('coinsPurchase.secure')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
              <Zap size={14} className="sm:w-4 sm:h-4 text-yellow-600" />
              <span className="font-medium hidden sm:inline">{t('coinsPurchase.instantDelivery')}</span>
              <span className="font-medium sm:hidden">{t('coinsPurchase.instant')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
              <Lock size={14} className="sm:w-4 sm:h-4 text-blue-600" />
              <span className="font-medium hidden sm:inline">{t('coinsPurchase.sslEncrypted')}</span>
              <span className="font-medium sm:hidden">{t('coinsPurchase.encrypted')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
              <span className="font-medium text-[10px] sm:text-sm">{t('coinsPurchase.poweredByStripe')}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
