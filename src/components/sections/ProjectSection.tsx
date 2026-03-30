"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PortfolioProject } from "@/lib/portfolio";

// Map project slugs to local case-study-hero screenshots.
// These are the hero page screenshots requested by Eric (PR #18 Rev.3).
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

export function ProjectSection({ project, index, totalCount }: ProjectSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isEven = index % 2 === 0; // image right on odd, left on even

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const number = String(index + 1).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      id={`project-${project.slug}`}
      aria-label={`Project ${number}: ${project.title}`}
      style={{
        height: "100svh",
        scrollSnapAlign: "start",
        scrollMarginTop: "80px",
        display: "flex",
        alignItems: "center",
        background: "var(--color-cream)",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isEven ? "row" : "row-reverse",
          alignItems: "center",
          width: "100%",
          height: "100%",
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 80px",
        }}
        className="project-section-inner"
      >
        {/* Text column */}
        <div
          ref={contentRef}
          style={{
            flex: "0 0 50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignSelf: "center",
            paddingRight: isEven ? "48px" : 0,
            paddingLeft: isEven ? 0 : "48px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity var(--duration-slow) var(--ease-out), transform var(--duration-slow) var(--ease-out)",
          }}
        >
          <span className="label-mono" style={{ marginBottom: "16px", display: "block" }}>
            {number}
          </span>
          <h2
            style={{
              fontFamily: "var(--font-playfair), 'Ballet', Georgia, serif",
              fontSize: "40px",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#855362",
              margin: 0,
            }}
          >
            {project.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "18px",
              fontWeight: 400,
              lineHeight: 1.65,
              color: "var(--color-taupe)",
              maxWidth: "360px",
              marginTop: "16px",
              marginBottom: "32px",
            }}
          >
            {project.subtitle}
          </p>
          <Link
            href={`/work/${project.slug}`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              fontWeight: 500,
              color: "var(--color-terracotta)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
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
              width={24}
              height={23}
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
          </Link>
        </div>

        {/* Image column */}
        <div
          style={{
            flex: "0 0 50%",
            display: "flex",
            alignItems: "center",
            alignSelf: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
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
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      {/* Mobile layout override */}
      <style>{`
        @media (max-width: 768px) {
          #project-${project.slug} .project-section-inner {
            flex-direction: column !important;
            padding: 0 24px !important;
            gap: 24px;
            justify-content: center;
          }
          #project-${project.slug} .project-section-inner > div {
            flex: none !important;
            width: 100% !important;
            padding: 0 !important;
          }
          #project-${project.slug} .project-section-inner > div:last-child {
            height: 40svh !important;
          }
          #project-${project.slug} .project-section-inner > div:last-child > div {
            height: 100% !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1200px) {
          #project-${project.slug} .project-section-inner {
            padding: 0 48px !important;
          }
        }
      `}</style>
    </section>
  );
}

interface SnapScrollContainerProps {
  projects: PortfolioProject[];
  children?: React.ReactNode;
}

export function SnapScrollContainer({ projects, children }: SnapScrollContainerProps) {
  return (
    <div
      style={{
        scrollSnapType: "y proximity",
        overflowY: "scroll",
        height: "100svh",
        position: "relative",
        scrollPaddingTop: "80px",
        scrollPaddingBottom: "80px",
      }}
    >
      {/* Scroll progress dots */}
      <ScrollProgressDots count={projects.length} projectSlugs={projects.map((p) => p.slug)} />

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
            transition: "height var(--duration-base) var(--ease-out), background var(--duration-base)",
          }}
        />
      ))}
    </div>
  );
}
