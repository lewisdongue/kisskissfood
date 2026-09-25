import { createFileRoute } from "@tanstack/react-router";
import TermsOfService from "../pages/TermsOfService";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["terms-of-service"]!;

export const Route = createFileRoute("/terms-of-service")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <TermsOfService />
    </DistrictPage>
  ),
});
