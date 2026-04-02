# Dashboard Palette: Dual Voltage

**Date:** 2026-04-01
**Status:** Approved
**Scope:** All dashboard pages (`/dashboard/**`) — admin and client views

## Summary

Replace the undefined/broken dashboard color system with the "Dual Voltage" palette: a cool dark slate base with a two-tone accent system — neon green for navigation/status and electric blue for data/charts — plus hot pink for alerts. Subtle glow level (flat colors, no text-shadow or box-shadow glow effects).

## Design Decisions

- **Direction chosen:** Dual Voltage (Option C from V2 exploration)
- **Glow intensity:** Subtle — vibrant colors carry themselves flat against the dark base
- **Inspiration:** Stripe (blue-gray darks, clarity), Neon (vibrant green accent), Vercel (restraint)
- **Scoping mechanism:** `[data-dashboard]` attribute on `DashboardShell` container, CSS custom property overrides. Marketing site is unaffected.

## Color Tokens

| Role | CSS Variable | Value | Usage |
|---|---|---|---|
| Background | `--color-background` | `#0C0E14` | Page background |
| Surface | `--color-surface` | `#141722` | Cards, inputs, table rows |
| Raised | `--color-surface-hover` | `#1C2030` | Hover states, elevated surfaces |
| Foreground | `--color-foreground` | `#E4E7ED` | Primary text, headings, stat values |
| Muted | `--color-foreground-muted` | `#7C8494` | Secondary text, labels, subtitles |
| Dim | `--color-foreground-dim` | `#4A5060` | Disabled text, tertiary info |
| Primary (blue) | `--color-primary` | `#2D8CFF` | Data, charts, links, prospect badges, chart lines |
| Accent (green) | `--color-accent` | `#00E67A` | Nav active state, success badges, positive metrics |
| Error (pink) | `--color-error` | `#FF4D6A` | Alerts, churn risk, negative states, destructive actions |
| Border | `--color-border` | `rgba(45,140,255,0.06)` | Card borders, table row dividers |
| Border strong | `--color-border-strong` | `rgba(45,140,255,0.12)` | Focused inputs, hover borders |

## Accent Color Roles

The two-tone system has clear semantic roles:

- **Green (`#00E67A`)** — Navigation & status: sidebar active item, "Active" badges, positive change indicators (+3, +12%, "Healthy")
- **Blue (`#2D8CFF`)** — Data & interaction: chart lines, chart gradients, "Prospect" badges, links, buttons, focused inputs
- **Pink (`#FF4D6A`)** — Danger & attention: error states, churn risk, negative changes, destructive action buttons

## Surface Treatments

- **Glass:** `background: rgba(20, 23, 34, 0.65); backdrop-filter: blur(20px);`
- **Card borders:** `1px solid rgba(45, 140, 255, 0.06)`
- **Sidebar border:** `1px solid rgba(0, 230, 122, 0.06)`
- **Table row dividers:** `1px solid rgba(255, 255, 255, 0.04)`
- **Glow card:** Mouse-tracking radial gradient with `rgba(45, 140, 255, 0.06)` — visible on hover only

## Chart Colors

Hardcoded Recharts values must be updated across dashboard pages:

- **Chart line/area stroke:** `#2D8CFF`
- **Chart gradient:** `#2D8CFF` at 15% opacity → 0%
- **Grid lines:** `rgba(255, 255, 255, 0.05)`
- **Axis text:** `#7C8494`
- **Tooltip background:** `#141722`
- **Tooltip border:** `rgba(45, 140, 255, 0.15)`
- **Tooltip text:** `#E4E7ED`
- **Pie/donut colors:** `['#2D8CFF', '#00E67A', '#FF4D6A', '#7C8494', '#A78BFA', '#F59E0B']`
- **Bar fill:** `#2D8CFF` at 85% opacity

## Files to Modify

1. `src/app/globals.css` — Update `[data-dashboard]` overrides with new token values, update `.glass` and `.glow-card` dashboard variants
2. `src/components/dashboard/dashboard-shell.tsx` — Already has `data-dashboard` (from prior commit)
3. `src/app/dashboard/page.tsx` — Update `PIE_COLORS`, Recharts tooltip styles, hardcoded colors
4. `src/app/dashboard/admin/analytics/page.tsx` — Update `PRODUCT_COLORS`, tooltip styles, chart colors
5. All other dashboard pages with hardcoded Recharts/chart colors

## Marketing Site

**Not in scope for this spec.** The marketing site will be redesigned separately as a "Modern SaaS Studio" — portfolio-as-landing-page with scroll animations, dashboard/hero showcases, and AI integration add-ons. That work will get its own design spec in a future session.

## WCAG Contrast Ratios

| Pair | Ratio | Grade |
|---|---|---|
| `#E4E7ED` on `#0C0E14` | ~15.2:1 | AAA |
| `#7C8494` on `#0C0E14` | ~5.8:1 | AA |
| `#4A5060` on `#0C0E14` | ~3.2:1 | AA (large text) |
| `#2D8CFF` on `#0C0E14` | ~6.4:1 | AA |
| `#00E67A` on `#0C0E14` | ~9.8:1 | AAA |
| `#FF4D6A` on `#0C0E14` | ~5.5:1 | AA |
