"use client";

import { useEffect, useRef, useState } from "react";
import { useFrameSequence } from "@/components/hero/useFrameSequence";
import { useScrollProgress } from "@/components/hero/useScrollProgress";

const TOTAL_FRAMES = 121;

export function ShowcaseSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

  const totalFrames = isMobile ? 80 : TOTAL_FRAMES;
  const { images, isReady } = useFrameSequence("/frames/serpent/frame-", totalFrames);
  const { progressRef }     = useScrollProgress(wrapperRef);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = 1280;
    canvas.height = 720;
  }, []);

  // Draw loop
  useEffect(() => {
    if (!isReady || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let lastFrame = -1;

    function render() {
      const frameIndex = Math.min(
        Math.floor(progressRef.current * (images.length - 1)),
        images.length - 1
      );
      if (frameIndex !== lastFrame && images[frameIndex]) {
        ctx!.clearRect(0, 0, 1280, 720);
        ctx!.drawImage(images[frameIndex], 0, 0, 1280, 720);
        lastFrame = frameIndex;
      }
      rafId = requestAnimationFrame(render);
    }
    render();
    return () => cancelAnimationFrame(rafId);
  }, [isReady, images, progressRef]);

  return (
    <div ref={wrapperRef} style={{ height: "350vh", position: "relative" }}>
      <section
        className="sticky top-0 h-screen flex items-center overflow-hidden"
        style={{ background: "#000" }}
      >
        {/* Serpent canvas — right side */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: "-4%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "58%",
            zIndex: 1,
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full block"
            style={{ aspectRatio: "16/9", mixBlendMode: "lighten" }}
          />
        </div>

        {/* Left content */}
        <div
          className="relative"
          style={{ zIndex: 10, padding: "120px 48px", maxWidth: "560px" }}
        >
          <span className="reveal-rise-wrap">
            <span
              className="reveal-rise block text-[11px] font-medium tracking-[0.2em] uppercase mb-6"
              style={{ color: "rgba(57,255,20,0.5)" }}
            >
              The Machine
            </span>
          </span>

          <h2
            className="reveal-flip font-extrabold leading-none"
            style={{
              fontSize: "clamp(40px, 5vw, 72px)",
              letterSpacing: "-0.03em",
            }}
          >
            Nature.<br />
            <em className="not-italic text-primary">Engineered.</em>
          </h2>

          <p
            className="reveal reveal-delay-2 mt-6 font-light leading-loose"
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "420px",
              lineHeight: "1.8",
            }}
          >
            The serpent has always been a symbol of intelligence, transformation,
            and renewal. OphidianAI is that metaphor made real — the organic and
            the computational, fused into tools that think.
          </p>

          <div
            className="reveal reveal-delay-3 my-7"
            style={{ width: "40px", height: "1px", background: "rgba(57,255,20,0.3)" }}
          />

          <div className="reveal-scale reveal-delay-4 flex gap-10">
            {[
              { val: "AI-first",   label: "Development" },
              { val: "Solo",       label: "Operated" },
              { val: "Full-stack", label: "Delivery" },
            ].map(({ val, label }) => (
              <div key={val}>
                <div
                  className="font-bold"
                  style={{ fontSize: "28px", letterSpacing: "-0.02em" }}
                >
                  {val}
                </div>
                <div
                  className="text-[11px] tracking-[0.1em] uppercase mt-1"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
