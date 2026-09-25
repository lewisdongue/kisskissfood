import { createFileRoute } from "@tanstack/react-router";
import { appHead } from "@/lib/seoHead";
import VoicePage from "../../pages/VoicePage";

export const Route = createFileRoute("/voice/$id")({
  head: appHead({ path: "/voice", title: "Live Voice Room | Caakus", description: "Join a live Caakus voice room and talk hands-free with people around the world.", noindex: true }),
  component: VoicePage,
});
