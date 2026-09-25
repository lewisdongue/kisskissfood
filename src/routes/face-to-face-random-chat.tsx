import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["face-to-face-random-chat"]!;

export const Route = createFileRoute("/face-to-face-random-chat")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
