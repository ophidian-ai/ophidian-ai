import type { Metadata } from "next";
import { Nav } from "@/components/layout/Nav";
import { StatementFooter } from "@/components/sections/StatementFooter";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "How we work. Thoughtful process, premium execution, and results that stick.",
};

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Discovery",
    body: "We start by listening — to the business, the audience, and the gaps. No templates, no assumptions. Every engagement begins with understanding what actually needs to exist.",
  },
  {
    number: "02",
    title: "Design",
    body: "Visual and interaction decisions are made deliberately. Each choice traces back to the brand, the user, and the goal. We don't guess at beauty — we reason toward it.",
  },
  {
    number: "03",
    title: "Build",
    body: "Premium execution underneath. We build on proven stacks — Next.js, Supabase, Vercel — optimized for performance, accessibility, and longevity. Nothing ships broken.",
  },
  {
    number: "04",
    title: "Refine",
    body: "The first delivery is the beginning of the relationship. We measure, iterate, and improve. Good work compounds over time.",
  },
];

export default function ApproachPage() {
  return (
    <>
      <Nav />

      <main style={{ background: "var(--color-cream)", paddingTop: "64px" }}>
        {/* Hero — tree illustration placeholder */}
        <section
          aria-label="Philosophy hero"
          style={{
            height: "80svh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-cream)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Tree illustration — SVG placeholder until asset is provided */}
          <svg
            viewBox="0 0 240 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{
              width: "clamp(160px, 20vw, 240px)",
              height: "auto",
              opacity: 0.6,
              marginBottom: "40px",
            }}
          >
            {/* Trunk */}
            <path
              d="M120 300 L120 180"
              stroke="var(--color-taupe)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Main branches */}
            <path
              d="M120 240 Q90 200 60 180"
              stroke="var(--color-taupe)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M120 210 Q150 170 180 155"
              stroke="var(--color-taupe)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M120 190 Q95 150 80 120"
              stroke="var(--color-sage)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M120 185 Q148 145 165 118"
              stroke="var(--color-sage)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Smaller branches */}
            <path
              d="M80 180 Q65 165 50 158"
              stroke="var(--color-sage)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M80 120 Q68 100 62 82"
              stroke="var(--color-terracotta)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M165 118 Q175 98 178 78"
              stroke="var(--color-terracotta)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Leaf clusters — organic circles */}
            <circle cx="50" cy="155" r="16" fill="var(--color-sage)" opacity="0.4" />
            <circle cx="62" cy="78" r="20" fill="var(--color-sage)" opacity="0.5" />
            <circle cx="178" cy="75" r="18" fill="var(--color-sage)" opacity="0.45" />
            <circle cx="180" cy="150" r="14" fill="var(--color-terracotta)" opacity="0.3" />
            <circle cx="96" cy="110" r="12" fill="var(--color-terracotta)" opacity="0.25" />
            <circle cx="148" cy="108" r="10" fill="var(--color-sage)" opacity="0.35" />
          </svg>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 700,
              lineHeight: 1.05,
              color: "var(--color-forest)",
              textAlign: "center",
              margin: "0 24px",
              maxWidth: "640px",
            }}
          >
            Built to last.<br />Made to feel.
          </h1>
        </section>

        {/* Philosophy statement */}
        <section
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "72px 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(24px, 3vw, 40px)",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "var(--color-forest)",
              marginBottom: "24px",
            }}
          >
            We build things that earn trust before anyone says a word.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "18px",
              fontWeight: 400,
              lineHeight: 1.65,
              color: "var(--color-taupe)",
            }}
          >
            OphidianAI is a boutique digital studio. We work with a small number of clients at a
            time so every project gets the attention it deserves. We don&apos;t move fast and break
            things. We move deliberately and build things worth keeping.
          </p>
        </section>

        {/* Process steps */}
        <section
          aria-label="Our process"
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "0 24px 96px",
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }}
        >
          <p
            className="label-caps"
            style={{ marginBottom: "48px", textAlign: "center" }}
          >
            How We Work
          </p>

          {PROCESS_STEPS.map((step, i) => (
            <div
              key={step.number}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "32px",
                padding: "40px 0",
                borderTop: i === 0 ? "1px solid var(--color-border)" : undefined,
                borderBottom: "1px solid var(--color-border)",
              }}
              className="process-step"
            >
              {/* Step icon / number block */}
              <div
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="label-mono" style={{ fontSize: "14px" }}>
                  {step.number}
                </span>
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "20px",
                    fontWeight: 500,
                    lineHeight: 1.35,
                    color: "var(--color-forest)",
                    marginBottom: "8px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: "var(--color-taupe)",
                    maxWidth: "600px",
                    margin: 0,
                  }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <StatementFooter />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .process-step {
            gap: 20px !important;
          }
        }
      `}</style>
    </>
  );
}
