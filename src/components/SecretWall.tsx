import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Flag, Send, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { Secret, SecretComment } from '../types';
import {
    getApprovedSecrets,
    createSecret,
    createComment,
    getCommentsBySecret,
    likeSecret,
    unlikeSecret,
    checkIfUserLikedSecret,
    reportContent
} from '../services/communityService';

interface SecretWallProps {
    user?: { id: string; name: string } | null;
}

export const SecretWall: React.FC<SecretWallProps> = ({ user }) => {
    const { t } = useTranslation();
    const [secrets, setSecrets] = useState<Secret[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSecret, setNewSecret] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [showComments, setShowComments] = useState<string | null>(null);
    const [comments, setComments] = useState<{ [key: string]: SecretComment[] }>({});
    const [newComment, setNewComment] = useState('');
    const [likedSecrets, setLikedSecrets] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadSecrets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSecrets = async () => {
        setLoading(true);
        const data = await getApprovedSecrets(20, 0);
        setSecrets(data);

        // Check which secrets user has liked
        if (user) {
            const likedSet = new Set<string>();
            await Promise.all(
                data.map(async (secret) => {
                    const liked = await checkIfUserLikedSecret(secret.id);
                    if (liked) likedSet.add(secret.id);
                })
            );
            setLikedSecrets(likedSet);
        }

        setLoading(false);
    };

    const handlePostSecret = async () => {
        if (!user) {
            toast.error(t('secretWall.signInToPost'));
            return;
        }

        if (newSecret.trim().length < 10) {
            toast.error(t('secretWall.tooShort'));
            return;
        }

        if (newSecret.trim().length > 500) {
            toast.error(t('secretWall.tooLong'));
            return;
        }

        setIsPosting(true);
        const secret = await createSecret(newSecret.trim(), true);
        setIsPosting(false);

        if (secret) {
            toast.success(t('secretWall.postSuccess'));
            setNewSecret('');
        } else {
            toast.error(t('secretWall.postFailed'));
        }
    };

    const handleLike = async (secretId: string) => {
        if (!user) {
            toast.error(t('secretWall.signInToLike'));
            return;
        }

        const isLiked = likedSecrets.has(secretId);

        if (isLiked) {
            const success = await unlikeSecret(secretId);
            if (success) {
                setLikedSecrets(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(secretId);
                    return newSet;
                });
                setSecrets(prev => prev.map(s =>
                    s.id === secretId ? { ...s, likes_count: s.likes_count - 1 } : s
                ));
            }
        } else {
            const success = await likeSecret(secretId);
            if (success) {
                setLikedSecrets(prev => new Set(prev).add(secretId));
                setSecrets(prev => prev.map(s =>
                    s.id === secretId ? { ...s, likes_count: s.likes_count + 1 } : s
                ));
            }
        }
    };

    const handleShowComments = async (secretId: string) => {
        if (showComments === secretId) {
            setShowComments(null);
            return;
        }

        setShowComments(secretId);
        if (!comments[secretId]) {
            const data = await getCommentsBySecret(secretId);
            setComments(prev => ({ ...prev, [secretId]: data }));
        }
    };

    const handlePostComment = async (secretId: string) => {
        if (!user) {
            toast.error(t('secretWall.signInToComment'));
            return;
        }

        if (newComment.trim().length < 1) return;

        const comment = await createComment(secretId, newComment.trim(), true);
        if (comment) {
            setComments(prev => ({
                ...prev,
                [secretId]: [...(prev[secretId] || []), comment]
            }));
            setSecrets(prev => prev.map(s =>
                s.id === secretId ? { ...s, comments_count: s.comments_count + 1 } : s
            ));
            setNewComment('');
            toast.success(t('secretWall.commentSuccess'));
        } else {
            toast.error(t('secretWall.commentFailed'));
        }
    };

    const handleReport = async (secretId: string) => {
        if (!user) {
            toast.error(t('secretWall.signInToReport'));
            return;
        }

        const success = await reportContent('secret', secretId, 'inappropriate');
        if (success) {
            toast.success(t('secretWall.reportSuccess'));
        } else {
            toast.error(t('secretWall.reportFailed'));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return t('secretWall.justNow');
        if (minutes < 60) return `${minutes}${t('secretWall.minutesAgo')}`;
        if (hours < 24) return `${hours}${t('secretWall.hoursAgo')}`;
        if (days < 7) return `${days}${t('secretWall.daysAgo')}`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Post New Secret */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">🤫</span>
                    {t('secretWall.title')}
                </h3>
                <div className="space-y-3">
                    <textarea
                        value={newSecret}
                        onChange={(e) => setNewSecret(e.target.value)}
                        placeholder={t('secretWall.placeholder')}
                        maxLength={500}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 resize-none"
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            {newSecret.length}{t('secretWall.charCount')}
                        </span>
                        <Button
                            onClick={handlePostSecret}
                            disabled={isPosting || newSecret.trim().length < 10}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                            {isPosting ? t('secretWall.posting') : t('secretWall.postAnonymously')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Secrets Feed */}
            <div className="space-y-4">
                {secrets.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {t('secretWall.noSecrets')}
                    </div>
                ) : (
                    secrets.map((secret) => (
                        <div
                            key={secret.id}
                            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover-lift transition-all duration-200"
                        >
                            {/* Secret Content */}
                            <div className="mb-4">
                                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                                    {secret.content}
                                </p>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <span className="flex items-center gap-2">
                                    <span className="font-semibold">{secret.author_pseudonym}</span>
                                    <span>•</span>
                                    <span>{formatDate(secret.created_at)}</span>
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        {secret.views_count}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handleLike(secret.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${likedSecrets.has(secret.id)
                                            ? 'text-red-500 bg-red-50 dark:bg-red-950/30'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 ${likedSecrets.has(secret.id) ? 'fill-current' : ''}`} />
                                    <span className="font-semibold">{secret.likes_count}</span>
                                </button>

                                <button
                                    onClick={() => handleShowComments(secret.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="font-semibold">{secret.comments_count}</span>
                                </button>

                                <button
                                    onClick={() => handleReport(secret.id)}
                                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                >
                                    <Flag className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Comments Section */}
                            {showComments === secret.id && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                    {/* Comment Input */}
                                    <div className="flex gap-3">
                                        <Input
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder={t('secretWall.addComment')}
                                            className="flex-1"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handlePostComment(secret.id);
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={() => handlePostComment(secret.id)}
                                            disabled={!newComment.trim()}
                                            size="sm"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Comments List */}
                                    <div className="space-y-3">
                                        {comments[secret.id]?.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
                                            >
                                                <p className="text-gray-800 dark:text-gray-200 mb-2">
                                                    {comment.content}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span className="font-semibold">{comment.author_pseudonym}</span>
                                                    <span>{formatDate(comment.created_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
