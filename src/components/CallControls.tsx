import React, { useCallback, useState, useSyncExternalStore } from 'react';
import type { CallTimer } from '@/hooks/useTimer';
import type { FeatureTrial } from '@/hooks/useFeatureTrial';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@/lib/router-compat';
import { FriendRequestModal } from './FriendRequestModal';
import { SkipForward, UserPlus, SlidersHorizontal, Filter, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CallControlsProps {
    onNext: () => void;
    onFriend: () => void;
    isConnected: boolean;
    showViewFriends?: boolean;
    showCustomization?: boolean;
    onCustomize?: () => void;
    selectedTags?: string[];
    showPremiumFilters?: boolean;
    onPremiumFilters?: () => void;
    hasActiveFilters?: boolean;
    secondsInCall?: number;
    /** External call timer store — read without re-rendering the parent. */
    timer?: CallTimer;
    userIsPremium?: boolean;
    isGuestUser?: boolean;
    /** External trial store; only this small control tree redraws each second. */
    featureTrial?: FeatureTrial;
}

const CallControlsImpl: React.FC<CallControlsProps> = ({
    onNext,
    onFriend,
    isConnected,
    showCustomization = false,
    onCustomize,
    selectedTags = [],
    showPremiumFilters = false,
    onPremiumFilters,
    hasActiveFilters = false,
    showViewFriends = true,
    secondsInCall = 0,
    timer,
    userIsPremium = false,
    isGuestUser = false,
    featureTrial,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showFriendModal, setShowFriendModal] = useState(false);

    const handleFriendClick = () => {
        setShowFriendModal(true);
    };

    const handleFriendConfirm = () => {
        setShowFriendModal(false);
        onFriend();
    };

    // Free users must wait 30s — the countdown reads the external timer store
    // so only this component re-renders each second (not the whole call page).
    const noopSubscribe = useCallback(() => () => {}, []);
    const staticSeconds = useCallback(() => secondsInCall, [secondsInCall]);
    const liveSeconds = useSyncExternalStore(
        timer?.subscribe ?? noopSubscribe,
        timer?.getSeconds ?? staticSeconds,
        () => 0,
    );
    const emptyTrialLabel = useCallback(() => null, []);
    const trialLabel = useSyncExternalStore(
        featureTrial?.subscribe ?? noopSubscribe,
        featureTrial?.getLabel ?? emptyTrialLabel,
        emptyTrialLabel,
    );
    const isFreeUser = !userIsPremium && !isGuestUser;
    const freeSkipBlocked = isConnected && isFreeUser && liveSeconds < 30;
    const skipCountdown = freeSkipBlocked ? 30 - liveSeconds : 0;

    return (
        <div className="w-full pr-0 -mr-3 sm:mr-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:flex md:flex-wrap md:gap-4 md:justify-center">

                {/* ── Next ── */}
                <Button
                    onClick={onNext}
                    disabled={!isConnected}
                    className={`group relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 px-3 py-3 sm:px-5 sm:py-4 md:px-8 md:py-5 min-h-[68px] sm:min-h-[80px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 ${
                        freeSkipBlocked
                            ? 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 opacity-70 cursor-not-allowed'
                            : 'bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#818CF8] hover:from-[#4338CA] hover:via-[#4F46E5] hover:to-[#6366F1]'
                    } disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-40 shadow-[0_4px_16px_rgb(79,70,229,0.25)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.35)] transition-all duration-300 hover:scale-[1.03] disabled:hover:scale-100 md:flex-1 md:max-w-[260px] h-auto`}
                >
                    <div className="relative z-10 p-1.5 sm:p-2">
                        <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10 text-center">
                        <span className="text-[13px] sm:text-sm md:text-base font-bold text-white block leading-tight">
                            {t('audioCall.controls.next')}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-white/70 font-semibold uppercase tracking-wide">
                            {freeSkipBlocked
                                ? `${skipCountdown}s left`
                                : t('audioCall.controls.newMatch')}
                        </span>
                    </div>
                    {/* Countdown progress bar for free users */}
                    {freeSkipBlocked && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden">
                            <div
                                className="h-full bg-indigo-400 transition-all duration-1000"
                                style={{ width: `${(liveSeconds / 30) * 100}%` }}
                            />
                        </div>
                    )}
                </Button>

                {/* ── Customize ── */}
                {showCustomization && (
                    <Button
                        onClick={onCustomize}
                        className="premium-gold-button group relative flex h-auto min-h-[68px] flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-amber-300/60 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 px-3 py-3 shadow-[0_0_24px_rgba(251,191,36,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_34px_rgba(251,191,36,0.5)] sm:min-h-[80px] sm:gap-1.5 sm:rounded-2xl sm:px-5 sm:py-4 md:max-w-[260px] md:flex-1 md:px-8 md:py-5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {trialLabel && (
                            <span className="absolute top-1.5 left-1.5 z-20 rounded-full bg-black/55 px-2 py-[2px] text-[9px] font-bold tabular-nums text-white/90 backdrop-blur-sm">
                                {trialLabel}
                            </span>
                        )}
                        <div className="relative z-10 p-1.5 sm:p-2 bg-white/15 rounded-lg sm:rounded-xl">
                            <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="relative z-10 text-center min-w-0 w-full">
                            <span className="text-[13px] sm:text-sm md:text-base font-bold text-white block leading-tight">{t('audioCall.controls.customize')}</span>
                            <span className="text-[9px] sm:text-[10px] text-white/70 font-semibold uppercase tracking-wide block truncate">
                                {selectedTags.length ? selectedTags.join(", ") : t('audioCall.controls.byInterests')}
                            </span>
                        </div>
                    </Button>
                )}

                {/* ── Filters ── */}
                {showPremiumFilters && (
                    <Button
                        onClick={onPremiumFilters}
                        className="premium-gold-button group relative flex h-auto min-h-[68px] flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-amber-300/60 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 px-3 py-3 shadow-[0_0_24px_rgba(251,191,36,0.3)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_34px_rgba(251,191,36,0.5)] sm:min-h-[80px] sm:gap-1.5 sm:rounded-2xl sm:px-5 sm:py-4 md:max-w-[260px] md:flex-1 md:px-8 md:py-5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {trialLabel && (
                            <span className="absolute top-1.5 left-1.5 z-20 rounded-full bg-black/55 px-2 py-[2px] text-[9px] font-bold tabular-nums text-white/90 backdrop-blur-sm">
                                {trialLabel}
                            </span>
                        )}
                        {hasActiveFilters && (
                            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full shadow-md animate-pulse z-20" />
                        )}
                        <div className="relative z-10 p-1.5 sm:p-2 bg-white/15 rounded-lg sm:rounded-xl">
                            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="relative z-10 text-center">
                            <span className="text-[13px] sm:text-sm md:text-base font-bold text-white block leading-tight">{t('audioCall.controls.filters')}</span>
                            <span className="text-[9px] sm:text-[10px] text-white/70 font-semibold uppercase tracking-wide">
                                {hasActiveFilters ? t('audioCall.controls.active') : t('audioCall.controls.genderRegion')}
                            </span>
                        </div>
                    </Button>
                )}

                {/* ── Add Friend ── */}
                <Button
                    onClick={handleFriendClick}
                    disabled={!isConnected}
                    className="group relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 px-3 py-3 sm:px-5 sm:py-4 md:px-8 md:py-5 min-h-[68px] sm:min-h-[80px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#EC4899] via-[#F472B6] to-[#FB7185] hover:from-[#DB2777] hover:via-[#EC4899] hover:to-[#F472B6] disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-40 shadow-[0_4px_16px_rgb(236,72,153,0.25)] hover:shadow-[0_8px_30px_rgb(236,72,153,0.35)] transition-all duration-300 hover:scale-[1.03] disabled:hover:scale-100 md:flex-1 md:max-w-[260px] h-auto"
                >
                    <div className="relative z-10 p-1.5 sm:p-2">
                        <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10 text-center">
                        <span className="text-[13px] sm:text-sm md:text-base font-bold text-white block leading-tight">{t('audioCall.controls.addFriend')}</span>
                        <span className="text-[9px] sm:text-[10px] text-white/70 font-semibold uppercase tracking-wide">{t('audioCall.controls.sendRequest')}</span>
                    </div>
                </Button>

                {/* ── View All Friends (gold) ── */}
                {showViewFriends && (
                    <Button
                        onClick={() => navigate('/connections')}
                        className="group relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 min-h-[68px] sm:min-h-[80px] rounded-xl sm:rounded-2xl overflow-hidden border border-amber-400/40 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 shadow-[0_4px_16px_rgb(245,158,11,0.3)] hover:shadow-[0_8px_30px_rgba(234,179,8,0.4)] transition-all duration-300 hover:scale-[1.03] md:flex-1 md:max-w-[180px] h-auto"
                    >
                        <div className="relative z-10 p-1.5 sm:p-2">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="relative z-10 text-center">
                            <span className="text-[12px] sm:text-sm font-bold text-white block leading-tight">{t('globalConnection.viewAllFriends')}</span>
                        </div>
                    </Button>
                )}

            </div>

            {showFriendModal && (
                <FriendRequestModal
                    onConfirm={handleFriendConfirm}
                    onCancel={() => setShowFriendModal(false)}
                    isFirstConfirmation={true}
                />
            )}
        </div>
    );
};

// Memoised: the call screen re-renders often (volume meters, connection
// state); the controls only change when their own props change.
export const CallControls = React.memo(CallControlsImpl);
CallControls.displayName = 'CallControls';
