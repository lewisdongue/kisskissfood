import { supabase, SUPABASE_FUNCTIONS_URL, TABLES } from '../config/supabase';
import type { User, FriendRequest } from '../types';
import { generateReferralCode, calculateYUYUIncrease, clearStoredReferralCode } from '../utils/helpers';
// Note: NotificationService no longer needed here - notifications are handled by database triggers

// Cache for getCurrentUser to reduce DB calls
let userCache: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Persist Supabase session to localStorage so page reloads retain auth state
const LOCAL_SESSION_KEY = 'audioChat_supabase_session';

const saveSessionToLocal = (session: unknown | null) => {
    try {
        if (!session) {
            window.localStorage.removeItem(LOCAL_SESSION_KEY);
            return;
        }
        window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } catch {
        // ignore storage errors
    }
};

// const readSessionFromLocal = (): unknown | null => {
//     try {
//         const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
//         if (!raw) return null;
//         return JSON.parse(raw);
//     } catch {
//         return null;
//     }
// };

// Expose small helpers for other modules (useAuth) to persist/clear session
export const persistSupabaseSession = (session: unknown | null) => saveSessionToLocal(session);
export const clearPersistedSupabaseSession = () => saveSessionToLocal(null);

// Authentication
export const signUp = async (
    email: string,
    password: string,
    name: string,
    country: string,
    language: string,
    referredBy?: string
): Promise<User | null> => {
    userCache = null;
    // Sign up with Supabase Auth (email auto-confirm is enabled, so a session
    // is created right away). Errors are thrown so the UI can show the reason.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        // Existing account -> transparently sign the user in instead of failing.
        const msg = (authError.message || '').toLowerCase();
        if (msg.includes('already registered') || msg.includes('already been registered')) {
            const existing = await signIn(email, password);
            if (existing) return existing;
            throw new Error('This email already has an account. Please sign in.');
        }
        throw authError;
    }
    if (!authData.user) throw new Error('No user returned from signup');
    if (Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
        return signIn(email, password);
    }

    // Guarantee an authenticated session before touching the users table (RLS).
    let session = authData.session;
    if (!session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
            throw new Error('Your account was created. Confirm your email, then sign in.');
        }
        session = signInData?.session ?? null;
    }
    if (!session) throw new Error('Your account was created. Confirm your email, then sign in.');
    try { saveSessionToLocal(session); } catch (err) { console.warn('Could not save session', err); }

    const referralCode = generateReferralCode();

    // Create (or repair) the profile row in the users table.
    const { data: userData, error: userError } = await supabase
        .from(TABLES.USERS)
        .upsert(
            {
                id: authData.user.id,
                email,
                name,
                country,
                language,
                referral_code: referralCode,
                referred_by: referredBy || null,
                yuyu_score: 0,
                balance: 0,
                hide_picture: false,
            },
            { onConflict: 'id' }
        )
        .select()
        .single();

    if (userError || !userData) {
        console.error('User profile creation error DETAILS:', userError);
        throw new Error(userError?.message || 'Could not create your profile. Please try again.');
    }

    try {


        // If user was referred, create referral record and award bonus
        if (referredBy) {
            try {
                await createReferral(referredBy, userData.id);
            } catch (refError) {
                console.error('Error creating referral record:', refError);
                // Don't fail signup if referral fails
            }
        }

        // Endowment: one-time welcome bonus 100 YUYU (bonus, non-withdrawable)
        try {
            const { data: bonusResult } = await supabase.rpc('credit_welcome_bonus_yuyu', {
                p_user_id: userData.id,
            });
            const res = bonusResult as { granted?: boolean; new_yuyu_score?: number } | null;
            if (res?.granted && typeof res.new_yuyu_score === 'number') {
                userData.yuyu_score = res.new_yuyu_score;
                try {
                    sessionStorage.setItem('caakus_show_welcome_bonus', '1');
                } catch {
                    // ignore
                }
            }
        } catch (bonusErr) {
            console.error('Error crediting welcome bonus:', bonusErr);
            // Don't fail signup
        }

    } catch (error) {
        console.error('Non-fatal post-signup step failed:', error);
    }

    return userData;

};

/** Auth user shape (Supabase Auth User) for profile creation */
type AuthUserLike = {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
};

/**
 * Ensures a row exists in the users table for the given auth user (e.g. after OAuth callback).
 * Use this when SIGNED_IN fires so Google (or other OAuth) users get a profile created.
 */
export const ensureUserProfileForAuthUser = async (
    authUser: AuthUserLike,
    referredBy?: string
): Promise<User | null> => {
    try {
        const { data: existingUser, error: userError } = await supabase
            .from(TABLES.USERS)
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

        if (userError && userError.code !== 'PGRST116') {
            console.error('Error checking existing user:', userError);
            return null;
        }
        if (existingUser) {
            if (referredBy) await createReferral(referredBy, existingUser.id);
            return existingUser;
        }

        const meta = authUser.user_metadata ?? {};
        const name = (meta.full_name as string) || (meta.name as string) || 'User';
        const avatar = (meta.avatar_url as string) || (meta.picture as string) || null;
        const referralCode = generateReferralCode();
        const newUserData = {
            id: authUser.id,
            email: authUser.email ?? '',
            name,
            country: (meta.locale as string) || '',
            language: 'en',
            referral_code: referralCode,
            referred_by: referredBy || null,
            yuyu_score: 0,
            balance: 0,
            hide_picture: false,
            profile_picture: avatar,
        };

        const { data: userData, error: insertError } = await supabase
            .from(TABLES.USERS)
            .upsert(newUserData, { onConflict: 'id', ignoreDuplicates: true })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating OAuth user profile:', insertError);
            return null;
        }

        if (referredBy) {
            try {
                await createReferral(referredBy, userData.id);
            } catch (refError) {
                console.error('Error creating referral record for OAuth user:', refError);
            }
        }

        try {
            const { data: bonusResult } = await supabase.rpc('credit_welcome_bonus_yuyu', {
                p_user_id: userData.id,
            });
            const res = bonusResult as { granted?: boolean; new_yuyu_score?: number } | null;
            if (res?.granted && typeof res.new_yuyu_score === 'number') {
                userData.yuyu_score = res.new_yuyu_score;
                try {
                    sessionStorage.setItem('caakus_show_welcome_bonus', '1');
                } catch {
                    // ignore
                }
            }
        } catch (bonusErr) {
            console.error('Error crediting welcome bonus:', bonusErr);
        }

        userCache = { user: userData, timestamp: Date.now() };
        return userData;
    } catch (error) {
        console.error('ensureUserProfileForAuthUser failed:', error);
        return null;
    }
};

/**
 * Initiates Google OAuth sign-in. The browser redirects to Google; after sign-in,
 * Supabase redirects back to your site and the session is restored. Use
 * onAuthStateChange(SIGNED_IN) + ensureUserProfileForAuthUser to create/fetch the user profile.
 */
export const signInWithGoogle = async (_referredBy?: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) {
        console.error('Google OAuth error:', error);
        throw error;
    }
    // Redirect happens; profile is created in useAuth when SIGNED_IN fires after return.
};

/**
 * Initiates Facebook OAuth sign-in/sign-up. The browser redirects to Facebook;
 * after sign-in, Supabase redirects back and the session is restored. Profile
 * is created in useAuth via ensureUserProfileForAuthUser on SIGNED_IN.
 */
export const signInWithFacebook = async (_referredBy?: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) {
        console.error('Facebook OAuth error:', error);
        throw error;
    }
};

/**
 * Initiates Apple OAuth sign-in/sign-up. The browser redirects to Apple;
 * after sign-in, Supabase redirects back and the session is restored.
 */
export const signInWithApple = async (_referredBy?: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) {
        console.error('Apple OAuth error:', error);
        throw error;
    }
};

export const signInWithTikTok = async (referredBy?: string): Promise<void> => {
    if (!SUPABASE_FUNCTIONS_URL) {
        throw new Error('Backend functions are unavailable');
    }

    const url = new URL(`${SUPABASE_FUNCTIONS_URL}/tiktok-auth-start`);
    url.searchParams.set('app_url', window.location.origin);

    if (referredBy) {
        url.searchParams.set('ref', referredBy);
    }

    window.location.assign(url.toString());
};

export const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
        userCache = null;
        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No user returned from sign in');

        // Persist session
        try {
            const { data: { session } } = await supabase.auth.getSession();
            saveSessionToLocal(session);
        } catch {
            // ignore
        }

        // Get user profile from users table
        const { data: userData, error: profileError } = await supabase
            .from(TABLES.USERS)
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (userData) return userData;
        if (profileError) {
            console.warn('Profile lookup failed; attempting repair:', profileError.message);
        }

        // Profile missing (legacy account) -> repair it instead of failing.
        const { data: repaired, error: repairError } = await supabase
            .from(TABLES.USERS)
            .upsert(
                {
                    id: authData.user.id,
                    email: authData.user.email ?? email,
                    name: (authData.user.email ?? email).split('@')[0],
                    country: 'Unknown',
                    language: 'en',
                    referral_code: generateReferralCode(),
                    yuyu_score: 0,
                    balance: 0,
                    hide_picture: false,
                },
                { onConflict: 'id' }
            )
            .select()
            .single();

        if (repairError) throw repairError;
        return repaired;
    } catch (error) {
        console.error('Error signing in user:', error);
        throw error;
    }

};

export const signOut = async (): Promise<boolean> => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        // Clear user cache on sign out
        userCache = null;
        // Clear persisted session
    try { saveSessionToLocal(null); } catch (err) { console.warn('Could not clear persisted session', err); }
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
};

// export const getCurrentUser = async (): Promise<User | null> => {
//     try {
//         // Check cache first
//         if (userCache && (Date.now() - userCache.timestamp) < CACHE_DURATION) {
//             return userCache.user;
//         }

//         // Try to get current user from supabase client
//         let { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

//         // If supabase client has no user, attempt to restore persisted session
//         if (!authUser) {
//             const stored = readSessionFromLocal();
//             if (stored && (stored as Record<string, unknown>).access_token) {
//                 try {
//                     // setSession will update client's internal state
//                     // call setSession if available to restore client state from persisted session
//                     type MaybeAuth = { setSession?: (s: unknown) => Promise<unknown> };
//                     const maybeAuth = supabase.auth as unknown as MaybeAuth;
//                     if (maybeAuth.setSession) {
//                         try {
//                             await maybeAuth.setSession(stored);
//                         } catch {
//                             // ignore
//                         }
//                     }
//                     const fresh = await supabase.auth.getUser();
//                     authUser = fresh.data.user;
//                     authError = fresh.error;
//                 } catch {
//                     // ignore
//                 }
//             }
//         }

//         if (authError) {
//             console.error('Auth error getting user:', authError);
//             userCache = { user: null, timestamp: Date.now() };
//             return null;
//         }
//         if (!authUser) {
//             userCache = { user: null, timestamp: Date.now() };
//             return null;
//         }

//         // Get user profile from users table
//         const { data: userData, error: userError } = await supabase
//             .from(TABLES.USERS)
//             .select('*')
//             .eq('id', authUser.id)
//             .single();

//         if (userError) {
//             console.error('Database error getting user profile:', userError);
//             // If profile not found, clear cache and return null
//             userCache = { user: null, timestamp: Date.now() };
//             return null;
//         }

//         // Update cache
//         userCache = { user: userData, timestamp: Date.now() };
//         return userData;
//     } catch (error) {
//         console.error('Error getting current user:', error);
//         userCache = { user: null, timestamp: Date.now() };
//         return null;
//     }
// };
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Check cache
    if (userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      return userCache.user;
    }

    // Use Supabase client
    const { data: { user: authUser }, error } = await supabase.auth.getUser();

    if (error || !authUser) {
      userCache = { user: null, timestamp: Date.now() };
      return null;
    }

    // Get full profile
    const { data: userData, error: userError } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (userError) {
      userCache = { user: null, timestamp: Date.now() };
      return null;
    }

    if (!userData) {
      const repaired = await ensureUserProfileForAuthUser(authUser);
      userCache = { user: repaired, timestamp: Date.now() };
      return repaired;
    }

    userCache = { user: userData, timestamp: Date.now() };
    return userData;
  } catch (err) {
    console.error(err);
    userCache = { user: null, timestamp: Date.now() };
    return null;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from(TABLES.USERS)
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
};

// Online Users Management
export const setUserOnline = async (userId: string, language: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from(TABLES.ONLINE_USERS)
            .upsert({
                user_id: userId,
                language,
                last_seen: new Date().toISOString(),
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error setting user online:', error);
        return false;
    }
};

export const setUserOffline = async (userId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from(TABLES.ONLINE_USERS)
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error setting user offline:', error);
        return false;
    }
};

export const findRandomUser = async (
    currentUserId: string,
    preferredLanguage: string
): Promise<string | null> => {
    try {
        // First try to find user with same language
        const { data: languageData, error } = await supabase
            .from(TABLES.ONLINE_USERS)
            .select('user_id')
            .eq('language', preferredLanguage)
            .neq('user_id', currentUserId)
            .limit(10);

        if (error) throw error;

        let data = languageData;

        // If no match, try global
        if (!data || data.length === 0) {
            const result = await supabase
                .from(TABLES.ONLINE_USERS)
                .select('user_id')
                .neq('user_id', currentUserId)
                .limit(10);

            if (result.error) throw result.error;
            data = result.data || [];
        }

        if (!data || data.length === 0) return null;

        // Pick random user from available
        const randomIndex = Math.floor(Math.random() * data.length);
        return data[randomIndex].user_id;
    } catch (error) {
        console.error('Error finding random user:', error);
        return null;
    }
};

// Call Session Management
export const createCallSession = async (
    user1Id: string,
    user2Id: string
): Promise<string | null> => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CALL_SESSIONS)
            .insert({
                user1_id: user1Id,
                user2_id: user2Id,
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error creating call session:', error);
        return null;
    }
};

export const endCallSession = async (sessionId: string, duration: number): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from(TABLES.CALL_SESSIONS)
            .update({
                ended_at: new Date().toISOString(),
                duration,
            })
            .eq('id', sessionId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error ending call session:', error);
        return false;
    }
};

// Friend Request Management
export const createFriendRequest = async (
    fromUserId: string,
    toUserId: string,
    fromUserConfirmed: boolean
): Promise<FriendRequest | null> => {
    try {
        // Idempotency: if a pending/accepted relationship already exists between these two users,
        // do not create duplicates (prevents "not working" UX).
        const { data: existing, error: existingError } = await supabase
            .from(TABLES.FRIEND_REQUESTS)
            .select('*')
            .or(
                `and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`
            )
            .in('status', ['pending', 'accepted'])
            .limit(1)
            .maybeSingle();

        if (!existingError && existing) {
            return existing as FriendRequest;
        }

        const { data, error } = await supabase
            .from(TABLES.FRIEND_REQUESTS)
            .insert({
                from_user_id: fromUserId,
                to_user_id: toUserId,
                status: 'pending',
                from_user_confirmed: fromUserConfirmed,
                to_user_confirmed: false,
            })
            .select()
            .single();

        if (error) throw error;

        // Note: Notification is automatically sent via database trigger (notify_friend_request)

        return data;
    } catch (error) {
        console.error('Error creating friend request:', error);
        return null;
    }
};

export const declineFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from(TABLES.FRIEND_REQUESTS)
            .update({ status: 'rejected' })
            .eq('id', requestId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error declining friend request:', error);
        return false;
    }
};

export const confirmFriendRequest = async (
    requestId: string,
    _userId: string,
    isFromUser: boolean
): Promise<boolean> => {
    try {
        const field = isFromUser ? 'from_user_confirmed' : 'to_user_confirmed';

        const { data, error } = await supabase
            .from(TABLES.FRIEND_REQUESTS)
            .update({ [field]: true })
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw error;

        // If both confirmed, update status to accepted
        if (data.from_user_confirmed && data.to_user_confirmed) {
            // Update status to accepted (triggers automatic notifications via database trigger)
            await supabase
                .from(TABLES.FRIEND_REQUESTS)
                .update({ status: 'accepted' })
                .eq('id', requestId);

            // ⚠️ DISABLED: Friend bonus removed for zero-free-coins policy (2026-02-02)
            // await updateYUYU(data.from_user_id, 25);
            // await updateYUYU(data.to_user_id, 25);
        }

        return true;
    } catch (error) {
        console.error('Error confirming friend request:', error);
        return false;
    }
};

// Referral Management
export const createReferral = async (
    refParam: string,
    _referredUserId: string
): Promise<boolean> => {
    try {
        const { error } = await supabase.rpc('register_verified_referral', { p_ref: refParam.trim() });
        if (error) {
            throw error;
        }
        clearStoredReferralCode();
        return true;
    } catch (error) {
        console.error('Error creating referral:', error);
        return false;
    }
};

export const getReferralCount = async (userId: string): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from(TABLES.REFERRALS)
            .select('id', { count: 'exact', head: true })
            .eq('referrer_id', userId)
            .not('credited_at', 'is', null);

        if (error) throw error;
        return count ?? 0;
    } catch (error) {
        console.error('Error getting referral count:', error);
        return 0;
    }
};

// YUYU Score Management
export const updateYUYU = async (userId: string, points: number): Promise<boolean> => {
    try {
        // Get current score
        const { data: user } = await supabase
            .from(TABLES.USERS)
            .select('yuyu_score')
            .eq('id', userId)
            .single();

        if (!user) return false;

        const newScore = user.yuyu_score + points;

        // Update user (triggers automatic notification via database trigger if threshold met)
        await supabase
            .from(TABLES.USERS)
            .update({
                yuyu_score: newScore,
            })
            .eq('id', userId);

        // Log YUYU change
        await supabase
            .from(TABLES.YUYU_LOGS)
            .insert({
                user_id: userId,
                points,
                description: 'Activity reward',
            });

        // Note: Push notification is automatically sent via database trigger (notify_yuyu_earned)
        // if the points earned meet the user's notification threshold preference

        return true;
    } catch (error) {
        console.error('Error updating YUYU:', error);
        return false;
    }
};

// Activity tracking
export const trackActivity = async (
    _userId: string,
    callDuration: number,
    referrals: number,
    friendsCount: number
): Promise<boolean> => {
    const points = calculateYUYUIncrease(callDuration, referrals, friendsCount);
    return await updateYUYU(_userId, points);
};
