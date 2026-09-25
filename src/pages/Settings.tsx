import React, { useState, useEffect } from 'react';
import { CausticsBackground } from "@/components/CausticsBackground";
import { useNavigate } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InnerCircleAccess } from '@/components/InnerCircleAccess';
import { LevelBadge } from '@/components/LevelBadge';
import { VerifiedBadge, shouldShowVerifiedBadge, VerifiedAvatarWrapper } from '@/components/VerifiedBadge';
import {
    User as UserIcon,
    Camera,
    Save,
    ArrowLeft,
    Eye,
    EyeOff,
    Globe,
    MapPin,
    Star,
    DollarSign,
    Gift,
    Calendar,
    Mail,
    Sparkles,
    Flame,
    Trophy,
    Award,
    Crown,
    Users,
    Volume2,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { LANGUAGES, type User } from '../types';
import { updateUser, getReferralCount } from '../services/supabaseService';
import { supabase } from '../config/supabase';
import { TABLES } from '../config/supabase';
import {
    getAchievements,
    getLevelInfo,
    getLevelUnlocks,
    getStreakLeaderboard,
    getUserAchievementIds,
    recoverStreak,
    type Achievement,
    type LevelUnlock,
    type StreakLeaderboardEntry
} from '../services/progressionService';
import { ProfilePictureUploadModal } from '@/components/ProfilePictureUploadModal';
import { getGreetingDailyLimit, setGreetingDailyLimit } from '@/components/VoiceGreeting';
import { deleteMyAccount } from '@/lib/account.functions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SettingsPageProps {
    user: User;
    onUserUpdate: (updates: Partial<User>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
    user,
    onUserUpdate
}) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: user.name,
        country: user.country,
        language: user.language,
        hide_picture: user.hide_picture
    });
    const [isLoading, setIsLoading] = useState(false);
    const [profilePictureModalOpen, setProfilePictureModalOpen] = useState(false);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userAchievementIds, setUserAchievementIds] = useState<string[]>([]);
    const [levelUnlocks, setLevelUnlocks] = useState<LevelUnlock[]>([]);
    const [streakLeaderboard, setStreakLeaderboard] = useState<StreakLeaderboardEntry[]>([]);
    const [isRecovering, setIsRecovering] = useState(false);
    const [isProgressLoading, setIsProgressLoading] = useState(false);
    const [inviteCount, setInviteCount] = useState<number>(0);
    const [greetingLimit, setGreetingLimit] = useState<number>(6);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        setGreetingLimit(getGreetingDailyLimit());
    }, []);

    const handleGreetingLimitChange = (value: number) => {
        setGreetingLimit(value);
        setGreetingDailyLimit(value);
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteMyAccount();
            await supabase.auth.signOut();
            try { window.localStorage.clear(); } catch { /* ignore */ }
            toast.success(t('settings.accountDeleted', 'Your account has been permanently deleted'));
            window.location.href = '/';
        } catch (error) {
            console.error('Account deletion failed:', error);
            const detail = error instanceof Error ? error.message : '';
            toast.error(
                detail
                    ? `Account deletion failed: ${detail}`
                    : t('settings.accountDeleteFailed', 'Account deletion failed. Please try again.')
            );
        } finally {
            setIsDeleting(false);
        }
    };

    // #region agent log
    // DEBUG: Log Settings user data to test H1, H2, H4
    React.useEffect(() => {
        fetch('http://127.0.0.1:7242/ingest/497fe2ca-80ca-4484-8aba-a7e390530a41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Settings.tsx:78',message:'Settings page user data',data:{userId:user.id,total_xp:user.total_xp,yuyu_score:user.yuyu_score,level:user.level,level_progress:user.level_progress},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H2,H4'})}).catch(()=>{});
    }, [user]);
    // #endregion

    // CRITICAL FIX: Only use total_xp, not yuyu_score (old data might be inconsistent)
    const xpTotal = user.total_xp ?? 0;
    const fallbackLevelInfo = getLevelInfo(xpTotal);
    // Always prefer database level over calculated level
    const level = user.level ?? fallbackLevelInfo.level;
    const levelProgress = user.level_progress ?? fallbackLevelInfo.progress;
    
    // #region agent log
    // DEBUG: Log Settings calculated values to test H1, H2
    React.useEffect(() => {
        fetch('http://127.0.0.1:7242/ingest/497fe2ca-80ca-4484-8aba-a7e390530a41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Settings.tsx:94',message:'Settings page calculated values',data:{xpTotal,fallbackLevel:fallbackLevelInfo.level,fallbackProgress:fallbackLevelInfo.progress,finalLevel:level,finalProgress:levelProgress},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H2'})}).catch(()=>{});
    }, [xpTotal, level, levelProgress]);
    // #endregion
    
    const xpToNext = fallbackLevelInfo.xpToNext;
    const streakCount = user.streak_count ?? 0;
    const streakLabel = streakCount > 0 ? t('settings.streakCount', { count: streakCount }) : t('settings.startStreakToday');

    const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = normalizeDate(new Date());
    const lastStreakDate = user.last_streak_date ? normalizeDate(new Date(user.last_streak_date)) : null;
    const daysSinceStreak = lastStreakDate ? Math.round((today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
    const streakAtRisk = streakCount > 0 && daysSinceStreak !== null && daysSinceStreak >= 1;
    const recoveryUsedToday = user.streak_recovery_used_at
        ? normalizeDate(new Date(user.streak_recovery_used_at)).getTime() === today.getTime()
        : false;
    const canRecoverStreak = streakAtRisk && daysSinceStreak === 2 && !recoveryUsedToday;

    const levelTitle = (currentLevel: number) => {
        if (currentLevel >= 100) return t('settings.levelTitleMaster');
        if (currentLevel >= 75) return t('settings.levelTitleChampion');
        if (currentLevel >= 50) return t('settings.levelTitleElite');
        if (currentLevel >= 25) return t('settings.levelTitleRisingStar');
        return t('settings.levelTitleBeginner');
    };

    useEffect(() => {
        setFormData({
            name: user.name,
            country: user.country,
            language: user.language,
            hide_picture: user.hide_picture
        });
    }, [user]);

    useEffect(() => {
        let cancelled = false;

        const loadProgress = async () => {
            setIsProgressLoading(true);
            const [allAchievements, unlockedIds, unlocks, leaderboard] = await Promise.all([
                getAchievements(),
                getUserAchievementIds(user.id),
                getLevelUnlocks(),
                getStreakLeaderboard(10)
            ]);

            if (cancelled) return;
            setAchievements(allAchievements);
            setUserAchievementIds(unlockedIds);
            setLevelUnlocks(unlocks);
            setStreakLeaderboard(leaderboard);
            setIsProgressLoading(false);
        };

        loadProgress();

        return () => {
            cancelled = true;
        };
    }, [user.id]);

    // People invited: fetch from backend and subscribe to realtime so count updates when a referred friend signs up
    useEffect(() => {
        if (!user?.id) return;

        const fetchCount = async () => {
            const count = await getReferralCount(user.id);
            setInviteCount(count);
        };
        fetchCount();

        const channel = supabase
            .channel(`settings-referrals:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: TABLES.REFERRALS,
                    filter: `referrer_id=eq.${user.id}`,
                },
                () => setInviteCount((prev) => prev + 1)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user.id]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            if (!formData.name.trim()) {
                toast.error(t('common.nameRequired'));
                return;
            }

            if (!formData.country.trim()) {
                toast.error(t('common.countryRequired'));
                return;
            }

            const updates = {
                name: formData.name.trim(),
                country: formData.country.trim(),
                language: formData.language,
                hide_picture: formData.hide_picture
            };

            const success = await updateUser(user.id, updates);

            if (success) {
                onUserUpdate(updates);
                // Persist language to i18n and localStorage so it stays when navigating (client feedback fix)
                if (updates.language) {
                    i18n.changeLanguage(updates.language);
                    try {
                        window.localStorage.setItem('audioChat_language', updates.language);
                    } catch {
                        // ignore
                    }
                }
                toast.success(t('common.settingsUpdated'));
            } else {
                toast.error(t('common.settingsUpdateFailed'));
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error(t('common.settingsUpdateError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecoverStreak = async () => {
        setIsRecovering(true);
        try {
            const result = await recoverStreak();
            if (!result) {
                toast.error(t('settings.streakRecoverFailed'));
                return;
            }

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            onUserUpdate({
                last_streak_date: result.last_streak_date || undefined,
                streak_recovery_used_at: result.streak_recovery_used_at || undefined
            });
            toast.success(t('settings.streakRecovered'));
        } catch (error) {
            console.error('Error recovering streak:', error);
            toast.error(t('settings.streakRecoverError'));
        } finally {
            setIsRecovering(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <CausticsBackground />
            <div className="min-h-screen w-full overflow-x-hidden relative z-10">
                {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-2xl shadow-2xl">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 hover:bg-white/10 transition-all duration-200 group"
                            aria-label={t('common.back')}
                        >
                            <ArrowLeft className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="relative group animate-fade-in">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-fuchsia-500 to-indigo-600 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
                            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 bg-white/0 overflow-hidden">
                                <img src="/logo.webp" alt={t('common.logoAlt')} className="w-8 h-8 object-contain" />
                            </div>
                        </div>
                        <div className="ml-1">
                            <h1 className="text-lg font-black bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent tracking-tight">{t('settings.header')}</h1>
                            <p className="text-xs text-violet-200/70 font-medium">{t('settings.manageProfile')}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
                <div className="space-y-6">
                    {/* Brand voice frequency — highlighted control */}
                    <div className="relative">
                        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-lg opacity-70 animate-pulse" aria-hidden />
                        <div className="relative bg-black/70 backdrop-blur-xl rounded-2xl p-6 border border-violet-300/30 shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-600 flex items-center justify-center shadow-lg">
                                    <Volume2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">
                                        {t('settings.voiceGreetingTitle', '“Hey, you are unique” voice')}
                                    </h2>
                                    <p className="text-xs text-violet-200/80">
                                        {t('settings.voiceGreetingDesc', 'How many times a day you want to hear it (0 = off)')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min={0}
                                    max={8}
                                    step={1}
                                    value={greetingLimit}
                                    onChange={(e) => handleGreetingLimitChange(Number(e.target.value))}
                                    className="flex-1 accent-fuchsia-500 cursor-pointer"
                                    aria-label={t('settings.voiceGreetingTitle', 'Voice greeting frequency')}
                                />
                                <span className="min-w-[3.5rem] text-center text-xl font-black text-fuchsia-200">
                                    {greetingLimit}×
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Header Card */}
                    <div className="bg-gradient-to-br from-white/10 to-white/[0.04] backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/15">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <VerifiedAvatarWrapper
                                    isVerified={shouldShowVerifiedBadge(user)}
                                    subscriptionType={user.subscription_type}
                                    size="xl"
                                >
                                    <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-2 ring-white/20 shadow-xl">
                                        <AvatarImage src={user.profile_picture || ''} alt={user.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-xl font-bold">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </VerifiedAvatarWrapper>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-2xl md:text-3xl font-black text-white">{user.name}</h2>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30">
                                            <LevelBadge level={level} size="sm" />
                                            <span className="text-sm font-bold text-indigo-200">{t('settings.levelShort')} {level}</span>
                                        </div>
                                        {shouldShowVerifiedBadge(user) && (
                                            <VerifiedBadge 
                                                subscriptionType={user.subscription_type}
                                                isPremium={user.is_premium}
                                                size="sm"
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-orange-200">
                                        <Flame className="h-4 w-4 text-orange-400" />
                                        <span className="font-semibold">{streakLabel}</span>
                                    </div>
                                    <p className="text-xs text-violet-200/70 mt-2">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex-1 max-w-md">
                                <div className="flex items-center justify-between text-xs text-violet-200/70 mb-2">
                                    <span>{t('settings.progressToNext')}</span>
                                    <span>{level >= 100 ? t('settings.maxLevel') : t('settings.xpToGo', { xpToNext })}</span>
                                </div>
                                <Progress value={levelProgress} className="h-2 bg-white/10" />
                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                    {user.subscription_type === "lifetime" && (
                                        <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black border border-yellow-200 text-[11px] px-2 py-1 animate-pulse">
                                            ✨ {t('settings.foundingMember')}
                                        </Badge>
                                    )}
                                    {achievements
                                        .filter((achievement) => userAchievementIds.includes(achievement.id))
                                        .slice(0, 5)
                                        .map((achievement) => (
                                            <Badge
                                                key={achievement.id}
                                                className="bg-white/10 text-white border border-white/20 text-[11px] px-2 py-1"
                                            >
                                                <span className="mr-1">{achievement.icon}</span>
                                                {achievement.name}
                                            </Badge>
                                        ))}
                                    {achievements.filter((achievement) => userAchievementIds.includes(achievement.id)).length === 0 && (
                                        <span className="text-xs text-violet-200/70">{t('settings.noBadgesYet')}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inner Circle Access for Lifetime Members */}
                    {user.subscription_type === "lifetime" && (
                        <InnerCircleAccess userName={user.name} />
                    )}

                    {/* Profile picture – upload/change via dedicated modal with crop */}
                    <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-7 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-fuchsia-600 rounded-xl blur-md opacity-50"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-br from-violet-400 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{t('settings.profilePicture')}</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="flex items-center gap-4">
                                <VerifiedAvatarWrapper
                                    isVerified={shouldShowVerifiedBadge(user)}
                                    subscriptionType={user.subscription_type}
                                    size="xl"
                                >
                                    <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-2 ring-white/20 shadow-xl">
                                        <AvatarImage src={user.profile_picture || ''} alt={user.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-2xl font-bold">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </VerifiedAvatarWrapper>
                                <div className="space-y-2">
                                    <Button
                                        type="button"
                                        onClick={() => setProfilePictureModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg border border-white/10"
                                    >
                                        <Camera className="h-4 w-4" />
                                        {user.profile_picture ? t('settings.changePhoto') : t('settings.uploadPhoto')}
                                    </Button>
                                    <p className="text-xs text-violet-200/70">{t('settings.profilePictureHint')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ProfilePictureUploadModal
                        isOpen={profilePictureModalOpen}
                        onClose={() => setProfilePictureModalOpen(false)}
                        user={user}
                        onUserUpdate={onUserUpdate}
                    />

                    {/* Personal Information */}
                    <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-7 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-fuchsia-600 rounded-xl blur-md opacity-50"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-br from-violet-400 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <UserIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{t('settings.personalInformation')}</h2>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-violet-100">{t('settings.labels.displayName')}</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder={t('settings.labels.yourNamePlaceholder')}
                                        className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-violet-200/40 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-violet-100">{t('settings.labels.email')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            value={user.email}
                                            disabled
                                            className="h-11 bg-white/[0.02] border border-white/5 text-violet-200/50 pr-10 rounded-xl"
                                        />
                                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-violet-200/40" />
                                    </div>
                                    <p className="text-xs text-violet-200/50">{t('settings.labels.emailCannotChange')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="country" className="text-sm font-medium text-violet-100">{t('settings.labels.country')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="country"
                                            value={formData.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            placeholder={t('settings.labels.yourCountryPlaceholder')}
                                            className="h-11 pl-10 bg-white/5 border border-white/10 text-white placeholder:text-violet-200/40 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all rounded-xl"
                                        />
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-violet-200/40" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language" className="text-sm font-medium text-violet-100">{t('settings.labels.language')}</Label>
                                    <Select
                                        value={formData.language}
                                        onValueChange={(value) => handleInputChange('language', value)}
                                    >
                                        <SelectTrigger className="h-11 bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-400 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-violet-200/40" />
                                                <SelectValue placeholder={t('settings.labels.selectLanguage')} />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border border-white/10 backdrop-blur-xl">
                                            {LANGUAGES.map((lang) => (
                                                <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-white/10 focus:bg-white/10">
                                                    {lang.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Statistics */}
                    <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-7 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl blur-md opacity-50"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Star className="w-6 h-6 text-white" strokeWidth={2.5} fill="white" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{t('settings.accountStatistics')}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-600/5 backdrop-blur-sm rounded-xl p-5 border border-violet-400/20 hover:border-violet-400/40 transition-all group">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                                    <span className="text-xs font-semibold text-violet-100 uppercase tracking-wide">{t('settings.yuyuScore')}</span>
                                </div>
                                <div className="text-3xl font-black text-center bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                                    {user.yuyu_score.toLocaleString()}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-xl p-5 border border-green-400/20 hover:border-green-400/40 transition-all group">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <DollarSign className="h-5 w-5 text-green-400" />
                                    <span className="text-xs font-semibold text-violet-100 uppercase tracking-wide">{t('settings.balance')}</span>
                                </div>
                                <div className="text-3xl font-black text-center bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                                    ${user.balance.toFixed(3)}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl p-5 border border-purple-400/20 hover:border-purple-400/40 transition-all group">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Gift className="h-5 w-5 text-purple-400" />
                                    <span className="text-xs font-semibold text-violet-100 uppercase tracking-wide">{t('settings.referralCode')}</span>
                                </div>
                                <div className="flex justify-center">
                                    <Badge className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-sm font-mono px-3 py-1">
                                        {user.referral_code}
                                    </Badge>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm rounded-xl p-5 border border-emerald-400/20 hover:border-emerald-400/40 transition-all group">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Users className="h-5 w-5 text-emerald-400" />
                                    <span className="text-xs font-semibold text-violet-100 uppercase tracking-wide">{t('settings.peopleInvited', 'People invited')}</span>
                                </div>
                                <div className="text-3xl font-black text-center bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                                    {inviteCount}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-sm rounded-xl p-5 border border-indigo-400/20 hover:border-indigo-400/40 transition-all group">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Calendar className="h-5 w-5 text-indigo-400" />
                                    <span className="text-xs font-semibold text-violet-100 uppercase tracking-wide">{t('settings.memberSince')}</span>
                                </div>
                                <div className="text-sm font-bold text-center text-indigo-200">
                                    {formatDate(user.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Tracking */}
                    <div className="bg-gradient-to-br from-white/8 to-white/[0.02] backdrop-blur-xl rounded-2xl p-7 shadow-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-600 rounded-xl blur-md opacity-50"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">{t('settings.progressTracking')}</h2>
                                <p className="text-xs text-violet-200/70">{t('settings.progressTrackingDesc')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm rounded-xl p-5 border border-orange-400/20 hover:border-orange-400/40 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Flame className="h-5 w-5 text-orange-400" />
                                        <span className="text-xs font-semibold text-violet-100 uppercase tracking-wide">{t('settings.dailyStreak')}</span>
                                    </div>
                                    {streakAtRisk && (
                                        <Badge className="bg-red-500/10 text-red-300 border border-red-400/40 text-[10px]">
                                            {t('settings.atRisk')}
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-4 text-3xl font-black text-orange-200">
                                    {t('settings.streakCount', { count: streakCount })}
                                </div>
                                <p className="text-xs text-violet-200/70 mt-2">
                                    {lastStreakDate ? t('settings.lastActivity', { date: lastStreakDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }) : t('settings.startStreakToday')}
                                </p>
                                {canRecoverStreak && (
                                    <div className="mt-4">
                                        <Button
                                            onClick={handleRecoverStreak}
                                            disabled={isRecovering}
                                            className="h-9 bg-orange-500/90 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg"
                                        >
                                            {isRecovering ? t('settings.recovering') : t('settings.watchAdRecover')}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 backdrop-blur-sm rounded-xl p-5 border border-indigo-400/20 hover:border-indigo-400/40 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-indigo-300" />
                                        <span className="text-xs font-semibold text-violet-100 uppercase tracking-wide">{t('settings.levelLabel')}</span>
                                    </div>
                                    <Badge className="bg-indigo-500/10 text-indigo-200 border border-indigo-400/30 text-[10px]">
                                        {levelTitle(level)}
                                    </Badge>
                                </div>
                                <div className="mt-4 text-3xl font-black text-indigo-200">
                                    {t('settings.levelLabel')} {level}
                                </div>
                                <div className="mt-3">
                                    <Progress value={levelProgress} className="h-2 bg-white/10" />
                                    <div className="flex justify-between text-[11px] text-violet-200/70 mt-2">
                                        <span>{t('settings.levelProgress', { percent: levelProgress })}</span>
                                        <span>{level >= 100 ? t('settings.maxLevel') : t('settings.xpToGo', { xpToNext })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-xl p-5 border border-violet-400/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Trophy className="h-5 w-5 text-violet-300" />
                                    <h3 className="text-sm font-semibold text-violet-100 uppercase tracking-wide">{t('settings.achievements')}</h3>
                                </div>
                                {isProgressLoading ? (
                                    <p className="text-xs text-violet-200/70">{t('settings.loadingAchievements')}</p>
                                ) : achievements.length === 0 ? (
                                    <p className="text-xs text-violet-200/70">{t('settings.noAchievements')}</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {achievements.map((achievement) => {
                                            const unlocked = userAchievementIds.includes(achievement.id);
                                            return (
                                                <div
                                                    key={achievement.id}
                                                    className={`rounded-lg p-3 border transition-all ${
                                                        unlocked
                                                            ? 'bg-white/10 border-violet-400/40'
                                                            : 'bg-white/5 border-white/10 opacity-70'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{achievement.icon}</span>
                                                        <div>
                                                            <p className="text-xs font-semibold text-white">{achievement.name}</p>
                                                            <p className="text-[10px] text-violet-200/70">{achievement.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-5 border border-emerald-400/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Crown className="h-5 w-5 text-emerald-300" />
                                    <h3 className="text-sm font-semibold text-violet-100 uppercase tracking-wide">{t('settings.unlockedFeatures')}</h3>
                                </div>
                                {isProgressLoading ? (
                                    <p className="text-xs text-violet-200/70">{t('settings.loadingUnlocks')}</p>
                                ) : levelUnlocks.length === 0 ? (
                                    <p className="text-xs text-violet-200/70">{t('settings.noUnlocks')}</p>
                                ) : (
                                    <div className="space-y-3">
                                        {levelUnlocks.map((unlock) => {
                                            const unlocked = level >= unlock.level_required;
                                            return (
                                                <div
                                                    key={unlock.id}
                                                    className={`rounded-lg p-3 border transition-all ${
                                                        unlocked
                                                            ? 'bg-emerald-500/10 border-emerald-400/40'
                                                            : 'bg-white/5 border-white/10 opacity-70'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-semibold text-white">{unlock.title}</p>
                                                            <p className="text-[10px] text-violet-200/70">{unlock.description}</p>
                                                        </div>
                                                        <Badge className="bg-emerald-500/10 text-emerald-200 border border-emerald-400/30 text-[10px]">
                                                            {t('settings.levelShort')} {unlock.level_required}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 bg-gradient-to-br from-violet-500/10 to-fuchsia-600/5 rounded-xl p-5 border border-violet-400/20">
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="h-5 w-5 text-fuchsia-300" />
                                <h3 className="text-sm font-semibold text-violet-100 uppercase tracking-wide">{t('settings.longestStreaks')}</h3>
                            </div>
                            {isProgressLoading ? (
                                <p className="text-xs text-violet-200/70">{t('settings.loadingLeaderboard')}</p>
                            ) : streakLeaderboard.length === 0 ? (
                                <p className="text-xs text-violet-200/70">{t('settings.noStreaks')}</p>
                            ) : (
                                <div className="space-y-2">
                                    {streakLeaderboard.map((entry, index) => (
                                        <div
                                            key={entry.user_id}
                                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-violet-500/10 text-violet-200 border border-violet-400/30 text-[10px]">
                                                    #{index + 1}
                                                </Badge>
                                                <div>
                                                    <p className="text-xs font-semibold text-white">
                                                        {entry.hide_picture ? t('common.anonymous') : entry.name}
                                                    </p>
                                                    <p className="text-[10px] text-violet-200/60">{t('settings.levelN', { n: entry.level })}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs font-semibold text-violet-200">
                                                {t('settings.days', { count: entry.streak_count })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Danger zone — permanent account deletion */}
                    <div className="bg-red-950/40 backdrop-blur-xl rounded-2xl p-7 shadow-xl border border-red-500/40">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg">
                                <Trash2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-red-200 tracking-tight">
                                    {t('settings.deleteAccountTitle', 'Delete my account')}
                                </h2>
                                <p className="text-xs text-red-200/70">
                                    {t('settings.deleteAccountDesc', 'This permanently erases your profile, balance and history. It cannot be undone.')}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={() => setDeleteDialogOpen(true)}
                                disabled={isDeleting}
                                className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-40"
                            >
                                {isDeleting
                                    ? t('settings.deleting', 'Deleting…')
                                    : t('settings.deleteAccountButton', 'Delete account permanently')}
                            </Button>
                        </div>
                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogContent className="max-w-sm border-red-500/40 bg-zinc-950 text-white">
                                <DialogHeader>
                                    <DialogTitle className="text-red-300">{t('settings.deleteAccountTitle', 'Delete my account')}?</DialogTitle>
                                    <DialogDescription className="text-zinc-300">
                                        {t('settings.deleteAccountConfirm', 'Your account and personal data will be permanently deleted. This cannot be undone.')}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-3 pt-3">
                                    <Button variant="outline" className="flex-1 border-white/20 bg-transparent text-white" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                                        {t('common.no', 'No')}
                                    </Button>
                                    <Button className="flex-1 bg-red-600 font-bold text-white hover:bg-red-700" onClick={handleDeleteAccount} disabled={isDeleting}>
                                        {isDeleting ? t('settings.deleting', 'Deleting…') : t('common.yes', 'Yes, delete')}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-center pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="h-12 px-8 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {t('settings.saving')}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        {t('settings.saveButton')}
                                    </div>
                                )}
                        </Button>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};