import { createFileRoute } from "@tanstack/react-router";
import { appHead } from "@/lib/seoHead";
import CallPage from "../pages/CallPage";

export const Route = createFileRoute("/call")({
  head: appHead({ path: "/call", title: "Start a Free Random Video Chat Now | Caakus", description: "Tap once and meet a stranger on live camera in under two seconds. Free random video chat in your browser — no download, instant skip, 18+." }),
  component: CallPage,
});
