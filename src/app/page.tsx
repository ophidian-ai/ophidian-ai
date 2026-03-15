"use client";

import { useRef } from "react";
import { NavMain } from "@/components/layout/NavMain";
import { FooterMain } from "@/components/layout/FooterMain";
import { HeroSection } from "@/components/hero/HeroSection";
import { StatsRow } from "@/components/sections/StatsRow";
import { ImagePanel } from "@/components/ui/ImagePanel";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ShowcaseSection } from "@/components/sections/ShowcaseSection";
import { OrganicBreak } from "@/components/sections/OrganicBreak";
import { WorkPreview } from "@/components/sections/WorkPreview";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { AboutStrip } from "@/components/sections/AboutStrip";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { FloatingParticles } from "@/components/ui/FloatingParticles";

// ── Data ──────────────────────────────────────────────────────────────
const STATS = [
  { value: "24+", label: "Projects Delivered", countTo: 24 },
  { value: "100%", label: "Client Retention" },
  { value: "48h",  label: "Average Response" },
  { value: "3×",   label: "Average ROI" },
];

const SERVICES = [
  { num: "01", name: "Websites & Landing Pages", desc: "Custom-built, high-performance sites. Designed to convert, built to last.", href: "/services" },
  { num: "02", name: "AI Integrations", desc: "Chatbots, document intelligence, and API connections. Systems that work while you sleep.", href: "/services" },
  { num: "03", name: "Workflow Automation", desc: "Eliminate the manual work that's killing your margins. Build once, run forever.", href: "/services" },
  { num: "04", name: "Social Media & SEO", desc: "AI-assisted content and technical SEO. Consistent presence without the time cost.", href: "/services" },
];

const WORK_CARDS = [
  {
    href: "/portfolio/bloomin-acres",
    image: "/images/portfolio/bloomin-acres-homepage.png",
    tag: "Website — Agriculture / Retail",
    title: "Bloomin' Acres",
    sub: "Sourdough & fresh produce — from farm to first page of Google",
  },
  {
    href: "/portfolio/point-of-hope-church",
    image: "/images/portfolio/point-of-hope-church-homepage.png",
    tag: "Website — Church / Non-Profit",
    title: "Point of Hope Church",
    sub: "Modern presence for a growing congregation — built to welcome and connect.",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    name: "Discover",
    desc: "We learn your business, goals, and what you actually need — not what sounds impressive.",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    name: "Design",
    desc: "Tailored visuals and structure built around your customers, not templates.",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    name: "Build",
    desc: "Fast, clean, and production-grade from day one — deployed to global CDN.",
  },
  {
    num: "04",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    name: "Launch",
    desc: "You go live with full ownership of your code, domain, and assets.",
  },
];

const TESTIMONIALS = [
  {
    num: "001",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    avatarAlt: "Sarah Mitchell",
    quote: "OphidianAI rebuilt our website in under two weeks. The result was completely different from anything I'd seen in our industry — clean, fast, and it actually converts.",
    name: "Sarah Mitchell",
    role: "Owner, Westside Wellness Co.",
  },
  {
    num: "002",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    avatarAlt: "James Rodriguez",
    quote: "I was skeptical about AI-built websites until I saw the work. Eric delivered something that looked like it cost three times what we paid.",
    name: "James Rodriguez",
    role: "Operations Manager, Ridge Line Services",
  },
  {
    num: "003",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    avatarAlt: "Emily Chen",
    quote: "The automation workflow they built for us saves about 6 hours a week. That's time I actually get back now.",
    name: "Emily Chen",
    role: "Marketing Director, Elevate Commerce",
  },
];

// ── Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  useScrollReveal(pageRef as React.RefObject<HTMLElement>);

  return (
    <>
      <NavMain />
      <FloatingParticles />
      <div ref={pageRef} style={{ background: "#000", overflowX: "hidden" }}>
        <HeroSection />
        <StatsRow stats={STATS} />

        {/* Image Panel A: curtain-up */}
        <ImagePanel src="/images/about-visual.png" variant="curtain-up" size="medium" />

        <ServicesSection services={SERVICES} />
        <ShowcaseSection />

        <OrganicBreak />

        <WorkPreview cards={WORK_CARDS} />

        {/* Image Panel B: wipe-right */}
        <ImagePanel src="/images/hero-bg.png" variant="wipe-right" size="tall" />

        <ProcessSection steps={PROCESS_STEPS} />

        {/* Image Panel C: curtain-down with quote overlay */}
        <ImagePanel
          src="/images/testimonials-bg.png"
          variant="curtain-down"
          size="quote"
          objectPosition="center 40%"
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5) 100%)",
              zIndex: 1,
            }}
          />
          <div
            className="absolute"
            style={{ bottom: "40px", left: "48px", zIndex: 2, maxWidth: "560px" }}
          >
            <p
              className="text-[11px] tracking-[0.2em] uppercase mb-4"
              style={{ color: "rgba(57,255,20,0.5)" }}
            >
              OphidianAI
            </p>
            <p
              className="font-light leading-snug"
              style={{
                fontSize: "clamp(20px, 2.5vw, 32px)",
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "-0.01em",
                lineHeight: "1.45",
              }}
            >
              <strong className="font-semibold text-white">
                At the intersection of the ancient and the intelligent
              </strong>{" "}
              — where nature's patterns meet modern AI.
            </p>
          </div>
        </ImagePanel>

        <AboutStrip />
        <TestimonialsSection testimonials={TESTIMONIALS} />
        <CTASection />
      </div>
      <FooterMain />
    </>
  );
}
