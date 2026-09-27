import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { OMEGLE_FAQ } from "./OmegleConversionHero";

const ROWS = [
  { k: "Bot protection", c: "Zero bots policy, sign-in required", o: "None — bots and spam loops" },
  { k: "Speed", c: "Match in under 2 seconds, HD WebRTC", o: "Slow queues, low-res video" },
  { k: "Safety", c: "Real-time AI moderation + one-tap report", o: "Anonymous, unmoderated" },
  { k: "Rewards", c: "Earn Yuyus for real conversations", o: "Nothing" },
];

export default function OmegleSeoBody() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 pb-20 sm:px-6">
      <article className="holo-panel rounded-3xl p-6 sm:p-10">
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Why Caakus is the Only Omegle Replacement You Need
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-white/60">
          Omegle shut down in November 2023. Caakus rebuilds random video chat for today: instant
          matches with real people, directly in your browser, with safety and rewards built in.
        </p>
        <ul className="mt-6 grid gap-4">
          <li><h3 className="font-bold text-white">Zero Bots Policy</h3><p className="text-sm text-white/60">Every chatter signs in; automated accounts are detected and banned.</p></li>
          <li><h3 className="font-bold text-white">HD WebRTC Engine</h3><p className="text-sm text-white/60">Peer-to-peer HD video with low latency, no download needed.</p></li>
          <li><h3 className="font-bold text-white">The Yuyu Economy</h3><p className="text-sm text-white/60">Earn Yuyus and gifts for good conversations, then redeem them.</p></li>
        </ul>
      </article>

      <section className="mt-10">
        <h2 className="text-2xl font-black tracking-tight text-white">Caakus vs. Old Random Chat Sites</h2>
        <div className="holo-panel mt-5 overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.16em] text-white/40">
              <tr><th className="p-4">Feature</th><th className="p-4 text-violet-200">Caakus</th><th className="p-4">Old sites</th></tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.k} className="border-t border-white/[0.06]">
                  <th scope="row" className="p-4 font-bold text-white">{r.k}</th>
                  <td className="p-4 text-white/80"><Check className="mr-2 inline h-4 w-4 text-emerald-300" />{r.c}</td>
                  <td className="p-4 text-white/45"><X className="mr-2 inline h-4 w-4 text-rose-400" />{r.o}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black tracking-tight text-white">Frequently asked questions</h2>
        <div className="holo-panel mt-5 rounded-3xl">
          {OMEGLE_FAQ.map((f, i) => (
            <div key={f.q} className="border-b border-white/[0.06] last:border-b-0">
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-7">
                <h3 className="text-[15px] font-bold text-white/90">{f.q}</h3>
                <ChevronDown className={`h-4 w-4 shrink-0 text-violet-300 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {/* Answer kept in the DOM so crawlers always read it */}
              <p className={`px-5 pb-5 text-sm leading-relaxed text-white/55 sm:px-7 ${open === i ? "" : "hidden"}`}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
