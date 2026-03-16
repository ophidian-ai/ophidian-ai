"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { GlassButton } from "@/components/ui/glass-button";
import { ParticleBackground } from "@/components/ui/particle-background";

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
    <section ref={containerRef} className="relative h-screen bg-forest overflow-hidden">
      <ParticleBackground density={1000} speed={0.5} opacity={0.35} glow />
      <div
        ref={videoRef}
        className="absolute inset-0 overflow-hidden origin-center"
        style={{ willChange: "transform, border-radius" }}
      >
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/video/hero-card-video.mp4" type="video/mp4" />
        </video>
        {/* Layered overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 65%, transparent 100%)",
          }}
        />
      </div>

      <div ref={overlayRef} className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-8">
        <Image src="/images/logo_icon.png" alt="OphidianAI" width={80} height={80} className="mb-8 drop-shadow-lg" />
        <h1
          className="text-4xl md:text-6xl font-display text-white mb-6"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
        >
          Ophidian<span className="text-gold" style={{ textShadow: "0 0 30px rgba(196,162,101,0.4)" }}>AI</span>
        </h1>
        <p
          className="text-lg md:text-xl text-white/90 max-w-xl mb-10 font-light"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
        >
          Where the natural world meets innovation.
        </p>
        <GlassButton size="default" href="#contact">
          Get Started
        </GlassButton>
      </div>

      <div ref={taglineRef} className="absolute bottom-[10%] left-0 right-0 z-10 text-center px-8">
        <p className="text-3xl md:text-5xl font-display italic text-text-light">
          <span className="tagline-word inline-block opacity-0">Intelligence.</span>{" "}
          <span className="tagline-word inline-block opacity-0">Engineered.</span>
        </p>
      </div>
    </section>
  );
}
