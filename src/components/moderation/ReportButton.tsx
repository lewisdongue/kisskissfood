import { useEffect, useRef, useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../config/supabase";

interface ReportButtonProps {
  /** The partner being reported. Nothing renders without one. */
  peerId: string | null | undefined;
  roomName?: string | null;
  /** Fired after a report is successfully recorded. */
  onReported?: () => void;
  className?: string;
}

/**
 * Tiny, icon-only report control for the live video surface.
 * Two taps (confirm) so it can never fire by accident, and it is small
 * enough to sit in a corner without covering Match / Skip on mobile.
 */
export function ReportButton({ peerId, roomName, onReported, className = "" }: ReportButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const resetRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetRef.current) window.clearTimeout(resetRef.current);
    };
  }, []);

  if (!peerId) return null;

  const submit = async () => {
    if (sending) return;
    setSending(true);
    try {
      const { error } = await supabase.rpc("report_match_user", {
        p_reported: peerId,
        p_room: roomName ?? null,
        p_reason: "inappropriate",
      });
      if (error) throw error;
      toast.success("Report sent. Thank you.", { duration: 3000 });
      onReported?.();
    } catch {
      toast.error("Report failed. Try again.", { duration: 3000 });
    } finally {
      setSending(false);
      setConfirming(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={confirming ? "Confirm report" : "Report this person"}
      title={confirming ? "Tap again to report" : "Report"}
      disabled={sending}
      onClick={(event) => {
        event.stopPropagation();
        if (confirming) {
          void submit();
          return;
        }
        setConfirming(true);
        if (resetRef.current) window.clearTimeout(resetRef.current);
        resetRef.current = window.setTimeout(() => setConfirming(false), 3500);
      }}
      className={`pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 active:scale-90 disabled:opacity-60 sm:h-8 sm:w-8 ${
        confirming
          ? "border-red-400/60 bg-red-600/80 text-white"
          : "border-white/15 bg-black/35 text-white/55 hover:text-white"
      } ${className}`}
    >
      <Flag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    </button>
  );
}

export default ReportButton;
