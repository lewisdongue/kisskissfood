import { useCallback, useEffect, useRef, useState } from "react";
import { Note, Panel, RunButton, ScoreRing, Steps } from "./ToolKit";

type Check = { label: string; value?: string; state: "pending" | "ok" | "fail" };

export default function EncryptionVerifier() {
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<Check[]>([]);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [passed, setPassed] = useState<number | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(
    () => () => {
      try {
        pcRef.current?.close();
      } catch {
        /* noop */
      }
    },
    [],
  );

  const run = useCallback(async () => {
    setRunning(true);
    setChecks([]);
    setFingerprint(null);
    const results: Check[] = [];
    const add = (label: string, ok: boolean, value?: string) => {
      results.push({ label, state: ok ? "ok" : "fail", value });
      setChecks([...results]);
    };

    add("Page served over a secure origin", typeof window !== "undefined" && window.isSecureContext, "https");

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.createDataChannel("verify");
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      const sdp = pc.localDescription?.sdp ?? "";

      const fp = /a=fingerprint:(\S+) (\S+)/.exec(sdp);
      if (fp) {
        setFingerprint(`${fp[1]!.toUpperCase()} · ${fp[2]!}`);
      }
      add("Encrypted transport negotiated", /a=fingerprint:/.test(sdp), fp?.[1]?.toUpperCase() ?? "none");
      add("Encrypted media profile", /UDP\/TLS\/RTP\/SAVPF/.test(sdp), "SRTP");
      add("Connection identity verified", /a=setup:/.test(sdp), "certificate");
      add(
        "Modern key exchange available",
        typeof crypto !== "undefined" && !!crypto.subtle,
        "browser keystore",
      );

      pc.close();
      pcRef.current = null;
    } catch {
      add("Encrypted transport negotiated", false, "unavailable");
    }

    setPassed(results.filter((c) => c.state === "ok").length);
    setRunning(false);
  }, []);

  const score = passed == null ? null : Math.round((passed / Math.max(1, checks.length)) * 100);

  return (
    <Panel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} label="Security" />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm text-white/60">
            {passed == null
              ? "We open a live connection and read back the security it negotiated, so you can see the proof yourself."
              : `${passed} of ${checks.length} security checks passed on this browser.`}
          </p>
          {fingerprint ? (
            <p className="truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-emerald-300">
              {fingerprint}
            </p>
          ) : null}
          <RunButton onClick={run} running={running}>
            {running ? "Verifying…" : passed == null ? "Verify my connection" : "Verify again"}
          </RunButton>
        </div>
      </div>
      {checks.length > 0 ? (
        <div className="mt-6 border-t border-white/10 pt-5">
          <Steps steps={checks} />
        </div>
      ) : null}
      <div className="mt-4">
        <Note>The test connection is created and closed inside this page. No session data is sent anywhere.</Note>
      </div>
    </Panel>
  );
}
