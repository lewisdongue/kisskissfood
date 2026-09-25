import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["talk-to-strangers"]!;

export const Route = createFileRoute("/talk-to-strangers")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
