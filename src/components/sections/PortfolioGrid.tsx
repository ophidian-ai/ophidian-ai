"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PROJECTS = [
  { title: "Bloomin' Acres", tags: ["Website"], image: "/images/portfolio/bloomin-acres-homepage.png", href: "/portfolio/bloomin-acres" },
  { title: "Point of Hope Church", tags: ["Website"], image: "/images/portfolio/point-of-hope-church-homepage.png", href: "/portfolio/point-of-hope-church" },
  { title: "Coming Soon", tags: ["AI Integration"], image: "/images/gallery/marble.jpg", href: "#" },
  { title: "Coming Soon", tags: ["SEO"], image: "/images/gallery/mountains.jpg", href: "#" },
  { title: "Coming Soon", tags: ["Website", "AI Integration"], image: "/images/gallery/ferns.jpg", href: "#" },
  { title: "Coming Soon", tags: ["Social Media"], image: "/images/gallery/fjord.jpg", href: "#" },
];

// Card takes up 70% of the viewport (capped at 900px), centered
const GAP_PX = 32; // gap between cards

export function PortfolioGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const track = trackRef.current;
    // Total scrollable distance = full track width minus one viewport
    const totalSlide = track.scrollWidth - window.innerWidth;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        // Cards finish scrolling at 85% progress, last 15% is dwell + exit
        const cardProgress = Math.min(1, self.progress / 0.85);
        gsap.set(track, { x: -totalSlide * cardProgress });
      },
    });

    return () => st.kill();
  }, []);

  // Each card gets 100vh of scroll, plus 2 screens for dwell on last card + exit
  const scrollRunway = (PROJECTS.length + 2) * 100;

  return (
    <div
      ref={containerRef}
      id="portfolio"
      className="relative"
      style={{ height: `${scrollRunway}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        {/* Horizontal scrolling area with edge blur */}
        <div className="relative flex-1 flex flex-col justify-center">
          {/* Header — inside scroll area, above cards, high z-index above blur */}
          <div className="px-8 md:px-16 mb-8 relative z-20">
            <h2 className="text-3xl md:text-5xl font-display" style={{ color: "var(--color-on-surface)" }}>
              Our work speaks for itself.
            </h2>
          </div>

          {/* Left frosted edge */}
          <div
            className="absolute left-0 top-0 bottom-0 w-32 md:w-64 z-10 pointer-events-none backdrop-blur-sm"
            style={{
              background: "linear-gradient(to right, rgba(5,23,11,0.9) 10%, transparent 100%)",
            }}
          />
          {/* Right frosted edge */}
          <div
            className="absolute right-0 top-0 bottom-0 w-32 md:w-64 z-10 pointer-events-none backdrop-blur-sm"
            style={{
              background: "linear-gradient(to left, rgba(5,23,11,0.9) 10%, transparent 100%)",
            }}
          />

          {/* Track -- first card centered via padding */}
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-8"
            style={{
              willChange: "transform",
              paddingLeft: "calc(50vw - min(42vw, 450px))",
              paddingRight: "calc(50vw - min(42vw, 450px))",
            }}
          >
            {PROJECTS.map((project, i) => (
              <a
                key={i}
                href={project.href}
                className="group relative flex-shrink-0 overflow-hidden rounded-2xl glass-card transition-all duration-300"
                style={{
                  width: "min(80vw, 900px)",
                  boxShadow: "var(--shadow-ambient)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(196,162,101,0.10)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-ambient)"; }}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={1200}
                    height={750}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-8 flex items-start justify-between" style={{ background: "var(--color-surface-container-high)" }}>
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold" style={{ color: "var(--color-on-surface)" }}>{project.title}</h3>
                    <div className="flex gap-2 mt-3">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowUpRight className="w-6 h-6 transition-colors" style={{ color: "var(--color-on-surface-variant)" }} />
                </div>
              </a>
            ))}
            {/* Phantom spacer -- forces last card to center before scroll exits */}
            <div className="flex-shrink-0" style={{ width: "calc(50vw - min(35vw, 450px))" }} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
