# Organic Dark Homepage Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current OphidianAI homepage with the "organic dark" design — a full-bleed nature-backdrop layout with distinct per-section scroll transitions, a hero-shrinks-to-card effect, and a scroll-scrub serpent showcase.

**Architecture:** The homepage is a pure client component (`"use client"`) assembled from new section components. Each section component is self-contained with its own styles. Scroll reveal animations are driven by a single `useScrollReveal` hook (IntersectionObserver). The hero shrink and showcase scroll-scrub effects use direct `window.addEventListener('scroll', ...)` with `requestAnimationFrame` to avoid React re-render churn on every scroll tick. No new dependencies are required — everything is built on Tailwind CSS 4 inline styles where needed.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS 4, TypeScript, existing GSAP + useFrameSequence/useScrollProgress hooks for showcase canvas

---

## Chunk 1: Foundation — CSS classes + reveal hook

### Task 1: Add reveal animation CSS classes to globals.css

**Files:**
- Modify: `src/app/globals.css`

These classes are the animation vocabulary used across every section. Add them after the existing base styles.

- [ ] **Step 1: Open `src/app/globals.css` and add the following block after line ~145 (after the `.glass-card` definitions):**

```css
/* ============================================================
   SCROLL REVEAL ANIMATIONS — organic dark homepage
   ============================================================ */

/* Generic fade-up (stats, eyebrows, misc) */
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
              transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.reveal.visible { opacity: 1; transform: none; }

/* 3D flip — headlines (Brant Paints rotateX style) */
.reveal-flip {
  opacity: 0;
  transform: perspective(800px) rotateX(-72deg);
  transform-origin: 50% 0%;
  transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1),
              transform 0.95s cubic-bezier(0.16,1,0.3,1);
}
.reveal-flip.visible { opacity: 1; transform: perspective(800px) rotateX(0deg); }

/* Slide from right — service rows */
.reveal-right {
  opacity: 0;
  transform: translateX(56px);
  transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1),
              transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.reveal-right.visible { opacity: 1; transform: none; }

/* Slide from left — testimonials */
.reveal-left {
  opacity: 0;
  transform: translateX(-56px);
  transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1),
              transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.reveal-left.visible { opacity: 1; transform: none; }

/* Spring scale-up — cards (Brant Paints 0.74 → 1.0) */
.reveal-scale {
  opacity: 0;
  transform: scale(0.74);
  transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
              transform 1.0s cubic-bezier(0.34,1.4,0.64,1);
}
.reveal-scale.visible { opacity: 1; transform: scale(1); }

/* Masked text rise — Layrid translateY(100%) style */
.reveal-rise-wrap { overflow: hidden; display: block; }
.reveal-rise {
  display: block;
  transform: translateY(110%);
  transition: transform 1.0s cubic-bezier(0.16,1,0.3,1);
}
.reveal-rise.visible { transform: translateY(0%); }

/* Clip-path image panel variants */
.img-panel--curtain-up {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 1.25s cubic-bezier(0.16,1,0.3,1);
}
.img-panel--curtain-up.in-view { clip-path: inset(0 0 0% 0); }

.img-panel--wipe-right {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 1.4s cubic-bezier(0.16,1,0.3,1);
}
.img-panel--wipe-right.in-view { clip-path: inset(0 0% 0 0); }

.img-panel--curtain-down {
  clip-path: inset(100% 0 0 0);
  transition: clip-path 1.25s cubic-bezier(0.16,1,0.3,1);
}
.img-panel--curtain-down.in-view { clip-path: inset(0% 0 0 0); }

/* Stagger delays */
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
.reveal-delay-5 { transition-delay: 0.5s; }
```

- [ ] **Step 2: Verify the dev server still builds**

```bash
cd "c:/Claude Code/OphidianAI/engineering/projects/ophidian-ai"
npm run build 2>&1 | tail -20
```
Expected: Build succeeds, no CSS errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add scroll reveal animation classes for organic dark homepage"
```

---

### Task 2: Create useScrollReveal hook

**Files:**
- Create: `src/hooks/useScrollReveal.ts`

Single IntersectionObserver that activates `.visible` / `.in-view` on all reveal elements within a given container ref. Used by every section component.

- [ ] **Step 1: Create `src/hooks/useScrollReveal.ts`:**

```typescript
"use client";

import { useEffect } from "react";

const REVEAL_SELECTORS = [
  ".reveal",
  ".reveal-flip",
  ".reveal-right",
  ".reveal-left",
  ".reveal-scale",
  ".reveal-rise",
].join(", ");

const PANEL_SELECTORS = ".img-panel";

/**
 * Activates scroll reveal animations within a container element.
 * Uses IntersectionObserver to add .visible (text/UI elements)
 * and .in-view (image panels) classes when elements enter the viewport.
 *
 * Call once at the page level, passing the page root ref.
 */
export function useScrollReveal(
  containerRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Observer for text/UI reveals
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    // Observer for image panel clip-path reveals (lower threshold)
    const panelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            panelObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );

    container.querySelectorAll(REVEAL_SELECTORS).forEach((el) =>
      revealObserver.observe(el)
    );
    container.querySelectorAll(PANEL_SELECTORS).forEach((el) =>
      panelObserver.observe(el)
    );

    return () => {
      revealObserver.disconnect();
      panelObserver.disconnect();
    };
  }, [containerRef]);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "c:/Claude Code/OphidianAI/engineering/projects/ophidian-ai"
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```
Expected: No errors related to the new hook.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useScrollReveal.ts
git commit -m "feat: add useScrollReveal IntersectionObserver hook"
```

---

### Task 3: Create ImagePanel component

**Files:**
- Create: `src/components/ui/ImagePanel.tsx`

Reusable full-width image panel with built-in parallax support and clip-path reveal variants.

- [ ] **Step 1: Create `src/components/ui/ImagePanel.tsx`:**

```typescript
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type PanelVariant = "curtain-up" | "wipe-right" | "curtain-down" | "fade-scale";
type PanelSize = "medium" | "tall" | "quote";

interface ImagePanelProps {
  src: string;
  alt?: string;
  variant: PanelVariant;
  size?: PanelSize;
  objectPosition?: string;
  children?: React.ReactNode; // overlay content
}

const sizeStyles: Record<PanelSize, string> = {
  medium: "h-[55vh] min-h-[300px]",
  tall:   "h-[68vh] min-h-[400px]",
  quote:  "h-[44vh] min-h-[260px]",
};

const variantClass: Record<PanelVariant, string> = {
  "curtain-up":    "img-panel img-panel--curtain-up",
  "wipe-right":    "img-panel img-panel--wipe-right",
  "curtain-down":  "img-panel img-panel--curtain-down",
  "fade-scale":    "img-panel",  // uses default opacity/scale reveal
};

export function ImagePanel({
  src,
  alt = "",
  variant,
  size = "medium",
  objectPosition = "center",
  children,
}: ImagePanelProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Parallax: image translates slightly on scroll
  useEffect(() => {
    const img = imgRef.current;
    const wrap = wrapRef.current;
    if (!img || !wrap) return;

    function onScroll() {
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const pct = -rect.top / window.innerHeight;
      const offset = -7.5 + pct * 15;
      img!.style.transform = `translateY(${offset}%)`;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`${variantClass[variant]} ${sizeStyles[size]} w-full overflow-hidden relative`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full object-cover block"
        style={{
          height: "115%",
          objectPosition,
          transform: "translateY(-7.5%)",
          willChange: "transform",
        }}
      />
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ImagePanel.tsx
git commit -m "feat: add ImagePanel component with parallax + clip-path reveal variants"
```

---

## Chunk 2: Hero Section

### Task 4: Create HeroSection component

**Files:**
- Create: `src/components/hero/HeroSection.tsx`

The hero has three layers: forest background image, a vignette overlay, and the headline content. A 280vh sticky wrapper drives a scroll-controlled shrink-to-card effect on the inner container.

- [ ] **Step 1: Create `src/components/hero/HeroSection.tsx`:**

```typescript
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/**
 * OphidianAI homepage hero.
 *
 * Layout: 280vh scroll wrapper with sticky 100vh section.
 * As the user scrolls through the wrapper, the hero background
 * scales down and gains rounded corners — "shrinking to a card".
 * The headline and CTA fade out as shrink progresses.
 *
 * Background: hero-bg.png (dark forest atmosphere)
 * No video dependency — static image for reliability.
 */
export function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mediaRef   = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const media   = mediaRef.current;
    const vignette = vignetteRef.current;
    const content = contentRef.current;
    if (!wrapper || !media) return;

    function onScroll() {
      const rect = wrapper!.getBoundingClientRect();
      const wh = window.innerHeight;
      const totalScroll = wrapper!.offsetHeight - wh;
      const scrolled = -rect.top;
      // Use first 55% of the scroll range for the shrink animation
      const progress = Math.max(0, Math.min(1, scrolled / (totalScroll * 0.55)));

      if (progress > 0) {
        const scale = 1 - progress * 0.28;
        const br = progress * 20;
        const mx = progress * 4;
        const my = progress * 3;
        media!.style.transform = `scale(${scale})`;
        media!.style.borderRadius = `${br}px`;
        media!.style.margin = `${my}% ${mx}%`;
        media!.style.width = `${100 - mx * 2}%`;
        media!.style.height = `${100 - my * 2}%`;
        if (vignette) vignette.style.opacity = String(1 - progress * 0.85);
        if (content) content.style.opacity = String(1 - progress * 2);
      } else {
        media!.style.transform = "";
        media!.style.borderRadius = "";
        media!.style.margin = "";
        media!.style.width = "";
        media!.style.height = "";
        if (vignette) vignette.style.opacity = "";
        if (content) content.style.opacity = "";
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: "280vh", position: "relative" }}>
      <section
        className="sticky top-0 h-screen min-h-[720px] overflow-hidden flex items-end"
        style={{ padding: "0 48px 80px", background: "#000" }}
      >
        {/* Background image — scales/shrinks on scroll */}
        <div
          ref={mediaRef}
          className="absolute inset-0 overflow-hidden"
          style={{ willChange: "transform, border-radius", transition: "none" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-bg.png"
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.7 }}
          />
          {/* Subtle radial tint overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 65% at 65% 50%, rgba(6,18,5,0.4) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Vignette — darkens edges, fades on scroll */}
        <div
          ref={vignetteRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            background: `
              linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.05) 100%),
              linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 55%)
            `,
          }}
        />

        {/* Content — fades out as shrink progresses */}
        <div
          ref={contentRef}
          className="relative max-w-[620px]"
          style={{ zIndex: 10, willChange: "opacity" }}
        >
          <p
            className="text-[11px] font-medium tracking-[0.2em] uppercase mb-5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            AI Agency — Columbus, Indiana &nbsp;
            <span className="text-primary">●</span>
            &nbsp; Est. 2026
          </p>

          <h1
            className="font-extrabold text-white leading-none tracking-tight"
            style={{ fontSize: "clamp(44px, 7vw, 88px)", letterSpacing: "-0.03em" }}
          >
            We build the<br />
            <em className="not-italic text-primary">tools</em> that run<br />
            your business.
          </h1>

          <p
            className="mt-6 font-light leading-relaxed"
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "480px",
              lineHeight: "1.75",
            }}
          >
            From custom websites to AI integrations — we design, build, and deploy
            everything your business needs to compete in the next decade.
          </p>

          <div className="mt-10 flex gap-4 items-center">
            <Link
              href="/contact"
              className="inline-block bg-primary text-black text-[12px] font-bold tracking-[0.08em] uppercase px-7 py-[14px] rounded-full transition-opacity hover:opacity-85 whitespace-nowrap"
            >
              Start a Project
            </Link>
            <Link
              href="/portfolio"
              className="text-[13px] font-normal tracking-[0.04em] flex items-center gap-2 transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              See our work <span>→</span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ zIndex: 10, opacity: 0.3, animation: "scrollPulse 2s ease-in-out infinite" }}
        >
          <span className="text-[10px] tracking-[0.18em] uppercase text-white">Scroll</span>
          <div
            className="w-px h-10"
            style={{ background: "linear-gradient(to bottom, #fff, transparent)" }}
          />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Add the `scrollPulse` keyframe to `globals.css` (inside the reveal animation block):**

```css
@keyframes scrollPulse {
  0%, 100% { opacity: 0.25; transform: translateX(-50%) translateY(0); }
  50%       { opacity: 0.5;  transform: translateX(-50%) translateY(4px); }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/HeroSection.tsx src/app/globals.css
git commit -m "feat: add HeroSection with shrink-to-card scroll effect"
```

---

## Chunk 3: Content Sections

### Task 5: Create StatsRow component

**Files:**
- Create: `src/components/sections/StatsRow.tsx`

Simple 4-column stat bar. Counter animation on first intersection.

- [ ] **Step 1: Create `src/components/sections/StatsRow.tsx`:**

```typescript
"use client";

import { useEffect, useRef } from "react";

interface Stat {
  value: string;
  label: string;
  countTo?: number; // if set, animates from 0 to countTo
}

interface StatsRowProps {
  stats: Stat[];
}

export function StatsRow({ stats }: StatsRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const counters = rowRef.current?.querySelectorAll<HTMLElement>("[data-count]");
    if (!counters?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = Number(el.dataset.count);
          let current = 0;
          const step = Math.ceil(target / 30);
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current + "+";
            if (current >= target) clearInterval(timer);
          }, 40);
          observer.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-4"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#000",
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          className="reveal"
          style={{
            padding: "36px 48px",
            borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
          }}
        >
          <div
            className="text-primary font-bold leading-none"
            style={{ fontSize: "40px", letterSpacing: "-0.03em" }}
            data-count={stat.countTo ?? undefined}
          >
            {stat.value}
          </div>
          <div
            className="mt-2 text-[11px] font-normal tracking-[0.1em] uppercase"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/StatsRow.tsx
git commit -m "feat: add StatsRow component with counter animation"
```

---

### Task 6: Create ServicesSection component

**Files:**
- Create: `src/components/sections/ServicesSection.tsx`

Two-column layout: left has the headline + description, right has a vertical list of service rows. Headline uses `reveal-flip`; service rows use `reveal-right` with stagger.

- [ ] **Step 1: Create `src/components/sections/ServicesSection.tsx`:**

```typescript
import Link from "next/link";

interface Service {
  num: string;
  name: string;
  desc: string;
  href?: string;
}

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section style={{ padding: "120px 48px", position: "relative", overflow: "hidden" }}>
      <div
        className="relative grid gap-20 items-start mx-auto"
        style={{
          gridTemplateColumns: "1fr 1fr",
          maxWidth: "1200px",
          zIndex: 1,
        }}
      >
        {/* Left: headline + copy */}
        <div>
          <div className="reveal-flip">
            <p
              className="text-[11px] font-medium tracking-[0.2em] uppercase mb-5"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              What we build
            </p>
            <h2
              className="font-bold text-white"
              style={{
                fontSize: "clamp(32px, 3.5vw, 50px)",
                letterSpacing: "-0.025em",
                lineHeight: "1.12",
              }}
            >
              Tools that<br />
              grow{" "}
              <em className="not-italic text-primary">with you.</em>
            </h2>
            <p
              className="mt-5 font-light leading-loose"
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.45)",
                maxWidth: "360px",
                lineHeight: "1.8",
              }}
            >
              Organic systems adapt. Evolve. Strengthen over time. We build AI tools
              and digital infrastructure that do the same — growing smarter with every
              interaction.
            </p>
            <Link
              href="/services"
              className="mt-9 inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.1em] uppercase text-primary opacity-70 hover:opacity-100 transition-opacity"
            >
              View all services →
            </Link>
          </div>
        </div>

        {/* Right: service rows */}
        <div className="flex flex-col">
          {services.map((service, i) => (
            <Link
              key={service.num}
              href={service.href ?? "#"}
              className={`reveal-right reveal-delay-${i + 1} grid items-center gap-5 py-[26px] cursor-pointer no-underline text-inherit group`}
              style={{
                gridTemplateColumns: "44px 1fr 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
              }}
            >
              <span
                className="text-[11px] font-normal tabular-nums"
                style={{ color: "rgba(255,255,255,0.18)" }}
              >
                {service.num}
              </span>
              <div>
                <div
                  className="text-[17px] font-medium tracking-[-0.01em] transition-colors group-hover:text-primary"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {service.name}
                </div>
                <div
                  className="mt-1 text-[13px] font-light leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  {service.desc}
                </div>
              </div>
              <span
                className="text-[18px] justify-self-end transition-all group-hover:translate-x-[5px] group-hover:text-primary"
                style={{ color: "rgba(255,255,255,0.15)" }}
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/ServicesSection.tsx
git commit -m "feat: add ServicesSection with flip headline + right-slide service rows"
```

---

### Task 7: Create ShowcaseSection component

**Files:**
- Create: `src/components/sections/ShowcaseSection.tsx`

350vh scroll wrapper with a sticky section. The left side has text; the right side is a canvas that plays the existing serpent frame sequence in sync with scroll progress. Reuses `useFrameSequence` and `useScrollProgress` from the hero components.

- [ ] **Step 1: Create `src/components/sections/ShowcaseSection.tsx`:**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { useFrameSequence } from "@/components/hero/useFrameSequence";
import { useScrollProgress } from "@/components/hero/useScrollProgress";

const TOTAL_FRAMES = 121;

export function ShowcaseSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

  const totalFrames = isMobile ? 80 : TOTAL_FRAMES;
  const { images, isReady } = useFrameSequence("/frames/serpent/frame-", totalFrames);
  const { progressRef }     = useScrollProgress(wrapperRef);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = 1280;
    canvas.height = 720;
  }, []);

  // Draw loop
  useEffect(() => {
    if (!isReady || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let lastFrame = -1;

    function render() {
      const frameIndex = Math.min(
        Math.floor(progressRef.current * (images.length - 1)),
        images.length - 1
      );
      if (frameIndex !== lastFrame && images[frameIndex]) {
        ctx!.clearRect(0, 0, 1280, 720);
        ctx!.drawImage(images[frameIndex], 0, 0, 1280, 720);
        lastFrame = frameIndex;
      }
      rafId = requestAnimationFrame(render);
    }
    render();
    return () => cancelAnimationFrame(rafId);
  }, [isReady, images, progressRef]);

  return (
    <div ref={wrapperRef} style={{ height: "350vh", position: "relative" }}>
      <section
        className="sticky top-0 h-screen flex items-center overflow-hidden"
        style={{ background: "#000" }}
      >
        {/* Serpent canvas — right side */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: "-4%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "58%",
            zIndex: 1,
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full block"
            style={{ aspectRatio: "16/9", mixBlendMode: "lighten" }}
          />
        </div>

        {/* Left content */}
        <div
          className="relative"
          style={{ zIndex: 10, padding: "120px 48px", maxWidth: "560px" }}
        >
          <span className="reveal-rise-wrap">
            <span
              className="reveal-rise block text-[11px] font-medium tracking-[0.2em] uppercase mb-6"
              style={{ color: "rgba(57,255,20,0.5)" }}
            >
              The Machine
            </span>
          </span>

          <h2
            className="reveal-flip font-extrabold leading-none"
            style={{
              fontSize: "clamp(40px, 5vw, 72px)",
              letterSpacing: "-0.03em",
            }}
          >
            Nature.<br />
            <em className="not-italic text-primary">Engineered.</em>
          </h2>

          <p
            className="reveal reveal-delay-2 mt-6 font-light leading-loose"
            style={{
              fontSize: "15px",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "420px",
              lineHeight: "1.8",
            }}
          >
            The serpent has always been a symbol of intelligence, transformation,
            and renewal. OphidianAI is that metaphor made real — the organic and
            the computational, fused into tools that think.
          </p>

          <div
            className="reveal reveal-delay-3 my-7"
            style={{ width: "40px", height: "1px", background: "rgba(57,255,20,0.3)" }}
          />

          <div className="reveal-scale reveal-delay-4 flex gap-10">
            {[
              { val: "AI-first",   label: "Development" },
              { val: "Solo",       label: "Operated" },
              { val: "Full-stack", label: "Delivery" },
            ].map(({ val, label }) => (
              <div key={val}>
                <div
                  className="font-bold"
                  style={{ fontSize: "28px", letterSpacing: "-0.02em" }}
                >
                  {val}
                </div>
                <div
                  className="text-[11px] tracking-[0.1em] uppercase mt-1"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ShowcaseSection.tsx
git commit -m "feat: add ShowcaseSection with scroll-scrub serpent canvas"
```

---

### Task 8: Create WorkPreview component

**Files:**
- Create: `src/components/sections/WorkPreview.tsx`

Portfolio cards with scale-up reveal. Headline uses `reveal-flip`.

- [ ] **Step 1: Create `src/components/sections/WorkPreview.tsx`:**

```typescript
import Link from "next/link";
import Image from "next/image";

interface WorkCard {
  href: string;
  image: string;
  tag: string;
  title: string;
  sub: string;
}

interface WorkPreviewProps {
  cards: WorkCard[];
}

export function WorkPreview({ cards }: WorkPreviewProps) {
  return (
    <section style={{ padding: "120px 48px", background: "#000" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          className="flex justify-between items-end mb-16"
        >
          <h2
            className="reveal-flip font-bold"
            style={{
              fontSize: "clamp(28px, 3.5vw, 48px)",
              letterSpacing: "-0.025em",
              lineHeight: "1.1",
            }}
          >
            Selected{" "}
            <em className="not-italic text-primary">work.</em>
          </h2>
          <Link
            href="/portfolio"
            className="reveal text-[12px] font-medium tracking-[0.1em] uppercase text-primary opacity-65 hover:opacity-100 transition-opacity whitespace-nowrap mb-2"
          >
            View all projects →
          </Link>
        </div>

        {/* Grid */}
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "1.4fr 1fr" }}
        >
          {cards.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className={`reveal-scale${i > 0 ? ` reveal-delay-${i + 1}` : ""} block overflow-hidden cursor-pointer no-underline text-inherit group`}
              style={{ background: "#000" }}
            >
              <div className="overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full block transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-85"
                  style={{ aspectRatio: "16/10", objectFit: "cover", opacity: 0.7 }}
                />
              </div>
              <div style={{ padding: "24px 0 8px" }}>
                <div
                  className="text-[10px] font-medium tracking-[0.16em] uppercase mb-2"
                  style={{ color: "rgba(57,255,20,0.5)" }}
                >
                  {card.tag}
                </div>
                <div
                  className="text-[20px] font-semibold"
                  style={{ letterSpacing: "-0.015em" }}
                >
                  {card.title}
                </div>
                <div
                  className="mt-1.5 text-[13px] font-light"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {card.sub}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/WorkPreview.tsx
git commit -m "feat: add WorkPreview section with scale-up card reveals"
```

---

### Task 9: Create ProcessSection component

**Files:**
- Create: `src/components/sections/ProcessSection.tsx`

Process image strip + 4-card grid. Headline uses `reveal-flip`; each card uses `reveal-scale` with stagger.

- [ ] **Step 1: Create `src/components/sections/ProcessSection.tsx`:**

```typescript
interface Step {
  num: string;
  icon: React.ReactNode;
  name: string;
  desc: string;
}

interface ProcessSectionProps {
  steps: Step[];
}

export function ProcessSection({ steps }: ProcessSectionProps) {
  return (
    <section style={{ padding: "120px 48px", background: "#000" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <p
            className="reveal text-[11px] font-medium tracking-[0.18em] uppercase mb-4"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            How we work
          </p>
          <h2
            className="reveal-flip reveal-delay-1 font-bold"
            style={{
              fontSize: "clamp(28px, 3vw, 42px)",
              letterSpacing: "-0.025em",
              lineHeight: "1.15",
            }}
          >
            Four steps.<br />
            <em className="not-italic text-primary">Zero confusion.</em>
          </h2>
        </div>

        {/* Process image strip */}
        <div
          className="reveal w-full overflow-hidden rounded-[10px] mb-12 relative"
          style={{ height: "260px" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/about-visual.png"
            alt=""
            className="w-full h-full object-cover block"
            style={{ objectPosition: "center 60%", opacity: 0.55 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%),
                linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.5) 100%)
              `,
            }}
          />
        </div>

        {/* Cards grid */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)" }}
        >
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`reveal-scale reveal-delay-${i + 1} relative overflow-hidden`}
              style={{
                background: "#000",
                padding: "40px 32px",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#060e06")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#000")}
            >
              {/* Subtle glow corner */}
              <div
                className="absolute pointer-events-none"
                style={{
                  bottom: "-50px",
                  right: "-50px",
                  width: "140px",
                  height: "140px",
                  background: "radial-gradient(circle, rgba(57,255,20,0.05) 0%, transparent 70%)",
                  borderRadius: "50%",
                }}
              />
              <span
                className="block text-[11px] tracking-[0.1em] mb-8"
                style={{ color: "rgba(57,255,20,0.4)" }}
              >
                {step.num}
              </span>
              <div
                className="mb-5 opacity-40"
                style={{ width: "32px", height: "32px" }}
              >
                {step.icon}
              </div>
              <div
                className="text-[17px] font-semibold tracking-[-0.01em] mb-3"
              >
                {step.name}
              </div>
              <div
                className="text-[13px] font-light leading-loose"
                style={{ color: "rgba(255,255,255,0.3)", lineHeight: "1.75" }}
              >
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/ProcessSection.tsx
git commit -m "feat: add ProcessSection with image strip + scale-up cards"
```

---

### Task 10: Create AboutStrip component

**Files:**
- Create: `src/components/sections/AboutStrip.tsx`

Full-bleed nature image section with text overlaid at bottom-left. The eyebrow uses a masked rise; the h2 uses a flip.

- [ ] **Step 1: Create `src/components/sections/AboutStrip.tsx`:**

```typescript
import Link from "next/link";

export function AboutStrip() {
  return (
    <section
      className="relative overflow-hidden flex items-end"
      style={{ height: "60vh", minHeight: "400px" }}
    >
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/about-visual.png"
          alt=""
          className="w-full block object-cover"
          style={{
            height: "115%",
            objectPosition: "center 30%",
            transform: "translateY(-7.5%)",
            willChange: "transform",
          }}
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%),
            linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 60%)
          `,
        }}
      />

      {/* Content */}
      <div
        className="relative"
        style={{ zIndex: 10, padding: "0 48px 64px", maxWidth: "700px" }}
      >
        <span className="reveal-rise-wrap">
          <span
            className="reveal-rise block text-[11px] font-medium tracking-[0.2em] uppercase mb-4"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            About OphidianAI
          </span>
        </span>

        <h2
          className="reveal-flip reveal-delay-1 font-bold"
          style={{
            fontSize: "clamp(28px, 4vw, 52px)",
            letterSpacing: "-0.025em",
            lineHeight: "1.1",
          }}
        >
          One studio.<br />
          Full-stack delivery.
        </h2>

        <p
          className="reveal reveal-delay-2 mt-4 font-light leading-loose"
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "480px",
            lineHeight: "1.8",
          }}
        >
          OphidianAI is a solo AI agency based in Columbus, Indiana. One person,
          fully AI-augmented — which means your project gets senior attention at
          every stage, not handed off to a junior team.
        </p>

        <Link
          href="/about"
          className="reveal reveal-delay-3 mt-6 inline-flex items-center gap-2 text-[13px] transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Learn more <span>→</span>
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/AboutStrip.tsx
git commit -m "feat: add AboutStrip full-bleed image section"
```

---

### Task 11: Create TestimonialsSection component

**Files:**
- Create: `src/components/sections/TestimonialsSection.tsx`

Editorial list layout: numbered rows with avatar + quote. Headline uses `reveal-flip`; rows use `reveal-left` with stagger.

- [ ] **Step 1: Create `src/components/sections/TestimonialsSection.tsx`:**

```typescript
interface Testimonial {
  num: string;
  avatar: string;
  avatarAlt: string;
  quote: string;
  name: string;
  role: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ padding: "120px 48px", background: "#0b1a0b" }}
    >
      {/* Faint glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(57,255,20,0.05) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative"
        style={{ zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <h2
            className="reveal-flip font-bold"
            style={{
              fontSize: "clamp(28px, 3vw, 42px)",
              letterSpacing: "-0.025em",
              lineHeight: "1.15",
            }}
          >
            What clients<br />say.
          </h2>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {testimonials.map((t, i) => (
            <div
              key={t.num}
              className={`reveal-left${i > 0 ? ` reveal-delay-${Math.min(i * 2, 5)}` : ""} grid items-start gap-7 py-10`}
              style={{
                gridTemplateColumns: "56px auto 1fr",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.05)" : undefined,
              }}
            >
              <span
                className="text-[11px] tracking-[0.05em] pt-1.5"
                style={{ color: "rgba(255,255,255,0.15)" }}
              >
                {t.num}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.avatar}
                alt={t.avatarAlt}
                className="rounded-full object-cover flex-shrink-0"
                style={{
                  width: "48px",
                  height: "48px",
                  opacity: 0.75,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <div>
                <p
                  className="font-light leading-loose mb-4"
                  style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: "1.75",
                    letterSpacing: "0.005em",
                  }}
                >
                  "{t.quote}"
                </p>
                <div className="flex gap-2 items-center">
                  <span
                    className="text-[12px] font-medium tracking-[0.04em]"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {t.name}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "12px" }}>·</span>
                  <span
                    className="text-[12px] font-light tracking-[0.03em]"
                    style={{ color: "rgba(57,255,20,0.4)" }}
                  >
                    {t.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/TestimonialsSection.tsx
git commit -m "feat: add TestimonialsSection with left-slide row reveals"
```

---

### Task 12: Create OrganicBreak and CTASection components

**Files:**
- Create: `src/components/sections/OrganicBreak.tsx`
- Create: `src/components/sections/CTASection.tsx`

- [ ] **Step 1: Create `src/components/sections/OrganicBreak.tsx`:**

```typescript
"use client";

import { useEffect, useRef } from "react";

export function OrganicBreak() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    function onScroll() {
      const container = img!.closest(".organic-break");
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = -rect.top / window.innerHeight;
      img!.style.transform = `translateY(${-7.5 + pct * 15}%)`;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="organic-break relative overflow-hidden flex items-center justify-center"
      style={{ height: "520px" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/images/break-bg.png"
        alt=""
        className="absolute inset-0 w-full object-cover block"
        style={{ height: "115%", transform: "translateY(-7.5%)", willChange: "transform" }}
      />
      {/* Edge overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.75) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)
          `,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/sections/CTASection.tsx`:**

```typescript
import Link from "next/link";

export function CTASection() {
  return (
    <section
      className="text-center relative overflow-hidden"
      style={{ padding: "180px 48px" }}
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(57,255,20,0.04) 0%, transparent 70%),
            linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)
          `,
        }}
      />

      <div className="relative" style={{ zIndex: 2 }}>
        <p
          className="reveal text-[11px] font-medium tracking-[0.2em] uppercase mb-6"
          style={{ color: "rgba(57,255,20,0.4)" }}
        >
          Let's build something
        </p>

        <h2
          className="reveal-flip reveal-delay-1 font-extrabold mx-auto"
          style={{
            fontSize: "clamp(40px, 5.5vw, 72px)",
            letterSpacing: "-0.03em",
            lineHeight: "1.05",
            maxWidth: "640px",
          }}
        >
          Ready to{" "}
          <em className="not-italic text-primary">evolve?</em>
        </h2>

        <p
          className="reveal reveal-delay-2 mt-6 font-light leading-loose mx-auto"
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.4)",
            maxWidth: "420px",
            lineHeight: "1.75",
          }}
        >
          Book a free 30-minute discovery call. We'll map out exactly what you
          need — no pitch, no pressure.
        </p>

        <div className="reveal reveal-delay-3 mt-12 flex gap-4 items-center justify-center">
          <Link
            href="/contact"
            className="inline-block bg-primary text-black text-[12px] font-bold tracking-[0.08em] uppercase px-7 py-[14px] rounded-full transition-opacity hover:opacity-85"
          >
            Book a Free Call
          </Link>
          <Link
            href="mailto:eric.lefler@ophidianai.com"
            className="text-[13px] font-light flex items-center gap-2 transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Or email us <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/OrganicBreak.tsx src/components/sections/CTASection.tsx
git commit -m "feat: add OrganicBreak parallax section + CTASection"
```

---

## Chunk 4: Wire Up the Homepage

### Task 13: Rewrite page.tsx to assemble the organic dark layout

**Files:**
- Modify: `src/app/page.tsx`

This replaces the current homepage with the organic dark design. The edit mode dual-path logic is removed — the new design is the single path.

- [ ] **Step 1: Replace `src/app/page.tsx` with:**

```typescript
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
    avatar: "/images/portrait-1.png",
    avatarAlt: "Sarah Mitchell",
    quote: "OphidianAI rebuilt our website in under two weeks. The result was completely different from anything I'd seen in our industry — clean, fast, and it actually converts.",
    name: "Sarah Mitchell",
    role: "Owner, Westside Wellness Co.",
  },
  {
    num: "002",
    avatar: "/images/portrait-2.png",
    avatarAlt: "James Rodriguez",
    quote: "I was skeptical about AI-built websites until I saw the work. Eric delivered something that looked like it cost three times what we paid.",
    name: "James Rodriguez",
    role: "Operations Manager, Ridge Line Services",
  },
  {
    num: "003",
    avatar: "/images/portrait-3.png",
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
```

- [ ] **Step 2: Verify the TypeScript build passes**

```bash
cd "c:/Claude Code/OphidianAI/engineering/projects/ophidian-ai"
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -30
```
Expected: No errors. Fix any import path issues if found.

- [ ] **Step 3: Run the dev server and verify it loads**

```bash
npm run dev &
sleep 5
```
Then open `http://localhost:3000` — the page should load without a white screen.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire organic dark homepage — all sections assembled"
```

---

## Chunk 5: Polish + portrait images

### Task 14: Add portrait placeholder images

**Files:**
- Check `public/images/` for `portrait-1.png`, `portrait-2.png`, `portrait-3.png`

The testimonials reference portrait images. These may not exist yet.

- [ ] **Step 1: Check if portrait images exist**

```bash
ls "c:/Claude Code/OphidianAI/engineering/projects/ophidian-ai/public/images/" | grep portrait
```

- [ ] **Step 2: Portrait images do not exist in the repo. Use `randomuser.me` URLs in the testimonials data in `page.tsx`.**

In `src/app/page.tsx`, change the `TESTIMONIALS` avatar values to:

```typescript
const TESTIMONIALS = [
  {
    num: "001",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    avatarAlt: "Sarah Mitchell",
    // ... rest unchanged
  },
  {
    num: "002",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    avatarAlt: "James Rodriguez",
    // ... rest unchanged
  },
  {
    num: "003",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    avatarAlt: "Emily Chen",
    // ... rest unchanged
  },
];
```

- [ ] **Step 4: Commit any new image files**

```bash
git add public/images/portrait-*.png 2>/dev/null || true
git commit -m "chore: add portrait images for testimonials section" 2>/dev/null || echo "Nothing to commit"
```

---

### Task 15: Visual QA — screenshot the homepage at key scroll positions

**Files:** None (read-only verification)

- [ ] **Step 1: Start the dev server if not already running**

```bash
cd "c:/Claude Code/OphidianAI/engineering/projects/ophidian-ai"
npm run dev
```
Wait for "Ready" output.

- [ ] **Step 2: Take viewport screenshot of the hero**

Using Playwright MCP: navigate to `http://localhost:3000`, take screenshot. Verify:
- Forest background fills viewport
- "We build the tools that run your business." headline visible
- Green "tools" word in brand green (#39FF14)
- Nav bar visible at top

- [ ] **Step 3: Scroll to stats + image panel A**

Scroll to ~3000px. Verify:
- 4 stat columns visible with green numbers
- Image panel below (misty forest) with curtain-up effect (fully revealed)

- [ ] **Step 4: Scroll to services section**

Verify:
- Left: headline and service description
- Right: 4 service rows with numbers and descriptions

- [ ] **Step 5: Scroll to showcase section**

Scroll to ~8000px. Verify:
- Serpent canvas visible on right side
- "Nature. Engineered." headline on left
- Canvas is drawing frames (not blank)

- [ ] **Step 6: Scroll to testimonials and CTA**

Verify:
- 3 testimonial rows with avatars
- CTA section with "Ready to evolve?" headline

- [ ] **Step 7: Check browser console for errors**

```javascript
// In browser console:
console.log(document.querySelectorAll('[class*="reveal"]').length)
```
Expected: > 0, and no red errors in console.

- [ ] **Step 8: Commit any fixes found during QA**

```bash
git add -A
git commit -m "fix: QA fixes from organic dark homepage review"
```

---

## Chunk 6: Production Build Verification

### Task 16: Run full production build and verify deployment readiness

**Files:** None (build only)

- [ ] **Step 1: Run production build**

```bash
cd "c:/Claude Code/OphidianAI/engineering/projects/ophidian-ai"
npm run build 2>&1 | tail -40
```
Expected: `✓ Compiled successfully` with no errors. The homepage (`/`) should appear in the static routes list.

- [ ] **Step 2: Fix any build errors**

Common issues to check:
- `"use client"` missing on components that use hooks (`useEffect`, `useRef`)
- Server component importing client component with inline SVG (add `"use client"` or extract SVG)
- Missing imports

Add `"use client"` to the top of any component that uses React hooks (`useEffect`, `useRef`, `useState`). Components that are purely presentational (no hooks, no event handlers) can remain server components.

Specifically: `ServicesSection`, `WorkPreview`, `ProcessSection`, `TestimonialsSection`, `CTASection`, `AboutStrip` — these are presentational. They do NOT need `"use client"`. `HeroSection`, `ShowcaseSection`, `OrganicBreak`, `StatsRow`, `ImagePanel` DO need `"use client"` due to `useEffect`/`useRef`.

- [ ] **Step 3: Re-run build after fixes**

```bash
npm run build 2>&1 | tail -20
```
Expected: Clean build.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: ensure client/server component boundaries correct for production build"
```

---

## Notes for Implementer

**Key patterns to follow:**
- All inline styles use the exact values from the approved `organic-dark.html` brainstorm
- `"use client"` is required on any component using `useEffect`, `useRef`, `useState`, or event handlers
- `image-next` (`<Image />`) can be used for static assets, but `<img>` with `style={{}}` is fine too since we're controlling exact pixel positioning for parallax effects
- The `useScrollReveal` hook must be called once at the **page level** — it scans the entire page subtree
- Never use `overflow: hidden` on the `<body>` or `<html>` — the sticky scroll wrappers need full scroll
- The `VideoBackground` in `layout.tsx` is still there (it renders on all pages). It won't conflict because `z-index: 0` puts it behind the hero background image

**Brand constants:**
- Brand green: `#39FF14` (mapped to `text-primary` / `bg-primary` in Tailwind config)
- Pure black background: `#000000`
- Forest dark: `#0b1a0b` (used for testimonials section background)
- Font sizes and spacing are in inline styles to exactly match the brainstorm — do not convert to Tailwind classes unless they map exactly

**EditModeToolbar:** `layout.tsx` still renders `EditModeProvider` and `EditModeToolbar` globally. The new homepage removes all `useEditMode`/`usePageContent` wiring — the toolbar will render silently with no editable targets on this page. This is intentional and not a bug. Leave `layout.tsx` unchanged.

**Frame assets:** Already in `public/frames/serpent/` — 121 WebP frames, frame-0001.webp through frame-0121.webp. These are used by `ShowcaseSection` via `useFrameSequence`.
