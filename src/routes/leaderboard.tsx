import { createFileRoute } from "@tanstack/react-router";
import { appHead } from "@/lib/seoHead";
import LeaderboardPage from "../pages/LeaderboardPage";

export const Route = createFileRoute("/leaderboard")({
  head: appHead({ path: "/leaderboard", title: "Global Leaderboard — Top Caakus Members", description: "See the most active Caakus members worldwide, ranked by live activity, YUYU earned and conversation streaks." }),
  component: LeaderboardPage,
});
