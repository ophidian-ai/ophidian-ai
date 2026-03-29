"use client";

import { useEffect, useRef } from "react";
import { Thumbnail } from "./Thumbnail";
import type { PortfolioProject } from "@/lib/portfolio";

interface ConstellationHeroProps {
  projects: PortfolioProject[];
}

// Desktop thumbnail positions (percentage-based) for up to 8 projects.
// Positions are intentionally scattered around the center content.
const DESKTOP_POSITIONS = [
  { x: "18%", y: "28%", size: "lg" as const },
  { x: "72%", y: "55%", size: "md" as const },
  { x: "12%", y: "62%", size: "sm" as const },
  { x: "78%", y: "22%", size: "sm" as const },
  { x: "55%", y: "72%", size: "md" as const },
  { x: "32%", y: "78%", size: "sm" as const },
  { x: "85%", y: "45%", size: "sm" as const },
  { x: "8%", y: "42%",  size: "md" as const },
];

// Mobile positions (max 3 thumbnails)
const MOBILE_POSITIONS = [
  { x: "25%", y: "20%", size: "sm" as const },
  { x: "70%", y: "35%", size: "sm" as const },
  { x: "45%", y: "70%", size: "sm" as const },
];

export function ConstellationHero({ projects }: ConstellationHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger funnel animation
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;

    async function initGsap() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current || !wordmarkRef.current || !thumbnailsRef.current) return;

      const thumbnailEls = thumbnailsRef.current.querySelectorAll<HTMLElement>(".thumbnail-wrapper");

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            scrub: 1,
            start: "top top",
            end: "+=200%",
          },
        });

        // Funnel thumbnails toward center (scroll 20–60%)
        thumbnailEls.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const sectionRect = sectionRef.current!.getBoundingClientRect();
          const centerX = sectionRect.width / 2;
          const centerY = sectionRect.height / 2;
          const elCenterX = rect.left - sectionRect.left + rect.width / 2;
          const elCenterY = rect.top - sectionRect.top + rect.height / 2;

          tl.to(
            el,
            {
              x: centerX - elCenterX,
              y: centerY - elCenterY,
              scale: 0.4,
              opacity: 0.15,
              ease: "power2.inOut",
            },
            0
          );
        });

        // Wordmark fades out (scroll 0–60%)
        tl.to(wordmarkRef.current, { opacity: 0, y: -20, ease: "power2.in" }, 0);

        // Fade scroll hint out at 5% scroll
        if (scrollHintRef.current) {
          gsap.to(scrollHintRef.current, {
            opacity: 0,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "5% top",
              scrub: true,
            },
          });
        }
      }, sectionRef);
    }

    initGsap();
    return () => ctx?.revert();
  }, []);

  // Use mobile or desktop positions based on count
  const positions = DESKTOP_POSITIONS;
  const mobilePositions = MOBILE_POSITIONS;
  const visibleProjects = projects.slice(0, positions.length);

  return (
    // Sticky pin section — 300vh scroll space drives the GSAP scrub
    <div style={{ height: "300vh" }}>
      <div
        ref={sectionRef}
        id="constellation"
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          width: "100%",
          background: "var(--color-cream)",
          overflow: "hidden",
        }}
      >
        {/* Thumbnails layer */}
        <div
          ref={thumbnailsRef}
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {/* Desktop thumbnails */}
          {visibleProjects.map((project, i) => {
            const pos = positions[i];
            return (
              <div
                key={project.id}
                className={i % 2 === 0 ? "hidden md:block" : "hidden md:block"}
              >
                <Thumbnail
                  src={project.hero_image}
                  alt={project.hero_image_alt}
                  projectName={project.title}
                  size={pos.size}
                  driftClass={i % 2 === 0 ? "animate-drift-a" : "animate-drift-b"}
                  style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
                />
              </div>
            );
          })}

          {/* Mobile thumbnails — max 3, smaller positions */}
          {visibleProjects.slice(0, 3).map((project, i) => {
            const pos = mobilePositions[i];
            return (
              <div key={`mobile-${project.id}`} className="block md:hidden">
                <Thumbnail
                  src={project.hero_image}
                  alt={project.hero_image_alt}
                  projectName={project.title}
                  size="sm"
                  driftClass={i % 2 === 0 ? "animate-drift-a" : "animate-drift-b"}
                  style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
                />
              </div>
            );
          })}
        </div>

        {/* Center wordmark + tagline */}
        <div
          ref={wordmarkRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
            pointerEvents: "none",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-wordmark)",
              fontWeight: 400,
              fontSize: "clamp(48px, 8vw, 72px)",
              lineHeight: 1.0,
              color: "var(--color-forest)",
              margin: 0,
            }}
          >
            Ophidian
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "18px",
              fontWeight: 400,
              lineHeight: 1.65,
              color: "var(--color-taupe)",
              marginTop: "16px",
              maxWidth: "360px",
            }}
          >
            Where the natural world meets innovation.
          </p>
        </div>

        {/* Scroll hint */}
        <div
          ref={scrollHintRef}
          className="scroll-hint"
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 8l5 5 5-5"
              stroke="var(--color-sage)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
