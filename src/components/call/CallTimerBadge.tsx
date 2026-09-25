import React from "react";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/utils/helpers";
import { useTimerSeconds, type CallTimer } from "@/hooks/useTimer";

/**
 * Isolated call duration badge. Subscribing here means the 1 Hz tick only
 * re-renders this ~3-node subtree instead of the whole call screen.
 */
export const CallTimerBadge: React.FC<{ timer: CallTimer }> = React.memo(({ timer }) => {
  const seconds = useTimerSeconds(timer);
  if (seconds <= 0) return null;
  return (
    <div className="flex flex-col items-center gap-2 mt-2 sm:mt-4">
      <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          ⏱️ {formatDuration(seconds)}
        </span>
      </div>
      <Progress value={(seconds % 60) * (100 / 60)} className="w-32 h-2" />
    </div>
  );
});

CallTimerBadge.displayName = "CallTimerBadge";

export default CallTimerBadge;
