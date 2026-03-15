"use client";

import { useEffect, useState } from "react";

/**
 * Full-page fixed video background with floating serpent scale particles.
 * Sits behind all content at z-index 0. Pure black video with glowing
 * biomechanical scale fragments drifting in zero gravity.
 *
 * - Autoplay, muted, looping
 * - Hidden on mobile (saves bandwidth + battery)
 * - Falls back to static image when prefers-reduced-motion is active
 * - Poster image shows while video loads
 */
export function VideoBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Reduced motion: show static reference frame
  if (prefersReducedMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage: "url(/video/particle-bg-poster.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.4,
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none hidden md:block"
      style={{ zIndex: 0 }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/video/particle-bg-poster.png"
        className="w-full h-full object-cover"
        style={{ opacity: 0.4 }}
      >
        <source src="/video/particle-bg.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
