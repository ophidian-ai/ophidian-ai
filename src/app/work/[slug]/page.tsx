import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Nav } from "@/components/layout/Nav";
import { BentoGrid } from "@/components/sections/BentoGrid";
import { BrowserMockup } from "@/components/sections/BrowserMockup";
import { getPortfolioProject, getPortfolioProjects } from "@/lib/portfolio";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getPortfolioProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPortfolioProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case Study`,
    description: project.subtitle,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getPortfolioProject(slug);
  if (!project) notFound();

  // Derive year from created_at
  const year = new Date(project.created_at).getFullYear();

  // Scope items: features + tech_stack
  const scopeItems = [
    ...project.features.map((f) => f.title),
    ...project.tech_stack.map((t) => t.name),
  ].slice(0, 6);

  // Bento items from available images
  const bentoItems = [
    project.hero_image && {
      src: project.hero_image,
      alt: project.hero_image_alt,
      colSpan: 2 as const,
      rowSpan: 1 as const,
    },
    project.gallery_image && {
      src: project.gallery_image,
      alt: project.gallery_image_alt,
      colSpan: 1 as const,
      rowSpan: 2 as const,
    },
  ].filter(Boolean) as Parameters<typeof BentoGrid>[0]["items"];

  // Find next project for the bottom nav
  const allProjects = await getPortfolioProjects();
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const nextProject = allProjects[(currentIndex + 1) % allProjects.length];

  return (
    <>
      <Nav />

      {/* Back nav — replaces standard nav for case study pages */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 49,
          height: "40px",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          background: "var(--color-cream)",
          borderBottom: "1px solid var(--color-border)",
          marginTop: "64px", // below Nav
        }}
      >
        <Link href="/" className="back-link">
          ← Back
        </Link>
      </div>

      <main style={{ background: "var(--color-cream)", paddingTop: "104px" }}>
        {/* 1. Full-bleed hero */}
        <section
          style={{
            position: "relative",
            height: "60svh",
            overflow: "hidden",
          }}
        >
          {project.hero_image ? (
            <Image
              src={project.hero_image}
              alt={project.hero_image_alt}
              fill
              priority
              style={{ objectFit: "cover", objectPosition: project.hero_image_pos }}
              sizes="100vw"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, var(--color-sage) 0%, var(--color-taupe) 100%)",
              }}
            />
          )}
          {/* Gradient overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 40%, rgba(58,58,53,0.7) 100%)",
            }}
          />
          {/* Project name */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "0 24px 48px",
              maxWidth: "1152px",
              margin: "0 auto",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 600,
                lineHeight: 1.15,
                color: "#F7EFE6",
                margin: 0,
              }}
            >
              {project.title}
            </h1>
          </div>
        </section>

        {/* 2. Two-column intro */}
        <section
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "72px 24px",
          }}
          className="case-study-intro"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "48px",
            }}
            className="intro-grid"
          >
            {/* Left: description */}
            <div>
              {project.subtitle && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "18px",
                    fontWeight: 400,
                    lineHeight: 1.65,
                    color: "var(--color-taupe)",
                    marginBottom: "24px",
                  }}
                >
                  {project.subtitle}
                </p>
              )}
              {project.challenge && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "18px",
                    fontWeight: 400,
                    lineHeight: 1.65,
                    color: "var(--color-taupe)",
                  }}
                >
                  {project.challenge}
                </p>
              )}
            </div>

            {/* Right: metadata */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <MetaItem label="Client" value={project.title} />
              {project.timeline[0] && (
                <MetaItem label="Timeline" value={project.timeline[0].duration} />
              )}
              <MetaItem label="Role" value="Design + Development" />
              <MetaItem label="Year" value={String(year)} />
            </div>
          </div>
        </section>

        {/* 3. Scope of work */}
        {scopeItems.length > 0 && (
          <section
            style={{
              borderTop: "1px solid var(--color-border)",
              padding: "32px 24px",
              maxWidth: "1152px",
              margin: "0 auto",
            }}
          >
            <p className="label-caps" style={{ marginBottom: "16px" }}>
              Scope of Work
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px" }}>
              {scopeItems.map((item, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span className="label-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                      color: "var(--color-forest)",
                    }}
                  >
                    {item}
                  </span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 4. Bento grid */}
        {bentoItems.length > 0 && (
          <section
            style={{
              maxWidth: "1152px",
              margin: "0 auto",
              padding: "48px 24px",
            }}
          >
            <BentoGrid items={bentoItems} />
          </section>
        )}

        {/* 5. Browser mockup */}
        {project.external_url && project.hero_image && (
          <section
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              padding: "48px 24px",
            }}
          >
            <BrowserMockup
              src={project.hero_image}
              alt={`${project.title} website`}
              url={project.external_url.replace(/^https?:\/\//, "")}
            />
          </section>
        )}

        {/* 6. Solution / results */}
        {project.solution && (
          <section
            style={{
              maxWidth: "1152px",
              margin: "0 auto",
              padding: "72px 24px",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <div style={{ maxWidth: "640px" }}>
              <p className="label-caps" style={{ marginBottom: "16px" }}>
                The Outcome
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "18px",
                  fontWeight: 400,
                  lineHeight: 1.65,
                  color: "var(--color-taupe)",
                }}
              >
                {project.solution}
              </p>
            </div>
          </section>
        )}

        {/* 7. Next project nav */}
        {nextProject && nextProject.slug !== slug && (
          <div
            style={{
              background: "var(--color-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              height: "80px",
            }}
          >
            <span
              className="label-caps"
              style={{ color: "rgba(247,239,230,0.5)" }}
            >
              Next Project
            </span>
            <Link
              href={`/work/${nextProject.slug}`}
              className="next-project-link"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "15px",
                fontWeight: 500,
                color: "var(--color-terracotta)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {nextProject.title} →
            </Link>
          </div>
        )}
      </main>

      {/* Responsive overrides + hover states */}
      <style>{`
        .back-link {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-taupe);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color var(--duration-fast);
        }
        .back-link:hover { color: var(--color-forest); }
        .next-project-link:hover { text-decoration: underline; }
        @media (max-width: 768px) {
          .intro-grid {
            grid-template-columns: 1fr !important;
          }
          .case-study-intro {
            padding: 48px 24px !important;
          }
        }
      `}</style>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-caps" style={{ marginBottom: "4px" }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          fontWeight: 500,
          color: "var(--color-forest)",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}
