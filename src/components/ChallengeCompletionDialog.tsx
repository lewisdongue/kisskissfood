import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Challenge } from '../types';
import { X, CheckCircle, XCircle, Clock, Trophy, Coins } from 'lucide-react';

interface ChallengeCompletionDialogProps {
  open: boolean;
  onClose: () => void;
  challenge: Challenge;
  onConfirm: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export const ChallengeCompletionDialog: React.FC<ChallengeCompletionDialogProps> = ({
  open,
  onClose,
  challenge,
  onConfirm,
  onReject,
  isLoading = false,
}) => {
  const stakeAmount = Number(challenge.stake_yuyu || 0);
  const totalPot = stakeAmount * 2;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md p-0 gap-0 bg-white dark:bg-slate-900 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-5 py-6 sm:px-6 sm:py-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative text-center">
            {/* Icon */}
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 ring-4 ring-white/10">
              <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Completion Request
            </h2>
            <p className="text-white/80 text-sm sm:text-base">
              Opponent claims challenge is complete
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5 sm:px-6 sm:py-6 space-y-5">
          {/* Challenge Text */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Challenge
            </div>
            <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-snug">
              "{challenge.challenge_text}"
            </p>
          </div>

          {/* Stakes Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Each Staked</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">
                {stakeAmount.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Total Pot</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {totalPot.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800/50">
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-800/50 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-violet-900 dark:text-violet-200 mb-0.5">
                  Winner Takes All
                </p>
                <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
                  Confirm → Opponent wins <span className="font-bold">{totalPot.toLocaleString()}</span> coins.
                  Reject → Both refunded <span className="font-bold">{stakeAmount.toLocaleString()}</span> coins.
                </p>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="text-center py-1">
            <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Did they complete the challenge?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Your decision is final
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Yes, Confirm
            </Button>
            <Button
              onClick={onReject}
              disabled={isLoading}
              className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-rose-500/25 transition-all active:scale-[0.98]"
            >
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              No, Reject
            </Button>
          </div>

          {/* Defer Button */}
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="ghost"
            className="w-full h-10 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-medium"
          >
            I need more time
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
