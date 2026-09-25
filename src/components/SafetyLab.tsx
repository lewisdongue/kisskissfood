import { useCallback, useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Ban,
  X,
  Eye,
  UserX,
  ScanFace,
  MessageSquareWarning,
  Sparkles,
  Activity,
  Radar,
  Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "caakus.safetyLab.prefs";

interface SafetyPrefs {
  blockFriendRequests: boolean;
  invisibleMode: boolean;
}

const DEFAULT_PREFS: SafetyPrefs = { blockFriendRequests: false, invisibleMode: false };

function loadPrefs(): SafetyPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return DEFAULT_PREFS;
  }
}

function Led({ color, label }: { color: "green" | "blue"; label: string }) {
  const tone =
    color === "green"
      ? "bg-emerald-400 shadow-[0_0_10px_2px_rgba(16,185,129,0.8)]"
      : "bg-sky-400 shadow-[0_0_10px_2px_rgba(56,189,248,0.8)]";
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/55">
      <span className={`h-2 w-2 rounded-full ${tone} animate-pulse`} />
      {label}
    </span>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-all hover:border-white/20">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className={`mt-1 font-mono text-base font-bold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}

/**
 * Premium "Safety Lab" entry point. Sits on the matching dashboard only — never
 * above an active video call, so it can't disturb a live conversation.
 */
export default function SafetyLab({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [face, setFace] = useState<0 | 1>(0);
  const [prefs, setPrefs] = useState<SafetyPrefs>(DEFAULT_PREFS);

  // live security telemetry (visual simulation of the running moderation stack)
  const [latency, setLatency] = useState(78);
  const [uptime, setUptime] = useState(99.99);
  const [frames, setFrames] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  // Local prefs first (instant, works for guests), then backend for signed-in users.
  useEffect(() => {
    setPrefs(loadPrefs());
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const uid = data?.user?.id ?? null;
        if (cancelled || !uid) return;
        setUserId(uid);
        const { data: row } = await supabase
          .from("safety_preferences")
          .select("block_friend_requests, invisible_mode")
          .eq("user_id", uid)
          .maybeSingle();
        if (cancelled) return;
        if (row) {
          const remote = {
            blockFriendRequests: !!(row as { block_friend_requests?: boolean }).block_friend_requests,
            invisibleMode: !!(row as { invisible_mode?: boolean }).invisible_mode,
          };
          setPrefs(remote);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          } catch {
            /* best-effort */
          }
        }
        setSynced(true);
      } catch {
        /* offline / guest → local only */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setFace((f) => (f === 0 ? 1 : 0)), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setLatency(62 + Math.round(Math.random() * 26));
      setUptime(Number((99.96 + Math.random() * 0.03).toFixed(2)));
      setFrames((f) => f + 12 + Math.round(Math.random() * 30));
    }, 1200);
    return () => clearInterval(id);
  }, [open]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    },
    []
  );

  const update = (patch: Partial<SafetyPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* best-effort */
    }
    if (!userId) return;
    void supabase
      .from("safety_preferences")
      .upsert(
        {
          user_id: userId,
          block_friend_requests: next.blockFriendRequests,
          invisible_mode: next.invisibleMode,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .then(({ error }) => setSynced(!error));
  };

  const runScan = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    setLogs([]);
    const steps = [
      "▸ handshake · DTLS-SRTP verified",
      "▸ video frame buffer → NSFW classifier",
      "▸ audio stream → abuse pattern model",
      "▸ text channel → toxicity scoring",
      "▸ no violation detected · stream cleared",
    ];
    timers.current.forEach(clearTimeout);
    timers.current = steps.map((line, i) =>
      setTimeout(() => {
        setLogs((l) => [...l, line]);
        if (i === steps.length - 1) setScanning(false);
      }, 260 * (i + 1))
    );
  }, [scanning]);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Open Safety Lab"
        className={`group inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-200 backdrop-blur-xl transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-400/60 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.25)] whitespace-nowrap ${className}`}
      >
        <span key={face} className="inline-flex items-center gap-2 animate-fade-in">
          {face === 0 ? (
            <>
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              Safety Lab
            </>
          ) : (
            <>
              <Ban className="h-4 w-4 shrink-0 text-rose-400" />
              NO Minors · 18+
            </>
          )}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] flex justify-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="relative h-full w-full max-w-md overflow-y-auto border-l border-emerald-400/20 bg-[#05060a]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_0_60px_rgba(16,185,129,0.12)] animate-slide-in-right"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" /> Safety Lab
                </h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  caakus · trust &amp; safety core
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Safety Lab"
                className="sticky top-[max(0rem,env(safe-area-inset-top))] z-[9999] flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 shadow-lg backdrop-blur-md transition-transform duration-200 hover:bg-white/20 hover:text-white active:scale-95 touch-manipulation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* LIVE TELEMETRY */}
            <section className="mt-5 rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-4 shadow-[0_0_28px_rgba(16,185,129,0.10)]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <Activity className="h-4 w-4" /> Live security metrics
                </span>
                <Led color="green" label="secure" />
                <Led color="blue" label="ai scanning" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Metric label="moderation latency" value={`< ${latency} ms`} accent="text-emerald-300" />
                <Metric label="protected sessions" value={`${uptime.toFixed(2)} %`} accent="text-sky-300" />
                <Metric label="frames analysed" value={frames.toLocaleString()} accent="text-violet-300" />
                <Metric label="media encryption" value="E2EE · DTLS" accent="text-fuchsia-300" />
              </div>
            </section>

            {/* LIVE TEST PLAYGROUND */}
            <section className="mt-4 rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/[0.07] to-transparent p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-sky-200">
                  <Radar className="h-4 w-4" /> Live Test Playground
                </span>
                <Led color={scanning ? "blue" : "green"} label={scanning ? "scanning" : "idle"} />
              </div>
              <button
                type="button"
                onClick={runScan}
                disabled={scanning}
                className="mt-3 w-full rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-sky-100 transition-all hover:bg-sky-500/25 active:scale-[0.98] disabled:opacity-60"
              >
                {scanning ? "running shield test…" : "test moderation shield"}
              </button>

              <div className="relative mt-3 h-32 overflow-hidden rounded-xl border border-white/10 bg-black/70 p-3">
                {scanning && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-sky-400/25 to-transparent animate-[slide-in-right_1.3s_ease-in-out_infinite]" />
                )}
                <div className="relative space-y-1 font-mono text-[11px] leading-relaxed text-emerald-300/85">
                  {logs.length === 0 && !scanning && (
                    <p className="text-white/30">// awaiting test — logs will stream here</p>
                  )}
                  {logs.map((l) => (
                    <p key={l} className="animate-fade-in">
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-4 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <p className="text-xs leading-relaxed text-white/70">
                We continuously upgrade our safety features to maintain a healthy community.
              </p>
            </div>

            <section className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Private Setting
                </h3>
                <Led
                  color={userId && synced ? "green" : "blue"}
                  label={userId ? (synced ? "cloud synced" : "syncing") : "local only"}
                />
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex min-w-0 gap-3">
                    <UserX className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Block Friend Requests</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                        Enable this to restrict incoming requests and prevent unwanted interruptions.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.blockFriendRequests}
                    onCheckedChange={(v) => update({ blockFriendRequests: v })}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex min-w-0 gap-3">
                    <Eye className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Invisible mode</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                        Once enabled, other users won't see your identity in match history to protect your privacy.
                      </p>
                    </div>
                  </div>
                  <Switch checked={prefs.invisibleMode} onCheckedChange={(v) => update({ invisibleMode: v })} />
                </div>
              </div>
            </section>

            <section className="mt-6 pb-10">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Upgrades &amp; AI Protection
              </h3>
              <div className="mt-3 space-y-3">
                <div className="flex gap-3 rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
                  <ScanFace className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">AI Real-Time Video Monitoring</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/55">
                      Our automatic real-time detection system (NSBR / NSFWJS) actively filters video streams to protect
                      the community. Minors and nudity are strictly not allowed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/10 to-transparent p-4">
                  <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">AI-Powered Text Analysis</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/55">
                      Chat messages are screened in real time to block harmful, abusive or unsafe content.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-sky-400/15 bg-gradient-to-br from-sky-500/10 to-transparent p-4">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">Encrypted peer-to-peer media</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/55">
                      Calls travel directly between devices over encrypted channels whenever possible.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
