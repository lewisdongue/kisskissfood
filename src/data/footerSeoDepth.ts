// ═══════════════════════════════════════════════════════════════════════════
// FOOTER PAGES — DEPTH LAYER
// Per-slug unique modules: citable quick answer, comparison matrix, how-to,
// use cases, glossary, myth-busting and cross-links. Pure content, no logic.
// Rendered by DistrictPage under the shared hero + CTA widget.
// ═══════════════════════════════════════════════════════════════════════════

export type DepthRow = { name: string; signup: string; cost: string; mobile: string; note: string };
export type DepthStep = { name: string; text: string };
export type DepthTerm = { term: string; def: string };
export type DepthLink = { to: string; label: string; blurb: string };

export type FooterSeoDepth = {
  quickAnswer: string;
  keyFacts: string[];
  comparisonTitle: string;
  comparison: DepthRow[];
  howToTitle: string;
  howTo: DepthStep[];
  useCasesTitle: string;
  useCases: { title: string; body: string }[];
  glossary: DepthTerm[];
  myths: { claim: string; reality: string }[];
  related: DepthLink[];
};

const L = {
  omegle: { to: "/omegle-alternative", label: "Omegle alternative", blurb: "The closest 1-to-1 replacement for the shut-down original." },
  monkey: { to: "/monkey-app-alternative", label: "Monkey app alternative", blurb: "Fast-swipe video matching without the app store detour." },
  chatroulette: { to: "/chatroulette-alternative", label: "Chatroulette alternative", blurb: "Classic roulette flow, modern moderation." },
  azar: { to: "/azar-alternative", label: "Azar alternative", blurb: "Cross-country matching without gem paywalls." },
  ometv: { to: "/ometv-alternative", label: "OmeTV alternative", blurb: "Region filters and instant skip in the browser." },
  coomeet: { to: "/coomeet-alternative", label: "CooMeet alternative", blurb: "Real free matching instead of a credit meter." },
  anon: { to: "/anonymous-webcam-chat", label: "Anonymous webcam chat", blurb: "Camera on, identity off." },
  f2f: { to: "/face-to-face-random-chat", label: "Face-to-face random chat", blurb: "Eye contact beats text threads." },
  nosignup: { to: "/no-signup-video-match", label: "No-signup video match", blurb: "One tap, zero forms." },
  safe: { to: "/safe-chat-with-strangers", label: "Safe chat with strangers", blurb: "Reporting, bans and skip controls explained." },
  instant: { to: "/instant-live-cam-match", label: "Instant live cam match", blurb: "Sub-two-second pairing, explained." },
  browser: { to: "/browser-based-video-chat", label: "Browser-based video chat", blurb: "No download, no plugin, any device." },
};

export const FOOTER_SEO_DEPTH: Record<string, FooterSeoDepth> = {
  "ometv-alternative": {
    quickAnswer:
      "Caakus is a free OmeTV alternative that runs in any browser: you tap once, get paired with a stranger on camera in under two seconds, and can skip instantly. Unlike OmeTV there is no app install, no queue-position paywall, and active talk time earns YUYU credits.",
    keyFacts: [
      "Works on the web — no Android or iOS install required",
      "Median pairing time under two seconds on WebRTC peer-to-peer",
      "Region and gender preferences available to members",
      "Instant skip and one-tap reporting on every call",
      "Talk time and gifts convert into YUYU credits",
    ],
    comparisonTitle: "Caakus vs OmeTV and the rest",
    comparison: [
      { name: "Caakus", signup: "Optional", cost: "Free core", mobile: "Browser + PWA", note: "Earns YUYU credits while you talk" },
      { name: "OmeTV", signup: "App install", cost: "Free with ads", mobile: "Native app", note: "Ad-heavy, store-gated" },
      { name: "Chatroulette", signup: "Optional", cost: "Free", mobile: "Web", note: "Desktop-first experience" },
      { name: "CooMeet", signup: "Required", cost: "Credit packs", mobile: "Web", note: "Metered minutes" },
    ],
    howToTitle: "How to start an OmeTV-style call on Caakus",
    howTo: [
      { name: "Open Caakus in your browser", text: "Go to caakus.com on phone or laptop. No download, no plugin, no app store." },
      { name: "Allow camera and microphone", text: "Your browser asks once. Permission stays local — Caakus never records the stream." },
      { name: "Tap start", text: "The matchmaker pairs you with an available stranger, usually in under two seconds." },
      { name: "Talk or skip", text: "Stay for a real conversation or skip instantly. Report anything that breaks the rules." },
    ],
    useCasesTitle: "What people actually use it for",
    useCases: [
      { title: "Language practice", body: "Speak with native speakers in the country you are learning, without booking a tutor." },
      { title: "Late-night company", body: "Someone is always awake in another time zone when your own city is asleep." },
      { title: "Travel scouting", body: "Ask locals about a city before you book the trip." },
      { title: "Creator reach", body: "Meet an unfiltered global audience and turn attention into YUYU." },
      { title: "Social confidence", body: "Low-stakes reps at starting conversations with new people." },
      { title: "Quick breaks", body: "A five-minute human conversation between work blocks." },
    ],
    glossary: [
      { term: "WebRTC", def: "The browser standard that carries video peer-to-peer without a plugin." },
      { term: "Skip", def: "Ending the current pairing and returning to the queue immediately." },
      { term: "Region filter", def: "Preferring matches from a chosen country or continent." },
      { term: "YUYU", def: "Caakus credits earned from activity and gifts, convertible by members." },
      { term: "TURN relay", def: "Fallback server used when two networks cannot connect directly." },
      { term: "Queue", def: "The pool of users waiting to be paired at any moment." },
    ],
    myths: [
      { claim: "You need the app to get matched", reality: "The browser build uses the same matchmaking pool as any native client." },
      { claim: "Web video chat is laggy", reality: "Peer-to-peer WebRTC often beats app relays because the media path is direct." },
    ],
    related: [L.omegle, L.monkey, L.browser, L.instant],
  },

  "coomeet-alternative": {
    quickAnswer:
      "Caakus is a free CooMeet alternative with no per-minute credit meter. Matching, video calls and skipping are free; optional premium adds filters and priority, and you can earn YUYU credits instead of only spending them.",
    keyFacts: [
      "No metered minutes — core video chat is free",
      "Optional premium for gender and region targeting",
      "Members earn YUYU from gifts, streaks and challenges",
      "Reporting plus automatic bans after repeated reports",
      "Runs in the browser on any modern phone or laptop",
    ],
    comparisonTitle: "Caakus vs CooMeet on cost",
    comparison: [
      { name: "Caakus", signup: "Optional", cost: "Free core", mobile: "Browser + PWA", note: "Earn while you talk" },
      { name: "CooMeet", signup: "Required", cost: "Paid minutes", mobile: "Web", note: "Credits drain per minute" },
      { name: "OmeTV", signup: "App install", cost: "Free with ads", mobile: "Native app", note: "Ads between matches" },
      { name: "Azar", signup: "Required", cost: "Gem packs", mobile: "Native app", note: "Filters behind gems" },
    ],
    howToTitle: "Switching from a credit meter to free matching",
    howTo: [
      { name: "Open Caakus", text: "No purchase, no credit balance to top up before your first call." },
      { name: "Start a match", text: "Tap once; matching costs nothing and there is no minute counter running." },
      { name: "Keep the good conversations", text: "Add people you click with instead of racing a timer." },
      { name: "Earn instead of spend", text: "Gifts and daily activity credit YUYU to your balance." },
    ],
    useCasesTitle: "Who switches and why",
    useCases: [
      { title: "Heavy users", body: "People who burned through credit packs in an evening." },
      { title: "Students", body: "No budget for metered chat, plenty of time to talk." },
      { title: "Creators", body: "Monetise attention rather than pay for it." },
      { title: "Casual browsers", body: "Try it without entering card details." },
      { title: "Night-shift workers", body: "Long sessions without a ticking balance." },
      { title: "Travellers", body: "Meet locals without roaming-priced credits." },
    ],
    glossary: [
      { term: "Credit meter", def: "A per-minute charge model used by paid chat sites." },
      { term: "YUYU", def: "Caakus credits earned from activity, convertible by members." },
      { term: "Priority matching", def: "Premium placement nearer the front of the queue." },
      { term: "Gift", def: "A paid token one user sends another during a call." },
      { term: "Streak", def: "Consecutive active days that increase rewards." },
      { term: "Skip", def: "Immediately leaving a pairing for a new one." },
    ],
    myths: [
      { claim: "Free chat means no moderation", reality: "Reporting, automatic bans and on-device screening run on every call." },
      { claim: "Paying guarantees better matches", reality: "Match quality depends on the live pool, not on a credit balance." },
    ],
    related: [L.ometv, L.azar, L.nosignup, L.safe],
  },

  "anonymous-webcam-chat": {
    quickAnswer:
      "Anonymous webcam chat on Caakus means your camera is on but your identity is not: no real name, no phone number and no profile history are required to start. Calls are peer-to-peer and are not recorded by the platform.",
    keyFacts: [
      "No real name or phone number required to start a call",
      "Video travels peer-to-peer between the two browsers",
      "Caakus does not record or store call video",
      "Skip instantly and report with one tap",
      "Screening runs on your device, not on a server",
    ],
    comparisonTitle: "Anonymity compared",
    comparison: [
      { name: "Caakus", signup: "Optional", cost: "Free core", mobile: "Browser", note: "No name or phone needed" },
      { name: "Monkey", signup: "Required", cost: "Free with ads", mobile: "App", note: "Profile-linked" },
      { name: "Azar", signup: "Required", cost: "Gems", mobile: "App", note: "Account identity required" },
      { name: "Chatroulette", signup: "Optional", cost: "Free", mobile: "Web", note: "Anonymous, desktop-first" },
    ],
    howToTitle: "How to chat anonymously and stay that way",
    howTo: [
      { name: "Start without a profile", text: "Open the site and begin a match — no form to fill in first." },
      { name: "Keep identifiers off camera", text: "No visible documents, badges, addresses or screens with your details." },
      { name: "Use the skip button early", text: "If a stranger pushes for personal details, skip — it costs one tap." },
      { name: "Report bad behaviour", text: "Reports feed the ban system; repeat offenders are removed." },
    ],
    useCasesTitle: "Why people want anonymity on camera",
    useCases: [
      { title: "Honest conversations", body: "Say what you actually think without it following your name around." },
      { title: "Sensitive topics", body: "Talk through something you would not post publicly." },
      { title: "Testing ideas", body: "Pitch to strangers who have no reason to be polite." },
      { title: "Privacy-first users", body: "No social graph, no contact upload, no data trail." },
      { title: "Public figures", body: "Casual conversation without being recognised by a profile." },
      { title: "First-timers", body: "Try random video chat without committing an identity." },
    ],
    glossary: [
      { term: "Peer-to-peer", def: "Media flows directly between two browsers rather than through a server." },
      { term: "On-device screening", def: "Content checks that run locally without uploading frames." },
      { term: "Pseudonymous", def: "Using a handle that is not tied to your legal identity." },
      { term: "Report", def: "Flagging a user; repeated flags trigger an automatic ban." },
      { term: "Session", def: "One pairing between two users, ended by skip or hang-up." },
      { term: "Metadata", def: "Non-content data such as timestamps kept for safety and billing." },
    ],
    myths: [
      { claim: "Anonymous means unaccountable", reality: "Reports, bans and rate limits apply to anonymous sessions too." },
      { claim: "The platform watches every call", reality: "Calls are peer-to-peer and not recorded; screening runs on your device." },
    ],
    related: [L.safe, L.nosignup, L.omegle, L.browser],
  },

  "face-to-face-random-chat": {
    quickAnswer:
      "Face-to-face random chat pairs two strangers on live camera instead of text. On Caakus the pairing takes under two seconds, works in the browser, and you see tone, expression and reaction — the signals text threads strip out.",
    keyFacts: [
      "Live camera pairing, not text or voice-only",
      "Median match time under two seconds",
      "Average sessions run past twelve minutes",
      "Voice-only rooms available when you want camera off",
      "Instant skip keeps every conversation opt-in",
    ],
    comparisonTitle: "Face-to-face vs other chat formats",
    comparison: [
      { name: "Caakus video", signup: "Optional", cost: "Free core", mobile: "Browser", note: "Full expression and tone" },
      { name: "Text roulette", signup: "None", cost: "Free", mobile: "Web", note: "No tone, easy to fake" },
      { name: "Voice rooms", signup: "Optional", cost: "Free", mobile: "Browser", note: "Tone without faces" },
      { name: "Social feeds", signup: "Required", cost: "Free with ads", mobile: "App", note: "Asynchronous, algorithmic" },
    ],
    howToTitle: "Getting a good face-to-face conversation",
    howTo: [
      { name: "Light your face", text: "Put the light source in front of you; backlight turns you into a silhouette." },
      { name: "Open with a question", text: "'Where are you right now?' beats 'hi' every single time." },
      { name: "Give it ninety seconds", text: "Most conversations need a minute before they find a thread." },
      { name: "Skip without guilt", text: "No match is an obligation; the queue is always full." },
    ],
    useCasesTitle: "Where face-to-face wins",
    useCases: [
      { title: "Language exchange", body: "Mouth shapes and gestures teach what transcripts cannot." },
      { title: "Cultural exchange", body: "See someone's street, kitchen or weather, not their bio." },
      { title: "Loneliness", body: "A real face registers as company in a way text never does." },
      { title: "Interview practice", body: "Rehearse speaking to a stranger under mild pressure." },
      { title: "Debate", body: "Disagree with someone who cannot be mistaken for a bot." },
      { title: "Creative feedback", body: "Read the honest first reaction on someone's face." },
    ],
    glossary: [
      { term: "Random pairing", def: "Matching two users with no prior connection." },
      { term: "Session length", def: "How long a pairing lasts before either side skips." },
      { term: "Camera-off mode", def: "Voice room option for hands-free conversation." },
      { term: "Rapport", def: "The mutual comfort that lets a conversation continue." },
      { term: "Icebreaker", def: "An opening prompt that gives the other person something to answer." },
      { term: "Latency", def: "Delay between speaking and being heard; low latency keeps turn-taking natural." },
    ],
    myths: [
      { claim: "Video chat is awkward", reality: "Awkwardness lasts about ninety seconds; most sessions run far longer." },
      { claim: "Nobody talks seriously to strangers", reality: "Anonymity often produces more candour, not less." },
    ],
    related: [L.omegle, L.chatroulette, L.instant, L.anon],
  },

  "no-signup-video-match": {
    quickAnswer:
      "No-signup video match means you can be in a live call with a stranger without creating an account: open Caakus, allow camera access, tap start. An account is only needed for filters, friends and earning YUYU.",
    keyFacts: [
      "No email, password or phone number to start",
      "Camera permission is the only requirement",
      "Account unlocks filters, friends list and YUYU earnings",
      "Nothing to uninstall — it is a web page",
      "Skip and report work without an account",
    ],
    comparisonTitle: "How much do rivals ask before the first call?",
    comparison: [
      { name: "Caakus", signup: "Not required", cost: "Free core", mobile: "Browser", note: "Straight into the queue" },
      { name: "Monkey", signup: "Required", cost: "Free with ads", mobile: "App", note: "Install then register" },
      { name: "CooMeet", signup: "Required", cost: "Credits", mobile: "Web", note: "Account plus balance" },
      { name: "Azar", signup: "Required", cost: "Gems", mobile: "App", note: "Store install first" },
    ],
    howToTitle: "From zero to a live call",
    howTo: [
      { name: "Open the page", text: "No store, no APK, no installer." },
      { name: "Grant camera and mic", text: "A single browser prompt, revocable at any time." },
      { name: "Tap start", text: "You enter the same queue as registered members." },
      { name: "Register later, if ever", text: "Create an account only when you want filters or YUYU." },
    ],
    useCasesTitle: "When skipping signup matters",
    useCases: [
      { title: "Borrowed devices", body: "No credentials left behind on someone else's phone." },
      { title: "Low storage", body: "Nothing installed, nothing to delete." },
      { title: "Privacy", body: "No email harvested before you know whether you like the product." },
      { title: "Impulse use", body: "Five free minutes should not need a registration funnel." },
      { title: "Restricted networks", body: "Works where app stores are blocked but the web is not." },
      { title: "Older hardware", body: "A browser tab is lighter than a native app." },
    ],
    glossary: [
      { term: "Guest session", def: "An unregistered pairing with core features enabled." },
      { term: "Permission prompt", def: "The browser dialog granting camera and microphone access." },
      { term: "PWA", def: "A web app you can add to your home screen without a store." },
      { term: "Filter", def: "Region or gender preference available to members." },
      { term: "Rate limit", def: "A cap on rapid skips that blocks automated abuse." },
      { term: "Account upgrade", def: "Turning a guest session into a saved profile." },
    ],
    myths: [
      { claim: "No signup means no safety", reality: "Reporting, bans and rate limiting apply to guests as well." },
      { claim: "Guests get worse matches", reality: "Guests and members share one matchmaking pool." },
    ],
    related: [L.anon, L.browser, L.omegle, L.ometv],
  },

  "safe-chat-with-strangers": {
    quickAnswer:
      "Safe chat with strangers on Caakus rests on four controls: instant skip, one-tap reporting, automatic bans once several distinct users report the same person, and on-device screening that flags explicit video without uploading your frames.",
    keyFacts: [
      "Instant skip ends any call in one tap",
      "Reports from several distinct users trigger an automatic ban",
      "Explicit-content screening runs locally in your browser",
      "Calls are peer-to-peer and are not recorded",
      "Strictly 18+ with published community rules",
    ],
    comparisonTitle: "Safety controls side by side",
    comparison: [
      { name: "Caakus", signup: "Optional", cost: "Free core", mobile: "Browser", note: "Skip, report, auto-ban, local screening" },
      { name: "Omegle (closed)", signup: "None", cost: "Free", mobile: "Web", note: "Shut down over safety failures" },
      { name: "Monkey", signup: "Required", cost: "Free with ads", mobile: "App", note: "Report and block" },
      { name: "Chatroulette", signup: "Optional", cost: "Free", mobile: "Web", note: "Filtering plus reports" },
    ],
    howToTitle: "How to stay safe in random video chat",
    howTo: [
      { name: "Keep personal data off camera", text: "No address, school badge, workplace pass or document in frame." },
      { name: "Skip early", text: "Discomfort is enough reason. You owe a stranger nothing." },
      { name: "Report, do not argue", text: "One tap is faster and it feeds the ban system." },
      { name: "Never move money", text: "No gift cards, crypto or transfers to someone you just met." },
    ],
    useCasesTitle: "Who the safety layer protects",
    useCases: [
      { title: "New users", body: "Clear controls from the very first call." },
      { title: "Women", body: "Filters, fast skip and reporting that has consequences." },
      { title: "Language learners", body: "Long sessions without harassment derailing them." },
      { title: "Creators", body: "Ban tooling that removes repeat offenders from the pool." },
      { title: "Parents", body: "A published 18+ policy and enforcement rules to read." },
      { title: "Privacy-conscious users", body: "Screening that never uploads video frames." },
    ],
    glossary: [
      { term: "Auto-ban", def: "Removal triggered when several distinct users report one account." },
      { term: "On-device screening", def: "Local analysis of your own video that uploads nothing." },
      { term: "Distinct reporter", def: "One unique account; repeat reports from one person count once." },
      { term: "Skip", def: "Instantly leaving a pairing." },
      { term: "Community rules", def: "The published conduct policy every session is bound by." },
      { term: "Appeal", def: "Requesting review of a ban through support." },
    ],
    myths: [
      { claim: "Random chat cannot be moderated", reality: "Reports, bans and screening measurably shrink repeat offending." },
      { claim: "Reporting does nothing", reality: "Reports from several distinct users remove the account automatically." },
    ],
    related: [L.anon, L.omegle, L.chatroulette, L.monkey],
  },

  "instant-live-cam-match": {
    quickAnswer:
      "Instant live cam match means the pairing happens in under two seconds. Caakus achieves that with a pre-warmed peer connection, a live queue of waiting users, and direct WebRTC media instead of a relay hop.",
    keyFacts: [
      "Median pairing under two seconds",
      "Peer connection is pre-warmed before you tap start",
      "Direct peer-to-peer media path, relay only as a fallback",
      "Skip re-enters the queue immediately",
      "Works on mobile data as well as Wi-Fi",
    ],
    comparisonTitle: "Speed to first frame",
    comparison: [
      { name: "Caakus", signup: "Optional", cost: "Free core", mobile: "Browser", note: "Pre-warmed, sub-2s typical" },
      { name: "OmeTV", signup: "App install", cost: "Free with ads", mobile: "App", note: "Ad interstitials add delay" },
      { name: "Azar", signup: "Required", cost: "Gems", mobile: "App", note: "Login and store install first" },
      { name: "CooMeet", signup: "Required", cost: "Credits", mobile: "Web", note: "Balance check before matching" },
    ],
    howToTitle: "How to get the fastest match",
    howTo: [
      { name: "Grant permissions before tapping", text: "The camera stream is ready the moment matching starts." },
      { name: "Use a stable network", text: "Direct peer connections settle faster than relayed ones." },
      { name: "Match at peak hours for your region", text: "A deeper queue means a faster pairing." },
      { name: "Skip fast when it stalls", text: "Re-queuing is quicker than waiting out a bad connection." },
    ],
    useCasesTitle: "When speed is the whole point",
    useCases: [
      { title: "Short breaks", body: "A real conversation inside a five-minute gap." },
      { title: "High-volume discovery", body: "Meet dozens of people in one session." },
      { title: "Creators", body: "Keep a stream moving without dead air between guests." },
      { title: "Mobile users", body: "Fast pairing matters most on the move." },
      { title: "Events", body: "Rapid-fire introductions during a virtual meetup." },
      { title: "Testing", body: "Check camera and mic against a real person instantly." },
    ],
    glossary: [
      { term: "Pre-warming", def: "Opening the peer connection before the user requests a match." },
      { term: "ICE candidate", def: "A possible network path between two peers." },
      { term: "STUN", def: "Server that discovers your public network address." },
      { term: "TURN", def: "Relay used when a direct path is impossible." },
      { term: "Time to first frame", def: "Delay between tapping start and seeing the other person." },
      { term: "Queue depth", def: "How many users are waiting to be paired right now." },
    ],
    myths: [
      { claim: "Faster matching means lower quality", reality: "Speed comes from connection setup, not from lowering video quality." },
      { claim: "Native apps are always faster", reality: "Browser WebRTC uses the same media stack as most native clients." },
    ],
    related: [L.ometv, L.browser, L.f2f, L.azar],
  },

  "browser-based-video-chat": {
    quickAnswer:
      "Browser-based video chat runs entirely in a web page using WebRTC — no download, no plugin, no app store. Caakus works this way on Chrome, Safari, Firefox and Edge, on phones, tablets, laptops and Chromebooks.",
    keyFacts: [
      "Zero install: it is a web page, not an application",
      "Supported on Chrome, Safari, Firefox and Edge",
      "Same WebRTC media stack native apps use",
      "Installable to your home screen as a PWA",
      "Nothing left behind when you close the tab",
    ],
    comparisonTitle: "Browser versus app",
    comparison: [
      { name: "Caakus (web)", signup: "Optional", cost: "Free core", mobile: "Any browser", note: "Nothing to install or update" },
      { name: "Monkey", signup: "Required", cost: "Free with ads", mobile: "App only", note: "Store download required" },
      { name: "Azar", signup: "Required", cost: "Gems", mobile: "App only", note: "Large install footprint" },
      { name: "OmeTV", signup: "App install", cost: "Free with ads", mobile: "App-first", note: "Store-gated features" },
    ],
    howToTitle: "Using Caakus in any browser",
    howTo: [
      { name: "Open the site", text: "Any modern browser on any operating system." },
      { name: "Allow camera and microphone", text: "One prompt per browser, revocable in settings." },
      { name: "Add to home screen (optional)", text: "Install it as a PWA for an app-like launcher icon." },
      { name: "Start matching", text: "Same queue and same features as any other client." },
    ],
    useCasesTitle: "Where browser-only wins",
    useCases: [
      { title: "Work laptops", body: "No admin rights needed to install anything." },
      { title: "Chromebooks", body: "Full functionality where native apps are limited." },
      { title: "Low-storage phones", body: "No gigabytes surrendered to a chat app." },
      { title: "Shared computers", body: "Close the tab and nothing remains." },
      { title: "Blocked app stores", body: "Web access where stores are unavailable." },
      { title: "Instant trials", body: "Judge the product before committing anything." },
    ],
    glossary: [
      { term: "WebRTC", def: "The browser standard for real-time audio and video." },
      { term: "PWA", def: "A web app installable to the home screen without a store." },
      { term: "getUserMedia", def: "The browser API that requests camera and microphone access." },
      { term: "Codec", def: "The compression format, typically VP8, VP9, H.264 or AV1." },
      { term: "Secure context", def: "HTTPS requirement before a browser grants camera access." },
      { term: "Permission prompt", def: "The browser dialog approving device access." },
    ],
    myths: [
      { claim: "Browsers need a plugin for video chat", reality: "WebRTC has been built into every major browser for years." },
      { claim: "Web video quality is worse", reality: "The browser negotiates the same codecs native apps use." },
    ],
    related: [L.nosignup, L.instant, L.ometv, L.omegle],
  },
};

export const buildHowToJsonLd = (name: string, steps: DepthStep[]) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name,
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
});

export const buildDefinedTermJsonLd = (name: string, terms: DepthTerm[]) => ({
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name,
  hasDefinedTerm: terms.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    description: t.def,
  })),
});

export const buildItemListJsonLd = (name: string, links: DepthLink[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  itemListElement: links.map((l, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: l.label,
    url: l.to,
  })),
});
