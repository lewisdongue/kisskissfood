import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "../components/Navbar";
import { setUserOnline, setUserOffline } from "../services/supabaseService";
import NotificationService from "../services/notificationService";
import i18n from "../i18n";
import type { LanguageCode } from "../types";
import { ArrowLeft } from "lucide-react";
import { CausticsBackground } from "@/components/CausticsBackground";
import { AuthModal } from "@/components/AuthModal";
import { preventDoubleClick } from "@/utils/performanceFix";
import SafetyLab from "@/components/SafetyLab";
import { AudioCall } from "../components/AudioCall";
// TEMPORARY: Disabled until properly integrated
// import { PredictivePrefetcher, initializeZeroLatencyMode } from "@/utils/zeroLatencyOptimizations";
// import { isMobileDevice, preventScreenSleep } from "@/utils/mobileOptimizations";

// ═══════════════════════════════════════════════════════════════════════════
// CALL PAGE — Dedicated route for video/audio call experience.
// MOBILE PWA OPTIMIZED with zero-latency connection
// ═══════════════════════════════════════════════════════════════════════════
export default function CallPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, login, signup, updateUserData, logout } = useAuth();
  const authedUser = user && !("isGuest" in user) ? user : null;
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") return "en";
    return (window.localStorage.getItem("audioChat_language") as LanguageCode) || "en";
  });
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authGate, setAuthGate] = useState(false); // true = unclosable, opened after the 2.5s guest tease
  const pendingStartRef = useRef(false); // remembers the guest's "Start" intent across auth
  const [isNavigating, setIsNavigating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  // TEMPORARY: Disabled
  // const [wakeLock, setWakeLock] = useState<any>(null);

  const guestSessionId = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (!user) {
      const existing = window.sessionStorage.getItem("guest-session-id");
      if (existing) return existing;
      const id = crypto.randomUUID();
      window.sessionStorage.setItem("guest-session-id", id);
      return id;
    }
    return null;
  }, [user]);

  // Auto-close modal when user successfully logs in
  useEffect(() => {
    if (user && showAuthModal) {
      console.log('✅ Login successful, closing modal');
      setShowAuthModal(false);
      setAuthGate(false);
      setAuthError(null);
    }
  }, [user, showAuthModal]);

  // Seamless resume: guest pressed Start → teased → signed in. Drop them straight
  // into the real matchmaking queue without a second click.
  useEffect(() => {
    if (!authedUser || !pendingStartRef.current) return undefined;
    pendingStartRef.current = false;
    const id = window.setTimeout(() => {
      window.dispatchEvent(new Event("caakus-start-video-now"));
    }, 400);
    return () => window.clearTimeout(id);
  }, [authedUser]);

  const handleAuthRequired = useCallback(() => {
    pendingStartRef.current = true;
    setAuthGate(true);
    setShowAuthModal(true);
  }, []);

  // TEMPORARY: Disabled mobile PWA optimizations until properly integrated
  /*
  // Mobile PWA: Initialize zero-latency optimizations
  useEffect(() => {
    if (isMobileDevice()) {
      console.log('📱 Mobile device detected, activating optimizations...');
      initializeZeroLatencyMode();
      
      // Prevent screen sleep during call
      preventScreenSleep().then(lock => {
        setWakeLock(lock);
        console.log('✅ Screen wake lock acquired');
      });
    }
    
    return () => {
      // Release wake lock on unmount
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // Prefetch call resources when component mounts
  useEffect(() => {
    if (user) {
      const prefetcher = PredictivePrefetcher.getInstance();
      void prefetcher.prefetchCallResources(user.id);
    }
  }, [user]);
  */

  useEffect(() => {
    if (!authedUser) return;
    setUserOnline(authedUser.id, authedUser.language);
    if (!localStorage.getItem("audioChat_language")) {
      setSelectedLanguage(authedUser.language as LanguageCode);
      i18n.changeLanguage(authedUser.language);
    }
    NotificationService.requestPermission().then((token) => {
      if (token) NotificationService.saveFCMToken(authedUser.id, token);
    });
    return () => {
      setUserOffline(authedUser.id);
    };
  }, [authedUser]);

  const handleLanguageChange = (language: LanguageCode) => {
    setSelectedLanguage(language);
    localStorage.setItem("audioChat_language", language);
    i18n.changeLanguage(language);
    if (authedUser) {
      updateUserData({ language });
      setUserOnline(authedUser.id, language);
    }
  };

  const handleMinutePassed = () => {
    setMinutesUsed((prev) => prev + 1);
  };

  // Wrap login with error handling
  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setAuthError(null);
      console.log('🔐 Attempting login...');
      const result = await login(email, password);
      
      if (result) {
        console.log('✅ Login successful');
        // Modal will close automatically via useEffect
        return result;
      } else {
        const errorMsg = 'Invalid email or password';
        setAuthError(errorMsg);
        console.error('❌ Login failed:', errorMsg);
        return null;
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Login failed. Please try again.';
      setAuthError(errorMsg);
      console.error('❌ Login error:', error);
      return null;
    }
  }, [login]);

  // Wrap signup with error handling
  const handleSignup = useCallback(async (
    email: string,
    password: string,
    name: string,
    country: string,
    language: string
  ) => {
    try {
      setAuthError(null);
      console.log('📝 Attempting signup...');
      const result = await signup(email, password, name, country, language);
      
      if (result) {
        console.log('✅ Signup successful');
        // Modal will close automatically via useEffect
        return result;
      } else {
        const errorMsg = 'Signup failed. Please try again.';
        setAuthError(errorMsg);
        console.error('❌ Signup failed');
        return null;
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Signup failed. Please try again.';
      setAuthError(errorMsg);
      console.error('❌ Signup error:', error);
      return null;
    }
  }, [signup]);

  // Prevent double-click navigation
  const handleBackClick = useCallback(
    preventDoubleClick(() => {
      if (isNavigating) return;
      setIsNavigating(true);
      navigate("/");
    }, 500),
    [navigate, isNavigating]
  );

  return (
    <>
      <CausticsBackground />
      <div className="min-h-screen w-full overflow-x-hidden relative z-10">
        <Navbar
          user={user}
          logout={logout}
          selectedLanguage={selectedLanguage}
          handleLanguageChange={handleLanguageChange}
          setShowAuthModal={setShowAuthModal}
        />

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 relative z-10">
          {/* Back to Home pill + Safety Lab */}
          <div className="mb-3 flex items-center gap-2 flex-nowrap">
            <button
              onClick={handleBackClick}
              disabled={isNavigating}
              className="shrink-0 inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white/80 hover:text-white text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="truncate">{isNavigating ? "Going back..." : "Back to Home"}</span>
            </button>
            <SafetyLab className="shrink-0" />
          </div>

          {/* AudioCall — Lazy loaded with mobile optimizations */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/30 via-fuchsia-500/25 to-pink-500/30 rounded-3xl blur-xl hidden sm:block" />
            <div className="relative bg-gradient-to-br from-white/15 to-white/8 backdrop-blur-2xl border-0 sm:border border-purple-400/25 rounded-none sm:rounded-3xl px-0 py-0 sm:p-4 md:p-6">
                {user ? (
                  <AudioCall
                    userId={user.id}
                    userEmail={authedUser?.email}
                    onMinutePassed={handleMinutePassed}
                    language={selectedLanguage}
                    autoMatch={true}
                    canCustomizeCall={!!authedUser?.is_premium}
                    userGender={authedUser?.gender}
                    userCountry={authedUser?.country}
                    userIsPremium={!!authedUser?.is_premium}
                    userPreferredGender={authedUser?.preferred_gender}
                    userPreferredRegions={authedUser?.preferred_regions}
                    requireAuth={!authedUser}
                    onAuthRequired={handleAuthRequired}
                  />
                ) : (
                  <AudioCall
                    userId={guestSessionId || "guest"}
                    onMinutePassed={handleMinutePassed}
                    language={selectedLanguage}
                    autoMatch={true}
                    canCustomizeCall={false}
                    requireAuth={true}
                    onAuthRequired={handleAuthRequired}
                  />
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal for Sign In/Sign Up — unclosable when it gates a guest Start */}
      {showAuthModal && (
        <AuthModal
          onLogin={handleLogin}
          onSignup={handleSignup}
          canClose={!authGate}
          onClose={() => {
            setShowAuthModal(false);
            setAuthGate(false);
            pendingStartRef.current = false;
            setAuthError(null);
          }}
        />
      )}
    </>
  );
}
