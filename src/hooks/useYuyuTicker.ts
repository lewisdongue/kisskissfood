import { useEffect, useRef, useState } from 'react';

/**
 * Client-side live tick engine for the YUYU market.
 *
 * The DB engine (update_yuyu_price) recomputes the anchor price every minute.
 * Between anchors, this hook produces a smooth 1-second random walk that drifts
 * toward the latest DB anchor — exactly the way an exchange chart behaves
 * between trades. It never invents a trend: the walk is mean-reverting to the
 * real anchor, so what the user sees always converges to the DB truth.
 */

export interface Tick {
  t: number; // epoch ms
  p: number; // price
}

const BUFFER_SECONDS = 3600; // keep 1h of 1s ticks
const TICK_MS = 1000;

function step(price: number, anchor: number, vol: number): number {
  const pull = (anchor - price) * 0.06;                 // mean reversion to DB price
  const noise = (Math.random() - 0.5) * 2 * vol * price; // micro volatility
  return Math.max(0.001, Math.min(0.5, price + pull + noise));
}

export function useYuyuTicker(anchor: number, active: boolean) {
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [price, setPrice] = useState(anchor);
  const priceRef = useRef(anchor);
  const anchorRef = useRef(anchor);
  const seededRef = useRef(false);

  anchorRef.current = anchor > 0 ? anchor : anchorRef.current;

  // Seed a plausible 1h backfill so intraday timeframes are never empty
  useEffect(() => {
    if (!active || !anchor || seededRef.current) return;
    seededRef.current = true;

    const now = Date.now();
    const seeded: Tick[] = [];
    let p = anchor;
    for (let i = BUFFER_SECONDS; i > 0; i--) {
      p = step(p, anchor, 0.0006);
      seeded.push({ t: now - i * TICK_MS, p });
    }
    seeded.push({ t: now, p: anchor });
    priceRef.current = anchor;
    setPrice(anchor);
    setTicks(seeded);
  }, [active, anchor]);

  // Reset when the modal closes so the next open reseeds around a fresh anchor
  useEffect(() => {
    if (!active) seededRef.current = false;
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const next = step(priceRef.current, anchorRef.current, 0.0009);
      priceRef.current = next;
      setPrice(next);
      setTicks((prev) => {
        const out = prev.length >= BUFFER_SECONDS ? prev.slice(prev.length - BUFFER_SECONDS + 1) : prev.slice();
        out.push({ t: Date.now(), p: next });
        return out;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [active]);

  return { price: price || anchor, ticks };
}

export type IntradayTf = '1m' | '5m' | '15m' | '1h';

export const INTRADAY_WINDOWS: Record<IntradayTf, { seconds: number; bucket: number }> = {
  '1m':  { seconds: 60,   bucket: 1  },
  '5m':  { seconds: 300,  bucket: 5  },
  '15m': { seconds: 900,  bucket: 15 },
  '1h':  { seconds: 3600, bucket: 60 },
};

export function isIntraday(tf: string): tf is IntradayTf {
  return tf === '1m' || tf === '5m' || tf === '15m' || tf === '1h';
}

/** Bucket raw ticks into OHLC points for a given intraday timeframe. */
export function bucketTicks(ticks: Tick[], tf: IntradayTf) {
  const { seconds, bucket } = INTRADAY_WINDOWS[tf];
  const cutoff = Date.now() - seconds * 1000;
  const windowed = ticks.filter((t) => t.t >= cutoff);
  if (windowed.length === 0) return [];

  const slotMs = bucket * 1000;
  const map = new Map<number, { open: number; high: number; low: number; close: number }>();
  for (const tick of windowed) {
    const slot = Math.floor(tick.t / slotMs) * slotMs;
    const cur = map.get(slot);
    if (!cur) map.set(slot, { open: tick.p, high: tick.p, low: tick.p, close: tick.p });
    else {
      cur.high = Math.max(cur.high, tick.p);
      cur.low = Math.min(cur.low, tick.p);
      cur.close = tick.p;
    }
  }

  const slots = [...map.entries()].sort((a, b) => a[0] - b[0]);
  return slots.map(([slot, o], i) => ({
    price: o.close,
    open: o.open,
    high: o.high,
    low: o.low,
    close: o.close,
    timestamp: slot,
    time: i === slots.length - 1
      ? 'Now'
      : new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: bucket < 60 ? '2-digit' : undefined, hour12: false }),
  }));
}

/** Deterministic pseudo-random generator so a given day always renders the same curve. */
function seeded(seed: number) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

const LONG_WINDOWS: Record<string, { points: number; stepMs: number; vol: number; fmt: Intl.DateTimeFormatOptions }> = {
  '1D': { points: 24, stepMs: 3600_000, vol: 0.010, fmt: { hour: '2-digit', hour12: false } },
  '1W': { points: 28, stepMs: 6 * 3600_000, vol: 0.016, fmt: { weekday: 'short' } },
  '1M': { points: 30, stepMs: 24 * 3600_000, vol: 0.022, fmt: { month: 'short', day: 'numeric' } },
  '1Y': { points: 52, stepMs: 7 * 24 * 3600_000, vol: 0.035, fmt: { month: 'short' } },
};

/**
 * Continuous OHLC series for the long timeframes. Used only when the database
 * has not yet accumulated enough confirmed closes for that window: the walk is
 * deterministic per day, mean-reverting to the real anchor, and always ends on
 * the live price so the chart is coherent with the ticker.
 */
export function historicalSeries(anchor: number, tf: string, livePrice: number) {
  const cfg = LONG_WINDOWS[tf];
  if (!cfg || !anchor) return [];
  const now = Date.now();
  const rand = seeded(Math.floor(now / 86_400_000) * 7919 + cfg.points);

  let p = anchor;
  const out: { price: number; open: number; high: number; low: number; close: number; timestamp: number; time: string }[] = [];
  for (let i = cfg.points - 1; i >= 0; i--) {
    const open = p;
    const drift = (anchor - p) * 0.08;
    const move = (rand() - 0.5) * 2 * cfg.vol * anchor;
    const close = Math.max(0.001, Math.min(0.5, p + drift + move));
    const high = Math.max(open, close) * (1 + rand() * cfg.vol * 0.4);
    const low = Math.min(open, close) * (1 - rand() * cfg.vol * 0.4);
    const timestamp = now - i * cfg.stepMs;
    out.push({
      price: close, open, high, low, close, timestamp,
      time: i === 0 ? 'Now' : new Date(timestamp).toLocaleString([], cfg.fmt),
    });
    p = close;
  }
  const last = out[out.length - 1]!;
  last.close = livePrice || last.close;
  last.price = last.close;
  last.high = Math.max(last.high, last.close);
  last.low = Math.min(last.low, last.close);
  return out;
}
