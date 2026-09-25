import { createFileRoute } from "@tanstack/react-router";
import { appHead } from "@/lib/seoHead";
import AdminDashboard from "../pages/AdminDashboard";

export const Route = createFileRoute("/nathan")({
  head: appHead({ path: "/nathan", title: "Admin | Caakus", description: "Internal dashboard.", noindex: true }),
  component: AdminDashboard,
});
