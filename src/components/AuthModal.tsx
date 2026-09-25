import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowLeft, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { signInWithGoogle, signInWithApple, signInWithTikTok } from "@/services/supabaseService";
import { getReferralCodeForSignup } from "@/utils/helpers";
// Import conservé au cas où il serait utile ailleurs, même si non utilisé dans le nouveau hook
import { supabase } from "@/config/supabase";
import { pushAuthOverlay } from "@/lib/adSuppression";

/** Simulated platform activity for CRO — fluctuates organically every second. */
const useLiveActivity = () => {
  // Démarre à 50 018 comme demandé
  const [online, setOnline] = useState<number>(50018);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setOnline((prev) => {
        // Génère une fluctuation aléatoire entre -4 et +9 pour paraître organique
        const fluctuation = Math.floor(Math.random() * 14) - 4;
        let nextValue = prev + fluctuation;

        // Force les limites entre 50 000 et 80 000 max
        if (nextValue < 50000) nextValue = 50000;
        if (nextValue > 80000) nextValue = 80000;

        return nextValue;
      });
    }, 1000); // Mise à jour chaque seconde

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return { online, members: null };
};

interface AuthModalProps {
  onSignup: (
    email: string,
    password: string,
    name: string,
    country: string,
    language: string
  ) => Promise<unknown>;
  onLogin: (email: string, password: string) => Promise<unknown>;
  canClose: boolean;
  onClose?: () => void;
}

/** Best-effort locale detection so signup never asks for country / language. */
const detectLocale = () => {
  if (typeof navigator === "undefined") return { country: "", language: "en" };
  const tag = navigator.language || "en";
  const [lang, region] = tag.split("-");
  let country = region ?? "";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!country && tz) country = tz.split("/")[1]?.replace(/_/g, " ") ?? "";
  } catch {
    /* ignore */
  }
  return { country: country || "Unknown", language: (lang || "en").toLowerCase() };
};

const nameFromEmail = (email: string) => {
  const raw = email.split("@")[0] ?? "friend";
  const clean = raw.replace(/[._-]+/g, " ").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

export const AuthModal: React.FC<AuthModalProps> = ({
  onSignup,
  onLogin,
  canClose,
  onClose,
}) => {
  const { i18n } = useTranslation();
  const t = i18n.getFixedT("en");
  const [mode, setMode] = useState<"choose" | "email-signup" | "email-login">("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // No partner scripts while a sign-up / login surface is on screen.
  useEffect(() => pushAuthOverlay(), []);

  const runOAuth = async (
    id: "google" | "apple" | "tiktok",
    fn: (ref?: string) => Promise<unknown>
  ) => {
    const referredByCode = getReferralCodeForSignup() ?? undefined;
    setError(null);
    setOauthLoading(id);
    try {
      await fn(referredByCode);
      setTimeout(() => setOauthLoading(null), 3000);
    } catch (err) {
      setOauthLoading(null);
      setError(t("auth.somethingWentWrong"));
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === "email-login") {
        const result = await onLogin(email, password);
        if (!result) throw new Error(t("auth.somethingWentWrong"));
      } else {
        const { country, language } = detectLocale();
        const result = await onSignup(email, password, nameFromEmail(email), country, language);
        if (!result) throw new Error(t("auth.somethingWentWrong"));
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : t("auth.somethingWentWrong");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || oauthLoading !== null;
  const { online, members } = useLiveActivity();
  const activityLabel =
    online !== null && online > 0
      ? `${Number(online).toLocaleString()} online right now`
      : members !== null && members > 0
        ? `${Number(members).toLocaleString()} members already joined`
        : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !canClose) return;
        setOpen(next);
        if (!next && onClose) onClose();
      }}
    >
      <DialogContent hideClose className="w-[min(430px,calc(100dvw-1.5rem))] max-w-[calc(100dvw-1.5rem)] sm:max-w-[430px] max-h-[92dvh] overflow-y-auto rounded-3xl border border-white/10 bg-[#08080c]/95 p-5 sm:p-7 text-white shadow-[0_40px_120px_-30px_rgba(124,92,255,0.55)] backdrop-blur-2xl [padding-bottom:max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.35),transparent_70%)] blur-2xl" />

        {canClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}
            className="absolute right-3 top-3 z-20 inline-flex h-7 w-7 items-center justify-center bg-transparent text-zinc-700 transition-colors hover:text-zinc-500 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <DialogHeader className="relative space-y-2">
          <div className="mx-auto mb-1 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <img src="/logo.webp" alt="Caakus" className="h-9 w-9 object-contain" />
          </div>
          <DialogTitle className="text-center text-[22px] font-semibold tracking-[-0.03em] sm:text-2xl">
            {mode === "email-login" ? t("auth.welcomeBack") : "Claim your 100 free Yuyus now 🎁"}
          </DialogTitle>
          <DialogDescription className="text-center text-[13px] text-white/45">
            {mode === "email-login" ? t("auth.signInDesc") : t("auth.signUpDesc")}
          </DialogDescription>
        </DialogHeader>

        {mode === "choose" ? (
          <div className="relative mt-5 space-y-2.5">
            {activityLabel && (
              <p className="flex items-center justify-center gap-1.5 pb-1 text-[12px] font-medium text-emerald-300/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {activityLabel}
              </p>
            )}
            <div className="google-cta">
              <button
                type="button"
                disabled={busy}
                onClick={() => runOAuth("google", signInWithGoogle)}
                className="google-cta__inner flex h-12 w-full items-center justify-center gap-2.5 text-[15px] font-bold text-white disabled:opacity-60"
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                ) : (
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
                    <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.3 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
                    <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
                    <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
                  </svg>
                )}
                <span className="leading-none text-white">{t("auth.signInWithGoogle")}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => runOAuth("apple", signInWithApple)}
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.05] text-[15px] font-semibold text-white transition hover:bg-white/[0.1] disabled:opacity-60"
            >
              {oauthLoading === "apple" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              )}
              {t("auth.signInWithApple")}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => runOAuth("tiktok", signInWithTikTok)}
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.05] text-[15px] font-semibold text-white transition hover:bg-white/[0.1] disabled:opacity-60"
            >
              {oauthLoading === "tiktok" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue with TikTok
            </button>

            <div className="flex items-center gap-3 py-1.5">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/25">or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => setMode("email-signup")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent text-[14px] font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-60"
            >
              <Mail className="h-4 w-4" />
              {t("auth.email")}
            </button>

            <p className="px-2 pt-2 text-center text-[11px] leading-relaxed text-zinc-500">
              By continuing, you agree to Caakus's{" "}
              <a
                href="/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-zinc-300 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-zinc-300 hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>

            <p className="pt-1 text-center text-[13px] text-white/35">
              {t("auth.hasAccount")}{" "}
              <button
                type="button"
                className="font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline"
                onClick={() => setMode("email-login")}
                disabled={busy}
              >
                {t("auth.signIn")}
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative mt-5 space-y-3">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.enterEmail")}
              required
              disabled={loading}
              className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-[15px] text-white placeholder:text-white/30 focus-visible:ring-white/20"
            />
            <Input
              id="password"
              type="password"
              autoComplete={mode === "email-login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.enterPassword")}
              minLength={6}
              required
              disabled={loading}
              className="h-12 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-[15px] text-white placeholder:text-white/30 focus-visible:ring-white/20"
            />

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 text-[15px] font-bold text-white shadow-lg shadow-fuchsia-500/30 hover:from-violet-400 hover:via-fuchsia-400 hover:to-indigo-400"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("auth.processing")}
                </span>
              ) : mode === "email-login" ? (
                t("auth.signIn")
              ) : (
                t("auth.createAccount")
              )}
            </Button>

            <div className="flex items-center justify-between pt-1 text-[13px]">
              <button
                type="button"
                onClick={() => setMode("choose")}
                disabled={loading}
                className="flex items-center gap-1.5 text-white/40 transition hover:text-white/80"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back", { defaultValue: "Back" })}
              </button>
              <button
                type="button"
                onClick={() => setMode(mode === "email-login" ? "email-signup" : "email-login")}
                disabled={loading}
                className="text-white/40 underline-offset-4 transition hover:text-white/80 hover:underline"
              >
                {mode === "email-login" ? t("auth.signUp") : t("auth.signIn")}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="relative mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-[13px] font-medium text-red-300">
            {error}
          </div>
        )}

        {!canClose && (
          <p className="relative mt-4 text-center text-[12px] text-amber-300/70">
            ✨ Sign up free to start matching right away
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
