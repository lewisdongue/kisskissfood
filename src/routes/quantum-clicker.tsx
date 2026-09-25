import { createFileRoute } from "@tanstack/react-router";
import { appHead } from "@/lib/seoHead";
import QuantumClicker from "../pages/QuantumClicker";

export const Route = createFileRoute("/quantum-clicker")({
  head: appHead({ path: "/quantum-clicker", title: "Quantum Clicker — Caakus Mini Game", description: "Play the Caakus Quantum Clicker mini game and earn YUYU while you wait for your next match." }),
  component: QuantumClicker,
});
