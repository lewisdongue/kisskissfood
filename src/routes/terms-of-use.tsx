import { createFileRoute } from "@tanstack/react-router";
import TermsOfUse from "../pages/TermsOfUse";

const URL = "https://www.caakus.com/terms-of-use";
const TITLE = "Terms of Use | Caakus Inc. — 18+ Video Chat, Billing & YUYU Rules";
const DESCRIPTION =
  "Caakus Inc. Terms of Use: strict 18+ eligibility, zero tolerance for minors, recurring subscription and chargeback rules, YUYU credit terms, refunds and intellectual property.";

export const Route = createFileRoute("/terms-of-use")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: TermsOfUse,
});
