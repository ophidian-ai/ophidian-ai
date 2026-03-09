"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { HeroSimple } from "@/components/sections/HeroSimple";
import { CTABanner } from "@/components/sections/CTABanner";
import {
  CircularGallery,
  type GalleryItem,
} from "@/components/ui/circular-gallery";

const projectData: GalleryItem[] = [
  {
    title: "Bloomin' Acres",
    subtitle: "Sourdough bakery & produce",
    href: "https://bloomin-acres.vercel.app",
    photo: {
      url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&auto=format&fit=crop&q=80",
      text: "Artisan sourdough bread on wooden cutting board",
      pos: "50% 40%",
    },
  },
  {
    title: "AI Dashboard",
    subtitle: "Analytics & monitoring",
    photo: {
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80",
      text: "Data analytics dashboard on monitor",
      pos: "50% 50%",
    },
  },
  {
    title: "E-Commerce Platform",
    subtitle: "Modern shopping experience",
    photo: {
      url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop&q=80",
      text: "Person shopping online on laptop",
      pos: "50% 50%",
    },
  },
  {
    title: "SaaS Landing Page",
    subtitle: "Conversion-focused design",
    photo: {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=80",
      text: "Modern website design on laptop screen",
      pos: "50% 30%",
    },
  },
  {
    title: "Restaurant Site",
    subtitle: "Local business web presence",
    photo: {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80",
      text: "Modern restaurant interior",
      pos: "50% 50%",
    },
  },
  {
    title: "AI Chatbot",
    subtitle: "Customer service automation",
    photo: {
      url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=80",
      text: "AI chatbot interface on screen",
      pos: "50% 50%",
    },
  },
];

export default function ProjectsPage() {
  return (
    <PageWrapper>
      <div className="grain">
        <HeroSimple
          title="Projects Gallery"
          subtitle="Explore our work. Each project is built for performance, designed for impact."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Projects", href: "/projects" },
          ]}
        />

        {/* Circular Gallery Section */}
        <div className="w-full bg-background" style={{ height: "500vh" }}>
          <div className="w-full h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
            <div className="text-center mb-8 absolute top-16 z-10">
              <h2 className="text-4xl font-bold text-foreground">
                Our <span className="gradient-text">Work</span>
              </h2>
              <p className="text-foreground-muted mt-2">
                Scroll to explore the gallery
              </p>
            </div>
            <div className="w-full h-full">
              <CircularGallery items={projectData} />
            </div>
          </div>
        </div>

        <CTABanner
          headline="Want to be our next project?"
          subtitle="Let's build something great together. No contracts, no pressure."
          cta={{ label: "Start a Project", href: "/contact" }}
        />
      </div>
    </PageWrapper>
  );
}
