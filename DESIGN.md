# Ophidian Website — Design System & Implementation Spec

**Version**: 1.0
**Date**: 2026-03-29
**Owner**: UI Designer (OphidianAI)
**Status**: Client-ready — implementation contract for Frontend Developer

---

## 1. Design Tokens

### 1.1 Color Palette

Replace the entire existing dark forest / glass-morphism color system. The new palette is warm, organic, and cream-based.

```css
/* globals.css — @theme inline block, full replacement */

/* ── Core Brand Palette ── */
--color-cream:        #F7EFE6;   /* Canvas — primary background everywhere */
--color-sage:         #AAAC9A;   /* Primary brand — borders, accents, tag fills */
--color-taupe:        #928571;   /* Body text, secondary content, metadata */
--color-terracotta:   #C2977F;   /* CTAs, links, interactive elements, highlights */
--color-forest:       #7B816E;   /* Headings, wordmark, nav text, strong labels */
--color-dark:         #3A3A35;   /* Footer bg, nav dropdown bg, dark surfaces */

/* ── Semantic Aliases ── */
--color-background:       var(--color-cream);
--color-surface:          #EDE5DB;   /* Slightly darker cream for cards/surfaces */
--color-surface-hover:    #E6DCCE;   /* Hover state on surfaces */

--color-text-primary:     var(--color-forest);    /* Headings, strong text */
--color-text-body:        var(--color-taupe);      /* Paragraphs, body copy */
--color-text-muted:       #B0AA9E;                 /* Captions, disabled, placeholders */
--color-text-inverse:     #F7EFE6;                 /* Text on dark surfaces */

--color-link:             var(--color-terracotta);
--color-link-hover:       #B0836A;   /* Terracotta darkened 15% */

--color-border:           rgba(170, 172, 154, 0.35);   /* Sage at 35% opacity */
--color-border-strong:    var(--color-sage);

--color-cta-bg:           var(--color-terracotta);
--color-cta-text:         var(--color-cream);
--color-cta-hover-bg:     #B0836A;

--color-nav-bg:           var(--color-dark);
--color-nav-text:         var(--color-cream);

/* ── Utility ── */
--color-white:  #FFFFFF;
--color-black:  #1A1A18;
--color-error:  #C45B5B;
```

**Tailwind mapping (tailwind.config.ts):**

```ts
colors: {
  cream:      '#F7EFE6',
  sage:       '#AAAC9A',
  taupe:      '#928571',
  terracotta: '#C2977F',
  forest:     '#7B816E',
  dark:       '#3A3A35',
}
```

---

### 1.2 Typography

#### Font Stack

| Role | Family | Source |
|------|---------|--------|
| Wordmark | "Romantically" | Self-hosted (see `assets/branding_guide/`) |
| Headings | Playfair Display | Google Fonts |
| Body | Inter | Google Fonts |
| Labels / Metadata | Inter (small-caps variant or tracking) | Google Fonts |
| Monospace | Space Mono | Google Fonts — use sparingly for scope numbers |

**CSS variables:**

```css
--font-wordmark:  'Romantically', cursive;
--font-serif:     'Playfair Display', Georgia, serif;
--font-sans:      'Inter', system-ui, sans-serif;
--font-mono:      'Space Mono', ui-monospace, monospace;
```

**Next.js font loading (layout.tsx):**

```ts
import { Playfair_Display, Inter, Space_Mono } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const inter    = Inter({ subsets: ['latin'], variable: '--font-sans' })
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-mono' })

// Romantically — self-hosted via next/font/local:
import localFont from 'next/font/local'
const romantically = localFont({
  src: '../assets/branding_guide/Romantically.woff2',
  variable: '--font-wordmark',
})
```

#### Type Scale

| Token | Size | Weight | Line Height | Font | Usage |
|-------|------|--------|-------------|------|-------|
| `display` | 72px / 4.5rem | 400 | 1.0 | Wordmark | Footer wordmark at display size |
| `wordmark` | 28px / 1.75rem | 400 | 1.1 | Wordmark | Nav wordmark |
| `h1` | 56px / 3.5rem | 700 | 1.05 | Playfair Display | Landing tagline |
| `h2` | 40px / 2.5rem | 600 | 1.15 | Playfair Display | Case study title |
| `h3` | 28px / 1.75rem | 600 | 1.25 | Playfair Display | Section headings |
| `h4` | 20px / 1.25rem | 500 | 1.35 | Inter | Subsection labels |
| `body-lg` | 18px / 1.125rem | 400 | 1.65 | Inter | Case study intro paragraphs |
| `body` | 16px / 1rem | 400 | 1.6 | Inter | Standard body copy |
| `body-sm` | 14px / 0.875rem | 400 | 1.5 | Inter | Captions, metadata |
| `label` | 11px / 0.6875rem | 600 | 1.4 | Inter | Small-caps labels (SCOPE OF WORK, etc.) |
| `label-mono` | 12px / 0.75rem | 400 | 1.4 | Space Mono | Numbered scope items (01, 02…) |

**Label small-caps pattern:**

```css
.label-caps {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-taupe);
}
```

---

### 1.3 Spacing Scale

Use Tailwind's default scale (base 4px). Key additions:

```css
--spacing-18: 4.5rem;   /* 72px — used for section vertical padding */
--spacing-22: 5.5rem;   /* 88px — large section gap */
--spacing-28: 7rem;     /* 112px — hero top padding */
```

**Section vertical rhythm:**
- Between major sections: `py-18` (72px)
- Container horizontal padding: `px-6` (24px mobile), `px-12` (48px tablet), `px-20` (80px desktop)
- Max content width: `max-w-6xl` (1152px), centered

---

### 1.4 Border Radius

```css
--radius-sm:   4px;    /* Tags, labels */
--radius-md:   8px;    /* Buttons, input fields */
--radius-lg:   16px;   /* Cards */
--radius-xl:   24px;   /* Nav dropdown card */
--radius-full: 9999px; /* Circular thumbnails, pill badges */
```

---

### 1.5 Shadows

No heavy shadows. Subtle elevation only:

```css
--shadow-sm:  0 1px 3px rgba(58, 58, 53, 0.08);
--shadow-md:  0 4px 16px rgba(58, 58, 53, 0.10);
--shadow-lg:  0 12px 40px rgba(58, 58, 53, 0.12);
```

---

### 1.6 Motion Tokens

```css
--duration-fast:   150ms;
--duration-base:   250ms;
--duration-slow:   400ms;
--duration-slower: 600ms;

--ease-out:     cubic-bezier(0.16, 1, 0.3, 1);   /* Snappy exits */
--ease-in-out:  cubic-bezier(0.45, 0, 0.55, 1);  /* Smooth traversals */
--ease-organic: cubic-bezier(0.34, 1.56, 0.64, 1); /* Slight overshoot — organic feel */
```

---

## 2. Component Library

### 2.1 Navigation

**Pattern**: Compact dropdown card (not full-screen overlay)

```
┌─────────────────────────────────────────────┐
│  Ophidian (wordmark)     [Menu ▾]           │
└─────────────────────────────────────────────┘
```

**Structure:**
- `position: fixed`, `top-0`, full width, `z-50`
- Background: transparent on constellation hero; transitions to `rgba(247,239,230,0.92)` with `backdrop-filter: blur(8px)` on scroll
- Wordmark: left-aligned, "Romantically" font, 28px, `color: forest`
- Menu button: right-aligned, 36×36px rounded square, `bg-dark`, `text-cream`, label "Menu" in Inter 13px/600

**Dropdown card (open state):**
- Position: absolute, anchored to menu button top-right
- Dimensions: 240px wide, auto height
- Background: `var(--color-dark)` (`#3A3A35`)
- Border radius: `var(--radius-xl)` (24px)
- Padding: `p-6` (24px)
- Shadow: `var(--shadow-lg)`
- Links: Inter 18px/400, `color: cream`, spacing `gap-4`
- Hover: `color: terracotta`, transition `var(--duration-fast)`
- Bottom link: "Let's talk →" — `color: terracotta`, 14px, opens chatbot

**States:**
| State | Behavior |
|-------|----------|
| Default (top of page) | Transparent nav bg, forest wordmark |
| Scrolled | Cream bg w/ blur, forest wordmark, subtle border-bottom `var(--color-border)` |
| Dropdown open | Menu button rotates icon 45°, dropdown card fades in (150ms opacity + 8px translateY) |
| Dropdown closed | Reverse — 100ms fade out |
| Mobile | Same behavior; dropdown card full-width minus 24px margin each side |

---

### 2.2 Project Thumbnail (Constellation)

Circular images used in the constellation hero.

**Specifications:**
- Shape: `border-radius: 9999px` (fully circular)
- Sizes: lg `160px`, md `120px`, sm `80px`
- Border: `2px solid var(--color-sage)` at rest
- Border on hover: `2px solid var(--color-terracotta)`
- Content: project hero image, `object-fit: cover`
- Fallback: sage-to-taupe radial gradient if no image

**States:**
| State | Style |
|-------|-------|
| Default (idle) | Gentle CSS drift animation (see §4.1) |
| Hover | Scale 1.12, border terracotta, project name label fades in below (Inter 13px, taupe) |
| Active (being funneled) | Follows scroll-driven path (GSAP) |
| Collapsed | Opacity 0.08, scale 0.3, at center point |
| Ghost trace | `opacity: 0.06`, no border, position at viewport edge |

**Project name label (hover only):**
```css
.thumbnail-label {
  font: 600 13px/1.4 var(--font-sans);
  color: var(--color-taupe);
  text-align: center;
  margin-top: 8px;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 150ms, transform 150ms;
}
.thumbnail:hover .thumbnail-label {
  opacity: 1;
  transform: translateY(0);
}
```

---

### 2.3 Button — Primary (CTA)

```
[ Get in touch → ]
```

- Background: `var(--color-terracotta)`
- Text: `var(--color-cream)`, Inter 15px/600
- Padding: `px-6 py-3` (24px / 12px)
- Border radius: `var(--radius-md)` (8px)
- No border

**States:**
| State | Style |
|-------|-------|
| Default | Terracotta bg |
| Hover | `bg: #B0836A`, subtle `shadow-md`, `translateY(-1px)` |
| Active | `bg: #9A7060`, `translateY(0)` |
| Focus | `outline: 2px solid var(--color-terracotta)`, `outline-offset: 3px` |
| Disabled | `opacity: 0.45`, `cursor: not-allowed` |

---

### 2.4 Button — Ghost / Link

Used for secondary actions (e.g., "← Back", project arrow links).

- Background: transparent
- Text: `var(--color-terracotta)`, Inter 15px/500
- Border: `1px solid var(--color-terracotta)` (for ghost variant) or no border (for link variant)
- Padding: `px-5 py-2.5`

**States:**
| State | Style |
|-------|-------|
| Default | Terracotta text/border |
| Hover | `bg: rgba(194,151,127,0.08)`, text stays terracotta |
| Focus | `outline: 2px solid var(--color-terracotta)`, `outline-offset: 3px` |

---

### 2.5 Snap-Scroll Project Card

Each full-viewport project section in the snap-scroll zone.

**Layout (desktop — image right):**
```
┌──────────────────────────────────────────────────────────┐
│                                               │          │
│  01                                           │ [IMAGE]  │
│  Project Title                                │  (50%w)  │
│  Short description line                       │          │
│  → View case study                            │          │
│                                               │          │
└──────────────────────────────────────────────────────────┘
```

**Layout alternates**: odd projects image-right, even projects image-left.

**Specs:**
- Container: `height: 100svh`, `display: flex`, `align-items: center`
- Text column: `w-1/2`, padding `pl-20 pr-12` (desktop)
- Project number: `label-mono` style, `color: terracotta`, `mb-4`
- Title: `h2` type token, `color: forest`
- Description: `body-lg`, `color: taupe`, `max-w-sm`, `mt-4 mb-8`
- Arrow link: custom arrow SVG (Eric to provide) + project name, `color: terracotta`, hover underline
- Image column: `w-1/2`, image fills column, `object-fit: cover`, `aspect-ratio: 4/3`, `border-radius: var(--radius-lg)`

**Scroll progress indicator (right edge):**
- Fixed position `right-8`, vertically centered
- Per project: small circle `8px`, `bg: sage`
- Active: elongated pill `8px × 24px`, `bg: terracotta`, transition smooth
- Gap between dots: `8px`

**States:**
| State | Style |
|-------|-------|
| Entering (next) | `opacity: 0`, `translateY(24px)` → fade+slide up |
| Active | `opacity: 1`, `translateY(0)` |
| Exiting (prev) | `opacity: 0`, `translateY(-16px)` |

---

### 2.6 Case Study — Bento Grid

Three-column grid for the image mosaic section.

```
┌──────────┬──────────┬──────────┐
│  item A  │  item B  │          │
│ (1 col)  │ (1 col)  │  item C  │
├──────────┴──────────┤ (2 rows) │
│  item D  (2 cols)   │          │
├──────────┬──────────┴──────────┤
│          │  item F  (2 cols)   │
│  item E  ├──────────┬──────────┤
│ (2 rows) │  item G  │  item H  │
│          │ (1 col)  │ (1 col)  │
└──────────┴──────────┴──────────┘
```

**Specs:**
- Grid: `grid-cols-3`, `gap-3`
- Cell border radius: `var(--radius-md)` (8px)
- Cell background: `var(--color-surface)` as placeholder
- Images: `object-fit: cover`, fill cell entirely
- Span rules: vary per project — at least one 2-col and one 2-row item per grid
- Min cell height: `240px` desktop, `180px` tablet

**Item types (per grid):**
1. Homepage screenshot (2 cols)
2. Typography specimen (1 col)
3. Color palette swatch (1 col)
4. Mobile viewport (1 col, 2 rows)
5. Product/interior page (2 cols)
6. Detail / component close-up (1 col)

---

### 2.7 Browser Chrome Mockup

Shows the live site inside a realistic browser frame.

```
┌─────────────────────────────────────────────┐
│  ● ● ●  [ https://bloomin-acres.com      ]  │
├─────────────────────────────────────────────┤
│                                             │
│         [  site screenshot content  ]       │
│                                             │
└─────────────────────────────────────────────┘
```

**Specs:**
- Outer container: `border-radius: var(--radius-lg)`, `border: 1px solid var(--color-border)`, `overflow: hidden`
- Toolbar: `height: 40px`, `bg: var(--color-surface)`, `display: flex align-items: center px-4 gap-3`
- Traffic lights: three 10px circles — `#C45B5B`, `#D4924A`, `#7B816E` (no active behavior needed)
- URL bar: `flex-1`, `bg: var(--color-background)`, `border-radius: var(--radius-sm)`, `height: 24px`, `px-3`, `font: body-sm`, `color: taupe`
- Screenshot area: `img` fills full width, `display: block`

---

### 2.8 Chatbot Panel

Persistent on all pages, replaces contact page.

**Trigger button (bottom-left, always visible):**
- `position: fixed`, `bottom-6 left-6`, `z-50`
- Pill shape: `border-radius: 9999px`, `px-5 py-3`
- Background: `var(--color-dark)`
- Text: "Let's work together", `color: cream`, Inter 14px/500
- Left of text: 32px circular avatar (Eric's photo — Eric to provide)
- Hover: `bg: lighten 8%`, `shadow-lg`, `translateY(-2px)`

**Panel (open state):**
- `position: fixed`, `bottom-0 left-0 right-0` (mobile) / `bottom-6 left-6 w-96` (desktop)
- Max height: `85svh` mobile / `580px` desktop
- Background: `var(--color-cream)`
- Border: `1px solid var(--color-border)`
- Border radius: `var(--radius-xl) var(--radius-xl) 0 0` (mobile) / `var(--radius-xl)` (desktop)
- Shadow: `var(--shadow-lg)`
- Entry animation: `translateY(100%)` → `translateY(0)`, 300ms `var(--ease-out)` (mobile) / `opacity 0 scale(0.95)` → `opacity 1 scale(1)` (desktop)

**Panel interior:**
```
┌─────────────────────────────────────┐
│  [Avatar 48px]  Eric               [×]│
│  OphidianAI                         │
├─────────────────────────────────────┤
│  [Context pills — 2-3 per page]     │
│  ┌────────────────┐ ┌─────────────┐ │
│  │ About this work│ │ Get in touch│ │
│  └────────────────┘ └─────────────┘ │
├─────────────────────────────────────┤
│  Chat messages area (scrollable)    │
├─────────────────────────────────────┤
│  [Type a message…]           [Send] │
└─────────────────────────────────────┘
```

**Context pills:**
- `bg: rgba(170,172,154,0.18)`, `border-radius: 9999px`, `px-4 py-2`
- Text: Inter 13px/500, `color: forest`
- Hover: `bg: rgba(194,151,127,0.15)`, `color: terracotta`

**Tabs (Chat / Contact):**
- Underline style, `color: taupe` inactive / `color: terracotta` + `border-bottom: 2px solid terracotta` active

---

### 2.9 Testimonial Block

```
┌─────────────────────────────────────────────┐
│                                             │
│   " The site transformed how clients        │
│     perceive us before we ever speak. "     │
│                                             │
│              — Client Name, Title           │
│                                             │
└─────────────────────────────────────────────┘
```

- Quote: Playfair Display 28px/400, `font-style: italic`, `color: forest`, centered, `max-w-2xl mx-auto`
- Quotation marks: decorative, `color: terracotta`, `font-size: 4rem`, `line-height: 0`
- Attribution: Inter 14px/600, `color: taupe`, `letter-spacing: 0.06em`, centered, `mt-6`
- Container padding: `py-18` (72px)

---

### 2.10 Scope of Work List

Numbered horizontal list used in case studies.

```
SCOPE OF WORK
01 Brand Design  /  02 Web Design  /  03 Custom Illustration  /  04 SEO
```

- Label: `.label-caps` style (§1.2), `color: taupe`, `mb-4`
- List: `display: flex`, `flex-wrap: wrap`, `gap-x-6 gap-y-2`
- Each item: Space Mono 13px, `color: forest`
- Number prefix: `color: terracotta`
- Separator: ` / ` character, `color: sage`, or use `gap` only

---

### 2.11 Section — Two-Column Intro (Case Study)

```
┌─────────────────────────┬──────────────────┐
│                         │ Client           │
│  Project description    │ Bloomin' Acres   │
│  paragraph 1            │                  │
│                         │ Timeline         │
│  Project description    │ 8 weeks          │
│  paragraph 2            │                  │
│                         │ Role             │
│                         │ Design + Dev     │
│                         │                  │
│                         │ Year             │
│                         │ 2025             │
└─────────────────────────┴──────────────────┘
```

**Specs:**
- Grid: `grid-cols-3`, left column `col-span-2`, right column `col-span-1`
- Left: `body-lg`, `color: taupe`, `pr-12`
- Right: metadata pairs stacked, label `.label-caps`, value Inter 15px/500 `color: forest`, `gap-y-6`

---

## 3. Page Layouts

### 3.1 Landing Page

Five scroll phases. Use a single scroll container with fixed `100svh` viewports.

#### Phase 1 — Constellation (Viewport 1)

```
┌─────────────────────────────────────────────┐
│                 [nav]                       │
│                                             │
│  •  ○                                       │
│         Ophidian           ○                │
│      Web design & integration               │
│   ○        studio               •           │
│                  ○                          │
│                                             │
└─────────────────────────────────────────────┘
```

- Background: `var(--color-cream)`, full viewport
- Wordmark: `display` type token, `color: forest`, centered
- Tagline: `body-lg`, `color: taupe`, centered, below wordmark, `mt-4`
- Thumbnails: scattered positions — see §3.1.1 for desktop/mobile position maps
- Scroll hint: small downward chevron, `color: sage`, `bottom-8`, centered, gentle bob animation

**Thumbnail position map (desktop 1280px, 2 projects):**

| Thumbnail | X | Y | Size |
|-----------|---|---|------|
| Project 1 | 18% | 28% | lg (160px) |
| Project 2 | 72% | 55% | md (120px) |

For 3–4 projects, spread positions to corners + mid-edges. For 5–8, distribute evenly across the canvas with variation in size (sm/md/lg). These are percentage-based `position: absolute` values inside the viewport container.

Mobile (< 768px): Use 3 thumbnails max, positions: `[25%, 20%]`, `[70%, 35%]`, `[45%, 70%]` all at `sm` size (80px).

#### Phase 2 — Funnel (Scroll 20–60%)

- GSAP ScrollTrigger, `scrub: 1`
- Each thumbnail follows a unique Bézier path toward `[50%, 50%]`
- Scale: `1 → 0.4`, Opacity: `1 → 0.15`
- Wordmark + tagline: opacity `1 → 0`, `translateY(0 → -20px)`
- Concentric ring: SVG circle at center, `stroke: var(--color-sage)`, `stroke-dasharray: 4 8`, scale `0 → 1.5` then fades out, one ring per thumbnail

**GSAP setup pattern:**
```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: '#constellation', scrub: 1, start: 'top top', end: '+=200%' }
})
thumbnails.forEach((el, i) => {
  tl.to(el, { x: centerX - el.x, y: centerY - el.y, scale: 0.4, opacity: 0.15,
    ease: 'power2.inOut' }, 0)
})
tl.to('#wordmark', { opacity: 0, y: -20 }, 0)
```

#### Phase 3 — Zoom to First Project (Scroll 60–80%)

- First thumbnail: `clip-path: circle(50%)` → `clip-path: inset(0 round 16px)` (circle → rectangle)
- Scale: `0.4 → 1`, centered, transitions to full-width image
- Other thumbnails: fade to ghost (`opacity: 0.06`), drift to viewport edges
- Text layer fades in: project number `01`, title, one-liner, arrow link

#### Phase 4 — Snap Scroll Projects

- CSS: `scroll-snap-type: y mandatory` on container
- Each section: `scroll-snap-align: start`, `height: 100svh`
- IntersectionObserver on each section for enter/exit animations (see §2.5)
- Scroll progress dots: fixed, right edge (see §2.5)

#### Phase 5 — Statement Footer

```
┌─────────────────────────────────────────────┐
│ (bg: #3A3A35)                               │
│                                             │
│              Ophidian                       │
│    (display size, Romantically, cream)      │
│                                             │
│       Let's build something together        │
│           (body-lg, cream 70%)              │
│                                             │
│          [ Get in touch → ]                 │
│            (CTA button, terracotta)         │
│                                             │
│         ophidian.com  ·  2026               │
│            (body-sm, cream 40%)             │
└─────────────────────────────────────────────┘
```

---

### 3.2 Case Study Page (`/work/[slug]`)

Scroll linearly — no snap behavior.

**Section order:**

1. **Back nav** (40px height): `← Back` left, wordmark center, menu button right
2. **Full-bleed hero** (60svh): hero image fills width, gradient overlay `linear-gradient(to bottom, transparent 40%, rgba(58,58,53,0.7) 100%)`, project name `h2 text-cream` centered bottom, `pb-12`
3. **Two-column intro** (§2.11): max-width 1152px, `py-18`
4. **Scope list** (§2.10): full width, `py-8`, `border-top: 1px solid var(--color-border)`
5. **Bento grid** (§2.6): max-width 1152px, `py-12`
6. **Browser mockup** (§2.7): max-width 900px, centered, `py-12`
7. **Testimonial** (§2.9): full width cream, `py-18` — omit section entirely if no testimonial
8. **Next project nav** (80px): dark bar (`bg-dark`), "Next Project" label left, project name + arrow link right

---

### 3.3 Approach Page (`/approach`)

Organic / editorial. Content grows over time.

**Section order:**

1. **Nav** (standard)
2. **Tree illustration hero** (80svh): SVG or Lottie tree, centered, scroll-triggered growth. Background: `var(--color-cream)`. If animation not ready, static SVG tree in sage/terracotta/cream fills the role.
3. **Philosophy statement**: max-width 640px, centered, `py-18`. Heading `h2 font-serif`, body `body-lg color-taupe`.
4. **Process overview**: alternating text + icon rows, 3–4 steps. Icons from Canva "Organic Collections" set (brand:BAEjlqO2kVA). Each step: icon left 64px, text right `h4` + `body`.
5. **Future sections** injected below via MDX.

**Process step pattern:**
```
┌──────────────────────────────────────────────┐
│ [Icon]    01  Discovery                      │
│           We start by listening…             │
└──────────────────────────────────────────────┘
```
- Icon: 56px, Canva organic style (export as SVG from Canva, inline in components)
- Step number: `label-mono color-terracotta`
- Title: `h4 color-forest`
- Body: `body color-taupe`

---

## 4. Animation Specs

### 4.1 Constellation Idle (CSS)

```css
@keyframes drift-a {
  0%   { transform: translate(0, 0) rotate(0deg); }
  25%  { transform: translate(6px, -8px) rotate(1.5deg); }
  50%  { transform: translate(-4px, 5px) rotate(-1deg); }
  75%  { transform: translate(8px, 3px) rotate(2deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

@keyframes drift-b {
  0%   { transform: translate(0, 0) rotate(0deg); }
  33%  { transform: translate(-7px, 4px) rotate(-2deg); }
  66%  { transform: translate(5px, -6px) rotate(1deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}
```

- Assign alternating `drift-a` / `drift-b` to thumbnails
- Duration: `8s` / `11s` (vary per thumbnail)
- `animation-timing-function: ease-in-out`
- `animation-iteration-count: infinite`
- `will-change: transform` for GPU compositing

### 4.2 Scroll Hint Bob

```css
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(6px); }
}
.scroll-hint { animation: bob 2s ease-in-out infinite; }
```

Fade out when scroll > 5% of page height.

### 4.3 Nav Dropdown Open

```css
.dropdown {
  transform-origin: top right;
  animation: dropdown-in 150ms var(--ease-out) forwards;
}
@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### 4.4 Snap-Scroll Section Transitions

Use IntersectionObserver with threshold 0.4:

```js
// On intersecting:
el.style.opacity = '1'
el.style.transform = 'translateY(0)'
el.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out'

// Reset (before entering):
el.style.opacity = '0'
el.style.transform = 'translateY(24px)'
```

### 4.5 Approach Tree (Nice-to-Have)

If implementing with Lottie:
- Trigger: IntersectionObserver when tree enters viewport
- Play: Lottie `goToAndPlay(0, true)` on trigger
- If static SVG: apply `stroke-dasharray` / `stroke-dashoffset` reveal on paths, triggered by IntersectionObserver

---

## 5. Accessibility

| Requirement | Spec |
|-------------|------|
| Color contrast (text on cream) | Forest `#7B816E` on cream `#F7EFE6` — 4.6:1 ✓ AA |
| Color contrast (body text) | Taupe `#928571` on cream — 3.9:1 — use `body-lg` (18px+) to qualify AA large text |
| Color contrast (cream on dark) | `#F7EFE6` on `#3A3A35` — 10.8:1 ✓ AAA |
| Color contrast (terracotta on cream) | `#C2977F` on `#F7EFE6` — 2.9:1 — do NOT use for body text; OK for decorative/large elements |
| Touch targets | Minimum 44×44px for all interactive elements |
| Focus rings | 2px solid terracotta, offset 3px — all interactive elements |
| Reduced motion | Wrap all animations in `@media (prefers-reduced-motion: no-preference)`. Static alternatives: thumbnails in fixed grid, no funnel animation, no drift. |
| Keyboard nav | Nav dropdown: trap focus within dropdown when open, `Escape` closes |
| ARIA | Chatbot panel: `role="dialog"`, `aria-label="Contact panel"`. Nav dropdown: `aria-expanded` on trigger. Scroll progress dots: `aria-label="Project X of N"`. |
| Alt text | All project images require descriptive `alt` text |

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Name |
|------------|-------|------|
| Mobile | < 768px | `sm` |
| Tablet | 768–1199px | `md` |
| Desktop | 1200px+ | `lg` |

### Mobile-specific overrides

- Constellation: 3 thumbnails max, `sm` size (80px), no drift animation (too cramped) — replace with gentle scale pulse
- Snap-scroll: image stacks above text, full-width image `aspect-ratio: 16/9`, text below with `px-6 py-8`
- Case study hero: 50svh
- Bento grid: single column
- Browser mockup: full-width, smaller URL bar (hide on < 375px)
- Chatbot: full-screen overlay, `position: fixed inset-0`, slides up from bottom
- Nav dropdown: full-width card minus `mx-4`
- Type scale: `h1 → 40px`, `h2 → 28px`, `display → 48px`

### Tablet-specific overrides

- Constellation: all thumbnails visible, reduced orbit spread (80% of desktop positions)
- Snap-scroll: image above (50% height), text below
- Bento grid: 2 columns
- Case study intro: single column (stack left/right into top/bottom)

---

## 7. Globals.css Replacement Plan

Full replacement of the existing dark forest system. Do NOT patch — replace entirely.

**Step 1**: Clear everything inside the existing `@theme inline {}` block.
**Step 2**: Paste the new color token block from §1.1.
**Step 3**: Replace font variables with new stack (§1.2).
**Step 4**: Remove all glass-morphism utilities: `.glass`, `.venom-glow`, `.glow-border`, particle backdrop classes.
**Step 5**: Remove dark surface hierarchy (`--color-surface-base`, `--color-surface-container-*`, etc.).
**Step 6**: Add spacing additions from §1.3.

---

## 8. Implementation Priority

**Phase 1 — Foundation (unblocks everything)**
1. Replace `globals.css` tokens (§7)
2. Load new fonts in `layout.tsx`
3. Update Tailwind config with brand colors
4. Delete: Three.js, tsparticles, glass-morphism components, old service pages

**Phase 2 — Navigation**
1. Build `<Nav>` component with compact dropdown (§2.1)

**Phase 3 — Constellation Hero**
1. Build `<Thumbnail>` component (§2.2)
2. Build `<ConstellationHero>` (§3.1 Phase 1)
3. Add idle drift CSS animations (§4.1)
4. Add GSAP ScrollTrigger funnel (§3.1 Phase 2–3)

**Phase 4 — Snap Scroll**
1. Build `<ProjectSection>` (§2.5)
2. Wire snap-scroll container + CSS
3. Add scroll progress dots
4. Build `<StatementFooter>` (§3.1 Phase 5)

**Phase 5 — Case Studies**
1. Build `<CaseStudyPage>` template (§3.2)
2. Build `<BentoGrid>` (§2.6)
3. Build `<BrowserMockup>` (§2.7)
4. Populate Bloomin' Acres + Midwest Maintenance data

**Phase 6 — Chatbot Restyle**
1. Restyle existing Iris chatbot to match §2.8
2. Build context pills per-page

**Phase 7 — Approach Page**
1. Build `<ApproachPage>` (§3.3)
2. Static tree SVG initially; animate later

**Phase 8 — Polish**
1. Responsive testing at 375px, 768px, 1280px
2. Lighthouse audit — target 90+ performance, 95+ accessibility
3. Reduced motion verification
4. Remove all deprecated pages

---

## 9. Open Items (Blocking or Near-Blocking)

| Item | Owner | Blocks |
|------|-------|--------|
| Custom arrow icon for project links | Eric | Phase 4 |
| Eric's photo/avatar for chatbot | Eric | Phase 6 |
| "Romantically" font file (woff2) confirmed for web use | Eric | Phase 1 typography |
| Branding guide finalization | Eric | Phase 1 |
| Logo SVG + logomark SVG exported for web | Eric | Phase 2 nav |
| Spec portfolio sites content | Eric | Phase 4–5 (can use placeholders) |

---

## 10. Canva Icon Reference

**Collection**: Abstract Shape — Organic Collections
**Canva search ID**: `brand:BAEjlqO2kVA`
**Usage**: Approach page process steps, decorative accents
**Export format**: SVG from Canva, inline in React components
**Color overrides**: Replace default fills with `var(--color-sage)` and `var(--color-terracotta)` to match brand

---

*This document is the implementation contract. All code decisions must trace back to this spec. If a design question arises during implementation that this document does not answer, route back to UI Designer before proceeding.*
