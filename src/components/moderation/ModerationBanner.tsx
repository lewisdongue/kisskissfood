interface ModerationBannerProps {
  /** Ultra-short message, max 5 words. */
  message: string;
  className?: string;
}

/** Subtle red notice shown for a moment after a match is cut short. */
export function ModerationBanner({ message, className = "" }: ModerationBannerProps) {
  return (
    <div
      role="status"
      className={`pointer-events-none z-40 flex items-center justify-center rounded-xl border border-red-500/30 bg-red-950/70 px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-red-200 backdrop-blur-md sm:text-xs ${className}`}
    >
      {message}
    </div>
  );
}

export default ModerationBanner;
