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

export function PortfolioGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const track = trackRef.current;
    const scrollWidth = track.scrollWidth - window.innerWidth;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(track, { x: -scrollWidth * self.progress });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div
      ref={containerRef}
      id="portfolio"
      className="relative bg-sage"
      style={{ height: `${Math.max(200, PROJECTS.length * 50)}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        {/* Header */}
        <div className="px-8 md:px-16 pt-8 pb-8">
          <h2 className="text-3xl md:text-5xl font-display text-text-dark">
            Our work speaks for itself.
          </h2>
        </div>

        {/* Horizontal scrolling track */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-6 px-8 md:px-16"
            style={{ willChange: "transform" }}
          >
            {PROJECTS.map((project, i) => (
              <a
                key={i}
                href={project.href}
                className="group relative flex-shrink-0 w-[400px] md:w-[500px] overflow-hidden rounded-xl bg-sage-light transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={600}
                    height={450}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-dark">{project.title}</h3>
                    <div className="flex gap-2 mt-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-forest/10 text-forest">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-text-dark/40 group-hover:text-gold transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
