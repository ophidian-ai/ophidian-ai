"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  src: string;
  x: string;
  y: string;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
  side: "left" | "right";
}

// 8 AI-generated serpent scale fragments (4 dormant, 4 awakened with green glow)
const PARTICLES: Particle[] = [
  // Left side -- mix of dormant (1-4) and awakened (5-8)
  { id: 1, src: "/particles/scale-1.png", x: "1%", y: "8%", size: 45, rotation: 15, delay: 0, duration: 16, side: "left" },
  { id: 5, src: "/particles/scale-5.png", x: "3%", y: "32%", size: 35, rotation: 40, delay: 2, duration: 18, side: "left" },
  { id: 3, src: "/particles/scale-3.png", x: "2%", y: "58%", size: 40, rotation: -20, delay: 5, duration: 15, side: "left" },
  { id: 7, src: "/particles/scale-7.png", x: "4%", y: "82%", size: 30, rotation: -18, delay: 7, duration: 14, side: "left" },
  // Right side
  { id: 2, src: "/particles/scale-2.png", x: "2%", y: "15%", size: 38, rotation: -30, delay: 4, duration: 14, side: "right" },
  { id: 6, src: "/particles/scale-6.png", x: "3%", y: "45%", size: 42, rotation: -12, delay: 1, duration: 17, side: "right" },
  { id: 4, src: "/particles/scale-4.png", x: "1%", y: "68%", size: 36, rotation: 25, delay: 3, duration: 13, side: "right" },
  { id: 8, src: "/particles/scale-8.png", x: "4%", y: "90%", size: 32, rotation: 10, delay: 6, duration: 16, side: "right" },
];

/**
 * Floating serpent-skin scale fragments across all pages.
 * Uses AI-generated scale textures from Nano Banana 2 (Gemini API)
 * with transparent backgrounds. Mix of dormant (dark) and awakened
 * (venom-green glow) fragments.
 *
 * Hidden on mobile and when prefers-reduced-motion is active.
 */
export function FloatingParticles() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <div
      className="hidden md:block pointer-events-none"
      style={{ position: "fixed", inset: 0, zIndex: 2 }}
    >
      {PARTICLES.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.id}
          src={p.src}
          alt=""
          style={{
            position: "absolute",
            [p.side === "left" ? "left" : "right"]: p.x,
            top: p.y,
            width: p.size,
            height: "auto",
            opacity: 0.15,
            transform: `rotate(${p.rotation}deg)`,
            animation: `fragment-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            filter: "drop-shadow(0 0 4px rgba(57, 255, 20, 0.2))",
          }}
        />
      ))}
    </div>
  );
}
