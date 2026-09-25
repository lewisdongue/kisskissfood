import { createFileRoute } from "@tanstack/react-router";
import DistrictPage from "@/components/district/DistrictPage";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["video-chat-dating"]!;

export const Route = createFileRoute("/video-chat-dating")({
  head: buildHead(seo),
  component: () => <DistrictPage seo={seo} />,
});
