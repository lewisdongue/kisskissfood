import { useCallback, useEffect, useRef, useState } from "react";
import { Metrics, Note, Panel, RunButton, ScoreRing, Steps } from "./ToolKit";

type Step = { label: string; value?: string; state: "pending" | "ok" | "fail" };

const ICE: RTCIceServer[] = [{ urls: ["stun:stun.l.google.com:19302"] }];

export default function SpeedTest() {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [setupMs, setSetupMs] = useState<number | null>(null);
  const [rttMs, setRttMs] = useState<number | null>(null);
  const [jitterMs, setJitterMs] = useState<number | null>(null);
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
    setSetupMs(null);
    setRttMs(null);
    setJitterMs(null);
    const started = performance.now();
    const push = (label: string, state: Step["state"], value?: string) =>
      setSteps((prev) => [...prev.filter((s) => s.label !== label), { label, state, value }]);

    push("Opening connection", "pending");
    try {
      const a = new RTCPeerConnection({ iceServers: ICE });
      const b = new RTCPeerConnection({ iceServers: ICE });
      pcs.current = [a, b];
      a.onicecandidate = (e) => e.candidate && b.addIceCandidate(e.candidate).catch(() => undefined);
      b.onicecandidate = (e) => e.candidate && a.addIceCandidate(e.candidate).catch(() => undefined);

      const channel = a.createDataChannel("probe");
      const open = new Promise<void>((resolve, reject) => {
        channel.onopen = () => resolve();
        window.setTimeout(() => reject(new Error("timeout")), 10_000);
      });

      const offer = await a.createOffer();
      await a.setLocalDescription(offer);
      await b.setRemoteDescription(offer);
      push("Exchanging setup details", "ok", `${Math.round(performance.now() - started)} ms`);

      const answer = await b.createAnswer();
      await b.setLocalDescription(answer);
      await a.setRemoteDescription(answer);
      push("Finding a route", "pending");

      b.ondatachannel = (e) => {
        e.channel.onmessage = (m) => e.channel.send(m.data);
      };

      await open;
      const setup = Math.round(performance.now() - started);
      setSetupMs(setup);
      push("Finding a route", "ok", `${setup} ms`);
      push("Opening connection", "ok", "secure");

      const samples: number[] = [];
      for (let i = 0; i < 12; i += 1) {
        const t = performance.now();
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve) => {
          channel.onmessage = () => resolve();
          channel.send(String(t));
        });
        samples.push(performance.now() - t);
      }
      const avg = samples.reduce((s, v) => s + v, 0) / samples.length;
      const jit = Math.sqrt(samples.reduce((s, v) => s + (v - avg) ** 2, 0) / samples.length);
      setRttMs(Number(avg.toFixed(1)));
      setJitterMs(Number(jit.toFixed(1)));
      push("Measuring round trip", "ok", `${avg.toFixed(1)} ms`);
    } catch {
      push("Finding a route", "fail", "blocked");
    } finally {
      cleanup();
      setRunning(false);
    }
  }, [cleanup]);

  const score =
    setupMs == null || rttMs == null
      ? null
      : Math.max(
          5,
          Math.min(100, Math.round(100 - Math.min(60, setupMs / 30) - Math.min(35, rttMs * 1.2))),
        );

  return (
    <Panel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} label="Speed" />
        <div className="min-w-0 flex-1 space-y-4">
          <Metrics
            items={[
              { label: "Setup time", value: setupMs == null ? "—" : `${setupMs} ms` },
              { label: "Round trip", value: rttMs == null ? "—" : `${rttMs} ms` },
              { label: "Stability", value: jitterMs == null ? "—" : `± ${jitterMs} ms` },
            ]}
          />
          <RunButton onClick={run} running={running}>
            {running ? "Testing…" : setupMs ? "Test again" : "Start the test"}
          </RunButton>
        </div>
      </div>
      {steps.length > 0 ? (
        <div className="mt-6 border-t border-white/10 pt-5">
          <Steps steps={steps} />
        </div>
      ) : null}
      <div className="mt-4">
        <Note>Your camera and microphone stay off. Nothing leaves your device.</Note>
      </div>
    </Panel>
  );
}
