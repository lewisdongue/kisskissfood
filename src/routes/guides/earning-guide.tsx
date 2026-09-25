import { createFileRoute } from "@tanstack/react-router";
import FinanceGuide from "../../pages/FinanceGuide";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["earning-guide"]!;

export const Route = createFileRoute("/guides/earning-guide")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <FinanceGuide />
    </DistrictPage>
  ),
});
