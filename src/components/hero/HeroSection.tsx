"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useFrameSequence } from "@/components/hero/useFrameSequence";

const TOTAL_FRAMES = 121;

/**
 * OphidianAI homepage hero.
 *
 * Layout: 280vh scroll wrapper with sticky 100vh section.
 * The serpent frame sequence plays as you scroll through the wrapper.
 * Simultaneously, the container scales down and gains rounded corners
 * — "shrinking to a card". Headline fades out as shrink progresses.
 */
export function HeroSection() {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const mediaRef    = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

  const totalFrames = isMobile ? 80 : TOTAL_FRAMES;
  const { images, isReady } = useFrameSequence("/frames/serpent/frame-", totalFrames);

  // Canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = 1280;
    canvas.height = 720;
  }, []);

  // Draw frame 0 as soon as the sequence is ready (no scroll event needed)
  useEffect(() => {
    if (!isReady || !canvasRef.current || images.length === 0) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx || !images[0]) return;
    ctx.clearRect(0, 0, 1280, 720);
    ctx.drawImage(images[0], 0, 0, 1280, 720);
  }, [isReady, images]);

  // Combined: draw frames + shrink container, both driven by scroll
  useEffect(() => {
    let lastFrame = -1;

    function onScroll() {
      const wrapper  = wrapperRef.current;
      const media    = mediaRef.current;
      const canvas   = canvasRef.current;
      const vignette = vignetteRef.current;
      const content  = contentRef.current;
      if (!wrapper || !media) return;

      const rect        = wrapper.getBoundingClientRect();
      const wh          = window.innerHeight;
      const totalScroll = wrapper.offsetHeight - wh;
      const scrolled    = -rect.top;
      if (totalScroll <= 0) return;

      // Frame progress: full wrapper drives the whole sequence
      const frameProgress  = Math.max(0, Math.min(1, scrolled / totalScroll));
      // Shrink progress: first 55% of the wrapper
      const shrinkProgress = Math.max(0, Math.min(1, scrolled / (totalScroll * 0.55)));

      // Draw the current frame
      if (canvas && images.length > 0) {
        const ctx        = canvas.getContext("2d");
        const frameIndex = Math.min(Math.floor(frameProgress * (images.length - 1)), images.length - 1);
        if (ctx && frameIndex !== lastFrame && images[frameIndex]) {
          ctx.clearRect(0, 0, 1280, 720);
          ctx.drawImage(images[frameIndex], 0, 0, 1280, 720);
          lastFrame = frameIndex;
        }
      }

      // Shrink + margin the media container
      if (shrinkProgress > 0) {
        const br = shrinkProgress * 20;
        const mx = shrinkProgress * 4;
        const my = shrinkProgress * 3;
        media.style.transform    = `scale(${1 - shrinkProgress * 0.28})`;
        media.style.borderRadius = `${br}px`;
        media.style.margin       = `${my}% ${mx}%`;
        media.style.width        = `${100 - mx * 2}%`;
        media.style.height       = `${100 - my * 2}%`;
        if (vignette) vignette.style.opacity = String(1 - shrinkProgress * 0.85);
        if (content)  content.style.opacity  = String(1 - shrinkProgress * 2);
      } else {
        media.style.transform    = "";
        media.style.borderRadius = "";
        media.style.margin       = "";
        media.style.width        = "";
        media.style.height       = "";
        if (vignette) vignette.style.opacity = "";
        if (content)  content.style.opacity  = "";
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [images]);

  return (
    <div ref={wrapperRef} style={{ height: "280vh", position: "relative" }}>
      <section
        className="sticky top-0 h-screen min-h-[720px] overflow-hidden flex items-end"
        style={{ padding: "0 48px 80px", background: "#000" }}
      >
        {/* Serpent canvas — shrinks to card on scroll */}
        <div
          ref={mediaRef}
          className="absolute inset-0 overflow-hidden"
          style={{ willChange: "transform, border-radius", transition: "none" }}
        >
          {/* Atmospheric forest bg underneath the serpent */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-bg.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.45 }}
          />

          {/* Poster frame shown before canvas is ready */}
          {!isReady && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/frames/serpent/frame-0001.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ mixBlendMode: "lighten", opacity: 0.85 }}
            />
          )}

          {/* Live canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: "cover",
              mixBlendMode: "lighten",
              opacity: isReady ? 0.85 : 0,
              transition: "opacity 0.4s",
            }}
          />

          {/* Radial tint */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 65% at 65% 50%, rgba(6,18,5,0.4) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Vignette — darkens edges, fades on scroll */}
        <div
          ref={vignetteRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background: `
              linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.05) 100%),
              linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 55%)
            `,
          }}
        />

        {/* Content — fades out as shrink progresses */}
        <div
          ref={contentRef}
          className="relative max-w-[620px]"
          style={{ zIndex: 10, willChange: "opacity" }}
        >
          <p
            className="text-[11px] font-medium tracking-[0.2em] uppercase mb-5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            AI Agency — Columbus, Indiana &nbsp;
            <span className="text-primary">●</span>
            &nbsp; Est. 2026
          </p>

          <h1
            className="font-extrabold text-white leading-none tracking-tight"
            style={{ fontSize: "clamp(44px, 7vw, 88px)", letterSpacing: "-0.03em" }}
          >
            We build the<br />
            <em className="not-italic text-primary">tools</em> that run<br />
            your business.
          </h1>

          <p
            className="mt-6 font-light leading-relaxed"
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "480px",
              lineHeight: "1.75",
            }}
          >
            From custom websites to AI integrations — we design, build, and deploy
            everything your business needs to compete in the next decade.
          </p>

          <div className="mt-10 flex gap-4 items-center">
            <Link
              href="/contact"
              className="inline-block bg-primary text-black text-[12px] font-bold tracking-[0.08em] uppercase px-7 py-[14px] rounded-full transition-opacity hover:opacity-85 whitespace-nowrap"
            >
              Start a Project
            </Link>
            <Link
              href="/portfolio"
              className="text-[13px] font-normal tracking-[0.04em] flex items-center gap-2 transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              See our work <span>→</span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ zIndex: 10, opacity: 0.3, animation: "scrollPulse 2s ease-in-out infinite" }}
        >
          <span className="text-[10px] tracking-[0.18em] uppercase text-white">Scroll</span>
          <div
            className="w-px h-10"
            style={{ background: "linear-gradient(to bottom, #fff, transparent)" }}
          />
        </div>
      </section>
    </div>
  );
}
