"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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
  { id: 1, x: "2%", y: "8%", width: 18, height: 10, rotation: 15, delay: 0, duration: 16, side: "left" },
  { id: 2, x: "4%", y: "22%", width: 14, height: 8, rotation: -30, delay: 4, duration: 14, side: "right" },
  { id: 3, x: "3%", y: "45%", width: 22, height: 6, rotation: 40, delay: 2, duration: 18, side: "left" },
  { id: 4, x: "5%", y: "62%", width: 16, height: 12, rotation: -12, delay: 6, duration: 13, side: "right" },
  { id: 5, x: "2%", y: "78%", width: 20, height: 8, rotation: 25, delay: 1, duration: 15, side: "left" },
  { id: 6, x: "6%", y: "35%", width: 12, height: 14, rotation: -45, delay: 3, duration: 17, side: "right" },
];

/**
 * Subtle floating serpent-skin particles for non-homepage pages.
 * Inherits the aesthetic from HeroAtmosphere but always-on, lighter,
 * and purely CSS-driven (no GSAP dependency).
 *
 * Hidden on mobile and when prefers-reduced-motion is active.
 */
export function FloatingParticles() {
  const pathname = usePathname();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Homepage has HeroAtmosphere -- don't double up
  if (pathname === "/" || prefersReducedMotion) return null;

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
            opacity: 0.08,
            border: "1px solid rgba(57, 255, 20, 0.2)",
            boxShadow: "0 0 6px rgba(57, 255, 20, 0.1)",
            borderRadius: 2,
            transform: `rotate(${p.rotation}deg)`,
            animation: `fragment-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
