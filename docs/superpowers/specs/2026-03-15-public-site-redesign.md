# OphidianAI Public Site Redesign — Design Spec

## Overview

Complete redesign of the OphidianAI public-facing website. Dashboard and auth are explicitly out of scope. The new site replaces whatever exists with a ground-up "Organic Dark" aesthetic — the product (the serpent animation) IS the machine; the design itself is nature.

**Pages in scope:** Homepage, Services, About, Pricing, Contact, Blog (index + post), Portfolio (index + case study), FAQ

**Stack:** Next.js 15, React 19, Tailwind CSS 4, TypeScript

---

## Design Direction — Organic Dark

### Philosophy

The design marries the natural world and computing in a specific way: the serpent hero object is the only explicit technology metaphor. Everything around it — typography, backgrounds, layouts — reads as pure nature. The tension between the organic site and the machine object IS the brand statement.

Reference sites (for design decisions, not copying):

- **Brant Paints** — Sculptural 3D object on pure black as hero centerpiece
- **Integrated Biosciences** — Full-bleed abstract organic macro, text floating over imagery, earthy palette
- **Archidomo** — Wordmark-scale typography as structural element

### Color Palette

| Token | Value | Usage |
| --- | --- | --- |
| `--black` | `#000000` | Base background |
| `--forest` | `#0b1a0b` | Section alternates |
| `--stone` | `#111a11` | Elevated surfaces |
| `--green` | `#39FF14` | **Only** synthetic accent — CTAs, active states, "AI" in wordmark, hover reveals |
| `--green-dim` | `rgba(57,255,20,0.12)` | Subtle green tints |
| `--green-faint` | `rgba(57,255,20,0.05)` | Background washes |
| `--white` | `#ffffff` | Primary text |
| `--white-muted` | `rgba(255,255,255,0.5)` | Secondary text |
| `--white-dim` | `rgba(255,255,255,0.12)` | Borders, dividers |
| `--white-faint` | `rgba(255,255,255,0.06)` | Ghost elements |

### Typography

- **Font:** Inter (variable), system fallback `-apple-system, sans-serif`
- **No monospace anywhere.** No code syntax. No terminal UI.
- Display headlines: 700–900 weight, tight tracking (`-0.03em`)
- Body: 300–400 weight, loose leading (`1.7–1.8`)
- Labels/eyebrows: 400–500 weight, wide tracking (`0.12–0.18em`), uppercase

### Spacing System

- Section padding: `120px` vertical, `48px` horizontal
- Max content width: `1200px` centered
- Nav height: `88px` (24px padding top/bottom at 48px side)

---

## Generated Assets

All AI-generated via Nano Banana 2 (Gemini API) using nature gallery reference images.

| File | Usage |
| --- | --- |
| `public/images/hero-object.png` | Hero centerpiece — coiled serpent, venom-green fracture glow |
| `public/images/hero-bg.png` | Video poster fallback for hero |
| `public/images/services-bg.png` | Services section background texture |
| `public/images/break-bg.png` | Organic break section full-bleed background |
| `public/images/about-visual.png` | About page full-bleed visual |
| `public/images/testimonials-bg.png` | Testimonials section background |
| `public/portraits/portrait-1.png` through `portrait-5.png` | AI-generated testimonial headshots (generated, on disk) |
| `public/video/hero-card-video.mp4` | Hero background video (on disk — copied from `engineering/references/inspiration/nature-gallery/landscapes/hero-card-video.mp4`) |

---

## Navigation

**Layout:** Fixed, transparent, full-width. Three zones: logo left / links center / CTA right.

**Logo:** `OPHIDIAN` in white + `AI` in venom green (`#39FF14`). 700 weight, 15px, 0.06em tracking, uppercase.

**Links:** Services, Work, About, Blog — 13px, 400 weight, `rgba(255,255,255,0.45)` resting, white on hover. 36px gap. Pricing, Contact, and FAQ are accessible via footer and internal CTAs — not in the primary nav.

**CTA:** "Start a Project" → `/contact` — ghost pill button (`border: 1px solid rgba(255,255,255,0.2)`, 100px border-radius). Hover: green border + green text.

**Scroll behavior:** Nav background transitions from transparent to `rgba(0,0,0,0.85)` with `backdrop-filter: blur(12px)` after 80px scroll.

**Mobile (below `768px`):** Hamburger icon right of logo. Tap opens full-screen overlay: `background: #000`, nav links stacked vertically centered, 32px font size, 500w, white. Close button top-right. Instant show/hide via `opacity` + `pointer-events` toggle — no animation required.

---

## Homepage

### Section 1 — Hero

**Full viewport height (`100vh`, min `700px`).**

**Background:** `hero-card-video.mp4` — autoplay, muted, loop, `object-fit: cover`. Opacity `0.75`. Poster: `hero-bg.png`.

**Vignette overlays:**

- Bottom-to-top: `rgba(0,0,0,0.85)` at 0% → `rgba(0,0,0,0.2)` at 50% → transparent at 100%
- Left-to-right: `rgba(0,0,0,0.5)` at 0% → transparent at 60%

**Hero object:** `hero-object.png` positioned absolutely, right side (`right: 8%`, vertically centered). Width: `min(45vw, 520px)`. Wrapped in a circular container with a faint venom-green conic gradient border that rotates slowly (8s infinite). The container is decorative — the PNG floats inside it.

**Text content** (bottom-left, `padding: 0 48px 72px`, `z-index: 10`):

- Eyebrow: `AI AGENCY — COLUMBUS, IN` — 12px, 500w, 0.18em tracking, `rgba(255,255,255,0.35)`
- Headline: `"We build the tools that run your business."` — `clamp(48px, 7.5vw, 96px)`, 800w, -0.03em tracking. "tools" in venom green.
- Sub: `"From custom websites to AI integrations — we design, build, and deploy everything your business needs to compete in the next decade."` — 16px, 300w, 1.7 line-height, `rgba(255,255,255,0.45)`, max 520px wide
- Actions: Primary CTA "Start a Project" (green pill) + Ghost link "See our work ↓"

### Section 2 — Stats Bar

4-column grid, full-width. `border-top` and `border-bottom` at `rgba(255,255,255,0.06)`. Vertical dividers between columns.

Each stat: numeric value in venom green (36px, 700w) + label below (12px, uppercase, muted).

Stats: `24+` Projects Delivered / `100%` Client Retention / `48h` Average Response / `3×` Avg ROI

### Section 3 — Services

**Layout:** Two-column grid (`1fr 1fr`, 80px gap). Left: heading + description. Right: numbered service rows.

**Left column:**

- H2: `"What we build"` — `clamp(32px, 3.5vw, 48px)`, 700w
- Body: 15px, 300w, muted, max 380px

**Right column — service rows:**

Each row: number (`01`, `02`...) in very muted white | service name + description | arrow (`→`).

- `border-bottom: 1px solid rgba(255,255,255,0.06)`
- Hover: arrow translates right 4px, turns venom green
- Services: Websites & Landing Pages / AI Integrations / Workflow Automation / Social Media Management / SEO Services

**Background:** `services-bg.png` at 8% opacity as a full-section background image.

### Section 4 — Organic Break

**Full-bleed section, 480px height.** `break-bg.png` as background (`object-fit: cover`). Dark overlay gradient over it.

**Centered content:**

- Quote: `clamp(20px, 2.8vw, 32px)`, 300w, `rgba(255,255,255,0.7)`: `"At the intersection of the ancient and the intelligent"`
- Attribution line below: thin rule + small uppercase label `OPHIDIAN AI`

### Section 5 — Process

**4-column grid** (one column per step). Dark background (`--forest`). Below `768px`, stacks to 2 columns; below `480px`, single column.

Each step:

- Step number in venom green (12px, uppercase, muted)
- Icon from **Lucide React** icon set (see table below)
- Step name (18px, 600w)
- Description (14px, 300w, muted)

| # | Icon | Name | Description |
| --- | --- | --- | --- |
| 01 | `Search` | Discover | We learn your business, goals, and what you actually need — not what sounds impressive. |
| 02 | `Layers` | Design | Tailored visuals and structure built around your customers, not templates. |
| 03 | `Code2` | Build | Fast, clean, and production-grade from day one — deployed to global CDN. |
| 04 | `Rocket` | Launch | You go live with full ownership of your code, domain, and assets. |

### Section 6 — Testimonials

**Editorial layout** — numbered testimonials (`001`, `002`, `003`), no carousel.

`testimonials-bg.png` at 6% opacity as background.

Each testimonial:

- Number in venom green (12px, muted)
- Quote text (20px, 300w, italic-style)
- Attribution: name, title, company — small, muted
- Portrait: `public/portraits/portrait-N.png` (AI-generated headshots, circular crop)

**Placeholder content (replace with real testimonials when available):**

001 — *"OphidianAI rebuilt our website in under two weeks. The result was completely different from anything I'd seen in our industry — clean, fast, and it actually converts."*
— Sarah Mitchell, Owner, Westside Wellness Co.

002 — *"I was skeptical about AI-built websites until I saw the work. Eric delivered something that looked like it cost three times what we paid."*
— James Rodriguez, Operations Manager, Ridge Line Services

003 — *"The automation workflow they built for us saves about 6 hours a week. That's time I actually get back now."*
— Emily Chen, Marketing Director, Elevate Commerce

Portraits: `public/portraits/portrait-1.png` through `portrait-3.png` (already generated via `--portraits` flag).

### Section 7 — CTA Band

Full-width dark section. Centered:

- Large headline: `"Ready to build something?"` — display size
- Subtext: `"Let's talk about what you're building and how we can help."`
- Primary CTA: "Start a Project" → `/contact`

### Footer

**3-column grid:**

- Col 1 — Nav links: Services, Work, Pricing, About, Blog, FAQ, Contact
- Col 2 — Contact: `eric.lefler@ophidianai.com` / Columbus, Indiana / "Available for new projects" (green dot indicator)
- Col 3 — Social: LinkedIn, Instagram, GitHub (handles TBD by Eric)

Ghost wordmark: `OPHIDIANAI` spanning full viewport width, `rgba(255,255,255,0.04)`, massive font size. Purely decorative — not a link.

Bottom strip: copyright line.

---

## Interior Pages

### Services Page

One full-width section per service (5 total), stacked vertically. Each section alternates background (`--black` / `--forest`).

Each service section layout:

- Eyebrow: service number (`01` of `05`) — 11px, venom green, uppercase
- H2: service name — `clamp(28px, 3vw, 40px)`, 700w
- Body paragraph: 2–3 sentences describing what it is and who it's for — 15px, 300w, muted
- Feature list: 4–6 bullet points (what's included) — 14px, muted, `→` prefix
- Pricing callout: "Starting at $X" or "From $X/mo" in green + "See full pricing →" link
- Example use cases: 2–3 short real-world scenarios in small italic text

Services in order: Websites & Landing Pages / AI Integrations / Workflow Automation / Social Media Management / SEO Services

### About Page

- `about-visual.png` as full-bleed hero (text overlaid)
- Mission statement
- How OphidianAI works (solo AI-augmented studio)
- Values/principles
- CTA

### Pricing Page

Card grid, one section per service. Clean, high-contrast. Green badge on recommended tier.

**Websites:**

| Tier | Price | Details |
| --- | --- | --- |
| Starter | $2,200–$2,500 | Up to 5 pages, 1–2 weeks, basic SEO, 2 revision rounds |
| Professional (recommended) | $3,500–$4,000 | Up to 10 pages, 2–3 weeks, full SEO, AI copywriting, unlimited revisions, GBP setup |
| E-Commerce | $4,500–$6,000 | Everything in Professional + product catalog, cart, Stripe payments |

Monthly maintenance add-on: $100/mo (Starter/Pro) or $150/mo (E-Commerce) — includes hosting, SSL, security, minor updates.

**Social Media Management:**

| Tier | Price | Platforms | Posts/Month |
| --- | --- | --- | --- |
| Essentials | $250/mo | FB + IG + GBP | ~12 |
| Growth (recommended) | $450/mo | FB + IG + TikTok + GBP | ~20–28 |
| Pro | $700/mo | FB + IG + TikTok + GBP + 1 more | ~32–44 |

3-month minimum on all tiers. Bundles with website services save $50–$150/mo.

**SEO Services:**

- Free audit (lead magnet)
- Cleanup: $400–$600 advisory / $800–$1,200 done-for-you
- Growth retainer: $200–$250/mo Standard or $300–$350/mo Premium (3-month minimum)

Full add-ons list (additional pages, blog setup, booking, logo, copywriting, attribution removal) in a collapsible section at the bottom.

### Contact Page

Two-column layout: contact info left / form right.

**Form fields:** Name, Company (optional), Email, Service interest (select: Website, AI Integration, Workflow Automation, Social Media, SEO, Other), Message. Submit: "Send Message" button in venom green.

**Single-step form.**

**Submission:** Next.js API route at `app/api/contact/route.ts`. Uses **Resend** (`resend` npm package) to send to `eric.lefler@ophidianai.com`. On success: replace form with thank-you message in-place. On error: inline error, do not clear form. API key in `.env.local` as `RESEND_API_KEY`. **Also add `RESEND_API_KEY` to Vercel environment variables** (Settings → Environment Variables) — it is gitignored locally and will not deploy automatically.

**Contact info column:** `eric.lefler@ophidianai.com` / "We respond within 24 hours" / Columbus, Indiana.

### Blog

Index: editorial grid. Date, category tag in green, title, excerpt. No thumbnails required initially.

Post: full-width article layout, wide heading, comfortable reading width (~680px), related posts at bottom.

**Data source:** MDX files in `src/content/blog/[slug].mdx`. `generateStaticParams` enumerates slugs via `fs.readdirSync` pointing to `src/content/blog/`. The existing `src/lib/blog.ts` already reads from this directory — update it rather than replace it.

**Frontmatter schema** (extend the existing `BlogPost` interface in `blog.ts` to add these fields):

- `title` — string (already exists)
- `date` — ISO string (already exists)
- `description` — string (already exists, use as excerpt/subtext in `BlogCard`)
- `tags` — string array (already exists, use as category display in `BlogCard`)

Do not add separate `category` or `excerpt` fields — use `description` and `tags` from the existing schema. Update the existing post's frontmatter if any required fields are missing. No CMS.

### Portfolio / Work

Grid of case study cards. Each card: project name, client type, services used, image or dark abstract.

**Data source:** MDX files in `src/content/work/[slug].mdx`. Frontmatter: `title`, `client`, `services` (array), `image` (optional). Same static generation pattern as blog — build a `src/lib/portfolio.ts` that reads from `src/content/work/`. There is no existing portfolio lib or page.tsx to migrate — build this fresh. **Bloomin' Acres** is the first entry: create `src/content/work/bloomin-acres.mdx` with title, client name, and services listed.

### FAQ

Accordion layout. Questions grouped by category. `+` / `–` expand icon in venom green.

**Data source:** Hardcoded in the component (no MDX, no CMS).

**Categories and placeholder questions:**

#### Websites

- How long does a website build take? (1–3 weeks depending on tier)
- Do I own the code when it's done? (Yes — full ownership, no lock-in)
- What's included in monthly maintenance? (Hosting, SSL, security, minor updates)
- Can I update the content myself after launch? (Yes — we can add a simple CMS if needed)

#### AI & Automation

- What kind of AI integrations do you build? (Chatbots, document processing, workflow triggers, custom tools)
- Do I need technical knowledge to use the tools you build? (No — everything is designed for non-technical users)

#### Working Together

- How do I get started? (Contact form → discovery call → proposal → build)
- Do you work with businesses outside Columbus, Indiana? (Yes — fully remote)
- What payment methods do you accept? (Invoice via Stripe — net-30 terms)
- Do you offer refunds? (Discovery calls are free; project work is milestone-billed)

---

## Component Inventory

| Component | Description |
| --- | --- |
| `Nav` | Fixed nav with scroll behavior |
| `HeroSection` | Full-viewport video hero |
| `StatsBar` | 4-stat counter row |
| `ServicesSection` | 2-col layout with numbered rows |
| `OrganicBreak` | Full-bleed image with centered quote |
| `ProcessSection` | 4-step grid |
| `TestimonialsSection` | Numbered editorial testimonials |
| `CtaBand` | Full-width CTA section |
| `Footer` | 3-col grid + ghost wordmark |
| `PageHero` | Reusable interior page hero (image + headline) |
| `BlogCard` | Editorial blog post card |
| `PortfolioCard` | Work/case study card |
| `FaqAccordion` | Category-grouped expandable FAQ |
| `ContactForm` | Single-step contact form with Resend API |
| `PricingCard` | Service pricing tier card |

---

## Interaction & Animation

- **Nav CTA hover:** border → green, text → green (300ms)
- **Service row hover:** arrow translates right, turns green (200ms)
- **Serpent portal border:** conic gradient rotates continuously (8s linear infinite)
- **Page transitions:** subtle fade via CSS transitions
- **Scroll-triggered reveals:** sections fade up on intersection (IntersectionObserver, once)
- **No GSAP** unless scroll-scrub hero is added later

The scroll-scrub hero (serpent transformation animation) is a separate feature specced in `.claude/skills/exploding-scroll-hero/SKILL.md`. It drops into `HeroSection` as a future enhancement — not required for initial launch.

---

## SEO & Meta

OG images generated and on disk at `public/og/`:

| File | Page |
| --- | --- |
| `og-home.png` | Homepage |
| `og-services.png` | Services |
| `og-pricing.png` | Pricing |
| `og-about.png` | About |
| `og-contact.png` | Contact |
| `og-blog.png` | Blog index |

Portfolio and FAQ pages do not have dedicated OG images. Use `og-home.png` as the fallback OG image for all pages without a specific file (portfolio, FAQ, individual blog posts, individual case studies). Dynamic routes do not need generated OG images for initial launch.

Per-page metadata in `app/*/page.tsx` via Next.js `generateMetadata`. Sitemap: `app/sitemap.ts`. `public/robots.txt`. Structured data: Organization schema JSON-LD in homepage `<head>`.

---

## File Structure

**App structure note:** The project already has all public pages at the correct paths inside `src/app/`. **Do not use a route group.** Replace the existing public page files in-place. Do not touch anything under `src/app/dashboard/`, `src/app/sign-in/`, `src/app/sign-up/`, `src/app/account-setup/`, `src/app/checkout/`, or `src/app/projects/` — those are out of scope.

**Portfolio data source note:** There is no existing portfolio page.tsx or lib — the portfolio route only has a `layout.tsx`. Build the portfolio page and `src/lib/portfolio.ts` fresh, reading from MDX files in `src/content/work/`.

```text
src/app/
  page.tsx                    # Homepage — replace in-place
  services/page.tsx           # Replace in-place
  about/page.tsx              # Replace in-place
  pricing/page.tsx            # Replace in-place
  contact/page.tsx            # Replace in-place
  blog/
    page.tsx                  # Replace in-place
    [slug]/page.tsx           # Replace in-place
  portfolio/
    page.tsx                  # Replace in-place
    [slug]/page.tsx           # Replace in-place
  faq/page.tsx                # Replace in-place
  api/
    contact/route.ts          # Create new — Resend endpoint
src/components/
  layout/
    Nav.tsx                   # Replace existing
    Footer.tsx                # Replace existing
  sections/
    HeroSection.tsx
    StatsBar.tsx
    ServicesSection.tsx
    OrganicBreak.tsx
    ProcessSection.tsx
    TestimonialsSection.tsx
    CtaBand.tsx
  ui/
    BlogCard.tsx
    PortfolioCard.tsx
    FaqAccordion.tsx
    ContactForm.tsx
    PricingCard.tsx
    PageHero.tsx
src/content/
  blog/                       # MDX blog posts (existing directory — keep existing post)
  work/
    bloomin-acres.mdx         # Create fresh
public/
  images/                     # Generated assets (on disk)
  video/
    hero-card-video.mp4       # On disk
  portraits/                  # portrait-1 through portrait-5 (on disk)
  og/                         # OG images (on disk)
```

---

## Out of Scope

- Dashboard
- Auth (login/signup)
- Backend routes beyond contact form
- CMS integration (copy is hardcoded for initial launch)
- E-commerce / payments
