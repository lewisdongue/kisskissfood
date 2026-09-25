// ═══════════════════════════════════════════════════════════════════════════
// HUB PILLARS — 12 authority pages served at /{lang}/discover/hub/{slug}
// Pure content layer. No business logic. English source of truth.
// Framing: Caakus = next-generation real-time global communication network
// powered by secure virtual platform points. No dating clichés, no crypto.
// ═══════════════════════════════════════════════════════════════════════════

export type HubSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type HubFaq = { q: string; a: string };

export type HubCluster = { label: string; terms: string[] };

export type HubPillar = {
  slug: string;
  eyebrow: string;
  h1: string;
  title: string;
  description: string;
  intro: string[];
  stats: { label: string; value: string }[];
  sections: HubSection[];
  clusters: HubCluster[];
  faq: HubFaq[];
  related: string[];
};

const CTA_NOTE = "Free · No download · Browser only · 18+";

export const HUB_CTA_LABEL = "Launch Live Video Match Now";
export const HUB_CTA_NOTE = CTA_NOTE;

export const HUB_PILLARS: HubPillar[] = [
  {
    slug: "global-p2p-video-network",
    eyebrow: "Network architecture",
    h1: "The Global Peer-to-Peer Video Network Behind Instant Human Connection",
    title: "Global P2P Video Network Architecture | Caakus",
    description:
      "How a worldwide peer-to-peer video network routes browser-to-browser streams in milliseconds, and why distributed media paths beat centralised conferencing servers.",
    intro: [
      "A global peer-to-peer video network is not a single data centre streaming to everyone. It is a mesh of direct media paths negotiated between two browsers, supported by a thin layer of signalling, relay and observability services that step in only when the direct path fails. Caakus is built on exactly that principle: the shortest possible route between two people, anywhere on earth.",
      "This pillar explains the full architecture — signalling, candidate gathering, relay fallback, congestion control and regional pooling — and why it produces conversations that feel local even when the two participants sit twelve time zones apart.",
    ],
    stats: [
      { label: "Countries reachable", value: "190+" },
      { label: "Typical match time", value: "< 2s" },
      { label: "Media path", value: "Direct P2P" },
      { label: "Client install", value: "None" },
      { label: "Transport", value: "DTLS-SRTP" },
    ],
    sections: [
      {
        heading: "Why direct media paths win",
        body:
          "Centralised conferencing routes every packet through a selective forwarding unit. That adds a hop, a queue and a geographic detour. A direct peer connection removes all three: once both browsers agree on a candidate pair, audio and video travel the internet's own shortest path. For a one-to-one conversation — the entire Caakus use case — a forwarding server adds cost and latency without adding value.",
        bullets: [
          "One hop instead of three between speaker and listener",
          "No server-side transcoding, so no generational quality loss",
          "Encryption terminates at the participants, not at a middlebox",
          "Infrastructure cost scales with failures, not with total minutes",
        ],
      },
      {
        heading: "Signalling: the handshake that never carries media",
        body:
          "Before a single video frame moves, the two browsers must exchange session descriptions and network candidates. Caakus performs that exchange over a persistent realtime channel: an offer is published, the answer is returned, candidates trickle in asynchronously as each network interface is discovered. The signalling layer is deliberately tiny and stateless — it knows who is talking to whom, never what is said.",
      },
      {
        heading: "Relay as a safety net, not a default",
        body:
          "Symmetric NATs, restrictive corporate firewalls and some mobile carrier networks block direct connectivity. A relay server then forwards encrypted media on behalf of both peers. Caakus treats relay as an explicit fallback measured in percentage of sessions, not as the standard path, which keeps the median connection direct and the relay budget predictable.",
        bullets: [
          "Host candidates first, then reflexive, then relayed",
          "Trickle delivery so the first viable pair wins immediately",
          "Relay credentials issued short-lived and per session",
          "Automatic renegotiation when a network interface changes",
        ],
      },
      {
        heading: "Regional pooling and fair matching",
        body:
          "Matchmaking is where architecture becomes experience. Candidates are pooled with awareness of region, round-trip estimate and recent pairing history, so the engine avoids both long-haul pairings that degrade quality and repeat pairings that degrade novelty. The pool is drained under row-level locking, which means two people are never handed the same partner.",
      },
    ],
    clusters: [
      {
        label: "Distributed media transport",
        terms: [
          "peer-to-peer video network",
          "browser-to-browser streaming",
          "direct media path",
          "mesh topology",
          "selective forwarding unit",
          "media relay fallback",
          "candidate pair selection",
          "NAT traversal",
          "symmetric NAT",
          "reflexive candidate",
          "host candidate",
          "relayed candidate",
          "session negotiation",
        ],
      },
      {
        label: "Signalling and session control",
        terms: [
          "realtime signalling channel",
          "session description protocol",
          "offer answer exchange",
          "trickle candidate delivery",
          "renegotiation event",
          "presence channel",
          "broadcast channel",
          "stateless signalling",
          "connection state machine",
          "ICE restart",
          "handshake latency",
          "signalling throughput",
          "socket backpressure",
        ],
      },
      {
        label: "Global routing quality",
        terms: [
          "zero-latency video routing",
          "round-trip time estimation",
          "geographic proximity matching",
          "cross-continent routing",
          "jitter buffer tuning",
          "packet loss concealment",
          "adaptive bitrate ladder",
          "congestion control",
          "bandwidth estimation",
          "frame pacing",
          "network path diversity",
          "edge presence",
          "carrier grade NAT",
        ],
      },
      {
        label: "Matchmaking systems",
        terms: [
          "instant matchmaking engine",
          "queue draining",
          "row level locking",
          "advisory lock",
          "pool partitioning",
          "pairing fairness",
          "repeat pair suppression",
          "waiting pool heartbeat",
          "match acceptance window",
          "skip and rematch",
          "session handoff",
          "graceful teardown",
          "reconnection window",
        ],
      },
      {
        label: "Reliability engineering",
        terms: [
          "observability pipeline",
          "connection success rate",
          "relay ratio monitoring",
          "failure budget",
          "synthetic connection probes",
          "regional health checks",
          "graceful degradation",
          "audio-only fallback",
          "idempotent retries",
          "rate limiting",
          "capacity headroom",
          "incident telemetry",
          "structured event logging",
        ],
      },
    ],
    faq: [
      {
        q: "What is a peer-to-peer video network?",
        a: "It is a network where two browsers exchange audio and video directly with each other, instead of sending every packet through a central server. Servers are used only to introduce the two devices and, when a direct route is impossible, to relay encrypted media.",
      },
      {
        q: "Does peer-to-peer mean my connection is unencrypted?",
        a: "No. Browser media channels are encrypted end to end with DTLS-SRTP by specification. Even a relay server forwards ciphertext it cannot read.",
      },
      {
        q: "Why is peer-to-peer faster than a conferencing server?",
        a: "Because it removes hops. A direct path is the internet's own shortest route between two addresses, while a central server adds a detour plus queuing and forwarding time.",
      },
      {
        q: "What happens when a direct connection fails?",
        a: "The session automatically falls back to a relay server. The conversation continues without interruption; only the media path changes.",
      },
      {
        q: "Do I need to install anything to join the network?",
        a: "No. Everything runs in a standard browser on desktop or mobile — no download, no plugin, no app store.",
      },
      {
        q: "How many countries can the network reach?",
        a: "More than 190. Any device with a modern browser and an internet connection can participate.",
      },
    ],
    related: ["webrtc-browser-streaming", "zero-latency-routing", "instant-global-matchmaking"],
  },
  {
    slug: "webrtc-browser-streaming",
    eyebrow: "Protocol deep dive",
    h1: "Browser-to-Browser WebRTC Streaming Explained, End to End",
    title: "WebRTC Browser-to-Browser Streaming Explained | Caakus",
    description:
      "A complete technical walkthrough of WebRTC: media capture, codecs, ICE, DTLS-SRTP encryption and the browser APIs that make instant video streams possible without any install.",
    intro: [
      "WebRTC turned the browser into a real-time media endpoint. No plugin, no SDK download, no proprietary runtime: a web page can capture a camera, negotiate a session and stream to another page across the planet. Caakus is built entirely on those native browser primitives.",
      "This page walks the full pipeline — capture, encode, negotiate, transport, decode, render — and explains the specific decisions that separate a demo from a production network serving strangers who have never met.",
    ],
    stats: [
      { label: "Install required", value: "Zero" },
      { label: "Encryption", value: "Mandatory" },
      { label: "Video codecs", value: "VP8 · VP9 · H.264 · AV1" },
      { label: "Audio codec", value: "Opus" },
      { label: "Supported browsers", value: "All modern" },
    ],
    sections: [
      {
        heading: "Capture: getUserMedia and the permission contract",
        body:
          "Everything begins with a permission prompt. The browser, not the site, owns camera and microphone access, and revokes it the moment a tab closes. A production implementation requests explicit constraints — resolution ceiling, frame rate, echo cancellation, noise suppression, auto gain — then adapts downward when the device or network cannot sustain them.",
        bullets: [
          "Constraint negotiation instead of fixed resolutions",
          "Echo cancellation and noise suppression enabled at capture",
          "Facing-mode switching for front and rear mobile cameras",
          "Track-level mute that stops encoding, not just rendering",
        ],
      },
      {
        heading: "Encode: choosing codecs that survive real networks",
        body:
          "Opus handles audio from 6 kbps narrowband up to full-band stereo and adapts continuously. On the video side, VP8 offers universal compatibility, VP9 and AV1 deliver the same quality at lower bitrate, and H.264 benefits from hardware acceleration on many mobile chipsets. The right answer is not one codec but an ordered preference list negotiated per session.",
      },
      {
        heading: "Negotiate: ICE, STUN and the candidate dance",
        body:
          "Each peer gathers candidate addresses: local interfaces, the public address discovered through STUN, and relay addresses if needed. Candidates are exchanged as they arrive rather than in one batch, so connectivity checks start within milliseconds. The first pair to pass a check becomes the active route, and better pairs can promote later.",
        bullets: [
          "Trickle ICE removes seconds from time-to-first-frame",
          "Connectivity checks run in parallel across every pair",
          "ICE restart recovers a session after a network change",
          "Connection state transitions drive the entire user interface",
        ],
      },
      {
        heading: "Observe: statistics that predict a bad call",
        body:
          "The statistics API exposes round-trip time, jitter, packet loss, bitrate, frames dropped and the currently selected candidate pair. Sampling those counters lets the interface warn before quality collapses, drop to audio-only under sustained loss, and record which network conditions correlate with early hang-ups.",
      },
    ],
    clusters: [
      {
        label: "Media capture APIs",
        terms: [
          "getUserMedia",
          "media stream track",
          "device enumeration",
          "capture constraints",
          "facing mode switching",
          "echo cancellation",
          "noise suppression",
          "automatic gain control",
          "frame rate ceiling",
          "resolution downscaling",
          "track replacement",
          "screen capture",
          "permission lifecycle",
        ],
      },
      {
        label: "Codecs and encoding",
        terms: [
          "Opus audio codec",
          "VP8 encoder",
          "VP9 encoder",
          "AV1 real-time profile",
          "H.264 hardware acceleration",
          "codec preference ordering",
          "simulcast layers",
          "scalable video coding",
          "keyframe interval",
          "target bitrate",
          "rate control",
          "encoder complexity",
          "decode pipeline",
        ],
      },
      {
        label: "Connectivity establishment",
        terms: [
          "ICE agent",
          "STUN binding request",
          "TURN allocation",
          "trickle ICE",
          "candidate gathering",
          "connectivity check",
          "nominated pair",
          "ICE restart",
          "connection state change",
          "gathering state",
          "time to first frame",
          "peer connection lifecycle",
          "data channel",
        ],
      },
      {
        label: "Security model",
        terms: [
          "DTLS handshake",
          "SRTP encryption",
          "certificate fingerprint",
          "secure context requirement",
          "origin isolation",
          "permission prompt",
          "ephemeral credentials",
          "no persistent media storage",
          "transport authentication",
          "replay protection",
          "key rotation",
          "browser sandbox",
          "consent signalling",
        ],
      },
      {
        label: "Quality telemetry",
        terms: [
          "RTCStats sampling",
          "round-trip time",
          "jitter measurement",
          "packet loss ratio",
          "frames dropped",
          "freeze duration",
          "bitrate ramp",
          "audio level metering",
          "network type detection",
          "quality limitation reason",
          "mean opinion score proxy",
          "session duration analytics",
          "call success rate",
        ],
      },
    ],
    faq: [
      {
        q: "What is WebRTC in simple terms?",
        a: "WebRTC is a browser standard that lets two web pages exchange live audio, video and data directly, with encryption enabled by default and nothing to install.",
      },
      {
        q: "Which browsers support WebRTC video chat?",
        a: "Every current major browser on desktop and mobile — Chrome, Edge, Safari, Firefox, Opera and their mobile equivalents.",
      },
      {
        q: "Is WebRTC secure enough for private conversations?",
        a: "Yes. The specification forbids unencrypted media: keys are negotiated with DTLS and media is protected with SRTP for every session.",
      },
      {
        q: "Why does a call sometimes start as audio before video appears?",
        a: "Audio needs far less bandwidth, so it usually arrives first. Video ramps up as the encoder discovers how much bandwidth the path can sustain.",
      },
      {
        q: "Does WebRTC reveal my IP address to the other person?",
        a: "Candidate exchange can expose network addresses, which is why a relay path is offered when a direct connection is undesirable or impossible.",
      },
      {
        q: "Can WebRTC work on mobile data?",
        a: "Yes. Codecs and bitrate adapt continuously, so sessions stay usable on constrained mobile networks, dropping to audio-only in the worst conditions.",
      },
    ],
    related: ["global-p2p-video-network", "zero-latency-routing", "mobile-first-realtime-performance"],
  },
  {
    slug: "zero-latency-routing",
    eyebrow: "Latency engineering",
    h1: "Zero-Latency Video Routing: Engineering Conversations That Feel Local",
    title: "Zero-Latency Video Routing Engineering | Caakus",
    description:
      "How sub-200ms routing is achieved across continents: path selection, jitter buffers, congestion control, and the perceptual thresholds that make a conversation feel natural.",
    intro: [
      "Latency is the difference between a conversation and a walkie-talkie exchange. Below roughly 200 milliseconds of mouth-to-ear delay, humans interrupt, laugh and overlap naturally. Above 400 milliseconds, turn-taking collapses and both sides start apologising for talking over each other.",
      "Zero-latency routing is shorthand for a discipline: remove every avoidable millisecond, then manage the unavoidable ones so the remaining delay is stable rather than erratic. Stability matters more than the raw number.",
    ],
    stats: [
      { label: "Conversational target", value: "< 200 ms" },
      { label: "Degradation threshold", value: "> 400 ms" },
      { label: "Jitter target", value: "< 30 ms" },
      { label: "Loss tolerance", value: "~ 2%" },
      { label: "Path hops", value: "1" },
    ],
    sections: [
      {
        heading: "The latency budget, line by line",
        body:
          "Mouth-to-ear delay is a sum: capture and encode on the sender, packetisation, network propagation, jitter buffering, decode and render. Propagation is bound by physics, but every other term is an engineering choice. Shrinking encoder look-ahead, keeping frames small and sizing the jitter buffer adaptively together recover more milliseconds than any routing trick.",
        bullets: [
          "Capture and encode: 10–40 ms depending on resolution and hardware",
          "Network propagation: roughly 1 ms per 100 km of fibre, plus hops",
          "Jitter buffer: adaptive, typically 20–80 ms",
          "Decode and render: 10–30 ms, display refresh included",
        ],
      },
      {
        heading: "Adaptive jitter buffering",
        body:
          "Packets do not arrive evenly. A jitter buffer absorbs that variance, but every millisecond it holds is a millisecond of delay. An adaptive buffer tracks the recent arrival distribution and shrinks aggressively on a stable network, expanding only when variance spikes. Fixed buffers are the single most common cause of unnecessary delay.",
      },
      {
        heading: "Congestion control without oscillation",
        body:
          "Bandwidth estimation watches arrival timing and loss to infer available capacity, then steers the encoder. Good implementations ramp up gradually and back off decisively, because oscillating bitrate looks worse to a human than a steady lower quality. Quality limitation reasons — CPU, bandwidth or both — are exposed so the interface can explain what is happening.",
        bullets: [
          "Delay-based estimation catches congestion before loss appears",
          "Loss-based fallback protects against bufferbloat",
          "Resolution steps down before frame rate, preserving motion",
          "Audio is prioritised absolutely over video under pressure",
        ],
      },
      {
        heading: "Choosing partners with latency in mind",
        body:
          "The cheapest millisecond is the one never travelled. Matchmaking weights geographic and network proximity alongside user preferences, so a long-haul pairing happens when it is genuinely wanted rather than by accident of queue order.",
      },
    ],
    clusters: [
      {
        label: "Latency components",
        terms: [
          "mouth-to-ear delay",
          "glass-to-glass latency",
          "encode latency",
          "packetisation delay",
          "propagation delay",
          "queuing delay",
          "decode latency",
          "render latency",
          "display refresh interval",
          "end-to-end budget",
          "one-way delay",
          "round-trip time",
          "latency variance",
        ],
      },
      {
        label: "Buffering strategy",
        terms: [
          "adaptive jitter buffer",
          "playout delay",
          "buffer underrun",
          "buffer overrun",
          "packet reordering",
          "late packet discard",
          "concealment algorithm",
          "forward error correction",
          "redundant audio encoding",
          "retransmission window",
          "NACK feedback",
          "picture loss indication",
          "keyframe request",
        ],
      },
      {
        label: "Congestion management",
        terms: [
          "bandwidth estimation",
          "delay-based congestion control",
          "loss-based congestion control",
          "transport-wide feedback",
          "pacing queue",
          "bufferbloat mitigation",
          "bitrate ramp-up",
          "resolution step down",
          "frame rate preservation",
          "quality limitation reason",
          "CPU overuse detection",
          "encoder throttling",
          "audio priority",
        ],
      },
      {
        label: "Routing decisions",
        terms: [
          "shortest path routing",
          "regional peering",
          "relay placement",
          "anycast entry point",
          "proximity matching",
          "cross-continent penalty",
          "network distance estimate",
          "path change detection",
          "interface migration",
          "mobile handover",
          "dual stack IPv6",
          "MTU discovery",
          "fragmentation avoidance",
        ],
      },
      {
        label: "Perceptual quality",
        terms: [
          "conversational interactivity",
          "turn-taking threshold",
          "perceived responsiveness",
          "lip sync accuracy",
          "audio video drift",
          "freeze frequency",
          "motion smoothness",
          "artifact visibility",
          "speech intelligibility",
          "session abandonment rate",
          "quality of experience",
          "stability over peak bitrate",
          "first frame time",
        ],
      },
    ],
    faq: [
      {
        q: "What counts as low latency for a video conversation?",
        a: "Under roughly 200 milliseconds mouth-to-ear feels natural. Between 200 and 400 milliseconds is workable, and beyond 400 milliseconds turn-taking noticeably breaks down.",
      },
      {
        q: "Can latency ever be truly zero?",
        a: "No. Light in fibre and encoding time set a floor. Zero-latency means removing every avoidable delay and keeping the remainder stable.",
      },
      {
        q: "Why does video freeze while audio keeps going?",
        a: "Audio is prioritised because speech is the conversation. When bandwidth drops, video bitrate is sacrificed first to keep the voice intelligible.",
      },
      {
        q: "Does distance always mean high latency?",
        a: "Largely yes for propagation, but poor local networks often add more delay than continental distance. A congested home router can outweigh an ocean crossing.",
      },
      {
        q: "Does Wi-Fi or mobile data give lower latency?",
        a: "It depends on conditions. Clean Wi-Fi usually wins, but a congested access point can be worse than a strong modern mobile connection.",
      },
      {
        q: "How can I reduce latency on my side?",
        a: "Move closer to the router, close bandwidth-heavy tabs and downloads, prefer 5 GHz Wi-Fi or a wired connection, and keep the browser updated.",
      },
    ],
    related: ["global-p2p-video-network", "network-resilience-engineering", "webrtc-browser-streaming"],
  },
  {
    slug: "instant-global-matchmaking",
    eyebrow: "Matchmaking systems",
    h1: "Instant Global Matchmaking: Pairing Strangers in Under Two Seconds",
    title: "Instant Global Matchmaking Systems | Caakus",
    description:
      "Inside a real-time matchmaking engine: waiting pools, locking strategies, fairness, repeat-pair suppression and how sub-two-second pairing is sustained at scale.",
    intro: [
      "Matchmaking is the least visible and most decisive part of a live communication network. Everything downstream — media quality, session length, whether someone returns tomorrow — depends on how fast and how well two people are introduced.",
      "This pillar documents the mechanics: how a waiting pool is maintained, how concurrent claims are resolved without double-pairing, and how fairness rules keep a global queue from collapsing into the same handful of pairings.",
    ],
    stats: [
      { label: "Target pairing time", value: "< 2s" },
      { label: "Double-pair rate", value: "0" },
      { label: "Heartbeat interval", value: "Seconds" },
      { label: "Pool scope", value: "Worldwide" },
      { label: "Rematch cooldown", value: "Enforced" },
    ],
    sections: [
      {
        heading: "The waiting pool as a living data structure",
        body:
          "Every person pressing start writes a row into a waiting pool with a timestamp, a region hint and preference flags. The pool is not a simple queue: entries expire without a heartbeat, are filtered by compatibility, and are consumed atomically. Stale entries are the primary cause of 'matched with a ghost' complaints, so expiry is aggressive.",
        bullets: [
          "Heartbeat renewal proves a browser tab is still alive",
          "Automatic expiry removes abandoned entries within seconds",
          "Region hints keep median latency low without hard walls",
          "Preference flags filter before locking, not after",
        ],
      },
      {
        heading: "Atomic claiming without collisions",
        body:
          "When thousands of clients poll simultaneously, naive selection hands the same partner to several people. The fix is database-level: select the candidate row with locking that skips already-claimed rows, write the pairing, and delete both pool entries inside one transaction. Either both people are matched or neither is — there is no intermediate state.",
      },
      {
        heading: "Fairness, novelty and repeat suppression",
        body:
          "A pure first-in-first-out pool degrades quickly: the most active users monopolise the front and the same two people meet repeatedly. Recent pairing history is consulted so a rematch requires a cooldown, while wait time is weighted upward so nobody starves at the back of a global queue.",
        bullets: [
          "Recent-partner memory with a time-based cooldown",
          "Wait-time weighting to prevent queue starvation",
          "Rate limiting on rapid skip loops",
          "Graceful degradation to a wider pool when filters are too narrow",
        ],
      },
      {
        heading: "Skip, rematch and session handoff",
        body:
          "Ending a session must be as fast as starting one. Both peers tear down the media path, publish a leave event and re-enter the pool in a single round trip, so the next conversation begins before attention drifts. Handoff speed is measured as carefully as first-match speed.",
      },
    ],
    clusters: [
      {
        label: "Queue mechanics",
        terms: [
          "waiting pool",
          "matchmaking queue",
          "queue draining",
          "entry expiry",
          "heartbeat renewal",
          "stale entry cleanup",
          "pool partitioning",
          "regional bucketing",
          "preference filtering",
          "queue depth",
          "wait time distribution",
          "starvation prevention",
          "priority weighting",
        ],
      },
      {
        label: "Concurrency control",
        terms: [
          "atomic claim",
          "row level locking",
          "skip locked selection",
          "advisory lock",
          "transactional pairing",
          "double-pair prevention",
          "idempotent match creation",
          "optimistic retry",
          "deadlock avoidance",
          "transaction isolation",
          "race condition handling",
          "consistency guarantee",
          "write amplification",
        ],
      },
      {
        label: "Fairness and novelty",
        terms: [
          "repeat pair suppression",
          "recent partner memory",
          "rematch cooldown",
          "diversity of pairings",
          "skip rate analysis",
          "abuse rate limiting",
          "reputation weighting",
          "fair exposure",
          "cold start handling",
          "new member boost",
          "session variety",
          "pairing entropy",
          "queue equity",
        ],
      },
      {
        label: "Session lifecycle",
        terms: [
          "session creation",
          "room assignment",
          "join acknowledgement",
          "peer readiness signal",
          "session handoff",
          "graceful teardown",
          "leave event",
          "reconnection grace period",
          "session duration",
          "abandonment detection",
          "next match prefetch",
          "cold pool warm-up",
          "session audit trail",
        ],
      },
      {
        label: "Scale and observability",
        terms: [
          "concurrent user capacity",
          "throughput per second",
          "match success rate",
          "p95 pairing latency",
          "queue backlog alerting",
          "load shedding",
          "horizontal scaling",
          "connection pooling",
          "request coalescing",
          "polling interval tuning",
          "realtime subscription",
          "metrics cardinality",
          "capacity planning",
        ],
      },
    ],
    faq: [
      {
        q: "How does instant matchmaking actually work?",
        a: "Your browser joins a waiting pool. The engine selects a compatible, still-active partner, locks that entry so nobody else can claim it, creates a session for both of you and signals each browser to connect.",
      },
      {
        q: "Why am I sometimes matched with the same person again?",
        a: "A cooldown suppresses immediate rematches, but in a thin regional pool at a quiet hour the same partner can legitimately reappear after that window expires.",
      },
      {
        q: "What makes matching slower at certain times?",
        a: "Pool depth. Fewer people waiting in your region means the engine either waits for a compatible partner or widens the search geographically.",
      },
      {
        q: "Can two people be matched with the same partner at once?",
        a: "No. Claims are made with database-level locking inside a transaction, so each waiting entry can be consumed exactly once.",
      },
      {
        q: "What happens if someone closes their tab while waiting?",
        a: "Their entry stops sending heartbeats and expires within seconds, so it is never handed out as a live partner.",
      },
      {
        q: "Does skipping too fast affect my matching?",
        a: "Rapid skip loops are rate limited to protect the pool, which can briefly slow your next match.",
      },
    ],
    related: ["global-p2p-video-network", "virtual-community-engagement", "trust-and-moderation-infrastructure"],
  },
  {
    slug: "seamless-international-communication",
    eyebrow: "Global communication",
    h1: "Seamless International Communication Across Borders and Time Zones",
    title: "Seamless International Communication Network | Caakus",
    description:
      "How a real-time global network dissolves distance: time-zone-aware activity, multilingual conversation, cultural context and the practical mechanics of cross-border talk.",
    intro: [
      "Distance is no longer a technical problem; it is a scheduling and comprehension problem. The network can move a voice across an ocean in under a tenth of a second, but two people still need to be awake at the same time and able to understand each other.",
      "This pillar covers the human layer of international communication — peak-hour overlap, language strategy, cultural register, accessibility — and the platform mechanics that support it.",
    ],
    stats: [
      { label: "Countries reachable", value: "190+" },
      { label: "Interface languages", value: "20+" },
      { label: "Peak overlap windows", value: "24/7" },
      { label: "Time zones served", value: "All" },
      { label: "Entry barrier", value: "A browser" },
    ],
    sections: [
      {
        heading: "Time zones decide who you meet",
        body:
          "A global pool is never uniformly awake. Evening in Western Europe overlaps with afternoon in West Africa and early morning in East Asia. Understanding the overlap map is the difference between a two-minute wait and an instant match, which is why activity indicators reference local peak windows rather than a single server clock.",
        bullets: [
          "Local evening hours produce the densest pools",
          "Weekend afternoons broaden the geographic mix",
          "Late-night hours favour long-haul cross-continent pairings",
          "Public holidays visibly reshape regional activity",
        ],
      },
      {
        heading: "Language as a bridge, not a barrier",
        body:
          "Most cross-border conversations run in a shared second language, and both sides are usually imperfect at it. That is an advantage: mutual imperfection lowers the stakes. Slower speech, short sentences and confirming understanding out loud do more for comprehension than any vocabulary list.",
      },
      {
        heading: "Cultural register and conversational safety",
        body:
          "Directness, humour, silence tolerance and personal-question norms vary widely. A question that signals friendly interest in one culture reads as intrusive in another. The practical rule is to mirror: match the other person's pace, formality and depth before going further.",
        bullets: [
          "Open with context-free topics: place, weather, what you are doing today",
          "Mirror formality rather than assuming informality",
          "Treat silence as thinking time, not failure",
          "Leave politely instead of disconnecting abruptly",
        ],
      },
      {
        heading: "Accessibility of a browser-first network",
        body:
          "Requiring an app store account, a specific operating system or a high-end device excludes entire regions. A browser-first network with adaptive bitrate and an audio-only mode remains usable on older hardware and constrained mobile data, which is precisely where its global reach comes from.",
      },
    ],
    clusters: [
      {
        label: "Cross-border reach",
        terms: [
          "international communication network",
          "cross-border conversation",
          "global connectivity",
          "time zone overlap",
          "peak activity window",
          "regional participation",
          "worldwide availability",
          "geographic diversity",
          "continental coverage",
          "borderless communication",
          "global community access",
          "distributed audience",
          "always-on availability",
        ],
      },
      {
        label: "Multilingual practice",
        terms: [
          "language exchange",
          "conversational fluency",
          "second language practice",
          "listening comprehension",
          "accent exposure",
          "pronunciation feedback",
          "vocabulary in context",
          "speaking confidence",
          "code switching",
          "interface localisation",
          "right-to-left layouts",
          "translation support",
          "multilingual onboarding",
        ],
      },
      {
        label: "Cultural context",
        terms: [
          "cultural register",
          "conversational norms",
          "formality mirroring",
          "silence tolerance",
          "topic sensitivity",
          "intercultural competence",
          "misunderstanding recovery",
          "politeness strategies",
          "humour translation",
          "shared reference building",
          "respectful disengagement",
          "identity privacy",
          "community etiquette",
        ],
      },
      {
        label: "Access and inclusion",
        terms: [
          "browser-first access",
          "no download requirement",
          "low-end device support",
          "constrained bandwidth mode",
          "audio-only fallback",
          "data usage awareness",
          "progressive web app",
          "offline-tolerant interface",
          "keyboard navigation",
          "screen reader labels",
          "contrast compliance",
          "caption friendly layout",
          "reduced motion support",
        ],
      },
      {
        label: "Session experience",
        terms: [
          "first impression window",
          "conversation opener",
          "session length",
          "return visit rate",
          "conversation depth",
          "topic prompts",
          "shared activities",
          "interest signalling",
          "connection continuity",
          "positive exit",
          "report and block clarity",
          "consent before recording",
          "session recap",
        ],
      },
    ],
    faq: [
      {
        q: "What is the best time to meet people from another continent?",
        a: "Look for overlap between your evening and their daytime. Late night in your zone tends to pair you with regions where the working day has just begun.",
      },
      {
        q: "Do I need to speak several languages?",
        a: "No. Most cross-border conversations happen in one shared language spoken imperfectly by both sides, which is normal and rarely a problem.",
      },
      {
        q: "How do I avoid cultural misunderstandings?",
        a: "Mirror the other person's tone and formality, start with neutral topics, and ask before moving to anything personal.",
      },
      {
        q: "Will it work on a slow mobile connection?",
        a: "Yes. Quality adapts downward automatically and the session can continue in audio-only mode when bandwidth is very limited.",
      },
      {
        q: "Is the interface available in my language?",
        a: "The platform ships more than twenty interface languages, including right-to-left layouts.",
      },
      {
        q: "How do I end a conversation politely?",
        a: "Say you are moving on and thank the person. A short goodbye costs two seconds and makes the network better for everyone.",
      },
    ],
    related: ["virtual-community-engagement", "instant-global-matchmaking", "realtime-privacy-and-security"],
  },
  {
    slug: "virtual-community-engagement",
    eyebrow: "Community systems",
    h1: "Virtual Community Engagement: Designing Participation That Lasts",
    title: "Virtual Community Engagement Systems | Caakus",
    description:
      "How engagement is measured and designed in a real-time community: activity indices, streaks, leaderboards, recognition loops and the metrics that actually predict retention.",
    intro: [
      "Engagement is not a vanity number. In a live communication network it is the observable evidence that people find value: how long conversations run, how often participants return, whether they recognise each other's contribution.",
      "This pillar sets out the measurement model behind the Community Activity & Engagement Index and the design loops — recognition, progression, reciprocity — that sustain it without manipulation.",
    ],
    stats: [
      { label: "Core signal", value: "Session depth" },
      { label: "Retention window", value: "7 / 30 days" },
      { label: "Recognition loop", value: "Peer-driven" },
      { label: "Leaderboards", value: "Real data only" },
      { label: "Fake metrics", value: "None" },
    ],
    sections: [
      {
        heading: "What the engagement index measures",
        body:
          "A single index compresses several signals: median conversation length, proportion of sessions exceeding a meaningful threshold, return rate within seven days, and reciprocal recognition between participants. No single component can be gamed into dominance, and each is reported from real records rather than estimated.",
        bullets: [
          "Median session length rather than average, to resist outliers",
          "Share of conversations passing a meaningful-depth threshold",
          "Seven-day and thirty-day return cohorts",
          "Reciprocity: recognition given as well as received",
        ],
      },
      {
        heading: "Progression without pressure",
        body:
          "Levels, streaks and badges work when they describe genuine participation and fail when they manufacture obligation. Streaks that punish a missed day drive anxiety and eventual abandonment; streaks that celebrate accumulated participation and forgive gaps keep people coming back voluntarily.",
      },
      {
        heading: "Leaderboards that tell the truth",
        body:
          "A leaderboard populated with invented names is worse than an empty one: it destroys trust the moment anyone checks. When a regional board has no qualifying participants yet, the honest response is to say so and invite the reader to be first. Every ranking surfaced on this network is drawn from real recorded activity.",
        bullets: [
          "Real records only, including empty states",
          "Clear qualification rules and time windows",
          "Regional and global boards computed identically",
          "No purchased or promoted positions",
        ],
      },
      {
        heading: "Recognition through virtual platform points",
        body:
          "Participants recognise each other with secure virtual platform points — an internal, non-monetary gamified signal used to acknowledge good conversation, completed challenges and consistent presence. Points are ledger-backed for integrity: every movement is recorded, reconciled and auditable inside the platform.",
      },
    ],
    clusters: [
      {
        label: "Engagement measurement",
        terms: [
          "community activity index",
          "engagement scoring",
          "median session length",
          "conversation depth threshold",
          "seven day retention",
          "thirty day cohort",
          "return visit rate",
          "participation rate",
          "reciprocity ratio",
          "active contributor share",
          "churn signal",
          "engagement trendline",
          "metric transparency",
        ],
      },
      {
        label: "Progression design",
        terms: [
          "level system",
          "experience progression",
          "streak mechanics",
          "forgiving streaks",
          "badge taxonomy",
          "milestone recognition",
          "daily objectives",
          "seasonal cycles",
          "achievement clarity",
          "progress visibility",
          "non-coercive incentives",
          "opt-in challenges",
          "burnout avoidance",
        ],
      },
      {
        label: "Recognition economy",
        terms: [
          "virtual platform points",
          "points ledger",
          "atomic point transfer",
          "double-entry accounting",
          "balance reconciliation",
          "gift acknowledgement",
          "peer recognition",
          "contribution signalling",
          "anti-inflation controls",
          "audit trail",
          "transaction integrity",
          "optimistic balance update",
          "rollback on failure",
        ],
      },
      {
        label: "Social graph dynamics",
        terms: [
          "weak tie formation",
          "repeat interaction",
          "community density",
          "regional cluster",
          "interest affinity",
          "conversation topics",
          "shared activity",
          "reputation signal",
          "newcomer onboarding",
          "veteran mentorship",
          "community norms",
          "positive feedback loop",
          "network effect",
        ],
      },
      {
        label: "Integrity and trust",
        terms: [
          "authentic leaderboard",
          "honest empty state",
          "no fabricated data",
          "verifiable statistics",
          "qualification rules",
          "anti-gaming controls",
          "rate limited actions",
          "duplicate account detection",
          "transparent methodology",
          "data freshness",
          "reporting cadence",
          "privacy preserving analytics",
          "aggregate reporting",
        ],
      },
    ],
    faq: [
      {
        q: "What is the Community Activity & Engagement Index?",
        a: "It is a composite measure of real participation: median conversation length, the share of meaningful-depth sessions, return rates and reciprocal recognition between members.",
      },
      {
        q: "Are the leaderboards real?",
        a: "Yes. Rankings come from recorded activity only. When a board has no qualifying participants, it is shown as empty instead of being filled with invented entries.",
      },
      {
        q: "What are virtual platform points?",
        a: "They are an internal gamified recognition signal used to acknowledge good conversations, completed challenges and consistent participation inside the platform.",
      },
      {
        q: "Do streaks punish me for missing a day?",
        a: "No. Progression is designed to celebrate accumulated participation rather than to create obligation.",
      },
      {
        q: "Can engagement metrics be gamed?",
        a: "Each component is rate limited and cross-checked, and no single signal can dominate the index, which makes systematic gaming impractical.",
      },
      {
        q: "How is my activity data handled?",
        a: "Engagement reporting is aggregate. Individual conversation content is never stored or analysed for these metrics.",
      },
    ],
    related: ["points-recognition-architecture", "trust-and-moderation-infrastructure", "instant-global-matchmaking"],
  },
  {
    slug: "realtime-privacy-and-security",
    eyebrow: "Security architecture",
    h1: "Real-Time Privacy and Security in Browser-Based Communication",
    title: "Real-Time Communication Privacy & Security | Caakus",
    description:
      "Encryption, permissions, data minimisation and threat modelling for browser-based live communication — what is protected, how, and what users should verify themselves.",
    intro: [
      "Live communication has a distinctive security profile: the sensitive asset is ephemeral, the attack surface includes the device itself, and the user's trust decision happens in two seconds at the permission prompt.",
      "This pillar sets out the security model in plain terms — what encryption guarantees, what it does not, where data is minimised, and which controls remain in the participant's hands.",
    ],
    stats: [
      { label: "Media encryption", value: "DTLS-SRTP" },
      { label: "Transport", value: "HTTPS / WSS" },
      { label: "Stored media", value: "None" },
      { label: "Permission owner", value: "Your browser" },
      { label: "Minimum age", value: "18+" },
    ],
    sections: [
      {
        heading: "What encryption actually guarantees",
        body:
          "Browser media channels are encrypted by specification: keys are negotiated over DTLS and every packet is protected with SRTP. A relay that forwards a stream handles ciphertext only. What encryption does not protect against is the other participant — anyone in a conversation can record their own screen, which is a social risk, not a cryptographic one.",
        bullets: [
          "Media encrypted in transit on every session, without exception",
          "Signalling carried over authenticated secure websockets",
          "Relay servers forward opaque ciphertext",
          "Encryption cannot prevent the other side from recording",
        ],
      },
      {
        heading: "Data minimisation by design",
        body:
          "The strongest privacy control is not collecting data. Conversations are not recorded or stored. Operational records keep what is needed for safety and reliability — session timing, moderation events, aggregate quality metrics — and nothing that reconstructs what was said.",
      },
      {
        heading: "Permissions stay with the browser",
        body:
          "Camera and microphone access is granted by the browser, scoped to an origin, and revocable at any moment from the address bar or system settings. Closing the tab ends access immediately. A site cannot silently re-enable a device, and an active capture indicator is displayed by the browser itself.",
        bullets: [
          "Per-origin permission, revocable at any time",
          "Browser-level capture indicator outside the page's control",
          "Track-level mute stops encoding at the source",
          "Secure context required: no camera access over plain HTTP",
        ],
      },
      {
        heading: "Threat model and practical hygiene",
        body:
          "Realistic risks are social far more often than technical: oversharing personal details, screen recording by a partner, or links sent during a session. Sensible hygiene is to keep identifying details out of early conversations, never follow unsolicited links, and use the report control immediately when something feels wrong.",
      },
    ],
    clusters: [
      {
        label: "Cryptographic protection",
        terms: [
          "DTLS key exchange",
          "SRTP media encryption",
          "certificate fingerprint verification",
          "perfect forward secrecy",
          "cipher suite negotiation",
          "replay protection",
          "authenticated encryption",
          "secure websocket transport",
          "TLS termination",
          "HSTS policy",
          "secure context requirement",
          "key lifetime",
          "ephemeral credentials",
        ],
      },
      {
        label: "Data governance",
        terms: [
          "data minimisation",
          "no media retention",
          "purpose limitation",
          "retention schedule",
          "aggregate analytics",
          "pseudonymous identifiers",
          "access control policy",
          "row level security",
          "least privilege",
          "audit logging",
          "deletion request handling",
          "regional data handling",
          "third party disclosure limits",
        ],
      },
      {
        label: "Device permissions",
        terms: [
          "camera permission",
          "microphone permission",
          "permission revocation",
          "capture indicator",
          "origin scoping",
          "device enumeration privacy",
          "track mute",
          "autoplay policy",
          "screen share consent",
          "notification permission",
          "storage partitioning",
          "browser sandbox",
          "tab lifecycle",
        ],
      },
      {
        label: "Abuse resistance",
        terms: [
          "rate limiting",
          "bot detection",
          "duplicate account signals",
          "report workflow",
          "block list",
          "temporary suspension",
          "ban enforcement",
          "evidence retention for safety",
          "automated content screening",
          "human review queue",
          "appeal process",
          "age assurance",
          "minor protection policy",
        ],
      },
      {
        label: "User-side hygiene",
        terms: [
          "identity minimisation",
          "avoid sharing contact details",
          "link caution",
          "background privacy",
          "virtual background",
          "device updates",
          "browser updates",
          "public Wi-Fi caution",
          "session awareness",
          "recording consent",
          "safe exit",
          "reporting promptly",
          "trusted device use",
        ],
      },
    ],
    faq: [
      {
        q: "Are video conversations encrypted?",
        a: "Yes. Browser media is encrypted with DTLS-SRTP on every session; relay servers can only forward ciphertext they cannot read.",
      },
      {
        q: "Are conversations recorded or stored?",
        a: "No. Conversation media is not recorded or retained. Only operational records needed for safety and reliability are kept.",
      },
      {
        q: "Can the other person record me?",
        a: "Any participant can record their own screen with external tools. Encryption cannot prevent that, so share only what you would be comfortable seeing again.",
      },
      {
        q: "How do I revoke camera access?",
        a: "Use the permission control in your browser's address bar or your system privacy settings. Closing the tab also ends access immediately.",
      },
      {
        q: "Is my IP address visible to the other participant?",
        a: "Direct connections involve network address exchange. When that is not acceptable, a relayed path keeps the direct address from being used.",
      },
      {
        q: "What should I do if someone behaves inappropriately?",
        a: "Leave the session and use the report control straight away. Reports feed a review queue with enforcement actions.",
      },
    ],
    related: ["trust-and-moderation-infrastructure", "webrtc-browser-streaming", "global-p2p-video-network"],
  },
  {
    slug: "mobile-first-realtime-performance",
    eyebrow: "Client performance",
    h1: "Mobile-First Real-Time Performance: Fast, Stable, Battery-Aware",
    title: "Mobile-First Real-Time Video Performance | Caakus",
    description:
      "Rendering, thermal management, battery cost, touch ergonomics and network switching — the engineering behind smooth live video on mid-range phones.",
    intro: [
      "Most live conversations happen on a phone held in one hand, on a mid-range chipset, over a network that changes as the person walks. Designing for a desktop with a fast connection and porting downward produces a product that works for a minority of its users.",
      "This pillar covers mobile-first performance end to end: layout stability, thermal and battery behaviour, network handover and the touch ergonomics that make controls reachable during a call.",
    ],
    stats: [
      { label: "Primary target", value: "Mid-range mobile" },
      { label: "Touch target minimum", value: "48 × 48 px" },
      { label: "Layout shift budget", value: "~0" },
      { label: "Horizontal overflow", value: "None" },
      { label: "Install required", value: "None" },
    ],
    sections: [
      {
        heading: "Rendering a live call without jank",
        body:
          "A video element under constant repaint competes with every animation on the page. Keeping the call surface on its own compositing layer, avoiding layout-triggering properties in animations and limiting blur effects around moving video preserve frame rate on modest GPUs far more than micro-optimising JavaScript.",
        bullets: [
          "Transform and opacity animations only near the video surface",
          "Fixed, reserved dimensions to eliminate layout shift",
          "Backdrop blur used sparingly on mobile",
          "Off-screen elements unmounted rather than hidden",
        ],
      },
      {
        heading: "Thermals, battery and honest quality trade-offs",
        body:
          "Sustained encoding warms a phone; a warm phone is throttled; a throttled phone drops frames. Hardware-accelerated codecs, a sensible resolution ceiling and a one-tap audio-only mode do more for a long conversation than maximum sharpness for the first three minutes.",
      },
      {
        heading: "Networks that change mid-sentence",
        body:
          "Walking out of Wi-Fi range changes the local interface and invalidates the negotiated path. Detecting the change and restarting connectivity checks immediately recovers the session in a second or two instead of dropping it; the interface should say 'reconnecting' rather than failing silently.",
        bullets: [
          "Interface change detection triggers immediate ICE restart",
          "Short reconnection grace period before ending a session",
          "Explicit reconnecting state in the interface",
          "Bitrate re-ramps conservatively after recovery",
        ],
      },
      {
        heading: "Ergonomics of one-handed control",
        body:
          "Controls used during a call belong within thumb reach and must be large enough to hit without looking. Destructive actions need separation from frequent ones, and no row of controls may ever overflow horizontally on a small screen — an unreachable button is a broken feature.",
      },
    ],
    clusters: [
      {
        label: "Rendering performance",
        terms: [
          "compositing layer",
          "repaint cost",
          "layout thrashing",
          "cumulative layout shift",
          "frame budget",
          "GPU acceleration",
          "transform animation",
          "backdrop filter cost",
          "virtualised lists",
          "image decoding",
          "lazy mounting",
          "hydration cost",
          "time to interactive",
        ],
      },
      {
        label: "Device constraints",
        terms: [
          "thermal throttling",
          "battery consumption",
          "hardware encoder",
          "hardware decoder",
          "CPU overuse detection",
          "resolution ceiling",
          "frame rate cap",
          "memory pressure",
          "background tab suspension",
          "low power mode",
          "mid-range chipset",
          "older device support",
          "audio-only mode",
        ],
      },
      {
        label: "Network adaptation",
        terms: [
          "Wi-Fi to cellular handover",
          "interface change detection",
          "ICE restart",
          "reconnection grace period",
          "bitrate re-ramp",
          "data saver mode",
          "metered connection awareness",
          "packet loss spikes",
          "signal degradation",
          "roaming behaviour",
          "captive portal detection",
          "offline state handling",
          "retry with backoff",
        ],
      },
      {
        label: "Touch ergonomics",
        terms: [
          "thumb zone",
          "48 pixel touch target",
          "control spacing",
          "destructive action separation",
          "safe area insets",
          "dynamic viewport units",
          "no horizontal overflow",
          "bottom action bar",
          "gesture conflicts",
          "haptic feedback",
          "one-handed use",
          "landscape handling",
          "keyboard avoidance",
        ],
      },
      {
        label: "Perceived speed",
        terms: [
          "skeleton states",
          "optimistic updates",
          "instant feedback",
          "progressive rendering",
          "preconnect hints",
          "critical CSS",
          "code splitting",
          "route prefetching",
          "cache strategy",
          "first contentful paint",
          "largest contentful paint",
          "interaction to next paint",
          "loading state honesty",
        ],
      },
    ],
    faq: [
      {
        q: "Does live video drain my battery quickly?",
        a: "Continuous camera capture and encoding are power-intensive. Hardware-accelerated codecs, a resolution ceiling and audio-only mode significantly extend a session.",
      },
      {
        q: "Why does my phone get warm during long calls?",
        a: "Sustained encoding generates heat. When the device throttles, the platform lowers resolution before frame rate to keep motion smooth.",
      },
      {
        q: "What happens when I walk out of Wi-Fi range?",
        a: "The network interface changes, connectivity checks restart automatically and the session usually recovers within a couple of seconds.",
      },
      {
        q: "Do I need to install an app?",
        a: "No. Everything runs in the mobile browser, and the site can be added to your home screen as a progressive web app.",
      },
      {
        q: "Does it work on older phones?",
        a: "Yes. Capture constraints and bitrate adapt to the device, and audio-only mode keeps very limited hardware usable.",
      },
      {
        q: "How much mobile data does a video conversation use?",
        a: "It varies with quality, typically a few hundred megabytes per hour at moderate settings and far less in audio-only mode.",
      },
    ],
    related: ["zero-latency-routing", "network-resilience-engineering", "webrtc-browser-streaming"],
  },
  {
    slug: "points-recognition-architecture",
    eyebrow: "Platform economy",
    h1: "Secure Virtual Platform Points: Ledger Architecture for Recognition",
    title: "Virtual Platform Points Ledger Architecture | Caakus",
    description:
      "How an internal recognition point system is engineered for integrity: atomic transfers, double-entry ledgers, idempotency, reconciliation and anti-abuse controls.",
    intro: [
      "Recognition needs a unit. Inside Caakus that unit is a secure virtual platform point — an internal, non-monetary signal used to acknowledge good conversation, completed challenges and consistent participation. It is a gamified engagement mechanic, not an external instrument.",
      "Because participants care about their balance, the system is engineered to accounting standards: every movement is a ledger entry, every transfer is atomic, and every balance is reconstructable from history.",
    ],
    stats: [
      { label: "Ledger model", value: "Append-only" },
      { label: "Transfer", value: "Atomic" },
      { label: "Balance source", value: "Derived" },
      { label: "Duplicate protection", value: "Idempotency keys" },
      { label: "Nature", value: "Internal, non-monetary" },
    ],
    sections: [
      {
        heading: "Append-only ledger, derived balances",
        body:
          "A balance stored as a mutable number is a bug waiting to happen. The ledger records immutable entries — source, destination, amount, reason, timestamp, correlation id — and balances are derived and cached from them. Any discrepancy can be investigated because the full history is intact.",
        bullets: [
          "Immutable entries with an explicit reason code",
          "Correlation identifiers linking an action to its entries",
          "Derived balances with periodic reconciliation",
          "Stable per-member identifiers for traceability",
        ],
      },
      {
        heading: "Atomic transfers under concurrency",
        body:
          "A transfer debits one account and credits another. Executed as two separate writes, a failure between them creates or destroys points. The transfer therefore runs inside a single server-side transaction with an ordered lock on both accounts, so it either completes fully or does not happen at all.",
      },
      {
        heading: "Idempotency and retries",
        body:
          "Mobile networks drop responses, and users tap twice. Every transfer carries a client-generated key; a repeat of the same key returns the original result instead of executing again. This turns an unreliable network into a safe one without asking the user to guess whether the action worked.",
        bullets: [
          "Client-generated idempotency key per action",
          "Server returns the original result on replay",
          "Optimistic interface update with rollback on failure",
          "Clear error states rather than silent inconsistency",
        ],
      },
      {
        heading: "Anti-abuse and integrity controls",
        body:
          "Point systems attract farming. Rate limits, per-day caps, duplicate-account signals and review of statistical outliers keep issuance aligned with genuine participation. Controls are enforced server-side and never in the browser, where anything can be edited.",
      },
    ],
    clusters: [
      {
        label: "Ledger design",
        terms: [
          "append-only ledger",
          "double-entry accounting",
          "immutable entries",
          "derived balance",
          "balance snapshot",
          "reason codes",
          "correlation identifier",
          "reconciliation job",
          "audit trail",
          "historical replay",
          "entry ordering",
          "monotonic sequence",
          "ledger integrity check",
        ],
      },
      {
        label: "Transaction safety",
        terms: [
          "atomic transfer",
          "database transaction",
          "ordered locking",
          "deadlock avoidance",
          "security definer function",
          "server-side validation",
          "constraint enforcement",
          "negative balance prevention",
          "isolation level",
          "rollback semantics",
          "partial failure handling",
          "consistency guarantee",
          "write durability",
        ],
      },
      {
        label: "Client reliability",
        terms: [
          "idempotency key",
          "replay safe endpoint",
          "optimistic update",
          "rollback on error",
          "retry with backoff",
          "duplicate tap protection",
          "offline queueing",
          "state reconciliation",
          "polling interval",
          "realtime balance subscription",
          "stale data detection",
          "error surfacing",
          "loading state clarity",
        ],
      },
      {
        label: "Issuance policy",
        terms: [
          "earn events",
          "daily caps",
          "diminishing returns",
          "streak bonuses",
          "challenge rewards",
          "gift acknowledgement",
          "referral credit",
          "issuance budget",
          "inflation control",
          "sink mechanics",
          "spend destinations",
          "seasonal adjustments",
          "policy transparency",
        ],
      },
      {
        label: "Abuse prevention",
        terms: [
          "farming detection",
          "rate limiting",
          "duplicate account signals",
          "device fingerprint heuristics",
          "outlier review",
          "velocity checks",
          "self-transfer prevention",
          "collusion detection",
          "server-side enforcement",
          "manual review queue",
          "reversal procedure",
          "sanction ladder",
          "policy appeals",
        ],
      },
    ],
    faq: [
      {
        q: "What are secure virtual platform points?",
        a: "They are an internal, non-monetary recognition unit used inside the platform to acknowledge conversations, challenges and consistent participation.",
      },
      {
        q: "How is a point balance kept accurate?",
        a: "Balances are derived from an append-only ledger of immutable entries and reconciled periodically, so any discrepancy can be traced through history.",
      },
      {
        q: "What stops points from being duplicated by a double tap?",
        a: "Each transfer carries an idempotency key. Replaying the same key returns the original result instead of executing a second transfer.",
      },
      {
        q: "Can a transfer fail halfway?",
        a: "No. Debit and credit happen inside a single transaction with ordered locking, so a transfer either completes fully or not at all.",
      },
      {
        q: "Why does my balance update instantly and then correct itself?",
        a: "The interface applies an optimistic update for responsiveness and rolls it back if the server rejects the action.",
      },
      {
        q: "How is point farming prevented?",
        a: "Rate limits, daily caps, velocity checks and outlier review are enforced server-side, where the browser cannot influence them.",
      },
    ],
    related: ["virtual-community-engagement", "trust-and-moderation-infrastructure", "realtime-data-infrastructure"],
  },
  {
    slug: "trust-and-moderation-infrastructure",
    eyebrow: "Safety systems",
    h1: "Trust and Moderation Infrastructure for Live Conversations",
    title: "Live Video Trust & Moderation Infrastructure | Caakus",
    description:
      "Real-time safety engineering: on-device screening, reporting pipelines, enforcement ladders, appeals and the metrics that show whether moderation actually works.",
    intro: [
      "Moderating live conversation is harder than moderating posts. There is no queue of finished artefacts to review — the content exists for a second and is gone, so protection must act in real time or not at all.",
      "This pillar describes the layered approach: prevention before a session, on-device screening during it, fast reporting after it, and an enforcement ladder with a genuine appeals path.",
    ],
    stats: [
      { label: "Screening", value: "On-device" },
      { label: "Report to queue", value: "Immediate" },
      { label: "Minimum age", value: "18+" },
      { label: "Enforcement", value: "Laddered" },
      { label: "Appeals", value: "Available" },
    ],
    sections: [
      {
        heading: "Prevention before the session starts",
        body:
          "The cheapest moderation happens before two people meet: age gating, account friction that slows mass account creation, rate limits on rapid rejoining, and clear community rules shown at the point of entry rather than buried in a policy page.",
        bullets: [
          "Explicit 18+ gate with a clear statement of rules",
          "Friction that discourages disposable accounts",
          "Rate limits on rejoin and skip loops",
          "Prior sanctions consulted before pool entry",
        ],
      },
      {
        heading: "On-device screening during a call",
        body:
          "Screening models run in the participant's own browser, so frames are analysed locally and never uploaded for classification. When a model flags a frame with high confidence, the interface can blur, warn or end the session immediately — protection that costs nothing in privacy.",
      },
      {
        heading: "Reporting that takes one tap",
        body:
          "A report control must be visible during the call, not buried in a menu afterwards. Reports capture session metadata — participants, timestamp, reason — without recording content, and land in a review queue with enough context for a human decision.",
        bullets: [
          "Report control visible throughout the session",
          "Reason categories that map to enforcement policy",
          "Immediate block of the reported participant",
          "Metadata only: no conversation recording",
        ],
      },
      {
        heading: "Enforcement ladder and appeals",
        body:
          "Proportionality matters. A first low-severity report warrants a warning; repeated or severe reports escalate to temporary suspension and then permanent removal. Every action is recorded with its reason and expiry, and every sanctioned member can request review. Moderation without appeal breeds resentment and gaming.",
      },
    ],
    clusters: [
      {
        label: "Preventive controls",
        terms: [
          "age gating",
          "account friction",
          "disposable account detection",
          "rejoin rate limiting",
          "community rules visibility",
          "onboarding consent",
          "sanction history check",
          "risk scoring",
          "geographic policy rules",
          "device reputation",
          "session entry validation",
          "bot mitigation",
          "verification signals",
        ],
      },
      {
        label: "Real-time screening",
        terms: [
          "on-device classification",
          "frame sampling",
          "confidence threshold",
          "automatic blur",
          "session interruption",
          "false positive tuning",
          "model size constraints",
          "inference latency",
          "privacy preserving analysis",
          "no frame upload",
          "audio anomaly signals",
          "escalation trigger",
          "graceful warning",
        ],
      },
      {
        label: "Reporting pipeline",
        terms: [
          "one-tap report",
          "reason taxonomy",
          "report metadata",
          "immediate block",
          "moderation queue",
          "triage priority",
          "duplicate report clustering",
          "reviewer tooling",
          "decision latency",
          "case notes",
          "evidence minimisation",
          "reporter feedback",
          "abuse of reporting",
        ],
      },
      {
        label: "Enforcement",
        terms: [
          "warning notice",
          "temporary suspension",
          "ban duration",
          "permanent removal",
          "sanction ladder",
          "proportionality",
          "recidivism tracking",
          "expiry handling",
          "reinstatement",
          "appeal workflow",
          "decision transparency",
          "policy documentation",
          "enforcement audit",
        ],
      },
      {
        label: "Safety outcomes",
        terms: [
          "report rate per thousand sessions",
          "time to action",
          "repeat offender share",
          "false positive rate",
          "user perceived safety",
          "session abandonment after incident",
          "trust survey signal",
          "protection coverage",
          "escalation accuracy",
          "moderation throughput",
          "queue backlog",
          "policy iteration",
          "transparency reporting",
        ],
      },
    ],
    faq: [
      {
        q: "How is a live video conversation moderated in real time?",
        a: "Screening models run locally in the browser and can blur or end a session instantly, while reporting sends metadata to a human review queue for enforcement.",
      },
      {
        q: "Are my video frames uploaded for moderation?",
        a: "No. Classification runs on your own device; frames are analysed locally and are not sent anywhere for screening.",
      },
      {
        q: "What happens after I report someone?",
        a: "That participant is blocked for you immediately and the report enters a review queue where an enforcement decision is made.",
      },
      {
        q: "How long do bans last?",
        a: "Sanctions are proportional, typically starting at a short suspension and escalating with repeated or severe violations.",
      },
      {
        q: "Can a moderation decision be appealed?",
        a: "Yes. Every sanction is recorded with its reason and can be reviewed on request.",
      },
      {
        q: "What is the minimum age to participate?",
        a: "The platform is restricted to adults aged 18 and over.",
      },
    ],
    related: ["realtime-privacy-and-security", "virtual-community-engagement", "instant-global-matchmaking"],
  },
  {
    slug: "network-resilience-engineering",
    eyebrow: "Resilience",
    h1: "Network Resilience Engineering for Always-On Global Conversations",
    title: "Network Resilience Engineering for Live Video | Caakus",
    description:
      "Failure modes, fallbacks, observability and capacity planning for a worldwide real-time communication network that must degrade gracefully instead of breaking.",
    intro: [
      "A global real-time network fails constantly in small ways: a candidate pair dies, a relay region saturates, a mobile handover drops packets for 800 milliseconds. Resilience is not the absence of failure; it is the discipline of making failure invisible to the conversation.",
      "This pillar catalogues the failure modes of live communication and the specific fallbacks, budgets and instrumentation that keep sessions alive through them.",
    ],
    stats: [
      { label: "Design posture", value: "Degrade, never drop" },
      { label: "Fallback path", value: "Encrypted relay" },
      { label: "Worst-case mode", value: "Audio only" },
      { label: "Recovery target", value: "Seconds" },
      { label: "Blind spots", value: "Instrumented" },
    ],
    sections: [
      {
        heading: "Cataloguing the failure modes",
        body:
          "Resilience starts with an honest list: NAT traversal failures, relay exhaustion, signalling disconnects, interface migration, sudden bandwidth collapse, CPU starvation on the device, and clock or session desynchronisation. Each has a distinct signature in telemetry and deserves a distinct response rather than a generic error.",
        bullets: [
          "Connectivity failure: fall back to relay and restart checks",
          "Bandwidth collapse: step resolution down, then disable video",
          "Signalling disconnect: resubscribe with exponential backoff",
          "Device overload: reduce encode settings before dropping frames",
        ],
      },
      {
        heading: "Degradation ladders instead of binary states",
        body:
          "Users tolerate reduced quality far better than a dropped call. A ladder — full quality, reduced resolution, reduced frame rate, audio only, reconnecting, ended — gives the system four intermediate states before failure, and gives the interface something honest to display at each rung.",
      },
      {
        heading: "Observability that predicts rather than reports",
        body:
          "Post-mortem dashboards explain yesterday. Useful instrumentation measures leading indicators: relay ratio, connectivity-check success, p95 time-to-first-frame, and early-abandon rate by region. A rising relay ratio in one country precedes user complaints by hours.",
        bullets: [
          "Leading indicators tracked per region, not globally averaged",
          "Synthetic probes that connect on a schedule",
          "Alerting on ratios and percentiles, not raw counts",
          "Structured events that tie a session to its failure cause",
        ],
      },
      {
        heading: "Capacity, rate limits and graceful load shedding",
        body:
          "Signalling and matchmaking are the saturation points, not media, since media does not touch the servers. Polling intervals, per-client rate limits and coalesced requests protect the control plane; when it saturates anyway, shedding new queue entries protects the conversations already running.",
      },
    ],
    clusters: [
      {
        label: "Failure taxonomy",
        terms: [
          "NAT traversal failure",
          "relay exhaustion",
          "signalling disconnect",
          "interface migration",
          "bandwidth collapse",
          "CPU starvation",
          "clock drift",
          "session desynchronisation",
          "one-way audio",
          "black video frame",
          "stalled negotiation",
          "zombie session",
          "partial outage",
        ],
      },
      {
        label: "Fallback strategy",
        terms: [
          "encrypted relay fallback",
          "ICE restart",
          "resolution step down",
          "frame rate reduction",
          "audio-only mode",
          "reconnection window",
          "exponential backoff",
          "circuit breaker",
          "queue re-entry",
          "session resumption",
          "graceful teardown",
          "degradation ladder",
          "honest error states",
        ],
      },
      {
        label: "Observability",
        terms: [
          "leading indicators",
          "relay ratio",
          "connectivity success rate",
          "p95 time to first frame",
          "early abandon rate",
          "regional health dashboard",
          "synthetic probes",
          "structured event logging",
          "trace correlation",
          "percentile alerting",
          "anomaly detection",
          "error budget",
          "incident timeline",
        ],
      },
      {
        label: "Capacity planning",
        terms: [
          "control plane saturation",
          "signalling throughput",
          "connection pooling",
          "request coalescing",
          "polling interval tuning",
          "per-client rate limits",
          "load shedding",
          "surge headroom",
          "regional capacity",
          "relay bandwidth budget",
          "autoscaling policy",
          "cost per session",
          "peak hour forecasting",
        ],
      },
      {
        label: "Operational discipline",
        terms: [
          "runbooks",
          "on-call rotation",
          "blameless post-mortem",
          "change management",
          "progressive rollout",
          "feature flags",
          "rollback readiness",
          "chaos testing",
          "dependency isolation",
          "third party failure handling",
          "status communication",
          "recovery drills",
          "resilience review",
        ],
      },
    ],
    faq: [
      {
        q: "What happens when a direct connection cannot be established?",
        a: "The session falls back to an encrypted relay server automatically. Media stays encrypted end to end; only the path changes.",
      },
      {
        q: "Why did my video stop while audio continued?",
        a: "That is a deliberate rung on the degradation ladder: under bandwidth or CPU pressure, video is sacrificed to keep speech intelligible.",
      },
      {
        q: "How quickly does a session recover after a network change?",
        a: "Connectivity checks restart immediately on interface change, and recovery typically completes within a couple of seconds.",
      },
      {
        q: "Does heavy platform load slow media quality?",
        a: "Media travels peer to peer and does not pass through the servers, so load affects matchmaking speed rather than call quality.",
      },
      {
        q: "What is a relay ratio and why does it matter?",
        a: "It is the share of sessions that need a relay instead of a direct path. A rising ratio in a region is an early warning of connectivity problems there.",
      },
      {
        q: "Is a dropped call always a platform problem?",
        a: "Often it is a local network event — a handover, a congested access point, or a device going to sleep. Telemetry distinguishes the two.",
      },
    ],
    related: ["zero-latency-routing", "realtime-data-infrastructure", "global-p2p-video-network"],
  },
  {
    slug: "realtime-data-infrastructure",
    eyebrow: "Backend systems",
    h1: "Real-Time Data Infrastructure Behind a Live Communication Network",
    title: "Real-Time Data Infrastructure for Live Platforms | Caakus",
    description:
      "Presence, broadcast channels, row-level security, subscriptions and consistency patterns — the backend data layer that keeps a live global network coherent.",
    intro: [
      "Media travels peer to peer, but everything else — who is online, who is waiting, who is banned, what a balance is — lives in a database that must answer in milliseconds and stay correct under concurrent writes from every continent.",
      "This pillar documents the data layer: presence and broadcast primitives, subscription design, security enforced at the row, and the consistency patterns that keep a live interface honest.",
    ],
    stats: [
      { label: "Presence", value: "Realtime channels" },
      { label: "Security", value: "Row-level" },
      { label: "Consistency", value: "Transactional" },
      { label: "Client reads", value: "Subscription-first" },
      { label: "Server logic", value: "Typed functions" },
    ],
    sections: [
      {
        heading: "Presence and broadcast primitives",
        body:
          "Two primitives cover most live coordination. Presence answers 'who is here right now' with automatic cleanup when a client disappears. Broadcast delivers transient messages — an offer, a candidate, a consent request — that nobody needs to persist. Using persistence for transient data is the most common cause of a slow control plane.",
        bullets: [
          "Presence for membership, with automatic expiry",
          "Broadcast for ephemeral signalling payloads",
          "Persistence reserved for state that must survive a refresh",
          "Channel naming scoped per session to limit fan-out",
        ],
      },
      {
        heading: "Row-level security as the real access layer",
        body:
          "Client-side checks are suggestions. Access control belongs on the rows: a member reads their own records, moderators read what policy allows, and privileged operations run through server functions that verify a role before touching anything. A table without policies is inaccessible by default, which is the correct failure direction.",
      },
      {
        heading: "Subscriptions, polling and the cost of freshness",
        body:
          "Not every value deserves a live subscription. Balances, queues and presence justify realtime; historical lists do not. Where polling is used, the interval is chosen against the rate limit budget, because a two-per-second poll from every client saturates a control plane long before the database notices.",
        bullets: [
          "Subscriptions for values that change during a session",
          "Polling intervals sized against rate limits",
          "Request coalescing and shared caches across components",
          "Stale-while-revalidate instead of blocking spinners",
        ],
      },
      {
        heading: "Consistency patterns that survive concurrency",
        body:
          "Queue draining, point transfers and moderation actions all mutate shared state from many clients at once. Transactions with appropriate locking, idempotency keys on client-initiated writes, and derived rather than mutable aggregates keep the system correct without serialising everything into a bottleneck.",
      },
    ],
    clusters: [
      {
        label: "Realtime primitives",
        terms: [
          "presence channel",
          "broadcast channel",
          "subscription lifecycle",
          "channel scoping",
          "fan-out control",
          "automatic presence cleanup",
          "ephemeral messaging",
          "event ordering",
          "at-least-once delivery",
          "message size limits",
          "reconnect and resubscribe",
          "backpressure handling",
          "heartbeat protocol",
        ],
      },
      {
        label: "Access control",
        terms: [
          "row level security",
          "policy per operation",
          "role separation",
          "security definer function",
          "least privilege grants",
          "service role isolation",
          "authenticated role scope",
          "anonymous read policy",
          "privilege escalation prevention",
          "role table separation",
          "server-side authorisation",
          "token verification",
          "session claims",
        ],
      },
      {
        label: "Query and cache strategy",
        terms: [
          "query key design",
          "stale while revalidate",
          "cache invalidation",
          "request coalescing",
          "pagination strategy",
          "index coverage",
          "selective columns",
          "aggregate precomputation",
          "materialised views",
          "hot path optimisation",
          "slow query analysis",
          "connection pooling",
          "read amplification",
        ],
      },
      {
        label: "Write consistency",
        terms: [
          "transactional writes",
          "row locking",
          "skip locked draining",
          "advisory locks",
          "idempotency keys",
          "optimistic concurrency",
          "conflict resolution",
          "derived aggregates",
          "append-only history",
          "soft deletes",
          "migration safety",
          "backfill strategy",
          "schema versioning",
        ],
      },
      {
        label: "Operational data",
        terms: [
          "structured event logging",
          "analytics events",
          "retention policy",
          "aggregate reporting",
          "privacy preserving metrics",
          "cardinality control",
          "scheduled jobs",
          "cron maintenance",
          "cleanup of stale rows",
          "backup and restore",
          "disaster recovery",
          "capacity monitoring",
          "cost observability",
        ],
      },
    ],
    faq: [
      {
        q: "Why do live platforms use presence channels instead of database polling?",
        a: "Presence tracks who is connected with automatic cleanup and near-instant updates, while polling is slower, heavier and prone to stale entries.",
      },
      {
        q: "What is row-level security?",
        a: "It is access control enforced by the database on individual rows, so a client can only read or write the records policy allows regardless of what the browser requests.",
      },
      {
        q: "Does signalling data get stored permanently?",
        a: "No. Session offers, answers and candidates are transient broadcast messages and are not persisted.",
      },
      {
        q: "Why is there a polling interval instead of instant updates everywhere?",
        a: "Some values change rarely and a live subscription per client would waste capacity. Polling intervals are tuned against rate limits.",
      },
      {
        q: "How is the queue kept consistent under load?",
        a: "Entries are consumed inside transactions with locking that skips already-claimed rows, guaranteeing each entry is used exactly once.",
      },
      {
        q: "Are analytics tied to individual conversations?",
        a: "No. Operational reporting is aggregate and does not include conversation content.",
      },
    ],
    related: ["instant-global-matchmaking", "points-recognition-architecture", "network-resilience-engineering"],
  },
];

export const HUB_SLUGS = HUB_PILLARS.map((p) => p.slug);

export const HUB_BY_SLUG = new Map(HUB_PILLARS.map((p) => [p.slug, p]));
