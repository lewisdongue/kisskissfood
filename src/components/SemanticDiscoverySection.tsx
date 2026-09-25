import { memo } from "react";

// ═══════════════════════════════════════════════════════════════════
// SEMANTIC DISCOVERY SECTION
// Machine-readable, LLM-extractable prose + FAQ. Pure presentation:
// no state, no side effects, no app logic.
// ═══════════════════════════════════════════════════════════════════

export const CAAKUS_FAQ: { q: string; a: string }[] = [
  {
    q: "What is Caakus?",
    a: "Caakus is a global real-time video chat and social discovery platform. It instantly matches you with strangers worldwide for one-to-one video and voice conversations, and rewards active users with YUYU, its in-app cryptocurrency, along with gifts, challenges and level progression.",
  },
  {
    q: "Is Caakus a good Omegle alternative?",
    a: "Yes. Caakus offers the same instant random matching Omegle popularised, plus modern safeguards: AI moderation, verified accounts, gender and region filters for premium members, and an economy that lets users earn while they talk.",
  },
  {
    q: "How do you earn money on Caakus?",
    a: "Users earn through four loops: time spent in calls, gifts received from other users, completing in-call challenges, and YUYU cryptocurrency rewards tied to platform activity. Balances can be converted or paid out from the wallet.",
  },
  {
    q: "Is Caakus free to use?",
    a: "Yes. Random video chat, voice chat and text chat are free. A premium subscription unlocks matching preferences such as gender filtering, region targeting, and priority matchmaking.",
  },
  {
    q: "Is Caakus safe and anonymous?",
    a: "Conversations are anonymous by default — no personal details are shared unless you choose to. AI moderation, reporting and instant skip controls are available in every session.",
  },
  {
    q: "Which devices does Caakus work on?",
    a: "Caakus runs in any modern browser on desktop, Android and iOS, and installs as a Progressive Web App for a full-screen, app-like experience without an app store.",
  },
];

const PILLARS = [
  {
    h: "Instant global matchmaking",
    p: "One tap connects you to a live stranger in under a second. Caakus routes calls across 150+ countries with low-latency WebRTC infrastructure, so the conversation starts before hesitation does.",
  },
  {
    h: "An economy built into the conversation",
    p: "Every minute, gift and challenge feeds a transparent reward loop denominated in YUYU. Caakus is the first social discovery platform where attention converts into a balance you own.",
  },
  {
    h: "Safety as a product feature",
    p: "AI moderation, one-tap skip, verified badges and reporting are built into the call surface itself — not buried in settings — so the room stays yours.",
  },
];

export const SemanticDiscoverySection = memo(function SemanticDiscoverySection() {
  return (
    <section
      aria-labelledby="discover-caakus"
      className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24"
    >
      <header className="mb-10 sm:mb-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/35">
          Social discovery, redefined
        </p>
        <h2
          id="discover-caakus"
          className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-white"
        >
          The global standard for real-time video chat
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] sm:text-base leading-relaxed text-white/55">
          Caakus connects millions of people through anonymous one-to-one video and voice
          conversations, and turns the time they spend together into measurable value. It is a
          social network without a feed: no scrolling, no followers — only live humans.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {PILLARS.map((item) => (
          <article
            key={item.h}
            className="oled-glass rounded-2xl p-5 sm:p-6 press-spring"
          >
            <h3 className="text-[15px] font-semibold tracking-tight text-white">{item.h}</h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/50">{item.p}</p>
          </article>
        ))}
      </div>

      <div className="mt-14 sm:mt-20">
        <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-white">
          Frequently asked questions
        </h2>
        <div className="mt-6 divide-y divide-white/[0.07] rounded-2xl oled-glass overflow-hidden">
          {CAAKUS_FAQ.map((item) => (
            <details key={item.q} className="group px-5 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 sm:py-5 text-[14.5px] sm:text-base font-medium text-white/85 transition-colors hover:text-white">
                <h3 className="font-medium">{item.q}</h3>
                <span
                  aria-hidden
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/10 text-white/40 transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 pr-8 text-[13.5px] leading-relaxed text-white/50">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
});
