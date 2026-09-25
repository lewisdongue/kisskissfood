import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Info, Coins, DollarSign, TrendingUp, RefreshCw } from "lucide-react";
import { useConvertCoinsToWallet, useCoinsBalance } from "@/hooks/useCoins";
import { getYuyucoinPrice, YUYU_PRICE_FLOOR, YUYU_PRICE_CEILING } from "@/services/yuyucoinPriceService";
import { supabase } from "@/config/supabase";
import toast from "react-hot-toast";

const SELL_FEE_PCT = 8;

interface ConvertCoinsModalProps {
  open: boolean;
  onClose: () => void;
}

export const ConvertCoinsModal = ({ open, onClose }: ConvertCoinsModalProps) => {
  const { t } = useTranslation();
  const [coinsAmount, setCoinsAmount]   = useState<string>("");
  const [livePrice,   setLivePrice]     = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const { data: balance } = useCoinsBalance();
  const { mutate: convertCoins, isPending } = useConvertCoinsToWallet();

  // ── Fetch live price on open ─────────────────────────────────────────────
  const fetchPrice = async () => {
    setPriceLoading(true);
    try {
      const data = await getYuyucoinPrice();
      setLivePrice(data.priceUsd);
    } catch {
      // keep previous value
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchPrice();

    // Subscribe to real-time price updates (same channel as InvestYuyucoinModal)
    const ch = supabase
      .channel('convert-coins-price')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'yuyu_price' },
        (payload) => {
          const raw = payload.new as { current_price?: number };
          if (raw?.current_price) {
            const clamped = Math.max(YUYU_PRICE_FLOOR, Math.min(YUYU_PRICE_CEILING, Number(raw.current_price)));
            setLivePrice(clamped);
          }
        },
      )
      .subscribe();

    channelRef.current = ch;
    return () => {
      // removeChannel (not unsubscribe) so the socket entry is destroyed and
      // cannot linger as a zombie listener.
      void supabase.removeChannel(ch);
      channelRef.current = null;
    };

  }, [open]);

  // ── Derived values using live price ─────────────────────────────────────
  const coins    = parseInt(coinsAmount) || 0;
  const price    = livePrice ?? YUYU_PRICE_FLOOR;
  const grossUsd = coins * price;
  const fee      = grossUsd * (SELL_FEE_PCT / 100);
  const netUsd   = grossUsd - fee;

  const handleConvert = () => {
    if (coins < 100) {
      toast.error(t('convertCoins.minimumError'));
      return;
    }

    if (coins > (balance?.yuyu_score || 0)) {
      toast.error(t('convertCoins.insufficientCoins'));
      return;
    }

    if (!livePrice) {
      toast.error("Price not loaded yet. Please wait a moment.");
      return;
    }

    if (window.confirm(
      t('convertCoins.confirmTitle', { coins: coins.toLocaleString(), amount: netUsd.toFixed(4) }) + '\n\n' +
      `Price per YUYU: $${price.toFixed(8)}\n` +
      t('convertCoins.confirmGross', { amount: grossUsd.toFixed(4) }) + '\n' +
      t('convertCoins.confirmFee', { amount: fee.toFixed(4) }) + '\n' +
      t('convertCoins.confirmReceive', { amount: netUsd.toFixed(4) }) + '\n\n' +
      t('convertCoins.confirmWarning')
    )) {
      convertCoins(coins);
      setCoinsAmount("");
      onClose();
    }
  };

  const setQuickAmount = (percentage: number) => {
    const userCoins = balance?.yuyu_score || 0;
    const amount = Math.floor(userCoins * percentage);
    setCoinsAmount(amount.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
            {t('convertCoins.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Live Price Banner */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Live YUYU Price
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15 rounded-full px-1.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2">
                {priceLoading ? (
                  <span className="text-xs text-amber-600 dark:text-amber-400 animate-pulse">Loading…</span>
                ) : (
                  <span className="text-base font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                    ${price.toFixed(8)}
                  </span>
                )}
                <button
                  onClick={fetchPrice}
                  disabled={priceLoading}
                  className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-800/40 transition-colors"
                  title="Refresh price"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${priceLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Conversion uses the real-time market price · {SELL_FEE_PCT}% withdrawal fee
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">{t('convertCoins.conversionRate')}</p>
                <p>{t('convertCoins.feeApplies')}</p>
              </div>
            </div>
          </div>

          {/* Current Balances */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">{t('convertCoins.coins')}</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 tabular-nums">
                {(balance?.yuyu_score || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 dark:text-green-400 font-medium">{t('convertCoins.wallet')}</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 tabular-nums">
                ${(balance?.balance || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('convertCoins.amountToConvert')}
            </label>
            <Input
              type="number"
              min="100"
              max={balance?.yuyu_score || 0}
              value={coinsAmount}
              onChange={(e) => setCoinsAmount(e.target.value)}
              placeholder={t('convertCoins.enterAmount')}
              className="text-lg"
            />

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <Button
                  key={pct}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(pct)}
                  className="flex-1"
                >
                  {pct * 100}%
                </Button>
              ))}
            </div>
          </div>

          {/* Conversion Preview */}
          {coins >= 100 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Rate</span>
                <span className="tabular-nums">${price.toFixed(8)} / YUYU</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('convertCoins.grossValue')}</span>
                <span className="font-semibold tabular-nums">${grossUsd.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                <span>{t('convertCoins.conversionFee')} ({SELL_FEE_PCT}%)</span>
                <span className="font-semibold tabular-nums">-${fee.toFixed(4)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-base font-bold">
                <span className="text-gray-900 dark:text-white">{t('convertCoins.youllReceive')}</span>
                <span className="text-green-600 dark:text-green-400 tabular-nums">${netUsd.toFixed(4)}</span>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <Button
            onClick={handleConvert}
            disabled={isPending || coins < 100 || coins > (balance?.yuyu_score || 0) || !livePrice}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('convertCoins.converting')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5" />
                {t('convertCoins.convertToWallet')}
              </span>
            )}
          </Button>

          {/* Warning */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {t('convertCoins.minimumNote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
