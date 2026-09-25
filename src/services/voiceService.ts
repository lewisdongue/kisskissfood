import type { Message } from "@/types";
import { supabase } from "@/config/supabase";

// ============================================================================
// TYPES FOR SHARE ANALYTICS
// ============================================================================

export interface VoiceShare {
  id: string;
  message_id: string;
  user_id?: string;
  platform: 'twitter' | 'facebook' | 'whatsapp' | 'telegram' | 'linkedin' | 'reddit' | 'copy_link' | 'native_share' | 'other';
  share_url: string;
  referrer_url?: string;
  user_agent?: string;
  ip_address?: string;
  country_code?: string;
  created_at: string;
}

export interface VoiceShareClick {
  id: string;
  share_id?: string;
  message_id: string;
  landing_url: string;
  referrer_url?: string;
  user_agent?: string;
  did_signup: boolean;
  did_play: boolean;
  did_like: boolean;
  did_share: boolean;
  session_duration?: number;
  created_at: string;
  converted_at?: string;
}

export interface MessageShareAnalytics {
  total_shares: number;
  total_clicks: number;
  click_through_rate: number;
  conversions: number;
  conversion_rate: number;
  top_platform: string;
  shares_by_platform: Record<string, number>;
}

export interface ViralGrowthMetric {
  date: string;
  total_shares: number;
  total_clicks: number;
  new_signups: number;
  viral_coefficient: number;
}

const MESSAGES_TABLE = "messages";
const STORAGE_BUCKET = "voice-clips";

let messagesCache: Message[] = [];
let listeners: ((msg: Message) => void)[] = [];
let voiceChannel: ReturnType<typeof supabase.channel> | null = null;

// Fetch voice messages
export const fetchVoiceMessages = async (cursor?: string, limit = 20): Promise<Message[]> => {
  let query = supabase
    .from(MESSAGES_TABLE)
    .select("*")
    .eq("type", "VOICE")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw error;

  if (data) {
    if (!cursor) {
      // initial newest-first batch
      messagesCache = data as Message[];
    } else {
      const filtered = (data as Message[]).filter((m) => !messagesCache.some((mm) => mm.id === m.id));
      // append older messages to end (messagesCache is newest-first)
      messagesCache = [...messagesCache, ...filtered];
    }
  }

  return data ?? [];
};

// Personalized "For You" feed
export const fetchForYouVoiceMessages = async (limit = 30, offset = 0): Promise<Message[]> => {
  const { data, error } = await supabase.rpc('get_for_you_voice_messages', {
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw error;
  return (data || []) as Message[];
};

export const logVoiceFeedExposures = async (
  messageIds: string[],
  experimentKey: string = 'voice_for_you_v1'
): Promise<void> => {
  if (!messageIds.length) return;
  try {
    await supabase.rpc('log_voice_feed_exposures', {
      p_message_ids: messageIds,
      p_experiment_key: experimentKey,
    });
  } catch (error) {
    console.error('[voiceService] Error logging feed exposures', error);
  }
};

// Fetch a single voice message by ID (for shared links)
export const fetchVoiceMessageById = async (messageId: string): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from(MESSAGES_TABLE)
      .select("*")
      .eq("id", messageId)
      .eq("type", "VOICE")
      .single();

    if (error) {
      console.error('[voiceService] Failed to fetch message by ID', error);
      return null;
    }

    return data as Message;
  } catch (error) {
    console.error('[voiceService] Error fetching message by ID', error);
    return null;
  }
};

// Post voice message
// Post voice message with duration, language, and category
export const postVoiceMessage = async (
  audioFile: File, 
  durationSeconds?: number,
  language?: string,
  category?: string
) => {
  const filePath = `voice_${Date.now()}_${audioFile.name}`;
  console.debug('[voiceService] postVoiceMessage: start upload', { filePath, size: audioFile.size, type: audioFile.type, duration: durationSeconds, language, category });

  // environment debug
  try {
    console.debug('[voiceService] navigator.onLine', navigator.onLine);
    console.debug('[voiceService] userAgent', navigator.userAgent);
  } catch (e) {
    // ignore in non-browser env
  }

  // quick bucket accessibility check: list root to ensure permission and existence
  try {
    const listRes = await Promise.race([
      supabase.storage.from(STORAGE_BUCKET).list('', { limit: 1 }),
      new Promise((_res, rej) => setTimeout(() => rej(new Error('list_timeout')), 5000)),
    ]);
    console.debug('[voiceService] bucket list result', listRes);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn('[voiceService] bucket list check failed', msg);
    void e;
  }

  // helper: upload with timeout and retries
  const uploadWithRetry = async (attempts = 3, timeoutMs = 60000) => {
    let lastError: unknown = null;
    // quick offline check
    try {
      if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
        throw new Error('Network offline: cannot upload voice message');
      }
    } catch (e) {
      // If navigator not available, ignore
      if (e instanceof Error) throw e;
    }
    for (let attempt = 1; attempt <= attempts; attempt++) {
      console.debug(`[voiceService] upload attempt ${attempt}/${attempts}`);
      try {
        const uploadPromise = supabase.storage.from(STORAGE_BUCKET).upload(filePath, audioFile, { cacheControl: '3600', upsert: false });

        // log raw resolution/rejection of uploadPromise for debugging
        uploadPromise.then((r) => console.debug('[voiceService] uploadPromise resolved (raw)', r)).catch((err) => console.error('[voiceService] uploadPromise rejected (raw)', err));

        const result = await Promise.race([
          uploadPromise,
          new Promise((_res, rej) => setTimeout(() => rej(new Error('upload_timeout')), timeoutMs)),
        ]);

        console.debug('[voiceService] Promise.race resolved', { result });

        // result shape: { data, error }
        const uploadError = (result as unknown as Record<string, unknown>)['error'];
        if (uploadError) {
          // Normalize uploadError into an Error for better UI and logging
          try {
            const msg = typeof uploadError === 'string' ? uploadError : JSON.stringify(uploadError);
            lastError = new Error(`Supabase upload error: ${msg}`);
          } catch {
            lastError = new Error(String(uploadError));
          }
          console.warn('[voiceService] upload returned error', uploadError);
          continue; // retry
        }

        console.debug('[voiceService] upload succeeded', result);
        return result;
      } catch (err) {
        // Normalize any thrown error to Error instance
        if (err instanceof Error) {
          lastError = err;
        } else {
          lastError = new Error(String(err));
        }
        if (lastError instanceof Error && lastError.message === 'upload_timeout') {
          console.error('[voiceService] upload attempt timed out', { attempt, timeoutMs, filePath, fileSize: audioFile.size, online: (typeof navigator !== 'undefined' && 'onLine' in navigator) ? navigator.onLine : 'unknown' });
        } else {
          console.error('[voiceService] upload exception', lastError);
        }
        // short backoff before retry
        if (attempt < attempts) await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
    console.error('[voiceService] upload failed after attempts', { attempts, filePath, fileSize: audioFile.size, lastError });
    // Throw a consistent Error with attached debug info
    const finalMsg = lastError instanceof Error ? lastError.message : String(lastError);
    const finalErr = new Error(`Upload failed after ${attempts} attempts: ${finalMsg}`);
    // attach original lastError for debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (finalErr as any).cause = lastError;
    throw finalErr;
  };

  await uploadWithRetry();

  console.debug('[voiceService] fetching public url for', filePath);
  const { data: supabaseData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  const publicUrl = supabaseData.publicUrl;
  console.debug('[voiceService] public url', publicUrl);

  console.debug('[voiceService] inserting message row');

  // Attach authenticated user id when available to satisfy common RLS policies.
  // If no user session exists, mark as anonymous so RLS policies can allow inserts
  // that explicitly set is_anonymous = true.
  const insertPayload: Record<string, unknown> = { 
    type: 'VOICE', 
    audio_url: publicUrl,
    duration: durationSeconds || 0,  // Include the duration in seconds
    language: language || null,  // Include the language
    category: category || null,  // Include the category
  };
  try {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      console.warn('[voiceService] getSession returned error', sessionErr);
    }
    const userId = sessionData?.session?.user?.id;
    if (userId) {
      insertPayload.user_id = userId;
      insertPayload.is_anonymous = false;
    } else {
      insertPayload.is_anonymous = true;
    }
  } catch {
    // non-fatal: proceed with anonymous flag
    // suppress any getSession errors and fallback to anonymous
    // (insertPayload is const but its properties are mutable)
    (insertPayload as Record<string, unknown>).is_anonymous = true;
  }

  const { data, error } = await supabase.from(MESSAGES_TABLE).insert(insertPayload).select().single();
  if (error) {
    // Provide clearer message for row-level security (RLS) rejection
    const isRls = typeof error.message === 'string' && error.message.toLowerCase().includes('new row violates row-level security');
    if (isRls) {
      console.error('[voiceService] insert failed due to RLS - likely missing auth or insufficient row policy. Insert payload:', insertPayload, 'supabaseError:', error);
      // Throw a friendly error while preserving original error details on the instance
      const friendly = new Error('Insert blocked by Row-Level Security: authenticate or update DB policy to allow anonymous inserts.');
      // attach original error for debugging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (friendly as any).supabase = error;
      throw friendly;
    }

    console.error('[voiceService] insert message error', error);
    throw error;
  }
  console.debug('[voiceService] inserted message', data);

  if (data) {
    // newest-first cache: prepend
    messagesCache = [data as Message, ...messagesCache];
    listeners.forEach((cb) => cb(data as Message));
  }

  return data!;
};

// Subscribe to voice messages in real-time
export const subscribeToVoiceMessages = (onNewMessage: (msg: Message) => void) => {
  listeners.push(onNewMessage);

  if (!voiceChannel) {
    voiceChannel = supabase.channel("voice_messages_channel");
    const channel = voiceChannel;
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: MESSAGES_TABLE,
          filter: "type=eq.VOICE",
        },
        (payload: unknown) => {
          const p = payload as unknown as Record<string, unknown>;
          // handle several SDK payload shapes
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anyP = p as any;
          const raw = (anyP.new ?? anyP.record ?? anyP.record?.new) as unknown;
          if (!raw) return;
          const msg = raw as Message;
          if (!messagesCache.some((m) => m.id === msg.id)) {
            // newest-first: prepend
            messagesCache = [msg, ...messagesCache];
            listeners.forEach((cb) => cb(msg));
          }
        }
      )
      .subscribe();
  }

  return () => {
    listeners = listeners.filter((cb) => cb !== onNewMessage);
    if (listeners.length === 0 && voiceChannel) {
      try {
        const supa = supabase as unknown as { removeChannel?: (c: unknown) => void };
        supa.removeChannel?.(voiceChannel);
      } catch (e) {
        // ignore removeChannel errors
        void e;
      }
      voiceChannel = null;
    }
  };
};

// Get cached voice messages
export const getCachedVoiceMessages = () => [...messagesCache];

// Increment play count for a voice message
export const incrementPlayCount = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_voice_play_count', { message_id: messageId });
    if (error) {
      console.error('[voiceService] Failed to increment play count', error);
    }
  } catch (error) {
    console.error('[voiceService] Error incrementing play count', error);
  }
};

// Increment like count for a voice message
export const incrementLikeCount = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_voice_like_count', { message_id: messageId });
    if (error) {
      console.error('[voiceService] Failed to increment like count', error);
    }
  } catch (error) {
    console.error('[voiceService] Error incrementing like count', error);
  }
};

// Decrement like count for a voice message (when user unlikes)
export const decrementLikeCount = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('decrement_voice_like_count', { message_id: messageId });
    if (error) {
      console.error('[voiceService] Failed to decrement like count', error);
    }
  } catch (error) {
    console.error('[voiceService] Error decrementing like count', error);
  }
};

// ============================================================================
// NEW LIKE SYSTEM WITH USER TRACKING
// ============================================================================

// Generate a browser fingerprint for anonymous users
const getBrowserFingerprint = (): string => {
  // Simple fingerprint based on user agent and screen
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const txt = 'fingerprint';
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText(txt, 2, 2);
  }
  const fingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}-${canvas.toDataURL().slice(-50)}`;
  return btoa(fingerprint).slice(0, 32);
};

// Toggle like for a message (add if not liked, remove if liked)
export const toggleVoiceLike = async (messageId: string): Promise<boolean> => {
  try {
    // Get user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[voiceService] Error getting session:', sessionError);
    }
    
    const userId = sessionData?.session?.user?.id;
    const fingerprint = !userId ? getBrowserFingerprint() : null;

    console.log('[voiceService] Toggle like:', { 
      messageId, 
      userId: userId || 'anonymous', 
      hasFingerprint: !!fingerprint,
      isAuthenticated: !!userId 
    });

    // Call toggle function - IMPORTANT: Pass userId as UUID string, not null if authenticated
    const { data, error } = await supabase.rpc('toggle_voice_like', {
      p_message_id: messageId,
      p_user_id: userId || null,  // This should be UUID or null
      p_fingerprint: !userId ? fingerprint : null  // Only use fingerprint for anonymous users
    });

    if (error) {
      console.error('[voiceService] Failed to toggle like:', error);
      return false;
    }

    console.log('[voiceService] Toggle like result:', data);
    return data as boolean; // Returns true if now liked, false if now unliked
  } catch (error) {
    console.error('[voiceService] Error toggling like:', error);
    return false;
  }
};

// Check if user has liked a message
export const hasUserLikedMessage = async (messageId: string): Promise<boolean> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const fingerprint = !userId ? getBrowserFingerprint() : null;

    const { data, error } = await supabase.rpc('has_user_liked_message', {
      p_message_id: messageId,
      p_user_id: userId || null,
      p_fingerprint: fingerprint
    });

    if (error) {
      console.error('[voiceService] Failed to check like status', error);
      return false;
    }

    return data as boolean;
  } catch (error) {
    console.error('[voiceService] Error checking like status', error);
    return false;
  }
};

// Get all message IDs that the user has liked
export const getUserLikedMessages = async (): Promise<string[]> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    const fingerprint = !userId ? getBrowserFingerprint() : null;

    const { data, error } = await supabase.rpc('get_user_liked_messages', {
      p_user_id: userId || null,
      p_fingerprint: fingerprint
    });

    if (error) {
      console.error('[voiceService] Failed to get liked messages', error);
      return [];
    }

    return (data as { message_id: string }[] || []).map(item => item.message_id);
  } catch (error) {
    console.error('[voiceService] Error getting liked messages', error);
    return [];
  }
};

// Increment comment count for a voice message
export const incrementCommentCount = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_voice_comment_count', { message_id: messageId });
    if (error) {
      console.error('[voiceService] Failed to increment comment count', error);
    }
  } catch (error) {
    console.error('[voiceService] Error incrementing comment count', error);
  }
};

// Increment share count for a voice message
export const incrementShareCount = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_voice_share_count', { message_id: messageId });
    if (error) {
      console.error('[voiceService] Failed to increment share count', error);
    }
  } catch (error) {
    console.error('[voiceService] Error incrementing share count', error);
  }
};

// ============================================================================
// DELETE VOICE MESSAGE
// ============================================================================

export interface DeleteResult {
  success: boolean;
  error?: 'NOT_FOUND' | 'NOT_OWNER' | 'PERMISSION_DENIED' | 'UNKNOWN';
  message?: string;
}

/**
 * Delete a voice message
 * Only the owner of the message can delete it
 * @param messageId - The ID of the message to delete
 * @returns DeleteResult indicating success or failure with error type
 */
export const deleteVoiceMessage = async (messageId: string): Promise<DeleteResult> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'You must be logged in to delete messages'
      };
    }

    // First, fetch the message to check ownership
    const { data: message, error: fetchError } = await supabase
      .from(MESSAGES_TABLE)
      .select('id, user_id, audio_url')
      .eq('id', messageId)
      .eq('type', 'VOICE')
      .single();

    if (fetchError || !message) {
      console.error('[voiceService] Message not found', fetchError);
      return {
        success: false,
        error: 'NOT_FOUND',
        message: 'Voice message not found'
      };
    }

    // Check if user owns this message
    if (message.user_id !== user.id) {
      return {
        success: false,
        error: 'NOT_OWNER',
        message: 'You can only delete your own voice messages'
      };
    }

    // Delete the audio file from storage if it exists
    if (message.audio_url) {
      try {
        // Extract file path from URL
        const urlParts = message.audio_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `voice_${fileName}`;
        
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([filePath]);
        
        if (storageError) {
          console.warn('[voiceService] Failed to delete audio file from storage', storageError);
          // Continue with message deletion even if storage deletion fails
        }
      } catch (storageError) {
        console.warn('[voiceService] Error deleting audio file', storageError);
        // Continue with message deletion
      }
    }

    // Delete the message from database
    const { error: deleteError } = await supabase
      .from(MESSAGES_TABLE)
      .delete()
      .eq('id', messageId)
      .eq('user_id', user.id); // Double-check ownership in the query

    if (deleteError) {
      console.error('[voiceService] Failed to delete message', deleteError);
      return {
        success: false,
        error: 'UNKNOWN',
        message: 'Failed to delete voice message'
      };
    }

    return {
      success: true,
      message: 'Voice message deleted successfully'
    };

  } catch (error) {
    console.error('[voiceService] Error deleting voice message', error);
    return {
      success: false,
      error: 'UNKNOWN',
      message: 'An unexpected error occurred'
    };
  }
};

// Update trending voice messages (can be called periodically)
export const updateTrendingMessages = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('update_trending_voice_messages');
    if (error) {
      console.error('[voiceService] Failed to update trending messages', error);
    }
  } catch (error) {
    console.error('[voiceService] Error updating trending messages', error);
  }
};

// ============================================================================
// COMMENTS
// ============================================================================

export interface VoiceComment {
  id: string;
  message_id: string;
  author_pseudonym: string;
  content: string;
  likes_count: number;
  created_at: string;
}

// Fetch comments for a voice message
export const fetchComments = async (messageId: string): Promise<VoiceComment[]> => {
  try {
    const { data, error } = await supabase.rpc('get_message_comments', {
      msg_id: messageId,
      comment_limit: 50
    });
    
    if (error) {
      console.error('[voiceService] Failed to fetch comments', error);
      return [];
    }
    
    return (data || []) as VoiceComment[];
  } catch (error) {
    console.error('[voiceService] Error fetching comments', error);
    return [];
  }
};

// Add a comment to a voice message
export const addComment = async (
  messageId: string,
  content: string,
  authorName: string = 'Anonymous'
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('add_voice_comment', {
      msg_id: messageId,
      comment_content: content,
      author_name: authorName
    });
    
    if (error) {
      console.error('[voiceService] Failed to add comment', error);
      return null;
    }
    
    return data as string;
  } catch (error) {
    console.error('[voiceService] Error adding comment', error);
    return null;
  }
};

// Subscribe to new comments for a specific message
export const subscribeToComments = (
  messageId: string,
  onNewComment: (comment: VoiceComment) => void
) => {
  const channel = supabase
    .channel(`comments_${messageId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'voice_comments',
        filter: `message_id=eq.${messageId}`
      },
      (payload) => {
        const comment = payload.new as VoiceComment;
        onNewComment(comment);
      }
    )
    .subscribe();

  return () => {
    try {
      supabase.removeChannel(channel);
    } catch (e) {
      console.error('[voiceService] Error removing comments channel', e);
    }
  };
};

// Increment comment likes
export const incrementCommentLikes = async (commentId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_comment_likes', {
      comment_id: commentId
    });
    if (error) {
      console.error('[voiceService] Failed to increment comment likes', error);
    }
  } catch (error) {
    console.error('[voiceService] Error incrementing comment likes', error);
  }
};

// ============================================================================
// ACTIVITIES
// ============================================================================

export interface VoiceActivity {
  id: string;
  message_id: string;
  user_pseudonym: string;
  activity_type: 'play' | 'like' | 'share' | 'comment';
  created_at: string;
}

// Log an activity (for activity feed)
export const logActivity = async (
  messageId: string,
  activityType: 'play' | 'like' | 'share' | 'comment',
  userName: string = 'Anonymous'
): Promise<void> => {
  try {
    await supabase.rpc('log_voice_activity', {
      msg_id: messageId,
      act_type: activityType,
      user_name: userName
    });
  } catch (error) {
    console.error('[voiceService] Error logging activity', error);
  }
};

// Fetch recent activities
export const fetchRecentActivities = async (limit: number = 20): Promise<VoiceActivity[]> => {
  try {
    const { data, error } = await supabase.rpc('get_recent_activities', {
      activity_limit: limit
    });
    
    if (error) {
      console.error('[voiceService] Failed to fetch activities', error);
      return [];
    }
    
    return (data || []) as VoiceActivity[];
  } catch (error) {
    console.error('[voiceService] Error fetching activities', error);
    return [];
  }
};

// Subscribe to new activities
export const subscribeToActivities = (
  onNewActivity: (activity: VoiceActivity) => void
) => {
  // Non-critical activity feed: 30s polling instead of a global unfiltered
  // realtime stream on `voice_activities`.
  let lastSeen = new Date().toISOString();
  let stopped = false;

  const poll = async () => {
    if (stopped || document.visibilityState !== 'visible') return;
    const { data, error } = await supabase
      .from('voice_activities')
      .select('*')
      .gt('created_at', lastSeen)
      .order('created_at', { ascending: true })
      .limit(20);

    if (error || !data?.length) return;
    lastSeen = (data[data.length - 1] as { created_at: string }).created_at;
    data.forEach((row) => onNewActivity(row as VoiceActivity));
  };

  const interval = setInterval(poll, 30_000);

  return () => {
    stopped = true;
    clearInterval(interval);
  };
};

// ============================================================================
// ANALYTICS
// ============================================================================

export interface DailyStats {
  date: string;
  plays: number;
  likes: number;
  shares: number;
  comments: number;
}

export interface AnalyticsSummary {
  total_plays: number;
  total_likes: number;
  total_shares: number;
  total_comments: number;
  total_messages: number;
  avg_plays_per_message: number;
  avg_likes_per_message: number;
}

// Fetch daily statistics
export const fetchDailyStats = async (days: number = 7): Promise<DailyStats[]> => {
  try {
    const { data, error } = await supabase.rpc('get_daily_stats', {
      days_count: days
    });
    
    if (error) {
      console.error('[voiceService] Failed to fetch daily stats', error);
      return [];
    }
    
    return (data || []) as DailyStats[];
  } catch (error) {
    console.error('[voiceService] Error fetching daily stats', error);
    return [];
  }
};

// Fetch analytics summary
export const fetchAnalyticsSummary = async (days: number = 30): Promise<AnalyticsSummary | null> => {
  try {
    const { data, error } = await supabase.rpc('get_analytics_summary', {
      days_count: days
    });
    
    if (error) {
      console.error('[voiceService] Failed to fetch analytics summary', error);
      return null;
    }
    
    return data?.[0] as AnalyticsSummary || null;
  } catch (error) {
    console.error('[voiceService] Error fetching analytics summary', error);
    return null;
  }
};

// Fetch top performing messages
export const fetchTopMessages = async (
  metric: 'play_count' | 'like_count' | 'comment_count' | 'share_count' = 'play_count',
  limit: number = 10,
  days: number = 30
): Promise<Message[]> => {
  try {
    const { data, error } = await supabase.rpc('get_top_messages', {
      metric: metric,
      message_limit: limit,
      days_count: days
    });
    
    if (error) {
      console.error('[voiceService] Failed to fetch top messages', error);
      return [];
    }
    
    return (data || []) as Message[];
  } catch (error) {
    console.error('[voiceService] Error fetching top messages', error);
    return [];
  }
};

// ============================================================================
// SHARE ANALYTICS
// ============================================================================

/**
 * Log a share action with analytics
 * @param messageId - The message being shared
 * @param platform - Which platform/method was used to share
 * @param shareUrl - The full URL that was shared
 * @param referrerUrl - Optional: where the share originated from
 * @returns The created share record
 */
export const logVoiceShare = async (
  messageId: string,
  platform: VoiceShare['platform'],
  shareUrl: string,
  referrerUrl?: string
): Promise<VoiceShare | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase.rpc('log_voice_share', {
      p_message_id: messageId,
      p_user_id: user?.id || null,
      p_platform: platform,
      p_share_url: shareUrl,
      p_referrer_url: referrerUrl || null,
      p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    });
    
    if (error) {
      console.error('[voiceService] Failed to log share', error);
      return null;
    }
    
    return data as VoiceShare;
  } catch (error) {
    console.error('[voiceService] Error logging share', error);
    return null;
  }
};

/**
 * Log when someone clicks on a shared link
 * @param messageId - The message being accessed
 * @param landingUrl - The URL they landed on
 * @param referrerUrl - Where they came from (e.g., "twitter.com", "facebook.com")
 * @returns The created click record ID
 */
export const logVoiceShareClick = async (
  messageId: string,
  landingUrl: string,
  referrerUrl?: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('log_voice_share_click', {
      p_message_id: messageId,
      p_landing_url: landingUrl,
      p_referrer_url: referrerUrl || null,
      p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    });
    
    if (error) {
      console.error('[voiceService] Failed to log share click', error);
      return null;
    }
    
    // Store click ID in sessionStorage for conversion tracking
    if (data?.id) {
      try {
        sessionStorage.setItem('voice_share_click_id', data.id);
      } catch (e) {
        console.warn('[voiceService] Could not store click ID', e);
      }
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('[voiceService] Error logging share click', error);
    return null;
  }
};

/**
 * Update conversion metrics for a share click
 * @param clickId - The click record ID (from sessionStorage)
 * @param metrics - Which conversion events occurred
 */
export const updateShareClickConversion = async (
  clickId: string,
  metrics: {
    didSignup?: boolean;
    didPlay?: boolean;
    didLike?: boolean;
    didShare?: boolean;
    sessionDuration?: number;
  }
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('update_share_click_conversion', {
      p_click_id: clickId,
      p_did_signup: metrics.didSignup ?? null,
      p_did_play: metrics.didPlay ?? null,
      p_did_like: metrics.didLike ?? null,
      p_did_share: metrics.didShare ?? null,
      p_session_duration: metrics.sessionDuration ?? null
    });
    
    if (error) {
      console.error('[voiceService] Failed to update click conversion', error);
    }
  } catch (error) {
    console.error('[voiceService] Error updating click conversion', error);
  }
};

/**
 * Get share analytics for a specific message
 * @param messageId - The message ID
 * @returns Comprehensive share analytics
 */
export const getMessageShareAnalytics = async (messageId: string): Promise<MessageShareAnalytics | null> => {
  try {
    const { data, error } = await supabase.rpc('get_message_share_analytics', {
      p_message_id: messageId
    });
    
    if (error) {
      console.error('[voiceService] Failed to get share analytics', error);
      return null;
    }
    
    return data ? data[0] : null;
  } catch (error) {
    console.error('[voiceService] Error getting share analytics', error);
    return null;
  }
};

/**
 * Get viral growth metrics over time
 * @param days - Number of days to analyze
 * @returns Daily viral growth metrics
 */
export const getViralGrowthMetrics = async (days: number = 7): Promise<ViralGrowthMetric[]> => {
  try {
    const { data, error } = await supabase.rpc('get_viral_growth_metrics', {
      p_days: days
    });
    
    if (error) {
      console.error('[voiceService] Failed to get viral metrics', error);
      return [];
    }
    
    return (data || []) as ViralGrowthMetric[];
  } catch (error) {
    console.error('[voiceService] Error getting viral metrics', error);
    return [];
  }
};

/**
 * Helper: Get the click ID from current session for conversion tracking
 */
export const getCurrentShareClickId = (): string | null => {
  try {
    return sessionStorage.getItem('voice_share_click_id');
  } catch (e) {
    return null;
  }
};

/**
 * Helper: Track conversion event if this is from a shared link
 */
export const trackShareConversion = async (
  event: 'signup' | 'play' | 'like' | 'share',
  sessionDuration?: number
): Promise<void> => {
  const clickId = getCurrentShareClickId();
  if (!clickId) return;
  
  const metrics: Parameters<typeof updateShareClickConversion>[1] = {};
  
  switch (event) {
    case 'signup':
      metrics.didSignup = true;
      break;
    case 'play':
      metrics.didPlay = true;
      break;
    case 'like':
      metrics.didLike = true;
      break;
    case 'share':
      metrics.didShare = true;
      break;
  }
  
  if (sessionDuration !== undefined) {
    metrics.sessionDuration = sessionDuration;
  }
  
  await updateShareClickConversion(clickId, metrics);
};

