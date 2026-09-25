import { useCallback, useEffect, useRef, useState } from "react";
import { Note, Panel, RunButton, ScoreRing, Steps } from "./ToolKit";

type Check = { label: string; value?: string; state: "pending" | "ok" | "fail" };

const PROBES: { label: string; server: RTCIceServer }[] = [
  { label: "Standard discovery route", server: { urls: "stun:stun.l.google.com:19302" } },
  { label: "Alternate discovery route", server: { urls: "stun:global.stun.twilio.com:3478" } },
  { label: "Secure web route", server: { urls: "stun:stun.cloudflare.com:3478" } },
];

function probe(server: RTCIceServer): Promise<boolean> {
  return new Promise((resolve) => {
    let pc: RTCPeerConnection | null = null;
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      try {
        pc?.close();
      } catch {
        /* noop */
      }
      resolve(ok);
    };
    try {
      pc = new RTCPeerConnection({ iceServers: [server] });
      pc.createDataChannel("p");
      pc.onicecandidate = (e) => {
        if (e.candidate?.type === "srflx" || e.candidate?.type === "relay") done(true);
        if (!e.candidate) done(false);
      };
      pc.createOffer()
        .then((o) => pc?.setLocalDescription(o))
        .catch(() => done(false));
      window.setTimeout(() => done(false), 6_000);
    } catch {
      done(false);
    }
  });
}

export default function NetworkRestrictionChecker() {
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<Check[]>([]);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setChecks([]);
    setVerdict(null);
    let passed = 0;

    // Secure origin check first — instant and always meaningful.
    const secure = typeof window !== "undefined" && window.isSecureContext;
    setChecks([{ label: "Secure page", state: secure ? "ok" : "fail", value: secure ? "yes" : "no" }]);

    for (const item of PROBES) {
      setChecks((prev) => [...prev, { label: item.label, state: "pending" }]);
      // eslint-disable-next-line no-await-in-loop
      const ok = await probe(item.server);
      if (!mounted.current) return;
      if (ok) passed += 1;
      setChecks((prev) =>
        prev.map((c) => (c.label === item.label ? { ...c, state: ok ? "ok" : "fail", value: ok ? "open" : "blocked" } : c)),
      );
    }

    setOpen(passed);
    setVerdict(
      passed === PROBES.length
        ? "Your network is fully open. Live calls will work normally."
        : passed > 0
          ? "Your network is partly filtered. Calls will connect, sometimes through a helper, which adds a little delay."
          : "This network is blocking live calls. Try mobile data, a personal hotspot, or ask your network administrator to allow outbound call traffic.",
    );
    setRunning(false);
  }, []);

  const score = open == null ? null : Math.round((open / PROBES.length) * 100);

  return (
    <Panel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} label="Openness" />
        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-sm leading-relaxed text-white/60">
            {verdict ?? "We try each route a live call depends on and tell you, in plain words, what is open."}
          </p>
          <RunButton onClick={run} running={running} tone="sky">
            {running ? "Checking…" : verdict ? "Check again" : "Check this network"}
          </RunButton>
        </div>
      </div>
      {checks.length > 0 ? (
        <div className="mt-6 border-t border-white/10 pt-5">
          <Steps steps={checks} />
        </div>
      ) : null}
      <div className="mt-4">
        <Note>Only your own outbound access is tested from this browser. Nothing else is scanned.</Note>
      </div>
    </Panel>
  );
}
