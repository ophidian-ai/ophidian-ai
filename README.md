# OphidianAI

Marketing website and client platform for [OphidianAI](https://ophidianai.com) -- an AI-powered digital studio offering web design, SEO, and digital marketing services.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS 4, PostCSS |
| Content | MDX |
| Animation | GSAP, Framer Motion, Three.js / React Three Fiber |
| Backend | Supabase (auth, database, storage) |
| Payments | Stripe |
| Email | Resend |
| AI | Vercel AI SDK, Google Gemini |
| Hosting | Vercel |
| Cache | Upstash Redis (Vercel KV) |
| Analytics | Vercel Analytics |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/ophidian-ai/ophidian-ai.git
cd ophidian-ai
npm install
cp .env.example .env.local
# Fill in environment variables (see table below)
npm run dev
```

The dev server starts at `http://localhost:3000`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── about/           # About page
│   ├── api/             # API routes (scan engine, crons, webhooks)
│   ├── auth/            # Authentication (Supabase)
│   ├── blog/            # Blog (MDX)
│   ├── chat/            # Embeddable chatbot widget
│   ├── checkout/        # Stripe checkout flow
│   ├── contact/         # Contact page
│   ├── dashboard/       # Client dashboard
│   ├── faq/             # FAQ page
│   ├── portfolio/       # Portfolio page
│   ├── pricing/         # Pricing page
│   ├── report/          # SEO scan reports
│   ├── services/        # Services page
│   ├── tools/           # Public tools (SEO scanner)
│   ├── layout.tsx       # Root layout
│   ├── robots.ts        # Dynamic robots.txt
│   └── sitemap.ts       # Dynamic sitemap
├── components/          # React components
├── content/             # MDX content files
├── emails/              # Email templates (Resend)
├── hooks/               # Custom React hooks
├── lib/                 # Shared libraries and utilities
├── middleware.ts         # Next.js middleware (auth, routing)
└── utils/               # Utility functions
public/                  # Static assets (images, video, fonts)
supabase/                # Supabase config and migrations
docs/                    # Documentation
scripts/                 # Utility scripts
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `KV_REST_API_URL` | Yes | Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | Yes | Upstash Redis REST token |
| `RESEND_API_KEY` | Yes | Resend API key for transactional email |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_PRODUCT_*` / `STRIPE_PRICE_*` | Yes | Stripe product and price IDs (see `.env.example` for full list) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (AI features) |
| `GOOGLE_PSI_API_KEY` | No | Google PageSpeed Insights key (SEO scan engine) |
| `FIRECRAWL_API_KEY` | No | Firecrawl API key (SEO scan engine) |
| `SCAN_API_KEY` | No | Internal auth key for scan API |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL (`https://ophidianai.com`) |

All secrets are configured in the Vercel dashboard for production. Never commit `.env.local`.

## Deployment

Production deployments happen automatically via Vercel when code is merged to `main`.

1. Create a feature branch and push your changes.
2. Vercel generates a preview deployment automatically.
3. Open a PR into `main`.
4. After review and merge, Vercel deploys to production.

Never push directly to `main`.

### Vercel Cron Jobs

The project uses Vercel Cron Jobs for background automation (configured in `vercel.json`):

- Chatbot analytics and demo expiry (daily)
- Email campaign sends and sequence processing (every 5-15 min)
- CRM automation processing (every minute)
- SEO report dispatch (monthly)
- Review polling and analytics (every 4 hours / daily)

## Brand

| Element | Value |
|---------|-------|
| Tagline | "Where the natural world meets innovation." |
| Aesthetic | Organic intelligence -- biological intuition meets machine precision |
| Primary color | Forest `#1B2E21` |
| Accent color | Gold `#C4A265` |
| Secondary color | Sage `#7A9E7E` |
| Heading font | Playfair Display |
| Body font | Inter |
| Code font | Space Mono |

Imagery uses natural environments, forests, and dramatic lighting. No circuit boards, neon grids, or tech-futuristic aesthetics.

## Known Issues

Full details in the project audit document.

- **Placeholder content**: Testimonials section uses fabricated reviews with random avatar generator (`i.pravatar.cc`). Needs real testimonials or removal.
- **Placeholder phone number**: Contact and footer display `(812) 555-1234`.
- **Social links**: Footer social media links point to platform root domains, not OphidianAI profiles.
- **Large assets in repo**: 51MB hero video and 17MB of serpent animation frames committed to git. Should be moved to CDN/Vercel Blob.
- **robots.txt**: Lighthouse flags validation issues on mobile.
- **Color contrast**: Services section text (`#8a988a` on `#d4dfd0`) fails WCAG AA at 2.19:1 ratio (4.5:1 required).
- **Generic CTAs**: "Get Started" used across hero, pricing, and navbar -- should be more specific.
- **CRM cron frequency**: `crm-automation-process` runs every minute (43,200 invocations/month). Consider reducing.

## License

Proprietary. All rights reserved.
