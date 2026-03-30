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
  const [isVisible, setIsVisible] = useState(false);

  const isEven = index % 2 === 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
        else setIsVisible(false);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const number = String(index + 1).padStart(2, "0");

  return (
    // 200svh wrapper: section sticks for the first 100svh of scroll, then releases
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
            gap: "0",
          }}
          className="project-section-inner"
        >
          {/* Text column */}
          <div
            style={{
              flex: "0 0 45%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingRight: isEven ? "80px" : 0,
              paddingLeft: isEven ? 0 : "80px",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity var(--duration-slow) var(--ease-out), transform var(--duration-slow) var(--ease-out)",
              minWidth: 0,
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
                fontSize: "80px",
                fontWeight: 600,
                lineHeight: 1.1,
                color: "#855362",
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              {project.title}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "36px",
                fontWeight: 400,
                lineHeight: 1.5,
                color: "var(--color-taupe)",
                marginTop: "24px",
                marginBottom: "40px",
                whiteSpace: "nowrap",
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
                width: "1067px",
                maxWidth: "100%",
                height: "600px",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                position: "relative",
                opacity: isVisible ? 1 : 0,
                transition: `opacity var(--duration-slow) var(--ease-out) ${isVisible ? "100ms" : "0ms"}, transform var(--duration-base) var(--ease-organic), box-shadow var(--duration-base) var(--ease-organic)`,
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
            #project-${project.slug} .project-section-inner > div:first-child h2 {
              font-size: 36px !important;
              white-space: normal !important;
            }
            #project-${project.slug} .project-section-inner > div:first-child p {
              font-size: 18px !important;
              white-space: normal !important;
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

  // Vanilla JS scroll snap: after sticky pin releases, snap to nearest section boundary
  useEffect(() => {
    let snapTimeout: ReturnType<typeof setTimeout>;
    let isSnapping = false;

    function snapToNearest() {
      if (isSnapping || !containerRef.current) return;
      const containerTop =
        containerRef.current.getBoundingClientRect().top + window.scrollY;
      const vh = window.innerHeight;
      const sectionScrollHeight = vh * 2; // each section wrapper is 200svh

      const scrollInContainer = window.scrollY - containerTop;
      if (scrollInContainer < 0) return;

      const rawIndex = scrollInContainer / sectionScrollHeight;
      const nearestIndex = Math.round(rawIndex);
      const clampedIndex = Math.max(0, Math.min(nearestIndex, projects.length - 1));
      const targetScroll = containerTop + clampedIndex * sectionScrollHeight;

      if (Math.abs(window.scrollY - targetScroll) > 8) {
        isSnapping = true;
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
        setTimeout(() => { isSnapping = false; }, 600);
      }
    }

    function onScroll() {
      if (isSnapping) return;
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(snapToNearest, 120);
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
