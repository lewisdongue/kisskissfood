// Gender Types for Premium Filtering
export type UserGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    country: string;
    profile_picture?: string;
    language: string;
    yuyu_score: number;
    yuyu_bonus?: number; // Non-withdrawable bonus YUYU (gifts/fun only)
    balance: number;
    referral_code: string;
    referred_by?: string;
    created_at: string;
    hide_picture: boolean;
    is_premium: boolean;
    subscription_status?: string | null;
    subscription_type?: string | null;
    subscription_ends_at?: string | null;
    referral_premium_expires_at?: string | null;
    match_tags?: string[] | null;
    streak_count?: number;
    last_streak_date?: string | null;
    streak_recovery_used_at?: string | null;
    last_streak_risk_notified_at?: string | null;
    level?: number;
    level_progress?: number;
    total_xp?: number;
    last_active_at?: string | null;
    // Premium Features
    gender?: UserGender;
    preferred_gender?: UserGender | null;
    preferred_regions?: string[] | null;
}

// Call Types
export interface CallSession {
    id: string;
    user1_id: string;
    user2_id: string;
    started_at: string;
    ended_at?: string;
    duration?: number;
}

// Friend Request Types
export interface FriendRequest {
    id: string;
    from_user_id: string;
    to_user_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    from_user_confirmed: boolean;
    to_user_confirmed: boolean;
}

// Notification Types
export type NotificationType =
    | 'yuyu_earned'
    | 'friend_accepted'
    | 'friend_request_received'
    | 'secret_reply'
    | 'referral_bonus'
    | 'referral_signup'
    | 'system_announcement'
    | 're_engagement'
    | 'streak_at_risk';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    message: string;
    read: boolean;
    created_at: string;
}

// Community System Types
export interface Secret {
    id: string;
    content: string;
    author_id?: string;
    author_pseudonym?: string;
    is_anonymous: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    views_count: number;
    likes_count: number;
    comments_count: number;
    reported_count: number;
    created_at: string;
    approved_at?: string;
}

export interface SecretComment {
    id: string;
    secret_id: string;
    content: string;
    author_id?: string;
    author_pseudonym?: string;
    is_anonymous: boolean;
    likes_count: number;
    reported_count: number;
    created_at: string;
}

export interface SecretLike {
    id: string;
    user_id: string;
    secret_id?: string;
    comment_id?: string;
    created_at: string;
}

export interface VoiceClip {
    id: string;
    user_id?: string;
    storage_path: string;
    duration_seconds: number;
    is_anonymous: boolean;
    status: 'pending' | 'approved' | 'rejected';
    cool_count: number;
    cringe_count: number;
    funny_count: number;
    total_ratings: number;
    views_count: number;
    reported_count: number;
    created_at: string;
    approved_at?: string;
}

export interface VoiceRating {
    id: string;
    voice_clip_id: string;
    user_id?: string;
    rating_type: 'cool' | 'cringe' | 'funny';
    created_at: string;
}

export interface ContentReport {
    id: string;
    reporter_id: string;
    secret_id?: string;
    comment_id?: string;
    voice_clip_id?: string;
    reason: 'spam' | 'offensive' | 'harassment' | 'inappropriate' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
    created_at: string;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    yuyu_score: number;
    country: string;
    hide_picture: boolean;
    profile_picture?: string | null;
    rank: number;
}

export interface FeatureSuggestion {
    id: string;
    content: string;
    user_id: string | null;
    created_at: string;
}

export interface FeatureSuggestionWithVotes extends FeatureSuggestion {
    vote_count: number;
}

// Challenge / Fun Types
export type ChallengeStatus = 
    | 'pending' 
    | 'accepted' 
    | 'pending_confirmation' 
    | 'completed' 
    | 'rejected'
    | 'failed' 
    | 'cancelled' 
    | 'disputed';

export interface Challenge {
    id: string;
    created_at: string;
    updated_at: string;
    proposer_id: string;
    opponent_id: string;
    room_name?: string | null;
    stake_yuyu: number;
    challenge_text: string;
    preset_key?: string | null;
    is_custom: boolean;
    status: ChallengeStatus;
    resolved_by?: string | null;
    winner_id?: string | null;
    accepted_at?: string | null;
    resolved_at?: string | null;
    marked_complete_by?: string | null;
    marked_complete_at?: string | null;
    auto_resolved?: boolean;
    proposer_disconnected_at?: string | null;
    opponent_disconnected_at?: string | null;
}

export interface ChallengeEvent {
    id: string;
    created_at: string;
    challenge_id: string;
    actor_id?: string | null;
    event_type: string;
    details?: Record<string, unknown> | null;
}

// Referral Types
export interface Referral {
    id: string;
    referrer_id: string;
    referred_user_id: string;
    created_at: string;
    bonus_awarded: boolean;
}

// WebRTC Types
export interface PeerConnection {
    peer: any;
    stream?: MediaStream;
}

// Language Options
export const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'yo', name: 'Yorùbá' },
    { code: 'ig', name: 'Igbo' },
    { code: 'ha', name: 'Hausa' },
] as const;

// Currency Options — worldwide coverage (Africa, Asia, Europe, Americas)
export const CURRENCIES = [
    // Global / reference
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    // Europe
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
    { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
    { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
    { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
    { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
    { code: 'RSD', symbol: 'дин', name: 'Serbian Dinar' },
    { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'ISK', symbol: 'kr', name: 'Icelandic Krona' },
    // Africa
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
    { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
    { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
    { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
    { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
    { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
    { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
    { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
    { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar' },
    { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar' },
    { code: 'CDF', symbol: 'FC', name: 'Congolese Franc' },
    { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
    { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
    { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
    { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
    { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
    { code: 'SLL', symbol: 'Le', name: 'Sierra Leonean Leone' },
    { code: 'LRD', symbol: 'L$', name: 'Liberian Dollar' },
    { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi' },
    { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar' },
    { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
    { code: 'SDG', symbol: 'SDG', name: 'Sudanese Pound' },
    { code: 'LYD', symbol: 'LD', name: 'Libyan Dinar' },
    // Asia & Middle East
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
    { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee' },
    { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal' },
    { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
    { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar' },
    { code: 'OMR', symbol: 'OMR', name: 'Omani Rial' },
    { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar' },
    { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
    { code: 'IQD', symbol: 'ID', name: 'Iraqi Dinar' },
    // Americas & Oceania
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
    { code: 'CLP', symbol: 'CLP$', name: 'Chilean Peso' },
    { code: 'COP', symbol: 'COL$', name: 'Colombian Peso' },
    { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
    { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
    { code: 'BOB', symbol: 'Bs', name: 'Bolivian Boliviano' },
    { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
    { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
    { code: 'HTG', symbol: 'G', name: 'Haitian Gourde' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
] as const;


// Anonyomous Chat Types
export type MessageType = "TEXT" | "VOICE";

export interface Message {
  id: string;
  type: MessageType;
  text?: string;
  file_path?: string;
  signed_url?: string;
  created_at: string;
  upvotes?: number;
  is_published?: boolean;
  audio_url?: string;
  // Voice message statistics (real data from database)
  play_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  rating?: number;
  language?: string;
  duration?: number;
  is_trending?: boolean;
  is_editor_pick?: boolean;
  transcription?: string;
  category?: string;
}

export type LanguageCode = typeof LANGUAGES[number]['code'];
export type CurrencyCode = typeof CURRENCIES[number]['code'];

// Gift Types
export interface SendGiftPayload {
  toUserId:string;
  amount: number;
  itemName?: string;
}

export interface MarketplaceGift {
  id: string;
  name: string;
  amount: number;
  currency: string;
  stripe_price_id?: string | null;
  icon_key?: string | null;
}

// Subscription Types
export interface CreateSubscriptionPayload {
  plan: string;
  successUrl: string;
  cancelUrl: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: string;
  // other subscription properties should be added here
}

// Wallet Types
export interface TopUpPayload {
  amount: number;
}

export interface ConfirmTopUpPayload {
  paymentIntentId: string;
}

export interface WithdrawPayload {
  amount: number;
}

export interface WalletBalance {
  balance: number;
}

// Yuyu Types
export interface YuyuCoinsPackage {
  id: string;
  name: string;
  price_usd: number;
  yuyu_coins: number;
  stripe_price_id?: string | null;
  description?: string;
  icon_key?: string;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  bonus_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface YuyuCoinPurchase {
  id: string;
  user_id: string;
  package_id?: string;
  amount_usd: number;
  yuyu_coins: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  raw_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateCoinsPurchasePayload {
  packageId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CoinsBalance {
  yuyu_score: number;
  balance: number; // USD wallet
}
