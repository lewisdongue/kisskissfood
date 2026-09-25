import { useEffect, useRef, useState, useMemo } from "react";
import { Gift } from "lucide-react";
import { getGiftImagePath } from "@/utils/giftImageMapping";

interface GiftFloatingAnimationProps {
  itemName: string;
  variant?: "sent" | "received";
  subtitle?: string;
  detail?: string;
  onComplete?: () => void;
  imageUrl?: string | null;
}

const getGiftTheme = (itemName: string) => {
  const key = itemName.toLowerCase();
  if (key === "the siren's call") {
    return { glow: "from-cyan-400 via-blue-500 to-teal-400", iconBg: "from-cyan-500 via-blue-600 to-teal-500", accent: "text-cyan-200", sparkle: "🫧", ring: "ring-cyan-400/40" };
  }
  if (key === "infinite diamond") {
    return { glow: "from-sky-400 via-indigo-400 to-cyan-300", iconBg: "from-sky-500 via-indigo-500 to-cyan-400", accent: "text-sky-200", sparkle: "💎", ring: "ring-sky-400/40" };
  }
  if (key === "the oracle") {
    return { glow: "from-purple-400 via-fuchsia-500 to-indigo-500", iconBg: "from-purple-500 via-fuchsia-500 to-indigo-500", accent: "text-purple-200", sparkle: "✨", ring: "ring-fuchsia-400/40" };
  }
  if (key === "cosmic sovereignty") {
    return { glow: "from-amber-400 via-orange-500 to-red-500", iconBg: "from-amber-500 via-orange-600 to-red-500", accent: "text-amber-200", sparkle: "🌌", ring: "ring-amber-400/40" };
  }
  if (key === "eternal legend") {
    return { glow: "from-emerald-400 via-yellow-400 to-amber-500", iconBg: "from-emerald-500 via-yellow-400 to-amber-500", accent: "text-emerald-200", sparkle: "👑", ring: "ring-emerald-400/40" };
  }
  return { glow: "from-pink-400 via-purple-400 to-orange-400", iconBg: "from-pink-500 via-purple-500 to-orange-500", accent: "text-white/60", sparkle: "🎁", ring: "ring-pink-400/40" };
};

export const GiftFloatingAnimation: React.FC<GiftFloatingAnimationProps> = ({
  itemName,
  variant = "sent",
  subtitle,
  detail,
  onComplete,
  imageUrl,
}) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [imageError, setImageError] = useState(false);
  const statusLabel = variant === "received" ? "Gift Received!" : "Gift Sent!";
  const theme = getGiftTheme(itemName);

  const localImagePath = getGiftImagePath(itemName);
  const imageToDisplay = localImagePath || imageUrl;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const sparklePositions = useMemo(
    () => Array.from({ length: 16 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      size: Math.random() > 0.5 ? "w-3 h-3" : "w-2 h-2",
    })),
    []
  );

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 400);
    const exitTimer = setTimeout(() => setPhase("exit"), 4200);
    const doneTimer = setTimeout(() => {
      onCompleteRef.current?.();
    }, 5000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  const phaseClass =
    phase === "enter"
      ? "gfa-enter"
      : phase === "hold"
        ? "gfa-hold"
        : "gfa-exit";

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
      {/* Radial glow behind gift */}
      <div className={`absolute w-[340px] h-[340px] bg-gradient-radial ${theme.glow} rounded-full blur-[80px] opacity-50 gfa-glow`} />

      {/* Main gift container */}
      <div className={`relative flex flex-col items-center ${phaseClass}`}>
        {/* Rotating ring */}
        <div className={`absolute -inset-6 rounded-full border-2 border-dashed ${theme.ring} gfa-ring`} />

        {/* Gift image/icon card */}
        <div className={`relative bg-gradient-to-br ${theme.iconBg} rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-2 ${theme.ring} overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10 gfa-shimmer" />
          {imageToDisplay && !imageError ? (
            <img
              src={imageToDisplay}
              alt={itemName}
              className="relative z-10 w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] object-contain p-4"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="relative z-10 p-6">
              <Gift size={100} className="text-white drop-shadow-lg" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Label card below */}
        <div className="mt-6 bg-black/85 backdrop-blur-xl px-8 py-4 rounded-2xl border border-white/20 shadow-2xl max-w-[90vw]">
          <p className="text-white font-extrabold text-2xl text-center tracking-tight">
            {theme.sparkle} {itemName}
          </p>
          <p className="text-white/80 text-sm text-center mt-1.5 font-medium">
            {subtitle || statusLabel}
          </p>
          {detail ? (
            <p className={`text-xs text-center mt-1 ${theme.accent}`}>
              {detail}
            </p>
          ) : null}
        </div>
      </div>

      {/* Floating sparkle particles */}
      <div className="absolute inset-0 overflow-hidden">
        {sparklePositions.map((pos, i) => (
          <div
            key={i}
            className="absolute gfa-sparkle"
            style={{ left: pos.left, top: pos.top, animationDelay: pos.delay }}
          >
            <div className={`${pos.size} bg-yellow-300 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)]`} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes gfa-enter-kf {
          0% { transform: scale(0.3) translateY(60px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes gfa-hold-kf {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.04) translateY(-12px); }
        }
        @keyframes gfa-exit-kf {
          0% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(0.6) translateY(-80px); opacity: 0; }
        }
        .gfa-enter { animation: gfa-enter-kf 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .gfa-hold  { animation: gfa-hold-kf 3.8s ease-in-out infinite; }
        .gfa-exit  { animation: gfa-exit-kf 0.8s ease-in forwards; }

        @keyframes gfa-glow-kf {
          0%, 100% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }
        .gfa-glow { animation: gfa-glow-kf 2s ease-in-out infinite; }

        @keyframes gfa-ring-kf {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .gfa-ring { animation: gfa-ring-kf 8s linear infinite; }

        @keyframes gfa-shimmer-kf {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .gfa-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: gfa-shimmer-kf 2s ease-in-out infinite;
        }

        @keyframes gfa-sparkle-kf {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        }
        .gfa-sparkle { animation: gfa-sparkle-kf 1.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
