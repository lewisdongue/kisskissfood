// Share-to-Earn Premium: free signed-in users get a polished promo card with
// their personal invite link. 1 verified friend = 1 full ad-free day.

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Share2, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";

const DISMISS_KEY = "caakus_share_to_earn_dismissed_v1";

type Props = {
  referralCode: string | null;
  userId: string | null;
};

export default function ShareToEarnBanner({ referralCode, userId }: Props) {
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(window.sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  const link = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.caakus.com";
    const ref = referralCode || userId;
    return ref ? `${origin}/?ref=${encodeURIComponent(ref)}` : `${origin}/`;
  }, [referralCode, userId]);

  const shareText = "Join me on Caakus — free random video chat, no download 👋";

  const dismiss = () => {
    setHidden(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* noop */
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied — send it to a friend!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Caakus", text: shareText, url: link });
        return;
      } catch {
        return;
      }
    }
    void copy();
  };

  if (hidden || !userId) return null;

  return (
    <section
      aria-label="Share to earn ad-free premium"
      className="relative mx-auto my-4 w-[min(680px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-red-500/40 bg-[linear-gradient(135deg,rgba(239,68,68,0.12),rgba(0,0,0,0.6))] p-4 shadow-[0_20px_60px_-30px_rgba(239,68,68,0.8)] sm:p-5"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-500/15 text-red-300">
          <Sparkles className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold leading-tight text-white sm:text-lg">
            Want an Ad-Free Experience?
          </h2>
          <p className="mt-1 text-xs leading-snug text-white/65 sm:text-sm">
            Share your personal link with a friend and get <strong className="text-white">1 FULL DAY</strong> of VIP
            Premium (zero ads!) instantly. Share with 30 friends = 30 full days of Premium!
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Your personal invite link"
          className="min-w-0 flex-1 truncate rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-xs text-white/85 outline-none focus:border-red-400/60 sm:text-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void copy()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 sm:flex-none"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={() => void share()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:flex-none"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-3 py-1.5 font-semibold text-white/75 transition hover:bg-white/10"
        >
          Share via Telegram
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-3 py-1.5 font-semibold text-white/75 transition hover:bg-white/10"
        >
          Share via WhatsApp
        </a>
        <a
          href={`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(link)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-3 py-1.5 font-semibold text-white/75 transition hover:bg-white/10"
        >
          Share via Snapchat
        </a>
        <button
          type="button"
          onClick={() => void share()}
          className="rounded-full border border-white/15 px-3 py-1.5 font-semibold text-white/75 transition hover:bg-white/10"
        >
          Share via TikTok
        </button>
      </div>
    </section>
  );
}
