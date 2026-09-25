import { createFileRoute } from "@tanstack/react-router";
import { appHead } from "@/lib/seoHead";
import ConnectionsPage from "../pages/ConnectionsPage";

export const Route = createFileRoute("/connections")({
  head: appHead({ path: "/connections", title: "Connections | Caakus", description: "People you have connected with on Caakus.", noindex: true }),
  component: ConnectionsPage,
});
