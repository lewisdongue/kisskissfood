import { useCallback, useEffect, useRef, useState } from "react";
import { Note, Panel, RunButton, ScoreRing } from "./ToolKit";

type Result = {
  url: string;
  ms: number | null;
  types: string[];
  ok: boolean;
};

const DEFAULT_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:global.stun.twilio.com:3478",
  "stun:stun1.l.google.com:19302",
  "stun:stun.cloudflare.com:3478",
];

function probe(url: string): Promise<Result> {
  return new Promise((resolve) => {
    const started = performance.now();
    const types = new Set<string>();
    let pc: RTCPeerConnection | null = null;
    const done = (ok: boolean) => {
      const ms = ok ? Math.round(performance.now() - started) : null;
      try {
        pc?.close();
      } catch {
        /* noop */
      }
      pc = null;
      resolve({ url, ms, types: [...types], ok });
    };
    try {
      pc = new RTCPeerConnection({ iceServers: [{ urls: url }] });
      pc.createDataChannel("probe");
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          if (e.candidate.type) types.add(e.candidate.type);
          if (e.candidate.type === "srflx" || e.candidate.type === "relay") done(true);
        } else {
          done(types.has("srflx") || types.has("relay"));
        }
      };
      pc.createOffer()
        .then((o) => pc?.setLocalDescription(o))
        .catch(() => done(false));
      window.setTimeout(() => done(types.has("srflx") || types.has("relay")), 6_000);
    } catch {
      done(false);
    }
  });
}

const TYPE_LABEL: Record<string, string> = {
  host: "Local route",
  srflx: "Public route",
  prflx: "Discovered route",
  relay: "Relayed route",
};

export default function ServerReachability() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [custom, setCustom] = useState("");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setResults([]);
    const servers = [...DEFAULT_SERVERS, ...(custom.trim() ? [custom.trim()] : [])];
    for (const server of servers) {
      // eslint-disable-next-line no-await-in-loop
      const result = await probe(server);
      if (!mounted.current) return;
      setResults((prev) => [...prev, result]);
    }
    setRunning(false);
  }, [custom]);

  const reachable = results.filter((r) => r.ok).length;
  const score = results.length ? Math.round((reachable / results.length) * 100) : null;

  return (
    <Panel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} label="Reachable" />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm text-white/60">
            {results.length
              ? `${reachable} of ${results.length} helpers answered from this network.`
              : "We will contact a set of public connection helpers and time each answer."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Add your own server (optional)"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-400/40 focus:outline-none"
            />
            <RunButton onClick={run} running={running}>
              {running ? "Testing…" : "Run reachability test"}
            </RunButton>
          </div>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="mt-6 overflow-x-auto border-t border-white/10 pt-5">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.14em] text-white/35">
                <th className="pb-2 font-medium">Server</th>
                <th className="pb-2 font-medium">Answer</th>
                <th className="pb-2 font-medium">Routes seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.map((r) => (
                <tr key={r.url}>
                  <td className="py-2 pr-3 font-mono text-xs text-white/70">{r.url}</td>
                  <td className={`py-2 pr-3 font-semibold ${r.ok ? "text-emerald-400" : "text-rose-400"}`}>
                    {r.ok ? `${r.ms} ms` : "No answer"}
                  </td>
                  <td className="py-2 text-xs text-white/50">
                    {r.types.map((t) => TYPE_LABEL[t] ?? t).join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="mt-4">
        <Note>Only your own outbound access is tested. No third-party network is scanned.</Note>
      </div>
    </Panel>
  );
}
