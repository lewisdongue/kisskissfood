// ═══════════════════════════════════════════════════════════════════════════
// HYPER-LOCAL CONTENT + ADVANCED SCHEMA
// Builds the paragraphs, FAQ entries and nested JSON-LD that reference the
// live 24h metrics, the real local clock and niche-specific LSI vocabulary.
// Every payload is unique per (niche × city × day bucket).
// ═══════════════════════════════════════════════════════════════════════════

import type { PseoLocation } from "@/data/pseoData";
import { ORIGIN } from "@/lib/pseo";
import type { FreshMetrics, LocalClock } from "@/lib/pseoFresh";

export type Qa = { q: string; a: string };

/** Latent-semantic vocabulary mapped to each niche family. */
const LSI: Record<string, string[]> = {
  students: ["study sessions", "campus schedules", "exam-week breaks", "peer tutoring", "dorm downtime"],
  gamers: ["queue times", "voice comms", "ranked grinding", "squad finding", "ping stability"],
  "language-partners": ["tandem practice", "pronunciation drills", "conversation fluency", "native feedback", "shadowing"],
  musicians: ["jam sessions", "chord progressions", "home studio takes", "latency-sensitive playing", "songwriting swaps"],
  artists: ["sketch sessions", "portfolio critique", "live drawing", "colour studies", "creative prompts"],
  travelers: ["layover hours", "hostel evenings", "neighbourhood tips", "visa chatter", "time-zone gaps"],
  "night-owls": ["after-midnight sessions", "insomnia hours", "graveyard shifts", "late-night talk", "quiet-hours audio"],
  creators: ["content ideation", "audience testing", "short-form hooks", "collab calls", "stream prep"],
};

function lsiFor(categorySlug: string): string[] {
  return LSI[categorySlug] ?? ["spontaneous conversation", "shared interests", "real-time video", "instant matching"];
}

/** Two contextual paragraphs woven with niche LSI + live local conditions. */
export function freshParagraphs(
  categorySlug: string,
  label: string,
  location: PseoLocation,
  metrics: FreshMetrics,
  clock: LocalClock,
): string[] {
  const terms = lsiFor(categorySlug);
  const bandCopy =
    clock.band === "late-night"
      ? `it is ${clock.time} in ${location.name}, so the room skews toward quiet headphone conversations`
      : clock.band === "morning"
        ? `at ${clock.time} local time the ${location.name} room is still warming up, which means shorter queues`
        : clock.band === "afternoon"
          ? `${clock.time} local time is the steady mid-day window in ${location.name}`
          : `${clock.time} local time puts ${location.name} inside its busiest evening window`;

  return [
    `Right now ${bandCopy}. Over the last 24 hours this ${label} room handled ${metrics.matchesLast24h.toLocaleString("en-US")} matches with a median peer-to-peer latency of ${metrics.medianPingMs} ms, and roughly ${metrics.onlineNow} people were connectable at the moment this page was regenerated (${metrics.refreshedLabel}).`,
    `${metrics.activeThisWeek.toLocaleString("en-US")} ${label} were active in and around ${location.name} this week — ${metrics.trend === "up" ? `up ${metrics.trendPct}%` : metrics.trend === "down" ? `down ${Math.abs(metrics.trendPct)}%` : "flat"} versus the previous window. Conversations here cluster around ${terms.slice(0, 3).join(", ")} and ${terms[3] ?? "shared interests"}, with the heaviest overlap between ${metrics.peakWindow} ${clock.utcLabel}. Average time from tapping start to a live face is about ${metrics.avgMatchSeconds} seconds, and ${metrics.repeatRatePct}% of people start a second call in the same session.`,
  ];
}

/** FAQ entries that reference this exact niche, city and current conditions. */
export function freshFaq(
  label: string,
  location: PseoLocation,
  categorySlug: string,
  metrics: FreshMetrics,
  clock: LocalClock,
): Qa[] {
  const terms = lsiFor(categorySlug);
  return [
    {
      q: `How many ${label} are online in ${location.name} right now?`,
      a: `At the last refresh (${metrics.refreshedLabel}, ${clock.time} local time in ${location.name}) roughly ${metrics.onlineNow} ${label} were connectable, out of ${metrics.activeThisWeek.toLocaleString("en-US")} active this week. These figures are modelled from regional traffic and refreshed every 24 hours, so treat them as a live indication rather than an exact head-count.`,
    },
    {
      q: `What is the current average match time for ${label} in ${location.name}?`,
      a: `About ${metrics.avgMatchSeconds} seconds from tap to live video in the current window, with a median round-trip of ${metrics.medianPingMs} ms on the ${location.country} relay path. Matching is fastest inside the ${metrics.peakWindow} ${clock.utcLabel} peak and slowest during ${location.name}'s early-morning hours.`,
    },
    {
      q: `What do ${label} in ${location.name} usually talk about?`,
      a: `The recurring threads in this room are ${terms.join(", ")}. Because it is ${clock.dayName} ${clock.time} in ${location.name}, expect ${clock.band === "late-night" ? "slower, lower-volume conversations" : clock.band === "evening" ? "the highest-energy sessions of the day" : "shorter, faster-rotating calls"} at this hour.`,
    },
    {
      q: `Is there a best hour to start a ${label} call from ${location.name}?`,
      a: `Yes — ${metrics.peakWindow} ${clock.utcLabel}. That window carried the largest share of the ${metrics.matchesLast24h.toLocaleString("en-US")} matches recorded in the last 24 hours. Outside it, you will still connect, but expect the queue to run a few seconds longer.`,
    },
  ];
}

/**
 * Deeply nested, per-page-unique structured data: a Dataset describing the
 * live measurements, nested inside a Place-scoped observation graph.
 */
export function buildFreshJsonLd(
  url: string,
  label: string,
  location: PseoLocation,
  metrics: FreshMetrics,
  clock: LocalClock,
  languageTag: string,
) {
  return {
    "@type": "Dataset",
    "@id": `${url}#live-metrics`,
    name: `Live ${label} activity in ${location.name}`,
    description: `Rolling 24-hour connection metrics for ${label} matching in ${location.name}, ${location.country}, refreshed ${metrics.refreshedAt}.`,
    url,
    inLanguage: languageTag,
    dateModified: metrics.refreshedAt,
    isAccessibleForFree: true,
    creator: { "@id": `${ORIGIN}/#app` },
    spatialCoverage: { "@id": `${url}#place` },
    temporalCoverage: `${metrics.refreshedAt}/P1D`,
    measurementTechnique: "Aggregated WebRTC session telemetry, modelled per region",
    variableMeasured: [
      {
        "@type": "PropertyValue",
        name: "Active members this week",
        value: metrics.activeThisWeek,
        unitText: "members",
      },
      {
        "@type": "PropertyValue",
        name: "Average match time",
        value: metrics.avgMatchSeconds,
        unitCode: "SEC",
        minValue: 1,
        maxValue: 60,
      },
      {
        "@type": "PropertyValue",
        name: "Median peer-to-peer latency",
        value: metrics.medianPingMs,
        unitText: "ms",
      },
      {
        "@type": "PropertyValue",
        name: "Matches in last 24 hours",
        value: metrics.matchesLast24h,
        unitText: "matches",
      },
      {
        "@type": "PropertyValue",
        name: "Local peak window",
        value: `${metrics.peakWindow} ${clock.utcLabel}`,
      },
      {
        "@type": "PropertyValue",
        name: "Local time at generation",
        value: `${clock.dayName} ${clock.time} (${clock.utcLabel})`,
      },
    ],
  };
}
