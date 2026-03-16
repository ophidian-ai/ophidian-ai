"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const PROJECTS = [
  { title: "Bloomin' Acres", tags: ["Website"], image: "/images/portfolio/bloomin-acres-homepage.png", href: "/portfolio/bloomin-acres" },
  { title: "Point of Hope Church", tags: ["Website"], image: "/images/portfolio/point-of-hope-church-homepage.png", href: "/portfolio/point-of-hope-church" },
  { title: "Coming Soon", tags: ["AI Integration"], image: "/images/gallery/marble.jpg", href: "#" },
  { title: "Coming Soon", tags: ["SEO"], image: "/images/gallery/mountains.jpg", href: "#" },
  { title: "Coming Soon", tags: ["Website", "AI Integration"], image: "/images/gallery/ferns.jpg", href: "#" },
  { title: "Coming Soon", tags: ["Social Media"], image: "/images/gallery/fjord.jpg", href: "#" },
];

export function PortfolioGrid() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? PROJECTS : PROJECTS.slice(0, 4);

  return (
    <section id="portfolio" className="bg-sage py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-dark mb-16">Our work speaks for itself.</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((project, i) => (
            <a key={i} href={project.href} className="group relative overflow-hidden rounded-lg bg-sage-light transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="aspect-[4/3] overflow-hidden">
                <Image src={project.image} alt={project.title} width={600} height={450} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-dark">{project.title}</h3>
                  <div className="flex gap-2 mt-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-forest/10 text-forest">{tag}</span>
                    ))}
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-text-dark/40 group-hover:text-gold transition-colors" />
              </div>
            </a>
          ))}
        </div>
        {PROJECTS.length > 4 && (
          <div className="text-center mt-12">
            <button onClick={() => setShowAll(!showAll)} className="px-8 py-3 rounded-full text-sm font-medium border-2 border-forest text-forest hover:bg-forest hover:text-text-light transition-colors">
              {showAll ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
