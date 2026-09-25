import { supabase, TABLES } from '../config/supabase';
import type {
    Secret,
    SecretComment,
    VoiceClip,
    LeaderboardEntry
} from '../types';

// =============================================
// SECRET WALL FUNCTIONS
// =============================================

export const getApprovedSecrets = async (limit: number = 20, offset: number = 0): Promise<Secret[]> => {
    const { data, error } = await supabase
        .from('secrets')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching secrets:', error);
        return [];
    }
    return data || [];
};

export const getRandomSecret = async (): Promise<Secret | null> => {
    const { data, error } = await supabase.rpc('get_random_secret');

    if (error) {
        console.error('Error fetching random secret:', error);
        return null;
    }
    return data && data.length > 0 ? data[0] : null;
};

export const createSecret = async (
    content: string,
    isAnonymous: boolean = true,
    pseudonym?: string
): Promise<Secret | null> => {
    try {
        // Check authentication first
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('Authentication error:', authError);
            return null;
        }

        if (!user) {
            console.error('User must be authenticated to create a secret');
            return null;
        }

        console.log('Creating secret for user:', user.id, 'isAnonymous:', isAnonymous);

        // Prepare the secret data
        const secretData = {
            content: content.trim(),
            author_id: isAnonymous ? null : user.id,
            author_pseudonym: pseudonym || 'Anonymous',
            is_anonymous: isAnonymous,
            status: 'pending' // Will need admin approval
        };

        console.log('Secret data to insert:', secretData);

        const { data, error } = await supabase
            .from('secrets')
            .insert(secretData)
            .select()
            .single();

        if (error) {
            console.error('Error creating secret:', {
                error,
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            return null;
        }

        console.log('Secret created successfully:', data);
        return data;
    } catch (error) {
        console.error('Unexpected error creating secret:', error);
        return null;
    }
};

export const incrementSecretViews = async (secretId: string): Promise<void> => {
    // Fetch current count, increment, and update
    const { data } = await supabase
        .from('secrets')
        .select('views_count')
        .eq('id', secretId)
        .single();

    if (data) {
        await supabase
            .from('secrets')
            .update({ views_count: data.views_count + 1 })
            .eq('id', secretId);
    }
};

// =============================================
// COMMENTS FUNCTIONS
// =============================================

export const getCommentsBySecret = async (secretId: string): Promise<SecretComment[]> => {
    const { data, error } = await supabase
        .from('secret_comments')
        .select('*')
        .eq('secret_id', secretId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
    return data || [];
};

export const createComment = async (
    secretId: string,
    content: string,
    isAnonymous: boolean = true,
    pseudonym?: string
): Promise<SecretComment | null> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('User must be authenticated to comment');
        return null;
    }

    const { data, error } = await supabase
        .from('secret_comments')
        .insert({
            secret_id: secretId,
            content,
            author_id: isAnonymous ? null : user.id,
            author_pseudonym: pseudonym || 'Anonymous',
            is_anonymous: isAnonymous
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating comment:', error);
        return null;
    }
    return data;
};

// =============================================
// LIKES FUNCTIONS
// =============================================

export const likeSecret = async (secretId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('User must be authenticated to like');
        return false;
    }

    const { error } = await supabase
        .from('secret_likes')
        .insert({
            user_id: user.id,
            secret_id: secretId
        });

    if (error) {
        console.error('Error liking secret:', error);
        return false;
    }
    return true;
};

export const unlikeSecret = async (secretId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
        .from('secret_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('secret_id', secretId);

    if (error) {
        console.error('Error unliking secret:', error);
        return false;
    }
    return true;
};

export const likeComment = async (commentId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('User must be authenticated to like');
        return false;
    }

    const { error } = await supabase
        .from('secret_likes')
        .insert({
            user_id: user.id,
            comment_id: commentId
        });

    if (error) {
        console.error('Error liking comment:', error);
        return false;
    }
    return true;
};

export const unlikeComment = async (commentId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
        .from('secret_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('comment_id', commentId);

    if (error) {
        console.error('Error unliking comment:', error);
        return false;
    }
    return true;
};

export const checkIfUserLikedSecret = async (secretId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('secret_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('secret_id', secretId)
        .single();

    return !!data;
};

// =============================================
// VOICE CLIPS FUNCTIONS
// =============================================

export const getApprovedVoiceClips = async (limit: number = 20): Promise<VoiceClip[]> => {
    const { data, error } = await supabase
        .from('voice_clips')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching voice clips:', error);
        return [];
    }
    return data || [];
};

export const getRandomVoiceClip = async (): Promise<VoiceClip | null> => {
    const { data, error } = await supabase
        .from('voice_clips')
        .select('*')
        .eq('status', 'approved')
        .order('RANDOM()')
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching random voice clip:', error);
        return null;
    }
    return data;
};

export const createVoiceClip = async (
    audioBlob: Blob,
    durationSeconds: number,
    isAnonymous: boolean = true
): Promise<VoiceClip | null> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('User must be authenticated to upload voice clip');
        return null;
    }

    // Upload audio file to storage
    const fileName = `${user.id}_${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-clips')
        .upload(fileName, audioBlob, {
            contentType: 'audio/webm'
        });

    if (uploadError) {
        console.error('Error uploading voice clip:', uploadError);
        return null;
    }

    // Create database record
    const { data, error } = await supabase
        .from('voice_clips')
        .insert({
            user_id: isAnonymous ? null : user.id,
            storage_path: uploadData.path,
            duration_seconds: durationSeconds,
            is_anonymous: isAnonymous,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating voice clip record:', error);
        return null;
    }
    return data;
};

export const rateVoiceClip = async (
    voiceClipId: string,
    ratingType: 'cool' | 'cringe' | 'funny'
): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('User must be authenticated to rate');
        return false;
    }

    // Check if user already rated this clip
    const { data: existingRating } = await supabase
        .from('voice_ratings')
        .select('id')
        .eq('voice_clip_id', voiceClipId)
        .eq('user_id', user.id)
        .single();

    if (existingRating) {
        console.error('User already rated this clip');
        return false;
    }

    const { error } = await supabase
        .from('voice_ratings')
        .insert({
            voice_clip_id: voiceClipId,
            user_id: user.id,
            rating_type: ratingType
        });

    if (error) {
        console.error('Error rating voice clip:', error);
        return false;
    }
    return true;
};

export const incrementVoiceViews = async (voiceClipId: string): Promise<void> => {
    // Fetch current count, increment, and update
    const { data } = await supabase
        .from('voice_clips')
        .select('views_count')
        .eq('id', voiceClipId)
        .single();

    if (data) {
        await supabase
            .from('voice_clips')
            .update({ views_count: data.views_count + 1 })
            .eq('id', voiceClipId);
    }
};

export const getVoiceClipUrl = async (storagePath: string): Promise<string | null> => {
    const { data } = supabase.storage
        .from('voice-clips')
        .getPublicUrl(storagePath);

    return data?.publicUrl || null;
};

// =============================================
// LEADERBOARD FUNCTIONS
// =============================================

export const getYUYULeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
        .from('yuyu_leaderboard')
        .select('*')
        .order('rank', { ascending: true });

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
    const entries = (data || []).map((entry: {
        user_id?: string;
        id?: string;
        name: string;
        country: string;
        yuyu_score: number;
        rank: number;
        profile_picture?: string | null;
        hide_picture?: boolean;
    }) => ({
        ...entry,
        id: entry.id ?? entry.user_id ?? '',
        hide_picture: entry.hide_picture ?? false,
        yuyu_score: Number(entry.yuyu_score ?? 0),
        rank: Number(entry.rank ?? 0),
    })) as LeaderboardEntry[];
    // The public leaderboard is the canonical, privacy-filtered source. Reading
    // the private users table here was both redundant and blocked by owner RLS.
    return entries;
};

// =============================================
// REPORTING FUNCTIONS
// =============================================

export const reportContent = async (
    contentType: 'secret' | 'comment' | 'voice',
    contentId: string,
    reason: 'spam' | 'offensive' | 'harassment' | 'inappropriate' | 'other',
    description?: string
): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('User must be authenticated to report');
        return false;
    }

    const reportData: {
        reporter_id: string;
        reason: string;
        description?: string;
        secret_id?: string;
        comment_id?: string;
        voice_clip_id?: string;
    } = {
        reporter_id: user.id,
        reason,
        description
    };

    if (contentType === 'secret') {
        reportData.secret_id = contentId;
    } else if (contentType === 'comment') {
        reportData.comment_id = contentId;
    } else if (contentType === 'voice') {
        reportData.voice_clip_id = contentId;
    }

    const { error } = await supabase
        .from('content_reports')
        .insert(reportData);

    if (error) {
        console.error('Error reporting content:', error);
        return false;
    }
    return true;
};

// =============================================
// STATISTICS
// =============================================

export const getCommunityStats = async () => {
    const [secretsCount, voiceCount, totalUsers] = await Promise.all([
        supabase.from('secrets').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('voice_clips').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('users').select('id', { count: 'exact', head: true })
    ]);

    return {
        secretsCount: secretsCount.count || 0,
        voiceClipsCount: voiceCount.count || 0,
        totalUsers: totalUsers.count || 0
    };
};
