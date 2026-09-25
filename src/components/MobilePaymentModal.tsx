import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, CreditCard, AlertCircle, ExternalLink, Loader2, Shield } from "lucide-react";
import { isMobile, isIOS, getDeviceType } from "@/utils/deviceDetection";

interface MobilePaymentModalProps {
  title: string;
  description: string;
  amount: number;
  onClose: () => void;
  onProceed: () => Promise<{ url: string; id: string } | void>;
  isPending?: boolean;
  type: "gift" | "subscription";
}

export const MobilePaymentModal: React.FC<MobilePaymentModalProps> = ({
  title,
  description,
  amount,
  onClose,
  onProceed,
  isPending = false,
  type,
}) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const deviceType = getDeviceType();
  const mobile = isMobile();
  const iOS = isIOS();

  // Monitor payment window
  useEffect(() => {
    if (!paymentWindow) return;

    const interval = setInterval(() => {
      if (paymentWindow.closed) {
        setCheckingPayment(true);
        setPaymentWindow(null);
        
        // Check payment status after a delay
        setTimeout(() => {
          setCheckingPayment(false);
          // You can add payment verification here
        }, 2000);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [paymentWindow]);

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    setFallbackUrl(null);

    try {
      const result = await onProceed();
      
      if (!result || !result.url) {
        throw new Error(t('mobilePayment.noPaymentUrl'));
      }

      // Save state before redirect
      const callState = {
        timestamp: Date.now(),
        type,
        amount,
        returnUrl: window.location.href,
      };
      sessionStorage.setItem('caakus_payment_pending', JSON.stringify(callState));

      // SUBSCRIPTION: Direct redirect (no new tab needed)
      if (type === "subscription") {
        window.location.href = result.url;
        return;
      }

      // GIFT: Open in new tab (keeps call alive)
      if (mobile) {
        // On mobile, open in new tab (doesn't break PWA/standalone mode)
        if (iOS) {
          // iOS: Use window.open with specific features
          const newWindow = window.open(
            result.url,
            '_blank',
            'location=yes,height=600,width=400,scrollbars=yes,status=yes'
          );
          
          if (newWindow) {
            setPaymentWindow(newWindow);
          } else {
            // Fallback: show manual open button to avoid breaking the call
            setFallbackUrl(result.url);
          }
        } else {
          // Android: Open in new tab
          const newWindow = window.open(result.url, '_blank');
          
          if (newWindow) {
            setPaymentWindow(newWindow);
            
            // Android: Add message to close tab after payment
            setTimeout(() => {
              if (newWindow && !newWindow.closed) {
                // Show instructions
                console.log("Payment window opened. Waiting for completion...");
              }
            }, 1000);
          } else {
            // Fallback: show manual open button to avoid breaking the call
            setFallbackUrl(result.url);
          }
        }
      } else {
        // Desktop: Open in popup
        const width = 500;
        const height = 700;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;
        
        const newWindow = window.open(
          result.url,
          'stripe_checkout',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
        );
        
        if (newWindow) {
          setPaymentWindow(newWindow);
          newWindow.focus();
        } else {
          // Popup blocked - show manual open button to avoid breaking the call
          setFallbackUrl(result.url);
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(t('mobilePayment.paymentError', { error: errorMessage }));
    } finally {
      setIsProcessing(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10002] flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop - don't close on click to prevent accidental dismissal */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal - Bottom sheet on mobile, centered on desktop */}
      <div className="relative w-full sm:w-[95%] sm:max-w-[420px] rounded-t-[28px] sm:rounded-3xl bg-gradient-to-br from-gray-900 via-blue-950/90 to-gray-900 p-5 sm:p-6 shadow-2xl border border-blue-500/30 backdrop-blur-xl max-h-[90vh] overflow-y-auto animate-slide-up-bottom sm:animate-slide-up">
        
        {/* Drag indicator for mobile */}
        <div className="sm:hidden w-12 h-1 bg-white/30 rounded-full mx-auto mb-4" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing || checkingPayment}
          aria-label="Close"
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white/15 ring-1 ring-white/15 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/25 transition-transform active:scale-95 disabled:opacity-50 z-20"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl ring-4 ring-blue-400/30">
              <CreditCard className="text-white" size={mobile ? 28 : 36} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mb-1">
            {title}
          </h3>
          <p className="text-sm text-blue-200/80">
            {description}
          </p>
        </div>

        {/* Amount Display */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 mb-4 border border-white/10">
          <div className="text-center">
            <div className="text-sm text-white/50 mb-1">
              {type === "gift" ? t('mobilePayment.giftAmount') : t('mobilePayment.subscriptionPrice')}
            </div>
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              ${amount.toFixed(2)}
            </div>
            {type === "gift" && (
              <div className="text-xs text-green-400 mt-2 font-medium">
                {t('mobilePayment.receiverInstant')}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Instructions */}
        {mobile && (
          <div className="bg-amber-500/10 rounded-xl p-3.5 mb-4 border border-amber-400/20">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-semibold text-amber-200 mb-1.5">
                  {t('mobilePayment.howItWorks')}
                </p>
                {type === "subscription" ? (
                  <ol className="text-[11px] text-amber-200/80 space-y-0.5 list-decimal list-inside">
                    <li>{t('mobilePayment.subStep1')}</li>
                    <li>{t('mobilePayment.subStep2')}</li>
                    <li>{t('mobilePayment.subStep3')}</li>
                  </ol>
                ) : (
                  <ol className="text-[11px] text-amber-200/80 space-y-0.5 list-decimal list-inside">
                    <li>{t('mobilePayment.giftStep1', { target: iOS ? t('mobilePayment.window') : t('mobilePayment.tab') })}</li>
                    <li>{t('mobilePayment.giftStep2', { action: iOS ? t('mobilePayment.closeWindow') : t('mobilePayment.returnHere') })}</li>
                    <li>{t('mobilePayment.giftStep3')}</li>
                  </ol>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Instructions */}
        {!mobile && (
          <div className="bg-blue-500/10 rounded-xl p-3.5 mb-4 border border-blue-400/20">
            <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
              {type === "subscription" ? (
                <>{t('mobilePayment.desktopSubscription')}</>
              ) : (
                <>{t('mobilePayment.desktopGift')}</>
              )}
            </p>
          </div>
        )}

        {/* Status Messages */}
        {checkingPayment && (
          <div className="bg-green-500/10 rounded-xl p-3.5 mb-4 border border-green-400/20 flex items-center gap-3">
            <Loader2 className="animate-spin text-green-400" size={18} />
            <p className="text-sm text-green-200 font-medium">
              {t('mobilePayment.verifyingPayment')}
            </p>
          </div>
        )}

        {paymentWindow && !paymentWindow.closed && (
          <div className="bg-purple-500/10 rounded-xl p-3.5 mb-4 border border-purple-400/20">
            <p className="text-sm text-purple-200 font-medium">
              {t('mobilePayment.paymentWindowOpen')}
            </p>
          </div>
        )}

        {fallbackUrl && (
          <div className="bg-orange-500/10 rounded-xl p-3.5 mb-4 border border-orange-400/20">
            <p className="text-sm text-orange-200 font-medium mb-3">
              {t('mobilePayment.popupBlocked')}
            </p>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full rounded-xl bg-orange-500 text-white font-bold py-3 hover:bg-orange-600 transition-colors"
            >
              <ExternalLink size={18} className="mr-2" />
              {t('mobilePayment.openPaymentPage')}
            </a>
          </div>
        )}

        {/* Chargeback Warning */}
        <div className="bg-red-500/10 rounded-xl p-3 mb-4 border border-red-400/20">
          <p className="text-xs text-red-200 text-center">
            ⚠️ Filing a chargeback may result in account suspension. Contact support@caakus.com first.
          </p>
        </div>

        {/* Refund Policy Agreement */}
        <p className="text-xs text-slate-400 mb-4 text-center">
          By completing this purchase, you agree to our{' '}
          <a href="/refund-policy" className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">
            Refund Policy
          </a>
          .
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleProceedToPayment}
            disabled={isProcessing || isPending || checkingPayment}
            className="w-full h-14 sm:h-12 text-base sm:text-sm font-bold rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing || isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                {t('mobilePayment.processing')}
              </>
            ) : checkingPayment ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                {t('mobilePayment.checking')}
              </>
            ) : (
              <>
                <ExternalLink className="mr-2" size={20} />
                {t('mobilePayment.proceedToPayment')}
              </>
            )}
          </Button>

          <Button
            onClick={onClose}
            disabled={isProcessing || checkingPayment}
            variant="ghost"
            className="w-full h-12 sm:h-10 text-base sm:text-sm font-semibold rounded-xl text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50 active:scale-[0.98]"
          >
            {t('mobilePayment.cancel')}
          </Button>
        </div>

        {/* Security Badge */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-[11px] text-white/40">
            <Shield size={14} />
            <span>{t('mobilePayment.securedByStripe', { protection: deviceType === 'mobile' ? 'Touch ID' : 'SSL' })}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render above everything
  return createPortal(modalContent, document.body);
};
