import { createFileRoute } from "@tanstack/react-router";
import Contact from "../pages/Contact";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["contact"]!;

export const Route = createFileRoute("/contact")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <Contact />
    </DistrictPage>
  ),
});
