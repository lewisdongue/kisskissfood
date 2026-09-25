// Compact, one-time invitation card. Sits inline in the page flow — it never
// overlays, covers or blocks Match / Skip, on any viewport.

import { useState } from "react";
import { Gift, Share2, X } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  onDismiss: () => void;
  onShared: () => Promise<number | null> | void;
  shareUrl?: string;
};

export default function VipSharePrompt({ onDismiss, onShared, shareUrl }: Props) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const url = shareUrl ?? (typeof window !== "undefined" ? window.location.origin : "https://www.caakus.com");

  const share = async () => {
    if (busy) return;
    setBusy(true);
    const payload = {
      title: "Caakus",
      text: "I just met someone great on Caakus — come say hi 👋",
      url,
    };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(payload);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${payload.text} ${url}`);
        toast.success("Link copied — paste it to a friend!");
      }
      await onShared();
      setDone(true);
      toast.success("VIP unlocked for 24 hours 🎉");
    } catch {
      // User closed the share sheet — no penalty, no error noise.
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-center text-sm font-semibold text-amber-200">
        VIP is on for the next 24 hours. Enjoy 🎉
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-md rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-400/[0.08] to-fuchsia-500/[0.06] p-3 pr-9 sm:p-4 sm:pr-10">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close"
        className="absolute right-2 top-2 rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
          <Gift className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight text-white">Invite a friend, get VIP for 24 hours</p>
          <p className="mt-0.5 text-xs leading-snug text-white/55">
            Priority matching, instantly. One tap, one time only.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={share}
        disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
      >
        <Share2 className="h-4 w-4" />
        {busy ? "Sharing…" : "Share & unlock VIP"}
      </button>
    </div>
  );
}
