// Mounts the Share-to-Earn banner for signed-in free users only, and never
// inside the video sanctuary (/call, /voice).

import { useRouterState } from "@tanstack/react-router";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import ShareToEarnBanner from "./ShareToEarnBanner";

function isSanctuary(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/call" || path.startsWith("/call/") || path === "/voice" || path.startsWith("/voice/");
}

export default function ShareToEarnGate() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { userId, isPremium, loading, referralCode } = usePremiumStatus();

  if (loading || !userId || isPremium || isSanctuary(pathname)) return null;
  return <ShareToEarnBanner referralCode={referralCode} userId={userId} />;
}
