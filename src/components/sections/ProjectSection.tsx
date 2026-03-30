"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PortfolioProject } from "@/lib/portfolio";

// Map project slugs to local case-study-hero screenshots.
const HERO_SCREENSHOT_MAP: Record<string, string> = {
  "bloomin-acres": "/case-study-heroes/bloomin-acres.png",
  "midwest-maintenance": "/case-study-heroes/midwest-maint.png",
  "point-of-hope-church": "/case-study-heroes/point-of-hope.png",
};

function getHeroImage(project: PortfolioProject): string {
  return HERO_SCREENSHOT_MAP[project.slug] ?? project.hero_image;
}

interface ProjectSectionProps {
  project: PortfolioProject;
  index: number;
  totalCount: number;
}

export function ProjectSection({ project, index }: ProjectSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  // One-way: once visible, stays visible so section is not hidden after snap
  const [isVisible, setIsVisible] = useState(false);

  const isEven = index % 2 === 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
        // Intentionally not resetting to false — one-way visibility
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const number = String(index + 1).padStart(2, "0");

  return (
    // 200svh wrapper: sticky section pins for the first 100svh of scroll, then releases
    <div style={{ height: "200svh" }}>
      <section
        ref={sectionRef}
        id={`project-${project.slug}`}
        aria-label={`Project ${number}: ${project.title}`}
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          display: "flex",
          alignItems: "center",
          background: "var(--color-cream)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isEven ? "row" : "row-reverse",
            alignItems: "center",
            width: "100%",
            height: "100%",
            padding: "0 40px",
          }}
          className="project-section-inner"
        >
          {/* Text column — flex-shrink:0 via shorthand, box-sizing:border-box so padding stays within flex-basis */}
          <div
            style={{
              flex: "0 0 45%",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingRight: isEven ? "80px" : 0,
              paddingLeft: isEven ? 0 : "80px",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(24px)",
              transition:
                "opacity var(--duration-slow) var(--ease-out), transform var(--duration-slow) var(--ease-out)",
            }}
          >
            <span
              className="label-mono"
              style={{ marginBottom: "16px", display: "block", fontSize: "1.5rem" }}
            >
              {number}
            </span>
            <h2
              style={{
                fontFamily: "var(--font-playfair), 'Ballet', Georgia, serif",
                fontSize: "clamp(36px, 4vw, 72px)",
                fontWeight: 600,
                lineHeight: 1.1,
                color: "#855362",
                margin: 0,
                whiteSpace: "normal",
              }}
            >
              {project.title}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(18px, 2vw, 36px)",
                fontWeight: 400,
                lineHeight: 1.5,
                color: "var(--color-taupe)",
                marginTop: "24px",
                marginBottom: "40px",
                whiteSpace: "normal",
              }}
            >
              {project.subtitle}
            </p>
            <Link
              href={`/work/${project.slug}`}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "20px",
                fontWeight: 500,
                color: "var(--color-terracotta)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
              }}
            >
              View case study{" "}
              <Image
                src="/arrow-icon.png"
                alt=""
                width={48}
                height={46}
                style={{ display: "inline-block", verticalAlign: "middle" }}
              />
            </Link>
          </div>

          {/* Image column */}
          <div
            style={{
              flex: "0 0 55%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "600px",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                position: "relative",
                opacity: isVisible ? 1 : 0,
                transition: `opacity var(--duration-slow) var(--ease-out) ${
                  isVisible ? "100ms" : "0ms"
                }, transform var(--duration-base) var(--ease-organic), box-shadow var(--duration-base) var(--ease-organic)`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(-8px)";
                el.style.boxShadow = "0 24px 60px rgba(58, 58, 53, 0.20)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <Image
                src={getHeroImage(project)}
                alt={project.hero_image_alt || project.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 55vw"
              />
            </div>
          </div>
        </div>

        {/* Mobile layout override */}
        <style>{`
          @media (max-width: 768px) {
            #project-${project.slug} .project-section-inner {
              flex-direction: column !important;
              padding: 0 16px !important;
              gap: 24px;
            }
            #project-${project.slug} .project-section-inner > div:first-child {
              flex: none !important;
              width: 100% !important;
              padding: 0 !important;
            }
            #project-${project.slug} .project-section-inner > div:last-child {
              flex: none !important;
              width: 100% !important;
            }
            #project-${project.slug} .project-section-inner > div:last-child > div {
              width: 100% !important;
              height: 240px !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
}

interface SnapScrollContainerProps {
  projects: PortfolioProject[];
  children?: React.ReactNode;
}

export function SnapScrollContainer({ projects, children }: SnapScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Pre-compute containerTop once on mount so the scroll handler is stable
  const containerTopRef = useRef(0);
  // Track scroll direction so we can snap backward on scroll-up
  const scrollingDownRef = useRef(true);

  useEffect(() => {
    function updateContainerTop() {
      if (!containerRef.current) return;
      containerTopRef.current =
        containerRef.current.getBoundingClientRect().top + window.scrollY;
    }
    updateContainerTop();
    window.addEventListener("resize", updateContainerTop);
    return () => window.removeEventListener("resize", updateContainerTop);
  }, []);

  useEffect(() => {
    let snapTimeout: ReturnType<typeof setTimeout>;
    let isSnapping = false;
    let lastScrollY = window.scrollY;

    function snapIfInGap() {
      if (isSnapping) return;
      const vh = window.innerHeight;
      const sectionScrollHeight = vh * 2; // each wrapper is 200svh
      const containerTop = containerTopRef.current;
      const scrollY = window.scrollY;
      const goingDown = scrollingDownRef.current;

      for (let i = 0; i < projects.length; i++) {
        const sectionStart = containerTop + i * sectionScrollHeight;
        // Sticky section releases after 1 full vh of pinned scrolling
        const releasePoint = sectionStart + vh;
        const nextSectionStart = sectionStart + sectionScrollHeight;

        if (scrollY >= releasePoint && scrollY < nextSectionStart) {
          // In the gap zone: snap forward (down) or backward (up)
          const target = goingDown ? nextSectionStart : sectionStart;
          isSnapping = true;
          window.scrollTo({ top: target, behavior: "smooth" });
          setTimeout(() => {
            isSnapping = false;
          }, 800);
          break;
        }
      }
    }

    function onScroll() {
      if (isSnapping) return;
      scrollingDownRef.current = window.scrollY > lastScrollY;
      lastScrollY = window.scrollY;
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(snapIfInGap, 120);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(snapTimeout);
    };
  }, [projects]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <ScrollProgressDots
        count={projects.length}
        projectSlugs={projects.map((p) => p.slug)}
      />
      {projects.map((project, i) => (
        <ProjectSection
          key={project.id}
          project={project}
          index={i}
          totalCount={projects.length}
        />
      ))}
      {children}
    </div>
  );
}

interface ScrollProgressDotsProps {
  count: number;
  projectSlugs: string[];
}

function ScrollProgressDots({ count, projectSlugs }: ScrollProgressDotsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    projectSlugs.forEach((slug, i) => {
      const el = document.getElementById(`project-${slug}`);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [projectSlugs]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        right: "32px",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 40,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-label={`Project ${i + 1} of ${count}`}
          style={{
            width: "8px",
            height: i === activeIndex ? "24px" : "8px",
            borderRadius: "9999px",
            background:
              i === activeIndex ? "var(--color-terracotta)" : "var(--color-sage)",
            transition:
              "height var(--duration-base) var(--ease-out), background var(--duration-base)",
          }}
        />
      ))}
    </div>
  );
}
