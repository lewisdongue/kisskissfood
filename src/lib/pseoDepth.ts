// ═══════════════════════════════════════════════════════════════════════════
// DEPTH LAYER — heavy, genuinely useful content for every {niche × city} page.
// Everything here is pure data derived from a stable seed (slug pair), so the
// same URL always renders the same page (cacheable, crawl-stable) while two
// different URLs practically never render the same combination.
// Zero client JS: every section below is server-rendered static markup.
// ═══════════════════════════════════════════════════════════════════════════

import type { PseoCategory, PseoLocation } from "@/data/pseoData";
import { categoryLabel, formatUtc, murmurHash3 } from "@/lib/pseo";

export type Step = { name: string; text: string };
export type CompareRow = { feature: string; caakus: string; others: string };
export type TableRow = { cells: string[] };
export type Term = { term: string; detail: string };
export type Qa = { q: string; a: string };

export type PseoDepth = {
  steps: { heading: string; intro: string; items: Step[] };
  compare: { heading: string; intro: string; rows: CompareRow[] };
  safety: { heading: string; paragraphs: string[]; bullets: Term[] };
  network: { heading: string; intro: string; columns: string[]; rows: TableRow[]; note: string };
  timing: { heading: string; intro: string; columns: string[]; rows: TableRow[] };
  starters: { heading: string; intro: string; items: string[] };
  glossary: { heading: string; items: Term[] };
  faqExtra: Qa[];
  keyFacts: Term[];
};

type Ctx = {
  c: string;
  cLower: string;
  l: string;
  country: string;
  utc: string;
  utcNum: number;
  region: string;
};

function regionOf(utc: number): string {
  if (utc <= -7) return "West-coast Americas";
  if (utc <= -3) return "Atlantic Americas";
  if (utc < 1) return "West Africa and Atlantic Europe";
  if (utc < 4) return "the EMEA core";
  if (utc < 7) return "West and South Asia";
  if (utc < 10) return "East and Southeast Asia";
  return "Oceania";
}

function counterpart(utc: number): string {
  if (utc <= -3) return "Europe and West Africa";
  if (utc < 4) return "the Americas and South Asia";
  if (utc < 8) return "Europe and East Asia";
  return "Europe and the Americas";
}

function pick<T>(pool: T[], seed: number, shift: number): T {
  return pool[(seed >>> shift) % pool.length]!;
}

function rotate<T>(pool: T[], seed: number, shift: number, count: number): T[] {
  const start = (seed >>> shift) % pool.length;
  const out: T[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i += 1) {
    out.push(pool[(start + i) % pool.length]!);
  }
  return out;
}

function clockLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  return `${String(h).padStart(2, "0")}:00`;
}

// ── 1. How it works, step by step (HowTo) ──────────────────────────────────

const STEP_HEADINGS = [
  (x: Ctx) => `Starting a call from ${x.l}: four steps`,
  (x: Ctx) => `How a ${x.l} session actually starts`,
  (x: Ctx) => `From tap to first frame in ${x.l}`,
];

const STEP_INTRO = [
  (x: Ctx) => `No account, no download and no waiting room. This is the exact sequence a ${x.cLower} in ${x.l} goes through, and what the browser is doing at each point.`,
  (x: Ctx) => `The whole flow runs inside the browser tab. Here is what happens between the moment you tap start in ${x.l} and the moment you see someone.`,
  (x: Ctx) => `Four steps, roughly two seconds end to end on a healthy ${x.country} mobile connection.`,
];

function buildSteps(x: Ctx, seed: number): Step[] {
  return [
    {
      name: "Allow camera and microphone",
      text: `Your browser asks once, locally. Nothing is transmitted before you accept, and revoking the permission ends every future session from ${x.l} immediately.`,
    },
    {
      name: "Enter the matching pool",
      text: `You join the live pool with a language preference and an approximate region. ${x.c} in ${x.l} are prioritised first, then ${x.region}, then the global pool if nobody local is free.`,
    },
    {
      name: "Direct peer connection",
      text: `Both browsers exchange candidate network paths and pick the fastest working pair. Media then travels browser to browser — it is never stored, recorded or replayed on our side.`,
    },
    {
      name: "Talk, or skip in one tap",
      text: pick(
        [
          `Conversations run as long as both sides want. One tap puts you back in the pool with a new partner, without reloading the page.`,
          `If the fit is wrong, skipping costs a single tap and keeps the same camera stream alive, so the next match starts even faster than the first.`,
          `Most ${x.l} sessions settle after two or three skips. Ending the call releases the camera straight away.`,
        ],
        seed,
        5,
      ),
    },
  ];
}

// ── 2. Comparison ───────────────────────────────────────────────────────────

const COMPARE_INTRO = [
  (x: Ctx) => `People arriving from older random-chat sites usually compare the same four things. Measured from ${x.l}, this is where the difference sits.`,
  (x: Ctx) => `If you used Omegle, Chatroulette, Monkey or Azar from ${x.country}, here is the honest side-by-side.`,
  (x: Ctx) => `What actually changes for a ${x.cLower} in ${x.l} compared with the classic alternatives.`,
];

function buildCompare(x: Ctx): CompareRow[] {
  return [
    { feature: "Account required", caakus: "No — start as a guest", others: "Usually a signup or an app install" },
    { feature: "Mobile app install", caakus: "None, it runs in the browser tab", others: "App store download on most of them" },
    { feature: "Media path", caakus: "Direct browser to browser, encrypted", others: "Frequently relayed through central servers" },
    { feature: "Cost", caakus: "Free, no per-minute charge", others: "Coins, credits or paywalled filters" },
    { feature: `Local pool in ${x.country}`, caakus: `${x.c} matched first, then ${x.region}`, others: "Global random with little regional weighting" },
    { feature: "Moderation", caakus: "On-device screening plus reporting, 18+ only", others: "Varies widely, often reactive only" },
  ];
}

// ── 3. Safety ───────────────────────────────────────────────────────────────

const SAFETY_HEADINGS = [
  (x: Ctx) => `Safety and moderation for ${x.l} sessions`,
  (x: Ctx) => `Staying safe as a ${x.cLower} in ${x.l}`,
  (x: Ctx) => `What protects you on a ${x.l} call`,
];

const SAFETY_P1 = [
  (x: Ctx) => `Every session is adults only. Screening runs on your own device before anything leaves it, which means the check costs no extra round trip and no frame is uploaded for inspection from ${x.l}.`,
  (x: Ctx) => `Moderation is built around three layers: on-device screening, one-tap reporting, and rate limits that make abusive re-matching pointless. None of them require your identity.`,
  (x: Ctx) => `You are never identified by name, address or phone number. A session in ${x.l} carries an approximate region and a language, nothing that points back at you personally.`,
];

const SAFETY_P2 = [
  (x: Ctx) => `Calls are peer to peer and ephemeral: there is no recording, no transcript and no replay. When the tab closes, the connection and its encryption keys are gone.`,
  (x: Ctx) => `Reporting a partner ends the call instantly and removes them from your pool. Repeated reports carry a temporary ban rather than a warning.`,
  (x: Ctx) => `Nothing irreversible is ever one tap away. Camera, microphone and match state are separate controls, so you can go audio-only mid-call without dropping the conversation.`,
];

const SAFETY_TIPS: Term[] = [
  { term: "Keep it in the tab", detail: "Never move a new contact to a private messenger in the first minutes. There is no reason to rush that." },
  { term: "No money, ever", detail: "Nobody legitimate asks a stranger on a video call for a payment, a gift card or a wallet address. Report and skip." },
  { term: "Watch your background", detail: "Street names, plates, school logos and mail on a desk identify you faster than anything you say." },
  { term: "Audio first is fine", detail: "Starting with the camera off is normal and costs nothing — turn it on when the conversation earns it." },
  { term: "One tap ends it", detail: "You never owe a stranger an explanation. Skipping is instant and leaves no trace on your side." },
  { term: "18+ only", detail: "Minors are not allowed. If a partner looks underage, report rather than skip so the account is reviewed." },
];

// ── 4. Network and data ─────────────────────────────────────────────────────

const NETWORK_HEADINGS = [
  (x: Ctx) => `Bandwidth, data and device guide for ${x.l}`,
  (x: Ctx) => `What a call costs in data from ${x.country}`,
  (x: Ctx) => `Network requirements on a ${x.l} connection`,
];

const NETWORK_INTRO = [
  (x: Ctx) => `Mobile data matters more than raw speed here. These are the working numbers for a one-to-one call out of ${x.l}; the media ladder adapts down automatically rather than dropping the session.`,
  (x: Ctx) => `You do not need fibre. A stable mobile connection in ${x.l} is enough — stability beats peak throughput on every single call.`,
  (x: Ctx) => `Practical figures for planning a session on a ${x.country} data plan.`,
];

const NETWORK_ROWS: TableRow[] = [
  { cells: ["Audio only", "~40 kbps", "~18 MB per hour", "Works on a weak 3G cell"] },
  { cells: ["Video 360p", "~400 kbps", "~180 MB per hour", "Comfortable default on mobile data"] },
  { cells: ["Video 480p", "~800 kbps", "~360 MB per hour", "Good 4G or Wi-Fi"] },
  { cells: ["Video 720p", "~1.5 Mbps", "~675 MB per hour", "Stable Wi-Fi or fixed broadband"] },
];

const NETWORK_NOTES = [
  (x: Ctx) => `Evening congestion is the real constraint across ${x.country}, not distance. If quality drops around peak hour, switching the camera off keeps the conversation perfectly usable at a twentieth of the data.`,
  (x: Ctx) => `Jitter, not bandwidth, is what breaks a call from ${x.l}. A steady 360p always feels better than a stuttering 720p.`,
  (x: Ctx) => `Handovers between cells while moving around ${x.l} are recovered automatically; the stream re-negotiates instead of ending the session.`,
];

// ── 5. Best times ───────────────────────────────────────────────────────────

const TIMING_HEADINGS = [
  (x: Ctx) => `Best hours to find someone from ${x.l}`,
  (x: Ctx) => `${x.l} matching windows across the day`,
  (x: Ctx) => `When the pool is busiest at ${x.utc}`,
];

const TIMING_INTRO = [
  (x: Ctx) => `${x.l} runs on ${x.utc}. Because the pool is global, the hour you pick decides who is awake more than anything else you can configure.`,
  (x: Ctx) => `Time zone beats distance. From ${x.utc} these are the four windows worth knowing, in ${x.l} local time.`,
  (x: Ctx) => `Local clock in ${x.l}, and who is realistically online on the other side.`,
];

function buildTiming(x: Ctx): TableRow[] {
  return [
    { cells: [`${clockLabel(7)} – ${clockLabel(10)}`, "Early", `Mostly ${x.region}; short sessions before work or class`],
    },
    { cells: [`${clockLabel(12)} – ${clockLabel(14)}`, "Lunch spike", `${x.c} on a break, fast skips, five to fifteen minute calls`] },
    { cells: [`${clockLabel(18)} – ${clockLabel(22)}`, "Peak", `Largest ${x.country} pool of the day, longest conversations`] },
    { cells: [`${clockLabel(23)} – ${clockLabel(2)}`, "Night bridge", `Overlaps daytime in ${counterpart(x.utcNum)} — the easiest cross-continental window`] },
  ];
}

// ── 6. Conversation starters ────────────────────────────────────────────────

const STARTER_HEADINGS = [
  (x: Ctx) => `Openers that work with ${x.c}`,
  (x: Ctx) => `What to say in the first thirty seconds`,
  (x: Ctx) => `Conversation starters for ${x.l} matches`,
];

const STARTER_INTRO = [
  (x: Ctx) => `The first thirty seconds decide whether a call lasts. These openers are specific enough to get a real answer instead of a skip.`,
  (x: Ctx) => `Avoid "hi" and "asl". Anything that asks for an opinion outperforms anything that asks for a fact.`,
  (x: Ctx) => `Tested openers, ordered from safest to most specific for ${x.c} around ${x.l}.`,
];

const STARTERS: ((x: Ctx) => string)[] = [
  (x) => `"What time is it where you are?" — instantly frames the conversation around the ${x.utc} gap and never feels intrusive.`,
  (x) => `"What is everyone in your city doing right now?" — turns a stranger into a guide instead of an interviewee.`,
  (x) => `"What should I absolutely not miss if I visited?" — people answer this one at length, every time.`,
  (x) => `"What are you procrastinating on tonight?" — self-deprecating, low stakes, almost always returns a laugh.`,
  (x) => `"What is the last thing you got obsessed with?" — the fastest route to a real interest among ${x.c}.`,
  (x) => `"Teach me one word in your language that has no translation." — perfect when the match is outside ${x.country}.`,
  (x) => `"Is your city overrated or underrated?" — opinionated by design, which is exactly what keeps a call alive.`,
  (x) => `"What does a normal ${x.l} evening look like for you?" — grounded, local, and easy for both sides to answer.`,
  (x) => `"What are you listening to at the moment?" — shared taste is the shortest bridge between two strangers.`,
  (x) => `"What would you be doing if the internet went down for a week?" — surprisingly deep for an opening question.`,
];

// ── 7. Glossary ─────────────────────────────────────────────────────────────

const GLOSSARY: Term[] = [
  { term: "Peer-to-peer (P2P)", detail: "Your browser talks straight to the other browser. Video and audio do not pass through a server that could store them." },
  { term: "WebRTC", detail: "The browser standard that carries real-time audio and video. It is built into Chrome, Safari, Firefox and Edge — nothing to install." },
  { term: "Latency", detail: "Mouth-to-ear delay. Under roughly 250 ms a conversation feels live; above it, people start talking over each other." },
  { term: "Jitter", detail: "Variation in packet arrival. It damages a call far more than low bandwidth does, which is why stability is prioritised over resolution." },
  { term: "ICE candidate", detail: "A possible network path between two browsers. Several are tested in parallel and the fastest working one carries the call." },
  { term: "NAT traversal", detail: "Getting through a router or carrier network that hides your address. When it fails, an encrypted relay takes over without dropping the call." },
  { term: "Relay (TURN)", detail: "A fallback server used only when a direct path is impossible. It forwards encrypted media and cannot read it." },
  { term: "Media ladder", detail: "The set of quality levels a call moves between automatically as your connection changes." },
];

// ── 8. Extra FAQ (localised People-Also-Ask intents) ───────────────────────

const FAQ_POOL: ((x: Ctx) => Qa)[] = [
  (x) => ({
    q: `Is Caakus free to use in ${x.country}?`,
    a: `Yes. Matching, video and voice are free from ${x.l} with no per-minute charge and no credit system. You only pay for optional extras, never for the conversation itself.`,
  }),
  (x) => ({
    q: `Do I need to download an app in ${x.l}?`,
    a: `No. It runs in the browser tab on Android, iPhone, tablet and desktop. There is nothing in an app store to install and nothing to update.`,
  }),
  (x) => ({
    q: `Do I need an account to talk to ${x.cLower} in ${x.l}?`,
    a: `No account is required to start. You can create one later if you want to keep progress, but a guest session works fully from the first tap.`,
  }),
  (x) => ({
    q: `How much mobile data does one hour of video use?`,
    a: `Roughly 180 MB per hour at 360p, around 360 MB at 480p, and about 18 MB per hour with the camera off. The quality ladder adapts down on a weak ${x.country} cell rather than dropping the call.`,
  }),
  (x) => ({
    q: `What is the best time to find people from ${x.l}?`,
    a: `${x.l} sits at ${x.utc}. The local pool peaks between 18:00 and 22:00, while 23:00 to 02:00 overlaps with daytime in ${counterpart(x.utcNum)} and is the easiest window for cross-continental matches.`,
  }),
  (x) => ({
    q: `Are conversations recorded or stored?`,
    a: `No. Media travels directly between the two browsers and is encrypted end to end. There is no recording, no transcript and no replay — closing the tab destroys the session keys.`,
  }),
  (x) => ({
    q: `Can I talk to people outside ${x.country}?`,
    a: `Yes. ${x.c} near ${x.l} are matched first, then ${x.region}, then the global pool. You can widen the radius at any point, and the night window is the most reliable time to do it.`,
  }),
  (x) => ({
    q: `Does it work on a slow or mobile connection?`,
    a: `Yes. A stable connection matters more than a fast one. Audio-only sessions stay usable on a weak 3G cell, and the video ladder steps down automatically instead of ending the call.`,
  }),
  (x) => ({
    q: `Is it safe, and who moderates it?`,
    a: `Sessions are adults only. Screening runs on your own device before anything is transmitted, reporting ends a call instantly, and repeated reports carry a temporary ban. No name, phone number or address is ever requested.`,
  }),
  (x) => ({
    q: `Can I use it without a camera?`,
    a: `Yes. Voice-only is a first-class mode, not a degraded one — it is the most common way people in ${x.l} use it on the move.`,
  }),
  (x) => ({
    q: `How do I skip to the next person?`,
    a: `One tap. The camera stream stays alive between matches, so the second connection is usually faster than the first, and the page never reloads.`,
  }),
  (x) => ({
    q: `Does it work on iPhone and Android browsers?`,
    a: `Yes, on current Safari, Chrome, Firefox and Edge. Real-time video is part of the browser itself, which is why no install is needed in ${x.l} or anywhere else.`,
  }),
];

// ── Key facts strip ─────────────────────────────────────────────────────────

function buildFacts(x: Ctx): Term[] {
  return [
    { term: "Local time zone", detail: `${x.l} runs on ${x.utc}, inside ${x.region}.` },
    { term: "Peak window", detail: `18:00 – 22:00 local, with a second bridge from 23:00 into ${counterpart(x.utcNum)}.` },
    { term: "Entry cost", detail: "Free, no account, no install, browser only." },
    { term: "Minimum connection", detail: "≈40 kbps audio-only, ≈400 kbps for 360p video." },
    { term: "Privacy model", detail: "Peer to peer, encrypted, never recorded." },
    { term: "Age policy", detail: "18+ only, with on-device screening and one-tap reporting." },
  ];
}

// ── Builder ─────────────────────────────────────────────────────────────────

export function buildDepth(
  category: PseoCategory,
  location: PseoLocation,
  lang = "en",
): PseoDepth {
  const seed = murmurHash3(`depth::${category.slug}::${location.slug}`);
  const label = categoryLabel(category, lang);
  const x: Ctx = {
    c: label,
    cLower: label.toLowerCase(),
    l: location.name,
    country: location.country,
    utc: formatUtc(location.utc),
    utcNum: location.utc,
    region: regionOf(location.utc),
  };

  return {
    steps: {
      heading: pick(STEP_HEADINGS, seed, 1)(x),
      intro: pick(STEP_INTRO, seed, 3)(x),
      items: buildSteps(x, seed),
    },
    compare: {
      heading: `Caakus compared with the older random chat sites`,
      intro: pick(COMPARE_INTRO, seed, 6)(x),
      rows: buildCompare(x),
    },
    safety: {
      heading: pick(SAFETY_HEADINGS, seed, 8)(x),
      paragraphs: [pick(SAFETY_P1, seed, 2)(x), pick(SAFETY_P2, seed, 10)(x)],
      bullets: rotate(SAFETY_TIPS, seed, 12, 6),
    },
    network: {
      heading: pick(NETWORK_HEADINGS, seed, 14)(x),
      intro: pick(NETWORK_INTRO, seed, 16)(x),
      columns: ["Mode", "Bitrate", "Data per hour", "Works on"],
      rows: NETWORK_ROWS,
      note: pick(NETWORK_NOTES, seed, 18)(x),
    },
    timing: {
      heading: pick(TIMING_HEADINGS, seed, 20)(x),
      intro: pick(TIMING_INTRO, seed, 5)(x),
      columns: [`Local time in ${x.l}`, "Window", "Who is online"],
      rows: buildTiming(x),
    },
    starters: {
      heading: pick(STARTER_HEADINGS, seed, 7)(x),
      intro: pick(STARTER_INTRO, seed, 9)(x),
      items: rotate(STARTERS, seed, 11, 6).map((fn) => fn(x)),
    },
    glossary: {
      heading: `Plain-language glossary`,
      items: rotate(GLOSSARY, seed, 13, 6),
    },
    faqExtra: rotate(FAQ_POOL, seed, 15, 7).map((fn) => fn(x)),
    keyFacts: buildFacts(x),
  };
}

/** HowTo schema for the four-step start sequence. */
export function buildHowToJsonLd(depth: PseoDepth, url: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description: depth.steps.intro,
    totalTime: "PT2M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
    step: depth.steps.items.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${url}#start-steps`,
    })),
  };
}
