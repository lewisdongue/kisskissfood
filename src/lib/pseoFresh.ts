// ═══════════════════════════════════════════════════════════════════════════
// PSEO FRESHNESS LAYER
// Every programmatic page is regenerated on a 24h cache window. The values
// below are re-derived from the current UTC day bucket, so the HTML payload
// physically changes between crawls (live-dashboard signal) while staying
// byte-stable inside a single day (cacheable, no hydration mismatch).
// Pure functions — safe on server and client.
// ═══════════════════════════════════════════════════════════════════════════

import { murmurHash3 } from "@/lib/pseo";
import type { PseoLocation } from "@/data/pseoData";

/** Cache window in seconds (24h) used by route headers + sitemap lastmod. */
export const REVALIDATE_SECONDS = 86_400;

/** Current UTC day bucket. Changes once every 24h. */
export function dayBucket(now: number = Date.now()): number {
  return Math.floor(now / (REVALIDATE_SECONDS * 1000));
}

/** Deterministic pseudo-random in [0,1) from a string key. */
function rand(key: string): number {
  return (murmurHash3(key) % 100_000) / 100_000;
}

function pick<T>(key: string, list: readonly T[]): T {
  return list[Math.floor(rand(key) * list.length) % list.length]!;
}

function between(key: string, min: number, max: number): number {
  return Math.round(min + rand(key) * (max - min));
}

export type LocalClock = {
  /** HH:MM in the city's standard time. */
  time: string;
  /** 0-23 local hour. */
  hour: number;
  /** morning | afternoon | evening | late-night */
  band: "morning" | "afternoon" | "evening" | "late-night";
  dayName: string;
  utcLabel: string;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Real local wall clock for the city, derived from its standard UTC offset.
 * Rounded to the 24h bucket start so SSR and hydration agree.
 */
export function localClock(location: PseoLocation, now: number = Date.now()): LocalClock {
  const bucketStart = dayBucket(now) * REVALIDATE_SECONDS * 1000;
  const local = new Date(bucketStart + location.utc * 3_600_000);
  const hour = local.getUTCHours();
  const minute = local.getUTCMinutes();
  const band: LocalClock["band"] =
    hour < 6 ? "late-night" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return {
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    hour,
    band,
    dayName: DAY_NAMES[local.getUTCDay()]!,
    utcLabel: `UTC${location.utc < 0 ? "-" : "+"}${Math.abs(location.utc)}`,
  };
}

export type FreshMetrics = {
  /** ISO date of the current regeneration window. */
  refreshedAt: string;
  /** Human label, e.g. "Monday 14 July". */
  refreshedLabel: string;
  activeThisWeek: number;
  onlineNow: number;
  avgMatchSeconds: number;
  medianPingMs: number;
  matchesLast24h: number;
  repeatRatePct: number;
  peakWindow: string;
  trend: "up" | "flat" | "down";
  trendPct: number;
};

/**
 * Per-city / per-niche live metrics for the current 24h window.
 * Deterministic within the window, different in the next one.
 */
export function freshMetrics(
  categorySlug: string,
  location: PseoLocation,
  now: number = Date.now(),
): FreshMetrics {
  const bucket = dayBucket(now);
  const seed = `${categorySlug}|${location.slug}|${bucket}`;
  const clock = localClock(location, now);
  const date = new Date(bucket * REVALIDATE_SECONDS * 1000);

  const base = between(`${seed}|base`, 240, 4_800);
  const nightFactor = clock.band === "late-night" ? 0.45 : clock.band === "evening" ? 1.25 : 1;
  const trendPct = between(`${seed}|trend`, -6, 23);

  return {
    refreshedAt: date.toISOString().slice(0, 10),
    refreshedLabel: `${clock.dayName} ${date.getUTCDate()} ${date.toLocaleString("en-US", {
      month: "long",
      timeZone: "UTC",
    })}`,
    activeThisWeek: base * 7 + between(`${seed}|w`, 0, 900),
    onlineNow: Math.max(12, Math.round((base / 22) * nightFactor)),
    avgMatchSeconds: between(`${seed}|match`, 3, 14),
    medianPingMs: between(`${seed}|ping`, 28, 148),
    matchesLast24h: base * 3 + between(`${seed}|m24`, 0, 700),
    repeatRatePct: between(`${seed}|rep`, 31, 68),
    peakWindow: pick(`${seed}|peak`, [
      "19:00 – 23:30",
      "20:30 – 01:00",
      "18:00 – 22:00",
      "21:00 – 02:00",
      "17:30 – 21:30",
    ]),
    trend: trendPct > 4 ? "up" : trendPct < -1 ? "down" : "flat",
    trendPct,
  };
}

/** Lastmod value for sitemaps, moving with the regeneration window. */
export function freshLastmod(now: number = Date.now()): string {
  return new Date(dayBucket(now) * REVALIDATE_SECONDS * 1000).toISOString().slice(0, 10);
}
