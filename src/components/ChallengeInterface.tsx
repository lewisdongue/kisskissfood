import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCallChallenges } from '@/hooks/useCallChallenges';
import { ChallengeNotification } from './ChallengeNotification';
import { ChallengeHistoryOverlay } from './ChallengeHistoryOverlay';
import { MultipleChallengesViewer } from './MultipleChallengesViewer';
import { ChallengeCompletionDialog } from './ChallengeCompletionDialog';
import { ChallengeErrorBoundary } from './ChallengeErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useCoinsBalance } from '@/hooks/useCoins';
import { CoinsPurchaseModal } from './CoinsPurchaseModal';
import { MarketplaceSection } from './MarketplaceSection';
import { Textarea } from '@/components/ui/textarea';
import { handleChallengeError } from '@/utils/errorHandling';
import toast from 'react-hot-toast';
import { Coins } from 'lucide-react';

/** Curated list — exactly 8 presets for a focused, scannable modal. */
const PRESET_CHALLENGES = [
  { key: 'dirty_joke', text: "Tell a cheeky joke — keep it fun and light." },
  { key: 'bold_truth', text: "Say the boldest truth about yourself in one sentence." },
  { key: 'describe_object', text: "Describe an object without saying its name — I guess it." },
  { key: 'guess_language', text: "Speak in a random language — I guess which one." },
  { key: 'sing_chorus', text: "Sing the chorus of a popular song." },
  { key: 'tongue_twister', text: "Say a tongue twister perfectly 3 times in a row." },
  { key: 'no_laugh', text: "Try to make me laugh — you have 15 seconds. I can't crack." },
  { key: 'movie_quote', text: "Deliver a famous movie quote like you're on stage — full drama." },
] as const;

const QUICK_AMOUNTS = [
  { label: '100', value: 100 },
  { label: '500', value: 500 },
  { label: '1,000', value: 1000 },
  { label: '5,000', value: 5000 },
];

interface ChallengeInterfaceProps {
  peerId: string;
  roomName?: string | null;
}

export const ChallengeInterface: React.FC<ChallengeInterfaceProps> = ({ peerId, roomName }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [showCoinsPurchase, setShowCoinsPurchase] = useState(false);
  const [showMultipleChallenges, setShowMultipleChallenges] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [pendingProposal, setPendingProposal] = useState<{
    amount: number;
    text: string;
    presetKey?: string | null;
    isCustom?: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  
  // Get user's coin balance
  const { data: balance } = useCoinsBalance();

  const {
    challenges,
    activeChallenge,
    incomingPending,
    allPendingChallenges,
    events,
    createChallenge,
    acceptChallenge,
    markChallengeComplete,
    confirmChallenge,
    completeChallenge,
    failChallenge,
    cancelChallenge,
    disputeChallenge,
    handleDisconnect,
    canAffordChallenge,
  } = useCallChallenges(peerId, roomName);

  const selectedPresetText = useMemo(
    () => PRESET_CHALLENGES.find((p) => p.key === selectedPreset)?.text || '',
    [selectedPreset]
  );

  const effectiveChallengeText = useMemo(() => {
    const trimmed = customText.trim();
    if (trimmed) return trimmed;
    return selectedPresetText;
  }, [customText, selectedPresetText]);

  const handleConfirmCreate = async () => {
    if (!pendingProposal) return;
    const { amount, text, presetKey, isCustom } = pendingProposal;
    if (!text.trim()) {
      toast.error(t('challengeInterface.textRequired'));
      return;
    }
    
    // Pre-check if user can afford (optional UX improvement)
    try {
      if (user?.id) {
        const affordCheck = await canAffordChallenge(user.id, amount);
        console.log('\u{1F4B0} [Challenge] Afford check:', affordCheck);
        
        if (!affordCheck.can_afford) {
          toast.error(t('challengeInterface.insufficientCoins'));
          setOpen(false);
          setPendingProposal(null);
          setShowCoinsPurchase(true);
          return;
        }
      }
    } catch (checkError) {
      console.warn('\u26A0\uFE0F [Challenge] Afford check failed, proceeding anyway:', checkError);
    }
    
    setIsSubmitting(true);
    try {
      const result = await createChallenge({
        amount,
        challengeText: text,
        presetKey: presetKey ?? null,
        isCustom: isCustom ?? false,
      });
      console.log('\u2705 [Challenge] Created successfully:', result);
      toast.success(`Challenge sent! Winner takes all ${(amount * 2).toLocaleString()} coins! \u{1F3C6}`);
      setOpen(false);
      setSelectedPreset(null);
      setCustomText('');
      setCustomAmount('');
      setPendingProposal(null);
    } catch (error: any) {
      console.error('\u274C [Challenge] Create failed:', error);
      const errorMsg = error?.message || '';
      
      if (errorMsg.includes('insufficient') || errorMsg.includes('not enough')) {
        toast.error(t('challengeInterface.insufficientCoins'));
        setOpen(false);
        setPendingProposal(null);
        setShowCoinsPurchase(true);
      } else {
        toast.error(errorMsg || 'Failed to create challenge');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptForChallenge = async (challenge: typeof incomingPending) => {
    if (!challenge) {
      toast.error(t('challengeInterface.noChallenge'));
      return;
    }
    if (!user?.id) {
      toast.error(t('challengeInterface.pleaseLogIn'));
      return;
    }

    const requiredAmount = Number(challenge.stake_yuyu || 0);
    const totalPot = requiredAmount * 2;

    setIsAccepting(true);
    toast.success(`\u{1F3AE} Challenge accepted! Locking ${requiredAmount.toLocaleString()} coins...`, {
      id: 'accept-challenge',
      duration: 2500,
    });

    try {
      // Quick affordability check (non-blocking)
      canAffordChallenge(user.id, requiredAmount).catch(() => {});

      const result = await acceptChallenge(challenge.id);
      console.log('\u2705 [Challenge] Accepted:', result);

      toast.success(
        `\u2705 LOCKED! Total pot: ${totalPot.toLocaleString()} \u{1F3C6} Winner takes all!`,
        { id: 'accept-challenge', duration: 5000 }
      );
    } catch (error: any) {
      console.error('\u274C [Challenge] Accept failed:', error);
      const errorMsg = error?.message || '';
      if (errorMsg.includes('insufficient')) {
        toast.error(t('challengeInterface.needMoreCoins', { amount: requiredAmount.toLocaleString() }), {
          id: 'accept-challenge',
          duration: 6000,
        });
        setShowCoinsPurchase(true);
      } else if (errorMsg.includes('not_found')) {
        toast.error(t('challengeInterface.expired'), { id: 'accept-challenge' });
      } else {
        handleChallengeError(error, 'Accept Challenge');
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const handleAccept = async () => {
    console.log('\u{1F3AF} [Challenge] Accept button clicked - IMMEDIATE START');
    await handleAcceptForChallenge(incomingPending);
  };

  const handleDeclineForChallenge = async (challengeId: string) => {
    try {
      setIsDeclining(true);
      await cancelChallenge(challengeId);
      toast.success('Challenge declined');
    } catch (error: any) {
      handleChallengeError(error, 'Decline Challenge');
    } finally {
      setIsDeclining(false);
    }
  };

  const handleDecline = async () => {
    console.log('\u{1F3AF} [Challenge] Decline button clicked');
    
    if (!incomingPending) {
      console.error('\u274C [Challenge] No incoming challenge to decline');
      toast.error(t('challengeInterface.noDecline'));
      return;
    }
    
    if (!user?.id) {
      console.error('\u274C [Challenge] User not authenticated');
      toast.error(t('challengeInterface.mustBeLoggedIn'));
      return;
    }
    
    console.log('\u{1F534} [Challenge] Declining:', {
      challengeId: incomingPending.id,
      userId: user.id,
      status: incomingPending.status
    });
    
    // INSTANT UI FEEDBACK
    setIsDeclining(true);
    toast.loading('Declining challenge...', { id: 'decline-challenge' });
    
    try {
      const result = await cancelChallenge(incomingPending.id);
      console.log('\u2705 [Challenge] Declined successfully:', result);
      toast.success('Challenge declined', { id: 'decline-challenge' });
    } catch (error: any) {
      console.error('\u274C [Challenge] Decline failed:', error);
      const msg = error?.message || error?.toString() || 'Failed to decline challenge';
      
      if (String(msg).includes('not_authorized')) {
        toast.error(t('challengeInterface.authError'), { id: 'decline-challenge' });
      } else if (String(msg).includes('challenge_not_pending')) {
        toast(t('challengeInterface.alreadyHandled'), { id: 'decline-challenge', icon: '\u2139\uFE0F' });
      } else {
        toast.error(msg, { id: 'decline-challenge' });
      }
    } finally {
      setIsDeclining(false);
    }
  };

  const handleComplete = async () => {
    if (!activeChallenge) return;
    if (!user?.id) return;
    
    // Check if user is the opponent (who marks complete)
    const isOpponent = activeChallenge.opponent_id === user.id;
    
    if (isOpponent && activeChallenge.status === 'accepted') {
      // Opponent marks challenge as complete
      try {
        setIsResolving(true);
        await markChallengeComplete(activeChallenge.id);
        toast.success('Challenge marked as complete! Waiting for opponent to confirm...');
      } catch (error: any) {
        toast.error(error?.message || 'Failed to mark challenge complete');
      } finally {
        setIsResolving(false);
      }
    }
  };

  const handleConfirmCompletion = async (outcome: 'confirmed' | 'rejected') => {
    if (!activeChallenge) return;
    
    try {
      setIsResolving(true);
      const result = await confirmChallenge(activeChallenge.id, outcome);
      
      if (outcome === 'confirmed') {
        const totalPot = Number(activeChallenge.stake_yuyu || 0) * 2;
        toast.success(
          `\u2705 Challenge confirmed! Opponent wins ${totalPot.toLocaleString()} Yuyu! \u{1F3C6}`,
          { duration: 6000 }
        );
      } else {
        const stakeAmount = Number(activeChallenge.stake_yuyu || 0);
        toast.success(
          `Challenge rejected. Both users refunded ${stakeAmount.toLocaleString()} Yuyu each.`,
          { duration: 5000 }
        );
      }
      
      setShowCompletionDialog(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to resolve challenge');
    } finally {
      setIsResolving(false);
    }
  };

  const handleFail = async () => {
    if (!activeChallenge) return;
    try {
      await failChallenge(activeChallenge.id);
      toast.success('Challenge failed. Yuyu refunded.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update challenge');
    }
  };

  const handleDispute = async () => {
    if (!activeChallenge) return;
    try {
      await disputeChallenge(activeChallenge.id);
      toast.success('Challenge disputed. Funds locked. Support will review.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to dispute challenge');
    }
  };

  const canResolve = activeChallenge && user && activeChallenge.proposer_id === user.id && activeChallenge.status === 'accepted';
  const canDispute = activeChallenge && user && activeChallenge.status === 'accepted';
  const canMarkComplete = activeChallenge && user && activeChallenge.opponent_id === user.id && activeChallenge.status === 'accepted';
  const needsConfirmation = activeChallenge && user && activeChallenge.proposer_id === user.id && activeChallenge.status === 'pending_confirmation';

  // Auto-show completion dialog when status becomes pending_confirmation
  React.useEffect(() => {
    if (needsConfirmation && !showCompletionDialog) {
      setShowCompletionDialog(true);
    }
  }, [needsConfirmation, showCompletionDialog]);

  // Auto-show multiple challenges viewer when there are 2+ pending challenges
  React.useEffect(() => {
    if (allPendingChallenges.length >= 2 && !showMultipleChallenges) {
      toast(t('challengeInterface.multiplePending'), { icon: '\u26A1' });
    }
  }, [allPendingChallenges.length]);

  // Check if there's any content to show (active or pending challenges)
  const hasContent = activeChallenge || allPendingChallenges.length > 0;

  return (
    <ChallengeErrorBoundary>
      {/* Simple inline layout - button always first, content below on mobile, above on desktop */}
      <div className="flex flex-col sm:flex-col-reverse gap-2" onClick={(e) => e.stopPropagation()}>
        
        {/* Challenge Button - Same size as Gift on mobile; "Challenge" label on mobile */}
        <div className="flex items-center gap-2 min-w-0 max-w-full">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (!peerId) {
                toast.error(t('challengeInterface.noPartner'));
                return;
              }
              setOpen(true);
            }}
            className="min-h-[2.5rem] sm:min-h-[3rem] px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-white font-bold text-xs sm:text-sm 
              bg-gradient-to-r from-violet-600 to-purple-600 
              hover:from-violet-700 hover:to-purple-700 
              shadow-lg shadow-violet-500/30 
              transition-all active:scale-95
              flex items-center justify-center gap-1.5 min-w-0 shrink"
          >
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline truncate">{t('challengeInterface.createChallenge')}</span>
            <span className="sm:hidden truncate">{t('challengeInterface.challengeShort')}</span>
          </Button>

          {/* Pending Counter Badge */}
          {allPendingChallenges.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMultipleChallenges(true);
              }}
              className="relative min-h-[2.5rem] sm:min-h-[3rem] px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center gap-1 transition-all shrink-0"
            >
              <span className="text-sm">{'\u{1F4CB}'}</span>
              <span>{allPendingChallenges.length}</span>
              {allPendingChallenges.length > 1 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  !
                </span>
              )}
            </button>
          )}
        </div>

        {/* Content Area - Shows below button on mobile, above on desktop */}
        {hasContent && (
          <div className="flex flex-col gap-2 w-full max-w-[300px] sm:max-w-[340px]">
            {/* ACTIVE CHALLENGE CARD */}
            {activeChallenge && (
              <div className="w-full bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-violet-600/30 to-purple-600/30 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-violet-500/40 flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-200" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white">{t('challengeInterface.active')}</span>
                  </div>
                  {activeChallenge.status === 'pending_confirmation' && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-semibold animate-pulse">
                      {t('challengeInterface.review')}
                    </span>
                  )}
                  {activeChallenge.status === 'accepted' && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                      {t('challengeInterface.live')}
                    </span>
                  )}
                </div>
                <div className="p-2.5 sm:p-3 space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-white leading-snug line-clamp-2">
                    {activeChallenge.challenge_text}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs text-amber-300 font-medium">
                      {'\u{1F4B0}'} {Number(activeChallenge.stake_yuyu || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] sm:text-xs text-emerald-300 font-medium">
                      {'\u{1F3C6}'} {(Number(activeChallenge.stake_yuyu || 0) * 2).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {canMarkComplete && (
                      <Button 
                        onClick={handleComplete} 
                        disabled={isResolving}
                        size="sm"
                        className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs rounded-md sm:rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                      >
                        {t('challengeInterface.complete')}
                      </Button>
                    )}
                    {needsConfirmation && (
                      <Button 
                        onClick={() => setShowCompletionDialog(true)} 
                        size="sm"
                        className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs rounded-md sm:rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-semibold animate-pulse"
                      >
                        {t('challengeInterface.review')}
                      </Button>
                    )}
                    {activeChallenge.status === 'pending_confirmation' && !needsConfirmation && (
                      <div className="flex-1 h-7 sm:h-8 rounded-md sm:rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 text-[10px] sm:text-xs">
                        {t('challengeInterface.waiting')}
                      </div>
                    )}
                    {canDispute && !needsConfirmation && !canMarkComplete && (
                      <Button 
                        onClick={handleDispute} 
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs rounded-md sm:rounded-lg border border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold"
                      >
                        {t('challengeInterface.dispute')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PENDING CHALLENGES */}
            {allPendingChallenges.length > 0 && (
              <div className="w-full bg-white/5 dark:bg-black/30 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-white/10">
                  <span className="text-xs font-semibold text-white">
                    {allPendingChallenges.length} {t('challengeInterface.pendingStatus')}
                  </span>
                  {allPendingChallenges.length > 1 && (
                    <button
                      onClick={() => setShowMultipleChallenges(true)}
                      className="text-[10px] text-violet-300 hover:text-violet-200 font-medium"
                    >
                      {t('challengeInterface.viewAll')}
                    </button>
                  )}
                </div>
                <div className="p-2 space-y-1.5">
                  {allPendingChallenges.slice(0, 2).map((challenge: any) => (
                    <div
                      key={challenge.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-medium text-white truncate">
                          {challenge.challenge_text}
                        </p>
                        <span className="text-[9px] sm:text-[10px] text-amber-300">
                          {'\u{1F4B0}'} {Number(challenge.stake_yuyu || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          onClick={() => handleAcceptForChallenge(challenge)}
                          disabled={isAccepting}
                          size="sm"
                          className="h-6 px-2 text-[9px] rounded bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                        >
                          {t('challengeInterface.accept')}
                        </Button>
                        <Button
                          onClick={() => handleDeclineForChallenge(challenge.id)}
                          disabled={isDeclining}
                          size="sm"
                          variant="ghost"
                          className="h-6 px-1.5 text-[9px] text-white/60 hover:text-rose-300 hover:bg-rose-500/20"
                        >
                          {'\u2715'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ChallengeHistoryOverlay events={events} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg p-0 gap-0 bg-white dark:bg-slate-900 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh]">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-5 py-5 sm:px-6 sm:py-6">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{t('challengeInterface.createChallenge')}</h2>
                  <p className="text-white/80 text-xs sm:text-sm">{t('challengeInterface.proposeBet')}</p>
                </div>
              </div>
              {/* Balance Badge: Yuyu + Caakus balance (both can be used for fun) */}
              <div className="inline-flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg border border-white/20">
                <span className="text-sm text-white font-medium">
                  {t('challengeInterface.balanceLabel')} <span className="font-bold text-amber-300">{(balance?.yuyu_score ?? 0).toLocaleString()}</span> YUYU
                </span>
                <span className="text-xs text-white/80">
                  {t('challengeInterface.balanceLabelUsd')}: <span className="font-semibold text-emerald-300">${(Number(balance?.balance ?? 0)).toFixed(2)}</span>
                </span>
                <span className="text-[10px] sm:text-xs text-white/60 italic hidden sm:inline">
                  {t('challengeInterface.balanceUsableForBets')}
                </span>
              </div>
            </div>
          </div>

          {/* Shop + Buy YUYU — same actions as call overlay, without closing the fun flow */}
          <div className="px-4 py-3 border-b border-white/10 bg-slate-100/95 dark:bg-slate-900/95">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {t('challengeInterface.modalShopBuyHint')}
            </p>
            <div className="flex flex-wrap gap-2 items-stretch">
              <MarketplaceSection toUserId={peerId} embedMode />
              <Button
                type="button"
                onClick={() => setShowCoinsPurchase(true)}
                className="min-h-[2.5rem] sm:min-h-[3rem] px-4 rounded-xl text-white font-bold text-xs sm:text-sm bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 shadow-md flex items-center gap-1.5 border border-amber-400/30"
              >
                <Coins className="w-4 h-4 shrink-0" />
                {t('marketplace.buyCoins')}
              </Button>
            </div>
          </div>

          {/* Content — custom first, then stakes, then 8 ideas */}
          <div className="p-4 sm:p-5 space-y-5 max-h-[min(52vh,420px)] sm:max-h-[min(56vh,480px)] overflow-y-auto overscroll-contain">
            <div className="rounded-2xl border border-violet-300/40 dark:border-violet-500/25 bg-gradient-to-br from-violet-50/90 to-white dark:from-violet-950/40 dark:to-slate-900/80 p-3 sm:p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-[11px] font-bold text-white">
                  1
                </span>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  {t('challengeInterface.customChallenge')}
                </label>
              </div>
              <Textarea
                value={customText}
                onChange={(e) => {
                  setSelectedPreset(null);
                  setCustomText(e.target.value);
                }}
                placeholder={t('challengeInterface.customPlaceholder')}
                rows={3}
                className="min-h-[88px] rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 resize-y text-sm leading-relaxed"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-600/90 text-[11px] font-bold text-white">
                      2
                    </span>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {t('challengeInterface.customAmount')}
                    </label>
                  </div>
                  <Input
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    type="number"
                    min={1}
                    placeholder={t('challengeInterface.enterAmountPlaceholder')}
                    className="h-10 sm:h-11 rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      const amount = Number(customAmount);
                      if (!Number.isFinite(amount) || amount <= 0) {
                        toast.error(t('challengeInterface.enterValidAmount'));
                        return;
                      }
                      const text = effectiveChallengeText;
                      if (!text.trim()) {
                        toast.error(t('challengeInterface.selectFirst'));
                        return;
                      }
                      setPendingProposal({
                        amount,
                        text: text.trim(),
                        presetKey: selectedPreset,
                        isCustom: !selectedPreset,
                      });
                    }}
                    className="w-full h-10 sm:h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-violet-500/25"
                    disabled={isSubmitting}
                  >
                    {t('challengeInterface.create')}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                {t('challengeInterface.quickStakes')}
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                {t('challengeInterface.quickStakesHint')}
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((quick) => (
                  <Button
                    key={quick.value}
                    onClick={() => {
                      const text = effectiveChallengeText;
                      if (!text.trim()) {
                        toast.error(t('challengeInterface.selectFirst'));
                        return;
                      }
                      setPendingProposal({
                        amount: quick.value,
                        text: text.trim(),
                        presetKey: selectedPreset,
                        isCustom: !selectedPreset,
                      });
                    }}
                    size="sm"
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-500/20"
                    disabled={isSubmitting}
                  >
                    {quick.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                {t('challengeInterface.challengeTemplates')}
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                {t('challengeInterface.templatesEightHint')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_CHALLENGES.map((preset) => (
                  <button
                    type="button"
                    key={preset.key}
                    onClick={() => {
                      setSelectedPreset(preset.key);
                      setCustomText(preset.text);
                    }}
                    className={`text-left rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm transition-all border leading-snug ${
                      selectedPreset === preset.key
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/35 text-violet-900 dark:text-violet-100 ring-2 ring-violet-500/25 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-600'
                    }`}
                  >
                    {preset.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirmation Panel */}
            {pendingProposal && (
              <div className="rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                      {t('challengeInterface.confirmChallenge')}
                    </p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-snug">
                      {pendingProposal.text}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/40 rounded-md">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                        {t('challengeInterface.stake')}{pendingProposal.amount.toLocaleString()}{t('challengeInterface.coinsUnit')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmCreate}
                    className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/25"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('challengeInterface.sending') : t('challengeInterface.sendChallenge')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPendingProposal(null)}
                    className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    disabled={isSubmitting}
                  >
                    {t('challengeInterface.cancel')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {incomingPending && allPendingChallenges.length === 1 && (
        <ChallengeNotification
          challenge={incomingPending}
          onAccept={handleAccept}
          onDecline={handleDecline}
          isLoading={isAccepting || isDeclining}
        />
      )}
      
      {/* Multiple Challenges Viewer */}
      {user && (
        <MultipleChallengesViewer
          open={showMultipleChallenges}
          onClose={() => setShowMultipleChallenges(false)}
          challenges={challenges}
          userId={user.id}
          onAccept={async (challengeId) => {
            const challenge = challenges.find((c) => c.id === challengeId) || null;
            await handleAcceptForChallenge(challenge);
          }}
          onDecline={handleDeclineForChallenge}
          isLoading={isAccepting || isDeclining}
        />
      )}
      
      {/* Challenge Completion Confirmation Dialog */}
      {activeChallenge && user && needsConfirmation && (
        <ChallengeCompletionDialog
          open={showCompletionDialog}
          onClose={() => setShowCompletionDialog(false)}
          challenge={activeChallenge}
          onConfirm={() => handleConfirmCompletion('confirmed')}
          onReject={() => handleConfirmCompletion('rejected')}
          isLoading={isResolving}
        />
      )}
      
      {/* Coins Purchase Modal */}
      <CoinsPurchaseModal 
        open={showCoinsPurchase} 
        onClose={() => setShowCoinsPurchase(false)} 
      />
    </ChallengeErrorBoundary>
  );
};
