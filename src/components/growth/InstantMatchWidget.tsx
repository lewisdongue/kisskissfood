import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";

// ═══════════════════════════════════════════════════════════════════════════
// ABOVE-THE-FOLD CONVERSION WIDGET
// Giant CTA straight into /call (2.5s radar matchmaking) + REAL social proof:
// the number shown is the count of members active in the last 15 minutes,
// read live from the production database. Never a fabricated figure — the
// indicator simply stays hidden until a real count is available.
// ═══════════════════════════════════════════════════════════════════════════

export default function InstantMatchWidget({
  headline = "Meet someone live now",
  sub = "No download. No signup wall. Instant peer-to-peer video with a real person.",
}: {
  headline?: string;
  sub?: string;
}) {
  const [live, setLive] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const since = new Date(Date.now() - 15 * 60_000).toISOString();
      const { count, error } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .gte("last_active_at", since);
      if (alive && !error && typeof count === "number") setLive(count);
    };
    void load();
    const id = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="instant-match-widget mx-auto w-full max-w-2xl rounded-2xl border border-violet-400/25 bg-violet-500/[0.07] p-4 text-center sm:p-7">
      <h2 className="text-[clamp(1.25rem,4.5vw,1.9rem)] font-black leading-tight tracking-tight text-white">
        {headline}
      </h2>
      <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-white/55">{sub}</p>

      {live !== null && live > 0 ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-1.5 text-[13px] font-semibold text-emerald-300">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          {live.toLocaleString("en-US")} users online now
        </p>
      ) : null}

      <Link
        to="/call"
        className="mt-5 flex w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 px-6 py-4 text-base font-black tracking-tight text-white shadow-[0_0_40px_-10px_rgba(139,92,246,0.8)] transition-transform duration-75 active:scale-[0.985] sm:text-lg"
        style={{ touchAction: "manipulation" }}
      >
        Start Video Chat
        <span aria-hidden>→</span>
      </Link>
      <p className="mt-2.5 text-[11px] text-white/40">Encrypted peer-to-peer · works on mobile · free</p>
    </div>
  );
}
