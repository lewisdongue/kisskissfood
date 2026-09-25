import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["meet-new-people"]!;

export const Route = createFileRoute("/meet-new-people")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
