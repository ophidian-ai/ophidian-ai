"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlassButton } from "@/components/ui/glass-button";

gsap.registerPlugin(ScrollTrigger);

export function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
        },
      });

      tl.to(videoRef.current, { scale: 0.72, borderRadius: "16px", duration: 0.5 }, 0);
      tl.to(overlayRef.current, { opacity: 0, duration: 0.3 }, 0);

      const words = taglineRef.current?.querySelectorAll(".tagline-word");
      if (words) {
        tl.fromTo(words, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.3 }, 0.4);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      <div
        ref={videoRef}
        className="absolute inset-0 overflow-hidden origin-center"
        style={{ willChange: "transform, border-radius" }}
      >
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/video/hero-card-video.mp4" type="video/mp4" />
        </video>
        {/* Layered overlays — deep forest tones instead of pure black */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(5,23,11,0.45) 0%, rgba(5,23,11,0.20) 40%, rgba(5,23,11,0.70) 100%)" }} />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(5,23,11,0.55) 0%, rgba(5,23,11,0.15) 65%, transparent 100%)",
          }}
        />
      </div>

      <div ref={overlayRef} className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 sm:px-8">
        <div className="max-w-7xl space-y-8">
          {/* Eyebrow label */}
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12" style={{ background: "rgba(196,162,101,0.4)" }} />
            <span
              className="text-sm uppercase tracking-[0.3em] px-4 py-1.5 rounded-full"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)", background: "rgba(5,23,11,0.6)", backdropFilter: "blur(8px)" }}
            >
              Neural Flora &amp; Silicon Flora
            </span>
            <span className="h-px w-12" style={{ background: "rgba(196,162,101,0.4)" }} />
          </div>
          {/* Headline */}
          <h1
            className="font-display italic leading-[0.85]"
            style={{ color: "var(--color-on-surface)", letterSpacing: "-0.03em", textShadow: "0 4px 40px rgba(5,23,11,0.6)", fontSize: "clamp(3.75rem, 8vw, 8rem)" }}
          >
            Where Artificial <br />
            <span style={{ color: "var(--color-primary)" }}>Intelligence</span> Breathes.
          </h1>
          {/* Subtitle */}
          <p
            className="max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed"
            style={{ color: "var(--color-on-surface)", opacity: 0.8, textShadow: "0 1px 12px rgba(5,23,11,0.6)" }}
          >
            We cultivate bespoke digital ecosystems that adapt, learn, and grow alongside your vision. Precision-engineered solutions for the organic future.
          </p>
          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <GlassButton size="default" href="#contact">
              Cultivate Success
            </GlassButton>
            <GlassButton size="default" href="#services">
              Explore Labs
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Scroll indicator + tagline */}
      <div ref={taglineRef} className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-4">
        <span className="tagline-word inline-block opacity-0 text-xs uppercase tracking-[0.3em]" style={{ fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)", opacity: 0.4 }}>Descend</span>
        <div className="tagline-word inline-block opacity-0 w-px h-16" style={{ background: "linear-gradient(to bottom, rgba(170,208,173,0.6), transparent)" }} />
      </div>
    </section>
  );
}
