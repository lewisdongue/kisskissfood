import { createFileRoute } from "@tanstack/react-router";
import MediaGallery from "../pages/MediaGallery";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["media"]!;

export const Route = createFileRoute("/media")({
  head: buildHead(seo),
  component: () => (
    <DistrictPage seo={seo}>
      <MediaGallery />
    </DistrictPage>
  ),
});
