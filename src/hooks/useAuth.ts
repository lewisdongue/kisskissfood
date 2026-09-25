import { useState, useEffect, useLayoutEffect, useRef } from "react";
import toast from "react-hot-toast";
import type { User } from "../types";
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  setUserOffline,
  updateUser,
  persistSupabaseSession,
  clearPersistedSupabaseSession,
  ensureUserProfileForAuthUser,
} from "../services/supabaseService";
import { extractReferralCode, getReferralCodeForSignup } from "../utils/helpers";
import { supabase } from "../config/supabase";
import { updateDailyStreak } from "../services/progressionService";
import { 
  getOrCreateGuestUser, 
  getCurrentUserId,
  isGuestMode,
  type GuestUser 
} from "../utils/guestUser";

const TIKTOK_AUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "TikTok sign-in was cancelled.",
  missing_tiktok_callback_params: "TikTok sign-in failed. Please try again.",
  missing_tiktok_state_secret: "TikTok sign-in is misconfigured. Please contact support.",
  invalid_state: "TikTok sign-in session is invalid. Please try again.",
  invalid_state_signature: "TikTok sign-in session is invalid. Please try again.",
  expired_state: "TikTok sign-in timed out. Please try again.",
  tiktok_auth_failed: "TikTok sign-in failed. Please try again.",
  tiktok_token_exchange_failed: "Could not verify TikTok account. Please try again.",
  tiktok_user_info_failed: "Could not fetch TikTok profile. Please try again.",
};

function readCachedAuthenticatedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const savedUser = window.localStorage.getItem("audioChat_user");
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser) as User | GuestUser;
    return parsed && !("isGuest" in parsed) && parsed.id ? parsed : null;
  } catch (err) {
    console.warn("Failed to parse saved user:", err);
    window.localStorage.removeItem("audioChat_user");
    return null;
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<User | GuestUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const streakInitRef = useRef<string | null>(null);

  // Keep the server and first client render identical, then restore the last
  // verified profile before paint. This avoids both an auth flash and a full
  // hydration rebuild on slower phones.
  useLayoutEffect(() => {
    const cachedUser = readCachedAuthenticatedUser();
    if (!cachedUser) return;
    setUser(cachedUser);
    document.documentElement.setAttribute("data-authed", "1");
    document.documentElement.removeAttribute("data-auth-pending");
  }, []);

  useEffect(() => {
    mounted.current = true;

    // Persist ref from URL so it survives OAuth redirect (e.g. friend opens ?ref=... then signs in with Google)
    extractReferralCode();

    // Handle auth_error param set by tiktok-auth-callback on failure
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get("auth_error");
    if (authError) {
      const message = TIKTOK_AUTH_ERROR_MESSAGES[authError] ?? "TikTok sign-in failed. Please try again.";
      toast.error(message, { duration: 6000 });
      // Clean the param from URL without a page reload
      urlParams.delete("auth_error");
      const cleanSearch = urlParams.toString();
      const newUrl = window.location.pathname + (cleanSearch ? `?${cleanSearch}` : "") + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }

    const initializeAuth = async () => {
      try {
        // Try to get authenticated user
        const currentUser = await getCurrentUser();
        if (currentUser && mounted.current) {
          setUser(currentUser);
          document.documentElement.setAttribute("data-authed", "1");
          document.documentElement.removeAttribute("data-auth-pending");
          localStorage.setItem("audioChat_user", JSON.stringify(currentUser));
        } else if (!currentUser && !localStorage.getItem("audioChat_user")) {
          document.documentElement.removeAttribute("data-authed");
          document.documentElement.removeAttribute("data-auth-pending");
        }
        // DON'T create guest user here - let components create it on-demand
      } catch (err) {
        console.error("Error initializing auth", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes and persist/clear sessions accordingly
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        document.documentElement.setAttribute("data-auth-pending", "1");
        persistSupabaseSession(session);
        // Never await another auth/database call inside onAuthStateChange.
        // The auth client holds its internal lock while this callback runs;
        // awaiting Supabase here can deadlock sign-up and sign-in globally.
        window.setTimeout(() => {
          const referredBy = getReferralCodeForSignup() ?? undefined;
          void ensureUserProfileForAuthUser(session.user, referredBy).then((profile) => {
            if (profile && mounted.current) {
              setUser(profile);
              localStorage.setItem("audioChat_user", JSON.stringify(profile));
            }
          });
        }, 0);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        document.documentElement.removeAttribute("data-authed");
        document.documentElement.removeAttribute("data-auth-pending");
        clearPersistedSupabaseSession();
      }
    });

    return () => {
      mounted.current = false;
      // setLoading(false);
      // Clean up auth listener on unmount
      // no timers to clear from simplified initialization
      // unsubscribe shape: supabase v2 returns { data: { subscription } }
      // or a listener object depending on env; handle both.
      try {
        const unknownListener: unknown = authListener;
        if (unknownListener) {
          type ListenerShape = {
            data?: { subscription?: { unsubscribe?: () => void } };
            unsubscribe?: () => void;
          };
          const l = unknownListener as ListenerShape;
          if (
            l.data?.subscription &&
            typeof l.data.subscription.unsubscribe === "function"
          ) {
            l.data.subscription.unsubscribe();
          } else if (typeof l.unsubscribe === "function") {
            l.unsubscribe();
          }
        }
      } catch {
        // ignore unsubscribe errors
      }
    };
  }, []);

  useEffect(() => {
    const authedUser = user && !("isGuest" in user) ? user : null;
    if (!authedUser) return;
    if (streakInitRef.current === authedUser.id) return;

    streakInitRef.current = authedUser.id;

    const run = async () => {
      const progress = await updateDailyStreak();
      if (!progress) return;
      const updatedUser = { ...authedUser, ...progress };
      setUser(updatedUser);
      localStorage.setItem("audioChat_user", JSON.stringify(updatedUser));
    };

    run();
  }, [user]);

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    console.log("[useAuth.login] attempting signIn", { email });
    const loggedInUser = await signIn(email, password);
    console.log("[useAuth.login] signIn completed", loggedInUser);
    if (loggedInUser) {
      console.log("[useAuth.login] signIn returned user", {
        id: loggedInUser.id,
      });
      setUser(loggedInUser);
      localStorage.setItem("audioChat_user", JSON.stringify(loggedInUser));
      return loggedInUser;
    }

    // If signIn returned null, check Supabase session directly (network may have succeeded but profile missing)
    try {
      console.warn(
        "[useAuth.login] signIn returned null, checking supabase session directly"
      );
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("[useAuth.login] session check", { authenticated: Boolean(session?.user) });
      if (session && session.user) {
        // Try to fetch canonical profile
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log("[useAuth.login] got currentUser after session present", {
            id: currentUser.id,
          });
          setUser(currentUser);
          localStorage.setItem("audioChat_user", JSON.stringify(currentUser));
          return currentUser;
        }
        // No canonical profile found yet. Do not fabricate a fallback user.
        console.warn(
          "[useAuth.login] session exists but canonical users table profile not found; refusing to fabricate fallback"
        );
        return null;
      }
    } catch (err) {
      console.error(
        "[useAuth.login] error checking session after signIn null",
        err
      );
    }

    return null;
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    country: string,
    language: string
  ): Promise<User | null> => {
    const referralCode = extractReferralCode();
    const newUser = await signUp(
      email,
      password,
      name,
      country,
      language,
      referralCode || undefined
    );

    if (!newUser) return null;

    // If signUp returned a fallback user (profile couldn't be inserted yet),
    // try to fetch the canonical profile from the users table. If that
    // doesn't exist yet (email confirmation flows), fall back to the
    // returned object.
    const refreshed = await getCurrentUser();
    const finalUser = refreshed || newUser;

    setUser(finalUser);
    localStorage.setItem("audioChat_user", JSON.stringify(finalUser));
    return finalUser;
  };

  const logout = async () => {
    if (user && !('isGuest' in user && user.isGuest)) {
      // Only call setUserOffline for authenticated users
      await setUserOffline(user.id);
    }
    await signOut();
    setUser(null);
    localStorage.removeItem("audioChat_user");
    document.documentElement.removeAttribute("data-authed");
    document.documentElement.removeAttribute("data-auth-pending");
    // DON'T create guest user after logout - let user navigate normally
  };

  const updateUserData = (updates: Partial<User>) => {
    if (user) {
      // Don't allow updating guest users
      if ('isGuest' in user && user.isGuest) {
        console.warn('Cannot update guest user data');
        return;
      }
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("audioChat_user", JSON.stringify(updatedUser));
      updateUser(user.id, updates);
    }
  };

  // Helper to check if current user is guest
  const isGuest = user ? isGuestMode(user) : false;

  return {
    user,
    loading,
    login,
    signup,
    logout,
    updateUserData,
    isGuest, // Export guest mode status
    // DON'T provide userId here - let components handle it
  };
};
