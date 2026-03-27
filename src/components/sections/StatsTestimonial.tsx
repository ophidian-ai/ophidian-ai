export function StatsTestimonial() {
  return (
    <section className="py-40 px-8 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
        {/* Left: Real Stats */}
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-6">
            <span
              className="text-[10px] uppercase tracking-[0.5em] block"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
            >
              Proven Performance
            </span>
            <h2
              className="font-display italic text-5xl md:text-6xl leading-tight"
              style={{ color: "var(--color-on-surface)" }}
            >
              Built to <br />Perform
            </h2>
            <p
              className="font-light leading-relaxed max-w-md italic"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Every site we ship is fast, accessible, and built on a modern stack — no templates, no WordPress, no compromises.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <div style={{ borderLeft: "1px solid rgba(170,208,173,0.2)", paddingLeft: "1.5rem" }}>
              <div className="text-5xl" style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}>95+</div>
              <div
                className="text-[9px] uppercase tracking-widest mt-3"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
              >
                Lighthouse Score
              </div>
            </div>
            <div style={{ borderLeft: "1px solid rgba(170,208,173,0.2)", paddingLeft: "1.5rem" }}>
              <div className="text-5xl" style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}>
                &lt;2<span className="text-2xl">s</span>
              </div>
              <div
                className="text-[9px] uppercase tracking-widest mt-3"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
              >
                Load Time
              </div>
            </div>
          </div>
        </div>

        {/* Right: Credentials */}
        <div className="lg:col-span-7">
          <div className="glass-card p-12 md:p-16 rounded-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl" style={{ background: "rgba(170,208,173,0.1)" }} />
            <div className="relative z-10 space-y-10">
              {/* Meta Tech Provider Badge */}
              <div className="flex flex-col items-center text-center space-y-6">
                <div
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full"
                  style={{ background: "var(--color-secondary-container)", border: "1px solid rgba(196,162,101,0.3)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span
                    className="text-[10px] uppercase tracking-[0.3em] font-semibold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
                  >
                    Meta Tech Provider
                  </span>
                </div>
                <p
                  className="font-display italic text-2xl md:text-3xl leading-snug max-w-lg"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Verified to publish and manage content on Meta platforms on behalf of our clients.
                </p>
                <p
                  className="text-sm leading-relaxed max-w-md"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  OphidianAI is a verified Meta Technology Provider with access to the Content Publishing API and Insights API — a credential most agencies our size don&apos;t have.
                </p>
              </div>

              {/* Tech Stack */}
              <div
                className="flex flex-wrap justify-center gap-3 pt-6"
                style={{ borderTop: "1px solid rgba(170,208,173,0.1)" }}
              >
                {["Next.js", "Vercel", "TypeScript", "Tailwind CSS", "Supabase"].map((tech) => (
                  <span
                    key={tech}
                    className="text-[9px] uppercase tracking-widest px-4 py-2 rounded-full"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-on-surface-variant)",
                      background: "rgba(170,208,173,0.06)",
                      border: "1px solid rgba(170,208,173,0.1)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
