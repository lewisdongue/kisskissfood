import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["browser-based-video-chat"]!;

export const Route = createFileRoute("/browser-based-video-chat")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
