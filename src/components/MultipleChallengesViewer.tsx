import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Challenge } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Zap, Trophy, Coins, Clock, X, CheckCircle, XCircle } from 'lucide-react';

interface MultipleChallengesViewerProps {
  open: boolean;
  onClose: () => void;
  challenges: Challenge[];
  userId: string;
  onAccept: (challengeId: string) => void;
  onDecline: (challengeId: string) => void;
  isLoading?: boolean;
}

export const MultipleChallengesViewer: React.FC<MultipleChallengesViewerProps> = ({
  open,
  onClose,
  challenges,
  userId,
  onAccept,
  onDecline,
  isLoading = false,
}) => {
  const pendingChallenges = challenges.filter(
    (c) => c.status === 'pending' && c.opponent_id === userId
  );

  if (pendingChallenges.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg p-0 gap-0 bg-white dark:bg-slate-900 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-5 py-5 sm:px-6 sm:py-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Pending Challenges
              </h2>
              <p className="text-white/80 text-sm">
                {pendingChallenges.length} challenge{pendingChallenges.length !== 1 ? 's' : ''} waiting
              </p>
            </div>
          </div>
        </div>

        {/* Challenges List */}
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="px-4 py-4 sm:px-5 sm:py-5 space-y-3">
            {pendingChallenges.map((challenge, index) => {
              const stakeAmount = Number(challenge.stake_yuyu || 0);
              const totalPot = stakeAmount * 2;
              const timeAgo = challenge.created_at
                ? formatDistanceToNow(new Date(challenge.created_at), { addSuffix: true })
                : 'just now';

              return (
                <div
                  key={challenge.id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 transition-colors"
                >
                  {/* Challenge Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Challenge Text */}
                  <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white mb-3 leading-snug">
                    {challenge.challenge_text}
                  </p>

                  {/* Stakes Row */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800/50">
                      <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Stake: <span className="font-bold">{stakeAmount.toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                      <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        Pot: <span className="font-bold">{totalPot.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => onAccept(challenge.id)}
                      disabled={isLoading}
                      size="sm"
                      className="h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => onDecline(challenge.id)}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                      className="h-9 sm:h-10 rounded-lg sm:rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-transparent hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-900/20 dark:hover:border-rose-600 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 font-semibold text-xs sm:text-sm transition-all active:scale-[0.98]"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-4 sm:px-5 sm:py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
