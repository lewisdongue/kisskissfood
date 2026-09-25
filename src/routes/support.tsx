import { createFileRoute } from "@tanstack/react-router";
import Support from "../pages/Support";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["support"]!;

export const Route = createFileRoute("/support")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <Support />
    </DistrictPage>
  ),
});
