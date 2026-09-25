import React, { useState, useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 200 
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const particles = Array.from({ length: 20 }, (_, index) => ({
    left: `${(index * 37 + 11) % 100}%`,
    top: `${(index * 61 + 17) % 100}%`,
    animationDelay: `${(index % 10) * 0.02}s`,
    animationDuration: `${0.3 + (index % 6) * 0.05}s`,
  }));

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration + 150);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`splash-screen ${isExiting ? "splash-exit" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(220, 38, 38, 0.9) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(185, 28, 28, 0.8) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(239, 68, 68, 0.6) 0%, transparent 60%),
          linear-gradient(135deg, #991b1b 0%, #dc2626 25%, #ef4444 50%, #dc2626 75%, #991b1b 100%)
        `,
        overflow: "hidden",
      }}
    >
      {/* Animated background particles */}
      <div className="splash-particles">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="splash-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
            }}
          />
        ))}
      </div>

      {/* Glowing rings */}
      <div className="splash-rings">
        <div className="splash-ring splash-ring-1" />
        <div className="splash-ring splash-ring-2" />
        <div className="splash-ring splash-ring-3" />
      </div>

      {/* Main content */}
      <div className="splash-content">
        {/* Logo with pulse animation */}
        <div className="splash-logo-container">
          <img
            src="/logo.webp"
            alt="Caakus"
            className="splash-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
          <div className="splash-logo-glow" />
        </div>

        {/* Brand name with shimmer */}
        <h1 className="splash-title">
          <span className="splash-title-text">Caakus</span>
        </h1>
      </div>

      <style>{`
        .splash-screen {
          animation: splashFadeIn 0.1s ease-out forwards;
        }

        .splash-exit {
          animation: splashFadeOut 0.15s ease-in forwards;
        }

        @keyframes splashFadeIn {
          from {
            opacity: 0;
            transform: scale(1.05);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes splashFadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }

        .splash-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .splash-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: particleFloat 0.5s ease-out forwards;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4);
        }

        @keyframes particleFloat {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px) scale(1);
          }
          100% {
            opacity: 0.6;
            transform: translateY(-30px) scale(0.8);
          }
        }

        .splash-rings {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .splash-ring {
          position: absolute;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: ringPulse 0.4s ease-out forwards;
        }

        .splash-ring-1 {
          width: 200px;
          height: 200px;
          animation-delay: 0s;
        }

        .splash-ring-2 {
          width: 300px;
          height: 300px;
          animation-delay: 0.05s;
        }

        .splash-ring-3 {
          width: 400px;
          height: 400px;
          animation-delay: 0.1s;
        }

        @keyframes ringPulse {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          z-index: 10;
          animation: contentPop 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes contentPop {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .splash-logo-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .splash-logo {
          width: 160px;
          height: 160px;
          border-radius: 32px;
          object-fit: contain;
          animation: logoPulse 0.3s ease-in-out;
          filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.5))
                  drop-shadow(0 0 60px rgba(255, 255, 255, 0.3))
                  drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
        }

        @keyframes logoPulse {
          0% {
            transform: scale(0.5) rotate(-10deg);
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        .splash-logo-glow {
          position: absolute;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: glowPulse 0.3s ease-in-out;
          pointer-events: none;
        }

        @keyframes glowPulse {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
        }

        .splash-title {
          margin: 0;
          font-size: clamp(56px, 15vw, 96px);
          font-weight: 900;
          letter-spacing: -2px;
          text-transform: uppercase;
          animation: titleSlide 0.2s ease-out forwards;
        }

        @keyframes titleSlide {
          0% {
            opacity: 0;
            transform: translateY(30px);
            letter-spacing: 20px;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: -2px;
          }
        }

        .splash-title-text {
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #fef2f2 20%,
            #ffffff 40%,
            #fecaca 60%,
            #ffffff 80%,
            #fef2f2 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerText 0.5s linear;
          text-shadow: none;
          filter: drop-shadow(0 4px 20px rgba(255, 255, 255, 0.3));
        }

        @keyframes shimmerText {
          0% {
            background-position: -100% center;
          }
          100% {
            background-position: 100% center;
          }
        }

        @media (max-width: 640px) {
          .splash-logo {
            width: 120px;
            height: 120px;
            border-radius: 24px;
          }

          .splash-logo-glow {
            width: 160px;
            height: 160px;
          }

          .splash-ring-1 {
            width: 150px;
            height: 150px;
          }

          .splash-ring-2 {
            width: 220px;
            height: 220px;
          }

          .splash-ring-3 {
            width: 290px;
            height: 290px;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
