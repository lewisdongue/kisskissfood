import { createFileRoute } from "@tanstack/react-router";
import AboutFounder from "../pages/AboutFounder";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["about-founder"]!;

export const Route = createFileRoute("/about-founder")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <AboutFounder />
    </DistrictPage>
  ),
});
