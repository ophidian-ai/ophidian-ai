"use client";

import React, { useEffect, useRef } from "react";

interface HeroAnimatedProps {
  taglineWords?: string[];
  headlineWords?: string[];
  sublineWords?: string[];
  bottomWords?: string[];
  className?: string;
}

export function HeroAnimated({
  taglineWords = [
    "Welcome",
    "to",
    "OphidianAI",
    "--",
    "Your",
    "AI",
    "growth",
    "partner.",
  ],
  headlineWords = [
    "Websites",
    "and",
    "AI",
    "solutions",
    "that",
    "drive",
    "real",
    "results.",
  ],
  sublineWords = [
    "Custom-built",
    "sites,",
    "intelligent",
    "integrations,",
    "and",
    "automation",
    "--",
    "all",
    "designed",
    "to",
    "grow",
    "your",
    "business.",
  ],
  bottomWords = [
    "Modern",
    "design,",
    "AI-powered",
    "tools,",
    "built",
    "for",
    "performance.",
  ],
  className = "",
}: HeroAnimatedProps) {
  const gradientRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Force-restart CSS animations on mount (fixes client-side navigation)
    const animated = container.querySelectorAll<HTMLElement>(".grid-line, .detail-dot, .floating-element");
    animated.forEach((el) => {
      el.style.animation = "none";
      el.offsetHeight; // trigger reflow
      el.style.animation = "";
    });

    const words = container.querySelectorAll<HTMLElement>(".word");
    words.forEach((word) => {
      const delay = parseInt(word.getAttribute("data-delay") || "0", 10);
      setTimeout(() => {
        word.style.animation = "word-appear 0.5s ease-out forwards";
      }, delay);
    });

    const gradient = gradientRef.current;
    function onMouseMove(e: MouseEvent) {
      if (gradient) {
        gradient.style.left = e.clientX - 192 + "px";
        gradient.style.top = e.clientY - 192 + "px";
        gradient.style.opacity = "1";
      }
    }
    function onMouseLeave() {
      if (gradient) gradient.style.opacity = "0";
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    words.forEach((word) => {
      word.addEventListener("mouseenter", () => {
        word.style.textShadow = "0 0 20px rgba(57, 255, 20, 0.5)";
      });
      word.addEventListener("mouseleave", () => {
        word.style.textShadow = "none";
      });
    });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  const renderWords = (
    words: string[],
    baseDelay: number,
    delayStep: number
  ) =>
    words.map((word, i) => (
      <span key={i} className="word" data-delay={baseDelay + i * delayStep}>
        {word}{" "}
      </span>
    ));

  return (
    <div
      ref={containerRef}
      className={`min-h-screen text-foreground overflow-hidden relative w-full ${className}`}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hero-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(57,255,20,0.08)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: "0.2s" }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: "0.4s" }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: "0.6s" }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: "0.8s" }} />
        <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "1s" }} />
        <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "1.1s" }} />
        <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "1.2s" }} />
        <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "1.3s" }} />
      </svg>

      {/* Floating elements */}
      <div className="floating-element" style={{ top: "25%", left: "15%", animationDelay: "1.5s", animationPlayState: "running" }} />
      <div className="floating-element" style={{ top: "60%", left: "85%", animationDelay: "2s", animationPlayState: "running" }} />
      <div className="floating-element" style={{ top: "40%", left: "10%", animationDelay: "2.5s", animationPlayState: "running" }} />
      <div className="floating-element" style={{ top: "75%", left: "90%", animationDelay: "3s", animationPlayState: "running" }} />

      <div className="relative z-10 min-h-screen flex flex-col justify-between items-center px-8 py-12 md:px-16 md:py-20">
        {/* Top tagline */}
        <div className="text-center">
          <h2 className="text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] text-primary/80">
            {renderWords(taglineWords, 0, 80)}
          </h2>
          <div
            className="mt-4 w-16 h-px opacity-30 mx-auto"
            style={{
              background: "linear-gradient(to right, transparent, #39FF14, transparent)",
            }}
          />
        </div>

        {/* Main headline */}
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extralight leading-tight tracking-tight text-foreground">
            <div className="mb-4 md:mb-6">
              {renderWords(headlineWords, 600, 60)}
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-thin leading-relaxed text-primary-light">
              {renderWords(sublineWords, 1300, 50)}
            </div>
          </h1>
        </div>

        {/* Bottom tagline */}
        <div className="text-center">
          <div
            className="mb-4 w-16 h-px opacity-30 mx-auto"
            style={{
              background: "linear-gradient(to right, transparent, #39FF14, transparent)",
            }}
          />
          <h2 className="text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] text-accent/80">
            {renderWords(bottomWords, 2000, 70)}
          </h2>
          <div
            className="mt-6 flex justify-center space-x-4 opacity-0"
            style={{
              animation: "word-appear 1s ease-out forwards",
              animationDelay: "2.5s",
            }}
          >
            <div className="w-1 h-1 rounded-full opacity-40 bg-primary" />
            <div className="w-1 h-1 rounded-full opacity-60 bg-accent" />
            <div className="w-1 h-1 rounded-full opacity-40 bg-primary" />
          </div>
        </div>
      </div>

      <div
        ref={gradientRef}
        className="fixed pointer-events-none w-96 h-96 rounded-full blur-3xl transition-all duration-500 ease-out opacity-0"
        style={{
          background: "radial-gradient(circle, rgba(57,255,20,0.05) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
