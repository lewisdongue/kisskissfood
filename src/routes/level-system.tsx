import { createFileRoute } from "@tanstack/react-router";
import { appHead } from "@/lib/seoHead";
import LevelSystemDemo from "../pages/LevelSystemDemo";

export const Route = createFileRoute("/level-system")({
  head: appHead({ path: "/level-system", title: "Caakus Level System Explained — XP, Ranks and Rewards", description: "How Caakus levels work: how XP is earned, what each rank unlocks and how levels affect matching and rewards." }),
  component: LevelSystemDemo,
});
