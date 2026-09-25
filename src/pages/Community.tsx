import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, ArrowLeft, Heart, TrendingUp, Sparkles, Crown } from 'lucide-react';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useNavigate } from '@/lib/router-compat';
import {
    getFeatureSuggestions,
    createFeatureSuggestion,
    toggleFeatureSuggestionVote,
    getVotedSuggestionIds,
} from '../services/featureSuggestionService';
import type { FeatureSuggestionWithVotes } from '../types';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;
const CHAR_WARNING = 450;

export default function Community() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState<FeatureSuggestionWithVotes[]>([]);
    const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'trending' | 'recent'>('trending');
    const [votingId, setVotingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [list, ids] = await Promise.all([
                getFeatureSuggestions(),
                getVotedSuggestionIds(),
            ]);
            setSuggestions(list);
            setVotedIds(ids);
        } catch (err) {
            setError('Failed to load suggestions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handlePost = async () => {
        const text = input.trim();
        if (text.length < MIN_LENGTH) {
            setError(t('community.featureSuggestions.tooShort'));
            return;
        }
        if (text.length > MAX_LENGTH) {
            setError(t('community.featureSuggestions.tooLong'));
            return;
        }
        setError(null);
        setPosting(true);
        
        try {
            const created = await createFeatureSuggestion(text);
            if (created) {
                setInput('');
                setSuggestions((prev) => {
                    const next = [{ ...created, vote_count: 0 }, ...prev];
                    return sortSuggestions(next, filter);
                });
            } else {
                setError(t('community.featureSuggestions.postFailed'));
            }
        } catch (err) {
            setError(t('community.featureSuggestions.postFailed'));
        } finally {
            setPosting(false);
        }
    };

    const handleVote = async (suggestionId: string) => {
        if (votingId) return;
        
        setVotingId(suggestionId);
        
        try {
            const newCount = await toggleFeatureSuggestionVote(suggestionId);
            if (newCount === null) {
                setVotingId(null);
                return;
            }
            
            setVotedIds((prev) => {
                const next = new Set(prev);
                if (next.has(suggestionId)) {
                    next.delete(suggestionId);
                } else {
                    next.add(suggestionId);
                }
                return next;
            });
            
            setSuggestions((prev) =>
                sortSuggestions(
                    prev.map((s) => s.id === suggestionId ? { ...s, vote_count: newCount } : s),
                    filter
                )
            );
        } catch (err) {
            console.error('Vote failed:', err);
        } finally {
            setVotingId(null);
        }
    };

    const sortSuggestions = (list: FeatureSuggestionWithVotes[], type: 'trending' | 'recent') => {
        return [...list].sort((a, b) => {
            if (type === 'trending') {
                return b.vote_count - a.vote_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    };

    const filteredSuggestions = sortSuggestions(suggestions, filter);
    const charCount = input.length;
    const isNearLimit = charCount >= CHAR_WARNING;
    const canPost = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH && !posting;

    return (
        <>

            <ParticleBackground />
            
            <div className="min-h-screen w-full overflow-x-hidden relative z-10">
                <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-5xl">
                    
                    <button
                        onClick={() => navigate('/')}
                        className="group mb-6 sm:mb-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:scale-105 hover:border-white/20"
                        aria-label="Back to home"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">{t('common.back')}</span>
                    </button>

                    <header className="text-center mb-8 sm:mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl sm:rounded-3xl mb-5 sm:mb-6 shadow-2xl shadow-purple-500/30 animate-float">
                            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent leading-tight">
                            {t('community.title')}
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                            {t('community.subtitle')}
                        </p>
                    </header>

                    <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl shadow-purple-500/10 mb-8 sm:mb-10" aria-labelledby="suggest-feature">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            <h2 id="suggest-feature" className="text-lg sm:text-xl font-bold text-white">
                                {t('community.featureSuggestions.prompt')}
                            </h2>
                        </div>
                        
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('community.featureSuggestions.placeholder')}
                            maxLength={MAX_LENGTH}
                            className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-y transition-all"
                            disabled={posting}
                            aria-label="Feature suggestion text"
                        />
                        
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                            <span className={`text-sm font-medium transition-colors ${isNearLimit ? 'text-orange-400' : 'text-white/50'}`}>
                                {charCount}/{MAX_LENGTH}
                            </span>
                            <button
                                onClick={handlePost}
                                disabled={!canPost}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95"
                                aria-label="Post suggestion"
                            >
                                {posting ? t('community.featureSuggestions.posting') : t('community.featureSuggestions.post')}
                            </button>
                        </div>
                        
                        {error && (
                            <div className="mt-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm" role="alert">
                                {error}
                            </div>
                        )}
                    </section>

                    <section aria-labelledby="suggestions-list">
                        <div className="flex items-center justify-between mb-5 gap-3">
                            <h2 id="suggestions-list" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                {t('community.featureSuggestions.listTitle')}
                                {suggestions.length > 0 && (
                                    <span className="text-sm font-normal text-white/50">({suggestions.length})</span>
                                )}
                            </h2>
                            
                            <div className="flex gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setFilter('trending')}
                                    className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all active:scale-95 ${filter === 'trending' ? 'bg-purple-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                                    aria-pressed={filter === 'trending'}
                                >
                                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                    <span className="hidden sm:inline">Trending</span>
                                    <span className="sm:hidden">Top</span>
                                </button>
                                <button
                                    onClick={() => setFilter('recent')}
                                    className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all active:scale-95 ${filter === 'recent' ? 'bg-purple-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                                    aria-pressed={filter === 'recent'}
                                >
                                    Recent
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                            </div>
                        ) : filteredSuggestions.length === 0 ? (
                            <div className="py-12 text-center rounded-2xl bg-white/5 border border-white/10">
                                <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                                <p className="text-white/60">{t('community.featureSuggestions.empty')}</p>
                            </div>
                        ) : (
                            <ul className="space-y-3" role="list">
                                {filteredSuggestions.map((s, idx) => {
                                    const isTopVoted = idx === 0 && filter === 'trending' && s.vote_count > 0;
                                    const isVoted = votedIds.has(s.id);
                                    const isVoting = votingId === s.id;
                                    
                                    return (
                                        <li
                                            key={s.id}
                                            className={`group relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl backdrop-blur transition-all duration-300 hover:scale-[1.01] ${isTopVoted ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40' : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                                        >
                                            {isTopVoted && (
                                                <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                                            )}
                                            
                                            <p className="flex-1 min-w-0 text-white/90 text-sm sm:text-base leading-relaxed break-words">
                                                {s.content}
                                            </p>
                                            
                                            <button
                                                type="button"
                                                onClick={() => handleVote(s.id)}
                                                disabled={isVoting}
                                                className={`flex flex-col items-center gap-1 flex-shrink-0 p-3 sm:p-2 rounded-xl transition-all duration-300 active:scale-90 touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${isVoted ? 'bg-red-500/10' : 'hover:bg-white/10'} ${isVoting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                                title={t('community.featureSuggestions.vote')}
                                                aria-label={t('community.featureSuggestions.vote')}
                                            >
                                                <Heart
                                                    className={`w-8 h-8 sm:w-9 sm:h-9 transition-all ${isVoted ? 'fill-red-500 text-red-500 scale-110' : 'text-white/60'} ${isVoting ? 'animate-pulse' : ''}`}
                                                />
                                                <span className={`text-sm sm:text-base font-bold ${isVoted ? 'text-red-400' : 'text-white/70'}`}>
                                                    {s.vote_count}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
