import { createFileRoute } from "@tanstack/react-router";
import VoicePage from "../pages/VoicePage";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["voice"]!;

export const Route = createFileRoute("/voice")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <VoicePage />
    </DistrictPage>
  ),
});
