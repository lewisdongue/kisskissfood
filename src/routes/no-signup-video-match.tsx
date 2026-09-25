import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["no-signup-video-match"]!;

export const Route = createFileRoute("/no-signup-video-match")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
