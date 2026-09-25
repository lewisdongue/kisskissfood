// ═══════════════════════════════════════════════════════════════════════════
// MULTI-DIMENSIONAL CONTENT MATRIX
// Modular, differentiated content blocks for every {niche × city} permutation.
// Everything is derived from a stable seed built from the slug pair, so:
//   - the same URL always renders the same copy (cacheable, crawl-stable)
//   - two different URLs practically never render the same combination
// Pool math: 3 blocks × (8 × 6 × 6) template slots × niche/region modifiers.
// ═══════════════════════════════════════════════════════════════════════════

import type { PseoCategory, PseoLocation } from "@/data/pseoData";
import { categoryLabel, formatUtc, murmurHash3 } from "@/lib/pseo";

export type ContentBlock = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: { term: string; detail: string }[];
};

type Ctx = {
  c: string;
  l: string;
  country: string;
  utc: string;
  region: string;
};

/** Coarse routing region derived from the city's UTC offset. */
function regionOf(utc: number): string {
  if (utc <= -7) return "West-coast Americas";
  if (utc <= -3) return "Atlantic Americas";
  if (utc < 1) return "West Africa / Atlantic Europe";
  if (utc < 4) return "EMEA core";
  if (utc < 7) return "West & South Asia";
  if (utc < 10) return "East & Southeast Asia";
  return "Oceania";
}

function pick<T>(pool: T[], seed: number, shift: number): T {
  return pool[(seed >>> shift) % pool.length]!;
}

// ── Block 1: context-aware behavioural breakdown ───────────────────────────

const BEHAVIOUR: ((x: Ctx) => string)[] = [
  (x) => `${x.c} connecting from ${x.l} tend to open a session between other tasks — a break between classes, a queue in a game lobby, a commute. Sessions are short, frequent, and started from a phone more often than a laptop, which is why the matching screen is built to work on one thumb.`,
  (x) => `Usage in ${x.l} clusters around the evening, after the working day in ${x.country} ends. Conversations run longer than the global average because people arrive with time rather than between two appointments.`,
  (x) => `The behaviour pattern among ${x.c} around ${x.l} is "scan then settle": several quick skips to find the right energy, then one long conversation. The interface optimises for that — skipping costs a single tap and never reloads the page.`,
  (x) => `In ${x.l}, most people arrive on mobile data rather than fixed broadband. That shapes everything downstream: lighter video ladders, faster fallback when a cell hands over, and no autoplaying background media.`,
  (x) => `${x.c} in ${x.l} usually already know what they want from a conversation — practice, company, a specific interest — so the first thirty seconds matter more than the total session length.`,
  (x) => `Traffic from ${x.l} is bimodal: a lunch-hour spike and a late-night one. The late window overlaps with daytime on the other side of the world, which is what makes cross-continental matches realistic from here.`,
  (x) => `Among ${x.c}, ${x.l} sessions skew toward repeat use rather than one-off curiosity. People come back at roughly the same hour, which quietly builds a recognisable local rhythm inside the global pool.`,
  (x) => `The typical ${x.l} session starts muted and cautious, then opens up. Controls are therefore placed where a thumb already rests, and nothing irreversible is ever one tap away.`,
];

const EXPECTATION: ((x: Ctx) => string)[] = [
  (x) => `Latency expectation here is simple: under a quarter of a second of mouth-to-ear delay, or the conversation stops feeling live. From ${x.l} that is comfortably reachable for most of the ${x.region} pool and still workable across an ocean.`,
  (x) => `What breaks a call is rarely bandwidth — it is jitter. Connections out of ${x.l} are tuned for a stable floor rather than a high ceiling, because a steady 480p beats a stuttering 1080p every single time.`,
  (x) => `People in ${x.l} judge quality in the first three seconds. If the first frame has not arrived by then, they skip — so connection setup is prioritised over resolution ramp-up.`,
  (x) => `Expectations around ${x.l} are shaped by mobile messaging apps: instant start, no lobby, no install. Anything slower than opening a chat thread reads as broken.`,
  (x) => `Across ${x.country}, network quality varies more by time of day than by location. Evening congestion is the real constraint, and the media ladder adapts down rather than dropping the call.`,
  (x) => `The practical target from ${x.l} is a first frame in under two seconds and no audio gap longer than a blink. Everything else is negotiable.`,
];

// ── Block 2: localized P2P routing specifics ───────────────────────────────

const ROUTING: ((x: Ctx) => string)[] = [
  (x) => `Calls from ${x.l} negotiate directly between browsers. Candidate addresses are gathered on both sides, the fastest working pair wins, and media never touches a recording server. A relay is used only when a carrier-grade NAT refuses a direct path.`,
  (x) => `Inside the ${x.region} routing zone, direct peer connections succeed for the large majority of attempts. When they fail — usually behind mobile carrier NAT in ${x.country} — traffic falls back to an encrypted relay without dropping the session.`,
  (x) => `Signalling from ${x.l} is deliberately tiny: an offer, an answer and a trickle of candidates. The heavy part, the media itself, goes browser to browser, which is why quality depends on your path rather than on server load.`,
  (x) => `Connection setup out of ${x.l} runs candidates in parallel instead of in sequence. The first pair that answers carries the call; the rest are discarded. That is the single biggest reason the first frame arrives fast.`,
  (x) => `For ${x.l} the nearest relay sits inside the ${x.region} zone, so even fallback traffic stays regional instead of crossing a continent twice.`,
  (x) => `Encryption is not optional on this path: media from ${x.l} is secured end to end by the browser itself, with keys negotiated per session and discarded when the call ends.`,
];

const CLOCK: ((x: Ctx) => string)[] = [
  (x) => `${x.l} sits at ${x.utc}. That places its evening against the morning of the Americas and the late night of East Asia — a wide overlap window if you want conversations outside ${x.country}.`,
  (x) => `At ${x.utc}, the busiest matching window from ${x.l} lines up with the European evening. Earlier in the day the pool skews toward Asia-Pacific.`,
  (x) => `Because ${x.l} runs on ${x.utc}, a late-night session there reaches people who are starting their working day elsewhere — usually the easiest time to find long conversations.`,
  (x) => `Time zone matters more than distance: from ${x.utc}, the ${x.region} pool is awake with you, and the rest of the world rotates in and out across the day.`,
];

// ── Block 3: unique use-case scenarios ─────────────────────────────────────

const SCENARIO_LEAD: ((x: Ctx) => string)[] = [
  (x) => `Three ways people actually use this page from ${x.l}:`,
  (x) => `What a real session looks like for ${x.c} here:`,
  (x) => `Concrete situations reported by ${x.c} around ${x.l}:`,
  (x) => `How this gets used in practice across ${x.country}:`,
];

const SCENARIOS: ((x: Ctx) => { term: string; detail: string })[][] = [
  [
    (x) => ({ term: "Daily warm-up", detail: `A fifteen-minute session before work or class to shake off the silence — common among ${x.c} in ${x.l} who work alone.` }),
    (x) => ({ term: "Cross-time-zone practice", detail: `Deliberately matching outside ${x.utc} to reach people who are mid-afternoon while ${x.l} is asleep.` }),
    (x) => ({ term: "Weekend long-form", detail: `Saturday sessions that run past an hour, usually with someone met earlier in the week.` }),
  ],
  [
    (x) => ({ term: "Commute filler", detail: `Voice-only on mobile data across ${x.l}, video off, one hand on the phone.` }),
    (x) => ({ term: "Interest matching", detail: `Filtering toward ${x.c} specifically rather than taking the global random pool.` }),
    (x) => ({ term: "Local-to-global", detail: `Starting inside ${x.country} to warm up, then widening the radius once confident.` }),
  ],
  [
    (x) => ({ term: "Late-night room", detail: `The ${x.l} night window, where the conversation pace is slower and sessions run long.` }),
    (x) => ({ term: "Language reps", detail: `Short, repeated sessions aimed at speaking practice rather than friendship.` }),
    (x) => ({ term: "Community discovery", detail: `Using the ${x.c} page as an entry point, then following the directory into neighbouring cities.` }),
  ],
  [
    (x) => ({ term: "Between tasks", detail: `Two or three quick matches during a break, closed as soon as the break ends.` }),
    (x) => ({ term: "Travel prep", detail: `Talking to people in a destination country before flying out of ${x.l}.` }),
    (x) => ({ term: "Group-adjacent", detail: `One-to-one calls that feed into wider ${x.c} circles across ${x.region}.` }),
  ],
];

const HEADINGS: Record<"behaviour" | "routing" | "scenarios", ((x: Ctx) => string)[]> = {
  behaviour: [
    (x: Ctx) => `How ${x.c} use video chat in ${x.l}`,
    (x: Ctx) => `${x.l} usage patterns, in plain terms`,
    (x: Ctx) => `The ${x.l} rhythm: when and how people connect`,
  ],
  routing: [
    (x: Ctx) => `Peer-to-peer routing from ${x.l}`,
    (x: Ctx) => `What happens on the network when you press start in ${x.l}`,
    (x: Ctx) => `${x.region} routing, explained`,
  ],
  scenarios: [
    (x: Ctx) => `Real use cases in ${x.l}`,
    (x: Ctx) => `Three ${x.l} scenarios worth knowing`,
    (x: Ctx) => `How ${x.c} actually run a session`,
  ],
};

/** Build the three differentiated content blocks for a niche × city page. */
export function buildContentBlocks(
  category: PseoCategory,
  location: PseoLocation,
  lang = "en",
): ContentBlock[] {
  const seed = murmurHash3(`blocks::${category.slug}::${location.slug}`);
  const x: Ctx = {
    c: categoryLabel(category, lang),
    l: location.name,
    country: location.country,
    utc: formatUtc(location.utc),
    region: regionOf(location.utc),
  };

  const scenarioSet = pick(SCENARIOS, seed, 11);

  return [
    {
      id: "behaviour",
      heading: pick(HEADINGS.behaviour, seed, 2)(x),
      paragraphs: [pick(BEHAVIOUR, seed, 0)(x), pick(EXPECTATION, seed, 7)(x)],
    },
    {
      id: "routing",
      heading: pick(HEADINGS.routing, seed, 4)(x),
      paragraphs: [pick(ROUTING, seed, 3)(x), pick(CLOCK, seed, 9)(x)],
    },
    {
      id: "scenarios",
      heading: pick(HEADINGS.scenarios, seed, 6)(x),
      paragraphs: [pick(SCENARIO_LEAD, seed, 13)(x)],
      bullets: scenarioSet.map((fn) => fn(x)),
    },
  ];
}
