import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["ometv-alternative"]!;

export const Route = createFileRoute("/ometv-alternative")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
