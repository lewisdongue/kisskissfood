import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, Wallet, CreditCard, AlertCircle, Gift, Sparkles, ExternalLink, Loader2, Shield } from "lucide-react";
import { isMobile, isIOS } from "@/utils/deviceDetection";

interface InsufficientFundsModalProps {
  itemName: string;
  amount: number;
  currentBalance: number;
  onClose: () => void;
  onTopUpAndSend: () => Promise<{ url: string; id: string } | void>;
  isPending?: boolean;
}

export const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({
  itemName,
  amount,
  currentBalance,
  onClose,
  onTopUpAndSend,
  isPending = false,
}) => {
  const { t } = useTranslation();
  const shortfall = amount - currentBalance;
  const mobile = isMobile();
  const iOS = isIOS();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const handleProceed = async () => {
    setIsProcessing(true);
    setFallbackUrl(null);

    try {
      const result = await onTopUpAndSend();
      
      if (!result || !result.url) {
        throw new Error(t('insufficientFunds.noPaymentUrl'));
      }

      // Save state before redirect
      sessionStorage.setItem('caakus_payment_pending', JSON.stringify({
        timestamp: Date.now(),
        type: 'gift',
        amount,
        returnUrl: window.location.href,
      }));

      // Open payment URL
      if (mobile) {
        // Mobile: Open in new tab to keep call alive
        const newWindow = window.open(result.url, '_blank');
        if (!newWindow) {
          // Popup blocked - show fallback
          setFallbackUrl(result.url);
        } else {
          // Success - close modal after small delay
          setTimeout(() => onClose(), 500);
        }
      } else {
        // Desktop: Open popup
        const width = 500;
        const height = 700;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;
        
        const newWindow = window.open(
          result.url,
          'stripe_checkout',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
        );
        
        if (!newWindow) {
          setFallbackUrl(result.url);
        } else {
          newWindow.focus();
          setTimeout(() => onClose(), 500);
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(t('insufficientFunds.paymentError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10002] flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal - Bottom sheet on mobile, centered on desktop */}
      <div className="relative w-full sm:w-[95%] sm:max-w-[400px] rounded-t-[28px] sm:rounded-3xl bg-gradient-to-br from-gray-900 via-orange-950/90 to-gray-900 p-5 sm:p-6 shadow-2xl border border-orange-500/30 backdrop-blur-xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up-bottom sm:animate-slide-up">
        
        {/* Drag indicator for mobile */}
        <div className="sm:hidden w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all z-10"
        >
          <X size={18} />
        </button>

        {/* Header with Icon */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center shadow-2xl ring-4 ring-orange-400/30">
              <Wallet className="text-white" size={mobile ? 28 : 36} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-2xl font-black text-white mb-1">
            {t('insufficientFunds.title')}
          </h3>
          <p className="text-sm text-orange-200/80">
            {t('insufficientFunds.subtitle')}
          </p>
        </div>

        {/* Gift Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 mb-4 border border-white/10">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
              <Gift size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50 uppercase tracking-wider">{t('insufficientFunds.sendingGift')}</p>
              <p className="text-base font-bold text-white truncate">{itemName}</p>
            </div>
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">{t('insufficientFunds.giftPrice')}</span>
              <span className="text-lg font-bold text-orange-400">${amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">{t('insufficientFunds.yourBalance')}</span>
              <span className="text-lg font-bold text-white/90">${currentBalance.toFixed(2)}</span>
            </div>
            <div className="pt-2.5 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-red-400">{t('insufficientFunds.amountNeeded')}</span>
                <span className="text-xl font-black text-red-400">${shortfall.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 rounded-xl p-3.5 mb-4 border border-blue-400/20">
          <div className="flex items-start gap-2.5">
            <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
              {t('insufficientFunds.paymentInfo', { amount: amount.toFixed(2) })}
            </p>
          </div>
        </div>

        {/* Mobile Instructions */}
        {mobile && (
          <div className="bg-amber-500/10 rounded-xl p-3 mb-4 border border-amber-400/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
              <p className="text-[11px] text-amber-200/80">
                {t('insufficientFunds.mobileInfo', { target: iOS ? t('insufficientFunds.window') : t('insufficientFunds.tab') })}
              </p>
            </div>
          </div>
        )}

        {/* Fallback URL (if popup blocked) */}
        {fallbackUrl && (
          <div className="bg-orange-500/10 rounded-xl p-3.5 mb-4 border border-orange-400/20">
            <p className="text-sm text-orange-200 font-medium mb-3">
              {t('insufficientFunds.popupBlocked')}
            </p>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full rounded-xl bg-orange-500 text-white font-bold py-3 hover:bg-orange-600 transition-colors"
              onClick={() => setTimeout(() => onClose(), 500)}
            >
              <ExternalLink size={18} className="mr-2" />
              {t('insufficientFunds.openPaymentPage')}
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleProceed}
            disabled={isPending || isProcessing}
            className="w-full h-14 sm:h-12 text-base sm:text-sm font-bold rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-60"
          >
            {isPending || isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                {t('insufficientFunds.processing')}
              </>
            ) : (
              <>
                <CreditCard className="mr-2" size={20} />
                {t('insufficientFunds.payWithCard', { amount: amount.toFixed(2) })}
              </>
            )}
          </Button>

          <Button
            onClick={onClose}
            disabled={isProcessing}
            variant="ghost"
            className="w-full h-12 sm:h-10 text-base sm:text-sm font-semibold rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:scale-[0.98] disabled:opacity-50"
          >
            {t('insufficientFunds.cancel')}
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] text-white/40">
            <Shield size={12} />
            <span>{t('insufficientFunds.securedByStripe')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render above everything
  return createPortal(modalContent, document.body);
};

