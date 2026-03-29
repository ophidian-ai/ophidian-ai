import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Nav } from "@/components/layout/Nav";
import { getPortfolioProjects } from "@/lib/portfolio";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Work — OphidianAI",
  description:
    "Real projects built for real businesses. Each case study breaks down the challenge, the solution, and the results.",
};

export default async function WorkPage() {
  const projects = await getPortfolioProjects();

  return (
    <>
      <Nav />
      <main
        style={{
          background: "var(--color-cream)",
          minHeight: "100svh",
          paddingTop: "64px",
        }}
      >
        {/* Header */}
        <section
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "clamp(48px, 8vw, 96px) clamp(20px, 5vw, 48px) clamp(32px, 5vw, 64px)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-terracotta)",
              marginBottom: "16px",
            }}
          >
            Selected Work
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "var(--color-forest)",
              maxWidth: "640px",
              marginBottom: "24px",
            }}
          >
            Built for businesses that want to stand out.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.0625rem",
              lineHeight: 1.7,
              color: "var(--color-taupe)",
              maxWidth: "480px",
            }}
          >
            Every project starts with a real problem. These are the solutions we
            built — and the results they delivered.
          </p>
        </section>

        {/* Project grid */}
        {projects.length === 0 ? (
          <section
            style={{
              maxWidth: "1152px",
              margin: "0 auto",
              padding: "0 clamp(20px, 5vw, 48px) 96px",
              color: "var(--color-taupe)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Case studies coming soon.
          </section>
        ) : (
          <section
            style={{
              maxWidth: "1152px",
              margin: "0 auto",
              padding: "0 clamp(20px, 5vw, 48px) 96px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))",
                gap: "clamp(24px, 4vw, 48px)",
              }}
            >
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/work/${project.slug}`}
                  style={{ display: "block", textDecoration: "none" }}
                  className="work-card"
                >
                  {/* Hero image */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16 / 10",
                      overflow: "hidden",
                      borderRadius: "12px",
                      background: "var(--color-surface)",
                      marginBottom: "20px",
                    }}
                  >
                    <Image
                      src={project.hero_image}
                      alt={project.hero_image_alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 576px"
                      style={{
                        objectFit: "cover",
                        objectPosition: project.hero_image_pos,
                        transition: "transform 0.5s ease",
                      }}
                      className="work-card-image"
                    />
                  </div>

                  {/* Project info */}
                  <div>
                    {/* Metric pills */}
                    {project.metrics.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "12px",
                        }}
                      >
                        {project.metrics.slice(0, 3).map((m, i) => (
                          <span
                            key={i}
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.6875rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "var(--color-terracotta)",
                              background: "rgba(194, 151, 127, 0.1)",
                              padding: "3px 10px",
                              borderRadius: "999px",
                            }}
                          >
                            {m.value} {m.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)",
                        fontWeight: 700,
                        color: "var(--color-forest)",
                        marginBottom: "6px",
                        lineHeight: 1.2,
                      }}
                    >
                      {project.title}
                    </h2>

                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.9375rem",
                        color: "var(--color-taupe)",
                        lineHeight: 1.55,
                        marginBottom: "16px",
                      }}
                    >
                      {project.subtitle}
                    </p>

                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.875rem",
                        color: "var(--color-forest)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderBottom: "1px solid currentColor",
                        paddingBottom: "1px",
                      }}
                    >
                      View case study{" "}
                      <Image
                        src="/arrow-icon.png"
                        alt=""
                        width={18}
                        height={17}
                        style={{ display: "inline-block", verticalAlign: "middle" }}
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Statement footer CTA */}
        <section
          style={{
            background: "var(--color-dark)",
            padding: "clamp(48px, 8vw, 80px) clamp(20px, 5vw, 48px)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--color-cream)",
              maxWidth: "640px",
              margin: "0 auto 24px",
              lineHeight: 1.2,
            }}
          >
            Your project could be next.
          </p>
          <Link
            href="/contact"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              letterSpacing: "0.06em",
              color: "var(--color-cream)",
              background: "transparent",
              border: "1px solid rgba(247, 239, 230, 0.35)",
              borderRadius: "999px",
              padding: "12px 28px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Get in touch →
          </Link>
        </section>
      </main>

      {/* Hover effect styles */}
      <style>{`
        .work-card { cursor: pointer; }
        .work-card:hover .work-card-image { transform: scale(1.04); }
        @media (prefers-reduced-motion: reduce) {
          .work-card:hover .work-card-image { transform: none; }
        }
      `}</style>
    </>
  );
}
