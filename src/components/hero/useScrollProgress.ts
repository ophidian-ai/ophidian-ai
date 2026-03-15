"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Binds GSAP ScrollTrigger to a container and exposes scroll progress
 * as a ref (0-1). Uses a ref instead of state to avoid React re-renders
 * on every scroll tick -- the canvas draw loop reads progressRef.current directly.
 *
 * @param containerRef - Ref to the scroll container element (height: 300vh)
 */
export function useScrollProgress(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const progressRef = useRef(0);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    triggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5, // slight smoothing for buttery feel
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => {
      triggerRef.current?.kill();
      triggerRef.current = null;
    };
  }, [containerRef]);

  return { progressRef };
}
