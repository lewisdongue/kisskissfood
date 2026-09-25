import { createFileRoute } from "@tanstack/react-router";
import { appHead } from "@/lib/seoHead";
import Plan from "../pages/Plan";

export const Route = createFileRoute("/plan")({
  head: appHead({ path: "/plan", title: "Caakus Premium Plans and Pricing", description: "Compare Caakus plans: free random video chat, premium filters, priority matching and the Founder's Club lifetime option." }),
  component: Plan,
});
