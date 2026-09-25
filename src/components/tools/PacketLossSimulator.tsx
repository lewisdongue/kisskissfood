import { useCallback, useEffect, useRef, useState } from "react";
import { Metrics, Note, Panel, RunButton, ScoreRing } from "./ToolKit";

export default function PacketLossSimulator() {
  const [loss, setLoss] = useState(5);
  const [running, setRunning] = useState(false);
  const [sent, setSent] = useState(0);
  const [received, setReceived] = useState(0);
  const [jitter, setJitter] = useState<number | null>(null);
  const [avgDelay, setAvgDelay] = useState<number | null>(null);
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
    setSent(0);
    setReceived(0);
    setJitter(null);
    setAvgDelay(null);
    try {
      const a = new RTCPeerConnection();
      const b = new RTCPeerConnection();
      pcs.current = [a, b];
      a.onicecandidate = (e) => e.candidate && b.addIceCandidate(e.candidate).catch(() => undefined);
      b.onicecandidate = (e) => e.candidate && a.addIceCandidate(e.candidate).catch(() => undefined);
      const channel = a.createDataChannel("sim", { ordered: false, maxRetransmits: 0 });
      const delays: number[] = [];
      let got = 0;

      b.ondatachannel = (e) => {
        e.channel.onmessage = (m) => {
          // Apply the simulated loss on the receiving side.
          if (Math.random() * 100 < loss) return;
          e.channel.send(m.data);
        };
      };
      channel.onmessage = (m) => {
        got += 1;
        setReceived(got);
        delays.push(performance.now() - Number(m.data));
      };

      const offer = await a.createOffer();
      await a.setLocalDescription(offer);
      await b.setRemoteDescription(offer);
      const answer = await b.createAnswer();
      await b.setLocalDescription(answer);
      await a.setRemoteDescription(answer);

      await new Promise<void>((resolve, reject) => {
        channel.onopen = () => resolve();
        window.setTimeout(() => reject(new Error("timeout")), 10_000);
      });

      const total = 200;
      for (let i = 0; i < total; i += 1) {
        channel.send(String(performance.now()));
        setSent(i + 1);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => window.setTimeout(r, 12));
      }
      await new Promise((r) => window.setTimeout(r, 500));

      if (delays.length) {
        const avg = delays.reduce((s, v) => s + v, 0) / delays.length;
        setAvgDelay(Number(avg.toFixed(1)));
        setJitter(Number(Math.sqrt(delays.reduce((s, v) => s + (v - avg) ** 2, 0) / delays.length).toFixed(1)));
      }
    } catch {
      /* the run simply ends */
    } finally {
      cleanup();
      setRunning(false);
    }
  }, [cleanup, loss]);

  const delivery = sent ? Math.round((received / sent) * 100) : null;
  const score = delivery == null ? null : Math.max(0, Math.round(delivery - (jitter ?? 0)));

  return (
    <Panel>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} label="Call feel" />
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Simulated loss</span>
              <span className="font-bold text-white">{loss}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={loss}
              disabled={running}
              onChange={(e) => setLoss(Number(e.target.value))}
              className="mt-2 w-full accent-amber-400"
            />
          </div>
          <Metrics
            items={[
              { label: "Delivered", value: delivery == null ? "—" : `${delivery}%` },
              { label: "Average delay", value: avgDelay == null ? "—" : `${avgDelay} ms` },
              { label: "Stability", value: jitter == null ? "—" : `± ${jitter} ms` },
            ]}
          />
          <RunButton onClick={run} running={running} tone="amber">
            {running ? `Sending ${sent}/200…` : "Run the simulation"}
          </RunButton>
          <Note>
            The loss is applied inside this page only. Your real internet connection is not affected in any way.
          </Note>
        </div>
      </div>
    </Panel>
  );
}
