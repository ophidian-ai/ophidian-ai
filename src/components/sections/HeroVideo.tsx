"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

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
      <div
        ref={videoRef}
        className="absolute inset-0 overflow-hidden origin-center"
        style={{ willChange: "transform, border-radius" }}
      >
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/video/hero-card-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      <div ref={overlayRef} className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-8">
        <Image src="/images/logo_icon.png" alt="OphidianAI" width={80} height={80} className="mb-8" />
        <h1 className="text-4xl md:text-6xl font-display text-white mb-6">
          Ophidian<span className="text-venom">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-xl mb-10 font-light">
          Where the natural world meets innovation.
        </p>
        <a href="#contact" className="px-8 py-3 rounded-full text-sm font-medium bg-venom text-forest-deep hover:bg-venom/90 transition-colors">
          Get Started
        </a>
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
