import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["azar-alternative"]!;

export const Route = createFileRoute("/azar-alternative")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
