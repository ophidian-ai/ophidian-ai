"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroTextOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion?: boolean;
}

/**
 * Headline and tagline overlay for the scroll-scrub hero.
 * Opacity is driven by GSAP ScrollTrigger:
 *   0-5% scroll:  fade in (opacity 0 -> 1)
 *   5-35% scroll: hold (opacity 1)
 *   35-50% scroll: fade out (opacity 1 -> 0)
 *
 * When prefers-reduced-motion is active, text displays at full opacity
 * with no animation.
 */
export function HeroTextOverlay({ containerRef, reducedMotion = false }: HeroTextOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !containerRef.current || !overlayRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
    });

    // Fade in: 0% -> 5% of total scroll
    tl.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 5 }, // duration = percentage of scroll
      0 // start at 0%
    );

    // Hold: 5% -> 35% (implicit -- no changes)

    // Fade out: 35% -> 50%
    tl.to(
      overlayRef.current,
      { opacity: 0, duration: 15 },
      35 // start at 35%
    );

    return () => {
      tl.kill();
    };
  }, [containerRef, reducedMotion]);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
      style={{ opacity: reducedMotion ? 1 : 0 }}
    >
      <p className="text-sm uppercase tracking-[0.3em] text-white/80 mb-4">
        Intelligence. Engineered.
      </p>
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center max-w-4xl leading-tight">
        AI that works for your business
      </h1>
    </div>
  );
}
