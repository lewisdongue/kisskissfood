import { createFileRoute } from "@tanstack/react-router";
import SettingsWrapper from "../pages/SettingsWrapper";
import { FOOTER_SEO } from "@/data/footerSeo";
import { buildHead } from "@/lib/seoHead";

const seo = FOOTER_SEO["settings"]!;

export const Route = createFileRoute("/settings")({
  head: buildHead(seo),
  component: SettingsWrapper,
});
