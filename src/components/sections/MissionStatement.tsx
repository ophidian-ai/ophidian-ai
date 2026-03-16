"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ParticleBackground } from "@/components/ui/particle-background";

gsap.registerPlugin(ScrollTrigger);

const WORDS = "We build intelligent systems that transform how businesses operate.".split(" ");

export function MissionStatement() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = containerRef.current?.querySelectorAll(".mission-word");
      if (!words) return;

      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-forest px-4 sm:px-8 py-20 sm:py-32 overflow-hidden"
    >
      <ParticleBackground />
      <p className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-display text-center leading-relaxed max-w-5xl">
        {WORDS.map((word, i) => (
          <span key={i} className="mission-word inline-block text-text-light mr-[0.3em]">
            {word}
          </span>
        ))}
      </p>
    </section>
  );
}
