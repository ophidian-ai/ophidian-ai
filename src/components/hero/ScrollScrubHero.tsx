"use client";

import { useEffect, useRef, useState } from "react";
import { useFrameSequence } from "./useFrameSequence";
import { useScrollProgress } from "./useScrollProgress";
import { HeroTextOverlay } from "./HeroTextOverlay";
import { HeroAtmosphere } from "./HeroAtmosphere";

// Frame counts -- from flow-iteration-3.mp4 extraction (15fps desktop, 10fps mobile)
const DESKTOP_FRAMES = 121;
const MOBILE_FRAMES = 80;

/**
 * Scroll-scrub hero component for the OphidianAI homepage.
 *
 * Renders a frame sequence to a canvas, driven by scroll position via
 * GSAP ScrollTrigger. Includes text overlay, poster fallback, mobile
 * optimization, reduced-motion support, and no-JS fallback.
 */
export function ScrollScrubHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Reduced motion detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const totalFrames = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;

  // Frame preloading
  const { images, isReady, posterSrc } = useFrameSequence(
    "/frames/serpent/frame-",
    totalFrames
  );

  // Scroll progress (ref-based, no re-renders)
  const { progressRef } = useScrollProgress(containerRef);

  // Atmosphere activation (triggers at 95% scroll progress)
  const [atmosphereActive, setAtmosphereActive] = useState(false);

  // Canvas resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Canvas draw loop -- reads progressRef.current directly, no React state
  useEffect(() => {
    if (!isReady || !canvasRef.current || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let lastFrame = -1;

    function render() {
      const frameIndex = Math.min(
        Math.floor(progressRef.current * (images.length - 1)),
        images.length - 1
      );

      // Only redraw if frame changed
      if (frameIndex !== lastFrame && images[frameIndex]) {
        const img = images[frameIndex];

        // Contain-fit with scale-back: keeps serpent centered with breathing room
        // 0.65 = serpent fills ~65% of viewport height (adjust to taste)
        const SERPENT_SCALE = 0.65;
        const containScale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        ) * SERPENT_SCALE;
        const w = img.width * containScale;
        const h = img.height * containScale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx!.clearRect(0, 0, canvas.width, canvas.height);
        ctx!.drawImage(img, x, y, w, h);
        lastFrame = frameIndex;
      }

      // Activate atmosphere when scroll passes 95%
      if (progressRef.current >= 0.95 && !atmosphereActive) {
        setAtmosphereActive(true);
      }

      rafId = requestAnimationFrame(render);
    }

    render();
    return () => cancelAnimationFrame(rafId);
  }, [isReady, images, progressRef, prefersReducedMotion, atmosphereActive]);

  // Reduced motion: show static final frame
  if (prefersReducedMotion) {
    return (
      <div className="relative w-full h-screen">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterSrc}
          alt="OphidianAI -- Intelligence. Engineered."
          className="w-full h-full object-cover"
        />
        <HeroTextOverlay containerRef={containerRef} reducedMotion />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="scroll-scrub-container relative"
      style={{ height: isMobile ? "200vh" : "300vh" }}
    >
      {/* Poster image (visible until canvas is ready) */}
      {!isReady && (
        <div className="sticky top-0 h-screen w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterSrc}
            alt="OphidianAI"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Canvas (visible when frames are loaded) */}
      <canvas
        ref={canvasRef}
        className={`sticky top-0 h-screen w-full ${isReady ? "" : "hidden"}`}
      />

      {/* Text overlay */}
      <HeroTextOverlay containerRef={containerRef} />

      {/* Post-scrub atmosphere (checkpoint: "hybrid" vs "full" -- Eric decides) */}
      <HeroAtmosphere variant="hybrid" active={atmosphereActive} />

      {/* No-JS fallback */}
      <noscript>
        <div className="h-screen w-full relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/frames/serpent/frame-0001.webp"
            alt="OphidianAI -- Intelligence. Engineered."
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/80 mb-4">
              Intelligence. Engineered.
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white text-center">
              AI that works for your business
            </h1>
          </div>
        </div>
      </noscript>
    </div>
  );
}
