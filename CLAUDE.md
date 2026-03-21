# OphidianAI Website

Marketing website for OphidianAI — an AI-powered digital studio.

## Project Info

- **Type**: Internal product (company website)
- **Managed by**: OphidianAI (Project Chimera orchestration system)
- **Repo**: https://github.com/ophidian-ai/ophidian-ai
- **Brand guide**: See the brand guide in the Chimera repo at `.claude/brand-assets/ophidianai/brand-guide.md`

## Tech Stack

- **Framework**: Next.js (App Router), TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Content**: MDX
- **Hosting**: Vercel
- **Backend**: Supabase

## Deployment Workflow

1. Work on a feature branch. Branch names follow `<department>/<agent>/<brief-description>` (e.g., `design/frontend-developer/hero-redesign`).
2. Vercel auto-generates a preview deployment for every branch push.
3. Open a PR from the feature branch into `main` with a summary and the Vercel preview URL.
4. Eric reviews the preview and merges when satisfied.
5. Vercel deploys to production on merge to `main`.

**Never push directly to `main`.** All changes go through PRs.

## Security Rules

- Do NOT read, modify, or create `.env` files. Environment variables are documented in `.env.example` and configured in the Vercel/Supabase dashboards.
- Do NOT store credentials, API keys, or secrets in code. Reference them by environment variable name only.
- Do NOT push to `main` or merge PRs. The user is the gatekeeper.
- Do NOT interact with Vercel or Supabase dashboards directly.

## Brand

- **Tagline**: "Where the natural world meets innovation."
- **Aesthetic**: Organic intelligence — biological intuition meets machine precision
- **Colors**: Sage (#7A9E7E), Gold (#C4A265), Forest (#1B2E21)
- **Typography**: Playfair Display (headings), Inter (body), Space Mono (code/data)
- **Imagery**: Natural environments, forests, dramatic lighting — NOT circuit boards or neon grids
- Do NOT use the deprecated dark/futuristic palette (deep navy, electric green, circuit teal)

## Next.js Conventions

- Default to Server Components. Only add `'use client'` when you need interactivity or browser APIs.
- Use `src/` directory structure.
- Follow existing patterns in the codebase for routing, layouts, and components.
- All request APIs are async: `await cookies()`, `await headers()`, `await params`, `await searchParams`.

## File Structure

- `src/` — Application source code
- `public/` — Static assets
- `docs/` — Documentation
- `scripts/` — Utility scripts
- `supabase/` — Supabase configuration and migrations

## Dependencies

- No new runtime dependencies without explicit approval from Eric
- Dev dependencies are fine if justified
