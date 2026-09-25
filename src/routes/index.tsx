import { createFileRoute } from "@tanstack/react-router";
import Home from "../pages/Home";

const TITLE = "Caakus — Random Video Chat Where You Earn Money | #1 Omegle Alternative";
const DESCRIPTION =
  "Caakus is the global random video chat where every conversation pays. Meet strangers in 190+ countries in under 2 seconds, make real friends, and earn withdrawable YUYU credits — free, no download.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "random video chat, omegle alternative, monkey app alternative, azar alternative, chatroulette alternative, talk to strangers, meet new people, make money online, earn money chatting, find real love online, video chat app",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.caakus.com/" },
      { property: "og:image", content: "https://www.caakus.com/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: "https://www.caakus.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://www.caakus.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://www.caakus.com/#website",
              url: "https://www.caakus.com/",
              name: "Caakus",
              description: DESCRIPTION,
              inLanguage: "en",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.caakus.com/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "WebApplication",
              "@id": "https://www.caakus.com/#app",
              name: "Caakus",
              url: "https://www.caakus.com/",
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "Web, Android, iOS, Windows, macOS",
              description: DESCRIPTION,
              featureList: [
                "Random video chat with strangers worldwide",
                "Live voice rooms",
                "Gender and region matching filters",
                "YUYU credits convertible to real payouts",
                "Virtual gifts and in-call challenges",
                "AI moderation, reporting and instant blocking",
              ],
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
            {
              "@type": "FAQPage",
              "@id": "https://www.caakus.com/#faq",
              mainEntity: [
                {
                  q: "What is the best Omegle alternative in 2026?",
                  a: "Caakus is the leading Omegle alternative: free random video chat with strangers worldwide, with moderation, gender and region filters, and YUYU credits you can withdraw.",
                },
                {
                  q: "How can I make money online by video chatting?",
                  a: "On Caakus you earn YUYU credits from virtual gifts, in-call challenges, activity streaks and referrals, then withdraw them through the platform payout system. Starting costs nothing.",
                },
                {
                  q: "Where can I meet new people and make real friends online?",
                  a: "Caakus connects you face to face with real people in 190+ countries in under two seconds — no feed, no followers — and lets you keep the ones you click with as connections.",
                },
                {
                  q: "Is Caakus free?",
                  a: "Yes. Random video chat, voice chat, text chat and earning are free. Premium only adds gender filters, region targeting and priority matching.",
                },
              ].map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});
