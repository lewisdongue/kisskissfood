import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["instant-live-cam-match"]!;

export const Route = createFileRoute("/instant-live-cam-match")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
