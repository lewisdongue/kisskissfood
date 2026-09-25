import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["safe-chat-with-strangers"]!;

export const Route = createFileRoute("/safe-chat-with-strangers")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
