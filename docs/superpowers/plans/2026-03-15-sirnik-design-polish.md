# Sirnik-Inspired Design Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply five high-impact design patterns from sirnik.co to OphidianAI: letter-split nav animation, status indicators, editorial numbered testimonials, two-step contact form, and oversized wordmark footer.

**Architecture:** All changes are isolated UI component updates. No new routes, no API changes, no shared state between tasks. Each task can be committed and deployed independently. The scroll-scrub hero stays untouched — it will improve when higher-quality assets are available.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 4, GSAP (already installed), TypeScript, Space Mono + Inter fonts (already loaded)

---

## Task 1: SplitText Utility + Letter-Split Nav Animation

**What it looks like:** Each nav link renders two stacked copies of the text. On hover, the top copy slides up and out while the bottom copy slides up into view. Individual letters can stagger for polish. The "AI" in the brand stays venom green.

**Files:**
- Create: `src/components/ui/SplitText.tsx`
- Modify: `src/components/layout/NavMain.tsx`

### Reference — current NavMain.tsx
Desktop nav uses anchor tags like:
```tsx
<Link href="/services" className="text-sm ...">Services</Link>
```
Change each to use `<SplitNavLink>`.

---

- [ ] **Step 1: Create SplitText component**

`src/components/ui/SplitText.tsx`:
```tsx
"use client";

interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number; // ms per character stagger
}

/**
 * Renders text as individually-wrapped characters for letter-by-letter animation.
 * Renders two stacked copies; CSS hover on parent triggers slide transition.
 *
 * Usage:
 *   <a className="group overflow-hidden relative inline-flex">
 *     <SplitText text="Services" />
 *   </a>
 *
 * The parent needs: `group`, `overflow-hidden`, and `relative inline-flex`
 * (or `inline-block`).
 */
export function SplitText({ text, className = "", charClassName = "", delay = 30 }: SplitTextProps) {
  const chars = text.split("");

  return (
    <>
      {/* Top copy — visible at rest, slides up on hover */}
      <span
        aria-hidden="true"
        className={`flex transition-transform duration-300 ease-out group-hover:-translate-y-full ${className}`}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-transform duration-300 ease-out ${charClassName}`}
            style={{ transitionDelay: `${i * delay}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      {/* Bottom copy — starts below, slides up on hover */}
      <span
        className={`flex absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 ${className}`}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-transform duration-300 ease-out ${charClassName}`}
            style={{ transitionDelay: `${i * delay}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      {/* Accessible text (sr-only) */}
      <span className="sr-only">{text}</span>
    </>
  );
}
```

- [ ] **Step 2: Add SplitNavLink helper to NavMain.tsx**

In `src/components/layout/NavMain.tsx`, import SplitText and create a thin wrapper used for all desktop nav links:

```tsx
import { SplitText } from "@/components/ui/SplitText";

// Inside the component, replace each desktop Link with:
<Link
  href="/services"
  className="group relative inline-flex overflow-hidden text-sm text-foreground/70 hover:text-foreground transition-colors duration-200"
>
  <SplitText text="Services" delay={20} />
</Link>
```

Apply to all 7 nav links: Home, Services, Projects, Pricing, About, Blog, Contact.

The "Get Started" CTA button keeps its current styling — no split text on buttons.

- [ ] **Step 3: Verify build passes**

```bash
cd "c:/Claude Code/OphidianAI/engineering/projects/ophidian-ai"
npm run build 2>&1 | tail -20
```
Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/SplitText.tsx src/components/layout/NavMain.tsx
git commit -m "feat: letter-split nav animation with SplitText utility"
```

---

## Task 2: Status Indicators in Nav (Available Pill + Live Local Time)

**What it looks like:** Below or beside the nav, a small status row shows:
- Green pulsing dot + "Available for new clients" pill
- "Columbus, IN · [live time] ET"

This mirrors Sirnik's "Based in Poland · Worldwide (2:48 PM)" and "Available for new projects" — signals credibility and approachability without a word of copy.

**Files:**
- Create: `src/components/ui/NavStatusBar.tsx`
- Modify: `src/components/layout/NavMain.tsx`

---

- [ ] **Step 1: Create NavStatusBar component**

`src/components/ui/NavStatusBar.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";

function useLocalTime(timezone = "America/Indiana/Indianapolis") {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: timezone,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return time;
}

export function NavStatusBar() {
  const time = useLocalTime();

  return (
    <div className="flex items-center gap-6 text-xs text-foreground/40 tracking-wide">
      {/* Available pill */}
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
        </span>
        <span className="text-foreground/60">Available for new clients</span>
      </span>

      {/* Live time */}
      {time && (
        <span className="hidden md:block">
          Columbus, IN · {time} ET
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add NavStatusBar to NavMain.tsx**

In the nav, add the status bar below the main nav row. Exact placement: inside the nav container, below the logo/links row, above the border-b line (or in a second row of the header). Keep it subtle — small font, muted color.

```tsx
import { NavStatusBar } from "@/components/ui/NavStatusBar";

// In the return, after the main nav row:
<div className="border-t border-white/5 px-6 py-1.5">
  <NavStatusBar />
</div>
```

- [ ] **Step 3: Verify build + visual check**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/NavStatusBar.tsx src/components/layout/NavMain.tsx
git commit -m "feat: add available status pill and live ET time to nav"
```

---

## Task 3: Editorial Numbered Testimonials

**What it looks like:** Replaces the animated scroll-column testimonials with a static editorial list. Each testimonial is a row with:
- Number (001, 002...)
- Name + location
- Quote text

Clean, readable, no animation. Modeled on Sirnik's testimonials section.

**Files:**
- Create: `src/components/sections/TestimonialsEditorial.tsx`
- Modify: `src/app/page.tsx` (swap component)

---

- [ ] **Step 1: Create TestimonialsEditorial component**

`src/components/sections/TestimonialsEditorial.tsx`:
```tsx
const testimonials = [
  {
    name: "Sarah Mitchell",
    location: "Columbus, OH",
    role: "Small Business Owner",
    quote:
      "OphidianAI automated our customer follow-ups and scheduling. What used to take our team 3 hours a day now runs itself. We haven't looked back.",
  },
  {
    name: "James Rodriguez",
    location: "Indianapolis, IN",
    role: "Operations Manager",
    quote:
      "The integration they built connects our inventory, orders, and shipping in one pipeline. Errors dropped by 80% in the first month.",
  },
  {
    name: "Emily Chen",
    location: "Chicago, IL",
    role: "Marketing Director",
    quote:
      "We launched with a site that looked like a $20K agency build. The AI-assisted workflow they set up means our campaigns run even when the team is offline.",
  },
  {
    name: "David Park",
    location: "Cincinnati, OH",
    role: "CEO",
    quote:
      "I was skeptical AI could work for a company our size. Eric proved me wrong in the first week. The ROI was immediate and obvious.",
  },
  {
    name: "Lisa Thompson",
    location: "Louisville, KY",
    role: "E-commerce Manager",
    quote:
      "Product descriptions, SEO tags, inventory alerts — all automated. Our team focuses on growth now instead of repetitive data entry.",
  },
];

export function TestimonialsEditorial() {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-16">
          What clients say
        </p>

        {/* Testimonials list */}
        <div className="divide-y divide-white/8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group grid grid-cols-[3rem_1fr] md:grid-cols-[3rem_14rem_1fr] gap-6 md:gap-12 py-10 items-start"
            >
              {/* Number */}
              <span className="text-xs font-mono text-foreground/30 pt-1 tabular-nums">
                {String(i + 1).padStart(3, "0")}
              </span>

              {/* Name + meta */}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground/90">{t.name}</p>
                <p className="text-xs text-foreground/40 mt-1">{t.location}</p>
                <p className="text-xs text-foreground/30 mt-0.5">{t.role}</p>
              </div>

              {/* Quote */}
              <div>
                {/* Name on mobile (shown above quote) */}
                <div className="md:hidden mb-3">
                  <p className="text-sm font-medium text-foreground/90">{t.name}</p>
                  <p className="text-xs text-foreground/40">{t.location} · {t.role}</p>
                </div>
                <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Swap in page.tsx**

In `src/app/page.tsx`, find the testimonials import and replace:
```tsx
// Remove:
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
// (or whatever the current import is)

// Add:
import { TestimonialsEditorial } from "@/components/sections/TestimonialsEditorial";
```

Replace the `<TestimonialsSection />` JSX with `<TestimonialsEditorial />`.

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/TestimonialsEditorial.tsx src/app/page.tsx
git commit -m "feat: editorial numbered testimonials (Sirnik-style)"
```

---

## Task 4: Two-Step Contact Form

**What it looks like:** Step 1 collects Name, Email, Company. Step 2 collects Service type, Budget, Message. A "1/2 Steps" label shows progress. "Next step →" advances. The back-end submission logic (`actions/contact.ts`) is unchanged.

**Files:**
- Modify: `src/components/sections/ContactForm.tsx`

The contact page (`src/app/contact/page.tsx`) and server action (`src/app/actions/contact.ts`) do NOT change.

---

- [ ] **Step 1: Rewrite ContactForm.tsx as two-step**

The current form has all fields on one screen. Restructure using `useState` for step tracking:

```tsx
"use client";

import { useState } from "react";
import { submitContact } from "@/app/actions/contact";

type FormData = {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
};

export function ContactForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState<FormData>({
    name: "", email: "", company: "",
    service: "", budget: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(field: keyof FormData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    const result = await submitContact(formData);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.message ?? "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="py-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4">Message received</p>
        <p className="text-foreground/70">We'll be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
      {/* Step indicator */}
      <p className="text-xs font-mono text-foreground/40 mb-8 tracking-widest">
        {step}/2 Steps
      </p>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Let&apos;s start a conversation
          </h2>
          <div>
            <input
              required
              type="text"
              placeholder="Your Name"
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full bg-transparent border-b border-white/15 pb-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <input
              required
              type="email"
              placeholder="Email"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full bg-transparent border-b border-white/15 pb-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Company Name (Optional)"
              value={data.company}
              onChange={(e) => update("company", e.target.value)}
              className="w-full bg-transparent border-b border-white/15 pb-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            className="mt-4 text-sm font-medium text-foreground border-b border-foreground/30 pb-0.5 hover:border-primary hover:text-primary transition-colors"
          >
            Next step →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Tell us about the project
          </h2>
          <div>
            <select
              value={data.service}
              onChange={(e) => update("service", e.target.value)}
              className="w-full bg-transparent border-b border-white/15 pb-3 text-foreground/70 focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="" className="bg-background">Service</option>
              <option value="web-starter" className="bg-background">Web Design — Starter</option>
              <option value="web-professional" className="bg-background">Web Design — Professional</option>
              <option value="web-ecommerce" className="bg-background">Web Design — E-Commerce</option>
              <option value="seo-audit" className="bg-background">Free SEO Audit</option>
              <option value="seo-cleanup" className="bg-background">SEO Cleanup</option>
              <option value="inquiry" className="bg-background">General Inquiry</option>
            </select>
          </div>
          <div>
            <select
              value={data.budget}
              onChange={(e) => update("budget", e.target.value)}
              className="w-full bg-transparent border-b border-white/15 pb-3 text-foreground/70 focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="" className="bg-background">Budget Range</option>
              <option value="under-5k" className="bg-background">Under $5K</option>
              <option value="5-10k" className="bg-background">$5K – $10K</option>
              <option value="10-25k" className="bg-background">$10K – $25K</option>
              <option value="25-50k" className="bg-background">$25K – $50K</option>
              <option value="50k-plus" className="bg-background">$50K+</option>
            </select>
          </div>
          <div>
            <textarea
              required
              rows={4}
              placeholder="Tell us about your project"
              value={data.message}
              onChange={(e) => update("message", e.target.value)}
              className="w-full bg-transparent border-b border-white/15 pb-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-foreground/40 hover:text-foreground transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="text-sm font-medium text-foreground border-b border-foreground/30 pb-0.5 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {status === "submitting" ? "Sending..." : "Send message →"}
            </button>
          </div>
          {status === "error" && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}
        </div>
      )}
    </form>
  );
}
```

**Note:** Verify the server action import path. Current action is at `src/app/actions/contact.ts` and exports `submitContact`. Match whatever the current export name is.

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ContactForm.tsx
git commit -m "feat: two-step contact form (Sirnik-style)"
```

---

## Task 5: Oversized Wordmark Footer

**What it looks like:** The footer ends with "OphidianAI" in an enormous display typeface spanning nearly the full viewport width. "AI" is venom green (#39FF14). Below it: a thin row with copyright, location, and legal links. This replaces the current multi-column link grid.

The current footer has brand column + company links + resources links + connect section. Keep the useful links but subordinate them to the wordmark.

**Files:**
- Modify: `src/components/layout/FooterMain.tsx`

---

- [ ] **Step 1: Rewrite FooterMain.tsx**

```tsx
import Link from "next/link";

export function FooterMain() {
  return (
    <footer className="border-t border-white/8 pt-16 pb-0 overflow-hidden">
      {/* Upper footer — links + contact */}
      <div className="px-6 md:px-12 pb-16 grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto">
        {/* Contact */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4">Contact</p>
          <a
            href="mailto:eric.lefler@ophidianai.com"
            className="text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            eric.lefler@ophidianai.com
          </a>
          <div className="flex flex-col gap-2 mt-4">
            <a href="https://www.linkedin.com/company/ophidianai" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/40 hover:text-foreground transition-colors">LinkedIn</a>
            <a href="https://github.com/ophidian-ai" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/40 hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4">Navigation</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Services", href: "/services" },
              { label: "Projects", href: "/projects" },
              { label: "Pricing", href: "/pricing" },
              { label: "About", href: "/about" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-foreground/40 hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4">Resources</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Blog", href: "/blog" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-foreground/40 hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Studio Note */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-4">Studio Note</p>
          <p className="text-sm text-foreground/40 leading-relaxed">
            We build for businesses that are serious about AI. If it feels right,{" "}
            <Link href="/contact" className="text-foreground/60 hover:text-foreground underline underline-offset-2 transition-colors">
              this can be the starting point
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div className="px-4 md:px-8 select-none" aria-hidden="true">
        <p
          className="font-bold leading-none tracking-tighter text-foreground/10"
          style={{
            fontSize: "clamp(4rem, 16vw, 18rem)",
            lineHeight: 0.85,
          }}
        >
          Ophidian<span style={{ color: "#39FF14" }}>AI</span>
        </p>
      </div>

      {/* Bottom bar */}
      <div className="px-6 md:px-12 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/5 mt-4">
        <p className="text-xs text-foreground/30">
          &copy;{new Date().getFullYear()} OphidianAI. All rights reserved.
        </p>
        <p className="text-xs text-foreground/20">Columbus, Indiana</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="text-xs text-foreground/30 hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-xs text-foreground/30 hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/FooterMain.tsx
git commit -m "feat: oversized wordmark footer with AI in venom green"
```

---

## Task 6: Push + Deploy

- [ ] **Step 1: Push submodule**

```bash
cd "c:/Claude Code/OphidianAI/engineering/projects/ophidian-ai"
git push
```

- [ ] **Step 2: Update parent repo submodule pointer**

```bash
cd "c:/Claude Code/OphidianAI"
git add engineering/projects/ophidian-ai
git commit -m "feat: Sirnik-inspired design polish -- nav animation, status bar, testimonials, form, footer"
git push
```

- [ ] **Step 3: Verify Vercel deployment**

Check that the Vercel deployment succeeds. The build log should show no errors. Hard refresh ophidianai.com (Ctrl+Shift+R) to verify.

---

## Notes for Executor

- **"AI" brand rule:** Anywhere "OphidianAI" appears in large type, "AI" must be `#39FF14` (venom green). This is enforced in the footer wordmark above. Check the nav logo too — it may already handle this.
- **Scroll-scrub hero:** Do NOT touch `ScrollScrubHero.tsx` or any hero components. Left alone intentionally.
- **Server action import:** Before rewriting ContactForm, check the exact export name from `src/app/actions/contact.ts` and match it.
- **Framer Motion testimonials:** The old animated columns component (`testimonials-columns.tsx`) can be left in place (don't delete it). Just stop importing it from page.tsx.
- **Font size for wordmark:** `clamp(4rem, 16vw, 18rem)` — adjust `16vw` up or down to taste. Goal is the word nearly touching both edges of the viewport.
