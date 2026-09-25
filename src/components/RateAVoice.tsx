import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, ThumbsUp, Frown, Laugh, Upload, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { VoiceClip } from '../types';
import {
    getRandomVoiceClip,
    createVoiceClip,
    rateVoiceClip,
    getVoiceClipUrl,
    incrementVoiceViews
} from '../services/communityService';

interface RateAVoiceProps {
    user?: { id: string; name: string } | null;
}

export const RateAVoice: React.FC<RateAVoiceProps> = ({ user }) => {
    const { t } = useTranslation();
    const [currentClip, setCurrentClip] = useState<VoiceClip | null>(null);
    const [clipUrl, setClipUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [uploading, setUploading] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        };
    }, []);

    const loadRandomClip = async () => {
        setLoading(true);
        setHasRated(false);
        setIsPlaying(false);

        const clip = await getRandomVoiceClip();
        setCurrentClip(clip);

        if (clip) {
            const url = await getVoiceClipUrl(clip.storage_path);
            setClipUrl(url);
            await incrementVoiceViews(clip.id);
        }

        setLoading(false);
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleRate = async (ratingType: 'cool' | 'cringe' | 'funny') => {
        if (!user) {
            toast.error(t('rateVoice.signInToRate'));
            return;
        }

        if (!currentClip || hasRated) return;

        const success = await rateVoiceClip(currentClip.id, ratingType);
        if (success) {
            setHasRated(true);
            setCurrentClip(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    [`${ratingType}_count`]: prev[`${ratingType}_count` as keyof VoiceClip] as number + 1,
                    total_ratings: prev.total_ratings + 1
                };
            });
            toast.success(t('rateVoice.ratedAs', { rating: ratingType }));

            // Auto-load next clip after 2 seconds
            setTimeout(loadRandomClip, 2000);
        } else {
            toast.error(t('rateVoice.alreadyRated'));
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            recordingIntervalRef.current = window.setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 10) {
                        stopRecording();
                        return 10;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error(t('rateVoice.micFailed'));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const uploadRecording = async () => {
        if (!audioBlob || !user) {
            toast.error(t('rateVoice.signInToUpload'));
            return;
        }

        setUploading(true);
        const clip = await createVoiceClip(audioBlob, recordingTime, true);
        setUploading(false);

        if (clip) {
            toast.success(t('rateVoice.uploadSuccess'));
            setAudioBlob(null);
            setRecordingTime(0);
        } else {
            toast.error(t('rateVoice.uploadFailed'));
        }
    };

    const getRatingPercentage = (count: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((count / total) * 100);
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Main Rating Section */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-3xl p-8 border border-indigo-200 dark:border-indigo-800 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                        <Volume2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('rateVoice.title')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('rateVoice.subtitle')}
                    </p>
                </div>

                {/* Voice Player */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                        <p className="mt-4 text-gray-500">{t('rateVoice.loading')}</p>
                    </div>
                ) : currentClip && clipUrl ? (
                    <div className="space-y-6">
                        {/* Audio Player */}
                        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 text-center">
                            <audio
                                ref={audioRef}
                                src={clipUrl}
                                onEnded={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />

                            <button
                                onClick={handlePlayPause}
                                className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 mx-auto"
                            >
                                {isPlaying ? (
                                    <Pause className="w-10 h-10 text-white" />
                                ) : (
                                    <Play className="w-10 h-10 text-white ml-1" />
                                )}
                            </button>

                            <p className="mt-4 text-sm text-gray-500">
                                {t('rateVoice.duration', { seconds: currentClip.duration_seconds.toFixed(1) })}
                            </p>
                        </div>

                        {/* Rating Buttons */}
                        {!hasRated ? (
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => handleRate('cool')}
                                    className="flex flex-col items-center gap-3 p-6 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-xl border-2 border-blue-300 dark:border-blue-700 transition-all hover-lift"
                                >
                                    <ThumbsUp className="w-8 h-8 text-blue-600" />
                                    <span className="font-bold text-blue-600">{t('rateVoice.cool')}</span>
                                </button>

                                <button
                                    onClick={() => handleRate('cringe')}
                                    className="flex flex-col items-center gap-3 p-6 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-xl border-2 border-red-300 dark:border-red-700 transition-all hover-lift"
                                >
                                    <Frown className="w-8 h-8 text-red-600" />
                                    <span className="font-bold text-red-600">{t('rateVoice.cringe')}</span>
                                </button>

                                <button
                                    onClick={() => handleRate('funny')}
                                    className="flex flex-col items-center gap-3 p-6 bg-yellow-50 dark:bg-yellow-950/30 hover:bg-yellow-100 dark:hover:bg-yellow-950/50 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 transition-all hover-lift"
                                >
                                    <Laugh className="w-8 h-8 text-yellow-600" />
                                    <span className="font-bold text-yellow-600">{t('rateVoice.funny')}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-center text-green-600 dark:text-green-400 font-semibold">
                                    {t('rateVoice.thanksForRating')}
                                </p>

                                {/* Show current ratings */}
                                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-blue-600">{currentClip.cool_count}</div>
                                        <div className="text-gray-600 dark:text-gray-400">{t('rateVoice.cool')} ({getRatingPercentage(currentClip.cool_count, currentClip.total_ratings)}%)</div>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-red-600">{currentClip.cringe_count}</div>
                                        <div className="text-gray-600 dark:text-gray-400">{t('rateVoice.cringe')} ({getRatingPercentage(currentClip.cringe_count, currentClip.total_ratings)}%)</div>
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3">
                                        <div className="text-2xl font-bold text-yellow-600">{currentClip.funny_count}</div>
                                        <div className="text-gray-600 dark:text-gray-400">{t('rateVoice.funny')} ({getRatingPercentage(currentClip.funny_count, currentClip.total_ratings)}%)</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Load Next Button */}
                        <Button
                            onClick={loadRandomClip}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        >
                            {t('rateVoice.nextClip')}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-2xl mb-4">🎤</p>
                        <p className="text-gray-500 mb-6">{t('rateVoice.noClips')}</p>
                        <Button onClick={loadRandomClip} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                            {t('rateVoice.tryLoading')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Upload Section */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    {t('rateVoice.recordTitle')}
                </h3>

                {!audioBlob ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('rateVoice.recordDesc')}
                        </p>

                        {isRecording && (
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 text-red-500 text-2xl font-bold">
                                    <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
                                    {t('rateVoice.recordTimer', { seconds: recordingTime })}
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={isRecording ? 'bg-red-500 hover:bg-red-600 w-full' : 'w-full'}
                        >
                            {isRecording ? t('rateVoice.stopRecording') : t('rateVoice.startRecording')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
                            <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
                                {t('rateVoice.recordingComplete', { seconds: recordingTime })}
                            </p>
                            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => {
                                    setAudioBlob(null);
                                    setRecordingTime(0);
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                {t('rateVoice.discard')}
                            </Button>
                            <Button
                                onClick={uploadRecording}
                                disabled={uploading}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {uploading ? t('rateVoice.uploading') : t('rateVoice.upload')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
