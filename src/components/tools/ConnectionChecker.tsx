import { useCallback, useEffect, useRef, useState } from "react";
import { Metrics, Note, Panel, RunButton, ScoreRing, Steps } from "./ToolKit";

type Step = { label: string; value?: string; state: "pending" | "ok" | "fail" };

export default function ConnectionChecker() {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [route, setRoute] = useState<string | null>(null);
  const [rtt, setRtt] = useState<number | null>(null);
  const [candidates, setCandidates] = useState(0);
  const pcs = useRef<RTCPeerConnection[]>([]);

  const cleanup = useCallback(() => {
    pcs.current.forEach((pc) => {
      try {
        pc.close();
      } catch {
        /* noop */
      }
    });
    pcs.current = [];
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const run = useCallback(async () => {
    cleanup();
    setRunning(true);
    setRoute(null);
    setRtt(null);
    setCandidates(0);
    let found = 0;
    const push = (label: string, state: Step["state"], value?: string) =>
      setSteps((prev) => [...prev.filter((s) => s.label !== label), { label, state, value }]);

    push("Creating two endpoints", "pending");
    try {
      const a = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      const b = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcs.current = [a, b];
      const track = (e: RTCPeerConnectionIceEvent, other: RTCPeerConnection) => {
        if (!e.candidate) return;
        found += 1;
        setCandidates(found);
        other.addIceCandidate(e.candidate).catch(() => undefined);
      };
      a.onicecandidate = (e) => track(e, b);
      b.onicecandidate = (e) => track(e, a);
      push("Creating two endpoints", "ok", "ready");

      const channel = a.createDataChannel("check");
      b.ondatachannel = (e) => {
        e.channel.onmessage = (m) => e.channel.send(m.data);
      };
      push("Exchanging routes", "pending");

      const offer = await a.createOffer();
      await a.setLocalDescription(offer);
      await b.setRemoteDescription(offer);
      const answer = await b.createAnswer();
      await b.setLocalDescription(answer);
      await a.setRemoteDescription(answer);

      await new Promise<void>((resolve, reject) => {
        channel.onopen = () => resolve();
        window.setTimeout(() => reject(new Error("timeout")), 12_000);
      });
      push("Exchanging routes", "ok", `${found} routes`);
      push("Connecting", "ok", "connected");

      const t = performance.now();
      await new Promise<void>((resolve) => {
        channel.onmessage = () => resolve();
        channel.send("ping");
      });
      setRtt(Number((performance.now() - t).toFixed(1)));

      const stats = await a.getStats();
      let kind = "direct";
      stats.forEach((report) => {
        if (report.type === "candidate-pair" && report.state === "succeeded") {
          const local = stats.get(report.localCandidateId) as { candidateType?: string } | undefined;
          if (local?.candidateType === "relay") kind = "relayed";
        }
      });
      setRoute(kind);
    } catch {
      push("Connecting", "fail", "blocked");
      setRoute("blocked");
    } finally {
      cleanup();
      setRunning(false);
    }
  }, [cleanup]);

  const score = route === "direct" ? 100 : route === "relayed" ? 72 : route === "blocked" ? 10 : null;

  return (
    <Panel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} label="Readiness" />
        <div className="min-w-0 flex-1 space-y-4">
          <Metrics
            items={[
              {
                label: "Routing",
                value: route === "direct" ? "Direct" : route === "relayed" ? "Relayed" : route === "blocked" ? "Blocked" : "—",
                hint: route === "relayed" ? "Traffic goes through a helper" : undefined,
              },
              { label: "Round trip", value: rtt == null ? "—" : `${rtt} ms` },
              { label: "Routes found", value: candidates || "—" },
            ]}
          />
          <RunButton onClick={run} running={running}>
            {running ? "Checking…" : route ? "Check again" : "Check my connection"}
          </RunButton>
        </div>
      </div>
      {steps.length > 0 ? (
        <div className="mt-6 border-t border-white/10 pt-5">
          <Steps steps={steps} />
        </div>
      ) : null}
      <div className="mt-4">
        <Note>Both endpoints live in this page. No data is sent to Caakus.</Note>
      </div>
    </Panel>
  );
}
