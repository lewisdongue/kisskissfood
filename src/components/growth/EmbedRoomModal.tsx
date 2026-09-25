// "Add this room to your website" — one clean button, one copyable snippet.

import { useState } from "react";
import { Check, Code2, Copy, X } from "lucide-react";

export default function EmbedRoomModal({ room, label }: { room: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe src="https://www.caakus.com/embed/${room}" width="320" height="220" style="border:0;border-radius:16px;max-width:100%" loading="lazy" allow="camera; microphone; autoplay" title="${label} — live on Caakus"></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      /* noop */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:border-emerald-400/30 hover:text-white"
      >
        <Code2 className="h-4 w-4" />
        Add this room to your website
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-full p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-black text-white">Add this room to your website</h2>
            <p className="mt-1.5 text-sm text-white/55">
              Copy the code below and paste it anywhere on your page. It stays live automatically — nothing to maintain.
            </p>

            <pre className="mt-4 max-h-44 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-[11px] leading-relaxed text-emerald-300">
              <code>{snippet}</code>
            </pre>

            <button
              type="button"
              onClick={copy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy the code"}
            </button>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <iframe
                src={`/embed/${room}`}
                title="Live room preview"
                className="h-[220px] w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
