import { createFileRoute } from "@tanstack/react-router";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["privacy"]!;

export const Route = createFileRoute("/privacy")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <PrivacyPolicy />
    </DistrictPage>
  ),
});
