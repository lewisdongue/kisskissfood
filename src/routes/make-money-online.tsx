import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["make-money-online"]!;

export const Route = createFileRoute("/make-money-online")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
