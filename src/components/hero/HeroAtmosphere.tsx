"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Fragment {
  id: number;
  x: string; // CSS left/right position
  y: string; // CSS top position
  width: number;
  height: number;
  rotation: number;
  delay: number; // animation delay in seconds
  duration: number; // animation cycle duration in seconds
  speed?: number; // parallax speed multiplier (full-c only)
  side: "left" | "right";
}

// Hybrid fragments: subtle, few, margins only
const HYBRID_FRAGMENTS: Fragment[] = [
  { id: 1, x: "3%", y: "15%", width: 24, height: 14, rotation: 15, delay: 0, duration: 12, side: "left" },
  { id: 2, x: "5%", y: "55%", width: 18, height: 10, rotation: -25, delay: 3, duration: 10, side: "right" },
  { id: 3, x: "2%", y: "75%", width: 30, height: 8, rotation: 40, delay: 6, duration: 14, side: "left" },
  { id: 4, x: "4%", y: "35%", width: 20, height: 12, rotation: -10, delay: 2, duration: 11, side: "right" },
];

// Full-C fragments: more, larger, parallax-driven
const FULL_C_FRAGMENTS: Fragment[] = [
  { id: 1, x: "3%", y: "10%", width: 36, height: 18, rotation: 12, delay: 0, duration: 10, speed: 0.3, side: "left" },
  { id: 2, x: "6%", y: "25%", width: 28, height: 14, rotation: -30, delay: 1, duration: 12, speed: 0.5, side: "right" },
  { id: 3, x: "2%", y: "40%", width: 44, height: 10, rotation: 22, delay: 2, duration: 9, speed: 0.2, side: "left" },
  { id: 4, x: "4%", y: "55%", width: 32, height: 16, rotation: -15, delay: 3, duration: 14, speed: 0.6, side: "right" },
  { id: 5, x: "5%", y: "65%", width: 24, height: 20, rotation: 45, delay: 0.5, duration: 11, speed: 0.4, side: "left" },
  { id: 6, x: "3%", y: "78%", width: 40, height: 12, rotation: -8, delay: 4, duration: 13, speed: 0.35, side: "right" },
  { id: 7, x: "7%", y: "20%", width: 20, height: 22, rotation: 35, delay: 1.5, duration: 10, speed: 0.55, side: "left" },
  { id: 8, x: "4%", y: "85%", width: 30, height: 14, rotation: -20, delay: 2.5, duration: 12, speed: 0.25, side: "right" },
  { id: 9, x: "2%", y: "48%", width: 26, height: 10, rotation: 18, delay: 3.5, duration: 15, speed: 0.45, side: "left" },
  { id: 10, x: "5%", y: "92%", width: 34, height: 8, rotation: -38, delay: 1, duration: 11, speed: 0.3, side: "right" },
];

interface HeroAtmosphereProps {
  variant: "hybrid" | "full";
  active: boolean;
}

/**
 * Post-scrub floating fragments that persist as page-wide atmospheric accents.
 *
 * Hybrid (A+C): 4 subtle fragments in page margins, CSS float animation, 10-15% opacity.
 * Full C: 10 fragments, larger, 20-25% opacity, GSAP parallax on scroll.
 *
 * Both variants are hidden on mobile and when prefers-reduced-motion is active.
 */
export function HeroAtmosphere({ variant, active }: HeroAtmosphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Full-C parallax: GSAP-driven scroll response
  useEffect(() => {
    if (variant !== "full" || !active || prefersReducedMotion || !containerRef.current) return;

    const fragments = containerRef.current.querySelectorAll<HTMLDivElement>("[data-speed]");
    const triggers: ScrollTrigger[] = [];

    fragments.forEach((el) => {
      const speed = parseFloat(el.dataset.speed || "0.3");
      const trig = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const y = self.progress * speed * -200;
          const x = Math.sin(self.progress * Math.PI * 2) * speed * 30;
          el.style.transform = `translate(${x}px, ${y}px) rotate(${parseFloat(el.dataset.rotation || "0") + self.progress * 20}deg)`;
        },
      });
      triggers.push(trig);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [variant, active, prefersReducedMotion]);

  if (prefersReducedMotion || !active) return null;

  const fragments = variant === "hybrid" ? HYBRID_FRAGMENTS : FULL_C_FRAGMENTS;
  const baseOpacity = variant === "hybrid" ? 0.12 : 0.22;

  return (
    <div
      ref={containerRef}
      className="hero-atmosphere hidden md:block pointer-events-none"
      style={{ position: "fixed", inset: 0, zIndex: 5 }}
    >
      {fragments.map((frag) => (
        <div
          key={frag.id}
          data-speed={frag.speed}
          data-rotation={frag.rotation}
          style={{
            position: "absolute",
            [frag.side === "left" ? "left" : "right"]: frag.x,
            top: frag.y,
            width: frag.width,
            height: frag.height,
            opacity: baseOpacity,
            border: "1px solid rgba(57, 255, 20, 0.3)",
            boxShadow: "0 0 8px rgba(57, 255, 20, 0.15)",
            borderRadius: 3,
            transform: `rotate(${frag.rotation}deg)`,
            animation:
              variant === "hybrid"
                ? `fragment-float ${frag.duration}s ease-in-out ${frag.delay}s infinite`
                : undefined,
          }}
        />
      ))}
    </div>
  );
}
