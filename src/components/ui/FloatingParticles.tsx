"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: string;
  y: string;
  width: number;
  height: number;
  rotation: number;
  delay: number;
  duration: number;
  side: "left" | "right";
}

const PARTICLES: Particle[] = [
  // Left side
  { id: 1, x: "2%", y: "8%", width: 18, height: 10, rotation: 15, delay: 0, duration: 16, side: "left" },
  { id: 3, x: "3%", y: "35%", width: 22, height: 6, rotation: 40, delay: 2, duration: 18, side: "left" },
  { id: 5, x: "2%", y: "58%", width: 20, height: 8, rotation: 25, delay: 1, duration: 15, side: "left" },
  { id: 7, x: "4%", y: "82%", width: 15, height: 9, rotation: -18, delay: 5, duration: 14, side: "left" },
  { id: 9, x: "6%", y: "15%", width: 10, height: 6, rotation: 55, delay: 7, duration: 19, side: "left" },
  { id: 11, x: "1%", y: "48%", width: 8, height: 5, rotation: -8, delay: 3, duration: 12, side: "left" },
  // Right side
  { id: 2, x: "4%", y: "22%", width: 14, height: 8, rotation: -30, delay: 4, duration: 14, side: "right" },
  { id: 4, x: "5%", y: "52%", width: 16, height: 12, rotation: -12, delay: 6, duration: 13, side: "right" },
  { id: 6, x: "3%", y: "72%", width: 12, height: 14, rotation: -45, delay: 3, duration: 17, side: "right" },
  { id: 8, x: "2%", y: "5%", width: 17, height: 7, rotation: 32, delay: 2, duration: 16, side: "right" },
  { id: 10, x: "5%", y: "40%", width: 11, height: 8, rotation: -22, delay: 8, duration: 15, side: "right" },
  { id: 12, x: "3%", y: "90%", width: 13, height: 6, rotation: 10, delay: 1, duration: 13, side: "right" },
];

/**
 * Subtle floating serpent-skin particles for non-homepage pages.
 * Inherits the aesthetic from HeroAtmosphere but always-on, lighter,
 * and purely CSS-driven (no GSAP dependency).
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
        <div
          key={p.id}
          style={{
            position: "absolute",
            [p.side === "left" ? "left" : "right"]: p.x,
            top: p.y,
            width: p.width,
            height: p.height,
            opacity: 0.18,
            border: "1px solid rgba(57, 255, 20, 0.3)",
            boxShadow: "0 0 8px rgba(57, 255, 20, 0.15)",
            borderRadius: 2,
            transform: `rotate(${p.rotation}deg)`,
            animation: `fragment-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
