"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  { num: "01", title: "Discovery", desc: "We learn your business inside and out. Goals, audience, constraints — everything that shapes the right solution." },
  { num: "02", title: "Strategy", desc: "A clear plan emerges. Technology choices, content structure, timeline — mapped out before a single line of code." },
  { num: "03", title: "Design", desc: "Visual direction tailored to your brand. You see the design before we build, and you shape it until it's right." },
  { num: "04", title: "Build", desc: "Fast, clean, production-grade development. Every pixel matches the design. Every interaction feels intentional." },
  { num: "05", title: "Launch", desc: "Go live with confidence. Performance tested, SEO configured, analytics connected. Your digital presence, fully operational." },
  { num: "06", title: "Grow", desc: "Post-launch optimization, content updates, and strategic improvements. We grow with your business, not just deliver and disappear." },
];

export function VisualBreak() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Wait for video metadata to load
    const onLoaded = () => {
      const duration = video.duration;

      const ctx = gsap.context(() => {
        // Scrub video playback with scroll
        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (video.readyState >= 2) {
              video.currentTime = self.progress * duration;
            }
          },
        });

        // Fade out headline as scroll begins
        if (headlineRef.current) {
          gsap.to(headlineRef.current, {
            opacity: 0,
            y: -40,
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: "15% top",
              scrub: 1,
            },
          });
        }

        // Animate each step card in and out
        cardsRef.current.forEach((card, i) => {
          if (!card) return;
          const startPct = (i + 1) / (STEPS.length + 1);
          const endPct = (i + 2) / (STEPS.length + 1);

          // Fly in
          gsap.fromTo(
            card,
            { opacity: 0, x: i % 2 === 0 ? -80 : 80, scale: 0.9 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              scrollTrigger: {
                trigger: container,
                start: `${(startPct * 100).toFixed(0)}% center`,
                end: `${((startPct + 0.05) * 100).toFixed(0)}% center`,
                scrub: 1,
              },
            }
          );

          // Fade out
          gsap.to(card, {
            opacity: 0,
            y: -30,
            scrollTrigger: {
              trigger: container,
              start: `${((endPct - 0.05) * 100).toFixed(0)}% center`,
              end: `${(endPct * 100).toFixed(0)}% center`,
              scrub: 1,
            },
          });
        });
      }, container);

      return () => ctx.revert();
    };

    if (video.readyState >= 1) {
      onLoaded();
    } else {
      video.addEventListener("loadedmetadata", onLoaded, { once: true });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${(STEPS.length + 2) * 80}vh` }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video background — full color, no grayscale */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(0.5px) contrast(1.1) brightness(1.05)", transform: "scale(1.02)" }}
        >
          <source src="https://zikwvaqbtemckite.public.blob.vercel-storage.com/video/cultivation-timeline.mp4" type="video/mp4" />
        </video>

        {/* Subtle overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(5,23,11,0.7) 0%, rgba(5,23,11,0.3) 40%, rgba(5,23,11,0.1) 100%)" }}
        />
        {/* Edge vignette blur — heavier on bottom to hide edge against glows */}
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: "inset 0 -80px 120px 40px rgba(5,23,11,1), inset 0 0 100px 40px rgba(5,23,11,0.6)",
        }} />
        {/* Bottom fade to seamless transition */}
        <div className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none" style={{
          background: "linear-gradient(to top, rgba(5,23,11,1) 0%, rgba(5,23,11,1) 15%, rgba(5,23,11,0.7) 50%, transparent 100%)",
        }} />

        {/* Opening headline — fades out on scroll */}
        <div
          ref={headlineRef}
          className="absolute inset-0 flex items-center justify-center text-center p-8 z-10"
        >
          <h2
            className="font-display italic font-normal leading-tight"
            style={{ color: "var(--color-on-surface)", fontSize: "clamp(2.5rem, 7vw, 8rem)" }}
          >
            The future is not coded. <br />
            It is <span style={{ color: "var(--color-primary)" }}>cultivated</span>.
          </h2>
        </div>

        {/* Step cards — fly in from alternating sides */}
        <div className="absolute inset-0 flex items-center z-20 pointer-events-none">
          <div className="w-full max-w-7xl mx-auto px-8">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="absolute glass-card rounded-2xl px-10 py-8 max-w-lg opacity-0"
                style={{
                  left: i % 2 === 0 ? "8%" : "auto",
                  right: i % 2 === 1 ? "8%" : "auto",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <span
                  className="text-xs uppercase tracking-[0.4em] block mb-3"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
                >
                  Step {step.num}
                </span>
                <h3
                  className="font-display italic text-4xl mb-4"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
