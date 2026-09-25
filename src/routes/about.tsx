import { createFileRoute } from "@tanstack/react-router";
import About from "../pages/About";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["about"]!;

export const Route = createFileRoute("/about")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <About />
    </DistrictPage>
  ),
});
