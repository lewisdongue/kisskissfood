import { v4 as uuidv4 } from 'uuid';

// Generate unique referral code
export const generateReferralCode = (): string => {
    return uuidv4().split('-')[0].toUpperCase();
};

// Format balance with currency (supports converted amounts)
export const formatBalance = (amount: number, _currency: string, symbol: string): string => {
    // For currencies with large values (e.g. NGN, INR), show no decimals above 100
    if (amount >= 100) {
        return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Compact display for constrained mobile controls. Keep one decimal and a
// visible separator before the suffix so large balances remain easy to scan.
export const formatMobileNumber = (value: number): string => {
    const safeValue = Number.isFinite(value) ? value : 0;
    const absoluteValue = Math.abs(safeValue);

    if (absoluteValue >= 1_000_000_000) {
        return `${(safeValue / 1_000_000_000).toFixed(1)} B`;
    }
    if (absoluteValue >= 1_000_000) {
        return `${(safeValue / 1_000_000).toFixed(1)} M`;
    }
    if (absoluteValue >= 1_000) {
        return `${(safeValue / 1_000).toFixed(1)} k`;
    }
    return safeValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Calculate YUYU score increase based on activity
export const calculateYUYUIncrease = (
    callDuration: number,
    referrals: number,
    friendsCount: number
): number => {
    const durationPoints = Math.floor(callDuration / 60) * 5; // 5 points per minute
    const referralPoints = referrals * 100;
    const friendPoints = friendsCount * 50;
    return durationPoints + referralPoints + friendPoints;
};

// Calculate earnings based on YUYU score
export const calculateEarnings = (yuyuScore: number): number => {
    // Simple formula: $0.01 per 10 YUYU points
    return (yuyuScore / 10) * 0.01;
};

// Format time duration
export const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get referral link
export const getReferralLink = (referralCode: string): string => {
    return `${window.location.origin}?ref=${referralCode}`;
};

const REF_PARAM_STORAGE_KEY = 'caakus_ref_param';

// Extract referral code from URL (ref can be user id or referral_code)
export const extractReferralCode = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
        try {
            sessionStorage.setItem(REF_PARAM_STORAGE_KEY, ref);
        } catch {
            // ignore
        }
    }
    return ref;
};

// For signup/OAuth: use stored ref (persisted before redirect) or current URL ref
export const getReferralCodeForSignup = (): string | null => {
    try {
        const stored = sessionStorage.getItem(REF_PARAM_STORAGE_KEY);
        if (stored) return stored;
    } catch {
        // ignore
    }
    return extractReferralCode();
};

export const clearStoredReferralCode = (): void => {
    try {
        sessionStorage.removeItem(REF_PARAM_STORAGE_KEY);
    } catch {
        // ignore
    }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return 'denied';
    }

    return await Notification.requestPermission();
};

