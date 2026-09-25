import React, { useState } from 'react';
import { Shuffle, Heart, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import type { Secret } from '../types';
import { getRandomSecret } from '../services/communityService';

export const SecretGenerator: React.FC = () => {
    const [currentSecret, setCurrentSecret] = useState<Secret | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const loadRandomSecret = async () => {
        setLoading(true);
        const secret = await getRandomSecret();
        setCurrentSecret(secret);
        setLoading(false);
        setHasStarted(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / 86400000);

        if (days < 1) return 'Today';
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-md rounded-3xl p-8 border border-purple-200 dark:border-purple-800 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
                        <span className="text-3xl">🎲</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Secret Generator
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Discover random secrets from our community
                    </p>
                </div>

                {/* Secret Display */}
                <div className="min-h-[200px] flex items-center justify-center mb-6">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                            <p className="text-gray-500">Finding a secret...</p>
                        </div>
                    ) : !hasStarted ? (
                        <div className="text-center">
                            <p className="text-2xl text-gray-400 mb-4">👇</p>
                            <p className="text-gray-500">Click below to start</p>
                        </div>
                    ) : currentSecret ? (
                        <div className="w-full space-y-4 animate-fade-in-up">
                            {/* Secret Card */}
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                                <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
                                    "{currentSecret.content}"
                                </p>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        By <span className="font-semibold">{currentSecret.author_pseudonym}</span>
                                    </span>
                                    <span className="text-gray-500">
                                        {formatDate(currentSecret.created_at)}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Heart className="w-4 h-4" />
                                        <span className="font-semibold">{currentSecret.likes_count}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="font-semibold">{currentSecret.comments_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <p className="text-2xl mb-2">🤷</p>
                            <p>No secrets available right now</p>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <Button
                    onClick={loadRandomSecret}
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 group relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        {loading ? 'Shuffling...' : hasStarted ? 'Next Secret' : 'Start Discovering'}
                    </span>
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Button>

                {/* Fun Stats */}
                {hasStarted && (
                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>🎯 Keep shuffling to discover more secrets!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
