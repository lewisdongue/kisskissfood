import { useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// SHARED PARTICLE CANVAS - DEEP SPACE ANIMATED BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  pulse: number;
  angle: number;
}

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Significantly reduced particle counts — mobile gets 20, desktop 60
    const particleCount = isMobile ? 20 : 60;

    let resizeTimer: ReturnType<typeof setTimeout>;
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }, 150);
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener("resize", resize, { passive: true });

    const colors = [
      "#3b82f6",
      "#9333ea",
      "#ec4899",
      "#22d3ee",
    ];

    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * (isMobile ? 1.5 : 2.5) + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
    }));

    // Throttle mouse/touch updates — no need to update every pixel
    let lastMouseUpdate = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseUpdate < 50) return;
      lastMouseUpdate = now;
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastMouseUpdate < 50) return;
      lastMouseUpdate = now;
      mouseRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        active: true,
      };
    };

    // Pause RAF when tab is hidden to save battery/CPU
    const handleVisibilityChange = () => {
      pausedRef.current = document.hidden;
      if (!document.hidden && rafRef.current === 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Reusable gradient (recreated only on resize, not every frame)
    let cachedGradient: CanvasGradient | null = null;
    let gradientW = 0;
    let gradientH = 0;

    const getGradient = () => {
      if (cachedGradient && gradientW === canvas.width && gradientH === canvas.height) {
        return cachedGradient;
      }
      gradientW = canvas.width;
      gradientH = canvas.height;
      const g = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      );
      g.addColorStop(0, "rgba(30, 58, 138, 0.15)");
      g.addColorStop(1, "rgba(2, 6, 23, 0)");
      cachedGradient = g;
      return g;
    };

    const animate = () => {
      if (pausedRef.current) {
        rafRef.current = 0;
        return;
      }

      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = getGradient();
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.angle += 0.002;
        p.x += p.vx + Math.cos(p.angle) * 0.2;
        p.y += p.vy + Math.sin(p.angle) * 0.2;

        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (200 - dist) / 2000;
            p.vx -= dx * force;
            p.vy -= dy * force;
          }
        }

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        p.pulse += 0.02;
        const opacity = 0.4 + Math.sin(p.pulse) * 0.2;

        ctx.beginPath();
        ctx.arc(
          p.x,
          p.y,
          p.size * (1 + Math.sin(p.pulse) * 0.3),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.fill();

        if (!isMobile) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
        }
      });

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ touchAction: "none" }}
    />
  );
};
