import React, { useState, useEffect } from 'react';
import { CURRENCIES, type CurrencyCode } from '../types';
import { formatBalance, formatMobileNumber } from '../utils/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useOnboardPayout, usePayoutAccount, useRequestStandardPayout, useRequestInstantPayout } from '../hooks/usePayout';
import { useWalletBalance } from '../hooks/useWallet';
import { useCurrencyRates } from '../hooks/useCurrencyRates';
import { LottieAnimation } from './LottieAnimation';
import { useTranslation } from 'react-i18next';
import money3D from '@/assets/3D Money Icon.json';
import { Wallet, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
// Gift animations are handled globally by GiftReceiveOverlay / AudioCall

interface BalanceDisplayProps {
    initialBalance: number;
    compact?: boolean;
}

const WithdrawalFlow: React.FC<{displayBalance: number, convertedBalance: number, currency: CurrencyCode, selectedCurrency: any}> = ({ displayBalance, convertedBalance, currency, selectedCurrency }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const { data: payoutAccount, isLoading: isLoadingAccount } = usePayoutAccount();
    const onboardMutation = useOnboardPayout();
    const standardPayoutMutation = useRequestStandardPayout();
    const instantPayoutMutation = useRequestInstantPayout();
    const parsedAmount = Number.parseFloat(amount);
    const availableBalance = Math.max(0, displayBalance);
    const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount <= availableBalance;
    const isStandardActive = standardPayoutMutation.isPending || standardPayoutMutation.isSuccess || standardPayoutMutation.isError;
    const isInstantActive = instantPayoutMutation.isPending || instantPayoutMutation.isSuccess || instantPayoutMutation.isError;

    const handleOnboard = async () => {
        try {
            if (payoutAccount?.onboarding_url) {
                window.location.href = payoutAccount.onboarding_url;
                return;
            }
            const result = await onboardMutation.mutateAsync();
            if (result.url) {
                window.location.href = result.url;
            }
        } catch (error) {
            console.error('Onboarding failed', error);
        }
    };

    const handlePayout = (payoutType: 'standard' | 'instant') => {
        const numericAmount = Number.parseFloat(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setLocalError(t('payout.errors.invalid_amount'));
            return;
        }
        if (numericAmount > availableBalance) {
            setLocalError(t('payout.errors.insufficient_funds'));
            return;
        }
        if (!payoutAccount?.payouts_enabled) {
            setLocalError(t('payout.errors.payouts_disabled'));
            return;
        }
        setLocalError(null);
        if (payoutType === 'standard') {
            standardPayoutMutation.mutate(numericAmount);
        } else {
            instantPayoutMutation.mutate(numericAmount);
        }
    };

    const mutation = isStandardActive ? standardPayoutMutation : instantPayoutMutation;
    const mutationErrorMessage = mutation.isError && mutation.error instanceof Error ? mutation.error.message : null;
    const mappedMutationError = mutationErrorMessage === 'stripe_connect_not_enabled'
        ? t('payout.errors.connect_not_enabled')
        : mutationErrorMessage;
    const showError = localError || (mutation.isError ? (mappedMutationError || t('common.error')) : null);
    const payoutsEnabled = payoutAccount?.payouts_enabled;
    const canSubmit = hasValidAmount && payoutsEnabled;

    useEffect(() => {
        if (mutation.isSuccess) {
            setAmount('');
            setLocalError(null);
        }
    }, [mutation.isSuccess]);

    return (
        <>
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.1)_0%,transparent_50%),radial-gradient(circle_at_40%_80%,rgba(5,150,105,0.1)_0%,transparent_50%)] animate-pulse" />

            <DialogHeader className="relative z-10">
                <div className="flex flex-col items-center text-center space-y-6 pt-2">
                    {/* Enhanced Animation Container */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                        <div className="relative w-28 h-28 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-full flex items-center justify-center shadow-xl ring-4 ring-green-200/50 dark:ring-green-700/50">
                            <LottieAnimation
                                animationData={money3D}
                                loop={true}
                                autoplay={true}
                                style={{ width: '80%', height: '80%' }}
                            />
                        </div>
                    </div>

                    {/* Title with Better Typography */}
                    <div className="space-y-2">
                        <DialogTitle className="text-3xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent leading-tight">
                            {t('balance.modal.title')}
                        </DialogTitle>
                        <div className="flex items-center justify-center gap-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            <Wallet className="w-6 h-6" />
                            <span>{t('payout.withdraw_earnings')}</span>
                        </div>
                    </div>

                    {/* Enhanced Description */}
                        <DialogDescription className="text-center text-gray-700 dark:text-gray-300 leading-relaxed text-base max-w-sm">
                        {t('balance.modal.description_pre')} <span className="font-semibold text-green-700 dark:text-green-300">{t('balance.modal.description_highlight')}</span> {t('balance.modal.description_post')}
                    </DialogDescription>
                </div>
            </DialogHeader>

            <div className="relative z-10 space-y-6 mt-6">
                {/* Enhanced Balance Display */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-600/20 dark:to-emerald-600/20 p-6 border border-green-300/30 dark:border-green-600/30">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-transparent animate-shimmer" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('balance.current')}</p>
                                <p className="text-2xl font-black text-green-700 dark:text-green-300">
                                    {formatBalance(convertedBalance, currency, selectedCurrency.symbol)}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('balance.secure')}</p>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-semibold">{t('balance.protected')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoadingAccount ? (
                    <div className="flex justify-center items-center p-8"><Loader2 className="mr-2 h-4 w-4 animate-spin" /></div>
                ) : !payoutAccount || !payoutAccount.details_submitted ? (
                    <div className="text-center p-4">
                        <DialogTitle>{t('payout.onboard.title')}</DialogTitle>
                        <DialogDescription>{t('payout.onboard.description')}</DialogDescription>
                        <Button onClick={handleOnboard} disabled={onboardMutation.isPending} className="mt-4 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white rounded-2xl py-4 font-bold text-lg shadow-[0_8px_32px_rgba(34,197,94,0.3)] hover:shadow-[0_12px_40px_rgba(34,197,94,0.4)] transition-all duration-300 transform hover:scale-[1.02] border-0 ring-2 ring-green-400/20 hover:ring-green-400/40">
                            {onboardMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {t('payout.onboard.button')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="amount" className="font-semibold">{t('payout.amount')}</label>
                            <Input
                                id="amount"
                                type="number"
                                min={0}
                                max={availableBalance}
                                step="0.01"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setLocalError(null);
                                }}
                                placeholder="0.00"
                            />
                        </div>

                        {!payoutsEnabled && (
                            <div className="text-amber-600 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>{t('payout.payouts_disabled')}</span>
                            </div>
                        )}

                        {showError && (
                            <div className="text-red-500 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>{showError}</span>
                            </div>
                        )}

                        {mutation.isSuccess && (
                            <div className="text-green-500 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>{t('payout.success')}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button onClick={() => handlePayout('standard')} disabled={!canSubmit || standardPayoutMutation.isPending || instantPayoutMutation.isPending} className="w-full">
                                {standardPayoutMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {t('payout.standard')}
                            </Button>
                            <Button onClick={() => handlePayout('instant')} disabled={!canSubmit || instantPayoutMutation.isPending || standardPayoutMutation.isPending} className="w-full">
                                {instantPayoutMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {t('payout.instant')}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">{t('payout.fee_notice')}</p>
                    </div>
                )}
            </div>
        </>
    );
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
    initialBalance,
    compact = false
}) => {
    const { t } = useTranslation();
    const [displayBalance, setDisplayBalance] = useState(initialBalance);
    const [currency, setCurrency] = useState<CurrencyCode>('USD');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    // Fetch real-time balance from server
    const { data: walletData } = useWalletBalance();
    const serverBalance = walletData?.balance ?? initialBalance;

    // Update displayBalance when server balance changes (from gifts, payments, etc.)
    useEffect(() => {
        setDisplayBalance(serverBalance);
    }, [serverBalance]);


    // ❌ REMOVED: Fake balance simulation that was causing the issue
    // The balance now ONLY comes from the server, not simulated

    // Live exchange rates for real-time currency conversion
    const { convert, isLoading: isRatesLoading } = useCurrencyRates();

    const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

    // Convert the USD balance to the selected currency using live rates
    const convertedBalance = convert(displayBalance, currency);

    return (
        <div className={`flex min-w-0 ${compact ? 'items-center gap-1' : 'flex-col sm:flex-row items-center gap-3'}`}>
            <Card
                className={`${compact ? 'h-11 min-w-0 flex-1' : 'h-16 sm:min-w-[200px] min-w-[90px]'} bg-gradient-to-br from-green-500 to-emerald-600 border border-green-400/30 ring-1 ring-green-400/20 cursor-pointer hover:from-green-600 hover:to-emerald-700 hover:ring-green-400/40 focus-visible:ring-4 focus-visible:ring-green-300 transition-all duration-300 shadow-xl backdrop-blur-md rounded-xl group relative overflow-hidden animate-neon-glow hover:shadow-[0_0_28px_rgba(168,85,247,0.4),0_0_56px_rgba(236,72,153,0.2)]`}
                onClick={() => setShowWithdrawModal(true)}
                role="button"
                tabIndex={0}
                aria-label={`Current balance: ${formatBalance(convertedBalance, currency, selectedCurrency.symbol)}. Click to open withdrawal modal.`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowWithdrawModal(true); e.preventDefault(); } }}
            >
                <CardContent className={`p-0 ${compact ? 'px-1.5' : 'px-5'} h-full flex items-center`}>
                    <div className={`flex min-w-0 items-center ${compact ? 'gap-1' : 'gap-3'} w-full`}>
                        <div className={`${compact ? 'w-5 h-5' : 'w-9 h-9'} flex-shrink-0 group-hover:animate-pulse`}>
                            <LottieAnimation
                                animationData={money3D}
                                loop={true}
                                autoplay={true}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className={`${compact ? 'text-[11px]' : 'text-lg'} whitespace-nowrap font-extrabold text-white leading-tight drop-shadow-lg`}>
                                {compact ? (
                                    <>
                                        <span className="md:hidden">{selectedCurrency.symbol}{formatMobileNumber(convertedBalance)}</span>
                                        <span className="hidden md:inline">{formatBalance(convertedBalance, currency, selectedCurrency.symbol)}</span>
                                    </>
                                ) : formatBalance(convertedBalance, currency, selectedCurrency.symbol)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
                <SelectTrigger
                    aria-label="Select currency"
                    className={`${compact ? 'h-11 w-[58px] min-w-0 px-1.5 gap-0.5 text-[10px]' : 'w-[130px] h-12 px-4 gap-2'} flex shrink-0 items-center rounded-full bg-white/10 dark:bg-gray-800/70 text-white font-bold shadow-lg hover:bg-white/20 dark:hover:bg-gray-800/80 transition-all duration-300 border border-white/20 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-400/60 backdrop-blur-sm`}
                >
                    <span className={compact ? 'text-[11px]' : 'text-lg'}>{selectedCurrency.symbol}</span>
                    <span className={`text-white font-bold ${compact ? 'text-[10px]' : 'text-base'}`}>{selectedCurrency.code}</span>
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-900/95 shadow-2xl mt-2 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 max-h-[60dvh] overflow-y-auto overscroll-contain">
                    {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code} className="flex items-center gap-2 px-4 py-3 text-gray-800 dark:text-gray-100 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 rounded-lg cursor-pointer transition-colors duration-200">
                            <span className="text-lg">{curr.symbol}</span> <span className="font-bold">{curr.code}</span> <span className="text-xs text-gray-500 dark:text-gray-400">{curr.name}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
                <DialogContent className="sm:max-w-[480px] rounded-3xl bg-gradient-to-br from-white via-green-50/80 to-emerald-50/60 dark:from-gray-900 dark:via-green-950/40 dark:to-emerald-950/30 backdrop-blur-2xl shadow-[0_32px_64px_rgba(34,197,94,0.2)] border-0 ring-1 ring-green-200/50 dark:ring-green-700/30 overflow-hidden">
                   <WithdrawalFlow displayBalance={displayBalance} convertedBalance={convertedBalance} currency={currency} selectedCurrency={selectedCurrency} />
                </DialogContent>
            </Dialog>

        </div>
    );
};