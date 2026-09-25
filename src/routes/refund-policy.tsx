import { createFileRoute } from "@tanstack/react-router";
import RefundPolicy from "../pages/RefundPolicy";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["refund-policy"]!;

export const Route = createFileRoute("/refund-policy")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <RefundPolicy />
    </DistrictPage>
  ),
});
