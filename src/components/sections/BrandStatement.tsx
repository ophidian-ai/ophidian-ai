"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlassButton } from "@/components/ui/glass-button";
import { ParticleBackground } from "@/components/ui/particle-background";

gsap.registerPlugin(ScrollTrigger);

export function BrandStatement() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = sectionRef.current?.querySelectorAll(".brand-word");
      if (!words) return;

      gsap.fromTo(
        words,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: "top 60%", end: "center center", scrub: 1 },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center bg-forest overflow-hidden">
      <ParticleBackground glow />
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 1440 900" className="w-full h-full" preserveAspectRatio="none">
          {[...Array(12)].map((_, i) => (
            <path
              key={i}
              d={`M${-100 + i * 40},${450 + Math.sin(i) * 100} Q${360 + i * 20},${200 + i * 30} ${720 + i * 10},${400 + Math.cos(i) * 80} T${1540 + i * 20},${350 + i * 25}`}
              fill="none"
              stroke="var(--color-sage-accent)"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
      <div className="relative z-10 text-center px-4 sm:px-8">
        <p className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-display text-text-light leading-tight">
          <span className="brand-word inline-block">That&apos;s</span>{" "}
          <span className="brand-word inline-block">us</span>{" "}
          <span className="brand-word inline-block">&mdash;</span>{" "}
          <span className="brand-word inline-block">Ophidian</span>
          <span className="brand-word inline-block text-gold">AI</span>
          <span className="brand-word inline-block">.</span>
        </p>
      </div>
      <div className="relative z-10 mt-10 sm:mt-16 text-center">
        <p className="text-text-muted text-lg mb-8">Ready to bring your vision to life?</p>
        <GlassButton size="default" href="#contact">
          Book a Discovery Call
        </GlassButton>
      </div>
    </section>
  );
}
