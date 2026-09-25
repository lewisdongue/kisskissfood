import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { Challenge } from '@/types';
import { Zap, Trophy, Coins, X } from 'lucide-react';

interface ChallengeNotificationProps {
  challenge: Challenge;
  onAccept: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export const ChallengeNotification: React.FC<ChallengeNotificationProps> = ({
  challenge,
  onAccept,
  onDecline,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const stakeAmount = Number(challenge.stake_yuyu || 0);
  const totalPot = stakeAmount * 2;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDecline}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm sm:max-w-md animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 px-5 py-6 sm:px-6 sm:py-8">
            {/* Close Button */}
            <button
              onClick={onDecline}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white rounded-full" />
            </div>

            <div className="relative text-center">
              {/* Animated Icon */}
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center mb-4 animate-pulse ring-4 ring-white/20">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="white" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {t('challengeNotification.incoming')}
              </h2>
              <p className="text-white/90 text-sm sm:text-base">
                {t('challengeNotification.someoneWants')}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-5 sm:px-6 sm:py-6 space-y-4">
            {/* Challenge Text */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {t('challengeNotification.challenge')}
              </div>
              <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                {challenge.challenge_text}
              </p>
            </div>

            {/* Stakes Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{t('challengeNotification.yourStake')}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {stakeAmount.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{t('challengeNotification.totalPot')}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {totalPot.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Winner Takes All Badge */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent dark:via-amber-600" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full border border-amber-200 dark:border-amber-700">
                <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                  {t('challengeNotification.winnerTakesAll')}
                </span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-300 to-transparent dark:via-amber-600" />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onAccept();
                }}
                disabled={isLoading}
                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-base sm:text-lg shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>{t('challengeNotification.accepting')}</span>
                  </div>
                ) : (
                  <span>{t('challengeNotification.acceptChallenge')}</span>
                )}
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDecline();
                }}
                disabled={isLoading}
                variant="outline"
                className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-transparent hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-900/20 dark:hover:border-rose-700 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 font-semibold text-sm sm:text-base transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {t('challengeNotification.decline')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
