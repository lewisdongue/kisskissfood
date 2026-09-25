import { createFileRoute } from "@tanstack/react-router";
import { appHead } from "@/lib/seoHead";
import ChatPage from "../pages/ChatPage";

export const Route = createFileRoute("/chat")({
  head: appHead({ path: "/chat", title: "Messages | Caakus", description: "Your private Caakus conversations.", noindex: true }),
  component: ChatPage,
});
