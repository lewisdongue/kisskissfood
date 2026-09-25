import { useEffect, useRef, useState, useMemo, type FC } from "react";
import { Gift } from "lucide-react";
import { getGiftImagePath } from "@/utils/giftImageMapping";

interface FlyingGiftAnimationProps {
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
    return { glow: "from-cyan-400 via-blue-500 to-teal-400", iconBg: "from-cyan-500 via-blue-600 to-teal-500", accent: "text-cyan-200", sparkle: "🫧", particle: "from-cyan-300 to-blue-400", trail: "bg-cyan-400" };
  }
  if (key === "infinite diamond") {
    return { glow: "from-sky-400 via-indigo-400 to-cyan-300", iconBg: "from-sky-500 via-indigo-500 to-cyan-400", accent: "text-sky-200", sparkle: "💎", particle: "from-sky-300 to-indigo-300", trail: "bg-sky-400" };
  }
  if (key === "the oracle") {
    return { glow: "from-purple-400 via-fuchsia-500 to-indigo-500", iconBg: "from-purple-500 via-fuchsia-500 to-indigo-500", accent: "text-purple-200", sparkle: "✨", particle: "from-fuchsia-300 to-indigo-300", trail: "bg-fuchsia-400" };
  }
  if (key === "cosmic sovereignty") {
    return { glow: "from-amber-400 via-orange-500 to-red-500", iconBg: "from-amber-500 via-orange-600 to-red-500", accent: "text-amber-200", sparkle: "🌌", particle: "from-amber-300 to-orange-400", trail: "bg-amber-400" };
  }
  if (key === "eternal legend") {
    return { glow: "from-emerald-400 via-yellow-400 to-amber-500", iconBg: "from-emerald-500 via-yellow-400 to-amber-500", accent: "text-emerald-200", sparkle: "👑", particle: "from-emerald-300 to-amber-400", trail: "bg-emerald-400" };
  }
  return { glow: "from-pink-400 via-purple-400 to-orange-400", iconBg: "from-pink-500 via-purple-500 to-orange-500", accent: "text-white/60", sparkle: "🎁", particle: "from-pink-400 to-purple-400", trail: "bg-pink-400" };
};

export const FlyingGiftAnimation: FC<FlyingGiftAnimationProps> = ({
  itemName,
  variant = "received",
  subtitle,
  detail,
  onComplete,
  imageUrl,
}) => {
  const [visible, setVisible] = useState(true);
  const [imageError, setImageError] = useState(false);
  const isReceived = variant === "received";
  const statusLabel = isReceived ? "Gift Received!" : "Sent Successfully!";
  const theme = getGiftTheme(itemName);

  const localImagePath = getGiftImagePath(itemName);
  const imageToDisplay = localImagePath || imageUrl;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const trailParticles = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({
      delay: `${i * 0.08}s`,
      offsetX: Math.random() * 160 - 80,
      offsetY: Math.random() * 160 - 80,
    })),
    []
  );

  const sparkles = useMemo(
    () => Array.from({ length: 24 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
    })),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onCompleteRef.current?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Flying gift container */}
      <div className="fga-fly">
        <div className="relative">
          {/* Outer glow */}
          <div className={`absolute -inset-16 bg-gradient-to-r ${theme.glow} rounded-full blur-[60px] opacity-50 animate-pulse`} />

          {/* Gift image/icon */}
          <div className={`relative bg-gradient-to-br ${theme.iconBg} rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10 fga-shimmer" />
            {imageToDisplay && !imageError ? (
              <img
                src={imageToDisplay}
                alt={itemName}
                className="relative z-10 w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] object-contain p-4"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="relative z-10 p-5">
                <Gift size={80} className="text-white drop-shadow-lg" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Gift name label */}
          <div className="absolute -bottom-[5.5rem] left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className="bg-black/90 backdrop-blur-xl px-7 py-3.5 rounded-2xl border border-white/25 shadow-2xl">
              <p className="text-white font-extrabold text-2xl tracking-tight">
                {theme.sparkle} {itemName}
              </p>
              <p className="text-white/80 text-sm text-center mt-1 font-medium">
                {subtitle || statusLabel}
              </p>
              {detail ? (
                <p className={`text-xs text-center mt-1 ${theme.accent}`}>
                  {detail}
                </p>
              ) : null}
            </div>
          </div>

          {/* Trail particles that scatter on arrival */}
          <div className="absolute inset-0">
            {trailParticles.map((p, i) => (
              <div
                key={i}
                className="absolute fga-particle"
                style={{
                  left: "50%",
                  top: "50%",
                  animationDelay: p.delay,
                  ["--tx" as string]: `${p.offsetX}px`,
                  ["--ty" as string]: `${p.offsetY}px`,
                }}
              >
                <div className={`w-3 h-3 bg-gradient-to-r ${theme.particle} rounded-full shadow-lg`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sparkle field */}
      <div className="absolute inset-0">
        {sparkles.map((s, i) => (
          <div
            key={i}
            className="absolute fga-sparkle-float"
            style={{ left: s.left, top: s.top, animationDelay: s.delay }}
          >
            <div className="text-yellow-400 text-xl">✨</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fga-fly-kf {
          0% {
            transform: translateX(-100vw) translateY(40vh) scale(0.4) rotate(-30deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          45% {
            transform: translateX(0) translateY(0) scale(1.15) rotate(3deg);
          }
          55% {
            transform: translateX(0) translateY(0) scale(1) rotate(-2deg);
          }
          75% {
            transform: translateX(0) translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateX(0) translateY(-30px) scale(0.9) rotate(0deg);
            opacity: 0;
          }
        }
        .fga-fly {
          animation: fga-fly-kf 3.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes fga-particle-kf {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity: 0; }
        }
        .fga-particle {
          animation: fga-particle-kf 1.2s ease-out 0.5s forwards;
          opacity: 0;
        }
        .fga-particle { opacity: 1; }

        @keyframes fga-sparkle-kf {
          0%, 100% { transform: translateY(0) scale(0); opacity: 0; }
          50% { transform: translateY(-40px) scale(1); opacity: 1; }
        }
        .fga-sparkle-float {
          animation: fga-sparkle-kf 2s ease-in-out infinite;
        }

        @keyframes fga-shimmer-kf {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .fga-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: fga-shimmer-kf 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
