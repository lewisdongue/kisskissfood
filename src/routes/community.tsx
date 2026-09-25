import { createFileRoute } from "@tanstack/react-router";
import Community from "../pages/Community";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["community"]!;

export const Route = createFileRoute("/community")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <Community />
    </DistrictPage>
  ),
});
