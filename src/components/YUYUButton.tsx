import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMobileNumber, getReferralLink } from '../utils/helpers';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Copy, Check, ShoppingCart, ArrowRightLeft } from 'lucide-react';
import { CoinsPurchaseModal } from './CoinsPurchaseModal';
import { ConvertCoinsModal } from './ConvertCoinsModal';

interface YUYUButtonProps {
    score: number;
    referralCode: string;
    compact?: boolean;
    displayScore?: string;
}

// Premium Gold Coin Component
const GoldCoin: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; animate?: boolean }> = ({ size = 'md', animate = true }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-20 h-20'
    };

    const innerSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-8 h-8',
        xl: 'w-14 h-14'
    };

    const textSizeClasses = {
        sm: 'text-[8px]',
        md: 'text-[10px]',
        lg: 'text-sm',
        xl: 'text-xl'
    };

    return (
        <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-600 p-[2px] shadow-lg relative overflow-hidden`}
                style={{
                    boxShadow: `
                        0 2px 4px rgba(0,0,0,0.3),
                        0 4px 8px rgba(0,0,0,0.2),
                        inset 0 2px 4px rgba(255,255,255,0.4),
                        inset 0 -2px 4px rgba(0,0,0,0.2)
                    `
                }}
            >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 flex items-center justify-center relative overflow-hidden"
                    style={{
                        boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.5), inset 0 -2px 8px rgba(139,69,19,0.3)'
                    }}
                >
                    <div className={`${innerSizeClasses[size]} rounded-full border-2 border-amber-600/40 flex items-center justify-center`}
                        style={{
                            background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
                            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.6), inset 0 -1px 3px rgba(0,0,0,0.2)'
                        }}
                    >
                        <span className={`${textSizeClasses[size]} font-black text-amber-800 drop-shadow-sm`}
                            style={{ textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}
                        >
                            Y
                        </span>
                    </div>

                    {animate && (
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-coin-shine"
                            style={{
                                transform: 'translateX(-100%) skewX(-12deg)',
                                animation: 'coinShine 3s infinite'
                            }}
                        />
                    )}

                    <div className="absolute top-0 left-1/4 right-1/4 h-[30%] bg-gradient-to-b from-white/50 to-transparent rounded-full blur-[1px]" />
                </div>

                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
            </div>
        </div>
    );
};

export const YUYUButton: React.FC<YUYUButtonProps> = ({ score, referralCode, compact = false, displayScore }) => {
    const [showModal, setShowModal] = useState(false);
    const [showCoinsPurchase, setShowCoinsPurchase] = useState(false);
    const [showConvertCoins, setShowConvertCoins] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pulse, setPulse] = useState(false);
    const { t } = useTranslation();
    const formattedScore = displayScore ?? formatMobileNumber(score);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        const handler = () => {
            setPulse(true);
            timeoutId = setTimeout(() => setPulse(false), 3000);
        };
        window.addEventListener('caakus-welcome-bonus-shown', handler);
        window.addEventListener('caakus-yuyu-reward', handler);
        return () => {
            window.removeEventListener('caakus-welcome-bonus-shown', handler);
            window.removeEventListener('caakus-yuyu-reward', handler);
            clearTimeout(timeoutId);
        };
    }, []);

    const referralLink = getReferralLink(referralCode);

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openModal = () => setShowModal(true);
    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    };

    return (
        <>
            <style>{`
                @keyframes coinShine {
                    0% { transform: translateX(-100%) skewX(-12deg); }
                    50%, 100% { transform: translateX(200%) skewX(-12deg); }
                }
                @keyframes coinPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2); }
                    50% { transform: scale(1.08); box-shadow: 0 0 20px rgba(251, 191, 36, 0.6); }
                }
            `}</style>

            {compact ? (
                <button
                    data-yuyu-balance
                    type="button"
                    onClick={openModal}
                    onKeyDown={handleTriggerKeyDown}
                    aria-label={t('yuyu.button.label') + ': ' + formattedScore}
                    className="flex min-w-0 items-center gap-1 px-1.5 py-1 min-h-11 rounded-xl bg-gradient-to-r from-amber-900/40 via-yellow-800/30 to-amber-900/40 border border-yellow-500/50 backdrop-blur-md shadow-lg cursor-pointer hover:border-yellow-400/70 hover:shadow-yellow-500/20 transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    style={{
                        boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}
                >
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                        <GoldCoin size="sm" />
                    </div>
                    <div className={`whitespace-nowrap text-[11px] font-black bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent leading-none ${pulse ? 'animate-[coinPulse_1.5s_ease-in-out_2]' : ''}`}>
                        <span>{formattedScore}</span>
                    </div>
                </button>
            ) : (
                <button
                    data-yuyu-balance
                    type="button"
                    onClick={openModal}
                    onKeyDown={handleTriggerKeyDown}
                    aria-label={t('yuyu.button.label') + ': ' + formattedScore}
                    className="h-16 md:h-10 sm:min-w-[190px] min-w-[100px] w-full md:min-w-0 md:w-auto md:max-w-[120px] lg:max-w-[140px] text-left bg-gradient-to-br from-amber-900/80 via-yellow-800/70 to-amber-900/80 border-2 md:border border-yellow-500/60 cursor-pointer hover:border-yellow-400 transition-all shadow-lg hover:shadow-xl hover:shadow-yellow-500/30 backdrop-blur-sm transform hover:scale-[1.02] duration-300 group overflow-hidden relative rounded-lg md:rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    style={{
                        boxShadow: '0 4px 16px rgba(251, 191, 36, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -skew-x-12 animate-pulse opacity-50 pointer-events-none" />
                    <CardContent className="p-0 px-4 md:px-2 h-full flex items-center relative z-10">
                        <div className="flex items-center gap-3 md:gap-1.5 w-full">
                            <div className="transform group-hover:rotate-12 transition-transform duration-500">
                                <GoldCoin size="md" />
                            </div>
                            <div className={`text-lg md:text-sm font-black bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent leading-tight drop-shadow-sm truncate ${pulse ? 'animate-[coinPulse_1.5s_ease-in-out_2]' : ''}`}>{formattedScore}</div>
                        </div>
                    </CardContent>
                </button>
            )}

            {/* ── YUYU Modal ── */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="w-[calc(100vw-24px)] sm:max-w-[500px] max-h-[88vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-2xl p-4 sm:p-6">
                    <DialogHeader className="text-center pb-4">
                        <div className="flex justify-center mb-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl scale-150 animate-pulse" />
                                <GoldCoin size="xl" animate={true} />
                            </div>
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {t('yuyu.modal.title')}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                            {t('yuyu.modal.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 sm:space-y-4">
                        {/* Balance card */}
                        <div className="flex items-center justify-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-amber-100/80 via-yellow-100/80 to-amber-100/80 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-amber-900/40 rounded-xl border-2 border-yellow-400/50 dark:border-yellow-600/50">
                            <GoldCoin size="lg" />
                            <div className="text-center min-w-0 flex-1">
                                <div className="text-[10px] sm:text-xs text-amber-600 dark:text-yellow-400 font-bold uppercase tracking-wider mb-1">
                                    {t('yuyu.modal.yourBalance')}
                                </div>
                                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 dark:from-yellow-300 dark:via-amber-400 dark:to-yellow-300 bg-clip-text text-transparent leading-tight break-all">
                                    {formatMobileNumber(score)}
                                </div>
                            </div>
                            <GoldCoin size="lg" />
                        </div>

                        {/* Buy Coins */}
                        <Button
                            type="button"
                            className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white font-bold py-3 sm:py-4 shadow-lg border border-green-600/30 text-sm sm:text-base min-h-[48px]"
                            onClick={() => { setShowModal(false); setShowCoinsPurchase(true); }}
                            style={{ boxShadow: '0 4px 16px rgba(34, 197, 94, 0.4)' }}
                        >
                            <span className="flex items-center gap-2">
                                <ShoppingCart size={18} />
                                {t('yuyu.modal.buyButton')}
                                <GoldCoin size="sm" animate={false} />
                            </span>
                        </Button>

                        {/* Convert Coins */}
                        <Button
                            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold py-3 sm:py-4 shadow-lg border border-indigo-600/30 text-sm sm:text-base min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-indigo-500 disabled:hover:via-purple-500 disabled:hover:to-indigo-600"
                            onClick={() => { setShowModal(false); setShowConvertCoins(true); }}
                            style={{ boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)' }}
                            disabled={score < 100}
                            aria-disabled={score < 100}
                            aria-label={score < 100 ? t('yuyu.modal.minCoins') : t('yuyu.modal.convertButton')}
                        >
                            <span className="flex items-center gap-2 flex-wrap justify-center">
                                <ArrowRightLeft size={18} />
                                {t('yuyu.modal.convertButton')}
                                <span className="text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">8% fee</span>
                            </span>
                        </Button>

                        {score < 100 && (
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                {t('yuyu.modal.minCoins')}
                            </p>
                        )}

                        {/* Referral Section */}
                        <div className="bg-gradient-to-br from-amber-50/80 via-yellow-50/80 to-amber-50/80 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-950/40 rounded-xl border-2 border-yellow-400/60 dark:border-yellow-700/50 p-4 sm:p-5 mt-2 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute -right-2 -top-2 opacity-20 scale-75 pointer-events-none">
                                <GoldCoin size="lg" animate={false} />
                            </div>
                            <div className="absolute -left-2 -bottom-2 opacity-20 scale-75 pointer-events-none">
                                <GoldCoin size="lg" animate={false} />
                            </div>

                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{t('yuyu.invite.linkTitle')}</h3>
                            </div>

                            {/* Referral link row */}
                            <div className="flex gap-2 mb-3 relative z-10">
                                <Input
                                    type="text"
                                    value={referralLink}
                                    readOnly
                                    aria-label={t('yuyu.invite.linkTitle')}
                                    className="flex-1 min-w-0 bg-white/90 dark:bg-gray-800/90 border-yellow-300/50 dark:border-yellow-600/50 font-mono text-xs sm:text-sm text-gray-900 dark:text-gray-100 backdrop-blur-sm focus:border-yellow-400"
                                />
                                <Button
                                    type="button"
                                    className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-600 text-white px-3 sm:px-4 font-bold shadow-lg border border-yellow-600/50 flex-shrink-0 min-h-[44px]"
                                    onClick={copyLink}
                                    style={{ boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)' }}
                                    aria-label={copied ? t('yuyu.copied') : t('yuyu.copy')}
                                >
                                    {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                                    <span className="ml-1 text-sm">{copied ? t('yuyu.copied') : t('yuyu.copy')}</span>
                                </Button>
                            </div>

                            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-3 sm:p-4 text-center border-2 border-yellow-300/50 dark:border-yellow-700/50 backdrop-blur-sm relative z-10">
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <GoldCoin size="sm" animate={false} />
                                    <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        Share to earn{' '}
                                        <span className="font-black text-amber-600 dark:text-yellow-400">+100 Yuyu</span>{' '}
                                        per referral!
                                    </p>
                                    <GoldCoin size="sm" animate={false} />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-600 text-white font-bold py-3 mt-2 shadow-lg border border-yellow-600/30 text-sm sm:text-base min-h-[48px]"
                            onClick={() => setShowModal(false)}
                            style={{ boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)' }}
                            aria-label={t('yuyu.modal.gotIt')}
                        >
                            <span className="flex items-center gap-2">
                                <GoldCoin size="sm" animate={false} />
                                {t('yuyu.modal.gotIt')}
                                <GoldCoin size="sm" animate={false} />
                            </span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <CoinsPurchaseModal
                open={showCoinsPurchase}
                onClose={() => setShowCoinsPurchase(false)}
            />

            <ConvertCoinsModal
                open={showConvertCoins}
                onClose={() => setShowConvertCoins(false)}
            />
        </>
    );
};
