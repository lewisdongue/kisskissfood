import React, { useMemo } from 'react';
import type { LeaderboardEntry } from '../types';
import { useLeaderboardCache } from '../hooks/useLeaderboardCache';
import { useTranslation } from 'react-i18next';

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS — Medals (Top 3 rewards) + UI
   ═══════════════════════════════════════════════════════════════ */

/** 1st place: gold medal with ribbon */
const GoldMedalIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 32 }) => (
    <svg className={className} viewBox="0 0 48 56" width={size} height={size} fill="none">
        <defs>
            <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="25%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="75%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <filter id="goldGlow">
                <feGaussianBlur stdDeviation="0.5" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <path d="M24 4L28 12h8l-6 6 2 10-8-6-8 6 2-10-6-6h8L24 4z" fill="url(#goldShine)" filter="url(#goldGlow)" stroke="#B45309" strokeWidth="0.8" strokeLinejoin="round" />
        <circle cx="24" cy="22" r="10" fill="url(#goldShine)" stroke="#B45309" strokeWidth="0.8" />
        <text x="24" y="26" textAnchor="middle" fontWeight="900" fontSize="14" fill="#78350F" fontFamily="system-ui,sans-serif">1</text>
        <path d="M20 44v8h8v-8l-2 4-2-4-2 4z" fill="url(#goldRibbon)" />
        <path d="M24 44v6" stroke="#92400E" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

/** 2nd place: silver medal with ribbon */
const SilverMedalIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 32 }) => (
    <svg className={className} viewBox="0 0 48 56" width={size} height={size} fill="none">
        <defs>
            <linearGradient id="silverShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="40%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="silverRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
        </defs>
        <path d="M24 4L28 12h8l-6 6 2 10-8-6-8 6 2-10-6-6h8L24 4z" fill="url(#silverShine)" stroke="#64748B" strokeWidth="0.8" strokeLinejoin="round" />
        <circle cx="24" cy="22" r="10" fill="url(#silverShine)" stroke="#64748B" strokeWidth="0.8" />
        <text x="24" y="26" textAnchor="middle" fontWeight="900" fontSize="14" fill="#334155" fontFamily="system-ui,sans-serif">2</text>
        <path d="M20 44v8h8v-8l-2 4-2-4-2 4z" fill="url(#silverRibbon)" />
        <path d="M24 44v6" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

/** 3rd place: bronze medal with ribbon */
const BronzeMedalIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 32 }) => (
    <svg className={className} viewBox="0 0 48 56" width={size} height={size} fill="none">
        <defs>
            <linearGradient id="bronzeShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="35%" stopColor="#FDBA74" />
                <stop offset="65%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id="bronzeRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>
        </defs>
        <path d="M24 4L28 12h8l-6 6 2 10-8-6-8 6 2-10-6-6h8L24 4z" fill="url(#bronzeShine)" stroke="#9A3412" strokeWidth="0.8" strokeLinejoin="round" />
        <circle cx="24" cy="22" r="10" fill="url(#bronzeShine)" stroke="#9A3412" strokeWidth="0.8" />
        <text x="24" y="26" textAnchor="middle" fontWeight="900" fontSize="14" fill="#431407" fontFamily="system-ui,sans-serif">3</text>
        <path d="M20 44v8h8v-8l-2 4-2-4-2 4z" fill="url(#bronzeRibbon)" />
        <path d="M24 44v6" stroke="#7C2D12" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 16L3 5l5.5 5L12 2l3.5 8L21 5l-2 11H5zm-1 3h16v2H4v-2z" />
    </svg>
);

const CoinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10.5" fill="url(#coinG)" stroke="#B45309" strokeWidth="1" />
        <circle cx="12" cy="12" r="7.5" stroke="#92400E" strokeWidth="0.6" fill="none" opacity="0.35" />
        <text x="12" y="16.5" textAnchor="middle" fontWeight="900" fontSize="12" fill="#78350F" fontFamily="system-ui">Y</text>
        <defs>
            <linearGradient id="coinG" x1="12" y1="1" x2="12" y2="23">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
        </defs>
    </svg>
);

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15c-3.314 0-6-2.686-6-6V3h12v6c0 3.314-2.686 6-6 6z" />
        <path d="M6 3H3v3a3 3 0 003 3M18 3h3v3a3 3 0 01-3 3M12 15v3m-4 3h8m-4-3l-4 3m4-3l4 3" />
    </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const FlameIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 5 8 5 14a7 7 0 0014 0c0-6-7-12-7-12z" fill="url(#flG)" />
        <path d="M12 10c0 0-3 2.5-3 5a3 3 0 006 0c0-2.5-3-5-3-5z" fill="#FCD34D" />
        <defs>
            <linearGradient id="flG" x1="12" y1="2" x2="12" y2="21">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="1" stopColor="#DC2626" />
            </linearGradient>
        </defs>
    </svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

/* ═══════════════════════════════════════════════════════════════
   RANK BADGE
   ═══════════════════════════════════════════════════════════════ */

const rankConfig: Record<number, {
    bg: string; text: string; shadow: string; ring: string; glow: string;
}> = {
    1: {
        bg: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500',
        text: 'text-yellow-900', shadow: 'shadow-md shadow-yellow-500/30',
        ring: 'ring-2 ring-yellow-300/40',
        glow: 'after:absolute after:inset-0 after:rounded-lg after:bg-yellow-400/20 after:blur-md after:-z-10',
    },
    2: {
        bg: 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400',
        text: 'text-slate-700', shadow: 'shadow-md shadow-slate-400/20',
        ring: 'ring-2 ring-slate-300/40',
        glow: 'after:absolute after:inset-0 after:rounded-lg after:bg-slate-300/15 after:blur-md after:-z-10',
    },
    3: {
        bg: 'bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500',
        text: 'text-orange-900', shadow: 'shadow-md shadow-orange-500/25',
        ring: 'ring-2 ring-amber-400/40',
        glow: 'after:absolute after:inset-0 after:rounded-lg after:bg-orange-400/15 after:blur-md after:-z-10',
    },
};

const MedalOrBadge: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) return <GoldMedalIcon className="shrink-0" size={36} />;
    if (rank === 2) return <SilverMedalIcon className="shrink-0" size={34} />;
    if (rank === 3) return <BronzeMedalIcon className="shrink-0" size={34} />;
    return (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-white/30 tabular-nums">{rank}</span>
        </div>
    );
};

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
    const cfg = rankConfig[rank];
    if (cfg) {
        return (
            <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${cfg.bg} ${cfg.shadow} ${cfg.ring} ${cfg.glow} flex items-center justify-center shrink-0`}>
                <span className={`text-[11px] sm:text-xs font-black ${cfg.text} drop-shadow-sm`}>{rank}</span>
            </div>
        );
    }
    return (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-white/30 tabular-nums">{rank}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   AVATAR
   ═══════════════════════════════════════════════════════════════ */

const avatarGradient: Record<number, string> = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-amber-400 to-orange-500',
};

const Avatar: React.FC<{ name: string; rank: number; profilePicture?: string | null }> = ({ name, rank, profilePicture }) => {
    const gradient = avatarGradient[rank];
    const letter = name.charAt(0).toUpperCase();
    const showImage = profilePicture && profilePicture.trim() !== '';

    const wrapperClass = gradient
        ? `relative shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-br ${gradient}`
        : 'shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.06] border border-white/[0.10]';

    if (showImage) {
        return (
            <div className={`${wrapperClass} overflow-hidden`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                    <img
                        src={profilePicture}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        );
    }

    if (gradient) {
        return (
            <div className={wrapperClass}>
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-bold text-white">{letter}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={wrapperClass + ' flex items-center justify-center'}>
            <span className="text-xs sm:text-sm font-semibold text-white/40">{letter}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   SCORE PILL
   ═══════════════════════════════════════════════════════════════ */

const scorePillBg: Record<number, string> = {
    1: 'bg-yellow-500/15 border-yellow-400/20 text-yellow-300',
    2: 'bg-slate-400/10 border-slate-400/15 text-slate-200',
    3: 'bg-amber-500/12 border-amber-500/15 text-amber-300',
};

/** Compact format for large numbers to prevent overflow on mobile */
const formatCompactNumber = (value: number): string => {
    if (value >= 1_000_000_000) {
        const formatted = (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
        return `${formatted}B`;
    }
    if (value >= 1_000_000) {
        const formatted = (value / 1_000_000).toFixed(1).replace(/\.0$/, '');
        return `${formatted}M`;
    }
    if (value >= 1_000) {
        const formatted = (value / 1_000).toFixed(1).replace(/\.0$/, '');
        return `${formatted}K`;
    }
    return value.toLocaleString();
};

const ScorePill: React.FC<{ score: number; rank: number }> = ({ score, rank }) => {
    const style = scorePillBg[rank] ?? 'bg-white/[0.04] border-white/[0.08] text-yellow-300/70';
    const displayScore = score >= 1000 ? formatCompactNumber(score) : score.toLocaleString();
    return (
        <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border shrink-0 min-w-0 max-w-full ${style}`}>
            <CoinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="text-[12px] sm:text-[13px] font-extrabold tabular-nums truncate">{displayScore}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */

const barColor: Record<number, string> = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-amber-400 to-orange-500',
};

const ProgressBar: React.FC<{ percentage: number; rank: number }> = ({ percentage, rank }) => {
    const gradient = barColor[rank] ?? 'from-blue-400/60 to-indigo-400/60';
    return (
        <div className="w-full h-[3px] sm:h-1 rounded-full bg-white/[0.05] overflow-hidden">
            <div
                className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
                style={{ width: `${Math.max(percentage, 3)}%` }}
            />
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   CHAMPION ROW (Top 3)
   ═══════════════════════════════════════════════════════════════ */

const championRowBg: Record<number, string> = {
    1: 'bg-gradient-to-r from-yellow-500/[0.08] via-yellow-500/[0.03] to-transparent hover:from-yellow-500/[0.12] hover:via-yellow-500/[0.05]',
    2: 'bg-gradient-to-r from-slate-400/[0.06] via-slate-400/[0.02] to-transparent hover:from-slate-400/[0.09] hover:via-slate-400/[0.04]',
    3: 'bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent hover:from-amber-500/[0.09] hover:via-amber-500/[0.04]',
};

const championBorder: Record<number, string> = {
    1: 'border-l-[3px] border-l-yellow-400',
    2: 'border-l-[3px] border-l-slate-400',
    3: 'border-l-[3px] border-l-amber-500',
};

const ChampionRow: React.FC<{ entry: LeaderboardEntry; topScore: number }> = ({ entry, topScore }) => {
    const pct = topScore > 0 ? (entry.yuyu_score / topScore) * 100 : 0;

    return (
        <div className={`
            ${championRowBg[entry.rank]} ${championBorder[entry.rank]}
            px-3 sm:px-5 py-3 sm:py-3.5 transition-all duration-300 group cursor-default min-w-0 overflow-hidden
        `}>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <MedalOrBadge rank={entry.rank} />
                <Avatar name={entry.name} rank={entry.rank} profilePicture={entry.hide_picture ? null : entry.profile_picture} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-[13px] sm:text-sm font-bold text-white truncate">
                            {entry.name}
                        </p>
                        {entry.rank === 1 && (
                            <CrownIcon className="w-4 h-4 text-yellow-400 shrink-0 animate-pulse" aria-hidden />
                        )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-white/35 truncate mt-0.5">{entry.country}</p>
                </div>

                <ScorePill score={entry.yuyu_score} rank={entry.rank} />
            </div>

            <div className="mt-2 ml-[46px] sm:ml-[54px]">
                <ProgressBar percentage={pct} rank={entry.rank} />
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   REGULAR ROW (Rank 4+)
   ═══════════════════════════════════════════════════════════════ */

const RegularRow: React.FC<{ entry: LeaderboardEntry; topScore: number; index: number }> = ({ entry, topScore, index }) => {
    const pct = topScore > 0 ? (entry.yuyu_score / topScore) * 100 : 0;
    const isEven = index % 2 === 0;

    return (
        <div className={`
            px-3 sm:px-5 py-2 sm:py-2.5
            border-l-[3px] border-l-transparent
            ${isEven ? 'bg-white/[0.015]' : 'bg-transparent'}
            hover:bg-white/[0.05] transition-all duration-200 group cursor-default min-w-0 overflow-hidden
        `}>
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <RankBadge rank={entry.rank} />
                <Avatar name={entry.name} rank={entry.rank} profilePicture={entry.hide_picture ? null : entry.profile_picture} />

                <div className="flex-1 min-w-0">
                    <p className="text-[12px] sm:text-[13px] font-semibold text-white/75 group-hover:text-white truncate transition-colors">
                        {entry.name}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-white/25 truncate">{entry.country}</p>
                </div>

                <ScorePill score={entry.yuyu_score} rank={entry.rank} />
            </div>

            <div className="mt-1.5 ml-[38px] sm:ml-[44px] opacity-30 group-hover:opacity-60 transition-opacity">
                <ProgressBar percentage={pct} rank={entry.rank} />
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════ */

const SectionHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accentColor: string;
}> = ({ icon, title, subtitle, accentColor }) => (
    <div className={`flex items-center gap-2.5 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r ${accentColor}`}>
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.08]">
            {icon}
        </div>
        <p className="text-[11px] sm:text-xs font-bold text-white/70 uppercase tracking-wider flex-1">{title}</p>
        <span className="text-[9px] sm:text-[11px] text-white/25 font-medium">{subtitle}</span>
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   STATS BAR
   ═══════════════════════════════════════════════════════════════ */

const StatsBar: React.FC<{ entries: LeaderboardEntry[]; t: (key: string) => string }> = ({ entries, t }) => {
    const totalCoins = entries.reduce((sum, e) => sum + e.yuyu_score, 0);
    const topScore = entries.length > 0 ? entries[0].yuyu_score : 0;

    const stats = [
        { icon: <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />, value: entries.length, label: t('leaderboard.players'), color: 'text-white' },
        { icon: <FlameIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />, value: topScore, label: t('leaderboard.topScore'), color: 'text-yellow-300' },
        { icon: <CoinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />, value: totalCoins, label: t('leaderboard.totalYuyu'), color: 'text-amber-300' },
    ];

    return (
        <div className="grid grid-cols-3 bg-gradient-to-b from-white/[0.04] to-transparent min-w-0">
            {stats.map((stat, i) => (
                <div key={i} className={`px-3 sm:px-5 py-4 sm:py-5 text-center min-w-0 overflow-hidden ${i < 2 ? 'border-r border-white/[0.08]' : ''}`}>
                    <div className="flex items-center justify-center mb-2 text-white/50">
                        {stat.icon}
                    </div>
                    <p className={`text-lg sm:text-xl md:text-2xl font-black tabular-nums truncate ${stat.color}`} title={stat.value.toLocaleString()}>
                        {stat.value >= 1000 ? formatCompactNumber(stat.value) : stat.value.toLocaleString()}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-white/35 font-semibold uppercase tracking-wider mt-1 truncate">
                        {stat.label}
                    </p>
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export const YUYULeaderboard: React.FC = () => {
    const { t } = useTranslation();
    const { leaderboard, loading, lastUpdated, isRefreshing } = useLeaderboardCache();

    const topScore = useMemo(() => leaderboard.length > 0 ? leaderboard[0].yuyu_score : 0, [leaderboard]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-14 sm:py-16 gap-3">
                <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-[3px] border-yellow-500/15 border-t-yellow-400 rounded-full animate-spin" />
                    <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-xs text-white/30 animate-pulse">{t('leaderboard.loadingRankings')}</p>
            </div>
        );
    }

    if (leaderboard.length === 0) {
        return (
            <div className="text-center py-14 sm:py-16 px-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <TrophyIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white/15" />
                </div>
                <p className="text-sm text-white/40 font-semibold">{t('leaderboard.noData')}</p>
                <p className="text-xs text-white/20 mt-1.5 max-w-xs mx-auto">
                    {t('leaderboard.startEarning')}
                </p>
            </div>
        );
    }

    const champions = leaderboard.filter(e => e.rank <= 3);
    const contenders = leaderboard.filter(e => e.rank > 3);
    const VISIBLE_ROWS = 8;
    const ROW_HEIGHT_PX = 52;
    const SECTION_HEADER_PX = 40;
    const hasContenders = contenders.length > 0;
    const scrollMaxHeight = SECTION_HEADER_PX + VISIBLE_ROWS * ROW_HEIGHT_PX;

    return (
        <div className="w-full min-w-0 flex flex-col">
            {/* ═══ FIXED: Stats + Top 3 (never scroll away) ═══ */}
            <div className="shrink-0">
                <StatsBar entries={leaderboard} t={t} />

                <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

                {/* Champions (Top 3) — medals + fixed position */}
                {champions.length > 0 && (
                    <div>
                        <SectionHeader
                            icon={<CrownIcon className="w-3.5 h-3.5 text-yellow-400" />}
                            title={t('leaderboard.champions')}
                            subtitle={t('leaderboard.top3')}
                            accentColor="from-yellow-500/[0.06] via-yellow-500/[0.02] to-transparent"
                        />
                        {/* Podium strip: 1st · 2nd · 3rd */}
                        <div className="flex items-end justify-center gap-4 sm:gap-8 px-4 py-3 bg-gradient-to-b from-amber-500/[0.04] to-transparent border-b border-white/[0.04]">
                            <div className="flex flex-col items-center gap-1">
                                <SilverMedalIcon size={28} />
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">2nd</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 -mt-2">
                                <GoldMedalIcon size={36} />
                                <span className="text-[9px] font-bold text-yellow-400/80 uppercase tracking-wider">1st</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <BronzeMedalIcon size={28} />
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">3rd</span>
                            </div>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                            {champions.map(entry => (
                                <ChampionRow key={entry.id} entry={entry} topScore={topScore} />
                            ))}
                        </div>
                    </div>
                )}

                {hasContenders && (
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                )}
            </div>

            {/* ═══ SCROLLABLE: Contenders only (rank 4+) ═══ */}
            {hasContenders && (
                <div
                    className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
                    style={{ maxHeight: scrollMaxHeight }}
                    data-scrollbar-visible="true"
                >
                    <style>{`
                        [data-scrollbar-visible="true"] {
                            scrollbar-width: auto;
                            scrollbar-gutter: stable;
                        }
                        [data-scrollbar-visible="true"]::-webkit-scrollbar {
                            width: 12px;
                        }
                        [data-scrollbar-visible="true"]::-webkit-scrollbar-track {
                            background: rgba(255,255,255,0.05);
                            border-radius: 6px;
                        }
                        [data-scrollbar-visible="true"]::-webkit-scrollbar-thumb {
                            background: rgba(251, 191, 36, 0.5);
                            border-radius: 6px;
                            min-height: 48px;
                        }
                        [data-scrollbar-visible="true"]::-webkit-scrollbar-thumb:hover {
                            background: rgba(251, 191, 36, 0.7);
                        }
                    `}</style>
                    <SectionHeader
                        icon={<BoltIcon className="w-3 h-3 text-blue-400" />}
                        title={t('leaderboard.contenders')}
                        subtitle={`${contenders.length} ${contenders.length !== 1 ? t('leaderboard.players_plural') : t('leaderboard.player')}`}
                        accentColor="from-blue-500/[0.04] via-blue-500/[0.01] to-transparent"
                    />
                    <div className="divide-y divide-white/[0.03]">
                        {contenders.map((entry, idx) => (
                            <RegularRow key={entry.id} entry={entry} topScore={topScore} index={idx} />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer — fixed at bottom */}
            <div className="shrink-0 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-white/[0.015] border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRefreshing ? 'bg-yellow-400' : 'bg-emerald-400'} opacity-50`}></span>
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isRefreshing ? 'bg-yellow-500' : 'bg-emerald-500'}`}></span>
                    </span>
                    <span className="text-[9px] sm:text-[11px] text-white/30 font-medium">
                        {isRefreshing ? t('leaderboard.refreshing') || 'Updating...' : t('leaderboard.liveLabel')}
                    </span>
                    <span className="text-[9px] sm:text-[11px] text-white/15">{'\u00B7'}</span>
                    <span className="text-[9px] sm:text-[11px] text-white/20">{t('leaderboard.refreshRate')}</span>
                </div>
                <span className="text-[9px] sm:text-[11px] text-white/20 tabular-nums">
                    {lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) ?? '--:--:--'}
                </span>
            </div>
        </div>
    );
};
